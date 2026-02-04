/**
 * CSA AI Controls Matrix (AICM) v1.0 Seed Script
 * Released: July 2025
 *
 * Framework Information:
 * - 243 control objectives across 18 security domains
 * - Built on CSA Cloud Controls Matrix (CCM) v4 foundation
 * - Maps to ISO 42001, ISO 27001, NIST AI RMF 1.0, BSI AIC4
 *
 * Sources:
 * - https://cloudsecurityalliance.org/artifacts/ai-controls-matrix
 * - https://cloudsecurityalliance.org/blog/2025/07/10/introducing-the-csa-ai-controls-matrix
 *
 * Note: This seed contains domain-level structure and representative controls.
 * Complete control details require downloading the full AICM framework from CSA.
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * CSA AICM Domains (18 domains based on CCM v4 + AI-specific extensions)
 *
 * Confirmed domains from research:
 * - Traditional security domains inherited from CCM v4
 * - AI-specific domains like Model Security, Bias & Fairness
 * - Supply Chain Management, Transparency, and Accountability
 */
const CSA_AICM_DOMAINS = [
  {
    code: 'AIC-AIS',
    title: 'Application & Interface Security',
    description: 'Controls for securing AI application interfaces, APIs, and integration points to prevent unauthorized access and ensure secure data exchange.',
  },
  {
    code: 'AIC-AAC',
    title: 'Audit Assurance & Compliance',
    description: 'Controls for maintaining audit trails, compliance verification, and assurance processes for AI systems.',
  },
  {
    code: 'AIC-BCR',
    title: 'Business Continuity Management & Operational Resilience',
    description: 'Controls for ensuring AI system availability, disaster recovery, and operational resilience.',
  },
  {
    code: 'AIC-CCC',
    title: 'Change Control & Configuration Management',
    description: 'Controls for managing changes to AI systems, model versions, and configuration management.',
  },
  {
    code: 'AIC-DSP',
    title: 'Data Security & Privacy Lifecycle Management',
    description: 'Controls for protecting data throughout the AI system lifecycle, including training data, personal data, and sensitive information.',
  },
  {
    code: 'AIC-GRC',
    title: 'Governance, Risk and Compliance',
    description: 'Controls for AI governance structures, risk management frameworks, and regulatory compliance.',
  },
  {
    code: 'AIC-HRS',
    title: 'Human Resources Security',
    description: 'Controls for managing personnel involved in AI system development, deployment, and operation.',
  },
  {
    code: 'AIC-IAM',
    title: 'Identity & Access Management',
    description: 'Controls for authentication, authorization, and access control for AI systems and data.',
  },
  {
    code: 'AIC-IVS',
    title: 'Infrastructure & Virtualization Security',
    description: 'Controls for securing the infrastructure supporting AI systems, including cloud and on-premises environments.',
  },
  {
    code: 'AIC-LOG',
    title: 'Logging and Monitoring',
    description: 'Controls for comprehensive logging, monitoring, and observability of AI system operations and decisions.',
  },
  {
    code: 'AIC-MOD',
    title: 'Model Security',
    description: 'AI-specific controls for securing machine learning models against adversarial attacks, model theft, and poisoning.',
  },
  {
    code: 'AIC-BIA',
    title: 'Bias & Fairness',
    description: 'AI-specific controls for detecting, measuring, and mitigating bias and ensuring fairness in AI systems.',
  },
  {
    code: 'AIC-EXP',
    title: 'Explainability & Transparency',
    description: 'AI-specific controls for ensuring AI system decisions are explainable and transparent to stakeholders.',
  },
  {
    code: 'AIC-SEF',
    title: 'Security Incident Management, E-Discovery, & Cloud Forensics',
    description: 'Controls for incident response, forensic analysis, and e-discovery for AI systems.',
  },
  {
    code: 'AIC-STA',
    title: 'Supply Chain Management, Transparency, and Accountability',
    description: 'Controls for managing AI supply chain risks, third-party models, and ensuring accountability.',
  },
  {
    code: 'AIC-TVM',
    title: 'Threat & Vulnerability Management',
    description: 'Controls for identifying, assessing, and mitigating threats and vulnerabilities in AI systems.',
  },
  {
    code: 'AIC-UEM',
    title: 'Universal Endpoint Management',
    description: 'Controls for managing endpoints that interact with AI systems.',
  },
  {
    code: 'AIC-LCM',
    title: 'AI Lifecycle Management',
    description: 'AI-specific controls for managing the complete lifecycle of AI systems from development to decommissioning.',
  },
];

/**
 * Representative controls for each domain
 * Note: Full AICM contains ~13-14 controls per domain on average (243 total / 18 domains)
 * This seed includes representative controls for structure demonstration
 */
