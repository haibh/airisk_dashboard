import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import {
  createAISystemSchema,
  aiSystemFilterSchema,
  validateBody,
  formatZodErrors,
} from '@/lib/api-validation-schemas';
import { invalidateOnAISystemChange } from '@/lib/cache-invalidation';
import { emitWebhookEvent } from '@/lib/webhook-event-dispatcher';

/**
 * GET /api/ai-systems - List AI systems with filtering and pagination
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
    const validation = validateBody(aiSystemFilterSchema, params);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { page, pageSize, search, systemType, lifecycleStatus, riskTier } = validation.data;
    const skip = (page - 1) * pageSize;

    // Build where clause with proper typing
    const where: Prisma.AISystemWhereInput = {
      organizationId: session.user.organizationId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (systemType) {
      where.systemType = systemType;
    }

    if (lifecycleStatus) {
      where.lifecycleStatus = lifecycleStatus;
    }

    if (riskTier) {
      where.riskTier = riskTier;
    }

    // Get total count
    const total = await prisma.aISystem.count({ where });

    // Get systems with owner info
    const systems = await prisma.aISystem.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      systems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, 'fetching AI systems');
  }
}

/**
 * POST /api/ai-systems - Create new AI system
 * Requires RISK_MANAGER or ADMIN role
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - only RISK_MANAGER and ADMIN can create systems
    const allowedRoles = ['RISK_MANAGER', 'ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return forbiddenError('Only Risk Managers and Admins can create AI systems');
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(createAISystemSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Create AI system
    const aiSystem = await prisma.aISystem.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        systemType: data.systemType,
        dataClassification: data.dataClassification,
        lifecycleStatus: data.lifecycleStatus,
        riskTier: data.riskTier ?? null,
        purpose: data.purpose ?? null,
        dataInputs: data.dataInputs ?? null,
        dataOutputs: data.dataOutputs ?? null,
        thirdPartyAPIs: data.thirdPartyAPIs,
        baseModels: data.baseModels,
        trainingDataSources: data.trainingDataSources,
        organizationId: session.user.organizationId,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Invalidate caches after creating AI system
    await invalidateOnAISystemChange(session.user.organizationId, aiSystem.id);

    // Emit webhook event
    emitWebhookEvent(session.user.organizationId, 'ai_system.created', {
      id: aiSystem.id,
      name: aiSystem.name,
      systemType: aiSystem.systemType,
    });

    return NextResponse.json(aiSystem, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating AI system');
  }
}
