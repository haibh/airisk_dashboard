/**
 * Secure Controls Framework (SCF) v2025.4 Seed Script
 * Seeds SCF framework with 21 domains and ~90 controls
 * Released: April 2025
 * Source: https://www.securecontrolsframework.com/
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * SCF v2025.4 - 21 Domain Families with Controls
 * Meta-framework mapping security and privacy controls across 100+ regulatory frameworks
 */

const SCF_CONTROLS = {
  'AST': {
    title: 'Asset Management',
    description: 'Comprehensive asset inventory and lifecycle management to ensure accountability and proper handling of organizational assets.',
    controls: [
      { code: 'AST-01', title: 'Asset Governance', description: 'Establish and maintain asset management policies and procedures.' },
      { code: 'AST-02', title: 'Asset Inventory', description: 'Maintain comprehensive inventory of all organizational assets.' },
      { code: 'AST-03', title: 'Asset Classification', description: 'Classify assets based on criticality and sensitivity.' },
      { code: 'AST-04', title: 'Asset Disposal', description: 'Securely dispose of assets at end of lifecycle.' },
    ],
  },
  'GOV': {
    title: 'Governance',
    description: 'Establish cybersecurity and data privacy governance framework to guide organizational security strategy.',
    controls: [
      { code: 'GOV-01', title: 'Cybersecurity & Data Privacy Governance', description: 'Establish governance framework for security and privacy.' },
      { code: 'GOV-02', title: 'Publishing Security Policies', description: 'Document and publish security policies organization-wide.' },
      { code: 'GOV-03', title: 'Periodic Review of Policies', description: 'Regularly review and update security policies.' },
      { code: 'GOV-04', title: 'Assigned Security Responsibilities', description: 'Assign clear security roles and responsibilities.' },
      { code: 'GOV-05', title: 'Measures of Performance', description: 'Define and track security performance metrics.' },
    ],
  },
  'IAC': {
    title: 'Identification & Access Control',
    description: 'Manage digital identities and control access to systems and data through comprehensive IAM practices.',
    controls: [
      { code: 'IAC-01', title: 'Identity & Access Management', description: 'Implement comprehensive identity and access management program.' },
      { code: 'IAC-02', title: 'Credential Management', description: 'Securely manage authentication credentials and tokens.' },
      { code: 'IAC-03', title: 'Least Privilege', description: 'Enforce principle of least privilege for all access.' },
      { code: 'IAC-04', title: 'Separation of Duties', description: 'Implement separation of duties for critical functions.' },
      { code: 'IAC-05', title: 'Account Management', description: 'Manage user accounts throughout their lifecycle.' },
    ],
  },
  'NET': {
    title: 'Network Security',
    description: 'Protect network infrastructure through security controls, segmentation, and boundary protection.',
    controls: [
      { code: 'NET-01', title: 'Network Security Controls', description: 'Implement comprehensive network security controls.' },
      { code: 'NET-02', title: 'Network Segmentation', description: 'Segment networks based on security requirements.' },
      { code: 'NET-03', title: 'Boundary Protection', description: 'Protect network boundaries with security devices.' },
      { code: 'NET-04', title: 'Data Flow Enforcement', description: 'Control and monitor data flows across networks.' },
      { code: 'NET-05', title: 'Wireless Networking', description: 'Secure wireless network infrastructure and access.' },
    ],
  },
  'RSK': {
    title: 'Risk Management',
    description: 'Establish risk management program to identify, assess, remediate, and monitor security risks.',
    controls: [
      { code: 'RSK-01', title: 'Risk Management Program', description: 'Establish comprehensive risk management program.' },
      { code: 'RSK-02', title: 'Risk Assessment', description: 'Conduct regular risk assessments of systems and data.' },
      { code: 'RSK-03', title: 'Risk Remediation', description: 'Remediate identified risks based on priority.' },
      { code: 'RSK-04', title: 'Risk Monitoring', description: 'Continuously monitor risk landscape and posture.' },
    ],
  },
  'TPM': {
    title: 'Third-Party Management',
    description: 'Manage third-party relationships and supply chain security risks through comprehensive vendor oversight.',
    controls: [
      { code: 'TPM-01', title: 'Third-Party Management Program', description: 'Establish third-party risk management program.' },
      { code: 'TPM-02', title: 'Third-Party Risk Assessment', description: 'Assess security risks of third-party relationships.' },
      { code: 'TPM-03', title: 'Supply Chain Protection', description: 'Protect supply chain from security threats.' },
      { code: 'TPM-04', title: 'Third-Party Monitoring', description: 'Monitor third-party security compliance continuously.' },
    ],
  },
  'CRY': {
    title: 'Cryptographic Protections',
    description: 'Implement cryptographic controls to protect data at rest, in transit, and during processing.',
    controls: [
      { code: 'CRY-01', title: 'Cryptographic Management', description: 'Establish cryptographic management framework.' },
      { code: 'CRY-02', title: 'Encryption for Data-at-Rest', description: 'Encrypt sensitive data stored on systems.' },
      { code: 'CRY-03', title: 'Encryption for Data-in-Transit', description: 'Encrypt data transmitted across networks.' },
      { code: 'CRY-04', title: 'Key Management', description: 'Securely manage cryptographic keys throughout lifecycle.' },
    ],
  },
  'DCH': {
    title: 'Data Classification & Handling',
    description: 'Classify and handle data appropriately based on sensitivity and regulatory requirements.',
    controls: [
      { code: 'DCH-01', title: 'Data Classification', description: 'Classify data based on sensitivity and criticality.' },
      { code: 'DCH-02', title: 'Data Handling', description: 'Handle data according to classification requirements.' },
      { code: 'DCH-03', title: 'Media Handling', description: 'Securely handle physical and digital media.' },
      { code: 'DCH-04', title: 'Data Retention & Disposal', description: 'Retain and dispose of data per requirements.' },
      { code: 'DCH-05', title: 'Information Sharing', description: 'Control sharing of information internally and externally.' },
    ],
  },
  'MON': {
    title: 'Continuous Monitoring',
    description: 'Continuously monitor systems and networks through centralized logging and analysis.',
    controls: [
      { code: 'MON-01', title: 'Continuous Monitoring', description: 'Implement continuous monitoring of security events.' },
      { code: 'MON-02', title: 'Centralized Event Logging', description: 'Centralize security event logs for analysis.' },
      { code: 'MON-03', title: 'Content of Audit Records', description: 'Ensure audit records contain sufficient detail.' },
      { code: 'MON-04', title: 'Audit Review & Analysis', description: 'Review and analyze audit logs regularly.' },
    ],
  },
  'IRO': {
    title: 'Incident Response Operations',
    description: 'Respond to and manage security incidents through structured incident response program.',
    controls: [
      { code: 'IRO-01', title: 'Incident Response Program', description: 'Establish formal incident response program.' },
      { code: 'IRO-02', title: 'Incident Handling', description: 'Handle security incidents per established procedures.' },
      { code: 'IRO-03', title: 'Incident Reporting', description: 'Report incidents to appropriate stakeholders.' },
      { code: 'IRO-04', title: 'Lessons Learned', description: 'Conduct post-incident reviews and capture lessons.' },
    ],
  },
  'BCD': {
    title: 'Business Continuity & Disaster Recovery',
    description: 'Ensure business continuity through contingency planning and disaster recovery capabilities.',
    controls: [
      { code: 'BCD-01', title: 'Business Continuity Management', description: 'Establish business continuity management program.' },
      { code: 'BCD-02', title: 'Business Impact Analysis', description: 'Conduct business impact analysis for critical systems.' },
      { code: 'BCD-03', title: 'Contingency Plan', description: 'Develop and maintain contingency plans.' },
      { code: 'BCD-04', title: 'Contingency Plan Testing', description: 'Test contingency plans regularly.' },
    ],
  },
  'PRI': {
    title: 'Privacy',
    description: 'Protect personal data and privacy rights through comprehensive privacy program.',
    controls: [
      { code: 'PRI-01', title: 'Privacy Program', description: 'Establish comprehensive privacy management program.' },
      { code: 'PRI-02', title: 'Data Privacy Impact Assessment', description: 'Conduct privacy impact assessments for systems.' },
      { code: 'PRI-03', title: 'Privacy Notice', description: 'Provide clear privacy notices to data subjects.' },
      { code: 'PRI-04', title: 'Consent', description: 'Obtain and manage consent for data processing.' },
      { code: 'PRI-05', title: 'Data Subject Rights', description: 'Enable data subjects to exercise privacy rights.' },
    ],
  },
  'HRS': {
    title: 'Human Resources Security',
    description: 'Ensure personnel security through screening, training, and lifecycle management.',
    controls: [
      { code: 'HRS-01', title: 'Personnel Security Program', description: 'Establish personnel security program.' },
      { code: 'HRS-02', title: 'Personnel Screening', description: 'Screen personnel before granting access.' },
      { code: 'HRS-03', title: 'Security Awareness Training', description: 'Provide ongoing security awareness training.' },
      { code: 'HRS-04', title: 'Personnel Termination', description: 'Manage personnel termination securely.' },
    ],
  },
  'PES': {
    title: 'Physical & Environmental Security',
    description: 'Protect physical facilities and infrastructure through access controls and environmental protections.',
    controls: [
      { code: 'PES-01', title: 'Physical Access Controls', description: 'Control physical access to facilities.' },
      { code: 'PES-02', title: 'Physical Security Monitoring', description: 'Monitor physical security continuously.' },
      { code: 'PES-03', title: 'Visitor Management', description: 'Manage and track facility visitors.' },
      { code: 'PES-04', title: 'Environmental Controls', description: 'Implement environmental protection controls.' },
    ],
  },
  'END': {
    title: 'Endpoint Security',
    description: 'Protect endpoints through security controls, mobile device management, and media protection.',
    controls: [
      { code: 'END-01', title: 'Endpoint Protection', description: 'Implement comprehensive endpoint security controls.' },
      { code: 'END-02', title: 'Mobile Device Management', description: 'Manage and secure mobile devices.' },
      { code: 'END-03', title: 'Media Protection', description: 'Protect digital and physical media.' },
      { code: 'END-04', title: 'Removable Media', description: 'Control use of removable media devices.' },
    ],
  },
  'TDA': {
    title: 'Technology Development & Acquisition',
    description: 'Integrate security into system development lifecycle and technology acquisition.',
    controls: [
      { code: 'TDA-01', title: 'Secure Development Practices', description: 'Implement secure development lifecycle practices.' },
      { code: 'TDA-02', title: 'Security Requirements', description: 'Define security requirements for systems.' },
      { code: 'TDA-03', title: 'Secure Coding', description: 'Follow secure coding standards and practices.' },
      { code: 'TDA-04', title: 'Security Testing', description: 'Test security of systems during development.' },
    ],
  },
  'CFG': {
    title: 'Configuration Management',
    description: 'Manage system configurations through secure baseline configurations and change control.',
    controls: [
      { code: 'CFG-01', title: 'Configuration Management Program', description: 'Establish configuration management program.' },
      { code: 'CFG-02', title: 'System Hardening', description: 'Harden systems per security baselines.' },
      { code: 'CFG-03', title: 'Least Functionality', description: 'Configure systems with least functionality.' },
      { code: 'CFG-04', title: 'Configuration Enforcement', description: 'Enforce secure configuration settings.' },
    ],
  },
  'VPM': {
    title: 'Vulnerability & Patch Management',
    description: 'Identify, assess, and remediate vulnerabilities through comprehensive vulnerability management.',
    controls: [
      { code: 'VPM-01', title: 'Vulnerability Management Program', description: 'Establish vulnerability management program.' },
      { code: 'VPM-02', title: 'Vulnerability Scanning', description: 'Scan systems regularly for vulnerabilities.' },
      { code: 'VPM-03', title: 'Patch Management', description: 'Apply security patches in timely manner.' },
    ],
  },
  'SEA': {
    title: 'Security Awareness',
    description: 'Build security culture through awareness training and social engineering testing.',
    controls: [
      { code: 'SEA-01', title: 'Security Awareness Program', description: 'Establish security awareness program.' },
      { code: 'SEA-02', title: 'Security Awareness Training', description: 'Provide regular security awareness training.' },
      { code: 'SEA-03', title: 'Social Engineering Testing', description: 'Test awareness through simulated attacks.' },
    ],
  },
  'WEB': {
    title: 'Web Security',
    description: 'Secure web applications through security controls, WAF, and session management.',
    controls: [
      { code: 'WEB-01', title: 'Web Application Security', description: 'Implement web application security controls.' },
      { code: 'WEB-02', title: 'Web Application Firewall', description: 'Deploy web application firewall protection.' },
      { code: 'WEB-03', title: 'Session Management', description: 'Securely manage web application sessions.' },
    ],
  },
  'CLD': {
    title: 'Cloud Security',
    description: 'Secure cloud environments through architecture, isolation, and access management.',
    controls: [
      { code: 'CLD-01', title: 'Cloud Security Program', description: 'Establish cloud security program.' },
      { code: 'CLD-02', title: 'Cloud Security Architecture', description: 'Design secure cloud architectures.' },
      { code: 'CLD-03', title: 'Cloud Tenant Isolation', description: 'Ensure isolation between cloud tenants.' },
      { code: 'CLD-04', title: 'Cloud Access Management', description: 'Manage access to cloud resources.' },
    ],
  },
};

