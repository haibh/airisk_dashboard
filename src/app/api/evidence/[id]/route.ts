import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError, notFoundError } from '@/lib/api-error-handler';
import { updateEvidenceSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';
import { deleteFile } from '@/lib/storage-service';
import { logger } from '@/lib/logger';

/**
 * GET /api/evidence/[id] - Get evidence details
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
      return forbiddenError();
    }

    const { id } = await params;

    const evidence = await prisma.evidence.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        links: {
          include: {
            aiSystem: { select: { id: true, name: true } },
            assessment: { select: { id: true, title: true } },
            risk: { select: { id: true, title: true, category: true } },
            control: { select: { id: true, title: true, code: true } },
          },
        },
      },
    });

    if (!evidence) {
      return notFoundError('Evidence');
    }

    return NextResponse.json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    return handleApiError(error, 'fetching evidence details');
  }
}

/**
 * PUT /api/evidence/[id] - Update evidence metadata
 * Requires: ASSESSOR+ role (only owner or admin can update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires ASSESSOR+
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Only Assessors and above can update evidence');
    }

    const { id } = await params;

    // Find evidence
    const evidence = await prisma.evidence.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!evidence) {
      return notFoundError('Evidence');
    }

    // Check ownership - only owner or admin can update
    const isOwner = evidence.uploadedById === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return forbiddenError('Only the uploader or admin can update this evidence');
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(updateEvidenceSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Update evidence
    const updatedEvidence = await prisma.evidence.update({
      where: { id },
      data: {
        description: data.description !== undefined ? data.description : undefined,
        validUntil: data.validUntil !== undefined ? (data.validUntil ? new Date(data.validUntil) : null) : undefined,
      },
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
    });

    logger.info('Evidence updated successfully', {
      context: 'EvidenceAPI',
      data: { evidenceId: id, updatedBy: session.user.id },
    });

    return NextResponse.json({
      success: true,
      data: updatedEvidence,
      message: 'Evidence updated successfully',
    });
  } catch (error) {
    return handleApiError(error, 'updating evidence');
  }
}

/**
 * DELETE /api/evidence/[id] - Delete evidence
 * Soft delete: keep record, remove file from storage
 * Requires: RISK_MANAGER+ role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires RISK_MANAGER+
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError('Only Risk Managers and above can delete evidence');
    }

    const { id } = await params;

    // Find evidence
    const evidence = await prisma.evidence.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!evidence) {
      return notFoundError('Evidence');
    }

    // Delete file from storage
    const deletionSuccess = await deleteFile(evidence.storagePath);
    if (!deletionSuccess) {
      logger.warn('Failed to delete file from storage, continuing with DB deletion', {
        context: 'EvidenceAPI',
        data: { evidenceId: id, storagePath: evidence.storagePath },
      });
    }

    // Delete evidence record from database (cascade will handle links)
    await prisma.evidence.delete({
      where: { id },
    });

    logger.info('Evidence deleted successfully', {
      context: 'EvidenceAPI',
      data: { evidenceId: id, deletedBy: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Evidence deleted successfully',
    });
  } catch (error) {
    return handleApiError(error, 'deleting evidence');
  }
}
