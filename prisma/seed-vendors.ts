/**
 * Vendor Hierarchy Seed Data
 * Creates multi-tier vendor dependencies with risk propagation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds vendor hierarchy for a given organization
 * Tier 1: Direct vendors (OpenAI, AWS, Anthropic)
 * Tier 2: Sub-suppliers (Azure Cloud under OpenAI, Hugging Face under AWS)
 * Tier 3: Infrastructure providers (NVIDIA under Azure)
 */
export async function seedVendors(organizationId: string) {
  console.log('🏭 Seeding vendor hierarchy...');

  // Tier 1 vendors (direct)
  const openai = await prisma.vendor.create({
    data: {
      organizationId,
      name: 'OpenAI',
      tier: 1,
      riskScore: 12.5,
      category: 'ai-service',
      contactEmail: 'enterprise@openai.com',
      website: 'https://openai.com',
    },
  });

  const aws = await prisma.vendor.create({
    data: {
      organizationId,
      name: 'Amazon Web Services',
      tier: 1,
      riskScore: 6.0,
      category: 'infrastructure',
      contactEmail: 'support@aws.amazon.com',
      website: 'https://aws.amazon.com',
    },
  });

  const anthropic = await prisma.vendor.create({
    data: {
      organizationId,
      name: 'Anthropic',
      tier: 1,
      riskScore: 10.0,
      category: 'ai-service',
      contactEmail: 'enterprise@anthropic.com',
      website: 'https://anthropic.com',
    },
  });

  // Tier 2 vendors (sub-suppliers)
  const azure = await prisma.vendor.create({
    data: {
      organizationId,
      name: 'Microsoft Azure Cloud',
      tier: 2,
      riskScore: 8.0,
      category: 'infrastructure',
      contactEmail: 'azure-support@microsoft.com',
      website: 'https://azure.microsoft.com',
      parentVendorId: openai.id,
    },
  });

  const huggingFace = await prisma.vendor.create({
    data: {
      organizationId,
      name: 'Hugging Face',
      tier: 2,
      riskScore: 9.5,
      category: 'ai-service',
      contactEmail: 'enterprise@huggingface.co',
      website: 'https://huggingface.co',
      parentVendorId: aws.id,
    },
  });

  // Tier 3 vendor (deep infrastructure)
  const nvidia = await prisma.vendor.create({
    data: {
      organizationId,
      name: 'NVIDIA Corporation',
      tier: 3,
      riskScore: 5.0,
      category: 'infrastructure',
      contactEmail: 'enterprise@nvidia.com',
      website: 'https://nvidia.com',
      parentVendorId: azure.id,
    },
  });

  // Create risk paths for risk propagation visualization
  await prisma.vendorRiskPath.createMany({
    data: [
      {
        vendorId: openai.id,
        path: [openai.id],
        aggregatedRisk: 12.5,
      },
      {
        vendorId: azure.id,
        path: [openai.id, azure.id],
        aggregatedRisk: (12.5 + 8.0) / 2,
      },
      {
        vendorId: nvidia.id,
        path: [openai.id, azure.id, nvidia.id],
        aggregatedRisk: (12.5 + 8.0 + 5.0) / 3,
      },
      {
        vendorId: aws.id,
        path: [aws.id],
        aggregatedRisk: 6.0,
      },
      {
        vendorId: huggingFace.id,
        path: [aws.id, huggingFace.id],
        aggregatedRisk: (6.0 + 9.5) / 2,
      },
      {
        vendorId: anthropic.id,
        path: [anthropic.id],
        aggregatedRisk: 10.0,
      },
    ],
  });

  console.log('✓ Seeded 6 vendors across 3 tiers with risk paths');
  console.log(`  - Tier 1: ${[openai.name, aws.name, anthropic.name].join(', ')}`);
  console.log(`  - Tier 2: ${[azure.name, huggingFace.name].join(', ')}`);
  console.log(`  - Tier 3: ${nvidia.name}`);

  return {
    vendors: [openai, aws, anthropic, azure, huggingFace, nvidia],
    paths: 6,
  };
}

/**
 * Standalone execution (for testing)
 */
if (require.main === module) {
  const testOrgId = process.env.TEST_ORG_ID || 'test-org-id';
  seedVendors(testOrgId)
    .then(() => {
      console.log('✓ Vendor seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Vendor seeding failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
