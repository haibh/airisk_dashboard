import { NextRequest, NextResponse } from 'next/server';
import { EvidenceStatus } from '@prisma/client';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError, notFoundError } from '@/lib/api-error-handler';
import { approveEvidenceSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';
import { logger } from '@/lib/logger';

/**
 * POST /api/evidence/[id]/approve - Approve or reject evidence
 * Requires: RISK_MANAGER+ role
 * Status flow: SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
 */
export async function POST(
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
      return forbiddenError('Only Risk Managers and above can approve/reject evidence');
    }

    const { id } = await params;

    // Find evidence
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
          },
        },
      },
    });

    if (!evidence) {
      return notFoundError('Evidence');
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(approveEvidenceSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { action, reason } = validation.data;
    const reviewNotes = (validation.data as any).reviewNotes;

    // Determine new status based on action
    let newStatus: EvidenceStatus;
    if (action === 'APPROVE') {
      newStatus = 'APPROVED';
    } else {
      newStatus = 'REJECTED';
    }

    // Validate status transition
    const validTransitions: Record<EvidenceStatus, EvidenceStatus[]> = {
      SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['EXPIRED'],
      REJECTED: ['UNDER_REVIEW'],
      EXPIRED: ['UNDER_REVIEW'],
    };

    const currentStatus = evidence.reviewStatus;
    const allowedStatuses = validTransitions[currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
      return validationError(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedStatuses.join(', ')}`
      );
    }

    // Update evidence status
    const updatedEvidence = await prisma.evidence.update({
      where: { id },
      data: {
        reviewStatus: newStatus,
        reviewedById: session.user.id,
        reviewNotes: reviewNotes || null,
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `EVIDENCE_${action}`,
        entityType: 'Evidence',
        entityId: id,
        oldValues: { reviewStatus: currentStatus },
        newValues: { reviewStatus: newStatus, reason },
        organizationId: session.user.organizationId,
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    logger.info(`Evidence ${action.toLowerCase()}d successfully`, {
      context: 'EvidenceAPI',
      data: {
        evidenceId: id,
        action,
        reviewedBy: session.user.id,
        oldStatus: currentStatus,
        newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEvidence,
      message: `Evidence ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    return handleApiError(error, 'approving/rejecting evidence');
  }
}
