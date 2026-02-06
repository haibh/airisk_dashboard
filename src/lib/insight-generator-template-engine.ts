/**
 * Insight Generator - Template-based Engine
 * Evaluates conditions and generates narrative insights from metrics
 */

import { prisma } from '@/lib/db';
import type { InsightPriority } from '@prisma/client';

export interface InsightCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
}

export interface OrgMetrics {
  totalRisks: number;
  criticalRisks: number;
  openFindings: number;
  complianceScore: number;
  controlCoverage: number;
  overdueTasks: number;
  [key: string]: number;
}

/**
 * Evaluate a single condition against metrics
 */
export function evaluateCondition(
  condition: InsightCondition,
  metrics: Record<string, number>
): boolean {
  const value = metrics[condition.metric];
  if (value === undefined) return false;

  switch (condition.operator) {
    case '>':
      return value > condition.threshold;
    case '<':
      return value < condition.threshold;
    case '>=':
      return value >= condition.threshold;
    case '<=':
      return value <= condition.threshold;
    case '==':
      return value === condition.threshold;
    case '!=':
      return value !== condition.threshold;
    default:
      return false;
  }
}

/**
 * Fill narrative template with variable values
 * Replaces {{variableName}} with actual values
 */
export function fillNarrativeTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

/**
 * Generate insights for an organization based on current metrics
 * Returns array of created GeneratedInsight IDs
 */
export async function generateInsightsForOrg(
  orgId: string,
  metrics: OrgMetrics
): Promise<string[]> {
  // Fetch active templates
  const templates = await prisma.insightTemplate.findMany({
    where: { isActive: true },
    orderBy: { priority: 'asc' }, // CRITICAL first
  });

  const createdInsightIds: string[] = [];

  for (const template of templates) {
    try {
      // Parse condition JSON
      const condition = JSON.parse(template.condition) as InsightCondition;

      // Evaluate condition
      const conditionMet = evaluateCondition(condition, metrics);

      if (conditionMet) {
        // Check if insight already exists (unacknowledged)
        const existingInsight = await prisma.generatedInsight.findFirst({
          where: {
            organizationId: orgId,
            templateId: template.id,
            acknowledgedAt: null,
          },
        });

        if (!existingInsight) {
          // Fill narrative with metric values
          const narrative = fillNarrativeTemplate(template.narrative, metrics);

          // Create new insight
          const insight = await prisma.generatedInsight.create({
            data: {
              organizationId: orgId,
              templateId: template.id,
              title: template.category,
              narrative,
              metricSnapshot: metrics,
              detectedAt: new Date(),
            },
          });

          createdInsightIds.push(insight.id);
        }
      }
    } catch (error) {
      // Skip template with invalid condition JSON
      console.error(`Failed to process template ${template.id}:`, error);
      continue;
    }
  }

  return createdInsightIds;
}
