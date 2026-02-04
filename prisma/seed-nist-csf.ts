/**
 * NIST Cybersecurity Framework 2.0 Seed Script
 * Seeds NIST CSF 2.0 (released February 2024) with 6 functions, 22 categories
 * Source: https://www.nist.gov/cyberframework
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * NIST CSF 2.0 Structure: 6 Functions, 22 Categories
 */

// GOVERN Function Categories (6 categories)
const GOVERN_CATEGORIES = [
  { code: 'GV.OC', title: 'Organizational Context', desc: 'The circumstances – mission, stakeholder expectations, dependencies, and legal/regulatory requirements – surrounding the organization\'s cybersecurity risk management decisions are understood.' },
  { code: 'GV.RM', title: 'Risk Management Strategy', desc: 'The organization\'s priorities, constraints, risk tolerance and appetite, and assumptions are established, communicated, and used to support operational risk decisions.' },
  { code: 'GV.RR', title: 'Roles, Responsibilities, and Authorities', desc: 'Cybersecurity roles, responsibilities, and authorities to foster accountability, performance assessment, and continuous improvement are established and communicated.' },
  { code: 'GV.PO', title: 'Policy', desc: 'Organizational cybersecurity policy is established, communicated, and enforced.' },
  { code: 'GV.OV', title: 'Oversight', desc: 'Results of organization-wide cybersecurity risk management activities and performance are used to inform, improve, and adjust the risk management strategy.' },
  { code: 'GV.SC', title: 'Cybersecurity Supply Chain Risk Management', desc: 'Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by organizational stakeholders.' },
];

// IDENTIFY Function Categories (3 categories)
const IDENTIFY_CATEGORIES = [
  { code: 'ID.AM', title: 'Asset Management', desc: 'Assets (e.g., data, hardware, software, systems, facilities, services, people) that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to organizational objectives and the organization\'s risk strategy.' },
  { code: 'ID.RA', title: 'Risk Assessment', desc: 'The cybersecurity risk to the organization, assets, and individuals is understood by the organization.' },
  { code: 'ID.IM', title: 'Improvement', desc: 'Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified across all CSF Functions.' },
];

// PROTECT Function Categories (5 categories)
const PROTECT_CATEGORIES = [
  { code: 'PR.AA', title: 'Identity Management, Authentication, and Access Control', desc: 'Access to physical and logical assets is limited to authorized users, services, and hardware and is managed commensurate with the assessed risk of unauthorized access.' },
  { code: 'PR.AT', title: 'Awareness and Training', desc: 'The organization\'s personnel are provided with cybersecurity awareness and training so that they can perform their cybersecurity-related tasks.' },
  { code: 'PR.DS', title: 'Data Security', desc: 'Data are managed consistent with the organization\'s risk strategy to protect the confidentiality, integrity, and availability of information.' },
  { code: 'PR.PS', title: 'Platform Security', desc: 'The hardware, software (e.g., firmware, operating systems, applications), and services of physical and virtual platforms are managed consistent with the organization\'s risk strategy to protect their confidentiality, integrity, and availability.' },
  { code: 'PR.IR', title: 'Technology Infrastructure Resilience', desc: 'Security architectures are managed to limit the impact of potential cybersecurity events.' },
];

// DETECT Function Categories (2 categories)
const DETECT_CATEGORIES = [
  { code: 'DE.CM', title: 'Continuous Monitoring', desc: 'Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events.' },
  { code: 'DE.AE', title: 'Adverse Event Analysis', desc: 'Anomalies, indicators of compromise, and other potentially adverse events are analyzed to characterize the events and detect cybersecurity incidents.' },
];

// RESPOND Function Categories (4 categories)
const RESPOND_CATEGORIES = [
  { code: 'RS.MA', title: 'Incident Management', desc: 'Responses to detected cybersecurity incidents are managed.' },
  { code: 'RS.AN', title: 'Incident Analysis', desc: 'Investigations are conducted to ensure effective response and support forensics and recovery activities.' },
  { code: 'RS.CO', title: 'Incident Response Reporting and Communication', desc: 'Response activities are coordinated with internal and external stakeholders as required by laws, regulations, or policies.' },
  { code: 'RS.MI', title: 'Incident Mitigation', desc: 'Activities are performed to prevent expansion of an event and mitigate its effects.' },
];

// RECOVER Function Categories (2 categories)
const RECOVER_CATEGORIES = [
  { code: 'RC.RP', title: 'Incident Recovery Plan Execution', desc: 'Restoration activities are performed to ensure operational availability of systems and services affected by cybersecurity incidents.' },
  { code: 'RC.CO', title: 'Incident Recovery Communication', desc: 'Restoration activities are coordinated with internal and external parties.' },
];

/**
 * Seed NIST CSF 2.0
 */
