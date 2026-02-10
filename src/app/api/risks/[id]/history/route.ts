import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { calculateRiskVelocity } from '@/lib/risk-scoring-calculator';

/**
 * GET /api/risks/[id]/history
 * Returns risk score history for trajectory visualization
 * Query params: startDate, endDate, limit
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
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Verify risk exists and belongs to organization
    const risk = await prisma.risk.findFirst({
      where: {
        id,
        assessment: {
          organizationId: session.user.organizationId,
        },
      },
      select: {
        id: true,
        title: true,
        inherentScore: true,
        residualScore: true,
        targetScore: true,
        controlEffectiveness: true,
      },
    });

    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    // Build date filters
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const history = await prisma.riskScoreHistory.findMany({
      where: {
        riskId: id,
        ...(Object.keys(dateFilter).length > 0 && { recordedAt: dateFilter }),
      },
      orderBy: { recordedAt: 'asc' },
      take: limit,
    });

    // Map to expected format
    const historyRecords = history.map((h) => ({
      id: h.id,
      riskId: h.riskId,
      inherentScore: h.inherentScore,
      residualScore: h.residualScore,
      targetScore: h.targetScore,
      controlEffectiveness: h.controlEffectiveness,
      source: h.source,
      notes: h.notes,
      recordedAt: h.recordedAt.toISOString(),
      createdAt: h.createdAt.toISOString(),
    }));

    const velocity = calculateRiskVelocity(historyRecords);

    return NextResponse.json({
      riskId: risk.id,
      riskTitle: risk.title,
      currentScores: {
        inherent: risk.inherentScore,
        residual: risk.residualScore,
        target: risk.targetScore,
        controlEffectiveness: risk.controlEffectiveness,
      },
      history: historyRecords,
      velocity,
      total: historyRecords.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch risk history' },
      { status: 500 }
    );
  }
}