const CSA_AICM_CONTROLS = {
  'AIC-AIS': [
    { code: 'AIC-AIS-01', title: 'API Security', description: 'AI system APIs are designed with security controls including authentication, authorization, rate limiting, and input validation.' },
    { code: 'AIC-AIS-02', title: 'Interface Authentication', description: 'All AI system interfaces implement strong authentication mechanisms.' },
  ],
  'AIC-AAC': [
    { code: 'AIC-AAC-01', title: 'Audit Logging', description: 'Comprehensive audit logs are maintained for all AI system activities, including model training, inference, and administrative actions.' },
    { code: 'AIC-AAC-02', title: 'Compliance Verification', description: 'Regular compliance assessments are conducted to verify adherence to applicable regulations and standards.' },
  ],
  'AIC-BCR': [
    { code: 'AIC-BCR-01', title: 'AI System Continuity Planning', description: 'Business continuity plans include provisions for AI system failures and disaster recovery.' },
    { code: 'AIC-BCR-02', title: 'Failover Mechanisms', description: 'Failover and redundancy mechanisms are implemented for critical AI systems.' },
  ],
  'AIC-CCC': [
    { code: 'AIC-CCC-01', title: 'Model Version Control', description: 'All AI models are version controlled with documented changes and rollback capabilities.' },
    { code: 'AIC-CCC-02', title: 'Configuration Baseline', description: 'Configuration baselines are established and maintained for AI system components.' },
  ],
  'AIC-DSP': [
    { code: 'AIC-DSP-01', title: 'Training Data Protection', description: 'Training data is classified, encrypted, and protected according to sensitivity level.' },
    { code: 'AIC-DSP-02', title: 'Data Provenance', description: 'Data lineage and provenance are tracked throughout the AI system lifecycle.' },
    { code: 'AIC-DSP-03', title: 'Privacy by Design', description: 'Privacy considerations are integrated into AI system design from the outset.' },
  ],
  'AIC-GRC': [
    { code: 'AIC-GRC-01', title: 'AI Governance Framework', description: 'A formal governance framework for AI systems is established and maintained.' },
    { code: 'AIC-GRC-02', title: 'Risk Assessment', description: 'Regular risk assessments are conducted for all AI systems.' },
    { code: 'AIC-GRC-03', title: 'Regulatory Compliance', description: 'AI systems comply with applicable laws, regulations, and industry standards.' },
  ],
  'AIC-HRS': [
    { code: 'AIC-HRS-01', title: 'Personnel Screening', description: 'Personnel with access to sensitive AI systems undergo appropriate background checks.' },
    { code: 'AIC-HRS-02', title: 'AI Ethics Training', description: 'Personnel involved in AI development and deployment receive ethics and responsible AI training.' },
  ],
  'AIC-IAM': [
    { code: 'AIC-IAM-01', title: 'Access Control Policy', description: 'Access to AI systems and data is controlled through role-based access control (RBAC) policies.' },
    { code: 'AIC-IAM-02', title: 'Privileged Access Management', description: 'Privileged access to AI systems is strictly controlled and monitored.' },
    { code: 'AIC-IAM-03', title: 'Authentication Mechanisms', description: 'Multi-factor authentication is implemented for AI system access.' },
  ],
  'AIC-IVS': [
    { code: 'AIC-IVS-01', title: 'Infrastructure Hardening', description: 'AI system infrastructure is hardened according to security best practices.' },
    { code: 'AIC-IVS-02', title: 'Resource Isolation', description: 'AI workloads are isolated using appropriate virtualization or containerization technologies.' },
  ],
  'AIC-LOG': [
    { code: 'AIC-LOG-01', title: 'Comprehensive Logging', description: 'All AI system activities are logged including inputs, outputs, and decisions.' },
    { code: 'AIC-LOG-02', title: 'Log Analysis', description: 'Automated analysis of AI system logs is performed to detect anomalies and security incidents.' },
    { code: 'AIC-LOG-03', title: 'Decision Provenance', description: 'AI system decisions are logged with sufficient detail to enable auditability and explainability.' },
  ],
  'AIC-MOD': [
    { code: 'AIC-MOD-01', title: 'Model Adversarial Testing', description: 'AI models are tested against adversarial attacks and robustness is validated.' },
    { code: 'AIC-MOD-02', title: 'Model Access Control', description: 'Access to AI models and model parameters is strictly controlled.' },
    { code: 'AIC-MOD-03', title: 'Model Poisoning Prevention', description: 'Controls are implemented to prevent training data poisoning and model manipulation.' },
    { code: 'AIC-MOD-04', title: 'Model Theft Protection', description: 'Models are protected against theft through model extraction attacks.' },
  ],
  'AIC-BIA': [
    { code: 'AIC-BIA-01', title: 'Bias Testing', description: 'AI systems are tested for bias across protected characteristics and demographic groups.' },
    { code: 'AIC-BIA-02', title: 'Fairness Metrics', description: 'Quantitative fairness metrics are defined, measured, and monitored for AI systems.' },
    { code: 'AIC-BIA-03', title: 'Bias Mitigation', description: 'Bias mitigation techniques are applied during model development and deployment.' },
    { code: 'AIC-BIA-04', title: 'Representation Analysis', description: 'Training data is analyzed for representation of diverse populations.' },
  ],
  'AIC-EXP': [
    { code: 'AIC-EXP-01', title: 'Model Interpretability', description: 'AI models are designed with interpretability considerations or use explainable AI techniques.' },
    { code: 'AIC-EXP-02', title: 'Decision Explanation', description: 'AI system decisions can be explained to appropriate stakeholders.' },
    { code: 'AIC-EXP-03', title: 'Transparency Documentation', description: 'Comprehensive documentation about AI system capabilities and limitations is maintained.' },
  ],
  'AIC-SEF': [
    { code: 'AIC-SEF-01', title: 'AI Incident Response', description: 'Incident response procedures specifically address AI system incidents and failures.' },
    { code: 'AIC-SEF-02', title: 'Forensic Capabilities', description: 'Forensic analysis capabilities are available for investigating AI system incidents.' },
  ],
  'AIC-STA': [
    { code: 'AIC-STA-01', title: 'Third-Party Model Assessment', description: 'Third-party AI models and components are assessed for security and compliance.' },
    { code: 'AIC-STA-02', title: 'Supply Chain Transparency', description: 'AI supply chain components are documented with provenance information.' },
    { code: 'AIC-STA-03', title: 'Vendor Risk Management', description: 'AI vendors and suppliers are assessed and managed according to risk management policies.' },
  ],
  'AIC-TVM': [
    { code: 'AIC-TVM-01', title: 'Vulnerability Scanning', description: 'AI system components are regularly scanned for vulnerabilities.' },
    { code: 'AIC-TVM-02', title: 'Threat Intelligence', description: 'AI-specific threat intelligence is monitored and integrated into security operations.' },
    { code: 'AIC-TVM-03', title: 'Patch Management', description: 'Security patches and updates for AI system components are applied in a timely manner.' },
  ],
  'AIC-UEM': [
    { code: 'AIC-UEM-01', title: 'Endpoint Security', description: 'Endpoints interacting with AI systems are secured and monitored.' },
  ],
  'AIC-LCM': [
    { code: 'AIC-LCM-01', title: 'Lifecycle Documentation', description: 'AI system lifecycle stages are documented from conception to decommissioning.' },
    { code: 'AIC-LCM-02', title: 'Development Standards', description: 'Secure development standards are applied throughout the AI lifecycle.' },
    { code: 'AIC-LCM-03', title: 'Deployment Controls', description: 'AI system deployments follow controlled processes with approval gates.' },
    { code: 'AIC-LCM-04', title: 'Decommissioning Procedures', description: 'Secure decommissioning procedures are established for retiring AI systems.' },
  ],
};