export async function seedNISTCSF() {
  console.log('📕 Seeding NIST Cybersecurity Framework 2.0...');

  const nistCSFFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'NIST-CSF', version: '2.0' } },
    update: {},
    create: {
      name: 'NIST Cybersecurity Framework',
      shortName: 'NIST-CSF',
      version: '2.0',
      effectiveDate: new Date('2024-02-26'),
      description: 'The NIST Cybersecurity Framework 2.0 provides guidance for reducing cybersecurity risks through a common language and systematic methodology. Includes new GOVERN function and updated for all sectors.',
      category: FrameworkCategory.SECURITY,
      isActive: true,
    },
  });

  // Function 1: GOVERN (GV)
  const governFunction = await prisma.control.create({
    data: {
      code: 'GV',
      title: 'Govern',
      description: 'The organization\'s cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored.',
      frameworkId: nistCSFFramework.id,
      sortOrder: 1,
    },
  });

  for (let i = 0; i < GOVERN_CATEGORIES.length; i++) {
    await prisma.control.create({
      data: {
        code: GOVERN_CATEGORIES[i].code,
        title: GOVERN_CATEGORIES[i].title,
        description: GOVERN_CATEGORIES[i].desc,
        frameworkId: nistCSFFramework.id,
        parentId: governFunction.id,
        sortOrder: i + 1,
      },
    });
  }

  // Function 2: IDENTIFY (ID)
  const identifyFunction = await prisma.control.create({
    data: {
      code: 'ID',
      title: 'Identify',
      description: 'The organization\'s current cybersecurity risks are understood.',
      frameworkId: nistCSFFramework.id,
      sortOrder: 2,
    },
  });

  for (let i = 0; i < IDENTIFY_CATEGORIES.length; i++) {
    await prisma.control.create({
      data: {
        code: IDENTIFY_CATEGORIES[i].code,
        title: IDENTIFY_CATEGORIES[i].title,
        description: IDENTIFY_CATEGORIES[i].desc,
        frameworkId: nistCSFFramework.id,
        parentId: identifyFunction.id,
        sortOrder: i + 1,
      },
    });
  }

  // Function 3: PROTECT (PR)
  const protectFunction = await prisma.control.create({
    data: {
      code: 'PR',
      title: 'Protect',
      description: 'Safeguards to manage the organization\'s cybersecurity risks are used.',
      frameworkId: nistCSFFramework.id,
      sortOrder: 3,
    },
  });

  for (let i = 0; i < PROTECT_CATEGORIES.length; i++) {
    await prisma.control.create({
      data: {
        code: PROTECT_CATEGORIES[i].code,
        title: PROTECT_CATEGORIES[i].title,
        description: PROTECT_CATEGORIES[i].desc,
        frameworkId: nistCSFFramework.id,
        parentId: protectFunction.id,
        sortOrder: i + 1,
      },
    });
  }

  // Function 4: DETECT (DE)
  const detectFunction = await prisma.control.create({
    data: {
      code: 'DE',
      title: 'Detect',
      description: 'Possible cybersecurity attacks and compromises are found and analyzed.',
      frameworkId: nistCSFFramework.id,
      sortOrder: 4,
    },
  });

  for (let i = 0; i < DETECT_CATEGORIES.length; i++) {
    await prisma.control.create({
      data: {
        code: DETECT_CATEGORIES[i].code,
        title: DETECT_CATEGORIES[i].title,
        description: DETECT_CATEGORIES[i].desc,
        frameworkId: nistCSFFramework.id,
        parentId: detectFunction.id,
        sortOrder: i + 1,
      },
    });
  }

  // Function 5: RESPOND (RS)
  const respondFunction = await prisma.control.create({
    data: {
      code: 'RS',
      title: 'Respond',
      description: 'Actions regarding a detected cybersecurity incident are taken.',
      frameworkId: nistCSFFramework.id,
      sortOrder: 5,
    },
  });

  for (let i = 0; i < RESPOND_CATEGORIES.length; i++) {
    await prisma.control.create({
      data: {
        code: RESPOND_CATEGORIES[i].code,
        title: RESPOND_CATEGORIES[i].title,
        description: RESPOND_CATEGORIES[i].desc,
        frameworkId: nistCSFFramework.id,
        parentId: respondFunction.id,
        sortOrder: i + 1,
      },
    });
  }

  // Function 6: RECOVER (RC)
  const recoverFunction = await prisma.control.create({
    data: {
      code: 'RC',
      title: 'Recover',
      description: 'Assets and operations affected by a cybersecurity incident are restored.',
      frameworkId: nistCSFFramework.id,
      sortOrder: 6,
    },
  });

  for (let i = 0; i < RECOVER_CATEGORIES.length; i++) {
    await prisma.control.create({
      data: {
        code: RECOVER_CATEGORIES[i].code,
        title: RECOVER_CATEGORIES[i].title,
        description: RECOVER_CATEGORIES[i].desc,
        frameworkId: nistCSFFramework.id,
        parentId: recoverFunction.id,
        sortOrder: i + 1,
      },
    });
  }

  console.log('  ✅ NIST CSF 2.0 seeded (6 functions, 22 categories)');
  return nistCSFFramework;
}

/**
 * Seed control mappings from NIST CSF 2.0 to existing frameworks
 */
