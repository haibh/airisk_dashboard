/**
 * NIS2 Directive Seed Script
 * Network and Information Security Directive 2 (EU 2022/2555)
 *
 * Effective: October 2024
 * Source: Official Journal of the European Union
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const NIS2_CHAPTERS = [
  {
    code: 'NIS2-C1',
    title: 'General Provisions',
    description: 'Subject matter, scope, definitions, and minimum harmonization.',
    articles: [
      { code: 'NIS2-A1', title: 'Subject Matter', description: 'Establishes measures for high common level of cybersecurity across the Union.' },
      { code: 'NIS2-A2', title: 'Scope', description: 'Applies to essential and important entities across 18 critical sectors.' },
      { code: 'NIS2-A3', title: 'Essential Entities', description: 'Defines essential entities: energy, transport, banking, health, water, digital infrastructure, ICT service management, public administration, space.' },
      { code: 'NIS2-A4', title: 'Important Entities', description: 'Defines important entities: postal, waste, chemicals, food, manufacturing, digital providers, research.' },
    ],
  },
  {
    code: 'NIS2-C2',
    title: 'Coordinated Cybersecurity Frameworks',
    description: 'National cybersecurity strategies and governance structures.',
    articles: [
      { code: 'NIS2-A7', title: 'National Cybersecurity Strategy', description: 'Member States shall adopt national cybersecurity strategy addressing security of supply chains, vulnerability disclosure, and cyber hygiene.' },
      { code: 'NIS2-A8', title: 'Competent Authorities', description: 'Member States shall designate one or more competent authorities for cybersecurity.' },
      { code: 'NIS2-A9', title: 'National Single Point of Contact', description: 'Designate single point of contact for cross-border cooperation.' },
      { code: 'NIS2-A10', title: 'CSIRTs', description: 'Establish Computer Security Incident Response Teams with defined tasks and capabilities.' },
    ],
  },
  {
    code: 'NIS2-C3',
    title: 'Cooperation',
    description: 'Cooperation mechanisms at Union and international level.',
    articles: [
      { code: 'NIS2-A13', title: 'Cooperation Group', description: 'Cooperation Group for strategic cooperation and information exchange.' },
      { code: 'NIS2-A14', title: 'CSIRTs Network', description: 'Network of national CSIRTs for operational cooperation.' },
      { code: 'NIS2-A16', title: 'EU-CyCLONe', description: 'European Cyber Crises Liaison Organisation Network for coordinated crisis management.' },
      { code: 'NIS2-A17', title: 'International Cooperation', description: 'Union may conclude international agreements with third countries.' },
    ],
  },
  {
    code: 'NIS2-C4',
    title: 'Cybersecurity Risk Management & Reporting',
    description: 'Core security requirements for entities.',
    articles: [
      { code: 'NIS2-A20', title: 'Governance', description: 'Management bodies shall approve and oversee cybersecurity risk-management measures.' },
      { code: 'NIS2-A21', title: 'Cybersecurity Risk-Management Measures', description: 'Entities shall take appropriate technical, operational, and organizational measures.' },
      { code: 'NIS2-A21.2a', title: 'Policies on Risk Analysis', description: 'Policies on risk analysis and information system security.' },
      { code: 'NIS2-A21.2b', title: 'Incident Handling', description: 'Incident handling procedures and capabilities.' },
      { code: 'NIS2-A21.2c', title: 'Business Continuity', description: 'Business continuity including backup management and disaster recovery.' },
      { code: 'NIS2-A21.2d', title: 'Supply Chain Security', description: 'Supply chain security including security-related aspects of relationships with suppliers.' },
      { code: 'NIS2-A21.2e', title: 'Security in Acquisition', description: 'Security in network and information systems acquisition, development, and maintenance.' },
      { code: 'NIS2-A21.2f', title: 'Vulnerability Handling', description: 'Policies and procedures for assessing cybersecurity risk-management measures effectiveness.' },
      { code: 'NIS2-A21.2g', title: 'Cyber Hygiene and Training', description: 'Basic cyber hygiene practices and cybersecurity training.' },
      { code: 'NIS2-A21.2h', title: 'Cryptography', description: 'Policies and procedures regarding use of cryptography and encryption.' },
      { code: 'NIS2-A21.2i', title: 'Human Resources Security', description: 'Human resources security, access control policies, and asset management.' },
      { code: 'NIS2-A21.2j', title: 'MFA and Authentication', description: 'Multi-factor authentication, continuous authentication, and secured communications.' },
      { code: 'NIS2-A23', title: 'Reporting Obligations', description: 'Significant incident reporting within 24 hours (early warning), 72 hours (incident notification), 1 month (final report).' },
    ],
  },
  {
    code: 'NIS2-C5',
    title: 'Jurisdiction and Registration',
    description: 'Rules on jurisdiction and entity registration.',
    articles: [
      { code: 'NIS2-A26', title: 'Jurisdiction', description: 'Entities subject to jurisdiction of Member State where they provide services or are established.' },
      { code: 'NIS2-A27', title: 'Registry of Entities', description: 'Member States shall create registry of essential and important entities.' },
    ],
  },
  {
    code: 'NIS2-C6',
    title: 'Information Sharing',
    description: 'Cybersecurity information sharing arrangements.',
    articles: [
      { code: 'NIS2-A29', title: 'Voluntary Information Sharing', description: 'Entities may share cybersecurity information on voluntary basis.' },
      { code: 'NIS2-A30', title: 'Voluntary Notification', description: 'Entities not covered may voluntarily notify significant incidents.' },
    ],
  },
  {
    code: 'NIS2-C7',
    title: 'Supervision and Enforcement',
    description: 'Powers and penalties for competent authorities.',
    articles: [
      { code: 'NIS2-A31', title: 'General Supervision', description: 'Competent authorities shall supervise and take measures to ensure compliance.' },
      { code: 'NIS2-A32', title: 'Supervisory Measures (Essential)', description: 'On-site inspections, security audits, security scans, requests for information.' },
      { code: 'NIS2-A33', title: 'Supervisory Measures (Important)', description: 'Ex-post supervision based on evidence of non-compliance.' },
      { code: 'NIS2-A34', title: 'Administrative Fines', description: 'Essential entities: max €10M or 2% global turnover. Important entities: max €7M or 1.4% global turnover.' },
    ],
  },
];

export async function seedNIS2() {
  console.log('📘 Seeding NIS2 Directive...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'NIS2', version: '2022' } },
    update: {},
    create: {
      name: 'NIS2 Directive (EU 2022/2555)',
      shortName: 'NIS2',
      version: '2022',
      effectiveDate: new Date('2024-10-17'),
      description: 'EU Network and Information Security Directive 2 - Harmonized cybersecurity requirements for essential and important entities across 18 critical sectors.',
      category: FrameworkCategory.COMPLIANCE,
      isActive: true,
    },
  });

  for (let i = 0; i < NIS2_CHAPTERS.length; i++) {
    const chapter = NIS2_CHAPTERS[i];
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

  console.log('  ✅ NIS2 Directive seeded (7 chapters, 35 articles)');
  return framework;
}

export async function seedNIS2Mappings() {
  console.log('🔗 Creating NIS2 cross-framework mappings...');

  const nis2 = await prisma.framework.findFirst({
    where: { shortName: 'NIS2', version: '2022' },
  });
  const iso27001 = await prisma.framework.findFirst({
    where: { shortName: 'ISO-27001', version: '2022' },
  });
  const nistcsf = await prisma.framework.findFirst({
    where: { shortName: 'NIST-CSF', version: '2.0' },
  });

  if (!nis2) {
    console.log('  ⚠️  NIS2 framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // NIS2 to ISO 27001 mappings
  if (iso27001) {
    const isoMappings = [
      { nis2: 'NIS2-C4', iso: 'A.5', reason: 'Risk management measures to security policies' },
      { nis2: 'NIS2-A21.2b', iso: 'A.16', reason: 'Incident handling alignment' },
      { nis2: 'NIS2-A21.2c', iso: 'A.17', reason: 'Business continuity alignment' },
      { nis2: 'NIS2-A21.2d', iso: 'A.15', reason: 'Supply chain to supplier relationships' },
      { nis2: 'NIS2-A21.2i', iso: 'A.9', reason: 'Access control alignment' },
    ];

    for (const mapping of isoMappings) {
      const nis2Control = await prisma.control.findFirst({
        where: { frameworkId: nis2.id, code: mapping.nis2 },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso27001.id, code: mapping.iso },
      });

      if (nis2Control && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: nis2Control.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: nis2.id,
            targetFrameworkId: iso27001.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  // NIS2 to NIST CSF mappings
  if (nistcsf) {
    const csfMappings = [
      { nis2: 'NIS2-C4', csf: 'GV', reason: 'Governance requirements alignment' },
      { nis2: 'NIS2-A21.2a', csf: 'ID.RA', reason: 'Risk analysis requirements' },
      { nis2: 'NIS2-A23', csf: 'RS.CO', reason: 'Incident reporting to response communication' },
    ];

    for (const mapping of csfMappings) {
      const nis2Control = await prisma.control.findFirst({
        where: { frameworkId: nis2.id, code: mapping.nis2 },
      });
      const csfControl = await prisma.control.findFirst({
        where: { frameworkId: nistcsf.id, code: mapping.csf },
      });

      if (nis2Control && csfControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: nis2Control.id,
            targetControlId: csfControl.id,
            sourceFrameworkId: nis2.id,
            targetFrameworkId: nistcsf.id,
            confidenceScore: ConfidenceLevel.MEDIUM,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} NIS2 cross-framework mappings`);
}
