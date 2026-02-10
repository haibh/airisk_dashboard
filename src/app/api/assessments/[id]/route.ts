import { NextRequest, NextResponse } from 'next/server';
import { Prisma, AssessmentStatus } from '@prisma/client';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { updateAssessmentSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';
import { invalidateOnAssessmentChange } from '@/lib/cache-invalidation';
import { emitWebhookEvent } from '@/lib/webhook-event-dispatcher';
import { createNotification } from '@/lib/notification-service';

/**
 * GET /api/assessments/[id] - Get single assessment with details
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

    const { id } = await params;

    const assessment = await prisma.riskAssessment.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        aiSystem: {
          select: {
            id: true,
            name: true,
            systemType: true,
          },
        },
        framework: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        risks: {
          include: {
            controls: {
              include: {
                control: {
                  select: {
                    id: true,
                    code: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { residualScore: 'desc' },
        },
      },
    });

    if (!assessment) {
      return notFoundError('Assessment');
    }

    return NextResponse.json(assessment);
  } catch (error) {
    return handleApiError(error, 'fetching assessment');
  }
}

/**
 * PUT /api/assessments/[id] - Update assessment
 * Requires ASSESSOR+ role
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

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Assessor role or higher required');
    }

    const { id } = await params;

    // Verify assessment exists and belongs to organization
    const existing = await prisma.riskAssessment.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return notFoundError('Assessment');
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(updateAssessmentSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Build update data with proper typing
    const updateData: Prisma.RiskAssessmentUpdateInput = {};
    const statusChanged = data.status !== undefined && data.status !== existing.status;

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set completedAt when approved
      if (data.status === 'APPROVED' && !existing.completedAt) {
        updateData.completedAt = new Date();
      }
    }
    if (data.nextReviewDate !== undefined) {
      updateData.nextReviewDate = data.nextReviewDate ? new Date(data.nextReviewDate) : null;
    }

    const assessment = await prisma.riskAssessment.update({
      where: { id },
      data: updateData,
      include: {
        aiSystem: {
          select: {
            id: true,
            name: true,
            systemType: true,
          },
        },
        framework: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Invalidate caches after updating assessment
    await invalidateOnAssessmentChange(session.user.organizationId, id);

    // Emit webhook events
    emitWebhookEvent(session.user.organizationId, 'assessment.updated', {
      id: assessment.id,
      title: assessment.title,
      status: assessment.status,
    });

    if (statusChanged) {
      emitWebhookEvent(session.user.organizationId, 'assessment.status_changed', {
        id: assessment.id,
        title: assessment.title,
        oldStatus: existing.status,
        newStatus: assessment.status,
      });

      // Create notification for assessment creator
      createNotification({
        userId: existing.createdById,
        orgId: session.user.organizationId,
        type: 'ASSESSMENT_STATUS',
        title: 'Assessment Status Changed',
        body: `Assessment "${assessment.title}" status changed from ${existing.status} to ${assessment.status}`,
        link: `/${session.user.organizationId}/risk-assessment/${assessment.id}`,
      }).catch(() => { /* notification failure non-critical */ });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    return handleApiError(error, 'updating assessment');
  }
}

/**
 * DELETE /api/assessments/[id] - Archive assessment
 * Requires RISK_MANAGER+ role
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

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError('Risk Manager role or higher required');
    }

    const { id } = await params;

    // Verify assessment exists and belongs to organization
    const existing = await prisma.riskAssessment.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return notFoundError('Assessment');
    }

    // Archive instead of delete
    await prisma.riskAssessment.update({
      where: { id },
      data: { status: AssessmentStatus.ARCHIVED },
    });

    // Invalidate caches after archiving assessment
    await invalidateOnAssessmentChange(session.user.organizationId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'archiving assessment');
  }
}