export async function seedNISTCSFMappings() {
  console.log('🔗 Creating NIST CSF 2.0 mappings to other frameworks...');

  // Get framework references
  const nistCSF = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'NIST-CSF', version: '2.0' } },
  });
  const nistAIRMF = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'NIST-AI-RMF', version: '1.0' } },
  });
  const iso42001 = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'ISO-42001', version: '2023' } },
  });

  if (!nistCSF) {
    console.log('  ⚠️  NIST CSF 2.0 not found, skipping mappings');
    return;
  }

  // NIST CSF 2.0 → NIST AI RMF 1.0 mappings
  if (nistAIRMF) {
    const csfToAIRMFMappings = [
      { csf: 'GV', airm: 'GOVERN', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both frameworks emphasize governance as foundational - GOVERN function aligns naturally across both standards' },
      { csf: 'GV.OC', airm: 'GOVERN-1', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Organizational context in CSF aligns with policies and processes in AI RMF' },
      { csf: 'GV.RM', airm: 'GOVERN-1.4', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Risk management strategy directly maps to risk management process outcomes' },
      { csf: 'GV.RR', airm: 'GOVERN-2.1', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Roles and responsibilities are equivalent in both frameworks' },
      { csf: 'GV.SC', airm: 'GOVERN-6', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Supply chain risk management is equivalent across both frameworks' },
      { csf: 'ID', airm: 'MAP', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'IDENTIFY function focuses on understanding risks similar to MAP\'s context establishment' },
      { csf: 'ID.AM', airm: 'MAP-1', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Asset management relates to context and system understanding' },
      { csf: 'ID.RA', airm: 'MAP-4', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Risk assessment is core to both IDENTIFY and MAP functions' },
      { csf: 'PR', airm: 'MANAGE', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'PROTECT safeguards align with MANAGE risk mitigation activities' },
      { csf: 'DE.CM', airm: 'MEASURE-3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Continuous monitoring relates to risk tracking over time' },
    ];

    for (const mapping of csfToAIRMFMappings) {
      const csfControl = await prisma.control.findFirst({
        where: { frameworkId: nistCSF.id, code: mapping.csf },
      });
      const airmControl = await prisma.control.findFirst({
        where: { frameworkId: nistAIRMF.id, code: mapping.airm },
      });

      if (csfControl && airmControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: csfControl.id,
            targetControlId: airmControl.id,
            sourceFrameworkId: nistCSF.id,
            targetFrameworkId: nistAIRMF.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ NIST CSF 2.0 → NIST AI RMF mappings created');
  }

  // NIST CSF 2.0 → ISO 42001 mappings
  if (iso42001) {
    const csfToISOMappings = [
      { csf: 'GV.OC', iso: 'A.2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Organizational context aligns with AI policy development' },
      { csf: 'GV.RR', iso: 'A.3', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Roles and responsibilities are equivalent in both standards' },
      { csf: 'ID.AM', iso: 'A.4', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Asset management relates to resource documentation' },
      { csf: 'ID.RA', iso: 'A.5', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Risk assessment maps directly to impact assessment processes' },
      { csf: 'PR.DS', iso: 'A.7', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Data security is core to both frameworks' },
      { csf: 'PR.AA', iso: 'A.9', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Access control relates to responsible use and human oversight' },
      { csf: 'GV.SC', iso: 'A.10', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Supply chain management is equivalent across both standards' },
    ];

    for (const mapping of csfToISOMappings) {
      const csfControl = await prisma.control.findFirst({
        where: { frameworkId: nistCSF.id, code: mapping.csf },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso42001.id, code: mapping.iso },
      });

      if (csfControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: csfControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: nistCSF.id,
            targetFrameworkId: iso42001.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ NIST CSF 2.0 → ISO 42001 mappings created');
  }

  // NIST CSF 2.0 → CSA AICM mappings (if exists)
  const csaAICM = await prisma.framework.findFirst({
    where: { shortName: 'CSA-AICM' },
  });

  if (csaAICM) {
    const csfToCSAMappings = [
      { csf: 'GV.SC', csa: 'TCM-01', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Supply chain security is core to both frameworks' },
      { csf: 'PR.AA', csa: 'IAM-01', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Identity and access management aligns across frameworks' },
      { csf: 'PR.DS', csa: 'DSP-01', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Data security and protection are equivalent' },
      { csf: 'DE.CM', csa: 'SEF-01', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Continuous monitoring relates to security event monitoring' },
      { csf: 'RS.MA', csa: 'IRP-01', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Incident management is core to both frameworks' },
    ];

    for (const mapping of csfToCSAMappings) {
      const csfControl = await prisma.control.findFirst({
        where: { frameworkId: nistCSF.id, code: mapping.csf },
      });
      const csaControl = await prisma.control.findFirst({
        where: { frameworkId: csaAICM.id, code: mapping.csa },
      });

      if (csfControl && csaControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: csfControl.id,
            targetControlId: csaControl.id,
            sourceFrameworkId: nistCSF.id,
            targetFrameworkId: csaAICM.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ NIST CSF 2.0 → CSA AICM mappings created');
  }

  console.log('  ✅ NIST CSF 2.0 mappings completed');
}
