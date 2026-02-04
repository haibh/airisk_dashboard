/**
 * CIS Critical Security Controls v8.1 Seed Script
 * Seeds CIS CSC v8.1 framework with 18 controls and 153 safeguards
 * Released: June 2024
 * Source: https://www.cisecurity.org/controls/v8-1
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * CIS Controls v8.1 - 18 Control Families with Safeguards
 * Organized by Implementation Groups (IG1, IG2, IG3)
 */

const CIS_CONTROLS = {
  'CIS-1': {
    title: 'Inventory and Control of Enterprise Assets',
    description: 'Actively manage (inventory, track, and correct) all enterprise assets (end-user devices, including portable and mobile; network devices; non-computing/Internet of Things (IoT) devices; and servers) connected to the infrastructure physically, virtually, remotely, and those within cloud environments, to accurately know the totality of assets that need to be monitored and protected within the enterprise.',
    safeguards: [
      { code: 'CIS-1.1', title: 'Establish and Maintain Detailed Enterprise Asset Inventory', ig: 'IG1' },
      { code: 'CIS-1.2', title: 'Address Unauthorized Assets', ig: 'IG1' },
      { code: 'CIS-1.3', title: 'Utilize an Active Discovery Tool', ig: 'IG2' },
      { code: 'CIS-1.4', title: 'Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory', ig: 'IG2' },
      { code: 'CIS-1.5', title: 'Use a Passive Asset Discovery Tool', ig: 'IG3' },
    ],
  },
  'CIS-2': {
    title: 'Inventory and Control of Software Assets',
    description: 'Actively manage (inventory, track, and correct) all software (operating systems and applications) on the network so that only authorized software is installed and can execute, and that unauthorized and unmanaged software is found and prevented from installation or execution.',
    safeguards: [
      { code: 'CIS-2.1', title: 'Establish and Maintain a Software Inventory', ig: 'IG1' },
      { code: 'CIS-2.2', title: 'Ensure Authorized Software is Currently Supported', ig: 'IG1' },
      { code: 'CIS-2.3', title: 'Address Unauthorized Software', ig: 'IG1' },
      { code: 'CIS-2.4', title: 'Utilize Automated Software Inventory Tools', ig: 'IG2' },
      { code: 'CIS-2.5', title: 'Allowlist Authorized Software', ig: 'IG2' },
      { code: 'CIS-2.6', title: 'Allowlist Authorized Libraries', ig: 'IG2' },
      { code: 'CIS-2.7', title: 'Allowlist Authorized Scripts', ig: 'IG2' },
    ],
  },
  'CIS-3': {
    title: 'Data Protection',
    description: 'Develop processes and technical controls to identify, classify, securely handle, retain, and dispose of data.',
    safeguards: [
      { code: 'CIS-3.1', title: 'Establish and Maintain a Data Management Process', ig: 'IG1' },
      { code: 'CIS-3.2', title: 'Establish and Maintain a Data Inventory', ig: 'IG1' },
      { code: 'CIS-3.3', title: 'Configure Data Access Control Lists', ig: 'IG1' },
      { code: 'CIS-3.4', title: 'Enforce Data Retention', ig: 'IG1' },
      { code: 'CIS-3.5', title: 'Securely Dispose of Data', ig: 'IG1' },
      { code: 'CIS-3.6', title: 'Encrypt Data on End-User Devices', ig: 'IG1' },
      { code: 'CIS-3.7', title: 'Establish and Maintain a Data Classification Scheme', ig: 'IG2' },
      { code: 'CIS-3.8', title: 'Document Data Flows', ig: 'IG2' },
      { code: 'CIS-3.9', title: 'Encrypt Data on Removable Media', ig: 'IG2' },
      { code: 'CIS-3.10', title: 'Encrypt Sensitive Data in Transit', ig: 'IG2' },
      { code: 'CIS-3.11', title: 'Encrypt Sensitive Data at Rest', ig: 'IG2' },
      { code: 'CIS-3.12', title: 'Segment Data Processing and Storage Based on Sensitivity', ig: 'IG2' },
      { code: 'CIS-3.13', title: 'Deploy a Data Loss Prevention Solution', ig: 'IG3' },
      { code: 'CIS-3.14', title: 'Log Sensitive Data Access', ig: 'IG3' },
    ],
  },
  'CIS-4': {
    title: 'Secure Configuration of Enterprise Assets and Software',
    description: 'Establish and maintain the secure configuration of enterprise assets (end-user devices, including portable and mobile; network devices; non-computing/IoT devices; and servers) and software (operating systems and applications).',
    safeguards: [
      { code: 'CIS-4.1', title: 'Establish and Maintain a Secure Configuration Process', ig: 'IG1' },
      { code: 'CIS-4.2', title: 'Establish and Maintain a Secure Configuration Process for Network Infrastructure', ig: 'IG1' },
      { code: 'CIS-4.3', title: 'Configure Automatic Session Locking on Enterprise Assets', ig: 'IG1' },
      { code: 'CIS-4.4', title: 'Implement and Manage a Firewall on Servers', ig: 'IG1' },
      { code: 'CIS-4.5', title: 'Implement and Manage a Firewall on End-User Devices', ig: 'IG1' },
      { code: 'CIS-4.6', title: 'Securely Manage Enterprise Assets and Software', ig: 'IG2' },
      { code: 'CIS-4.7', title: 'Manage Default Accounts on Enterprise Assets and Software', ig: 'IG2' },
      { code: 'CIS-4.8', title: 'Uninstall or Disable Unnecessary Services on Enterprise Assets and Software', ig: 'IG2' },
      { code: 'CIS-4.9', title: 'Configure Trusted DNS Servers on Enterprise Assets', ig: 'IG2' },
      { code: 'CIS-4.10', title: 'Enforce Automatic Device Lockout on Portable End-User Devices', ig: 'IG2' },
      { code: 'CIS-4.11', title: 'Enforce Remote Wipe Capability on Portable End-User Devices', ig: 'IG2' },
      { code: 'CIS-4.12', title: 'Separate Enterprise Workspaces on Mobile End-User Devices', ig: 'IG3' },
    ],
  },
  'CIS-5': {
    title: 'Account Management',
    description: 'Use processes and tools to assign and manage authorization to credentials for user accounts, including administrator accounts, as well as service accounts, to enterprise assets and software.',
    safeguards: [
      { code: 'CIS-5.1', title: 'Establish and Maintain an Inventory of Accounts', ig: 'IG1' },
      { code: 'CIS-5.2', title: 'Use Unique Passwords', ig: 'IG1' },
      { code: 'CIS-5.3', title: 'Disable Dormant Accounts', ig: 'IG1' },
      { code: 'CIS-5.4', title: 'Restrict Administrator Privileges to Dedicated Administrator Accounts', ig: 'IG1' },
      { code: 'CIS-5.5', title: 'Establish and Maintain an Inventory of Service Accounts', ig: 'IG2' },
      { code: 'CIS-5.6', title: 'Centralize Account Management', ig: 'IG2' },
    ],
  },
  'CIS-6': {
    title: 'Access Control Management',
    description: 'Use processes and tools to create, assign, manage, and revoke access credentials and privileges for user, administrator, and service accounts for enterprise assets and software.',
    safeguards: [
      { code: 'CIS-6.1', title: 'Establish an Access Granting Process', ig: 'IG1' },
      { code: 'CIS-6.2', title: 'Establish an Access Revoking Process', ig: 'IG1' },
      { code: 'CIS-6.3', title: 'Require MFA for Externally-Exposed Applications', ig: 'IG1' },
      { code: 'CIS-6.4', title: 'Require MFA for Remote Network Access', ig: 'IG1' },
      { code: 'CIS-6.5', title: 'Require MFA for Administrative Access', ig: 'IG1' },
      { code: 'CIS-6.6', title: 'Establish and Maintain an Inventory of Authentication and Authorization Systems', ig: 'IG2' },
      { code: 'CIS-6.7', title: 'Centralize Access Control', ig: 'IG2' },
      { code: 'CIS-6.8', title: 'Define and Maintain Role-Based Access Control', ig: 'IG2' },
    ],
  },
  'CIS-7': {
    title: 'Continuous Vulnerability Management',
    description: 'Develop a plan to continuously assess and track vulnerabilities on all enterprise assets within the enterprise\'s infrastructure, in order to remediate, and minimize, the window of opportunity for attackers.',
    safeguards: [
      { code: 'CIS-7.1', title: 'Establish and Maintain a Vulnerability Management Process', ig: 'IG1' },
      { code: 'CIS-7.2', title: 'Establish and Maintain a Remediation Process', ig: 'IG1' },
      { code: 'CIS-7.3', title: 'Perform Automated Operating System Patch Management', ig: 'IG1' },
      { code: 'CIS-7.4', title: 'Perform Automated Application Patch Management', ig: 'IG1' },
      { code: 'CIS-7.5', title: 'Perform Automated Vulnerability Scans of Internal Enterprise Assets', ig: 'IG2' },
      { code: 'CIS-7.6', title: 'Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets', ig: 'IG2' },
      { code: 'CIS-7.7', title: 'Remediate Detected Vulnerabilities', ig: 'IG2' },
    ],
  },
  'CIS-8': {
    title: 'Audit Log Management',
    description: 'Collect, alert, review, and retain audit logs of events that could help detect, understand, or recover from an attack.',
    safeguards: [
      { code: 'CIS-8.1', title: 'Establish and Maintain an Audit Log Management Process', ig: 'IG1' },
      { code: 'CIS-8.2', title: 'Collect Audit Logs', ig: 'IG1' },
      { code: 'CIS-8.3', title: 'Ensure Adequate Audit Log Storage', ig: 'IG1' },
      { code: 'CIS-8.4', title: 'Standardize Time Synchronization', ig: 'IG1' },
      { code: 'CIS-8.5', title: 'Collect Detailed Audit Logs', ig: 'IG2' },
      { code: 'CIS-8.6', title: 'Collect DNS Query Audit Logs', ig: 'IG2' },
      { code: 'CIS-8.7', title: 'Collect URL Request Audit Logs', ig: 'IG2' },
      { code: 'CIS-8.8', title: 'Collect Command-Line Audit Logs', ig: 'IG2' },
      { code: 'CIS-8.9', title: 'Centralize Audit Logs', ig: 'IG2' },
      { code: 'CIS-8.10', title: 'Retain Audit Logs', ig: 'IG2' },
      { code: 'CIS-8.11', title: 'Conduct Audit Log Reviews', ig: 'IG2' },
      { code: 'CIS-8.12', title: 'Collect Service Provider Logs', ig: 'IG3' },
    ],
  },
  'CIS-9': {
    title: 'Email and Web Browser Protections',
    description: 'Improve protections and detections of threats from email and web vectors, as these are opportunities for attackers to manipulate human behavior through direct engagement.',
    safeguards: [
      { code: 'CIS-9.1', title: 'Ensure Use of Only Fully Supported Browsers and Email Clients', ig: 'IG1' },
      { code: 'CIS-9.2', title: 'Use DNS Filtering Services', ig: 'IG1' },
      { code: 'CIS-9.3', title: 'Maintain and Enforce Network-Based URL Filters', ig: 'IG1' },
      { code: 'CIS-9.4', title: 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions', ig: 'IG2' },
      { code: 'CIS-9.5', title: 'Implement DMARC', ig: 'IG2' },
      { code: 'CIS-9.6', title: 'Block Unnecessary File Types', ig: 'IG2' },
      { code: 'CIS-9.7', title: 'Deploy and Maintain Email Server Anti-Malware Protections', ig: 'IG2' },
    ],
  },
  'CIS-10': {
    title: 'Malware Defenses',
    description: 'Prevent or control the installation, spread, and execution of malicious applications, code, or scripts on enterprise assets.',
    safeguards: [
      { code: 'CIS-10.1', title: 'Deploy and Maintain Anti-Malware Software', ig: 'IG1' },
      { code: 'CIS-10.2', title: 'Configure Automatic Anti-Malware Signature Updates', ig: 'IG1' },
      { code: 'CIS-10.3', title: 'Disable Autorun and Autoplay for Removable Media', ig: 'IG1' },
      { code: 'CIS-10.4', title: 'Configure Automatic Anti-Malware Scanning of Removable Media', ig: 'IG1' },
      { code: 'CIS-10.5', title: 'Enable Anti-Exploitation Features', ig: 'IG1' },
      { code: 'CIS-10.6', title: 'Centrally Manage Anti-Malware Software', ig: 'IG2' },
      { code: 'CIS-10.7', title: 'Use Behavior-Based Anti-Malware Software', ig: 'IG3' },
    ],
  },
  'CIS-11': {
    title: 'Data Recovery',
    description: 'Establish and maintain data recovery practices sufficient to restore in-scope enterprise assets to a pre-incident and trusted state.',
    safeguards: [
      { code: 'CIS-11.1', title: 'Establish and Maintain a Data Recovery Process', ig: 'IG1' },
      { code: 'CIS-11.2', title: 'Perform Automated Backups', ig: 'IG1' },
      { code: 'CIS-11.3', title: 'Protect Recovery Data', ig: 'IG1' },
      { code: 'CIS-11.4', title: 'Establish and Maintain an Isolated Instance of Recovery Data', ig: 'IG1' },
      { code: 'CIS-11.5', title: 'Test Data Recovery', ig: 'IG2' },
    ],
  },
  'CIS-12': {
    title: 'Network Infrastructure Management',
    description: 'Establish, implement, and actively manage (track, report, correct) network devices, in order to prevent attackers from exploiting vulnerable network services and access points.',
    safeguards: [
      { code: 'CIS-12.1', title: 'Ensure Network Infrastructure is Up-to-Date', ig: 'IG1' },
      { code: 'CIS-12.2', title: 'Establish and Maintain a Secure Network Architecture', ig: 'IG1' },
      { code: 'CIS-12.3', title: 'Securely Manage Network Infrastructure', ig: 'IG1' },
      { code: 'CIS-12.4', title: 'Establish and Maintain Architecture Diagram(s)', ig: 'IG2' },
      { code: 'CIS-12.5', title: 'Centralize Network Authentication, Authorization, and Auditing (AAA)', ig: 'IG2' },
      { code: 'CIS-12.6', title: 'Use of Secure Network Management and Communication Protocols', ig: 'IG2' },
      { code: 'CIS-12.7', title: 'Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise\'s AAA Infrastructure', ig: 'IG2' },
      { code: 'CIS-12.8', title: 'Establish and Maintain Dedicated Computing Resources for All Administrative Work', ig: 'IG3' },
    ],
  },
  'CIS-13': {
    title: 'Network Monitoring and Defense',
    description: 'Operate processes and tooling to establish and maintain comprehensive network monitoring and defense against security threats across the enterprise\'s network infrastructure and user base.',
    safeguards: [
      { code: 'CIS-13.1', title: 'Centralize Security Event Alerting', ig: 'IG2' },
      { code: 'CIS-13.2', title: 'Deploy a Host-Based Intrusion Detection Solution', ig: 'IG2' },
      { code: 'CIS-13.3', title: 'Deploy a Network Intrusion Detection Solution', ig: 'IG2' },
      { code: 'CIS-13.4', title: 'Perform Traffic Filtering Between Network Segments', ig: 'IG2' },
      { code: 'CIS-13.5', title: 'Manage Access Control for Remote Assets', ig: 'IG2' },
      { code: 'CIS-13.6', title: 'Collect Network Traffic Flow Logs', ig: 'IG2' },
      { code: 'CIS-13.7', title: 'Deploy a Host-Based Intrusion Prevention Solution', ig: 'IG2' },
      { code: 'CIS-13.8', title: 'Deploy a Network Intrusion Prevention Solution', ig: 'IG2' },
      { code: 'CIS-13.9', title: 'Deploy Port-Level Access Control', ig: 'IG3' },
      { code: 'CIS-13.10', title: 'Perform Application Layer Filtering', ig: 'IG3' },
      { code: 'CIS-13.11', title: 'Tune Security Event Alerting Thresholds', ig: 'IG3' },
    ],
  },
  'CIS-14': {
    title: 'Security Awareness and Skills Training',
    description: 'Establish and maintain a security awareness program to influence behavior among the workforce to be security conscious and properly skilled to reduce cybersecurity risks to the enterprise.',
    safeguards: [
      { code: 'CIS-14.1', title: 'Establish and Maintain a Security Awareness Program', ig: 'IG1' },
      { code: 'CIS-14.2', title: 'Train Workforce Members to Recognize Social Engineering Attacks', ig: 'IG1' },
      { code: 'CIS-14.3', title: 'Train Workforce Members on Authentication Best Practices', ig: 'IG1' },
      { code: 'CIS-14.4', title: 'Train Workforce on Data Handling Best Practices', ig: 'IG1' },
      { code: 'CIS-14.5', title: 'Train Workforce Members on Causes of Unintentional Data Exposure', ig: 'IG1' },
      { code: 'CIS-14.6', title: 'Train Workforce Members on Recognizing and Reporting Security Incidents', ig: 'IG1' },
      { code: 'CIS-14.7', title: 'Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates', ig: 'IG1' },
      { code: 'CIS-14.8', title: 'Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks', ig: 'IG2' },
      { code: 'CIS-14.9', title: 'Conduct Role-Specific Security Awareness and Skills Training', ig: 'IG3' },
    ],
  },
  'CIS-15': {
    title: 'Service Provider Management',
    description: 'Develop a process to evaluate service providers who hold sensitive data, or are responsible for an enterprise\'s critical IT platforms or processes, to ensure these providers are protecting those platforms and data appropriately.',
    safeguards: [
      { code: 'CIS-15.1', title: 'Establish and Maintain an Inventory of Service Providers', ig: 'IG1' },
      { code: 'CIS-15.2', title: 'Establish and Maintain a Service Provider Management Policy', ig: 'IG1' },
      { code: 'CIS-15.3', title: 'Classify Service Providers', ig: 'IG2' },
      { code: 'CIS-15.4', title: 'Ensure Service Provider Contracts Include Security Requirements', ig: 'IG2' },
      { code: 'CIS-15.5', title: 'Assess Service Providers', ig: 'IG2' },
      { code: 'CIS-15.6', title: 'Monitor Service Providers', ig: 'IG2' },
      { code: 'CIS-15.7', title: 'Securely Decommission Service Providers', ig: 'IG2' },
    ],
  },
  'CIS-16': {
    title: 'Application Software Security',
    description: 'Manage the security life cycle of in-house developed, hosted, or acquired software to prevent, detect, and remediate security weaknesses before they can impact the enterprise.',
    safeguards: [
      { code: 'CIS-16.1', title: 'Establish and Maintain a Secure Application Development Process', ig: 'IG1' },
      { code: 'CIS-16.2', title: 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities', ig: 'IG1' },
      { code: 'CIS-16.3', title: 'Perform Root Cause Analysis on Security Vulnerabilities', ig: 'IG2' },
      { code: 'CIS-16.4', title: 'Establish and Manage an Inventory of Third-Party Software Components', ig: 'IG2' },
      { code: 'CIS-16.5', title: 'Use Up-to-Date and Trusted Third-Party Software Components', ig: 'IG2' },
      { code: 'CIS-16.6', title: 'Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities', ig: 'IG2' },
      { code: 'CIS-16.7', title: 'Use Standard Hardening Configuration Templates for Application Infrastructure', ig: 'IG2' },
      { code: 'CIS-16.8', title: 'Separate Production and Non-Production Systems', ig: 'IG2' },
      { code: 'CIS-16.9', title: 'Train Developers in Application Security Concepts and Secure Coding', ig: 'IG2' },
      { code: 'CIS-16.10', title: 'Apply Secure Design Principles in Application Architectures', ig: 'IG2' },
      { code: 'CIS-16.11', title: 'Leverage Vetted Modules or Services for Application Security Components', ig: 'IG2' },
      { code: 'CIS-16.12', title: 'Implement Code-Level Security Checks', ig: 'IG3' },
      { code: 'CIS-16.13', title: 'Conduct Application Penetration Testing', ig: 'IG3' },
      { code: 'CIS-16.14', title: 'Conduct Threat Modeling', ig: 'IG3' },
    ],
  },
  'CIS-17': {
    title: 'Incident Response Management',
    description: 'Establish a program to develop and maintain an incident response capability (e.g., policies, plans, procedures, defined roles, training, and communications) to prepare, detect, and quickly respond to an attack.',
    safeguards: [
      { code: 'CIS-17.1', title: 'Designate Personnel to Manage Incident Handling', ig: 'IG1' },
      { code: 'CIS-17.2', title: 'Establish and Maintain Contact Information for Reporting Security Incidents', ig: 'IG1' },
      { code: 'CIS-17.3', title: 'Establish and Maintain an Enterprise Process for Reporting Incidents', ig: 'IG1' },
      { code: 'CIS-17.4', title: 'Establish and Maintain an Incident Response Process', ig: 'IG1' },
      { code: 'CIS-17.5', title: 'Assign Key Roles and Responsibilities', ig: 'IG1' },
      { code: 'CIS-17.6', title: 'Define Mechanisms for Communicating During Incident Response', ig: 'IG2' },
      { code: 'CIS-17.7', title: 'Conduct Routine Incident Response Exercises', ig: 'IG2' },
      { code: 'CIS-17.8', title: 'Conduct Post-Incident Reviews', ig: 'IG2' },
      { code: 'CIS-17.9', title: 'Establish and Maintain Security Incident Thresholds', ig: 'IG3' },
    ],
  },
  'CIS-18': {
    title: 'Penetration Testing',
    description: 'Test the effectiveness and resiliency of enterprise assets through identifying and exploiting weaknesses in controls (people, processes, and technology), and simulating the objectives and actions of an attacker.',
    safeguards: [
      { code: 'CIS-18.1', title: 'Establish and Maintain a Penetration Testing Program', ig: 'IG2' },
      { code: 'CIS-18.2', title: 'Perform Periodic External Penetration Tests', ig: 'IG2' },
      { code: 'CIS-18.3', title: 'Remediate Penetration Test Findings', ig: 'IG2' },
      { code: 'CIS-18.4', title: 'Validate Security Measures', ig: 'IG3' },
      { code: 'CIS-18.5', title: 'Perform Periodic Internal Penetration Tests', ig: 'IG3' },
    ],
  },
};

/**
 * Seed CIS Controls v8.1
 */
export async function seedCISControls() {
  console.log('🔒 Seeding CIS Critical Security Controls v8.1...');

  const cisFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'CIS-CSC', version: '8.1' } },
    update: {},
    create: {
      name: 'CIS Critical Security Controls',
      shortName: 'CIS-CSC',
      version: '8.1',
      effectiveDate: new Date('2024-06-01'),
      description: 'CIS Controls v8.1 provides prioritized cybersecurity best practices across 18 control families and 153 safeguards, organized into Implementation Groups (IG1, IG2, IG3) to help organizations defend against the most common cyber attacks.',
      category: FrameworkCategory.SECURITY,
      isActive: true,
    },
  });

  let totalSafeguards = 0;

  // Seed each control family
  for (let i = 1; i <= 18; i++) {
    const controlKey = `CIS-${i}`;
    const controlData = CIS_CONTROLS[controlKey as keyof typeof CIS_CONTROLS];

    // Create parent control
    const parentControl = await prisma.control.create({
      data: {
        code: controlKey,
        title: controlData.title,
        description: controlData.description,
        frameworkId: cisFramework.id,
        sortOrder: i,
      },
    });

    // Create safeguards (child controls)
    for (let j = 0; j < controlData.safeguards.length; j++) {
      const safeguard = controlData.safeguards[j];
      await prisma.control.create({
        data: {
          code: safeguard.code,
          title: safeguard.title,
          description: `Implementation Group: ${safeguard.ig}`,
          frameworkId: cisFramework.id,
          parentId: parentControl.id,
          sortOrder: j + 1,
          guidance: `This safeguard is part of ${safeguard.ig} and should be implemented according to your organization's size and security maturity level.`,
        },
      });
      totalSafeguards++;
    }
  }

  console.log(`  ✅ CIS Controls v8.1 seeded (18 controls, ${totalSafeguards} safeguards)`);
  return cisFramework;
}

