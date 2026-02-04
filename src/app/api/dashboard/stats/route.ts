import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, notFoundError } from '@/lib/api-error-handler';
import { getFromCache } from '@/lib/cache-advanced';
import { CACHE_KEYS, TTL } from '@/lib/cache-service';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics including total systems, high risks, compliance score, and pending actions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return unauthorizedError();
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user || !user.organizationId) {
      return notFoundError('User or organization');
    }

    const organizationId = user.organizationId;

    // Use advanced caching with stale-while-revalidate
    const stats = await getFromCache(
      CACHE_KEYS.DASHBOARD_STATS(organizationId),
      async () => {
        // Calculate date for last month comparison
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        // Parallelize queries for better performance
        const [
          totalSystems,
          totalSystemsLastMonth,
          highRisks,
          highRisksLastMonth,
          riskControlsAgg,
          riskControlsAggLastMonth,
          pendingActions,
          pendingActionsLastMonth,
        ] = await Promise.all([
          // Get total AI systems count
          prisma.aISystem.count({
            where: { organizationId },
          }),
          prisma.aISystem.count({
            where: {
              organizationId,
              createdAt: { lte: lastMonth },
            },
          }),
          // Get high risks count (inherentScore >= 16)
          prisma.risk.count({
            where: {
              assessment: { organizationId },
              inherentScore: { gte: 16 },
            },
          }),
          prisma.risk.count({
            where: {
              assessment: { organizationId },
              inherentScore: { gte: 16 },
              createdAt: { lte: lastMonth },
            },
          }),
          // Calculate compliance score (average control effectiveness)
          prisma.riskControl.aggregate({
            where: {
              risk: {
                assessment: { organizationId },
              },
            },
            _avg: {
              effectiveness: true,
            },
          }),
          prisma.riskControl.aggregate({
            where: {
              risk: {
                assessment: { organizationId },
              },
              createdAt: { lte: lastMonth },
            },
            _avg: {
              effectiveness: true,
            },
          }),
          // Get pending tasks count
          prisma.task.count({
            where: {
              risk: {
                assessment: { organizationId },
              },
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
          }),
          prisma.task.count({
            where: {
              risk: {
                assessment: { organizationId },
              },
              status: { in: ['PENDING', 'IN_PROGRESS'] },
              createdAt: { lte: lastMonth },
            },
          }),
        ]);

        const complianceScore = riskControlsAgg._avg.effectiveness || 0;
        const complianceScoreLastMonth = riskControlsAggLastMonth._avg.effectiveness || 0;

        // Calculate trends (percentage change)
        const calculateTrend = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        return {
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
        };
      },
      {
        ttl: TTL.DASHBOARD, // 5 minutes
        staleWhileRevalidate: true,
        staleTTL: TTL.DASHBOARD * 3, // Serve stale for 15 minutes while refreshing
      }
    );

    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error, 'fetching dashboard stats');
  }
}
