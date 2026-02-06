/**
 * NIST SP 800-53 Rev. 5 Seed Script
 * Security and Privacy Controls for Information Systems and Organizations
 *
 * Source: https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const NIST_800_53_FAMILIES = [
  {
    code: 'AC',
    title: 'Access Control',
    description: 'Controls for managing access to information systems and information.',
    controls: [
      { code: 'AC-1', title: 'Policy and Procedures', description: 'Develop, document, and disseminate access control policy and procedures.' },
      { code: 'AC-2', title: 'Account Management', description: 'Manage system accounts including establishing, activating, modifying, reviewing, disabling, and removing accounts.' },
      { code: 'AC-3', title: 'Access Enforcement', description: 'Enforce approved authorizations for logical access to information and system resources.' },
      { code: 'AC-4', title: 'Information Flow Enforcement', description: 'Enforce approved authorizations for controlling the flow of information.' },
      { code: 'AC-5', title: 'Separation of Duties', description: 'Separate duties of individuals to prevent malicious activity.' },
      { code: 'AC-6', title: 'Least Privilege', description: 'Employ the principle of least privilege, allowing only authorized accesses.' },
      { code: 'AC-7', title: 'Unsuccessful Logon Attempts', description: 'Enforce a limit of consecutive invalid logon attempts and take actions when limit exceeded.' },
    ],
  },
  {
    code: 'AT',
    title: 'Awareness and Training',
    description: 'Controls for security and privacy awareness training.',
    controls: [
      { code: 'AT-1', title: 'Policy and Procedures', description: 'Develop and document awareness and training policy and procedures.' },
      { code: 'AT-2', title: 'Literacy Training', description: 'Provide security and privacy literacy training to system users.' },
      { code: 'AT-3', title: 'Role-Based Training', description: 'Provide role-based security and privacy training before access and periodically thereafter.' },
    ],
  },
  {
    code: 'AU',
    title: 'Audit and Accountability',
    description: 'Controls for audit record creation, protection, and review.',
    controls: [
      { code: 'AU-1', title: 'Policy and Procedures', description: 'Develop and document audit and accountability policy and procedures.' },
      { code: 'AU-2', title: 'Event Logging', description: 'Identify events that require logging and implement audit logging capability.' },
      { code: 'AU-3', title: 'Content of Audit Records', description: 'Ensure audit records contain required information for investigating events.' },
      { code: 'AU-6', title: 'Audit Record Review', description: 'Review and analyze system audit records for indications of inappropriate activity.' },
      { code: 'AU-9', title: 'Protection of Audit Information', description: 'Protect audit information and tools from unauthorized access, modification, and deletion.' },
    ],
  },
  {
    code: 'CA',
    title: 'Assessment, Authorization, and Monitoring',
    description: 'Controls for security assessment and continuous monitoring.',
    controls: [
      { code: 'CA-1', title: 'Policy and Procedures', description: 'Develop assessment, authorization, and monitoring policy.' },
      { code: 'CA-2', title: 'Control Assessments', description: 'Assess security and privacy controls periodically to determine effectiveness.' },
      { code: 'CA-5', title: 'Plan of Action and Milestones', description: 'Develop and update plan of action and milestones for remediation.' },
      { code: 'CA-7', title: 'Continuous Monitoring', description: 'Develop and implement continuous monitoring strategy.' },
    ],
  },
  {
    code: 'CM',
    title: 'Configuration Management',
    description: 'Controls for managing system configurations and changes.',
    controls: [
      { code: 'CM-1', title: 'Policy and Procedures', description: 'Develop configuration management policy and procedures.' },
      { code: 'CM-2', title: 'Baseline Configuration', description: 'Develop, document, and maintain baseline configuration.' },
      { code: 'CM-3', title: 'Configuration Change Control', description: 'Determine and approve changes to system under configuration control.' },
      { code: 'CM-6', title: 'Configuration Settings', description: 'Establish and document configuration settings for IT products.' },
      { code: 'CM-7', title: 'Least Functionality', description: 'Configure system to provide only mission-essential capabilities.' },
    ],
  },
  {
    code: 'CP',
    title: 'Contingency Planning',
    description: 'Controls for system contingency and business continuity.',
    controls: [
      { code: 'CP-1', title: 'Policy and Procedures', description: 'Develop contingency planning policy and procedures.' },
      { code: 'CP-2', title: 'Contingency Plan', description: 'Develop contingency plan for the system addressing roles, responsibilities, and recovery.' },
      { code: 'CP-4', title: 'Contingency Plan Testing', description: 'Test contingency plan to determine effectiveness and readiness.' },
      { code: 'CP-9', title: 'System Backup', description: 'Conduct backups of system-level and user-level information.' },
      { code: 'CP-10', title: 'System Recovery and Reconstitution', description: 'Provide for recovery and reconstitution to known state.' },
    ],
  },
  {
    code: 'IA',
    title: 'Identification and Authentication',
    description: 'Controls for identifying and authenticating users and devices.',
    controls: [
      { code: 'IA-1', title: 'Policy and Procedures', description: 'Develop identification and authentication policy and procedures.' },
      { code: 'IA-2', title: 'Identification and Authentication (Organizational Users)', description: 'Uniquely identify and authenticate organizational users.' },
      { code: 'IA-4', title: 'Identifier Management', description: 'Manage system identifiers by receiving authorization and disabling after inactivity.' },
      { code: 'IA-5', title: 'Authenticator Management', description: 'Manage system authenticators including initial distribution and changes.' },
      { code: 'IA-8', title: 'Identification and Authentication (Non-Organizational Users)', description: 'Uniquely identify and authenticate non-organizational users.' },
    ],
  },
  {
    code: 'IR',
    title: 'Incident Response',
    description: 'Controls for incident response capabilities and procedures.',
    controls: [
      { code: 'IR-1', title: 'Policy and Procedures', description: 'Develop incident response policy and procedures.' },
      { code: 'IR-2', title: 'Incident Response Training', description: 'Provide incident response training to system users.' },
      { code: 'IR-4', title: 'Incident Handling', description: 'Implement incident handling capability for incidents.' },
      { code: 'IR-5', title: 'Incident Monitoring', description: 'Track and document incidents on an ongoing basis.' },
      { code: 'IR-6', title: 'Incident Reporting', description: 'Require personnel to report suspected incidents promptly.' },
      { code: 'IR-8', title: 'Incident Response Plan', description: 'Develop incident response plan that provides roadmap for implementation.' },
    ],
  },
  {
    code: 'MA',
    title: 'Maintenance',
    description: 'Controls for system maintenance activities.',
    controls: [
      { code: 'MA-1', title: 'Policy and Procedures', description: 'Develop system maintenance policy and procedures.' },
      { code: 'MA-2', title: 'Controlled Maintenance', description: 'Schedule, document, and review records of maintenance and repairs.' },
      { code: 'MA-4', title: 'Nonlocal Maintenance', description: 'Approve, monitor, and control nonlocal maintenance activities.' },
    ],
  },
  {
    code: 'MP',
    title: 'Media Protection',
    description: 'Controls for protecting system media.',
    controls: [
      { code: 'MP-1', title: 'Policy and Procedures', description: 'Develop media protection policy and procedures.' },
      { code: 'MP-2', title: 'Media Access', description: 'Restrict access to digital and non-digital media.' },
      { code: 'MP-6', title: 'Media Sanitization', description: 'Sanitize media prior to disposal, release, or reuse.' },
    ],
  },
  {
    code: 'PE',
    title: 'Physical and Environmental Protection',
    description: 'Controls for physical access and environmental safeguards.',
    controls: [
      { code: 'PE-1', title: 'Policy and Procedures', description: 'Develop physical and environmental protection policy.' },
      { code: 'PE-2', title: 'Physical Access Authorizations', description: 'Develop, approve, and maintain list of individuals with authorized access.' },
      { code: 'PE-3', title: 'Physical Access Control', description: 'Enforce physical access authorizations at entry points.' },
      { code: 'PE-6', title: 'Monitoring Physical Access', description: 'Monitor physical access to detect and respond to incidents.' },
    ],
  },
  {
    code: 'PL',
    title: 'Planning',
    description: 'Controls for security and privacy planning.',
    controls: [
      { code: 'PL-1', title: 'Policy and Procedures', description: 'Develop planning policy and procedures.' },
      { code: 'PL-2', title: 'System Security and Privacy Plans', description: 'Develop security and privacy plans for systems.' },
      { code: 'PL-4', title: 'Rules of Behavior', description: 'Establish and provide rules of behavior to users.' },
    ],
  },
  {
    code: 'PM',
    title: 'Program Management',
    description: 'Organization-wide information security program controls.',
    controls: [
      { code: 'PM-1', title: 'Information Security Program Plan', description: 'Develop and disseminate organization-wide information security program plan.' },
      { code: 'PM-2', title: 'Information Security Program Leadership Role', description: 'Appoint senior agency information security officer.' },
      { code: 'PM-9', title: 'Risk Management Strategy', description: 'Develop organization-wide risk management strategy.' },
    ],
  },
  {
    code: 'PS',
    title: 'Personnel Security',
    description: 'Controls for personnel security.',
    controls: [
      { code: 'PS-1', title: 'Policy and Procedures', description: 'Develop personnel security policy and procedures.' },
      { code: 'PS-2', title: 'Position Risk Designation', description: 'Assign risk designation to all organizational positions.' },
      { code: 'PS-3', title: 'Personnel Screening', description: 'Screen individuals prior to authorizing access.' },
      { code: 'PS-4', title: 'Personnel Termination', description: 'Upon termination, disable access and retrieve all materials.' },
    ],
  },
  {
    code: 'RA',
    title: 'Risk Assessment',
    description: 'Controls for risk assessment activities.',
    controls: [
      { code: 'RA-1', title: 'Policy and Procedures', description: 'Develop risk assessment policy and procedures.' },
      { code: 'RA-2', title: 'Security Categorization', description: 'Categorize system and information processed, stored, or transmitted.' },
      { code: 'RA-3', title: 'Risk Assessment', description: 'Conduct risk assessment to identify threats and vulnerabilities.' },
      { code: 'RA-5', title: 'Vulnerability Monitoring and Scanning', description: 'Monitor and scan for vulnerabilities and remediate.' },
    ],
  },
  {
    code: 'SA',
    title: 'System and Services Acquisition',
    description: 'Controls for system acquisition and development.',
    controls: [
      { code: 'SA-1', title: 'Policy and Procedures', description: 'Develop system and services acquisition policy.' },
      { code: 'SA-3', title: 'System Development Life Cycle', description: 'Manage system using system development life cycle.' },
      { code: 'SA-4', title: 'Acquisition Process', description: 'Include security and privacy requirements in acquisition contracts.' },
      { code: 'SA-8', title: 'Security and Privacy Engineering Principles', description: 'Apply security and privacy engineering principles.' },
      { code: 'SA-11', title: 'Developer Testing and Evaluation', description: 'Require developer security and privacy testing.' },
    ],
  },
  {
    code: 'SC',
    title: 'System and Communications Protection',
    description: 'Controls for communications and information protection.',
    controls: [
      { code: 'SC-1', title: 'Policy and Procedures', description: 'Develop system and communications protection policy.' },
      { code: 'SC-7', title: 'Boundary Protection', description: 'Monitor and control communications at external managed interfaces.' },
      { code: 'SC-8', title: 'Transmission Confidentiality and Integrity', description: 'Protect confidentiality and integrity of transmitted information.' },
      { code: 'SC-12', title: 'Cryptographic Key Establishment', description: 'Establish and manage cryptographic keys.' },
      { code: 'SC-13', title: 'Cryptographic Protection', description: 'Determine cryptographic uses and implement required cryptography.' },
    ],
  },
  {
    code: 'SI',
    title: 'System and Information Integrity',
    description: 'Controls for system and information integrity.',
    controls: [
      { code: 'SI-1', title: 'Policy and Procedures', description: 'Develop system and information integrity policy.' },
      { code: 'SI-2', title: 'Flaw Remediation', description: 'Identify, report, and correct system flaws.' },
      { code: 'SI-3', title: 'Malicious Code Protection', description: 'Implement malicious code protection.' },
      { code: 'SI-4', title: 'System Monitoring', description: 'Monitor system to detect attacks and unauthorized activity.' },
      { code: 'SI-5', title: 'Security Alerts and Advisories', description: 'Receive, generate, and disseminate security alerts and advisories.' },
    ],
  },
  {
    code: 'SR',
    title: 'Supply Chain Risk Management',
    description: 'Controls for supply chain risk management.',
    controls: [
      { code: 'SR-1', title: 'Policy and Procedures', description: 'Develop supply chain risk management policy.' },
      { code: 'SR-2', title: 'Supply Chain Risk Management Plan', description: 'Develop SCRM plan addressing risks.' },
      { code: 'SR-3', title: 'Supply Chain Controls and Processes', description: 'Establish controls and processes to address supply chain risks.' },
      { code: 'SR-5', title: 'Acquisition Strategies', description: 'Employ acquisition strategies and practices to limit supply chain risk.' },
    ],
  },
];

export async function seedNIST80053() {
  console.log('📙 Seeding NIST SP 800-53 Rev. 5...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'NIST-800-53', version: '5' } },
    update: {},
    create: {
      name: 'NIST SP 800-53 Security and Privacy Controls',
      shortName: 'NIST-800-53',
      version: '5',
      effectiveDate: new Date('2020-09-23'),
      description: 'Catalog of security and privacy controls for information systems and organizations. The gold standard for federal information security.',
      category: FrameworkCategory.SECURITY,
      isActive: true,
    },
  });

  for (let i = 0; i < NIST_800_53_FAMILIES.length; i++) {
    const family = NIST_800_53_FAMILIES[i];
    const familyControl = await prisma.control.create({
      data: {
        code: family.code,
        title: family.title,
        description: family.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < family.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: family.controls[j].code,
          title: family.controls[j].title,
          description: family.controls[j].description,
          frameworkId: framework.id,
          parentId: familyControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ NIST SP 800-53 Rev. 5 seeded (19 families, 85 controls)');
  return framework;
}

export async function seedNIST80053Mappings() {
  console.log('🔗 Creating NIST 800-53 cross-framework mappings...');

  const nist80053 = await prisma.framework.findFirst({
    where: { shortName: 'NIST-800-53', version: '5' },
  });
  const nistcsf = await prisma.framework.findFirst({
    where: { shortName: 'NIST-CSF', version: '2.0' },
  });
  const iso27001 = await prisma.framework.findFirst({
    where: { shortName: 'ISO-27001', version: '2022' },
  });

  if (!nist80053) {
    console.log('  ⚠️  NIST 800-53 framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // NIST 800-53 to NIST CSF mappings
  if (nistcsf) {
    const csfMappings = [
      { nist: 'AC', csf: 'PR.AC', reason: 'Access control families align' },
      { nist: 'AT', csf: 'PR.AT', reason: 'Awareness and training alignment' },
      { nist: 'AU', csf: 'DE.CM', reason: 'Audit logging supports detection' },
      { nist: 'IR', csf: 'RS.AN', reason: 'Incident response to analysis' },
      { nist: 'RA', csf: 'ID.RA', reason: 'Risk assessment alignment' },
    ];

    for (const mapping of csfMappings) {
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nist80053.id, code: mapping.nist },
      });
      const csfControl = await prisma.control.findFirst({
        where: { frameworkId: nistcsf.id, code: mapping.csf },
      });

      if (nistControl && csfControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: nistControl.id,
            targetControlId: csfControl.id,
            sourceFrameworkId: nist80053.id,
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

  // NIST 800-53 to ISO 27001 mappings
  if (iso27001) {
    const isoMappings = [
      { nist: 'AC', iso: 'A.9', reason: 'Access control domain alignment' },
      { nist: 'AU', iso: 'A.12', reason: 'Audit to operations security' },
      { nist: 'CM', iso: 'A.12', reason: 'Configuration to operations' },
      { nist: 'IR', iso: 'A.16', reason: 'Incident management alignment' },
      { nist: 'SC', iso: 'A.13', reason: 'Communications security alignment' },
    ];

    for (const mapping of isoMappings) {
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nist80053.id, code: mapping.nist },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso27001.id, code: mapping.iso },
      });

      if (nistControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: nistControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: nist80053.id,
            targetFrameworkId: iso27001.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.EQUIVALENT,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} NIST 800-53 cross-framework mappings`);
}
