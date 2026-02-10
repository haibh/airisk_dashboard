import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  calculateInherentScore,
  calculateResidualScore,
  calculateOverallEffectiveness,
  validateRiskParameters,
} from '@/lib/risk-scoring-calculator';

/**
 * GET /api/risks/[id] - Get single risk with controls
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

    const risk = await prisma.risk.findFirst({
      where: {
        id,
        assessment: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        controls: {
          include: {
            control: {
              select: {
                id: true,
                code: true,
                title: true,
                description: true,
              },
            },
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    return NextResponse.json(risk);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch risk' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/risks/[id] - Update risk
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

    // Verify risk exists and belongs to organization
    const existing = await prisma.risk.findFirst({
      where: {
        id,
        assessment: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        controls: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    // Handle basic fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.treatmentStatus !== undefined)
      updateData.treatmentStatus = body.treatmentStatus;
    if (body.treatmentPlan !== undefined)
      updateData.treatmentPlan = body.treatmentPlan;
    if (body.treatmentDueDate !== undefined) {
      updateData.treatmentDueDate = body.treatmentDueDate
        ? new Date(body.treatmentDueDate)
        : null;
    }

    // Recalculate scores if likelihood or impact changed
    const likelihood = body.likelihood ?? existing.likelihood;
    const impact = body.impact ?? existing.impact;

    if (body.likelihood !== undefined || body.impact !== undefined) {
      try {
        validateRiskParameters(likelihood, impact);
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      updateData.likelihood = likelihood;
      updateData.impact = impact;
      updateData.inherentScore = calculateInherentScore(likelihood, impact);
    }

    // Recalculate residual score if needed
    const inherentScore =
      updateData.inherentScore ?? existing.inherentScore;

    // If controlEffectiveness is provided directly, use it
    // Otherwise recalculate from controls
    let controlEffectiveness = existing.controlEffectiveness;

    if (body.controlEffectiveness !== undefined) {
      controlEffectiveness = body.controlEffectiveness;
    } else if (existing.controls.length > 0) {
      // Recalculate from controls
      const effectivenessValues = existing.controls.map((c: { effectiveness: number }) => c.effectiveness);
      controlEffectiveness = calculateOverallEffectiveness(effectivenessValues);
    }

    updateData.controlEffectiveness = controlEffectiveness;
    updateData.residualScore = calculateResidualScore(
      inherentScore,
      controlEffectiveness
    );

    const risk = await prisma.risk.update({
      where: { id },
      data: updateData,
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

    // Record score history if scores changed
    const scoresChanged =
      updateData.inherentScore !== undefined ||
      updateData.residualScore !== undefined ||
      updateData.controlEffectiveness !== undefined;

    if (scoresChanged) {
      // Determine history source based on what triggered the change
      let source: 'MANUAL' | 'AUTO_RECALC' | 'CONTROL_CHANGE' = 'AUTO_RECALC';
      if (body.controlEffectiveness !== undefined) {
        source = 'MANUAL';
      } else if (body.likelihood !== undefined || body.impact !== undefined) {
        source = 'MANUAL';
      }

      await prisma.riskScoreHistory.create({
        data: {
          riskId: risk.id,
          inherentScore: risk.inherentScore,
          residualScore: risk.residualScore,
          targetScore: risk.targetScore ?? null,
          controlEffectiveness: risk.controlEffectiveness,
          source,
          notes: body.historyNotes ?? null,
        },
      });
    }

    return NextResponse.json(risk);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update risk' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/risks/[id] - Delete risk
 * Requires ASSESSOR+ role
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

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify risk exists and belongs to organization
    const existing = await prisma.risk.findFirst({
      where: {
        id,
        assessment: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    await prisma.risk.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    );
  }
}
