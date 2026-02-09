import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  validationError,
  notFoundError,
} from '@/lib/api-error-handler';
import {
  uploadFile,
  validateFile,
  calculateSha256,
} from '@/lib/storage-service';
import { scanFile } from '@/lib/file-virus-scanner-service';
import { checkQuota } from '@/lib/organization-storage-quota-service';
import { logger } from '@/lib/logger';
import { writeFileSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';

/**
 * GET /api/evidence/[id]/versions - List version history
 * Requires: VIEWER+ role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires VIEWER+
    if (!hasMinimumRole(session.user.role, 'VIEWER')) {
      return forbiddenError('Only Viewers and above can view evidence versions');
    }

    const { id } = await params;

    // Find evidence record
    const evidence = await prisma.evidence.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!evidence) {
      return notFoundError('Evidence');
    }

    // Get all versions ordered by version number descending
    const versions = await prisma.evidenceVersion.findMany({
      where: { evidenceId: id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: versions,
      total: versions.length,
    });
  } catch (error) {
    return handleApiError(error, 'listing evidence versions');
  }
}

/**
 * POST /api/evidence/[id]/versions - Upload new version
 * Content-Type: multipart/form-data
 * Requires: ASSESSOR+ role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let tempFilePath: string | null = null;

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires ASSESSOR+
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Only Assessors and above can upload evidence versions');
    }

    const { id } = await params;

    // Find existing evidence record
    const evidence = await prisma.evidence.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!evidence) {
      return notFoundError('Evidence');
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string | null;

    if (!file) {
      return validationError('File is required');
    }

    // Validate file
    const fileValidation = validateFile(file.name, file.size, file.type);
    if (!fileValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: fileValidation.error,
        },
        { status: 413 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate hash
    const hashSha256 = calculateSha256(buffer);

    // Check for duplicate hash (same file already uploaded)
    if (hashSha256 === evidence.hashSha256) {
      return NextResponse.json(
        {
          success: false,
          error: 'This file is identical to the current version',
        },
        { status: 409 }
      );
    }

    // Write to temporary file for virus scanning
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    tempFilePath = `/tmp/${randomUUID()}_${sanitizedFilename}`;
    writeFileSync(tempFilePath, buffer);

    // Scan for viruses
    const scanResult = await scanFile(tempFilePath);
    if (!scanResult.clean) {
      return NextResponse.json(
        {
          success: false,
          error: `File contains malware: ${scanResult.threat}`,
        },
        { status: 422 }
      );
    }

    // Check storage quota
    const quotaCheck = await checkQuota(session.user.organizationId, file.size);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Storage quota exceeded',
          remaining: quotaCheck.remaining,
        },
        { status: 413 }
      );
    }

    // Generate storage key for new version
    const timestamp = Date.now();
    const storagePath = `evidence/${session.user.organizationId}/${timestamp}_${sanitizedFilename}`;

    // Upload to S3
    await uploadFile(buffer, storagePath, file.type);

    // Use transaction to update both tables atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create version record from current evidence state
      await tx.evidenceVersion.create({
        data: {
          evidenceId: id,
          versionNumber: evidence.currentVersion || 1,
          filename: evidence.filename,
          originalName: evidence.originalName,
          mimeType: evidence.mimeType,
          fileSize: evidence.fileSize,
          storagePath: evidence.storagePath,
          hashSha256: evidence.hashSha256,
          uploadedById: evidence.uploadedById,
        },
      });

      // Update evidence with new version
      const updatedEvidence = await tx.evidence.update({
        where: { id },
        data: {
          filename: sanitizedFilename,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          storagePath,
          hashSha256,
          description: description || evidence.description,
          currentVersion: (evidence.currentVersion || 1) + 1,
          uploadedById: session.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedEvidence;
    });

    logger.info('Evidence version uploaded successfully', {
      context: 'EvidenceVersionsAPI',
      data: {
        evidenceId: id,
        version: result.currentVersion,
        filename: file.name,
        size: file.size,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'New version uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'uploading evidence version');
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath);
      } catch (err) {
        logger.warn('Failed to delete temp file', {
          context: 'EvidenceVersionsAPI',
          data: { tempFilePath },
        });
      }
    }
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
