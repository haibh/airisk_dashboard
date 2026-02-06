/**
 * Insight Template Seed Data
 * Creates AI-generated insight templates for data storytelling
 */

import { PrismaClient, InsightPriority } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds insight templates for automated narrative generation
 * Creates 6 templates covering different analytical scenarios
 */
export async function seedInsightTemplates() {
  console.log('💡 Seeding insight templates...');

  const templates = await prisma.insightTemplate.createMany({
    data: [
      {
        category: 'risk-spike',
        condition:
          'residualScore increased by >20% in last 30 days AND likelihood >= 4',
        narrative:
          'Critical risk escalation detected: {{riskTitle}} has increased from {{previousScore}} to {{currentScore}} ({{percentChange}}% increase) over the past {{days}} days. Primary driver: {{likelihood}} likelihood rating due to {{triggerEvent}}. Immediate action recommended to prevent {{potentialImpact}}.',
        priority: 'CRITICAL' as InsightPriority,
        isActive: true,
      },
      {
        category: 'compliance-drop',
        condition:
          'frameworkComplianceScore decreased by >10% in last 14 days',
        narrative:
          'Compliance trend alert: {{frameworkName}} score declined from {{previousScore}}% to {{currentScore}}% ({{gap}}% gap). {{failedControlCount}} controls moved to non-compliant status. Key gaps: {{topGaps}}. Estimated remediation effort: {{effortDays}} days.',
        priority: 'HIGH' as InsightPriority,
        isActive: true,
      },
      {
        category: 'control-gap',
        condition:
          'controlCoverage < 70% AND riskCategory in [SECURITY, PRIVACY]',
        narrative:
          'Control coverage gap identified: {{riskCategory}} risks have only {{coveragePercent}}% control implementation. {{uncoveredRiskCount}} risks remain partially mitigated. Recommended controls: {{suggestedControls}}. Implementing these could reduce residual risk by {{reductionPercent}}%.',
        priority: 'HIGH' as InsightPriority,
        isActive: true,
      },
      {
        category: 'assessment-overdue',
        condition:
          'nextReviewDate < NOW() AND assessmentStatus != ARCHIVED',
        narrative:
          'Assessment renewal required: {{assessmentTitle}} for {{aiSystemName}} is {{daysOverdue}} days overdue (last reviewed {{lastReviewDate}}). Regulatory frameworks {{applicableFrameworks}} mandate annual reviews. Risk exposure may have changed since last assessment.',
        priority: 'MEDIUM' as InsightPriority,
        isActive: true,
      },
      {
        category: 'vendor-risk-increase',
        condition:
          'vendorRiskScore increased by >15% OR tier1VendorCount > 10',
        narrative:
          'Supply chain risk alert: {{vendorName}} (Tier {{tier}}) risk score increased to {{newScore}} from {{oldScore}}. This impacts {{downstreamSystemCount}} AI systems. Risk propagates through {{dependencyChain}}. Consider vendor diversification or enhanced monitoring.',
        priority: 'MEDIUM' as InsightPriority,
        isActive: true,
      },
      {
        category: 'anomaly-detected',
        condition:
          'deviationStdDev > 2.5 AND severity in [HIGH, CRITICAL]',
        narrative:
          'Statistical anomaly detected: {{metricType}} deviated {{stdDevCount}} standard deviations from baseline (expected: {{expectedValue}}, actual: {{actualValue}}). This pattern appeared {{occurrenceCount}} times in the last {{timeWindow}}. Potential root causes: {{hypotheses}}. Investigate {{relatedEntities}}.',
        priority: 'LOW' as InsightPriority,
        isActive: true,
      },
    ],
  });

  console.log(`✓ Seeded ${templates.count} insight templates`);
  console.log('  - CRITICAL: risk-spike');
  console.log('  - HIGH: compliance-drop, control-gap');
  console.log('  - MEDIUM: assessment-overdue, vendor-risk-increase');
  console.log('  - LOW: anomaly-detected');

  return templates;
}

/**
 * Standalone execution (for testing)
 */
if (require.main === module) {
  seedInsightTemplates()
    .then(() => {
      console.log('✓ Insight template seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Insight template seeding failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
