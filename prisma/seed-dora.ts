/**
 * DORA (Digital Operational Resilience Act) Seed Script
 * EU Regulation 2022/2554 for Financial Sector ICT Resilience
 *
 * Effective: January 17, 2025
 * Source: Official Journal of the European Union
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const DORA_CHAPTERS = [
  {
    code: 'DORA-C1',
    title: 'General Provisions',
    description: 'Subject matter, scope, and definitions.',
    articles: [
      { code: 'DORA-A1', title: 'Subject Matter', description: 'Uniform requirements for security of network and information systems supporting business processes of financial entities.' },
      { code: 'DORA-A2', title: 'Scope', description: 'Applies to 21 types of financial entities including banks, insurers, investment firms, crypto-asset service providers.' },
      { code: 'DORA-A3', title: 'Definitions', description: 'Defines ICT risk, digital operational resilience, ICT-related incident, critical ICT third-party service provider.' },
    ],
  },
  {
    code: 'DORA-C2',
    title: 'ICT Risk Management',
    description: 'Comprehensive ICT risk management framework requirements.',
    articles: [
      { code: 'DORA-A5', title: 'Governance and Organization', description: 'Management body shall define, approve, oversee, and be accountable for implementation of ICT risk management framework.' },
      { code: 'DORA-A6', title: 'ICT Risk Management Framework', description: 'Establish and maintain sound, comprehensive, and well-documented ICT risk management framework.' },
      { code: 'DORA-A7', title: 'ICT Systems, Protocols, Tools', description: 'Use and maintain updated ICT systems, protocols, and tools that are appropriate to support operations.' },
      { code: 'DORA-A8', title: 'Identification', description: 'Identify, classify, and adequately document all ICT supported business functions, information assets, and ICT assets.' },
      { code: 'DORA-A9', title: 'Protection and Prevention', description: 'Establish and implement ICT security policies, procedures, and tools for protection and prevention.' },
      { code: 'DORA-A10', title: 'Detection', description: 'Establish mechanisms to promptly detect anomalous activities and ICT-related incidents.' },
      { code: 'DORA-A11', title: 'Response and Recovery', description: 'Establish comprehensive ICT business continuity policy and ICT response and recovery plans.' },
      { code: 'DORA-A12', title: 'Backup Policies', description: 'Establish backup policies and recovery methods to ensure continuity of ICT systems and data.' },
      { code: 'DORA-A13', title: 'Learning and Evolving', description: 'Gather information on vulnerabilities, cyber threats, and ICT-related incidents to review ICT risk management framework.' },
      { code: 'DORA-A14', title: 'Communication', description: 'Establish crisis communication plans enabling responsible disclosure to clients and counterparts.' },
    ],
  },
  {
    code: 'DORA-C3',
    title: 'ICT-Related Incident Management',
    description: 'Incident classification, reporting, and management.',
    articles: [
      { code: 'DORA-A17', title: 'ICT-Related Incident Management Process', description: 'Define, establish, and implement ICT-related incident management process.' },
      { code: 'DORA-A18', title: 'Classification of ICT-Related Incidents', description: 'Classify ICT-related incidents and determine impact using defined criteria.' },
      { code: 'DORA-A19', title: 'Reporting of Major Incidents', description: 'Report major ICT-related incidents to competent authority using standardized templates.' },
      { code: 'DORA-A19.4a', title: 'Initial Notification', description: 'Initial notification within 4 hours of classification, no later than 24 hours from detection.' },
      { code: 'DORA-A19.4b', title: 'Intermediate Report', description: 'Intermediate report within 72 hours of initial notification.' },
      { code: 'DORA-A19.4c', title: 'Final Report', description: 'Final report within 1 month of incident resolution.' },
      { code: 'DORA-A20', title: 'Harmonization of Reporting', description: 'ESAs shall develop common templates, timelines, and procedures for incident reporting.' },
    ],
  },
  {
    code: 'DORA-C4',
    title: 'Digital Operational Resilience Testing',
    description: 'Testing requirements including threat-led penetration testing.',
    articles: [
      { code: 'DORA-A24', title: 'General Requirements', description: 'Establish, maintain, and review digital operational resilience testing programme.' },
      { code: 'DORA-A25', title: 'Testing of ICT Tools', description: 'Testing shall include vulnerability assessments, network security assessments, and gap analyses.' },
      { code: 'DORA-A26', title: 'Advanced Testing - TLPT', description: 'Significant financial entities shall carry out Threat-Led Penetration Testing at least every 3 years.' },
      { code: 'DORA-A27', title: 'Requirements for Testers', description: 'TLPT shall be performed by qualified internal or external testers meeting defined criteria.' },
    ],
  },
  {
    code: 'DORA-C5',
    title: 'ICT Third-Party Risk Management',
    description: 'Management of risks from ICT third-party service providers.',
    articles: [
      { code: 'DORA-A28', title: 'General Principles', description: 'Financial entities shall manage ICT third-party risk as integral component of ICT risk management.' },
      { code: 'DORA-A29', title: 'Preliminary Assessment', description: 'Assess and identify all ICT services supporting critical or important functions.' },
      { code: 'DORA-A30', title: 'Key Contractual Provisions', description: 'Contractual arrangements shall include security requirements, audit rights, exit strategies.' },
      { code: 'DORA-A31', title: 'Register of Information', description: 'Maintain and update register of information in relation to all contractual arrangements on ICT services.' },
      { code: 'DORA-A32', title: 'Oversight Framework', description: 'ESAs shall designate critical ICT third-party service providers and establish oversight framework.' },
      { code: 'DORA-A33', title: 'Lead Overseer', description: 'ESAs shall designate Lead Overseer for each critical ICT third-party service provider.' },
      { code: 'DORA-A35', title: 'Oversight Powers', description: 'Lead Overseer may conduct inspections, request information, and issue recommendations.' },
    ],
  },
  {
    code: 'DORA-C6',
    title: 'Information Sharing',
    description: 'Arrangements for sharing cyber threat intelligence.',
    articles: [
      { code: 'DORA-A45', title: 'Information Sharing Arrangements', description: 'Financial entities may exchange cyber threat information and intelligence within trusted communities.' },
    ],
  },
  {
    code: 'DORA-C7',
    title: 'Competent Authorities',
    description: 'Supervision and administrative penalties.',
    articles: [
      { code: 'DORA-A46', title: 'Competent Authorities', description: 'Member States shall designate competent authorities responsible for DORA supervision.' },
      { code: 'DORA-A50', title: 'Administrative Penalties', description: 'Competent authorities shall have power to impose administrative penalties and remedial measures.' },
    ],
  },
];

export async function seedDORA() {
  console.log('📙 Seeding DORA (Digital Operational Resilience Act)...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'DORA', version: '2022' } },
    update: {},
    create: {
      name: 'Digital Operational Resilience Act (EU 2022/2554)',
      shortName: 'DORA',
      version: '2022',
      effectiveDate: new Date('2025-01-17'),
      description: 'EU regulation establishing uniform requirements for ICT security and operational resilience in the financial sector. Applies to 21 types of financial entities.',
      category: FrameworkCategory.COMPLIANCE,
      isActive: true,
    },
  });

  for (let i = 0; i < DORA_CHAPTERS.length; i++) {
    const chapter = DORA_CHAPTERS[i];
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

  console.log('  ✅ DORA seeded (7 chapters, 36 articles)');
  return framework;
}

export async function seedDORAMappings() {
  console.log('🔗 Creating DORA cross-framework mappings...');

  const dora = await prisma.framework.findFirst({
    where: { shortName: 'DORA', version: '2022' },
  });
  const nis2 = await prisma.framework.findFirst({
    where: { shortName: 'NIS2', version: '2022' },
  });
  const iso27001 = await prisma.framework.findFirst({
    where: { shortName: 'ISO-27001', version: '2022' },
  });

  if (!dora) {
    console.log('  ⚠️  DORA framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // DORA to NIS2 mappings
  if (nis2) {
    const nis2Mappings = [
      { dora: 'DORA-C2', nis2: 'NIS2-C4', reason: 'ICT risk management to cybersecurity risk management' },
      { dora: 'DORA-C3', nis2: 'NIS2-A23', reason: 'Incident management and reporting alignment' },
      { dora: 'DORA-C5', nis2: 'NIS2-A21.2d', reason: 'Third-party risk to supply chain security' },
    ];

    for (const mapping of nis2Mappings) {
      const doraControl = await prisma.control.findFirst({
        where: { frameworkId: dora.id, code: mapping.dora },
      });
      const nis2Control = await prisma.control.findFirst({
        where: { frameworkId: nis2.id, code: mapping.nis2 },
      });

      if (doraControl && nis2Control) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: doraControl.id,
            targetControlId: nis2Control.id,
            sourceFrameworkId: dora.id,
            targetFrameworkId: nis2.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  // DORA to ISO 27001 mappings
  if (iso27001) {
    const isoMappings = [
      { dora: 'DORA-A5', iso: 'A.5', reason: 'Governance to security policies' },
      { dora: 'DORA-A9', iso: 'A.9', reason: 'Protection to access control' },
      { dora: 'DORA-A11', iso: 'A.17', reason: 'Response and recovery to business continuity' },
      { dora: 'DORA-C3', iso: 'A.16', reason: 'Incident management alignment' },
      { dora: 'DORA-C5', iso: 'A.15', reason: 'Third-party to supplier relationships' },
    ];

    for (const mapping of isoMappings) {
      const doraControl = await prisma.control.findFirst({
        where: { frameworkId: dora.id, code: mapping.dora },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso27001.id, code: mapping.iso },
      });

      if (doraControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: doraControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: dora.id,
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

  console.log(`  ✅ Created ${created} DORA cross-framework mappings`);
}
