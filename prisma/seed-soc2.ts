/**
 * SOC 2 Type II Trust Service Criteria Seed Script
 * AICPA Service Organization Control reporting framework
 *
 * Source: AICPA Trust Services Criteria (2017, updated 2022)
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const SOC2_CATEGORIES = [
  {
    code: 'CC',
    title: 'Common Criteria (Security)',
    description: 'Security criteria applicable to all SOC 2 engagements.',
    controls: [
      { code: 'CC1.1', title: 'COSO Principle 1', description: 'The entity demonstrates a commitment to integrity and ethical values.' },
      { code: 'CC1.2', title: 'COSO Principle 2', description: 'The board of directors demonstrates independence from management and exercises oversight.' },
      { code: 'CC1.3', title: 'COSO Principle 3', description: 'Management establishes structures, reporting lines, and appropriate authorities and responsibilities.' },
      { code: 'CC1.4', title: 'COSO Principle 4', description: 'The entity demonstrates commitment to attract, develop, and retain competent individuals.' },
      { code: 'CC1.5', title: 'COSO Principle 5', description: 'The entity holds individuals accountable for their internal control responsibilities.' },
      { code: 'CC2.1', title: 'COSO Principle 13', description: 'The entity obtains or generates and uses relevant, quality information.' },
      { code: 'CC2.2', title: 'COSO Principle 14', description: 'The entity internally communicates information necessary to support functioning of internal control.' },
      { code: 'CC2.3', title: 'COSO Principle 15', description: 'The entity communicates with external parties regarding matters affecting functioning of internal control.' },
      { code: 'CC3.1', title: 'COSO Principle 6', description: 'The entity specifies objectives with sufficient clarity to enable identification and assessment of risks.' },
      { code: 'CC3.2', title: 'COSO Principle 7', description: 'The entity identifies risks to the achievement of its objectives and analyzes risks.' },
      { code: 'CC3.3', title: 'COSO Principle 8', description: 'The entity considers the potential for fraud in assessing risks.' },
      { code: 'CC3.4', title: 'COSO Principle 9', description: 'The entity identifies and assesses changes that could significantly impact internal control.' },
      { code: 'CC4.1', title: 'COSO Principle 16', description: 'The entity selects, develops, and performs ongoing evaluations of controls.' },
      { code: 'CC4.2', title: 'COSO Principle 17', description: 'The entity evaluates and communicates internal control deficiencies timely.' },
      { code: 'CC5.1', title: 'COSO Principle 10', description: 'The entity selects and develops control activities that contribute to risk mitigation.' },
      { code: 'CC5.2', title: 'COSO Principle 11', description: 'The entity selects and develops general controls over technology.' },
      { code: 'CC5.3', title: 'COSO Principle 12', description: 'The entity deploys control activities through policies and procedures.' },
      { code: 'CC6.1', title: 'Logical and Physical Access', description: 'The entity implements logical access security software, infrastructure, and architectures.' },
      { code: 'CC6.2', title: 'User Registration and Authorization', description: 'The entity registers and authorizes new users.' },
      { code: 'CC6.3', title: 'User Access Removal', description: 'The entity removes access to protected information assets when appropriate.' },
      { code: 'CC6.6', title: 'External Threats Protection', description: 'The entity implements controls to protect against threats from outside.' },
      { code: 'CC6.7', title: 'Data Transmission Protection', description: 'The entity restricts the transmission, movement, and removal of information.' },
      { code: 'CC6.8', title: 'Malware Prevention', description: 'The entity implements controls to prevent or detect and act upon introduction of malicious software.' },
      { code: 'CC7.1', title: 'Vulnerability Detection', description: 'The entity uses detection and monitoring procedures to identify security events.' },
      { code: 'CC7.2', title: 'Security Monitoring', description: 'The entity monitors system components for anomalies and indicators of compromise.' },
      { code: 'CC7.3', title: 'Security Event Evaluation', description: 'The entity evaluates security events to determine whether they could or have resulted in failure.' },
      { code: 'CC7.4', title: 'Security Incident Response', description: 'The entity responds to identified security incidents by executing defined procedures.' },
      { code: 'CC7.5', title: 'Incident Recovery', description: 'The entity identifies, develops, and implements activities to recover from identified security incidents.' },
      { code: 'CC8.1', title: 'Change Management', description: 'The entity authorizes, designs, develops, configures, documents, tests, approves, and implements changes.' },
      { code: 'CC9.1', title: 'Risk Mitigation', description: 'The entity identifies, selects, and develops risk mitigation activities.' },
      { code: 'CC9.2', title: 'Vendor Risk Management', description: 'The entity assesses and manages risks associated with vendors and business partners.' },
    ],
  },
  {
    code: 'A',
    title: 'Availability',
    description: 'The system is available for operation and use as committed or agreed.',
    controls: [
      { code: 'A1.1', title: 'Capacity Management', description: 'The entity maintains, monitors, and evaluates current processing capacity and use.' },
      { code: 'A1.2', title: 'Environmental Protections', description: 'The entity authorizes, designs, develops, implements, operates, approves, maintains, and monitors environmental protections.' },
      { code: 'A1.3', title: 'Recovery Operations', description: 'The entity tests recovery plan procedures supporting system recovery to meet availability objectives.' },
    ],
  },
  {
    code: 'PI',
    title: 'Processing Integrity',
    description: 'System processing is complete, valid, accurate, timely, and authorized.',
    controls: [
      { code: 'PI1.1', title: 'Processing Accuracy', description: 'The entity obtains or generates, uses, and communicates relevant, quality information regarding processing.' },
      { code: 'PI1.2', title: 'Input Controls', description: 'The entity implements policies and procedures over system inputs.' },
      { code: 'PI1.3', title: 'Processing Controls', description: 'The entity implements policies and procedures over system processing.' },
      { code: 'PI1.4', title: 'Output Controls', description: 'The entity implements policies and procedures for output of information.' },
      { code: 'PI1.5', title: 'Error Handling', description: 'The entity implements policies and procedures to store inputs, outputs, and processing records.' },
    ],
  },
  {
    code: 'C',
    title: 'Confidentiality',
    description: 'Information designated as confidential is protected as committed or agreed.',
    controls: [
      { code: 'C1.1', title: 'Confidential Information Identification', description: 'The entity identifies and maintains confidential information to meet confidentiality objectives.' },
      { code: 'C1.2', title: 'Confidential Information Disposal', description: 'The entity disposes of confidential information to meet confidentiality objectives.' },
    ],
  },
  {
    code: 'P',
    title: 'Privacy',
    description: 'Personal information is collected, used, retained, disclosed, and disposed to meet privacy objectives.',
    controls: [
      { code: 'P1.1', title: 'Privacy Notice', description: 'The entity provides notice to data subjects about its privacy practices.' },
      { code: 'P2.1', title: 'Consent for Collection', description: 'The entity communicates choices available regarding collection, use, retention, disclosure, and disposal.' },
      { code: 'P3.1', title: 'Collection Limitation', description: 'Personal information is collected consistent with privacy commitments or requirements.' },
      { code: 'P3.2', title: 'Collection from Third Parties', description: 'For personal information collected from third parties, the entity assesses third-party practices.' },
      { code: 'P4.1', title: 'Use Limitation', description: 'The entity limits the use of personal information to the purposes identified.' },
      { code: 'P4.2', title: 'Retention and Disposal', description: 'The entity retains personal information consistent with objectives and disposes appropriately.' },
      { code: 'P5.1', title: 'Data Subject Access', description: 'The entity grants data subjects access to their personal information for review and update.' },
      { code: 'P5.2', title: 'Correction Requests', description: 'The entity corrects, amends, or appends personal information based on requests.' },
      { code: 'P6.1', title: 'Disclosure Limitation', description: 'The entity discloses personal information to third parties only for identified purposes.' },
      { code: 'P6.2', title: 'Third Party Agreements', description: 'The entity obtains commitments from third parties to handle personal information appropriately.' },
      { code: 'P7.1', title: 'Data Quality', description: 'The entity collects and maintains accurate, up-to-date, complete, and relevant personal information.' },
      { code: 'P8.1', title: 'Complaint Handling', description: 'The entity implements a process for receiving, addressing, resolving, and communicating complaints.' },
    ],
  },
];

export async function seedSOC2() {
  console.log('📘 Seeding SOC 2 Type II Trust Service Criteria...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'SOC2', version: '2022' } },
    update: {},
    create: {
      name: 'SOC 2 Trust Service Criteria',
      shortName: 'SOC2',
      version: '2022',
      effectiveDate: new Date('2022-01-01'),
      description: 'AICPA Trust Services Criteria for SaaS and cloud service providers. Covers security, availability, processing integrity, confidentiality, and privacy.',
      category: FrameworkCategory.COMPLIANCE,
      isActive: true,
    },
  });

  for (let i = 0; i < SOC2_CATEGORIES.length; i++) {
    const category = SOC2_CATEGORIES[i];
    const categoryControl = await prisma.control.create({
      data: {
        code: category.code,
        title: category.title,
        description: category.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < category.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: category.controls[j].code,
          title: category.controls[j].title,
          description: category.controls[j].description,
          frameworkId: framework.id,
          parentId: categoryControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ SOC 2 Type II seeded (5 categories, 54 criteria)');
  return framework;
}

export async function seedSOC2Mappings() {
  console.log('🔗 Creating SOC 2 cross-framework mappings...');

  const soc2 = await prisma.framework.findFirst({
    where: { shortName: 'SOC2', version: '2022' },
  });
  const iso27001 = await prisma.framework.findFirst({
    where: { shortName: 'ISO-27001', version: '2022' },
  });
  const nist80053 = await prisma.framework.findFirst({
    where: { shortName: 'NIST-800-53', version: '5' },
  });

  if (!soc2) {
    console.log('  ⚠️  SOC 2 framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // SOC 2 to ISO 27001 mappings
  if (iso27001) {
    const isoMappings = [
      { soc: 'CC6.1', iso: 'A.9', reason: 'Logical access to access control' },
      { soc: 'CC7.1', iso: 'A.12', reason: 'Vulnerability detection to operations security' },
      { soc: 'CC7.4', iso: 'A.16', reason: 'Incident response alignment' },
      { soc: 'CC8.1', iso: 'A.14', reason: 'Change management to system development' },
      { soc: 'CC9.2', iso: 'A.15', reason: 'Vendor risk to supplier relationships' },
    ];

    for (const mapping of isoMappings) {
      const socControl = await prisma.control.findFirst({
        where: { frameworkId: soc2.id, code: mapping.soc },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso27001.id, code: mapping.iso },
      });

      if (socControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: socControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: soc2.id,
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

  // SOC 2 to NIST 800-53 mappings
  if (nist80053) {
    const nistMappings = [
      { soc: 'CC', iso: 'AC', reason: 'Common criteria security to access control' },
      { soc: 'CC', iso: 'AU', reason: 'Security monitoring to audit' },
      { soc: 'A', iso: 'CP', reason: 'Availability to contingency planning' },
      { soc: 'PI', iso: 'SI', reason: 'Processing integrity to system integrity' },
    ];

    for (const mapping of nistMappings) {
      const socControl = await prisma.control.findFirst({
        where: { frameworkId: soc2.id, code: mapping.soc },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nist80053.id, code: mapping.iso },
      });

      if (socControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: socControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: soc2.id,
            targetFrameworkId: nist80053.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} SOC 2 cross-framework mappings`);
}
