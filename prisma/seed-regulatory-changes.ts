/**
 * Regulatory Change Tracking Seed Data
 * Seeds regulatory changes with framework impact mappings
 */

import { PrismaClient, RegulatoryStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds regulatory changes and their framework impacts
 * Creates 4 major regulatory events affecting AI governance
 */
export async function seedRegulatoryChanges() {
  console.log('📜 Seeding regulatory changes...');

  // Get framework IDs for mapping
  const euAiAct = await prisma.framework.findFirst({
    where: { shortName: 'EU-AI-ACT' },
  });
  const nistAiRmf = await prisma.framework.findFirst({
    where: { shortName: 'NIST-AI-RMF' },
  });
  const iso42001 = await prisma.framework.findFirst({
    where: { shortName: 'ISO42001' },
  });
  const owaspLlm = await prisma.framework.findFirst({
    where: { shortName: 'OWASP-LLM' },
  });

  // Regulatory Change 1: EU AI Act Article 6
  const euAiActChange = await prisma.regulatoryChange.create({
    data: {
      source: 'European Commission',
      title: 'EU AI Act Article 6 - High-Risk AI System Requirements',
      description:
        'New obligations for high-risk AI systems including conformity assessments, technical documentation, logging capabilities, and human oversight mechanisms. Organizations must implement risk management systems throughout the AI lifecycle.',
      effectiveDate: new Date('2025-08-02'),
      impactScore: 9.5,
      status: 'ENACTED' as RegulatoryStatus,
      changeType: 'compliance',
    },
  });

  if (euAiAct) {
    await prisma.frameworkChange.create({
      data: {
        changeId: euAiActChange.id,
        frameworkId: euAiAct.id,
        affectedControls: ['ART-6.1', 'ART-6.2', 'ART-9', 'ART-14', 'ART-17'],
        remediationNotes:
          'Enhance risk management documentation, implement automated logging for AI decisions, establish human oversight protocols for high-risk systems.',
      },
    });
  }

  // Regulatory Change 2: NIST AI RMF 1.1 Update
  const nistUpdate = await prisma.regulatoryChange.create({
    data: {
      source: 'NIST',
      title: 'NIST AI RMF 1.1 - Expanded Generative AI Guidance',
      description:
        'Updated risk management framework with enhanced guidance for generative AI systems, including prompt injection mitigation, hallucination monitoring, and content provenance tracking.',
      effectiveDate: new Date('2026-06-01'),
      impactScore: 7.0,
      status: 'PROPOSED' as RegulatoryStatus,
      changeType: 'framework-update',
    },
  });

  if (nistAiRmf) {
    await prisma.frameworkChange.create({
      data: {
        changeId: nistUpdate.id,
        frameworkId: nistAiRmf.id,
        affectedControls: ['GOVERN-1.2', 'MAP-2.3', 'MEASURE-2.11', 'MANAGE-1.1'],
        remediationNotes:
          'Add generative AI-specific controls: prompt injection detection, hallucination rate monitoring, content watermarking for synthetic outputs.',
      },
    });
  }

  // Regulatory Change 3: ISO 42001 Amendment 1
  const isoAmendment = await prisma.regulatoryChange.create({
    data: {
      source: 'ISO/IEC JTC 1/SC 42',
      title: 'ISO 42001:2023 Amendment 1 - AI Supply Chain Risk',
      description:
        'New requirements for AI supply chain risk management, third-party model validation, and vendor risk assessment. Introduces mandatory controls for model provenance and dependency tracking.',
      effectiveDate: new Date('2026-09-01'),
      impactScore: 6.5,
      status: 'PROPOSED' as RegulatoryStatus,
      changeType: 'standard-amendment',
    },
  });

  if (iso42001) {
    await prisma.frameworkChange.create({
      data: {
        changeId: isoAmendment.id,
        frameworkId: iso42001.id,
        affectedControls: ['6.1.4', '6.2.3', '8.2.1', '9.2'],
        remediationNotes:
          'Implement vendor risk scoring, establish model validation procedures, create supply chain dependency maps, audit third-party AI components.',
      },
    });
  }

  // Regulatory Change 4: OWASP LLM Top 10 v2026
  const owaspUpdate = await prisma.regulatoryChange.create({
    data: {
      source: 'OWASP Foundation',
      title: 'OWASP LLM Top 10 v2026 - Agentic AI Threats',
      description:
        'Updated threat model including new risks for agentic AI systems: autonomous goal drift, multi-agent coordination attacks, and recursive self-improvement vulnerabilities. Active as of January 2026.',
      effectiveDate: new Date('2026-01-15'),
      impactScore: 8.0,
      status: 'ACTIVE' as RegulatoryStatus,
      changeType: 'threat-model',
    },
  });

  if (owaspLlm) {
    await prisma.frameworkChange.create({
      data: {
        changeId: owaspUpdate.id,
        frameworkId: owaspLlm.id,
        affectedControls: ['LLM01', 'LLM06', 'LLM09'],
        remediationNotes:
          'Add agent behavior monitoring, implement goal alignment checks, establish circuit breakers for autonomous systems, monitor cross-agent communication.',
      },
    });
  }

  console.log('✓ Seeded 4 regulatory changes with framework impacts');
  console.log(`  - ENACTED: ${euAiActChange.title}`);
  console.log(`  - PROPOSED: ${nistUpdate.title}`);
  console.log(`  - PROPOSED: ${isoAmendment.title}`);
  console.log(`  - ACTIVE: ${owaspUpdate.title}`);

  return {
    changes: [euAiActChange, nistUpdate, isoAmendment, owaspUpdate],
    frameworkChanges: 4,
  };
}

/**
 * Standalone execution (for testing)
 */
if (require.main === module) {
  seedRegulatoryChanges()
    .then(() => {
      console.log('✓ Regulatory change seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Regulatory change seeding failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
