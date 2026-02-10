import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { calculateBatchVelocity } from '@/lib/risk-velocity-batch-calculator';

/**
 * GET /api/dashboard/risk-heatmap/cell
 * Returns risks at specific likelihood/impact intersection for heatmap drill-down
 * Query params: likelihood, impact, includeVelocity
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const likelihood = parseInt(searchParams.get('likelihood') || '0', 10);
    const impact = parseInt(searchParams.get('impact') || '0', 10);
    const includeVelocity = searchParams.get('includeVelocity') === 'true';

    if (likelihood < 1 || likelihood > 5 || impact < 1 || impact > 5) {
      return NextResponse.json(
        { error: 'Likelihood and impact must be between 1 and 5' },
        { status: 400 }
      );
    }

    const risks = await prisma.risk.findMany({
      where: {
        likelihood,
        impact,
        assessment: {
          organizationId: session.user.organizationId,
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        residualScore: true,
        treatmentStatus: true,
        assessment: {
          select: {
            title: true,
            aiSystem: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { residualScore: 'desc' },
      take: 50,
    });

    // Calculate velocity if requested
    let velocityMap = new Map();
    if (includeVelocity && risks.length > 0) {
      const riskIds = risks.map((r) => r.id);
      velocityMap = await calculateBatchVelocity(riskIds);
    }

    const formattedRisks = risks.map((risk) => ({
      id: risk.id,
      title: risk.title,
      category: risk.category,
      residualScore: risk.residualScore,
      treatmentStatus: risk.treatmentStatus,
      assessmentTitle: risk.assessment.title,
      aiSystemName: risk.assessment.aiSystem.name,
      velocity: includeVelocity ? velocityMap.get(risk.id) : undefined,
    }));

    return NextResponse.json({
      likelihood,
      impact,
      count: risks.length,
      risks: formattedRisks,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch heatmap cell risks' },
      { status: 500 }
    );
  }
}
