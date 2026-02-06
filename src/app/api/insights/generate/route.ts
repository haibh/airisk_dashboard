/**
 * POST /api/insights/generate
 * Triggers insight generation from current dashboard metrics
 * Requires RISK_MANAGER or higher
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { generateInsightsForOrg, type OrgMetrics } from '@/lib/insight-generator-template-engine';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const orgId = session.user.organizationId;

    // Fetch current metrics for the organization
    const [
      totalRisks,
      criticalRisks,
      openFindings,
      totalControls,
      overdueTasks,
    ] = await Promise.all([
      prisma.risk.count({
        where: {
          assessment: { organizationId: orgId },
        }
      }),
      prisma.risk.count({
        where: {
          assessment: { organizationId: orgId },
          residualScore: { gte: 16 }, // CRITICAL level
        }
      }),
      prisma.risk.count({
        where: {
          assessment: { organizationId: orgId },
          treatmentStatus: { in: ['PENDING', 'ACCEPTED', 'MITIGATING'] },
        }
      }),
      prisma.control.count(),
      // Placeholder for overdue tasks (would need task tracking model)
      Promise.resolve(0),
    ]);

    const implementedControls = totalControls; // Simplified - would need control implementation tracking

    // Calculate metrics
    const metrics: OrgMetrics = {
      totalRisks,
      criticalRisks,
      openFindings,
      complianceScore: totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0,
      controlCoverage: totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0,
      overdueTasks,
    };

    // Generate insights
    const createdInsightIds = await generateInsightsForOrg(orgId, metrics);

    return NextResponse.json({
      success: true,
      metricsEvaluated: metrics,
      insightsGenerated: createdInsightIds.length,
      insightIds: createdInsightIds,
    });
  } catch (error) {
    return handleApiError(error, 'generating insights');
  }
}