/**
 * Create mappings from CIS Controls to existing frameworks
 */
export async function seedCISMappings() {
  console.log('🔗 Creating CIS Controls cross-framework mappings...');

  // Get framework references
  const cisFramework = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'CIS-CSC', version: '8.1' } },
  });

  const nistCSF = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'NIST-CSF', version: '2.0' } },
  });

  const nistAI = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'NIST-AI-RMF', version: '1.0' } },
  });

  const iso42001 = await prisma.framework.findUnique({
    where: { shortName_version: { shortName: 'ISO-42001', version: '2023' } },
  });

  if (!cisFramework) {
    console.log('  ⚠️  CIS framework not found, skipping mappings');
    return;
  }

  // Mappings to NIST CSF 2.0 (if exists)
  if (nistCSF) {
    const nistMappings = [
      { cis: 'CIS-1', nist: 'ID.AM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address asset inventory and management' },
      { cis: 'CIS-2', nist: 'ID.AM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address software asset management' },
      { cis: 'CIS-3', nist: 'PR.DS', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address data protection and security' },
      { cis: 'CIS-4', nist: 'PR.IP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address secure configuration management' },
      { cis: 'CIS-5', nist: 'PR.AC', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address account and identity management' },
      { cis: 'CIS-6', nist: 'PR.AC', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address access control and authorization' },
      { cis: 'CIS-7', nist: 'ID.RA', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address vulnerability management' },
      { cis: 'CIS-8', nist: 'DE.CM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address logging and monitoring' },
      { cis: 'CIS-9', nist: 'PR.PT', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address protective technology' },
      { cis: 'CIS-10', nist: 'DE.CM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address malware detection and defense' },
      { cis: 'CIS-11', nist: 'RC.RP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address recovery and backup capabilities' },
      { cis: 'CIS-12', nist: 'PR.IP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address network infrastructure protection' },
      { cis: 'CIS-13', nist: 'DE.CM', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address network monitoring and defense' },
      { cis: 'CIS-14', nist: 'PR.AT', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address security awareness and training' },
      { cis: 'CIS-15', nist: 'ID.SC', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address third-party risk management' },
      { cis: 'CIS-16', nist: 'PR.IP', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address secure software development' },
      { cis: 'CIS-17', nist: 'RS.MA', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address incident response management' },
      { cis: 'CIS-18', nist: 'ID.RA', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address security testing and assessment' },
    ];

    for (const mapping of nistMappings) {
      const cisControl = await prisma.control.findFirst({
        where: { frameworkId: cisFramework.id, code: mapping.cis },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nistCSF.id, code: mapping.nist },
      });

      if (cisControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: cisControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: cisFramework.id,
            targetFrameworkId: nistCSF.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ CIS to NIST CSF 2.0 mappings created');
  }

  // Mappings to ISO 42001 (if exists) - Focus on security-relevant controls
  if (iso42001) {
    const isoMappings = [
      { cis: 'CIS-1', iso: 'A.4', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Asset inventory supports AI resource management' },
      { cis: 'CIS-3', iso: 'A.7', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Data protection aligns with AI data governance' },
      { cis: 'CIS-5', iso: 'A.3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Account management supports AI access control' },
      { cis: 'CIS-6', iso: 'A.3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Access control aligns with AI governance roles' },
      { cis: 'CIS-7', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Vulnerability management supports AI system lifecycle security' },
      { cis: 'CIS-8', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Audit logging supports AI transparency requirements' },
      { cis: 'CIS-14', iso: 'A.3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Security training supports AI workforce competency' },
      { cis: 'CIS-15', iso: 'A.10', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address third-party and supplier management' },
      { cis: 'CIS-16', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Secure development applies to AI system lifecycle' },
      { cis: 'CIS-17', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Incident response applies to AI system incidents' },
    ];

    for (const mapping of isoMappings) {
      const cisControl = await prisma.control.findFirst({
        where: { frameworkId: cisFramework.id, code: mapping.cis },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso42001.id, code: mapping.iso },
      });

      if (cisControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: cisControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: cisFramework.id,
            targetFrameworkId: iso42001.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ CIS to ISO 42001 mappings created');
  }

  // Mappings to NIST AI RMF (if exists) - Limited security-related mappings
  if (nistAI) {
    const aiMappings = [
      { cis: 'CIS-1', nist: 'GOVERN-1.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Asset inventory supports AI system inventory' },
      { cis: 'CIS-3', nist: 'MEASURE-2.4', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Data protection relates to AI privacy concerns' },
      { cis: 'CIS-7', nist: 'MEASURE-2.7', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Vulnerability management relates to AI security assessment' },
      { cis: 'CIS-8', nist: 'GOVERN-4.3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Audit logging supports AI incident identification' },
      { cis: 'CIS-14', nist: 'GOVERN-2.2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Security training relates to AI risk management training' },
      { cis: 'CIS-15', nist: 'GOVERN-6', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address third-party and supply chain risks' },
      { cis: 'CIS-17', nist: 'MANAGE-4.3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Incident response applies to AI system incidents' },
    ];

    for (const mapping of aiMappings) {
      const cisControl = await prisma.control.findFirst({
        where: { frameworkId: cisFramework.id, code: mapping.cis },
      });
      const aiControl = await prisma.control.findFirst({
        where: { frameworkId: nistAI.id, code: mapping.nist },
      });

      if (cisControl && aiControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: cisControl.id,
            targetControlId: aiControl.id,
            sourceFrameworkId: cisFramework.id,
            targetFrameworkId: nistAI.id,
            confidenceScore: mapping.confidence,
            mappingType: mapping.type,
            rationale: mapping.reason,
          },
        });
      }
    }
    console.log('  ✅ CIS to NIST AI RMF mappings created');
  }

  console.log('  ✅ CIS Controls cross-framework mappings completed');
}
