/**
 * Regulatory impact calculator
 * Calculates organizational impact of regulatory changes based on affected controls
 */

import { prisma } from '@/lib/db';

export interface ImpactResult {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  actionRequired: boolean;
  dueDate: Date | null;
  affectedControlCount: number;
  criticalControlCount: number;
  score: number;
}

/**
 * Calculate impact of a regulatory change on an organization
 * Scores based on number and criticality of affected controls
 */
export async function calculateRegulatoryImpact(
  changeId: string,
  organizationId: string
): Promise<ImpactResult> {
  // Get affected frameworks and their controls
  const frameworkChanges = await prisma.frameworkChange.findMany({
    where: { changeId },
    include: {
      framework: {
        select: { id: true, name: true },
      },
    },
  });

  let affectedControlCount = 0;
  let criticalControlCount = 0;

  for (const fc of frameworkChanges) {
    if (!fc.affectedControls || fc.affectedControls.length === 0) {
      continue;
    }

    const controls = await prisma.control.findMany({
      where: {
        frameworkId: fc.frameworkId,
        id: { in: fc.affectedControls },
      },
      select: { priority: true },
    });

    affectedControlCount += controls.length;
    criticalControlCount += controls.filter(c => c.priority === 'CRITICAL').length;
  }

  // Calculate impact score: critical controls weighted 3x
  const score = affectedControlCount * 1 + criticalControlCount * 3;

  let level: 'HIGH' | 'MEDIUM' | 'LOW';
  let actionRequired = false;
  let dueDate: Date | null = null;

  if (score >= 10) {
    level = 'HIGH';
    actionRequired = true;
    dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  } else if (score >= 5) {
    level = 'MEDIUM';
    actionRequired = true;
    dueDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  } else {
    level = 'LOW';
    actionRequired = false;
  }

  return {
    level,
    actionRequired,
    dueDate,
    affectedControlCount,
    criticalControlCount,
    score,
  };
}

/**
 * Get all affected controls for a regulatory change
 */
export async function getAffectedControls(changeId: string) {
  const frameworkChanges = await prisma.frameworkChange.findMany({
    where: { changeId },
    include: {
      framework: {
        select: { id: true, name: true, shortName: true },
      },
    },
  });

  const controlsByFramework = await Promise.all(
    frameworkChanges.map(async fc => {
      if (!fc.affectedControls || fc.affectedControls.length === 0) {
        return {
          framework: fc.framework,
          controls: [],
        };
      }

      const controls = await prisma.control.findMany({
        where: {
          frameworkId: fc.frameworkId,
          id: { in: fc.affectedControls },
        },
        select: {
          id: true,
          code: true,
          title: true,
          priority: true,
        },
      });

      return {
        framework: fc.framework,
        controls,
      };
    })
  );

  return controlsByFramework;
}
