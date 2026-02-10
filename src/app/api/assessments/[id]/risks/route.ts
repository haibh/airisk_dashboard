import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  calculateInherentScore,
  calculateResidualScore,
  validateRiskParameters,
} from '@/lib/risk-scoring-calculator';

/**
 * GET /api/assessments/[id]/risks - List risks for assessment
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

    // Verify assessment belongs to organization
    const assessment = await prisma.riskAssessment.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const risks = await prisma.risk.findMany({
      where: { assessmentId: id },
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
    });

    return NextResponse.json(risks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments/[id]/risks - Add risk to assessment
 * Requires ASSESSOR+ role
 */
export async function POST(
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

    // Verify assessment belongs to organization
    const assessment = await prisma.riskAssessment.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category' },
        { status: 400 }
      );
    }

    const likelihood = body.likelihood || 3;
    const impact = body.impact || 3;

    // Validate risk parameters
    try {
      validateRiskParameters(likelihood, impact);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate scores
    const inherentScore = calculateInherentScore(likelihood, impact);
    const controlEffectiveness = body.controlEffectiveness || 0;
    const residualScore = calculateResidualScore(
      inherentScore,
      controlEffectiveness
    );

    // Create risk with optional target score
    const targetScore = body.targetScore ?? null;

    const risk = await prisma.risk.create({
      data: {
        title: body.title,
        description: body.description || null,
        category: body.category,
        likelihood,
        impact,
        inherentScore,
        controlEffectiveness,
        residualScore,
        targetScore,
        treatmentStatus: body.treatmentStatus || 'PENDING',
        treatmentPlan: body.treatmentPlan || null,
        treatmentDueDate: body.treatmentDueDate
          ? new Date(body.treatmentDueDate)
          : null,
        assessmentId: id,
      },
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
    });

    // Create initial history record for trajectory tracking
    await prisma.riskScoreHistory.create({
      data: {
        riskId: risk.id,
        inherentScore: risk.inherentScore,
        residualScore: risk.residualScore,
        targetScore: risk.targetScore,
        controlEffectiveness: risk.controlEffectiveness,
        source: 'INITIAL',
        notes: 'Initial risk assessment',
      },
    });

    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    );
  }
}
