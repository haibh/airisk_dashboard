import { NextRequest, NextResponse } from 'next/server';
import { Prisma, EntityType } from '@prisma/client';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import {
  evidenceFilterSchema,
  validateBody,
  formatZodErrors,
} from '@/lib/api-validation-schemas';
import { uploadFile, validateFile, calculateSha256, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/lib/storage-service';
import { scanFile } from '@/lib/file-virus-scanner-service';
import { checkQuota } from '@/lib/organization-storage-quota-service';
import { logger } from '@/lib/logger';
import { writeFileSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';

/**
 * GET /api/evidence - List evidence with pagination and filtering
 * Requires: ASSESSOR+ role
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires ASSESSOR+
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Only Assessors and above can list evidence');
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validation = validateBody(evidenceFilterSchema, params);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { page, pageSize, status, entityType, startDate, endDate } = validation.data;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.EvidenceWhereInput = {
      organizationId: session.user.organizationId,
    };

    if (status) {
      where.reviewStatus = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Filter by entity type if specified
    if (entityType) {
      where.links = {
        some: {
          entityType: entityType as EntityType,
        },
      };
    }

    // Get total count
    const total = await prisma.evidence.count({ where });

    // Get evidence with uploader and links
    const evidence = await prisma.evidence.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        links: {
          include: {
            aiSystem: { select: { id: true, name: true } },
            assessment: { select: { id: true, title: true } },
            risk: { select: { id: true, title: true } },
            control: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      data: evidence,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, 'listing evidence');
  }
}

/**
 * POST /api/evidence - Upload new evidence (single or bulk)
 * Content-Type: multipart/form-data
 * Requires: ASSESSOR+ role
 */
export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires ASSESSOR+
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Only Assessors and above can upload evidence');
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const description = formData.get('description') as string | null;
    const entityType = formData.get('entityType') as string | null;
    const entityId = formData.get('entityId') as string | null;
    const validUntil = formData.get('validUntil') as string | null;

    // Support both single file and bulk upload
    const filesToUpload = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (filesToUpload.length === 0) {
      return validationError('At least one file is required');
    }

    // Limit bulk upload to 20 files per request to prevent resource exhaustion
    const MAX_FILES_PER_REQUEST = 20;
    if (filesToUpload.length > MAX_FILES_PER_REQUEST) {
      return validationError(`Maximum ${MAX_FILES_PER_REQUEST} files per upload request`);
    }

    // Process each file
    const results = [];
    for (const file of filesToUpload) {
      // Validate file
      const fileValidation = validateFile(file.name, file.size, file.type);
      if (!fileValidation.valid) {
        results.push({
          filename: file.name,
          success: false,
          error: fileValidation.error,
        });
        continue;
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Calculate hash
      const hashSha256 = calculateSha256(buffer);

      // Check for duplicate hash
      const existingEvidence = await prisma.evidence.findFirst({
        where: {
          hashSha256,
          organizationId: session.user.organizationId,
        },
      });

      if (existingEvidence) {
        results.push({
          filename: file.name,
          success: false,
          error: 'This file has already been uploaded',
          existingId: existingEvidence.id,
        });
        continue;
      }

      // Write to temporary file for virus scanning
      const sanitizedFilename = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.{2,}/g, '.'); // Collapse consecutive dots to prevent path traversal
      const tempFilePath = `/tmp/${randomUUID()}_${sanitizedFilename}`;
      writeFileSync(tempFilePath, buffer);
      tempFiles.push(tempFilePath);

      // Scan for viruses
      const scanResult = await scanFile(tempFilePath);
      if (!scanResult.clean) {
        results.push({
          filename: file.name,
          success: false,
          error: `File contains malware: ${scanResult.threat}`,
        });
        continue;
      }

      // Check storage quota
      const quotaCheck = await checkQuota(session.user.organizationId, file.size);
      if (!quotaCheck.allowed) {
        results.push({
          filename: file.name,
          success: false,
          error: 'Storage quota exceeded',
          remaining: quotaCheck.remaining,
        });
        continue;
      }

      // Generate storage key
      const timestamp = Date.now();
      const storagePath = `evidence/${session.user.organizationId}/${timestamp}_${sanitizedFilename}`;

      // Upload to S3
      await uploadFile(buffer, storagePath, file.type);

      // Create evidence record in database
      const evidence = await prisma.evidence.create({
        data: {
          filename: sanitizedFilename,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          storagePath,
          hashSha256,
          description,
          reviewStatus: 'SUBMITTED',
          validUntil: validUntil ? new Date(validUntil) : null,
          organizationId: session.user.organizationId,
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

      // Create evidence link if entityType and entityId provided
      if (entityType && entityId) {
        // Validate entityType
        if (!['AI_SYSTEM', 'ASSESSMENT', 'RISK', 'CONTROL'].includes(entityType)) {
          logger.warn('Invalid entityType skipped', {
            context: 'EvidenceAPI',
            data: { entityType },
          });
        } else {
          const linkData: any = {
            evidenceId: evidence.id,
            entityType: entityType as EntityType,
          };

          // Set the appropriate foreign key based on entityType
          switch (entityType) {
            case 'AI_SYSTEM':
              linkData.aiSystemId = entityId;
              break;
            case 'ASSESSMENT':
              linkData.assessmentId = entityId;
              break;
            case 'RISK':
              linkData.riskId = entityId;
              break;
            case 'CONTROL':
              linkData.controlId = entityId;
              break;
          }

          await prisma.evidenceLink.create({ data: linkData });
        }
      }

      logger.info('Evidence uploaded successfully', {
        context: 'EvidenceAPI',
        data: { evidenceId: evidence.id, filename: file.name, size: file.size },
      });

      results.push({
        filename: file.name,
        success: true,
        data: evidence,
      });
    }

    // Return single result for single file, array for bulk
    if (filesToUpload.length === 1) {
      const result = results[0];
      if (result.success) {
        return NextResponse.json(
          {
            success: true,
            data: result.data,
            message: 'Evidence uploaded successfully',
          },
          { status: 201 }
        );
      } else {
        // Determine status code based on error type
        let statusCode = 409; // Default: conflict (duplicate)
        const errorLower = result.error?.toLowerCase() || '';
        if (errorLower.includes('quota') || errorLower.includes('exceeds') || errorLower.includes('too large')) {
          statusCode = 413; // Payload too large
        } else if (errorLower.includes('malware')) {
          statusCode = 422; // Unprocessable entity
        }

        return NextResponse.json(
          {
            success: false,
            error: result.error,
            existingId: (result as any).existingId,
            remaining: (result as any).remaining,
          },
          { status: statusCode }
        );
      }
    }

    // Bulk upload response
    return NextResponse.json(
      {
        success: true,
        data: results,
        message: `Uploaded ${results.filter(r => r.success).length} of ${results.length} files`,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'uploading evidence');
  } finally {
    // Clean up temp files
    for (const tempFile of tempFiles) {
      try {
        unlinkSync(tempFile);
      } catch (err) {
        logger.warn('Failed to delete temp file', {
          context: 'EvidenceAPI',
          data: { tempFile },
        });
      }
    }
  }
}

// Export config for Next.js API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configure body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