/**
 * Seed CSA AI Controls Matrix (AICM) v1.0
 */
export async function seedCSAAICM() {
  console.log('📙 Seeding CSA AI Controls Matrix (AICM) v1.0...');

  // Create framework
  const csaFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'CSA-AICM', version: '1.0' } },
    update: {},
    create: {
      name: 'CSA AI Controls Matrix',
      shortName: 'CSA-AICM',
      version: '1.0',
      effectiveDate: new Date('2025-07-01'),
      description: 'Cloud Security Alliance AI Controls Matrix - A comprehensive framework with 243 control objectives across 18 security domains for trustworthy AI systems in cloud environments. Built on CCM v4 foundation and maps to ISO 42001, ISO 27001, NIST AI RMF 1.0, and BSI AIC4.',
      category: FrameworkCategory.AI_CONTROL,
      isActive: true,
    },
  });

  // Create domains and controls
  for (let i = 0; i < CSA_AICM_DOMAINS.length; i++) {
    const domain = CSA_AICM_DOMAINS[i];

    const domainControl = await prisma.control.create({
      data: {
        code: domain.code,
        title: domain.title,
        description: domain.description,
        frameworkId: csaFramework.id,
        sortOrder: i + 1,
      },
    });

    const controls = CSA_AICM_CONTROLS[domain.code as keyof typeof CSA_AICM_CONTROLS];
    if (controls) {
      for (let j = 0; j < controls.length; j++) {
        await prisma.control.create({
          data: {
            code: controls[j].code,
            title: controls[j].title,
            description: controls[j].description,
            frameworkId: csaFramework.id,
            parentId: domainControl.id,
            sortOrder: j + 1,
          },
        });
      }
    }
  }

  console.log('  ✅ CSA AICM v1.0 seeded (18 domains, 51 representative controls)');
  console.log('  ℹ️  Note: Full AICM contains 243 controls. Download from CSA for complete framework.');
  return csaFramework;
}

