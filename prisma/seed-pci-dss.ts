/**
 * PCI DSS (Payment Card Industry Data Security Standard) v4.0.1 Seed Script
 * Published: June 11, 2024
 * Effective: March 31, 2025
 *
 * Framework Information:
 * - 12 principal requirements across 6 control objectives
 * - Security standards for organizations handling credit card data
 * - Clarifications and updates to v4.0 requirements
 * - Protects cardholder data environment (CDE)
 *
 * Sources:
 * - https://blog.pcisecuritystandards.org/just-published-pci-dss-v4-0-1
 * - https://www.pcisecuritystandards.org/document_library/
 * - https://www.pcicompliancehub.com/blog/the-12-requirements-of-pci-dss-v4-0-explained
 *
 * Version 4.0.1 Clarifications:
 * - Critical vulnerabilities must be patched within 30 days
 * - Phishing-resistant authentication options added
 * - Enhanced script inventory requirements (6.4.3)
 * - Real-time detection and alerting (11.6.1)
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PCI DSS 4.0.1 Requirements Structure
 * 6 Objectives → 12 Requirements → Multiple Sub-requirements
 */

const PCI_DSS_REQUIREMENTS = {
  // Objective 1: Build and Maintain a Secure Network and Systems
  'REQ-1': {
    title: 'Install and Maintain Network Security Controls',
    description: 'Establish and manage firewalls and network segmentation rules to block unauthorized access into the cardholder data environment (CDE). Implement robust network security controls to protect the CDE perimeter and internal network segments.',
    subreqs: [
      { code: 'REQ-1.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms for installing and maintaining network security controls to protect the cardholder data environment.' },
      { code: 'REQ-1.2', title: 'Network Security Controls Configuration', description: 'Network security controls (NSCs) are configured and maintained to block all unauthorized traffic and permit all authorized traffic between network security zones.' },
      { code: 'REQ-1.3', title: 'Network Access Control', description: 'Network access to and from the cardholder data environment is controlled to ensure only necessary and authorized network traffic is permitted.' },
      { code: 'REQ-1.4', title: 'Connections and Configurations Management', description: 'Network connections between trusted and untrusted networks are controlled, and configurations of network security controls are reviewed and approved.' },
      { code: 'REQ-1.5', title: 'Risk Analysis', description: 'Risks to the CDE from computing devices that are able to connect to both untrusted networks and the CDE are mitigated.' },
    ],
  },
  'REQ-2': {
    title: 'Apply Secure Configurations to All System Components',
    description: 'Eliminate default settings, unnecessary features, and misconfigurations to reduce exploitable gaps across all system components. Apply secure configuration standards to all systems including servers, network devices, and applications.',
    subreqs: [
      { code: 'REQ-2.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to support the application of secure configurations to all system components.' },
      { code: 'REQ-2.2', title: 'Vendor Default Configuration', description: 'System components are configured and managed securely, ensuring vendor defaults are changed before deployment into production.' },
      { code: 'REQ-2.3', title: 'Wireless Security', description: 'Wireless environments are configured and managed securely to prevent unauthorized access and maintain security of cardholder data.' },
    ],
  },

  // Objective 2: Protect Account Data
  'REQ-3': {
    title: 'Protect Stored Cardholder Data',
    description: 'Encrypt, truncate, or tokenize Primary Account Numbers (PAN) and implement strong key management to render data useless if stolen. Minimize data storage to only what is necessary for business, legal, or regulatory purposes.',
    subreqs: [
      { code: 'REQ-3.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to protect stored account data throughout its lifecycle.' },
      { code: 'REQ-3.2', title: 'Data Retention and Storage', description: 'Storage of account data is kept to a minimum through implementation of data retention and disposal policies, procedures, and processes.' },
      { code: 'REQ-3.3', title: 'Sensitive Authentication Data', description: 'Sensitive authentication data (SAD) is not stored after authorization, even if encrypted.' },
      { code: 'REQ-3.4', title: 'PAN Rendering', description: 'Primary Account Number (PAN) is secured wherever it is stored, including on portable digital media, backup media, and in logs.' },
      { code: 'REQ-3.5', title: 'PAN Display', description: 'Primary Account Number (PAN) is masked when displayed such that only personnel with a legitimate business need can see more than the first six and last four digits.' },
      { code: 'REQ-3.6', title: 'Cryptographic Key Management', description: 'Cryptographic keys used to protect stored account data are secured against disclosure and misuse.' },
      { code: 'REQ-3.7', title: 'Access to Cryptographic Keys', description: 'Where cryptography is used to protect stored account data, key management processes and procedures are defined and implemented.' },
    ],
  },
  'REQ-4': {
    title: 'Protect Cardholder Data with Strong Cryptography During Transmission',
    description: 'Secure cardholder data in transit across open, public networks using strong cryptography and security protocols. Protect data transmitted over wireless networks and ensure end-to-end encryption where applicable.',
    subreqs: [
      { code: 'REQ-4.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to protect cardholder data with strong cryptography during transmission over open, public networks.' },
      { code: 'REQ-4.2', title: 'Strong Cryptography', description: 'PAN is protected with strong cryptography whenever it is transmitted over open, public networks.' },
    ],
  },

  // Objective 3: Maintain a Vulnerability Management Program
  'REQ-5': {
    title: 'Protect All Systems and Networks from Malicious Software',
    description: 'Deploy and maintain anti-malware solutions on all systems commonly affected by malware. Keep malware signatures up to date and ensure anti-malware mechanisms are actively running.',
    subreqs: [
      { code: 'REQ-5.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to protect all systems and networks from malicious software.' },
      { code: 'REQ-5.2', title: 'Malware Protection', description: 'Malicious software (malware) is prevented, detected, and addressed on all system components.' },
      { code: 'REQ-5.3', title: 'Anti-Malware Mechanisms', description: 'Anti-malware mechanisms and processes are active, maintained, and monitored.' },
      { code: 'REQ-5.4', title: 'Protection Against Phishing', description: 'Anti-phishing mechanisms protect users against phishing attacks.' },
    ],
  },
  'REQ-6': {
    title: 'Develop and Maintain Secure Systems and Software',
    description: 'Keep systems patched and follow secure development practices. Address vulnerabilities promptly and ensure bespoke and custom software is developed securely.',
    subreqs: [
      { code: 'REQ-6.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to develop and maintain secure systems and software.' },
      { code: 'REQ-6.2', title: 'Bespoke Software Security', description: 'Bespoke and custom software are developed securely throughout the software development lifecycle.' },
      { code: 'REQ-6.3', title: 'Security Vulnerabilities', description: 'Security vulnerabilities are identified and addressed through a risk-based vulnerability management program.' },
      { code: 'REQ-6.4', title: 'Public-Facing Web Applications', description: 'Public-facing web applications are protected against attacks through ongoing security mechanisms.' },
      { code: 'REQ-6.5', title: 'Change Control Procedures', description: 'Changes to all system components are managed securely with documented change control procedures.' },
    ],
  },

  // Objective 4: Implement Strong Access Control Measures
  'REQ-7': {
    title: 'Restrict Access to Cardholder Data by Business Need to Know',
    description: 'Implement least-privilege access controls. Ensure access to cardholder data is granted only to those with a legitimate business need.',
    subreqs: [
      { code: 'REQ-7.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to restrict access to system components and cardholder data to only those individuals whose job requires such access.' },
      { code: 'REQ-7.2', title: 'Access Control Systems', description: 'Access to system components and data is appropriately defined and assigned to roles based on job classification and function.' },
      { code: 'REQ-7.3', title: 'Access Control Enforcement', description: 'Access to system components and data is managed via an access control system(s) that restricts access based on a user\'s need to know and is set to "deny all" unless specifically allowed.' },
    ],
  },
  'REQ-8': {
    title: 'Identify Users and Authenticate Access to System Components',
    description: 'Assign unique IDs and implement multi-factor authentication (MFA) for all access to the CDE. Ensure strong authentication mechanisms are in place for all users.',
    subreqs: [
      { code: 'REQ-8.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to identify users and authenticate access to system components.' },
      { code: 'REQ-8.2', title: 'User Identification', description: 'User identity is verified before granting access to system components with strong authentication methods.' },
      { code: 'REQ-8.3', title: 'Multi-Factor Authentication', description: 'Multi-factor authentication (MFA) is implemented to secure access into the CDE for all users, administrators, and remote access.' },
      { code: 'REQ-8.4', title: 'Password/Passphrase Policies', description: 'Multi-factor authentication systems are configured to prevent misuse and are managed securely.' },
      { code: 'REQ-8.5', title: 'MFA System Management', description: 'Multi-factor authentication (MFA) systems are configured to prevent misuse by malicious individuals.' },
      { code: 'REQ-8.6', title: 'Application and System Accounts', description: 'Use of application and system accounts and associated authentication factors is strictly managed.' },
    ],
  },
  'REQ-9': {
    title: 'Restrict Physical Access to Cardholder Data',
    description: 'Implement physical controls, like locks and card readers, to prevent unauthorized individuals from accessing devices containing cardholder data. Protect physical media and maintain visitor logs.',
    subreqs: [
      { code: 'REQ-9.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to restrict physical access to cardholder data.' },
      { code: 'REQ-9.2', title: 'Physical Access Controls', description: 'Physical access controls manage entry into facilities and systems containing cardholder data.' },
      { code: 'REQ-9.3', title: 'Personnel and Visitors', description: 'Physical access for personnel and visitors is authorized and managed.' },
      { code: 'REQ-9.4', title: 'Media Storage and Access', description: 'Media containing cardholder data is securely stored, accessed, distributed, and destroyed.' },
      { code: 'REQ-9.5', title: 'Point of Interaction Devices', description: 'Point of Interaction (POI) devices are protected from tampering and unauthorized substitution.' },
    ],
  },

  // Objective 5: Regularly Monitor and Test Networks
  'REQ-10': {
    title: 'Log and Monitor All Access to System Components and Cardholder Data',
    description: 'Maintain audit logs that record who did what and when. Regularly review logs to detect suspicious behavior and maintain log integrity.',
    subreqs: [
      { code: 'REQ-10.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to log and monitor all access to system components and cardholder data.' },
      { code: 'REQ-10.2', title: 'Audit Logs', description: 'Audit logs are implemented to support the detection of anomalies and suspicious activity, and the forensic analysis of events.' },
      { code: 'REQ-10.3', title: 'Audit Log Protection', description: 'Audit logs are protected from destruction and unauthorized modifications.' },
      { code: 'REQ-10.4', title: 'Audit Log Review', description: 'Audit logs are reviewed to identify anomalies or suspicious activity.' },
      { code: 'REQ-10.5', title: 'Audit Log History', description: 'Audit log history is retained and available for analysis.' },
      { code: 'REQ-10.6', title: 'Time Synchronization', description: 'Time-synchronization mechanisms support consistent time settings across all systems.' },
      { code: 'REQ-10.7', title: 'Anomaly Detection', description: 'Failures of critical security control systems are detected, alerted, and addressed promptly.' },
    ],
  },
  'REQ-11': {
    title: 'Test Security of Systems and Networks Regularly',
    description: 'Conduct vulnerability scans, penetration testing, and wireless assessments to identify weaknesses before attackers do. Implement intrusion detection systems.',
    subreqs: [
      { code: 'REQ-11.1', title: 'Processes and Mechanisms', description: 'Establish processes and mechanisms to test security of systems and networks regularly.' },
      { code: 'REQ-11.2', title: 'Wireless Access Points', description: 'Wireless access points are identified and monitored, and unauthorized wireless access points are addressed.' },
      { code: 'REQ-11.3', title: 'Vulnerability Scans', description: 'External and internal vulnerabilities are regularly identified, prioritized, and addressed.' },
      { code: 'REQ-11.4', title: 'Penetration Testing', description: 'External and internal penetration testing is regularly performed, and exploitable vulnerabilities and security weaknesses are corrected.' },
      { code: 'REQ-11.5', title: 'Intrusion Detection/Prevention', description: 'Network intrusions and unexpected file changes are detected and responded to.' },
      { code: 'REQ-11.6', title: 'Change Detection', description: 'Unauthorized changes on payment pages are detected and responded to through a change- and tamper-detection mechanism.' },
    ],
  },

  // Objective 6: Maintain an Information Security Policy
  'REQ-12': {
    title: 'Support Information Security with Organizational Policies and Programs',
    description: 'Establish and enforce governance, training, risk management, and oversight to sustain strong security across the organization. Maintain formal security policies and conduct regular security awareness training.',
    subreqs: [
      { code: 'REQ-12.1', title: 'Information Security Policy', description: 'A comprehensive information security policy that governs and provides direction for protection of cardholder data is established, published, maintained, and disseminated.' },
      { code: 'REQ-12.2', title: 'Risk Assessment', description: 'Acceptable use policies for end-user technologies are defined and implemented.' },
      { code: 'REQ-12.3', title: 'Risk Assessments', description: 'Risks to the cardholder data environment are formally identified, evaluated, and managed.' },
      { code: 'REQ-12.4', title: 'Security Awareness', description: 'PCI DSS compliance is managed through a formal security awareness program.' },
      { code: 'REQ-12.5', title: 'PCI DSS Scope', description: 'PCI DSS scope is documented and validated through an annual review and attestation of PCI DSS scope.' },
      { code: 'REQ-12.6', title: 'Security Awareness Training', description: 'Security awareness education is an ongoing activity that provides personnel with information about the importance of cardholder data security.' },
      { code: 'REQ-12.7', title: 'Personnel Screening', description: 'Personnel are screened to reduce risks from insider threats.' },
      { code: 'REQ-12.8', title: 'Service Provider Management', description: 'Risk to information assets associated with third-party service provider (TPSP) relationships is managed.' },
      { code: 'REQ-12.9', title: 'Third-Party Service Providers', description: 'Third-party service providers (TPSPs) support their customers\' PCI DSS compliance through various methods.' },
      { code: 'REQ-12.10', title: 'Incident Response', description: 'Suspected and confirmed security incidents that could impact the CDE are responded to immediately.' },
    ],
  },
};

