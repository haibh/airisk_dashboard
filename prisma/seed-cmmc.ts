/**
 * CMMC 2.0 (Cybersecurity Maturity Model Certification) Seed Script
 * DoD Contractor Security Requirements
 *
 * Effective: 2025 (phased rollout)
 * Source: Department of Defense
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const CMMC_LEVELS = [
  {
    code: 'CMMC-L1',
    title: 'Level 1 - Foundational',
    description: 'Basic cyber hygiene practices. 17 practices from FAR 52.204-21. Self-assessment required.',
    practices: [
      { code: 'CMMC-L1-AC.1.001', title: 'Authorized Access Control', description: 'Limit information system access to authorized users, processes acting on behalf of authorized users, or devices.' },
      { code: 'CMMC-L1-AC.1.002', title: 'Transaction Type Control', description: 'Limit information system access to the types of transactions and functions that authorized users are permitted to execute.' },
      { code: 'CMMC-L1-AC.1.003', title: 'External Connections', description: 'Verify and control/limit connections to and use of external information systems.' },
      { code: 'CMMC-L1-AC.1.004', title: 'Public Access Control', description: 'Control information posted or processed on publicly accessible information systems.' },
      { code: 'CMMC-L1-IA.1.076', title: 'Identification', description: 'Identify information system users, processes acting on behalf of users, or devices.' },
      { code: 'CMMC-L1-IA.1.077', title: 'Authentication', description: 'Authenticate (or verify) the identities of those users, processes, or devices.' },
      { code: 'CMMC-L1-MP.1.118', title: 'Media Sanitization', description: 'Sanitize or destroy information system media containing FCI before disposal or release.' },
      { code: 'CMMC-L1-PE.1.131', title: 'Physical Access Limitation', description: 'Limit physical access to organizational information systems, equipment, and operating environments.' },
      { code: 'CMMC-L1-PE.1.132', title: 'Visitor Escort', description: 'Escort visitors and monitor visitor activity.' },
      { code: 'CMMC-L1-PE.1.133', title: 'Access Logs', description: 'Maintain audit logs of physical access.' },
      { code: 'CMMC-L1-PE.1.134', title: 'Physical Access Devices', description: 'Control and manage physical access devices.' },
      { code: 'CMMC-L1-SC.1.175', title: 'Boundary Protection', description: 'Monitor, control, and protect organizational communications at external boundaries.' },
      { code: 'CMMC-L1-SC.1.176', title: 'Public Access Separation', description: 'Implement subnetworks for publicly accessible system components.' },
      { code: 'CMMC-L1-SI.1.210', title: 'Flaw Remediation', description: 'Identify, report, and correct information and information system flaws in a timely manner.' },
      { code: 'CMMC-L1-SI.1.211', title: 'Malicious Code Protection', description: 'Provide protection from malicious code at appropriate locations.' },
      { code: 'CMMC-L1-SI.1.212', title: 'Update Malicious Code Protection', description: 'Update malicious code protection mechanisms when new releases are available.' },
      { code: 'CMMC-L1-SI.1.213', title: 'System Scans', description: 'Perform periodic scans and real-time scans of files from external sources.' },
    ],
  },
  {
    code: 'CMMC-L2',
    title: 'Level 2 - Advanced',
    description: 'Protection of CUI. 110 practices aligned with NIST SP 800-171. Third-party assessment required for prioritized acquisitions.',
    practices: [
      { code: 'CMMC-L2-AC', title: 'Access Control', description: '22 access control practices for protecting CUI including least privilege, session controls, and remote access.' },
      { code: 'CMMC-L2-AT', title: 'Awareness and Training', description: '3 practices for security awareness training and role-based training.' },
      { code: 'CMMC-L2-AU', title: 'Audit and Accountability', description: '9 practices for audit logging, protection, and review.' },
      { code: 'CMMC-L2-CA', title: 'Assessment', description: '4 practices for security assessments and system connections.' },
      { code: 'CMMC-L2-CM', title: 'Configuration Management', description: '9 practices for baseline configurations, change control, and least functionality.' },
      { code: 'CMMC-L2-IA', title: 'Identification and Authentication', description: '11 practices for user identification, authenticator management, and device identification.' },
      { code: 'CMMC-L2-IR', title: 'Incident Response', description: '3 practices for incident handling, reporting, and response.' },
      { code: 'CMMC-L2-MA', title: 'Maintenance', description: '6 practices for system maintenance and nonlocal maintenance.' },
      { code: 'CMMC-L2-MP', title: 'Media Protection', description: '9 practices for media access, marking, storage, and sanitization.' },
      { code: 'CMMC-L2-PE', title: 'Physical Protection', description: '6 practices beyond Level 1 for physical access control and monitoring.' },
      { code: 'CMMC-L2-PS', title: 'Personnel Security', description: '2 practices for personnel screening and termination.' },
      { code: 'CMMC-L2-RA', title: 'Risk Assessment', description: '3 practices for risk assessments and vulnerability scanning.' },
      { code: 'CMMC-L2-SC', title: 'System and Communications Protection', description: '16 practices for boundary protection, encryption, and session authenticity.' },
      { code: 'CMMC-L2-SI', title: 'System and Information Integrity', description: '7 practices beyond Level 1 for monitoring, alerts, and integrity verification.' },
    ],
  },
  {
    code: 'CMMC-L3',
    title: 'Level 3 - Expert',
    description: 'Enhanced protection against APTs. 110+ practices including NIST SP 800-172 requirements. Government-led assessment required.',
    practices: [
      { code: 'CMMC-L3-SC', title: 'Enhanced System Protection', description: 'Advanced network segmentation, threat hunting, and security operations center (SOC) capabilities.' },
      { code: 'CMMC-L3-IR', title: 'Enhanced Incident Response', description: 'Advanced incident response including cyber threat intelligence and automated response.' },
      { code: 'CMMC-L3-CA', title: 'Enhanced Assessment', description: 'Penetration testing, red team exercises, and continuous monitoring.' },
      { code: 'CMMC-L3-AT', title: 'Enhanced Training', description: 'Specialized training for APT defense and advanced cyber operations.' },
      { code: 'CMMC-L3-SI', title: 'Enhanced Integrity', description: 'Advanced threat detection, sandboxing, and behavioral analysis.' },
    ],
  },
];

const CMMC_DOMAINS = [
  { code: 'CMMC-AC', title: 'Access Control', description: 'Establish system access requirements and control access to CUI.' },
  { code: 'CMMC-AT', title: 'Awareness and Training', description: 'Ensure personnel are aware of security risks and trained.' },
  { code: 'CMMC-AU', title: 'Audit and Accountability', description: 'Create, protect, retain, and review system audit logs.' },
  { code: 'CMMC-CA', title: 'Assessment', description: 'Assess security controls and manage system connections.' },
  { code: 'CMMC-CM', title: 'Configuration Management', description: 'Establish configuration baselines and manage changes.' },
  { code: 'CMMC-IA', title: 'Identification and Authentication', description: 'Identify and authenticate users, devices, and processes.' },
  { code: 'CMMC-IR', title: 'Incident Response', description: 'Establish incident handling capabilities.' },
  { code: 'CMMC-MA', title: 'Maintenance', description: 'Perform timely system maintenance.' },
  { code: 'CMMC-MP', title: 'Media Protection', description: 'Protect media containing CUI.' },
  { code: 'CMMC-PE', title: 'Physical Protection', description: 'Limit physical access and protect physical systems.' },
  { code: 'CMMC-PS', title: 'Personnel Security', description: 'Screen personnel and protect CUI during personnel actions.' },
  { code: 'CMMC-RA', title: 'Risk Assessment', description: 'Identify and manage risk to organizational operations.' },
  { code: 'CMMC-SC', title: 'System and Communications Protection', description: 'Protect communications and control system boundaries.' },
  { code: 'CMMC-SI', title: 'System and Information Integrity', description: 'Identify and manage information system flaws.' },
];

export async function seedCMMC() {
  console.log('📗 Seeding CMMC 2.0...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'CMMC', version: '2.0' } },
    update: {},
    create: {
      name: 'Cybersecurity Maturity Model Certification',
      shortName: 'CMMC',
      version: '2.0',
      effectiveDate: new Date('2025-01-01'),
      description: 'DoD certification framework for protecting Controlled Unclassified Information (CUI) in the defense industrial base. Three maturity levels from foundational to expert.',
      category: FrameworkCategory.COMPLIANCE,
      isActive: true,
    },
  });

  // Create domains first
  for (let i = 0; i < CMMC_DOMAINS.length; i++) {
    await prisma.control.create({
      data: {
        code: CMMC_DOMAINS[i].code,
        title: CMMC_DOMAINS[i].title,
        description: CMMC_DOMAINS[i].description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });
  }

  // Create levels and their practices
  for (let i = 0; i < CMMC_LEVELS.length; i++) {
    const level = CMMC_LEVELS[i];
    const levelControl = await prisma.control.create({
      data: {
        code: level.code,
        title: level.title,
        description: level.description,
        frameworkId: framework.id,
        sortOrder: CMMC_DOMAINS.length + i + 1,
      },
    });

    for (let j = 0; j < level.practices.length; j++) {
      await prisma.control.create({
        data: {
          code: level.practices[j].code,
          title: level.practices[j].title,
          description: level.practices[j].description,
          frameworkId: framework.id,
          parentId: levelControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ CMMC 2.0 seeded (14 domains, 3 levels, 36 practices)');
  return framework;
}

export async function seedCMMCMappings() {
  console.log('🔗 Creating CMMC cross-framework mappings...');

  const cmmc = await prisma.framework.findFirst({
    where: { shortName: 'CMMC', version: '2.0' },
  });
  const nist80053 = await prisma.framework.findFirst({
    where: { shortName: 'NIST-800-53', version: '5' },
  });
  const nistcsf = await prisma.framework.findFirst({
    where: { shortName: 'NIST-CSF', version: '2.0' },
  });

  if (!cmmc) {
    console.log('  ⚠️  CMMC framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // CMMC to NIST 800-53 mappings (CMMC L2 is based on 800-171 which maps to 800-53)
  if (nist80053) {
    const nistMappings = [
      { cmmc: 'CMMC-AC', nist: 'AC', reason: 'Access control domain direct alignment' },
      { cmmc: 'CMMC-AT', nist: 'AT', reason: 'Awareness and training alignment' },
      { cmmc: 'CMMC-AU', nist: 'AU', reason: 'Audit and accountability alignment' },
      { cmmc: 'CMMC-CM', nist: 'CM', reason: 'Configuration management alignment' },
      { cmmc: 'CMMC-IA', nist: 'IA', reason: 'Identification and authentication alignment' },
      { cmmc: 'CMMC-IR', nist: 'IR', reason: 'Incident response alignment' },
      { cmmc: 'CMMC-SC', nist: 'SC', reason: 'System and communications protection alignment' },
      { cmmc: 'CMMC-SI', nist: 'SI', reason: 'System and information integrity alignment' },
    ];

    for (const mapping of nistMappings) {
      const cmmcControl = await prisma.control.findFirst({
        where: { frameworkId: cmmc.id, code: mapping.cmmc },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nist80053.id, code: mapping.nist },
      });

      if (cmmcControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: cmmcControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: cmmc.id,
            targetFrameworkId: nist80053.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.EQUIVALENT,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  // CMMC to NIST CSF mappings
  if (nistcsf) {
    const csfMappings = [
      { cmmc: 'CMMC-AC', csf: 'PR.AC', reason: 'Access control protection category' },
      { cmmc: 'CMMC-RA', csf: 'ID.RA', reason: 'Risk assessment alignment' },
      { cmmc: 'CMMC-IR', csf: 'RS.AN', reason: 'Incident response to analysis' },
    ];

    for (const mapping of csfMappings) {
      const cmmcControl = await prisma.control.findFirst({
        where: { frameworkId: cmmc.id, code: mapping.cmmc },
      });
      const csfControl = await prisma.control.findFirst({
        where: { frameworkId: nistcsf.id, code: mapping.csf },
      });

      if (cmmcControl && csfControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: cmmcControl.id,
            targetControlId: csfControl.id,
            sourceFrameworkId: cmmc.id,
            targetFrameworkId: nistcsf.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} CMMC cross-framework mappings`);
}
