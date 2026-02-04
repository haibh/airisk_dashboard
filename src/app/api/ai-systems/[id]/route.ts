import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { updateAISystemSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';
import { invalidateOnAISystemChange } from '@/lib/cache-invalidation';
import { emitWebhookEvent } from '@/lib/webhook-event-dispatcher';

/**
 * GET /api/ai-systems/[id] - Get single AI system by ID
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

    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
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

    if (!aiSystem) {
      return notFoundError('AI system');
    }

    return NextResponse.json(aiSystem);
  } catch (error) {
    return handleApiError(error, 'fetching AI system');
  }
}

/**
 * PUT /api/ai-systems/[id] - Update AI system
 * Only owner or ADMIN can update
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

    const { id } = await params;

    // Check if system exists and user has access
    const existingSystem = await prisma.aISystem.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingSystem) {
      return notFoundError('AI system');
    }

    // Check permissions - only owner or ADMIN can update
    const isOwner = existingSystem.ownerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return forbiddenError('Only the owner or Admin can update this AI system');
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(updateAISystemSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Update AI system
    const updatedSystem = await prisma.aISystem.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.systemType !== undefined && { systemType: data.systemType }),
        ...(data.dataClassification !== undefined && { dataClassification: data.dataClassification }),
        ...(data.lifecycleStatus !== undefined && { lifecycleStatus: data.lifecycleStatus }),
        ...(data.riskTier !== undefined && { riskTier: data.riskTier ?? null }),
        ...(data.purpose !== undefined && { purpose: data.purpose ?? null }),
        ...(data.dataInputs !== undefined && { dataInputs: data.dataInputs ?? null }),
        ...(data.dataOutputs !== undefined && { dataOutputs: data.dataOutputs ?? null }),
        ...(data.thirdPartyAPIs !== undefined && { thirdPartyAPIs: data.thirdPartyAPIs }),
        ...(data.baseModels !== undefined && { baseModels: data.baseModels }),
        ...(data.trainingDataSources !== undefined && { trainingDataSources: data.trainingDataSources }),
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

    // Invalidate caches after updating AI system
    await invalidateOnAISystemChange(session.user.organizationId, id);

    // Emit webhook event
    emitWebhookEvent(session.user.organizationId, 'ai_system.updated', {
      id: updatedSystem.id,
      name: updatedSystem.name,
      systemType: updatedSystem.systemType,
    });

    return NextResponse.json(updatedSystem);
  } catch (error) {
    return handleApiError(error, 'updating AI system');
  }
}

/**
 * DELETE /api/ai-systems/[id] - Soft delete AI system
 * Sets lifecycleStatus to RETIRED
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

    const { id } = await params;

    // Check if system exists and user has access
    const existingSystem = await prisma.aISystem.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingSystem) {
      return notFoundError('AI system');
    }

    // Check permissions - only owner or ADMIN can delete
    const isOwner = existingSystem.ownerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return forbiddenError('Only the owner or Admin can delete this AI system');
    }

    // Soft delete by setting status to RETIRED
    await prisma.aISystem.update({
      where: { id },
      data: {
        lifecycleStatus: 'RETIRED',
      },
    });

    // Invalidate caches after deleting AI system
    await invalidateOnAISystemChange(session.user.organizationId, id);

    // Emit webhook event
    emitWebhookEvent(session.user.organizationId, 'ai_system.deleted', {
      id: existingSystem.id,
      name: existingSystem.name,
    });

    return NextResponse.json({ message: 'AI system retired successfully' });
  } catch (error) {
    return handleApiError(error, 'deleting AI system');
  }
}
