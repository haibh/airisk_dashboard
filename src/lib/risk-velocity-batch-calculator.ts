import { prisma } from '@/lib/db';
import type { RiskVelocity } from '@/types/risk-history';

interface VelocityResult {
  riskId: string;
  velocity: RiskVelocity;
}

/**
 * Calculate velocity for multiple risks in batch
 * @param riskIds - Array of risk IDs
 * @param periodDays - Number of days to look back (default 30)
 * @returns Map of riskId → velocity
 */
export async function calculateBatchVelocity(
  riskIds: string[],
  periodDays: number = 30
): Promise<Map<string, RiskVelocity>> {
  if (riskIds.length === 0) {
    return new Map();
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Fetch all history records for the given risks
  const historyRecords = await prisma.riskScoreHistory.findMany({
    where: {
      riskId: { in: riskIds },
      recordedAt: { gte: startDate },
    },
    select: {
      riskId: true,
      residualScore: true,
      inherentScore: true,
      recordedAt: true,
    },
    orderBy: { recordedAt: 'asc' },
  });

  // Group by riskId
  const historyByRisk = new Map<string, typeof historyRecords>();
  for (const record of historyRecords) {
    const existing = historyByRisk.get(record.riskId) || [];
    existing.push(record);
    historyByRisk.set(record.riskId, existing);
  }

  // Calculate velocity for each risk
  const results = new Map<string, RiskVelocity>();

  for (const riskId of riskIds) {
    const history = historyByRisk.get(riskId) || [];

    if (history.length < 2) {
      results.set(riskId, {
        inherentChange: 0,
        residualChange: 0,
        trend: 'stable',
        periodDays: 0,
      });
      continue;
    }

    const oldest = history[0];
    const newest = history[history.length - 1];

    const daysDiff = Math.max(
      1,
      (new Date(newest.recordedAt).getTime() - new Date(oldest.recordedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const inherentChange = (newest.inherentScore - oldest.inherentScore) / daysDiff;
    const residualChange = (newest.residualScore - oldest.residualScore) / daysDiff;

    const threshold = 0.1;
    let trend: RiskVelocity['trend'] = 'stable';

    if (residualChange < -threshold) {
      trend = 'improving';
    } else if (residualChange > threshold) {
      trend = 'worsening';
    }

    results.set(riskId, {
      inherentChange: Math.round(inherentChange * 100) / 100,
      residualChange: Math.round(residualChange * 100) / 100,
      trend,
      periodDays: Math.round(daysDiff),
    });
  }

  return results;
}

/**
 * Get velocity for a single risk
 */
export async function calculateSingleVelocity(
  riskId: string,
  periodDays: number = 30
): Promise<RiskVelocity> {
  const results = await calculateBatchVelocity([riskId], periodDays);
  return results.get(riskId) || {
    inherentChange: 0,
    residualChange: 0,
    trend: 'stable',
    periodDays: 0,
  };
}
