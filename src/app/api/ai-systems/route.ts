import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { AISystemType, DataClassification, LifecycleStatus, RiskTier } from '@prisma/client';

/**
 * GET /api/ai-systems - List AI systems with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const systemType = searchParams.get('systemType') as AISystemType | null;
    const lifecycleStatus = searchParams.get('lifecycleStatus') as LifecycleStatus | null;
    const riskTier = searchParams.get('riskTier') as RiskTier | null;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
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
    console.error('Error fetching AI systems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI systems' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - only RISK_MANAGER and ADMIN can create systems
    const allowedRoles = ['RISK_MANAGER', 'ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.systemType || !body.dataClassification) {
      return NextResponse.json(
        { error: 'Missing required fields: name, systemType, dataClassification' },
        { status: 400 }
      );
    }

    // Create AI system
    const aiSystem = await prisma.aISystem.create({
      data: {
        name: body.name,
        description: body.description || null,
        systemType: body.systemType,
        dataClassification: body.dataClassification,
        lifecycleStatus: body.lifecycleStatus || 'DEVELOPMENT',
        riskTier: body.riskTier || null,
        purpose: body.purpose || null,
        dataInputs: body.dataInputs || null,
        dataOutputs: body.dataOutputs || null,
        thirdPartyAPIs: body.thirdPartyAPIs || [],
        baseModels: body.baseModels || [],
        trainingDataSources: body.trainingDataSources || [],
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

    return NextResponse.json(aiSystem, { status: 201 });
  } catch (error) {
    console.error('Error creating AI system:', error);
    return NextResponse.json(
      { error: 'Failed to create AI system' },
      { status: 500 }
    );
  }
}
