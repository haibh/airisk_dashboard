import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError, notFoundError } from '@/lib/api-error-handler';
import {
  createAssessmentSchema,
  assessmentFilterSchema,
  validateBody,
  formatZodErrors,
} from '@/lib/api-validation-schemas';
import { invalidateOnAssessmentChange } from '@/lib/cache-invalidation';
import { emitWebhookEvent } from '@/lib/webhook-event-dispatcher';

/**
 * GET /api/assessments - List risk assessments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validation = validateBody(assessmentFilterSchema, params);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { page, pageSize, search, status, aiSystemId, frameworkId } = validation.data;
    const skip = (page - 1) * pageSize;

    // Build where clause with proper typing
    const where: Prisma.RiskAssessmentWhereInput = {
      organizationId: session.user.organizationId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (aiSystemId) {
      where.aiSystemId = aiSystemId;
    }

    if (frameworkId) {
      where.frameworkId = frameworkId;
    }

    // Get total count
    const total = await prisma.riskAssessment.count({ where });

    // Get assessments with relations
    const assessments = await prisma.riskAssessment.findMany({
      where,
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
        _count: {
          select: { risks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      assessments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, 'fetching assessments');
  }
}

/**
 * POST /api/assessments - Create new risk assessment
 * Requires ASSESSOR+ role
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - ASSESSOR or higher
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Assessor role or higher required');
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(createAssessmentSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Verify AI system exists and belongs to organization
    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id: data.aiSystemId,
        organizationId: session.user.organizationId,
      },
    });

    if (!aiSystem) {
      return notFoundError('AI system');
    }

    // Verify framework exists
    const framework = await prisma.framework.findUnique({
      where: { id: data.frameworkId },
    });

    if (!framework) {
      return notFoundError('Framework');
    }

    // Create assessment
    const assessment = await prisma.riskAssessment.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        assessmentDate: data.assessmentDate ? new Date(data.assessmentDate) : new Date(),
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        organizationId: session.user.organizationId,
        aiSystemId: data.aiSystemId,
        frameworkId: data.frameworkId,
        createdById: session.user.id,
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
      },
    });

    // Invalidate caches after creating assessment
    await invalidateOnAssessmentChange(session.user.organizationId, assessment.id);

    // Emit webhook event
    emitWebhookEvent(session.user.organizationId, 'assessment.created', {
      id: assessment.id,
      title: assessment.title,
      status: assessment.status,
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating assessment');
  }
}