/**
 * Seed SCF v2024.1
 */
export async function seedSCF() {
  console.log('🔒 Seeding Secure Controls Framework (SCF) v2025.4...');

  const scfFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'SCF', version: '2025.4' } },
    update: {},
    create: {
      name: 'Secure Controls Framework',
      shortName: 'SCF',
      version: '2025.4',
      effectiveDate: new Date('2025-04-01'),
      description: 'Comprehensive meta-framework mapping security and privacy controls across 100+ regulatory frameworks',
      category: FrameworkCategory.SECURITY,
      isActive: true,
    },
  });

  let totalControls = 0;

  // Seed each domain
  for (const [domainKey, domainData] of Object.entries(SCF_CONTROLS)) {
    // Create parent domain control
    const parentControl = await prisma.control.create({
      data: {
        code: domainKey,
        title: domainData.title,
        description: domainData.description,
        frameworkId: scfFramework.id,
        sortOrder: Object.keys(SCF_CONTROLS).indexOf(domainKey) + 1,
      },
    });

    // Create child controls
    for (let j = 0; j < domainData.controls.length; j++) {
      const control = domainData.controls[j];
      await prisma.control.create({
        data: {
          code: control.code,
          title: control.title,
          description: control.description,
          frameworkId: scfFramework.id,
          parentId: parentControl.id,
          sortOrder: j + 1,
        },
      });
      totalControls++;
    }
  }

  console.log(`  ✅ SCF v2025.4 seeded (21 domains, ${totalControls} controls)`);
  return scfFramework;
}

