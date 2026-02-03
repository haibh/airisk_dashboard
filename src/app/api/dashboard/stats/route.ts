import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics including total systems, high risks, compliance score, and pending actions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: 'User or organization not found' },
        { status: 404 }
      );
    }

    const organizationId = user.organizationId;

    // Calculate date for last month comparison
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Get total AI systems count
    const totalSystems = await prisma.aISystem.count({
      where: { organizationId },
    });

    const totalSystemsLastMonth = await prisma.aISystem.count({
      where: {
        organizationId,
        createdAt: { lte: lastMonth },
      },
    });

    // Get high risks count (inherentScore >= 16)
    const highRisks = await prisma.risk.count({
      where: {
        assessment: { organizationId },
        inherentScore: { gte: 16 },
      },
    });

    const highRisksLastMonth = await prisma.risk.count({
      where: {
        assessment: { organizationId },
        inherentScore: { gte: 16 },
        createdAt: { lte: lastMonth },
      },
    });

    // Calculate compliance score (average control effectiveness)
    const riskControlsAgg = await prisma.riskControl.aggregate({
      where: {
        risk: {
          assessment: { organizationId },
        },
      },
      _avg: {
        effectiveness: true,
      },
    });

    const complianceScore = riskControlsAgg._avg.effectiveness || 0;

    // Get compliance score from last month
    const riskControlsAggLastMonth = await prisma.riskControl.aggregate({
      where: {
        risk: {
          assessment: { organizationId },
        },
        createdAt: { lte: lastMonth },
      },
      _avg: {
        effectiveness: true,
      },
    });

    const complianceScoreLastMonth = riskControlsAggLastMonth._avg.effectiveness || 0;

    // Get pending tasks count
    const pendingActions = await prisma.task.count({
      where: {
        risk: {
          assessment: { organizationId },
        },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    const pendingActionsLastMonth = await prisma.task.count({
      where: {
        risk: {
          assessment: { organizationId },
        },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        createdAt: { lte: lastMonth },
      },
    });

    // Calculate trends (percentage change)
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return NextResponse.json({
      totalSystems,
      highRisks,
      complianceScore: Math.round(complianceScore),
      pendingActions,
      trends: {
        totalSystems: calculateTrend(totalSystems, totalSystemsLastMonth),
        highRisks: calculateTrend(highRisks, highRisksLastMonth),
        complianceScore: calculateTrend(complianceScore, complianceScoreLastMonth),
        pendingActions: calculateTrend(pendingActions, pendingActionsLastMonth),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
