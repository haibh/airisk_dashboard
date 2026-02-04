/**
 * ISO/IEC 27001:2022 Seed Script
 * Seeds ISO 27001:2022 framework with 4 Annex A themes and 93 controls
 * Released: October 2022
 * Source: https://www.iso.org/standard/27001
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ISO 27001:2022 Annex A Controls - 4 themes with 93 controls
 */
const ISO_CONTROLS = [
  { code: 'A.5.1', title: 'Policies for information security', theme: 'A.5' },
  { code: 'A.5.2', title: 'Information security roles and responsibilities', theme: 'A.5' },
  { code: 'A.5.3', title: 'Segregation of duties', theme: 'A.5' },
  { code: 'A.5.4', title: 'Management responsibilities', theme: 'A.5' },
  { code: 'A.5.5', title: 'Contact with authorities', theme: 'A.5' },
  { code: 'A.5.6', title: 'Contact with special interest groups', theme: 'A.5' },
  { code: 'A.5.7', title: 'Threat intelligence', theme: 'A.5' },
  { code: 'A.5.8', title: 'Information security in project management', theme: 'A.5' },
  { code: 'A.5.9', title: 'Inventory of information and other associated assets', theme: 'A.5' },
  { code: 'A.5.10', title: 'Acceptable use of information and other associated assets', theme: 'A.5' },
  { code: 'A.5.11', title: 'Return of assets', theme: 'A.5' },
  { code: 'A.5.12', title: 'Classification of information', theme: 'A.5' },
  { code: 'A.5.13', title: 'Labelling of information', theme: 'A.5' },
  { code: 'A.5.14', title: 'Information transfer', theme: 'A.5' },
  { code: 'A.5.15', title: 'Access control', theme: 'A.5' },
  { code: 'A.5.16', title: 'Identity management', theme: 'A.5' },
  { code: 'A.5.17', title: 'Authentication information', theme: 'A.5' },
  { code: 'A.5.18', title: 'Access rights', theme: 'A.5' },
  { code: 'A.5.19', title: 'Information security in supplier relationships', theme: 'A.5' },
  { code: 'A.5.20', title: 'Addressing information security within supplier agreements', theme: 'A.5' },
  { code: 'A.5.21', title: 'Managing information security in the ICT supply chain', theme: 'A.5' },
  { code: 'A.5.22', title: 'Monitoring, review and change management of supplier services', theme: 'A.5' },
  { code: 'A.5.23', title: 'Information security for use of cloud services', theme: 'A.5' },
  { code: 'A.5.24', title: 'Information security incident management planning and preparation', theme: 'A.5' },
  { code: 'A.5.25', title: 'Assessment and decision on information security events', theme: 'A.5' },
  { code: 'A.5.26', title: 'Response to information security incidents', theme: 'A.5' },
  { code: 'A.5.27', title: 'Learning from information security incidents', theme: 'A.5' },
  { code: 'A.5.28', title: 'Collection of evidence', theme: 'A.5' },
  { code: 'A.5.29', title: 'Information security during disruption', theme: 'A.5' },
  { code: 'A.5.30', title: 'ICT readiness for business continuity', theme: 'A.5' },
  { code: 'A.5.31', title: 'Legal, statutory, regulatory and contractual requirements', theme: 'A.5' },
  { code: 'A.5.32', title: 'Intellectual property rights', theme: 'A.5' },
  { code: 'A.5.33', title: 'Protection of records', theme: 'A.5' },
  { code: 'A.5.34', title: 'Privacy and protection of PII', theme: 'A.5' },
  { code: 'A.5.35', title: 'Independent review of information security', theme: 'A.5' },
  { code: 'A.5.36', title: 'Compliance with policies, rules and standards for information security', theme: 'A.5' },
  { code: 'A.5.37', title: 'Documented operating procedures', theme: 'A.5' },
  { code: 'A.6.1', title: 'Screening', theme: 'A.6' },
  { code: 'A.6.2', title: 'Terms and conditions of employment', theme: 'A.6' },
  { code: 'A.6.3', title: 'Information security awareness, education and training', theme: 'A.6' },
  { code: 'A.6.4', title: 'Disciplinary process', theme: 'A.6' },
  { code: 'A.6.5', title: 'Responsibilities after termination or change of employment', theme: 'A.6' },
  { code: 'A.6.6', title: 'Confidentiality or non-disclosure agreements', theme: 'A.6' },
  { code: 'A.6.7', title: 'Remote working', theme: 'A.6' },
  { code: 'A.6.8', title: 'Information security event reporting', theme: 'A.6' },
  { code: 'A.7.1', title: 'Physical security perimeters', theme: 'A.7' },
  { code: 'A.7.2', title: 'Physical entry', theme: 'A.7' },
  { code: 'A.7.3', title: 'Securing offices, rooms and facilities', theme: 'A.7' },
  { code: 'A.7.4', title: 'Physical security monitoring', theme: 'A.7' },
  { code: 'A.7.5', title: 'Protecting against physical and environmental threats', theme: 'A.7' },
  { code: 'A.7.6', title: 'Working in secure areas', theme: 'A.7' },
  { code: 'A.7.7', title: 'Clear desk and clear screen', theme: 'A.7' },
  { code: 'A.7.8', title: 'Equipment siting and protection', theme: 'A.7' },
  { code: 'A.7.9', title: 'Security of assets off-premises', theme: 'A.7' },
  { code: 'A.7.10', title: 'Storage media', theme: 'A.7' },
  { code: 'A.7.11', title: 'Supporting utilities', theme: 'A.7' },
  { code: 'A.7.12', title: 'Cabling security', theme: 'A.7' },
  { code: 'A.7.13', title: 'Equipment maintenance', theme: 'A.7' },
  { code: 'A.7.14', title: 'Secure disposal or re-use of equipment', theme: 'A.7' },
  { code: 'A.8.1', title: 'User endpoint devices', theme: 'A.8' },
  { code: 'A.8.2', title: 'Privileged access rights', theme: 'A.8' },
  { code: 'A.8.3', title: 'Information access restriction', theme: 'A.8' },
  { code: 'A.8.4', title: 'Access to source code', theme: 'A.8' },
  { code: 'A.8.5', title: 'Secure authentication', theme: 'A.8' },
  { code: 'A.8.6', title: 'Capacity management', theme: 'A.8' },
  { code: 'A.8.7', title: 'Protection against malware', theme: 'A.8' },
  { code: 'A.8.8', title: 'Management of technical vulnerabilities', theme: 'A.8' },
  { code: 'A.8.9', title: 'Configuration management', theme: 'A.8' },
  { code: 'A.8.10', title: 'Information deletion', theme: 'A.8' },
  { code: 'A.8.11', title: 'Data masking', theme: 'A.8' },
  { code: 'A.8.12', title: 'Data leakage prevention', theme: 'A.8' },
  { code: 'A.8.13', title: 'Information backup', theme: 'A.8' },
  { code: 'A.8.14', title: 'Redundancy of information processing facilities', theme: 'A.8' },
  { code: 'A.8.15', title: 'Logging', theme: 'A.8' },
  { code: 'A.8.16', title: 'Monitoring activities', theme: 'A.8' },
  { code: 'A.8.17', title: 'Clock synchronization', theme: 'A.8' },
  { code: 'A.8.18', title: 'Use of privileged utility programs', theme: 'A.8' },
  { code: 'A.8.19', title: 'Installation of software on operational systems', theme: 'A.8' },
  { code: 'A.8.20', title: 'Networks security', theme: 'A.8' },
  { code: 'A.8.21', title: 'Security of network services', theme: 'A.8' },
  { code: 'A.8.22', title: 'Segregation of networks', theme: 'A.8' },
  { code: 'A.8.23', title: 'Web filtering', theme: 'A.8' },
  { code: 'A.8.24', title: 'Use of cryptography', theme: 'A.8' },
  { code: 'A.8.25', title: 'Secure development life cycle', theme: 'A.8' },
  { code: 'A.8.26', title: 'Application security requirements', theme: 'A.8' },
  { code: 'A.8.27', title: 'Secure system architecture and engineering principles', theme: 'A.8' },
  { code: 'A.8.28', title: 'Secure coding', theme: 'A.8' },
  { code: 'A.8.29', title: 'Security testing in development and acceptance', theme: 'A.8' },
  { code: 'A.8.30', title: 'Outsourced development', theme: 'A.8' },
  { code: 'A.8.31', title: 'Separation of development, test and production environments', theme: 'A.8' },
  { code: 'A.8.32', title: 'Change management', theme: 'A.8' },
  { code: 'A.8.33', title: 'Test information', theme: 'A.8' },
  { code: 'A.8.34', title: 'Protection of information systems during audit testing', theme: 'A.8' },
];

