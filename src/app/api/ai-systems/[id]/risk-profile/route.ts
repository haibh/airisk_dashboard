import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { getRiskLevel } from '@/lib/risk-scoring-calculator';

const RADAR_CATEGORIES = [
  { axis: 'Fairness', category: 'BIAS_FAIRNESS' },
  { axis: 'Privacy', category: 'PRIVACY' },
  { axis: 'Security', category: 'SECURITY' },
  { axis: 'Reliability', category: 'RELIABILITY' },
  { axis: 'Robustness', category: 'SAFETY' },
  { axis: 'Transparency', category: 'TRANSPARENCY' },
];

/**
 * GET /api/ai-systems/[id]/risk-profile
 * Returns 6-axis risk radar profile for an AI system
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

    // Verify system exists and belongs to organization
    const system = await prisma.aISystem.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!system) {
      return NextResponse.json({ error: 'AI System not found' }, { status: 404 });
    }

    // Get all risks for this system across all assessments
    const risks = await prisma.risk.findMany({
      where: {
        assessment: {
          aiSystemId: id,
          organizationId: session.user.organizationId,
        },
      },
      select: {
        id: true,
        category: true,
        residualScore: true,
        inherentScore: true,
      },
    });

    // Calculate scores per axis
    const categoryScores = new Map<string, { total: number; count: number; max: number }>();

    for (const risk of risks) {
      const existing = categoryScores.get(risk.category) || { total: 0, count: 0, max: 0 };
      existing.total += risk.residualScore;
      existing.count += 1;
      existing.max = Math.max(existing.max, risk.residualScore);
      categoryScores.set(risk.category, existing);
    }

    // Build axes array
    const axes = RADAR_CATEGORIES.map(({ axis, category }) => {
      const data = categoryScores.get(category);
      const avgScore = data ? data.total / data.count : 0;

      return {
        axis,
        category,
        score: Math.round(avgScore * 10) / 10,
        riskCount: data?.count || 0,
        maxScore: data?.max || 0,
      };
    });

    // Calculate overall metrics
    const totalRisks = risks.length;
    const overallScore =
      totalRisks > 0
        ? risks.reduce((sum, r) => sum + r.residualScore, 0) / totalRisks
        : 0;
    const overallLevel = getRiskLevel(overallScore);

    return NextResponse.json({
      systemId: system.id,
      systemName: system.name,
      axes,
      overallScore: Math.round(overallScore * 10) / 10,
      overallLevel,
      totalRisks,
    });
  } catch (error) {
    console.error('Error fetching AI system risk profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk profile' },
      { status: 500 }
    );
  }
}