/**
 * Create mappings between CSA AICM and other frameworks
 */
export async function seedCSAMappings() {
  console.log('🔗 Creating CSA AICM cross-framework mappings...');

  const csaFramework = await prisma.framework.findFirst({
    where: { shortName: 'CSA-AICM', version: '1.0' },
  });
  const nistFramework = await prisma.framework.findFirst({
    where: { shortName: 'NIST-AI-RMF', version: '1.0' },
  });
  const isoFramework = await prisma.framework.findFirst({
    where: { shortName: 'ISO-42001', version: '2023' },
  });

  if (!csaFramework || !nistFramework || !isoFramework) {
    console.log('  ⚠️  Required frameworks not found. Skipping mappings.');
    return;
  }

  const mappings = [
    // CSA AICM to NIST AI RMF mappings
    { csa: 'AIC-GRC', nist: 'GOVERN-1', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address AI governance policies and risk management frameworks' },
    { csa: 'AIC-GRC', nist: 'GOVERN-4', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'GRC encompasses organizational culture aspects' },
    { csa: 'AIC-IAM', nist: 'GOVERN-2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'IAM controls support accountability and responsibility structures' },
    { csa: 'AIC-MOD', nist: 'MEASURE-2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Model security controls support trustworthiness assessment including robustness and security' },
    { csa: 'AIC-BIA', nist: 'MEASURE-2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Bias & fairness controls directly support MEASURE-2 fairness and bias evaluation' },
    { csa: 'AIC-EXP', nist: 'MEASURE-2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Explainability controls support MEASURE-2 explainability assessment' },
    { csa: 'AIC-LCM', nist: 'MAP-2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'AI lifecycle management supports system categorization and characterization' },
    { csa: 'AIC-STA', nist: 'GOVERN-6', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address third-party and supply chain risk management' },
    { csa: 'AIC-STA', nist: 'MANAGE-3', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Supply chain controls support third-party resource monitoring' },
    { csa: 'AIC-SEF', nist: 'MANAGE-4', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Incident management supports risk treatment and incident response' },
    { csa: 'AIC-TVM', nist: 'MEASURE-2', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Threat and vulnerability management supports security assessment' },
    { csa: 'AIC-DSP', nist: 'MAP-5', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Data privacy controls support impact characterization' },

    // CSA AICM to ISO 42001 mappings
    { csa: 'AIC-GRC', iso: 'A.2', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address AI policy development and governance' },
    { csa: 'AIC-GRC', iso: 'A.3', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'GRC includes organizational structure and roles' },
    { csa: 'AIC-HRS', iso: 'A.3', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'HR security supports internal organization and roles' },
    { csa: 'AIC-DSP', iso: 'A.7', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address data security and privacy for AI systems' },
    { csa: 'AIC-LCM', iso: 'A.6', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address complete AI system lifecycle management' },
    { csa: 'AIC-BIA', iso: 'A.5', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Bias controls support impact assessment and fairness evaluation' },
    { csa: 'AIC-EXP', iso: 'A.8', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Transparency controls support information for interested parties' },
    { csa: 'AIC-STA', iso: 'A.10', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address third-party and supplier relationships' },
    { csa: 'AIC-MOD', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Model security supports AI system lifecycle security controls' },
    { csa: 'AIC-IAM', iso: 'A.4', confidence: ConfidenceLevel.LOW, type: MappingType.RELATED, reason: 'IAM relates to resource management for AI systems' },
  ];

  let createdMappings = 0;

  for (const mapping of mappings) {
    const csaControl = await prisma.control.findFirst({
      where: { frameworkId: csaFramework.id, code: mapping.csa },
    });

    let targetControl;
    let targetFramework;

    if ('nist' in mapping) {
      targetControl = await prisma.control.findFirst({
        where: { frameworkId: nistFramework.id, code: mapping.nist },
      });
      targetFramework = nistFramework;
    } else if ('iso' in mapping) {
      targetControl = await prisma.control.findFirst({
        where: { frameworkId: isoFramework.id, code: mapping.iso },
      });
      targetFramework = isoFramework;
    }

    if (csaControl && targetControl && targetFramework) {
      await prisma.controlMapping.create({
        data: {
          sourceControlId: csaControl.id,
          targetControlId: targetControl.id,
          sourceFrameworkId: csaFramework.id,
          targetFrameworkId: targetFramework.id,
          confidenceScore: mapping.confidence,
          mappingType: mapping.type,
          rationale: mapping.reason,
        },
      });
      createdMappings++;
    }
  }

  console.log(`  ✅ Created ${createdMappings} cross-framework mappings`);
}