const THEMES = {
  'A.5': { title: 'Organizational Controls', description: 'Information security policies, roles, asset management, access control, supplier relationships, incident management, and business continuity.' },
  'A.6': { title: 'People Controls', description: 'Screening, employment terms, security awareness training, and responsibilities during and after employment.' },
  'A.7': { title: 'Physical Controls', description: 'Physical security of facilities, equipment protection, environmental controls, and secure disposal procedures.' },
  'A.8': { title: 'Technological Controls', description: 'Technical security controls including access management, cryptography, secure development, network security, and logging.' },
};

/**
 * Seed ISO 27001:2022
 */
export async function seedISO27001() {
  console.log('🔒 Seeding ISO/IEC 27001:2022...');

  const isoFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'ISO-27001', version: '2022' } },
    update: {},
    create: {
      name: 'ISO/IEC 27001:2022',
      shortName: 'ISO-27001',
      version: '2022',
      effectiveDate: new Date('2022-10-01'),
      description: 'International standard for information security management systems (ISMS)',
      category: FrameworkCategory.SECURITY,
      isActive: true,
    },
  });

  // Create theme parents and controls
  for (const [themeCode, themeData] of Object.entries(THEMES)) {
    const themeParent = await prisma.control.create({
      data: {
        code: themeCode,
        title: themeData.title,
        description: themeData.description,
        frameworkId: isoFramework.id,
        sortOrder: parseInt(themeCode.split('.')[1]),
      },
    });

    // Create controls for this theme
    const themeControls = ISO_CONTROLS.filter(c => c.theme === themeCode);
    for (let i = 0; i < themeControls.length; i++) {
      const control = themeControls[i];
      await prisma.control.create({
        data: {
          code: control.code,
          title: control.title,
          description: `ISO 27001:2022 ${themeData.title} requirement`,
          frameworkId: isoFramework.id,
          parentId: themeParent.id,
          sortOrder: i + 1,
        },
      });
    }
  }

  console.log(`  ✅ ISO 27001:2022 seeded (4 themes, ${ISO_CONTROLS.length} controls)`);
  return isoFramework;
}

