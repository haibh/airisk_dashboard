import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { AssessmentStatus } from '@prisma/client';

/**
 * GET /api/assessments - List risk assessments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') as AssessmentStatus | null;
    const aiSystemId = searchParams.get('aiSystemId') || undefined;
    const frameworkId = searchParams.get('frameworkId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
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
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - ASSESSOR or higher
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.aiSystemId || !body.frameworkId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, aiSystemId, frameworkId' },
        { status: 400 }
      );
    }

    // Verify AI system exists and belongs to organization
    const aiSystem = await prisma.aISystem.findFirst({
      where: {
        id: body.aiSystemId,
        organizationId: session.user.organizationId,
      },
    });

    if (!aiSystem) {
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    // Verify framework exists
    const framework = await prisma.framework.findUnique({
      where: { id: body.frameworkId },
    });

    if (!framework) {
      return NextResponse.json(
        { error: 'Framework not found' },
        { status: 404 }
      );
    }

    // Create assessment
    const assessment = await prisma.riskAssessment.create({
      data: {
        title: body.title,
        description: body.description || null,
        assessmentDate: body.assessmentDate
          ? new Date(body.assessmentDate)
          : new Date(),
        nextReviewDate: body.nextReviewDate
          ? new Date(body.nextReviewDate)
          : null,
        organizationId: session.user.organizationId,
        aiSystemId: body.aiSystemId,
        frameworkId: body.frameworkId,
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

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
