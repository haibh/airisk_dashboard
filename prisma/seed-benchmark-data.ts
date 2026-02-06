/**
 * Benchmark Data Seed
 * Creates simulated industry benchmark snapshots for comparative analytics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds benchmark snapshots across industries, org sizes, and metric types
 * Creates realistic distributions for percentile calculations
 */
export async function seedBenchmarkData() {
  console.log('📊 Seeding benchmark data...');

  const industries = ['technology', 'healthcare', 'finance'];
  const orgSizes = ['small', 'medium', 'large'];
  const metricTypes = ['risk-score', 'compliance-score', 'control-coverage'];

  // Base values for realistic distributions
  const baseValues = {
    'risk-score': {
      technology: { small: 12.5, medium: 10.8, large: 8.2 },
      healthcare: { small: 14.2, medium: 12.5, large: 9.8 },
      finance: { small: 11.0, medium: 9.5, large: 7.5 },
    },
    'compliance-score': {
      technology: { small: 72.5, medium: 78.2, large: 85.5 },
      healthcare: { small: 68.0, medium: 75.5, large: 82.8 },
      finance: { small: 75.8, medium: 82.0, large: 88.5 },
    },
    'control-coverage': {
      technology: { small: 65.0, medium: 72.5, large: 80.0 },
      healthcare: { small: 62.5, medium: 70.0, large: 78.5 },
      finance: { small: 68.5, medium: 75.5, large: 83.0 },
    },
  };

  const snapshots: Array<{
    organizationHash: string;
    industry: string;
    orgSize: string;
    metricType: string;
    value: number;
    snapshotDate: Date;
  }> = [];

  const snapshotDate = new Date();

  // Generate 30 samples per combination (industry × orgSize × metricType)
  // Total: 3 industries × 3 sizes × 3 metrics × 30 samples = 810 snapshots
  industries.forEach((industry) => {
    orgSizes.forEach((orgSize) => {
      metricTypes.forEach((metricType) => {
        const baseValue =
          baseValues[metricType as keyof typeof baseValues][
            industry as keyof (typeof baseValues)['risk-score']
          ][orgSize as keyof (typeof baseValues)['risk-score']['technology']];

        // Generate 30 samples with normal distribution around base value
        for (let i = 0; i < 30; i++) {
          // Use Box-Muller transform for normal distribution
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

          // Standard deviation varies by metric type
          const stdDev = metricType === 'risk-score' ? 2.5 : 5.0;
          let value = baseValue + z0 * stdDev;

          // Clamp values to realistic ranges
          if (metricType === 'risk-score') {
            value = Math.max(1, Math.min(25, value)); // 1-25 scale
          } else {
            value = Math.max(0, Math.min(100, value)); // 0-100%
          }

          snapshots.push({
            organizationHash: `hash-${industry}-${orgSize}-${i}`,
            industry,
            orgSize,
            metricType,
            value: Math.round(value * 10) / 10, // Round to 1 decimal
            snapshotDate,
          });
        }
      });
    });
  });

  await prisma.benchmarkSnapshot.createMany({
    data: snapshots,
  });

  console.log(`✓ Seeded ${snapshots.length} benchmark snapshots`);
  console.log(`  - Industries: ${industries.join(', ')}`);
  console.log(`  - Org sizes: ${orgSizes.join(', ')}`);
  console.log(`  - Metric types: ${metricTypes.join(', ')}`);
  console.log(`  - Samples per combination: 30`);

  // Generate summary statistics
  const sampleStats = industries.map((industry) => {
    const industrySamples = snapshots.filter((s) => s.industry === industry);
    const avgRisk =
      industrySamples
        .filter((s) => s.metricType === 'risk-score')
        .reduce((sum, s) => sum + s.value, 0) /
      industrySamples.filter((s) => s.metricType === 'risk-score').length;
    const avgCompliance =
      industrySamples
        .filter((s) => s.metricType === 'compliance-score')
        .reduce((sum, s) => sum + s.value, 0) /
      industrySamples.filter((s) => s.metricType === 'compliance-score').length;

    return {
      industry,
      avgRisk: avgRisk.toFixed(1),
      avgCompliance: avgCompliance.toFixed(1),
    };
  });

  console.log('\n  Summary statistics:');
  sampleStats.forEach((stat) => {
    console.log(
      `    ${stat.industry}: avg risk ${stat.avgRisk}, avg compliance ${stat.avgCompliance}%`
    );
  });

  return {
    totalSnapshots: snapshots.length,
    industries: industries.length,
    combinations: industries.length * orgSizes.length * metricTypes.length,
  };
}

/**
 * Standalone execution (for testing)
 */
if (require.main === module) {
  seedBenchmarkData()
    .then(() => {
      console.log('✓ Benchmark data seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Benchmark data seeding failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