/**
 * Create mappings from ISO 27001 to existing frameworks
 */
export async function seedISO27001Mappings() {
  console.log('🔗 Creating ISO 27001:2022 cross-framework mappings...');

  const isoFramework = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'ISO-27001', version: '2022' } },
  });

  const cisFramework = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'CIS-CSC', version: '8.1' } },
  });

  const nistCSF = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'NIST-CSF', version: '2.0' } },
  });

  if (!isoFramework) {
    console.log('  ⚠️  ISO 27001 framework not found, skipping mappings');
    return;
  }

  // Mappings to CIS Controls
  if (cisFramework) {
    const cisMappings = [
      { iso: 'A.5.15', cis: 'CIS-6', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address access control management' },
      { iso: 'A.5.7', cis: 'CIS-7', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Threat intelligence relates to vulnerability management' },
      { iso: 'A.8.7', cis: 'CIS-10', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address malware protection and defenses' },
      { iso: 'A.8.15', cis: 'CIS-8', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address audit log management and retention' },
      { iso: 'A.8.20', cis: 'CIS-12', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address network security and infrastructure management' },
      { iso: 'A.5.24', cis: 'CIS-17', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address incident response management and planning' },
      { iso: 'A.5.9', cis: 'CIS-1', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Asset inventory supports enterprise asset management' },
      { iso: 'A.8.25', cis: 'CIS-16', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address secure software development lifecycle' },
    ];

    for (const mapping of cisMappings) {
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: isoFramework.id, code: mapping.iso },
      });
      const cisControl = await prisma.control.findFirst({
        where: { frameworkId: cisFramework.id, code: mapping.cis },
      });

      if (isoControl && cisControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: isoControl.id,
            targetControlId: cisControl.id,
            sourceFrameworkId: isoFramework.id,
            targetFrameworkId: cisFramework.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ ISO 27001 to CIS Controls mappings created');
  }

  // Mappings to NIST CSF
  if (nistCSF) {
    const nistMappings = [
      { iso: 'A.5.9', nist: 'ID.AM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address asset inventory and management' },
      { iso: 'A.5.15', nist: 'PR.AC', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address access control and identity management' },
      { iso: 'A.5.24', nist: 'RS.MA', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address incident response planning and management' },
      { iso: 'A.8.7', nist: 'DE.CM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address malware detection and defense' },
      { iso: 'A.8.15', nist: 'DE.CM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address logging and continuous monitoring' },
      { iso: 'A.8.20', nist: 'PR.IP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address network infrastructure protection' },
      { iso: 'A.8.25', nist: 'PR.IP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address secure development practices' },
      { iso: 'A.6.3', nist: 'PR.AT', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address security awareness and training' },
    ];

    for (const mapping of nistMappings) {
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: isoFramework.id, code: mapping.iso },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nistCSF.id, code: mapping.nist },
      });

      if (isoControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: isoControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: isoFramework.id,
            targetFrameworkId: nistCSF.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ ISO 27001 to NIST CSF 2.0 mappings created');
  }

  console.log('  ✅ ISO 27001:2022 cross-framework mappings completed');
}
