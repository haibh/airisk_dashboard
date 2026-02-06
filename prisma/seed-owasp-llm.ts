/**
 * OWASP LLM Top 10 v2025 Seed Script
 * The most critical security risks for LLM applications
 *
 * Source: https://owasp.org/www-project-top-10-for-large-language-model-applications/
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const OWASP_LLM_RISKS = [
  {
    code: 'LLM01',
    title: 'Prompt Injection',
    description: 'Manipulating LLMs via crafted inputs, causing unintended actions. Direct injections overwrite system prompts; indirect ones manipulate inputs from external sources.',
    controls: [
      { code: 'LLM01.1', title: 'Input Validation', description: 'Implement strict input validation and sanitization for all user inputs and external data sources.' },
      { code: 'LLM01.2', title: 'Privilege Separation', description: 'Enforce privilege control on LLM access to backend systems. Maintain human-in-the-loop for privileged operations.' },
      { code: 'LLM01.3', title: 'Content Segregation', description: 'Segregate external content from user prompts. Denote where untrusted content is being used.' },
    ],
  },
  {
    code: 'LLM02',
    title: 'Insecure Output Handling',
    description: 'Neglecting to validate LLM outputs allows downstream security exploits including XSS, CSRF, SSRF, privilege escalation, or remote code execution.',
    controls: [
      { code: 'LLM02.1', title: 'Output Validation', description: 'Treat the model as any other user and apply proper input validation on responses.' },
      { code: 'LLM02.2', title: 'Output Encoding', description: 'Encode model output appropriately for the context (HTML, JSON, SQL, shell commands).' },
      { code: 'LLM02.3', title: 'Action Verification', description: 'Verify and validate any actions or operations that result from LLM output before execution.' },
    ],
  },
  {
    code: 'LLM03',
    title: 'Training Data Poisoning',
    description: 'Tampering with training data introduces vulnerabilities, biases, or backdoors that compromise security, effectiveness, or ethical behavior.',
    controls: [
      { code: 'LLM03.1', title: 'Data Provenance', description: 'Verify supply chain of training data. Track data lineage and maintain chain of custody.' },
      { code: 'LLM03.2', title: 'Data Validation', description: 'Implement data validation to detect and filter malicious or biased content in training sets.' },
      { code: 'LLM03.3', title: 'Anomaly Detection', description: 'Use statistical and ML techniques to detect anomalies or poisoning attempts in training data.' },
    ],
  },
  {
    code: 'LLM04',
    title: 'Model Denial of Service',
    description: 'Overloading LLMs with resource-heavy operations can cause service degradation, increased costs, or denial of service.',
    controls: [
      { code: 'LLM04.1', title: 'Rate Limiting', description: 'Implement rate limiting for API calls and resource consumption per user or IP.' },
      { code: 'LLM04.2', title: 'Input Size Limits', description: 'Cap input size, limit total request volume, and implement query complexity analysis.' },
      { code: 'LLM04.3', title: 'Resource Monitoring', description: 'Continuously monitor resource utilization and implement auto-scaling with circuit breakers.' },
    ],
  },
  {
    code: 'LLM05',
    title: 'Supply Chain Vulnerabilities',
    description: 'Relying on compromised components, services, or datasets can undermine system integrity, causing data breaches and failures.',
    controls: [
      { code: 'LLM05.1', title: 'Vendor Assessment', description: 'Thoroughly vet third-party models, data sources, and plugins for security and integrity.' },
      { code: 'LLM05.2', title: 'Dependency Scanning', description: 'Maintain up-to-date inventory. Use SBOM and regularly scan for vulnerabilities.' },
      { code: 'LLM05.3', title: 'Model Verification', description: 'Apply MLOps best practices. Maintain model signatures, checksums, and version control.' },
    ],
  },
  {
    code: 'LLM06',
    title: 'Sensitive Information Disclosure',
    description: 'Failing to protect against disclosure of sensitive data through LLM outputs, leading to legal consequences or competitive disadvantage.',
    controls: [
      { code: 'LLM06.1', title: 'Data Classification', description: 'Classify and label data according to sensitivity. Restrict training data accordingly.' },
      { code: 'LLM06.2', title: 'Output Filtering', description: 'Implement robust output filtering to prevent sensitive data leakage in responses.' },
      { code: 'LLM06.3', title: 'PII Protection', description: 'Apply differential privacy, data masking, or anonymization techniques for PII.' },
    ],
  },
  {
    code: 'LLM07',
    title: 'Insecure Plugin Design',
    description: 'LLM plugins processing untrusted inputs with insufficient access control can lead to severe exploits like remote code execution.',
    controls: [
      { code: 'LLM07.1', title: 'Plugin Authentication', description: 'Require strong authentication and authorization for all plugin operations.' },
      { code: 'LLM07.2', title: 'Input Sanitization', description: 'Ensure plugins sanitize and validate all inputs to prevent injection attacks.' },
      { code: 'LLM07.3', title: 'Least Privilege', description: 'Apply principle of least privilege for plugin permissions and API access.' },
    ],
  },
  {
    code: 'LLM08',
    title: 'Excessive Agency',
    description: 'Granting LLMs too much autonomy to take action can lead to unintended consequences based on faulty outputs.',
    controls: [
      { code: 'LLM08.1', title: 'Action Scope Limits', description: 'Limit actions the LLM agent can perform. Use principle of least functionality.' },
      { code: 'LLM08.2', title: 'Human Approval', description: 'Require human approval for high-impact actions. Implement multi-level authorization.' },
      { code: 'LLM08.3', title: 'Action Logging', description: 'Log all agent actions with full context for audit and forensic analysis.' },
    ],
  },
  {
    code: 'LLM09',
    title: 'Overreliance',
    description: 'Systems or people depending on LLMs without oversight can face misinformation, legal issues, and security vulnerabilities.',
    controls: [
      { code: 'LLM09.1', title: 'Confidence Indicators', description: 'Communicate uncertainty and confidence levels in LLM outputs to users.' },
      { code: 'LLM09.2', title: 'Human Review', description: 'Require human review for critical decisions. Document limitations clearly.' },
      { code: 'LLM09.3', title: 'Cross-Verification', description: 'Cross-check LLM outputs against trusted external sources when possible.' },
    ],
  },
  {
    code: 'LLM10',
    title: 'Model Theft',
    description: 'Unauthorized access to proprietary LLMs risks theft, competitive advantage loss, and dissemination of sensitive information.',
    controls: [
      { code: 'LLM10.1', title: 'Access Control', description: 'Implement strong access controls for model weights, APIs, and training infrastructure.' },
      { code: 'LLM10.2', title: 'Rate Limiting', description: 'Apply rate limiting and anomaly detection to prevent model extraction attacks.' },
      { code: 'LLM10.3', title: 'Watermarking', description: 'Consider watermarking model outputs to detect unauthorized model copies.' },
    ],
  },
];

export async function seedOWASPLLM() {
  console.log('📕 Seeding OWASP LLM Top 10 v2025...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'OWASP-LLM', version: '2025' } },
    update: {},
    create: {
      name: 'OWASP Top 10 for Large Language Model Applications',
      shortName: 'OWASP-LLM',
      version: '2025',
      effectiveDate: new Date('2025-01-01'),
      description: 'The most critical security risks for LLM applications, providing guidance on secure LLM development and deployment.',
      category: FrameworkCategory.AI_RISK,
      isActive: true,
    },
  });

  for (let i = 0; i < OWASP_LLM_RISKS.length; i++) {
    const risk = OWASP_LLM_RISKS[i];
    const riskControl = await prisma.control.create({
      data: {
        code: risk.code,
        title: risk.title,
        description: risk.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < risk.controls.length; j++) {
      await prisma.control.create({
        data: {
          code: risk.controls[j].code,
          title: risk.controls[j].title,
          description: risk.controls[j].description,
          frameworkId: framework.id,
          parentId: riskControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ OWASP LLM Top 10 v2025 seeded (10 risks, 30 controls)');
  return framework;
}

export async function seedOWASPLLMMappings() {
  console.log('🔗 Creating OWASP LLM cross-framework mappings...');

  const owaspFramework = await prisma.framework.findFirst({
    where: { shortName: 'OWASP-LLM', version: '2025' },
  });
  const nistFramework = await prisma.framework.findFirst({
    where: { shortName: 'NIST-AI-RMF', version: '1.0' },
  });
  const csaFramework = await prisma.framework.findFirst({
    where: { shortName: 'CSA-AICM', version: '1.0' },
  });

  if (!owaspFramework || !nistFramework) {
    console.log('  ⚠️  Required frameworks not found. Skipping mappings.');
    return;
  }

  const mappings = [
    { owasp: 'LLM01', nist: 'MEASURE-2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Prompt injection relates to security assessment in MEASURE-2' },
    { owasp: 'LLM02', nist: 'MEASURE-2', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Output handling security assessment' },
    { owasp: 'LLM03', nist: 'MAP-4', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Training data integrity maps to risk mapping' },
    { owasp: 'LLM05', nist: 'GOVERN-6', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address supply chain and third-party risks' },
    { owasp: 'LLM05', nist: 'MANAGE-3', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Supply chain monitoring and management' },
    { owasp: 'LLM06', nist: 'MAP-5', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Sensitive information relates to impact characterization' },
    { owasp: 'LLM08', nist: 'GOVERN-4', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Excessive agency relates to organizational culture and safety' },
    { owasp: 'LLM09', nist: 'MEASURE-4', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Overreliance mitigation through measurement validation' },
  ];

  let created = 0;
  for (const mapping of mappings) {
    const owaspControl = await prisma.control.findFirst({
      where: { frameworkId: owaspFramework.id, code: mapping.owasp },
    });
    const nistControl = await prisma.control.findFirst({
      where: { frameworkId: nistFramework.id, code: mapping.nist },
    });

    if (owaspControl && nistControl) {
      await prisma.controlMapping.create({
        data: {
          sourceControlId: owaspControl.id,
          targetControlId: nistControl.id,
          sourceFrameworkId: owaspFramework.id,
          targetFrameworkId: nistFramework.id,
          confidenceScore: mapping.confidence,
          mappingType: mapping.type,
          rationale: mapping.reason,
        },
      });
      created++;
    }
  }

  // CSA AICM mappings
  if (csaFramework) {
    const csaMappings = [
      { owasp: 'LLM01', csa: 'AIC-AIS', reason: 'Input validation and API security' },
      { owasp: 'LLM03', csa: 'AIC-DSP', reason: 'Data integrity and provenance' },
      { owasp: 'LLM05', csa: 'AIC-STA', reason: 'Supply chain management' },
      { owasp: 'LLM06', csa: 'AIC-DSP', reason: 'Data privacy and protection' },
      { owasp: 'LLM10', csa: 'AIC-MOD', reason: 'Model security and access control' },
    ];

    for (const mapping of csaMappings) {
      const owaspControl = await prisma.control.findFirst({
        where: { frameworkId: owaspFramework.id, code: mapping.owasp },
      });
      const csaControl = await prisma.control.findFirst({
        where: { frameworkId: csaFramework.id, code: mapping.csa },
      });

      if (owaspControl && csaControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: owaspControl.id,
            targetControlId: csaControl.id,
            sourceFrameworkId: owaspFramework.id,
            targetFrameworkId: csaFramework.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.PARTIAL,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} OWASP LLM cross-framework mappings`);
}
