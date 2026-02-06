/**
 * Enterprise AI Frameworks Seed Script
 * Google SAIF, Microsoft RAI, Singapore AI Gov, OECD AI Principles
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Google Secure AI Framework (SAIF)
// ============================================================================

const GOOGLE_SAIF_ELEMENTS = [
  {
    code: 'SAIF-1',
    title: 'Strong Security Foundations',
    description: 'Leverage existing security controls and extend to AI systems.',
    controls: [
      { code: 'SAIF-1.1', title: 'Infrastructure Security', description: 'Apply proven infrastructure security controls to AI workloads.' },
      { code: 'SAIF-1.2', title: 'Network Security', description: 'Implement network segmentation and monitoring for AI systems.' },
      { code: 'SAIF-1.3', title: 'Identity and Access', description: 'Apply zero trust principles to AI system access.' },
    ],
  },
  {
    code: 'SAIF-2',
    title: 'Detection and Response',
    description: 'Extend detection and response to include AI-specific threats.',
    controls: [
      { code: 'SAIF-2.1', title: 'AI Threat Detection', description: 'Implement detection for adversarial attacks, data poisoning, and model theft.' },
      { code: 'SAIF-2.2', title: 'Incident Response', description: 'Develop AI-specific incident response playbooks and capabilities.' },
      { code: 'SAIF-2.3', title: 'Monitoring', description: 'Implement continuous monitoring of AI model behavior and performance.' },
    ],
  },
  {
    code: 'SAIF-3',
    title: 'AI System Development Security',
    description: 'Secure the AI development lifecycle including data, training, and deployment.',
    controls: [
      { code: 'SAIF-3.1', title: 'Secure Data Pipeline', description: 'Protect training data integrity, provenance, and confidentiality.' },
      { code: 'SAIF-3.2', title: 'Model Development', description: 'Implement secure development practices for ML pipelines.' },
      { code: 'SAIF-3.3', title: 'Deployment Security', description: 'Secure model serving infrastructure and APIs.' },
    ],
  },
  {
    code: 'SAIF-4',
    title: 'AI Model Security',
    description: 'Protect models against adversarial attacks and extraction.',
    controls: [
      { code: 'SAIF-4.1', title: 'Adversarial Robustness', description: 'Test and harden models against adversarial examples.' },
      { code: 'SAIF-4.2', title: 'Model Theft Prevention', description: 'Implement controls to prevent model extraction and reverse engineering.' },
      { code: 'SAIF-4.3', title: 'Backdoor Detection', description: 'Scan for and detect potential backdoors in models.' },
    ],
  },
  {
    code: 'SAIF-5',
    title: 'Third-Party AI Security',
    description: 'Manage security risks from third-party AI components and services.',
    controls: [
      { code: 'SAIF-5.1', title: 'Vendor Assessment', description: 'Assess security posture of third-party AI services and models.' },
      { code: 'SAIF-5.2', title: 'Supply Chain', description: 'Manage risks from pre-trained models, datasets, and AI libraries.' },
      { code: 'SAIF-5.3', title: 'Contractual Controls', description: 'Include security requirements in AI vendor contracts.' },
    ],
  },
  {
    code: 'SAIF-6',
    title: 'AI Security Governance',
    description: 'Establish governance processes for AI security.',
    controls: [
      { code: 'SAIF-6.1', title: 'Policy and Standards', description: 'Develop AI-specific security policies and standards.' },
      { code: 'SAIF-6.2', title: 'Risk Management', description: 'Integrate AI risks into enterprise risk management.' },
      { code: 'SAIF-6.3', title: 'Training and Awareness', description: 'Train developers and users on AI security risks.' },
    ],
  },
];

// ============================================================================
// Microsoft Responsible AI (RAI)
// ============================================================================

const MICROSOFT_RAI_PRINCIPLES = [
  {
    code: 'MS-RAI-1',
    title: 'Fairness',
    description: 'AI systems should treat all people fairly and avoid affecting similarly situated groups differently.',
    controls: [
      { code: 'MS-RAI-1.1', title: 'Bias Assessment', description: 'Assess AI systems for potential biases that could lead to unfair treatment.' },
      { code: 'MS-RAI-1.2', title: 'Disparate Impact', description: 'Evaluate and mitigate disparate impact across protected groups.' },
      { code: 'MS-RAI-1.3', title: 'Fairness Metrics', description: 'Define and measure fairness metrics appropriate to the use case.' },
    ],
  },
  {
    code: 'MS-RAI-2',
    title: 'Reliability and Safety',
    description: 'AI systems should perform reliably and safely, behaving as intended.',
    controls: [
      { code: 'MS-RAI-2.1', title: 'Performance Testing', description: 'Test AI systems across diverse conditions to ensure reliable performance.' },
      { code: 'MS-RAI-2.2', title: 'Failure Mode Analysis', description: 'Identify and mitigate potential failure modes and their impacts.' },
      { code: 'MS-RAI-2.3', title: 'Safety Boundaries', description: 'Define and enforce safety boundaries for AI system behavior.' },
    ],
  },
  {
    code: 'MS-RAI-3',
    title: 'Privacy and Security',
    description: 'AI systems should be secure and respect privacy.',
    controls: [
      { code: 'MS-RAI-3.1', title: 'Data Privacy', description: 'Protect personal data used in training and inference.' },
      { code: 'MS-RAI-3.2', title: 'Security Controls', description: 'Implement security controls against adversarial attacks.' },
      { code: 'MS-RAI-3.3', title: 'Confidentiality', description: 'Protect model confidentiality and prevent information leakage.' },
    ],
  },
  {
    code: 'MS-RAI-4',
    title: 'Inclusiveness',
    description: 'AI systems should empower everyone and engage people.',
    controls: [
      { code: 'MS-RAI-4.1', title: 'Accessibility', description: 'Design AI systems that are accessible to people with disabilities.' },
      { code: 'MS-RAI-4.2', title: 'Diverse Representation', description: 'Ensure diverse representation in training data and use cases.' },
      { code: 'MS-RAI-4.3', title: 'Stakeholder Engagement', description: 'Engage diverse stakeholders in AI system design and evaluation.' },
    ],
  },
  {
    code: 'MS-RAI-5',
    title: 'Transparency',
    description: 'AI systems should be understandable.',
    controls: [
      { code: 'MS-RAI-5.1', title: 'Explainability', description: 'Provide explanations for AI system decisions appropriate to the context.' },
      { code: 'MS-RAI-5.2', title: 'Documentation', description: 'Document AI system capabilities, limitations, and intended uses.' },
      { code: 'MS-RAI-5.3', title: 'Disclosure', description: 'Disclose when users are interacting with AI systems.' },
    ],
  },
  {
    code: 'MS-RAI-6',
    title: 'Accountability',
    description: 'People should be accountable for AI systems.',
    controls: [
      { code: 'MS-RAI-6.1', title: 'Governance', description: 'Establish clear governance structures and accountability for AI systems.' },
      { code: 'MS-RAI-6.2', title: 'Impact Assessment', description: 'Conduct impact assessments before deploying AI systems.' },
      { code: 'MS-RAI-6.3', title: 'Redress Mechanisms', description: 'Provide mechanisms for addressing harms caused by AI systems.' },
    ],
  },
];

// ============================================================================
// OECD AI Principles
// ============================================================================

const OECD_AI_PRINCIPLES = [
  {
    code: 'OECD-AI-1',
    title: 'Inclusive Growth and Sustainable Development',
    description: 'AI should benefit people and the planet by driving inclusive growth and sustainable development.',
    controls: [
      { code: 'OECD-AI-1.1', title: 'Societal Benefit', description: 'AI should augment human capabilities and enhance creativity.' },
      { code: 'OECD-AI-1.2', title: 'Environmental Consideration', description: 'Consider environmental impact of AI systems.' },
    ],
  },
  {
    code: 'OECD-AI-2',
    title: 'Human-Centered Values',
    description: 'AI systems should be designed in a way that respects human rights, diversity, and autonomy.',
    controls: [
      { code: 'OECD-AI-2.1', title: 'Human Rights', description: 'Ensure AI respects fundamental human rights.' },
      { code: 'OECD-AI-2.2', title: 'Democratic Values', description: 'Design AI that supports democratic values and processes.' },
    ],
  },
  {
    code: 'OECD-AI-3',
    title: 'Transparency and Explainability',
    description: 'There should be meaningful transparency around AI systems.',
    controls: [
      { code: 'OECD-AI-3.1', title: 'System Disclosure', description: 'Enable people to understand when they interact with AI.' },
      { code: 'OECD-AI-3.2', title: 'Result Explanation', description: 'Provide explanations of AI system outcomes.' },
    ],
  },
  {
    code: 'OECD-AI-4',
    title: 'Robustness, Security and Safety',
    description: 'AI systems should be robust, secure and safe throughout their lifecycle.',
    controls: [
      { code: 'OECD-AI-4.1', title: 'Security', description: 'Protect AI systems from unauthorized access and manipulation.' },
      { code: 'OECD-AI-4.2', title: 'Risk Management', description: 'Apply systematic risk management to AI systems.' },
    ],
  },
  {
    code: 'OECD-AI-5',
    title: 'Accountability',
    description: 'Organizations and individuals should be accountable for AI systems they develop and deploy.',
    controls: [
      { code: 'OECD-AI-5.1', title: 'Accountability Mechanisms', description: 'Establish clear accountability for AI system outcomes.' },
      { code: 'OECD-AI-5.2', title: 'Redress', description: 'Provide mechanisms for challenging AI decisions.' },
    ],
  },
];

// ============================================================================
// Singapore AI Governance Framework
// ============================================================================

const SINGAPORE_AI_GOV = [
  {
    code: 'SG-AI-1',
    title: 'Internal Governance Structures and Measures',
    description: 'Organizations using AI should have governance structures for accountability.',
    controls: [
      { code: 'SG-AI-1.1', title: 'Clear Roles', description: 'Assign clear roles and responsibilities for AI governance.' },
      { code: 'SG-AI-1.2', title: 'Risk Management', description: 'Establish AI risk management aligned with enterprise risk.' },
      { code: 'SG-AI-1.3', title: 'Policies and Procedures', description: 'Develop policies for ethical AI development and use.' },
    ],
  },
  {
    code: 'SG-AI-2',
    title: 'Determining AI Decision-Making Model',
    description: 'Determine the level of human involvement in AI-augmented decision-making.',
    controls: [
      { code: 'SG-AI-2.1', title: 'Human-in-the-Loop', description: 'Humans actively involved in every decision cycle.' },
      { code: 'SG-AI-2.2', title: 'Human-on-the-Loop', description: 'Humans oversee AI decisions with ability to intervene.' },
      { code: 'SG-AI-2.3', title: 'Human-out-of-the-Loop', description: 'AI operates autonomously with human oversight at system level.' },
    ],
  },
  {
    code: 'SG-AI-3',
    title: 'Operations Management',
    description: 'Ensure AI systems operate as intended throughout their lifecycle.',
    controls: [
      { code: 'SG-AI-3.1', title: 'Data Quality', description: 'Ensure quality, representativeness, and appropriateness of data.' },
      { code: 'SG-AI-3.2', title: 'Algorithm Selection', description: 'Select algorithms appropriate for the use case and risk level.' },
      { code: 'SG-AI-3.3', title: 'Monitoring', description: 'Implement ongoing monitoring of AI system performance.' },
    ],
  },
  {
    code: 'SG-AI-4',
    title: 'Stakeholder Interaction and Communication',
    description: 'Communicate with stakeholders about AI use and provide feedback mechanisms.',
    controls: [
      { code: 'SG-AI-4.1', title: 'Transparency', description: 'Communicate AI use clearly to affected stakeholders.' },
      { code: 'SG-AI-4.2', title: 'Explainability', description: 'Provide explanations for AI decisions that affect individuals.' },
      { code: 'SG-AI-4.3', title: 'Feedback Channels', description: 'Establish channels for stakeholders to provide feedback.' },
    ],
  },
];

export async function seedGoogleSAIF() {
  console.log('📘 Seeding Google SAIF...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'GOOGLE-SAIF', version: '1.0' } },
    update: {},
    create: {
      name: 'Google Secure AI Framework',
      shortName: 'GOOGLE-SAIF',
      version: '1.0',
      effectiveDate: new Date('2023-06-01'),
      description: 'Google\'s framework for securing AI systems. Extends traditional security controls to address AI-specific threats and vulnerabilities.',
      category: FrameworkCategory.AI_RISK,
      isActive: true,
    },
  });

  for (let i = 0; i < GOOGLE_SAIF_ELEMENTS.length; i++) {
    const element = GOOGLE_SAIF_ELEMENTS[i];
    const elementControl = await prisma.control.create({
      data: {
        code: element.code,
        title: element.title,
        description: element.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < element.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: element.controls[j].code,
          title: element.controls[j].title,
          description: element.controls[j].description,
          frameworkId: framework.id,
          parentId: elementControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ Google SAIF seeded (6 elements, 18 controls)');
  return framework;
}

export async function seedMicrosoftRAI() {
  console.log('📗 Seeding Microsoft Responsible AI...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'MS-RAI', version: '1.0' } },
    update: {},
    create: {
      name: 'Microsoft Responsible AI Standard',
      shortName: 'MS-RAI',
      version: '1.0',
      effectiveDate: new Date('2022-06-01'),
      description: 'Microsoft\'s principles and practices for responsible AI development focusing on fairness, reliability, privacy, inclusiveness, transparency, and accountability.',
      category: FrameworkCategory.AI_MANAGEMENT,
      isActive: true,
    },
  });

  for (let i = 0; i < MICROSOFT_RAI_PRINCIPLES.length; i++) {
    const principle = MICROSOFT_RAI_PRINCIPLES[i];
    const principleControl = await prisma.control.create({
      data: {
        code: principle.code,
        title: principle.title,
        description: principle.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < principle.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: principle.controls[j].code,
          title: principle.controls[j].title,
          description: principle.controls[j].description,
          frameworkId: framework.id,
          parentId: principleControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ Microsoft RAI seeded (6 principles, 18 controls)');
  return framework;
}

export async function seedOECDAI() {
  console.log('📙 Seeding OECD AI Principles...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'OECD-AI', version: '2019' } },
    update: {},
    create: {
      name: 'OECD Principles on AI',
      shortName: 'OECD-AI',
      version: '2019',
      effectiveDate: new Date('2019-05-22'),
      description: 'First intergovernmental AI principles adopted by 46 countries. Promotes trustworthy AI that respects human rights and democratic values.',
      category: FrameworkCategory.AI_MANAGEMENT,
      isActive: true,
    },
  });

  for (let i = 0; i < OECD_AI_PRINCIPLES.length; i++) {
    const principle = OECD_AI_PRINCIPLES[i];
    const principleControl = await prisma.control.create({
      data: {
        code: principle.code,
        title: principle.title,
        description: principle.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < principle.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: principle.controls[j].code,
          title: principle.controls[j].title,
          description: principle.controls[j].description,
          frameworkId: framework.id,
          parentId: principleControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ OECD AI Principles seeded (5 principles, 10 controls)');
  return framework;
}

export async function seedSingaporeAI() {
  console.log('📕 Seeding Singapore AI Governance Framework...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'SG-AI-GOV', version: '2.0' } },
    update: {},
    create: {
      name: 'Singapore Model AI Governance Framework',
      shortName: 'SG-AI-GOV',
      version: '2.0',
      effectiveDate: new Date('2020-01-21'),
      description: 'Practical guidance for implementing AI governance in organizations. Focuses on accountability, transparency, and human-centricity.',
      category: FrameworkCategory.AI_MANAGEMENT,
      isActive: true,
    },
  });

  for (let i = 0; i < SINGAPORE_AI_GOV.length; i++) {
    const area = SINGAPORE_AI_GOV[i];
    const areaControl = await prisma.control.create({
      data: {
        code: area.code,
        title: area.title,
        description: area.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < area.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: area.controls[j].code,
          title: area.controls[j].title,
          description: area.controls[j].description,
          frameworkId: framework.id,
          parentId: areaControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ Singapore AI Governance seeded (4 areas, 12 controls)');
  return framework;
}

export async function seedEnterpriseAIMappings() {
  console.log('🔗 Creating Enterprise AI framework cross-mappings...');

  const saif = await prisma.framework.findFirst({ where: { shortName: 'GOOGLE-SAIF' } });
  const msrai = await prisma.framework.findFirst({ where: { shortName: 'MS-RAI' } });
  const nistai = await prisma.framework.findFirst({ where: { shortName: 'NIST-AI-RMF' } });
  const iso42001 = await prisma.framework.findFirst({ where: { shortName: 'ISO-42001' } });

  let created = 0;

  // Google SAIF to NIST AI RMF mappings
  if (saif && nistai) {
    const saifNistMappings = [
      { saif: 'SAIF-1', nist: 'GOVERN-1', reason: 'Security foundations to governance policies' },
      { saif: 'SAIF-2', nist: 'MANAGE-4', reason: 'Detection and response to incident management' },
      { saif: 'SAIF-3', nist: 'MAP-2', reason: 'Development security to system characterization' },
      { saif: 'SAIF-4', nist: 'MEASURE-2', reason: 'Model security to trustworthiness assessment' },
      { saif: 'SAIF-5', nist: 'GOVERN-6', reason: 'Third-party security to supply chain risk' },
      { saif: 'SAIF-6', nist: 'GOVERN-1', reason: 'Security governance alignment' },
    ];

    for (const mapping of saifNistMappings) {
      const saifControl = await prisma.control.findFirst({
        where: { frameworkId: saif.id, code: mapping.saif },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nistai.id, code: mapping.nist },
      });

      if (saifControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: saifControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: saif.id,
            targetFrameworkId: nistai.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  // Microsoft RAI to ISO 42001 mappings
  if (msrai && iso42001) {
    const msraiIsoMappings = [
      { msrai: 'MS-RAI-1', iso: 'A.5', reason: 'Fairness to impact assessment' },
      { msrai: 'MS-RAI-2', iso: 'A.6', reason: 'Reliability to lifecycle management' },
      { msrai: 'MS-RAI-3', iso: 'A.7', reason: 'Privacy to data management' },
      { msrai: 'MS-RAI-5', iso: 'A.8', reason: 'Transparency to information for parties' },
      { msrai: 'MS-RAI-6', iso: 'A.3', reason: 'Accountability to internal organization' },
    ];

    for (const mapping of msraiIsoMappings) {
      const msraiControl = await prisma.control.findFirst({
        where: { frameworkId: msrai.id, code: mapping.msrai },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso42001.id, code: mapping.iso },
      });

      if (msraiControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: msraiControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: msrai.id,
            targetFrameworkId: iso42001.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} Enterprise AI cross-framework mappings`);
}