/**
 * Create mappings from SCF to existing frameworks
 */
export async function seedSCFMappings() {
  console.log('🔗 Creating SCF cross-framework mappings...');

  // Get framework references
  const scfFramework = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'SCF', version: '2025.4' } },
  });

  const iso27001 = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'ISO-27001', version: '2022' } },
  });

  const cisFramework = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'CIS-CSC', version: '8.1' } },
  });

  if (!scfFramework) {
    console.log('  ⚠️  SCF framework not found, skipping mappings');
    return;
  }

  // Mappings to ISO 27001 (if exists)
  if (iso27001) {
    const isoMappings = [
      { scf: 'IAC-01', iso: 'A.5.15', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address comprehensive identity and access management' },
      { scf: 'GOV-01', iso: 'A.5.1', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address security governance framework' },
    ];

    for (const mapping of isoMappings) {
      const scfControl = await prisma.control.findFirst({
        where: { frameworkId: scfFramework.id, code: mapping.scf },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso27001.id, code: mapping.iso },
      });

      if (scfControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: scfControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: scfFramework.id,
            targetFrameworkId: iso27001.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ SCF to ISO 27001 mappings created');
  }

  // Mappings to CIS Controls (if exists)
  if (cisFramework) {
    const cisMappings = [
      { scf: 'AST-02', cis: 'CIS-1', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address asset inventory and management' },
      { scf: 'MON-02', cis: 'CIS-8', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address centralized logging and audit' },
      { scf: 'NET-01', cis: 'CIS-12', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address network security controls' },
      { scf: 'VPM-01', cis: 'CIS-7', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address vulnerability management program' },
      { scf: 'IRO-01', cis: 'CIS-17', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address incident response program' },
      { scf: 'END-01', cis: 'CIS-10', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address endpoint protection and security' },
    ];

    for (const mapping of cisMappings) {
      const scfControl = await prisma.control.findFirst({
        where: { frameworkId: scfFramework.id, code: mapping.scf },
      });
      const cisControl = await prisma.control.findFirst({
        where: { frameworkId: cisFramework.id, code: mapping.cis },
      });

      if (scfControl && cisControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: scfControl.id,
            targetControlId: cisControl.id,
            sourceFrameworkId: scfFramework.id,
            targetFrameworkId: cisFramework.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ SCF to CIS Controls mappings created');
  }

  console.log('  ✅ SCF cross-framework mappings completed');
}
