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
import { logger } from '@/lib/logger';

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
 * POST /api/evidence - Upload new evidence
 * Content-Type: multipart/form-data
 * Requires: ASSESSOR+ role
 */
export async function POST(request: NextRequest) {
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
    const file = formData.get('file') as File;
    const description = formData.get('description') as string | null;
    const entityType = formData.get('entityType') as string | null;
    const entityId = formData.get('entityId') as string | null;
    const validUntil = formData.get('validUntil') as string | null;

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

    // Validate entityType if provided
    if (entityType && !['AI_SYSTEM', 'ASSESSMENT', 'RISK', 'CONTROL'].includes(entityType)) {
      return validationError('Invalid entityType. Must be AI_SYSTEM, ASSESSMENT, RISK, or CONTROL');
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
      return NextResponse.json(
        {
          success: false,
          error: 'This file has already been uploaded',
          existingId: existingEvidence.id,
        },
        { status: 409 }
      );
    }

    // Generate storage key
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
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

    logger.info('Evidence uploaded successfully', {
      context: 'EvidenceAPI',
      data: { evidenceId: evidence.id, filename: file.name, size: file.size },
    });

    return NextResponse.json(
      {
        success: true,
        data: evidence,
        message: 'Evidence uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'uploading evidence');
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
