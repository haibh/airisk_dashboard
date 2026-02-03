import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { AssessmentStatus } from '@prisma/client';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
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
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Set completedAt when approved
      if (body.status === 'APPROVED' && !existing.completedAt) {
        updateData.completedAt = new Date();
      }
    }
    if (body.nextReviewDate !== undefined) {
      updateData.nextReviewDate = body.nextReviewDate
        ? new Date(body.nextReviewDate)
        : null;
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

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
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
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Archive instead of delete
    await prisma.riskAssessment.update({
      where: { id },
      data: { status: AssessmentStatus.ARCHIVED },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving assessment:', error);
    return NextResponse.json(
      { error: 'Failed to archive assessment' },
      { status: 500 }
    );
  }
}
