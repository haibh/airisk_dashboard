/**
 * EU AI Act Seed Script
 * European Union Artificial Intelligence Act - World's first comprehensive AI regulation
 *
 * Effective: August 2024 (phased implementation through 2027)
 * Source: Regulation (EU) 2024/1689
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const EU_AI_ACT_CHAPTERS = [
  {
    code: 'EUAI-C1',
    title: 'General Provisions',
    description: 'Scope, definitions, and fundamental principles of the AI Act.',
    articles: [
      { code: 'EUAI-A1', title: 'Subject Matter', description: 'Establishes harmonized rules for AI systems in the Union, ensuring safety, fundamental rights, and innovation.' },
      { code: 'EUAI-A2', title: 'Scope', description: 'Applies to providers, deployers, importers, distributors, and product manufacturers of AI systems within the EU market.' },
      { code: 'EUAI-A3', title: 'Definitions', description: 'Defines key terms including AI system, provider, deployer, high-risk AI system, and general-purpose AI model.' },
    ],
  },
  {
    code: 'EUAI-C2',
    title: 'Prohibited AI Practices',
    description: 'AI practices that are prohibited due to unacceptable risk to fundamental rights.',
    articles: [
      { code: 'EUAI-A5', title: 'Prohibited AI Practices', description: 'Bans manipulative AI, social scoring, real-time remote biometric identification (with exceptions), emotion recognition in workplace/education.' },
      { code: 'EUAI-A5.1', title: 'Subliminal Manipulation', description: 'Prohibition on AI deploying subliminal techniques beyond consciousness to materially distort behavior.' },
      { code: 'EUAI-A5.2', title: 'Exploitation of Vulnerabilities', description: 'Prohibition on AI exploiting age, disability, or social/economic situation vulnerabilities.' },
      { code: 'EUAI-A5.3', title: 'Social Scoring', description: 'Prohibition on AI systems evaluating or classifying persons based on social behavior leading to detrimental treatment.' },
      { code: 'EUAI-A5.4', title: 'Biometric Categorization', description: 'Prohibition on biometric categorization inferring sensitive attributes (race, religion, sexual orientation).' },
    ],
  },
  {
    code: 'EUAI-C3',
    title: 'High-Risk AI Systems',
    description: 'Requirements and obligations for high-risk AI systems.',
    articles: [
      { code: 'EUAI-A6', title: 'Classification Rules', description: 'Defines criteria for classifying AI systems as high-risk based on Annex III categories.' },
      { code: 'EUAI-A9', title: 'Risk Management System', description: 'Requires continuous iterative risk management throughout AI system lifecycle.' },
      { code: 'EUAI-A10', title: 'Data Governance', description: 'Requirements for training, validation, and testing data sets including quality, representativeness, and bias examination.' },
      { code: 'EUAI-A11', title: 'Technical Documentation', description: 'Comprehensive documentation demonstrating compliance with high-risk requirements.' },
      { code: 'EUAI-A12', title: 'Record-Keeping', description: 'Automatic logging of events for traceability throughout system lifecycle.' },
      { code: 'EUAI-A13', title: 'Transparency', description: 'Clear instructions for deployers including capabilities, limitations, and intended purpose.' },
      { code: 'EUAI-A14', title: 'Human Oversight', description: 'Designed for effective human oversight to prevent or minimize risks.' },
      { code: 'EUAI-A15', title: 'Accuracy, Robustness, Cybersecurity', description: 'Appropriate levels of accuracy, robustness, and cybersecurity throughout lifecycle.' },
    ],
  },
  {
    code: 'EUAI-C4',
    title: 'Transparency Obligations',
    description: 'Transparency requirements for specific AI systems.',
    articles: [
      { code: 'EUAI-A50', title: 'Interaction with Natural Persons', description: 'Users must be informed when interacting with AI system (chatbots, emotion recognition).' },
      { code: 'EUAI-A50.2', title: 'Synthetic Content Marking', description: 'AI-generated synthetic audio, image, video, or text must be marked as artificially generated.' },
      { code: 'EUAI-A50.3', title: 'Deep Fake Disclosure', description: 'Deep fakes must disclose artificial generation or manipulation.' },
    ],
  },
  {
    code: 'EUAI-C5',
    title: 'General-Purpose AI Models',
    description: 'Requirements for general-purpose AI models including foundation models.',
    articles: [
      { code: 'EUAI-A53', title: 'GPAI Model Obligations', description: 'Technical documentation, transparency for downstream providers, copyright compliance, and training data summary.' },
      { code: 'EUAI-A55', title: 'Systemic Risk Models', description: 'Additional obligations for GPAI models with systemic risk including model evaluation, adversarial testing, and incident reporting.' },
      { code: 'EUAI-A56', title: 'Codes of Practice', description: 'Development of codes of practice for GPAI model compliance.' },
    ],
  },
  {
    code: 'EUAI-C6',
    title: 'Governance and Enforcement',
    description: 'EU AI Office, national authorities, and enforcement mechanisms.',
    articles: [
      { code: 'EUAI-A64', title: 'EU AI Office', description: 'Establishment of AI Office within Commission for GPAI oversight and coordination.' },
      { code: 'EUAI-A70', title: 'National Competent Authorities', description: 'Member States designate authorities for AI Act enforcement.' },
      { code: 'EUAI-A71', title: 'Market Surveillance', description: 'Market surveillance authorities monitor compliance and investigate non-conformities.' },
    ],
  },
  {
    code: 'EUAI-C7',
    title: 'Penalties',
    description: 'Administrative fines and penalties for non-compliance.',
    articles: [
      { code: 'EUAI-A99', title: 'Penalties', description: 'Fines up to €35M or 7% global turnover for prohibited practices; €15M or 3% for high-risk violations.' },
      { code: 'EUAI-A99.3', title: 'GPAI Penalties', description: 'Fines up to €15M or 3% global turnover for GPAI model non-compliance.' },
    ],
  },
  {
    code: 'EUAI-C8',
    title: 'Implementation Timeline',
    description: 'Phased implementation schedule for different provisions.',
    articles: [
      { code: 'EUAI-T1', title: 'Phase 1: Prohibited Practices', description: 'February 2025 - Prohibition on unacceptable risk AI practices takes effect.' },
      { code: 'EUAI-T2', title: 'Phase 2: GPAI Rules', description: 'August 2025 - Rules for general-purpose AI models apply.' },
      { code: 'EUAI-T3', title: 'Phase 3: High-Risk (Annex III)', description: 'August 2026 - High-risk AI system obligations for Annex III categories.' },
      { code: 'EUAI-T4', title: 'Phase 4: Full Application', description: 'August 2027 - All provisions fully applicable including product safety integration.' },
    ],
  },
];

export async function seedEUAIAct() {
  console.log('📘 Seeding EU AI Act...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'EU-AI-ACT', version: '2024' } },
    update: {},
    create: {
      name: 'European Union Artificial Intelligence Act',
      shortName: 'EU-AI-ACT',
      version: '2024',
      effectiveDate: new Date('2024-08-01'),
      description: 'First comprehensive horizontal legal framework for AI. Risk-based approach with prohibitions, high-risk requirements, and transparency obligations.',
      category: FrameworkCategory.COMPLIANCE,
      isActive: true,
    },
  });

  for (let i = 0; i < EU_AI_ACT_CHAPTERS.length; i++) {
    const chapter = EU_AI_ACT_CHAPTERS[i];
    const chapterControl = await prisma.control.create({
      data: {
        code: chapter.code,
        title: chapter.title,
        description: chapter.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < chapter.articles.length; j++) {
      await prisma.control.create({
        data: {
          code: chapter.articles[j].code,
          title: chapter.articles[j].title,
          description: chapter.articles[j].description,
          frameworkId: framework.id,
          parentId: chapterControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ EU AI Act seeded (8 chapters, 30 articles/controls)');
  return framework;
}

export async function seedEUAIActMappings() {
  console.log('🔗 Creating EU AI Act cross-framework mappings...');

  const euaiFramework = await prisma.framework.findFirst({
    where: { shortName: 'EU-AI-ACT', version: '2024' },
  });
  const nistFramework = await prisma.framework.findFirst({
    where: { shortName: 'NIST-AI-RMF', version: '1.0' },
  });
  const isoFramework = await prisma.framework.findFirst({
    where: { shortName: 'ISO-42001', version: '2023' },
  });

  if (!euaiFramework) {
    console.log('  ⚠️  EU AI Act framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // EU AI Act to NIST AI RMF mappings
  if (nistFramework) {
    const nistMappings = [
      { euai: 'EUAI-C3', nist: 'GOVERN-1', confidence: ConfidenceLevel.HIGH, reason: 'High-risk governance aligns with NIST governance policies' },
      { euai: 'EUAI-A9', nist: 'MAP-4', confidence: ConfidenceLevel.HIGH, reason: 'Both require risk management systems' },
      { euai: 'EUAI-A10', nist: 'MAP-3', confidence: ConfidenceLevel.HIGH, reason: 'Data governance relates to capabilities analysis' },
      { euai: 'EUAI-A14', nist: 'GOVERN-4', confidence: ConfidenceLevel.HIGH, reason: 'Human oversight aligns with safety culture' },
      { euai: 'EUAI-A15', nist: 'MEASURE-2', confidence: ConfidenceLevel.HIGH, reason: 'Accuracy and robustness require measurement' },
      { euai: 'EUAI-C4', nist: 'MAP-1', confidence: ConfidenceLevel.MEDIUM, reason: 'Transparency relates to context establishment' },
    ];

    for (const mapping of nistMappings) {
      const euaiControl = await prisma.control.findFirst({
        where: { frameworkId: euaiFramework.id, code: mapping.euai },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nistFramework.id, code: mapping.nist },
      });

      if (euaiControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: euaiControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: euaiFramework.id,
            targetFrameworkId: nistFramework.id,
            confidenceScore: mapping.confidence,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  // EU AI Act to ISO 42001 mappings
  if (isoFramework) {
    const isoMappings = [
      { euai: 'EUAI-A9', iso: 'A.5', reason: 'Risk management system to impact assessment' },
      { euai: 'EUAI-A10', iso: 'A.7', reason: 'Data governance requirements' },
      { euai: 'EUAI-A11', iso: 'A.6', reason: 'Technical documentation for lifecycle' },
      { euai: 'EUAI-A13', iso: 'A.8', reason: 'Transparency to information for parties' },
      { euai: 'EUAI-A14', iso: 'A.9', reason: 'Human oversight requirements' },
    ];

    for (const mapping of isoMappings) {
      const euaiControl = await prisma.control.findFirst({
        where: { frameworkId: euaiFramework.id, code: mapping.euai },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: isoFramework.id, code: mapping.iso },
      });

      if (euaiControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: euaiControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: euaiFramework.id,
            targetFrameworkId: isoFramework.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} EU AI Act cross-framework mappings`);
}