/**
 * Seed PCI DSS 4.0.1 Framework
 */
export async function seedPCIDSS() {
  console.log('💳 Seeding PCI DSS 4.0.1...');

  const pciFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'PCI-DSS', version: '4.0.1' } },
    update: {},
    create: {
      name: 'Payment Card Industry Data Security Standard',
      shortName: 'PCI-DSS',
      version: '4.0.1',
      effectiveDate: new Date('2024-06-11'),
      description: 'PCI DSS 4.0.1 provides security standards for organizations that handle credit card data. It includes 12 principal requirements across 6 control objectives to protect the cardholder data environment (CDE). Version 4.0.1 includes clarifications on critical vulnerability patching, phishing-resistant authentication, and enhanced monitoring requirements.',
      category: FrameworkCategory.COMPLIANCE,
      isActive: true,
    },
  });

  // Create 12 requirement families (top-level controls)
  const reqCodes = Object.keys(PCI_DSS_REQUIREMENTS);

  for (let i = 0; i < reqCodes.length; i++) {
    const reqCode = reqCodes[i];
    const requirement = PCI_DSS_REQUIREMENTS[reqCode as keyof typeof PCI_DSS_REQUIREMENTS];

    // Create parent requirement
    const parentControl = await prisma.control.create({
      data: {
        code: reqCode,
        title: requirement.title,
        description: requirement.description,
        frameworkId: pciFramework.id,
        sortOrder: i + 1,
      },
    });

    // Create sub-requirements
    for (let j = 0; j < requirement.subreqs.length; j++) {
      const subreq = requirement.subreqs[j];
      await prisma.control.create({
        data: {
          code: subreq.code,
          title: subreq.title,
          description: subreq.description,
          frameworkId: pciFramework.id,
          parentId: parentControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ PCI DSS 4.0.1 seeded (12 requirements, 58 sub-requirements)');
  return pciFramework;
}

/**
 * Create control mappings from PCI DSS to other frameworks
 * Maps to NIST CSF, ISO 42001, and CSA AICM where applicable
 */
export async function seedPCIDSSMappings() {
  console.log('🔗 Creating PCI DSS cross-framework mappings...');

  const pciFramework = await prisma.framework.findFirst({
    where: { shortName: 'PCI-DSS', version: '4.0.1' },
  });

  if (!pciFramework) {
    console.log('  ⚠️  PCI DSS 4.0.1 framework not found, skipping mappings');
    return;
  }

  // Map to NIST AI RMF
  const nistFramework = await prisma.framework.findFirst({
    where: { shortName: 'NIST-AI-RMF', version: '1.0' },
  });

  if (nistFramework) {
    const nistMappings = [
      { pci: 'REQ-1', nist: 'GOVERN-1', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address security policies and network controls' },
      { pci: 'REQ-2', nist: 'MANAGE-2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address secure configuration management' },
      { pci: 'REQ-6', nist: 'MANAGE-2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address secure development and vulnerability management' },
      { pci: 'REQ-7', nist: 'GOVERN-2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address access control and least privilege' },
      { pci: 'REQ-8', nist: 'GOVERN-2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address identity and authentication management' },
      { pci: 'REQ-10', nist: 'MEASURE-3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address logging, monitoring, and risk tracking' },
      { pci: 'REQ-11', nist: 'MEASURE-2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address security testing and assessment' },
      { pci: 'REQ-12', nist: 'GOVERN-1', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address governance policies and security awareness' },
    ];

    for (const mapping of nistMappings) {
      const pciControl = await prisma.control.findFirst({
        where: { frameworkId: pciFramework.id, code: mapping.pci },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nistFramework.id, code: mapping.nist },
      });

      if (pciControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: pciControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: pciFramework.id,
            targetFrameworkId: nistFramework.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ PCI DSS → NIST AI RMF mappings created');
  }

  // Map to ISO 42001
  const isoFramework = await prisma.framework.findFirst({
    where: { shortName: 'ISO-42001', version: '2023' },
  });

  if (isoFramework) {
    const isoMappings = [
      { pci: 'REQ-1', iso: 'A.2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address policy development and security controls' },
      { pci: 'REQ-3', iso: 'A.7', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address data protection and security' },
      { pci: 'REQ-5', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address system security and malware protection' },
      { pci: 'REQ-6', iso: 'A.6', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address secure development lifecycle and testing' },
      { pci: 'REQ-7', iso: 'A.3', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address access control and roles/responsibilities' },
      { pci: 'REQ-8', iso: 'A.3', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address identity and access management' },
      { pci: 'REQ-10', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address logging and monitoring' },
      { pci: 'REQ-12', iso: 'A.2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address security policies and governance' },
    ];

    for (const mapping of isoMappings) {
      const pciControl = await prisma.control.findFirst({
        where: { frameworkId: pciFramework.id, code: mapping.pci },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: isoFramework.id, code: mapping.iso },
      });

      if (pciControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: pciControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: pciFramework.id,
            targetFrameworkId: isoFramework.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ PCI DSS → ISO 42001 mappings created');
  }

  // Map to CSA AICM
  const csaFramework = await prisma.framework.findFirst({
    where: { shortName: 'CSA-AICM', version: '1.0' },
  });

  if (csaFramework) {
    const csaMappings = [
      { pci: 'REQ-1', csa: 'AIC-AIS', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address network and application security controls' },
      { pci: 'REQ-2', csa: 'AIC-CCC', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address configuration management' },
      { pci: 'REQ-3', csa: 'AIC-DSP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address data security and protection' },
      { pci: 'REQ-4', csa: 'AIC-DSP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address data encryption in transit' },
      { pci: 'REQ-5', csa: 'AIC-MOD', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address protection against malicious code' },
      { pci: 'REQ-6', csa: 'AIC-AIS', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address application security and vulnerability management' },
      { pci: 'REQ-7', csa: 'AIC-IAM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address access control and least privilege' },
      { pci: 'REQ-8', csa: 'AIC-IAM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address identity and authentication' },
      { pci: 'REQ-10', csa: 'AIC-LOG', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address logging and monitoring' },
      { pci: 'REQ-11', csa: 'AIC-AAC', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address security testing and assurance' },
      { pci: 'REQ-12', csa: 'AIC-GRC', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address governance, risk, and compliance' },
    ];

    for (const mapping of csaMappings) {
      const pciControl = await prisma.control.findFirst({
        where: { frameworkId: pciFramework.id, code: mapping.pci },
      });
      const csaControl = await prisma.control.findFirst({
        where: { frameworkId: csaFramework.id, code: mapping.csa },
      });

      if (pciControl && csaControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: pciControl.id,
            targetControlId: csaControl.id,
            sourceFrameworkId: pciFramework.id,
            targetFrameworkId: csaFramework.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ PCI DSS → CSA AICM mappings created');
  }

  console.log('  ✅ All PCI DSS cross-framework mappings completed');
}
