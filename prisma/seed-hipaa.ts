/**
 * HIPAA Security Rule Seed Script
 * Health Insurance Portability and Accountability Act
 *
 * Source: 45 CFR Part 160 and Part 164
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const HIPAA_SAFEGUARDS = [
  {
    code: 'HIPAA-ADM',
    title: 'Administrative Safeguards',
    description: '45 CFR § 164.308 - Administrative actions, policies, and procedures to manage security measures.',
    controls: [
      { code: 'HIPAA-164.308(a)(1)', title: 'Security Management Process', description: 'Implement policies and procedures to prevent, detect, contain, and correct security violations.' },
      { code: 'HIPAA-164.308(a)(1)(i)', title: 'Risk Analysis', description: 'Conduct accurate and thorough assessment of potential risks and vulnerabilities to ePHI.' },
      { code: 'HIPAA-164.308(a)(1)(ii)(A)', title: 'Risk Management', description: 'Implement security measures sufficient to reduce risks and vulnerabilities to reasonable level.' },
      { code: 'HIPAA-164.308(a)(1)(ii)(B)', title: 'Sanction Policy', description: 'Apply appropriate sanctions against workforce members who fail to comply with security policies.' },
      { code: 'HIPAA-164.308(a)(1)(ii)(C)', title: 'Information System Activity Review', description: 'Implement procedures to regularly review records of information system activity.' },
      { code: 'HIPAA-164.308(a)(2)', title: 'Assigned Security Responsibility', description: 'Identify the security official who is responsible for developing and implementing security policies.' },
      { code: 'HIPAA-164.308(a)(3)', title: 'Workforce Security', description: 'Implement policies and procedures to ensure workforce members have appropriate access to ePHI.' },
      { code: 'HIPAA-164.308(a)(3)(ii)(A)', title: 'Authorization and Supervision', description: 'Implement procedures for authorization and supervision of workforce members with ePHI access.' },
      { code: 'HIPAA-164.308(a)(3)(ii)(B)', title: 'Workforce Clearance', description: 'Implement procedures to determine appropriate level of access for workforce members.' },
      { code: 'HIPAA-164.308(a)(3)(ii)(C)', title: 'Termination Procedures', description: 'Implement procedures for terminating access when employment ends or access no longer needed.' },
      { code: 'HIPAA-164.308(a)(4)', title: 'Information Access Management', description: 'Implement policies and procedures for authorizing access to ePHI.' },
      { code: 'HIPAA-164.308(a)(5)', title: 'Security Awareness and Training', description: 'Implement security awareness and training program for all workforce members.' },
      { code: 'HIPAA-164.308(a)(5)(ii)(A)', title: 'Security Reminders', description: 'Periodic security updates to workforce members.' },
      { code: 'HIPAA-164.308(a)(5)(ii)(B)', title: 'Protection from Malicious Software', description: 'Procedures for guarding against, detecting, and reporting malicious software.' },
      { code: 'HIPAA-164.308(a)(5)(ii)(C)', title: 'Log-in Monitoring', description: 'Procedures for monitoring log-in attempts and reporting discrepancies.' },
      { code: 'HIPAA-164.308(a)(5)(ii)(D)', title: 'Password Management', description: 'Procedures for creating, changing, and safeguarding passwords.' },
      { code: 'HIPAA-164.308(a)(6)', title: 'Security Incident Procedures', description: 'Implement policies and procedures to address security incidents.' },
      { code: 'HIPAA-164.308(a)(6)(ii)', title: 'Response and Reporting', description: 'Identify and respond to suspected or known security incidents; document and outcomes.' },
      { code: 'HIPAA-164.308(a)(7)', title: 'Contingency Plan', description: 'Establish policies and procedures for responding to emergencies that damage systems with ePHI.' },
      { code: 'HIPAA-164.308(a)(7)(ii)(A)', title: 'Data Backup Plan', description: 'Establish and implement procedures to create and maintain retrievable exact copies of ePHI.' },
      { code: 'HIPAA-164.308(a)(7)(ii)(B)', title: 'Disaster Recovery Plan', description: 'Establish procedures to restore any loss of data.' },
      { code: 'HIPAA-164.308(a)(7)(ii)(C)', title: 'Emergency Mode Operation Plan', description: 'Establish procedures to enable continuation of critical business processes.' },
      { code: 'HIPAA-164.308(a)(7)(ii)(D)', title: 'Testing and Revision', description: 'Implement procedures for periodic testing and revision of contingency plans.' },
      { code: 'HIPAA-164.308(a)(8)', title: 'Evaluation', description: 'Perform periodic technical and non-technical evaluation based on standards.' },
      { code: 'HIPAA-164.308(b)', title: 'Business Associate Contracts', description: 'Written contracts or arrangements with business associates to ensure appropriate safeguards.' },
    ],
  },
  {
    code: 'HIPAA-PHY',
    title: 'Physical Safeguards',
    description: '45 CFR § 164.310 - Physical measures, policies, and procedures to protect electronic systems.',
    controls: [
      { code: 'HIPAA-164.310(a)(1)', title: 'Facility Access Controls', description: 'Implement policies and procedures to limit physical access to electronic information systems.' },
      { code: 'HIPAA-164.310(a)(2)(i)', title: 'Contingency Operations', description: 'Establish procedures allowing facility access in support of data restoration under disaster recovery.' },
      { code: 'HIPAA-164.310(a)(2)(ii)', title: 'Facility Security Plan', description: 'Implement policies and procedures to safeguard the facility and equipment.' },
      { code: 'HIPAA-164.310(a)(2)(iii)', title: 'Access Control and Validation', description: 'Implement procedures to control and validate person\'s access to facilities.' },
      { code: 'HIPAA-164.310(a)(2)(iv)', title: 'Maintenance Records', description: 'Implement policies and procedures to document repairs and modifications to physical components.' },
      { code: 'HIPAA-164.310(b)', title: 'Workstation Use', description: 'Implement policies and procedures for proper functions and physical attributes of workstations.' },
      { code: 'HIPAA-164.310(c)', title: 'Workstation Security', description: 'Implement physical safeguards for all workstations that access ePHI.' },
      { code: 'HIPAA-164.310(d)(1)', title: 'Device and Media Controls', description: 'Implement policies and procedures governing receipt and removal of hardware and electronic media.' },
      { code: 'HIPAA-164.310(d)(2)(i)', title: 'Disposal', description: 'Implement policies and procedures for final disposition of ePHI and/or hardware or media.' },
      { code: 'HIPAA-164.310(d)(2)(ii)', title: 'Media Re-use', description: 'Implement procedures for removal of ePHI before media is made available for re-use.' },
      { code: 'HIPAA-164.310(d)(2)(iii)', title: 'Accountability', description: 'Maintain record of movements of hardware and electronic media and any person responsible.' },
      { code: 'HIPAA-164.310(d)(2)(iv)', title: 'Data Backup and Storage', description: 'Create retrievable, exact copy of ePHI before movement of equipment.' },
    ],
  },
  {
    code: 'HIPAA-TECH',
    title: 'Technical Safeguards',
    description: '45 CFR § 164.312 - Technology and policies to protect and control access to ePHI.',
    controls: [
      { code: 'HIPAA-164.312(a)(1)', title: 'Access Control', description: 'Implement technical policies and procedures for electronic systems that maintain ePHI.' },
      { code: 'HIPAA-164.312(a)(2)(i)', title: 'Unique User Identification', description: 'Assign a unique name and/or number for identifying and tracking user identity.' },
      { code: 'HIPAA-164.312(a)(2)(ii)', title: 'Emergency Access Procedure', description: 'Establish procedures for obtaining necessary ePHI during an emergency.' },
      { code: 'HIPAA-164.312(a)(2)(iii)', title: 'Automatic Logoff', description: 'Implement electronic procedures that terminate session after predetermined time of inactivity.' },
      { code: 'HIPAA-164.312(a)(2)(iv)', title: 'Encryption and Decryption', description: 'Implement mechanism to encrypt and decrypt ePHI.' },
      { code: 'HIPAA-164.312(b)', title: 'Audit Controls', description: 'Implement hardware, software, and procedures that record and examine activity in systems with ePHI.' },
      { code: 'HIPAA-164.312(c)(1)', title: 'Integrity', description: 'Implement policies and procedures to protect ePHI from improper alteration or destruction.' },
      { code: 'HIPAA-164.312(c)(2)', title: 'Mechanism to Authenticate ePHI', description: 'Implement electronic mechanisms to corroborate that ePHI has not been altered or destroyed.' },
      { code: 'HIPAA-164.312(d)', title: 'Person or Entity Authentication', description: 'Implement procedures to verify that person or entity seeking access is the one claimed.' },
      { code: 'HIPAA-164.312(e)(1)', title: 'Transmission Security', description: 'Implement technical security measures to guard against unauthorized access during electronic transmission.' },
      { code: 'HIPAA-164.312(e)(2)(i)', title: 'Integrity Controls', description: 'Implement security measures to ensure electronically transmitted ePHI is not improperly modified.' },
      { code: 'HIPAA-164.312(e)(2)(ii)', title: 'Encryption', description: 'Implement mechanism to encrypt ePHI whenever deemed appropriate.' },
    ],
  },
  {
    code: 'HIPAA-ORG',
    title: 'Organizational Requirements',
    description: '45 CFR § 164.314 - Requirements for business associate contracts and group health plans.',
    controls: [
      { code: 'HIPAA-164.314(a)', title: 'Business Associate Contracts', description: 'Contract must provide that business associate will comply with applicable HIPAA requirements.' },
      { code: 'HIPAA-164.314(b)', title: 'Group Health Plan Requirements', description: 'Group health plan must ensure adequate separation between plan and sponsor.' },
    ],
  },
  {
    code: 'HIPAA-DOC',
    title: 'Documentation Requirements',
    description: '45 CFR § 164.316 - Policies, procedures, and documentation requirements.',
    controls: [
      { code: 'HIPAA-164.316(a)', title: 'Policies and Procedures', description: 'Implement reasonable and appropriate policies and procedures to comply with standards.' },
      { code: 'HIPAA-164.316(b)(1)', title: 'Documentation', description: 'Maintain policies and procedures implemented and any action, activity, or assessment required.' },
      { code: 'HIPAA-164.316(b)(2)(i)', title: 'Time Limit', description: 'Retain documentation for 6 years from date of creation or last effective date.' },
      { code: 'HIPAA-164.316(b)(2)(ii)', title: 'Availability', description: 'Make documentation available to those persons responsible for implementing procedures.' },
      { code: 'HIPAA-164.316(b)(2)(iii)', title: 'Updates', description: 'Review documentation periodically and update as needed in response to changes.' },
    ],
  },
];

export async function seedHIPAA() {
  console.log('📗 Seeding HIPAA Security Rule...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'HIPAA', version: '2013' } },
    update: {},
    create: {
      name: 'HIPAA Security Rule',
      shortName: 'HIPAA',
      version: '2013',
      effectiveDate: new Date('2013-01-25'),
      description: 'Health Insurance Portability and Accountability Act Security Rule - Standards for protecting electronic protected health information (ePHI).',
      category: FrameworkCategory.COMPLIANCE,
      isActive: true,
    },
  });

  for (let i = 0; i < HIPAA_SAFEGUARDS.length; i++) {
    const safeguard = HIPAA_SAFEGUARDS[i];
    const safeguardControl = await prisma.control.create({
      data: {
        code: safeguard.code,
        title: safeguard.title,
        description: safeguard.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < safeguard.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: safeguard.controls[j].code,
          title: safeguard.controls[j].title,
          description: safeguard.controls[j].description,
          frameworkId: framework.id,
          parentId: safeguardControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ HIPAA Security Rule seeded (5 safeguard categories, 56 controls)');
  return framework;
}

export async function seedHIPAAMappings() {
  console.log('🔗 Creating HIPAA cross-framework mappings...');

  const hipaa = await prisma.framework.findFirst({
    where: { shortName: 'HIPAA', version: '2013' },
  });
  const nist80053 = await prisma.framework.findFirst({
    where: { shortName: 'NIST-800-53', version: '5' },
  });
  const iso27001 = await prisma.framework.findFirst({
    where: { shortName: 'ISO-27001', version: '2022' },
  });

  if (!hipaa) {
    console.log('  ⚠️  HIPAA framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // HIPAA to NIST 800-53 mappings
  if (nist80053) {
    const nistMappings = [
      { hipaa: 'HIPAA-ADM', nist: 'PM', reason: 'Administrative safeguards to program management' },
      { hipaa: 'HIPAA-ADM', nist: 'AT', reason: 'Security awareness to awareness training' },
      { hipaa: 'HIPAA-PHY', nist: 'PE', reason: 'Physical safeguards alignment' },
      { hipaa: 'HIPAA-TECH', nist: 'AC', reason: 'Technical safeguards to access control' },
      { hipaa: 'HIPAA-TECH', nist: 'AU', reason: 'Audit controls alignment' },
    ];

    for (const mapping of nistMappings) {
      const hipaaControl = await prisma.control.findFirst({
        where: { frameworkId: hipaa.id, code: mapping.hipaa },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nist80053.id, code: mapping.nist },
      });

      if (hipaaControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: hipaaControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: hipaa.id,
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

  // HIPAA to ISO 27001 mappings
  if (iso27001) {
    const isoMappings = [
      { hipaa: 'HIPAA-ADM', iso: 'A.5', reason: 'Administrative to information security policies' },
      { hipaa: 'HIPAA-PHY', iso: 'A.11', reason: 'Physical safeguards alignment' },
      { hipaa: 'HIPAA-TECH', iso: 'A.9', reason: 'Technical to access control' },
    ];

    for (const mapping of isoMappings) {
      const hipaaControl = await prisma.control.findFirst({
        where: { frameworkId: hipaa.id, code: mapping.hipaa },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso27001.id, code: mapping.iso },
      });

      if (hipaaControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: hipaaControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: hipaa.id,
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

  console.log(`  ✅ Created ${created} HIPAA cross-framework mappings`);
}
