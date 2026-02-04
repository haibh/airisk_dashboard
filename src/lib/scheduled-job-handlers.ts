/**
 * Scheduled Job Handlers
 *
 * Implementation of job handlers for automated report generation:
 * - Compliance Report: Framework compliance summaries
 * - Risk Register: Active risks grouped by severity
 * - Activity Log: Recent audit trail exports
 * - Gap Analysis: Control implementation gaps
 */

import { JobType, RiskCategory } from '@prisma/client';
import { prisma } from './db';
import { logger } from './logger';
import {
  registerJobHandler,
  type JobConfig,
  type JobResult,
} from './scheduled-job-runner';

// ============================================================================
// COMPLIANCE REPORT HANDLER
// ============================================================================

async function executeComplianceReport(
  config: JobConfig,
  orgId: string
): Promise<JobResult> {
  const startTime = Date.now();

  try {
    const { frameworkIds } = config;

    // Get frameworks with assessments
    const frameworks = await prisma.framework.findMany({
      where: {
        isActive: true,
        ...(frameworkIds?.length ? { id: { in: frameworkIds } } : {}),
      },
      include: {
        riskAssessments: {
          where: { organizationId: orgId },
          include: {
            risks: {
              include: {
                controls: {
                  include: {
                    control: true,
                  },
                },
              },
            },
          },
        },
        controls: true,
      },
    });

    // Calculate compliance metrics per framework
    const complianceData = frameworks.map((framework) => {
      const totalControls = framework.controls.length;
      const assessments = framework.riskAssessments;
      const totalAssessments = assessments.length;

      // Calculate risk distribution
      const risksBySeverity = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
      };

      assessments.forEach((assessment) => {
        assessment.risks.forEach((risk) => {
          const score = risk.residualScore;
          if (score <= 4) risksBySeverity.LOW++;
          else if (score <= 9) risksBySeverity.MEDIUM++;
          else if (score <= 15) risksBySeverity.HIGH++;
          else risksBySeverity.CRITICAL++;
        });
      });

      // Calculate control coverage
      const implementedControls = new Set<string>();
      assessments.forEach((assessment) => {
        assessment.risks.forEach((risk) => {
          risk.controls.forEach((rc) => {
            if (rc.effectiveness > 0) {
              implementedControls.add(rc.controlId);
            }
          });
        });
      });

      const controlCoverage =
        totalControls > 0
          ? Math.round((implementedControls.size / totalControls) * 100)
          : 0;

      return {
        frameworkId: framework.id,
        frameworkName: framework.name,
        shortName: framework.shortName,
        version: framework.version,
        totalControls,
        implementedControls: implementedControls.size,
        controlCoverage,
        totalAssessments,
        risksBySeverity,
        generatedAt: new Date().toISOString(),
      };
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: {
        organizationId: orgId,
        reportType: 'compliance',
        frameworks: complianceData,
        summary: {
          totalFrameworks: frameworks.length,
          totalAssessments: complianceData.reduce(
            (sum, f) => sum + f.totalAssessments,
            0
          ),
        },
      },
      duration,
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Compliance report generation failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      executedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// RISK REGISTER HANDLER
// ============================================================================

async function executeRiskRegister(
  config: JobConfig,
  orgId: string
): Promise<JobResult> {
  const startTime = Date.now();

  try {
    const { riskCategories, severityLevels } = config;

    // Build filter conditions
    const categoryFilter = riskCategories?.length
      ? { category: { in: riskCategories as RiskCategory[] } }
      : {};

    // Get all active risks for organization
    const risks = await prisma.risk.findMany({
      where: {
        assessment: { organizationId: orgId },
        ...categoryFilter,
      },
      include: {
        assessment: {
          include: {
            aiSystem: {
              select: {
                id: true,
                name: true,
                systemType: true,
              },
            },
            framework: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        },
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
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: { residualScore: 'desc' },
    });

    // Classify risks by severity
    const classifyRisk = (score: number): string => {
      if (score <= 4) return 'LOW';
      if (score <= 9) return 'MEDIUM';
      if (score <= 15) return 'HIGH';
      return 'CRITICAL';
    };

    // Filter by severity if specified
    let filteredRisks = risks;
    if (severityLevels?.length) {
      filteredRisks = risks.filter((risk) =>
        severityLevels.includes(classifyRisk(risk.residualScore))
      );
    }

    // Group risks by category and severity
    const risksByCategory = filteredRisks.reduce(
      (acc, risk) => {
        const category = risk.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: risk.id,
          title: risk.title,
          description: risk.description,
          category: risk.category,
          likelihood: risk.likelihood,
          impact: risk.impact,
          inherentScore: risk.inherentScore,
          residualScore: risk.residualScore,
          severity: classifyRisk(risk.residualScore),
          treatmentStatus: risk.treatmentStatus,
          treatmentDueDate: risk.treatmentDueDate,
          aiSystem: risk.assessment.aiSystem,
          framework: risk.assessment.framework,
          controlsApplied: risk.controls.length,
          pendingTasks: risk.tasks.filter((task) => task.status !== 'COMPLETED').length,
        });
        return acc;
      },
      {} as Record<string, unknown[]>
    );

    const risksBySeverity = filteredRisks.reduce(
      (acc, risk) => {
        const severity = classifyRisk(risk.residualScore);
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: {
        organizationId: orgId,
        reportType: 'risk-register',
        totalRisks: filteredRisks.length,
        risksByCategory,
        risksBySeverity,
        summary: {
          highestRisk: filteredRisks[0]
            ? {
                id: filteredRisks[0].id,
                title: filteredRisks[0].title,
                score: filteredRisks[0].residualScore,
              }
            : null,
          risksTreated: filteredRisks.filter(
            (r) => r.treatmentStatus === 'COMPLETED'
          ).length,
          risksOverdue: filteredRisks.filter(
            (r) =>
              r.treatmentDueDate && new Date(r.treatmentDueDate) < new Date()
          ).length,
        },
        generatedAt: new Date().toISOString(),
      },
      duration,
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Risk register generation failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      executedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// ACTIVITY LOG HANDLER
// ============================================================================

async function executeActivityLog(
  config: JobConfig,
  orgId: string
): Promise<JobResult> {
  const startTime = Date.now();

  try {
    const { startDate, endDate } = config;

    // Build date filter
    const dateFilter: {
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.lte = new Date(endDate);
      }
    } else {
      // Default to last 30 days
      dateFilter.createdAt = {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    }

    // Get audit logs
    const logs = await prisma.auditLog.findMany({
      where: {
        organizationId: orgId,
        ...dateFilter,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit to recent 1000 entries
    });

    // Group by action type
    const logsByAction = logs.reduce(
      (acc, log) => {
        if (!acc[log.action]) {
          acc[log.action] = [];
        }
        acc[log.action].push({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          user: log.user,
          timestamp: log.createdAt,
        });
        return acc;
      },
      {} as Record<string, unknown[]>
    );

    // Group by entity type
    const logsByEntity = logs.reduce(
      (acc, log) => {
        if (!acc[log.entityType]) {
          acc[log.entityType] = 0;
        }
        acc[log.entityType]++;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get most active users
    const userActivity = logs.reduce(
      (acc, log) => {
        const userId = log.userId;
        if (!acc[userId]) {
          acc[userId] = {
            user: log.user,
            activityCount: 0,
          };
        }
        acc[userId].activityCount++;
        return acc;
      },
      {} as Record<string, { user: unknown; activityCount: number }>
    );

    const topUsers = Object.values(userActivity)
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: {
        organizationId: orgId,
        reportType: 'activity-log',
        period: {
          startDate: dateFilter.createdAt?.gte?.toISOString(),
          endDate: dateFilter.createdAt?.lte?.toISOString() || new Date().toISOString(),
        },
        totalLogs: logs.length,
        logsByAction,
        logsByEntity,
        topUsers,
        generatedAt: new Date().toISOString(),
      },
      duration,
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Activity log generation failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      executedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// GAP ANALYSIS HANDLER
// ============================================================================

async function executeGapAnalysis(
  config: JobConfig,
  orgId: string
): Promise<JobResult> {
  const startTime = Date.now();

  try {
    const { frameworkIds } = config;

    // Get frameworks with controls
    const frameworks = await prisma.framework.findMany({
      where: {
        isActive: true,
        ...(frameworkIds?.length ? { id: { in: frameworkIds } } : {}),
      },
      include: {
        controls: {
          include: {
            riskControls: {
              include: {
                risk: {
                  include: {
                    assessment: {
                      select: {
                        id: true,
                        status: true,
                        organizationId: true,
                      },
                    },
                  },
                },
              },
              where: {
                risk: {
                  assessment: {
                    organizationId: orgId,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Analyze control implementation gaps
    const gapAnalysis = frameworks.map((framework) => {
      const controls = framework.controls;
      const totalControls = controls.length;

      const implementedControls = controls.filter(
        (control) => control.riskControls.length > 0
      );

      const partiallyImplemented = controls.filter((control) => {
        const avgEffectiveness =
          control.riskControls.reduce((sum: number, rc) => sum + rc.effectiveness, 0) /
          (control.riskControls.length || 1);
        return avgEffectiveness > 0 && avgEffectiveness < 70;
      });

      const fullyImplemented = controls.filter((control) => {
        const avgEffectiveness =
          control.riskControls.reduce((sum: number, rc) => sum + rc.effectiveness, 0) /
          (control.riskControls.length || 1);
        return avgEffectiveness >= 70;
      });

      const notImplemented = controls.filter(
        (control) => control.riskControls.length === 0
      );

      const gaps = notImplemented.map((control) => ({
        controlId: control.id,
        code: control.code,
        title: control.title,
        description: control.description,
        priority: control.parentId ? 'MEDIUM' : 'HIGH', // Top-level controls are high priority
      }));

      return {
        frameworkId: framework.id,
        frameworkName: framework.name,
        shortName: framework.shortName,
        totalControls,
        implementedCount: implementedControls.length,
        fullyImplementedCount: fullyImplemented.length,
        partiallyImplementedCount: partiallyImplemented.length,
        notImplementedCount: notImplemented.length,
        implementationRate: Math.round(
          (implementedControls.length / totalControls) * 100
        ),
        gaps: gaps.slice(0, 20), // Top 20 gaps
      };
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: {
        organizationId: orgId,
        reportType: 'gap-analysis',
        frameworks: gapAnalysis,
        summary: {
          totalFrameworks: frameworks.length,
          totalGaps: gapAnalysis.reduce((sum, f) => sum + f.notImplementedCount, 0),
          avgImplementationRate:
            gapAnalysis.reduce((sum, f) => sum + f.implementationRate, 0) /
            gapAnalysis.length,
        },
        generatedAt: new Date().toISOString(),
      },
      duration,
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Gap analysis generation failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      executedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// HANDLER REGISTRATION
// ============================================================================

/**
 * Register all job handlers on module load
 */
export function initializeJobHandlers(): void {
  registerJobHandler({
    type: JobType.COMPLIANCE_REPORT,
    execute: executeComplianceReport,
  });

  registerJobHandler({
    type: JobType.RISK_REGISTER,
    execute: executeRiskRegister,
  });

  registerJobHandler({
    type: JobType.ACTIVITY_LOG,
    execute: executeActivityLog,
  });

  registerJobHandler({
    type: JobType.GAP_ANALYSIS,
    execute: executeGapAnalysis,
  });

  logger.info('All job handlers initialized');
}

// Auto-initialize handlers on module load
initializeJobHandlers();
