/**
 * Cache Warming on Startup
 *
 * Pre-warms frequently accessed data into cache during application startup.
 * Improves initial response times for common queries.
 */

import { warmCache } from './cache-advanced';
import { CACHE_KEYS } from './cache-service';
import { prisma } from './db';
import { logger } from './logger';
import { Control } from '@prisma/client';

// Type for control with children
interface ControlWithChildren extends Control {
  children: ControlWithChildren[];
}

/**
 * Warm framework-related caches
 * Pre-loads all active frameworks and their control trees
 */
async function warmFrameworkCaches(): Promise<Map<string, () => Promise<unknown>>> {
  const entries = new Map<string, () => Promise<unknown>>();

  try {
    // Warm framework list
    entries.set(CACHE_KEYS.FRAMEWORK_LIST, async () => {
      return await prisma.framework.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { controls: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    // Get list of active frameworks to warm their control trees
    const frameworks = await prisma.framework.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    // Warm control trees for each framework
    for (const framework of frameworks) {
      entries.set(CACHE_KEYS.CONTROL_TREE(framework.id), async () => {
        const controls = await prisma.control.findMany({
          where: { frameworkId: framework.id },
          orderBy: { sortOrder: 'asc' },
        });

        const rootControls = controls.filter((c) => !c.parentId);

        const buildTree = (parentId: string): ControlWithChildren[] => {
          return controls
            .filter((c) => c.parentId === parentId)
            .map((control) => ({
              ...control,
              children: buildTree(control.id),
            }));
        };

        const tree: ControlWithChildren[] = rootControls.map((control) => ({
          ...control,
          children: buildTree(control.id),
        }));

        return tree;
      });
    }

    logger.info(`Prepared ${entries.size} framework cache entries for warming`);
  } catch (error) {
    logger.error('Failed to prepare framework cache entries:', error);
  }

  return entries;
}

/**
 * Warm dashboard caches for active organizations
 * Pre-loads dashboard stats for organizations with recent activity
 */
async function warmDashboardCaches(): Promise<Map<string, () => Promise<unknown>>> {
  const entries = new Map<string, () => Promise<unknown>>();

  try {
    // Get organizations with recent activity (created/updated in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeOrgs = await prisma.organization.findMany({
      where: {
        OR: [
          { createdAt: { gte: thirtyDaysAgo } },
          { updatedAt: { gte: thirtyDaysAgo } },
        ],
      },
      select: { id: true },
      take: 20, // Limit to 20 most active organizations
    });

    // Warm dashboard stats for active organizations
    for (const org of activeOrgs) {
      entries.set(CACHE_KEYS.DASHBOARD_STATS(org.id), async () => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

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
          prisma.aISystem.count({
            where: { organizationId: org.id },
          }),
          prisma.aISystem.count({
            where: {
              organizationId: org.id,
              createdAt: { lte: lastMonth },
            },
          }),
          prisma.risk.count({
            where: {
              assessment: { organizationId: org.id },
              inherentScore: { gte: 16 },
            },
          }),
          prisma.risk.count({
            where: {
              assessment: { organizationId: org.id },
              inherentScore: { gte: 16 },
              createdAt: { lte: lastMonth },
            },
          }),
          prisma.riskControl.aggregate({
            where: {
              risk: {
                assessment: { organizationId: org.id },
              },
            },
            _avg: {
              effectiveness: true,
            },
          }),
          prisma.riskControl.aggregate({
            where: {
              risk: {
                assessment: { organizationId: org.id },
              },
              createdAt: { lte: lastMonth },
            },
            _avg: {
              effectiveness: true,
            },
          }),
          prisma.task.count({
            where: {
              risk: {
                assessment: { organizationId: org.id },
              },
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
          }),
          prisma.task.count({
            where: {
              risk: {
                assessment: { organizationId: org.id },
              },
              status: { in: ['PENDING', 'IN_PROGRESS'] },
              createdAt: { lte: lastMonth },
            },
          }),
        ]);

        const complianceScore = riskControlsAgg._avg.effectiveness || 0;
        const complianceScoreLastMonth = riskControlsAggLastMonth._avg.effectiveness || 0;

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
      });
    }

    logger.info(`Prepared ${entries.size} dashboard cache entries for warming`);
  } catch (error) {
    logger.error('Failed to prepare dashboard cache entries:', error);
  }

  return entries;
}

/**
 * Main cache warming function
 * Called during application startup to pre-populate caches
 */
export async function warmCachesOnStartup(): Promise<void> {
  try {
    logger.info('Starting cache warming process...');

    // Collect all cache entries to warm
    const [frameworkEntries, dashboardEntries] = await Promise.all([
      warmFrameworkCaches(),
      warmDashboardCaches(),
    ]);

    // Combine all entries
    const allEntries = new Map([...frameworkEntries, ...dashboardEntries]);

    // Warm all caches
    await warmCache(allEntries);

    logger.info('Cache warming completed successfully');
  } catch (error) {
    // Don't fail app startup if cache warming fails
    logger.error('Cache warming failed (non-fatal):', error);
  }
}

/**
 * Warm caches for a specific organization
 * Useful when onboarding new organizations
 */
export async function warmCachesForOrganization(orgId: string): Promise<void> {
  try {
    logger.info(`Warming caches for organization: ${orgId}`);

    const entries = new Map<string, () => Promise<unknown>>();

    // Warm dashboard stats
    entries.set(CACHE_KEYS.DASHBOARD_STATS(orgId), async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

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
        prisma.aISystem.count({ where: { organizationId: orgId } }),
        prisma.aISystem.count({
          where: { organizationId: orgId, createdAt: { lte: lastMonth } },
        }),
        prisma.risk.count({
          where: { assessment: { organizationId: orgId }, inherentScore: { gte: 16 } },
        }),
        prisma.risk.count({
          where: {
            assessment: { organizationId: orgId },
            inherentScore: { gte: 16 },
            createdAt: { lte: lastMonth },
          },
        }),
        prisma.riskControl.aggregate({
          where: { risk: { assessment: { organizationId: orgId } } },
          _avg: { effectiveness: true },
        }),
        prisma.riskControl.aggregate({
          where: {
            risk: { assessment: { organizationId: orgId } },
            createdAt: { lte: lastMonth },
          },
          _avg: { effectiveness: true },
        }),
        prisma.task.count({
          where: {
            risk: { assessment: { organizationId: orgId } },
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
        }),
        prisma.task.count({
          where: {
            risk: { assessment: { organizationId: orgId } },
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            createdAt: { lte: lastMonth },
          },
        }),
      ]);

      const complianceScore = riskControlsAgg._avg.effectiveness || 0;
      const complianceScoreLastMonth = riskControlsAggLastMonth._avg.effectiveness || 0;

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
    });

    await warmCache(entries);

    logger.info(`Cache warming completed for organization: ${orgId}`);
  } catch (error) {
    logger.error(`Failed to warm caches for organization ${orgId}:`, error);
  }
}
