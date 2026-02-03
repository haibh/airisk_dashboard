import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(aiSystem);
  } catch (error) {
    console.error('Error fetching AI system:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI system' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    // Check permissions - only owner or ADMIN can update
    const isOwner = existingSystem.ownerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update AI system
    const updatedSystem = await prisma.aISystem.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        systemType: body.systemType,
        dataClassification: body.dataClassification,
        lifecycleStatus: body.lifecycleStatus,
        riskTier: body.riskTier || null,
        purpose: body.purpose || null,
        dataInputs: body.dataInputs || null,
        dataOutputs: body.dataOutputs || null,
        thirdPartyAPIs: body.thirdPartyAPIs || [],
        baseModels: body.baseModels || [],
        trainingDataSources: body.trainingDataSources || [],
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

    return NextResponse.json(updatedSystem);
  } catch (error) {
    console.error('Error updating AI system:', error);
    return NextResponse.json(
      { error: 'Failed to update AI system' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    // Check permissions - only owner or ADMIN can delete
    const isOwner = existingSystem.ownerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Soft delete by setting status to RETIRED
    await prisma.aISystem.update({
      where: { id },
      data: {
        lifecycleStatus: 'RETIRED',
      },
    });

    return NextResponse.json({ message: 'AI system retired successfully' });
  } catch (error) {
    console.error('Error deleting AI system:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI system' },
      { status: 500 }
    );
  }
}
