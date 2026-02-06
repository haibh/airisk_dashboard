/**
 * MITRE ATLAS (Adversarial Threat Landscape for AI Systems) Seed Script
 * Knowledge base of adversary tactics and techniques for ML systems
 *
 * Source: https://atlas.mitre.org/
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

const MITRE_ATLAS_TACTICS = [
  {
    code: 'AML.TA0001',
    title: 'Reconnaissance',
    description: 'Adversary gathering information about the target ML system to plan future operations.',
    techniques: [
      { code: 'AML.T0001', title: 'ML Model Discovery', description: 'Adversary attempts to discover ML models in use, their capabilities, and limitations.' },
      { code: 'AML.T0002', title: 'ML API Discovery', description: 'Adversary discovers ML API endpoints, parameters, and access methods.' },
      { code: 'AML.T0003', title: 'Data Collection', description: 'Adversary collects data about the ML system including training data sources and model behavior.' },
    ],
  },
  {
    code: 'AML.TA0002',
    title: 'Resource Development',
    description: 'Adversary establishing resources to support operations against ML systems.',
    techniques: [
      { code: 'AML.T0010', title: 'Develop Adversarial ML Artifacts', description: 'Adversary develops adversarial examples, poisoned data, or malicious models.' },
      { code: 'AML.T0011', title: 'Acquire Computational Resources', description: 'Adversary acquires compute resources needed for ML attacks (GPU clusters, cloud resources).' },
      { code: 'AML.T0012', title: 'Create Proxy Model', description: 'Adversary creates a substitute model to test attacks before targeting the actual system.' },
    ],
  },
  {
    code: 'AML.TA0003',
    title: 'Initial Access',
    description: 'Adversary gaining initial access to ML systems and their components.',
    techniques: [
      { code: 'AML.T0020', title: 'Exploit Public-Facing Application', description: 'Adversary exploits vulnerabilities in ML serving infrastructure or APIs.' },
      { code: 'AML.T0021', title: 'Supply Chain Compromise', description: 'Adversary compromises ML supply chain (pre-trained models, datasets, libraries).' },
      { code: 'AML.T0022', title: 'Valid Credentials', description: 'Adversary uses legitimate credentials to access ML systems and pipelines.' },
    ],
  },
  {
    code: 'AML.TA0004',
    title: 'ML Model Access',
    description: 'Adversary gaining access to ML models through inference API or other means.',
    techniques: [
      { code: 'AML.T0030', title: 'Inference API Access', description: 'Adversary accesses model through legitimate inference API to craft attacks.' },
      { code: 'AML.T0031', title: 'Physical Environment Access', description: 'Adversary gains physical access to systems where ML models are deployed.' },
      { code: 'AML.T0032', title: 'ML Model Repository Access', description: 'Adversary accesses model repositories to steal or modify models.' },
    ],
  },
  {
    code: 'AML.TA0005',
    title: 'Execution',
    description: 'Adversary executing malicious code or operations within ML systems.',
    techniques: [
      { code: 'AML.T0040', title: 'Malicious ML Model', description: 'Adversary deploys a malicious model containing backdoors or trojans.' },
      { code: 'AML.T0041', title: 'Unsafe ML Artifacts', description: 'Adversary uses unsafe serialized models or data formats for code execution.' },
    ],
  },
  {
    code: 'AML.TA0006',
    title: 'Persistence',
    description: 'Adversary maintaining access to ML systems across restarts or changes.',
    techniques: [
      { code: 'AML.T0050', title: 'Backdoor ML Model', description: 'Adversary embeds backdoor in model that activates on specific trigger inputs.' },
      { code: 'AML.T0051', title: 'Poison Training Data', description: 'Adversary poisons training data to maintain persistent influence on model behavior.' },
    ],
  },
  {
    code: 'AML.TA0007',
    title: 'Defense Evasion',
    description: 'Adversary avoiding detection while conducting ML attacks.',
    techniques: [
      { code: 'AML.T0060', title: 'Evade ML Model', description: 'Adversary crafts inputs to evade ML-based detection or classification systems.' },
      { code: 'AML.T0061', title: 'Adversarial Example in Physical Domain', description: 'Adversary creates physical adversarial examples (patches, objects) that evade ML systems.' },
      { code: 'AML.T0062', title: 'Rate Limit Evasion', description: 'Adversary distributes queries to evade rate limiting and anomaly detection.' },
    ],
  },
  {
    code: 'AML.TA0008',
    title: 'Discovery',
    description: 'Adversary gathering knowledge about the ML system after gaining access.',
    techniques: [
      { code: 'AML.T0070', title: 'Discover ML Model Family', description: 'Adversary determines the type/family of ML model (CNN, transformer, etc.).' },
      { code: 'AML.T0071', title: 'Discover ML Artifacts', description: 'Adversary identifies model files, training data, and configuration.' },
    ],
  },
  {
    code: 'AML.TA0009',
    title: 'Collection',
    description: 'Adversary gathering data from ML systems.',
    techniques: [
      { code: 'AML.T0080', title: 'ML Model Extraction', description: 'Adversary extracts a functional copy of the model through query access.' },
      { code: 'AML.T0081', title: 'Training Data Extraction', description: 'Adversary extracts training data through model inversion or membership inference.' },
    ],
  },
  {
    code: 'AML.TA0010',
    title: 'ML Attack Staging',
    description: 'Adversary preparing for specific ML attacks.',
    techniques: [
      { code: 'AML.T0090', title: 'Craft Adversarial Examples', description: 'Adversary creates adversarial inputs designed to cause model misclassification.' },
      { code: 'AML.T0091', title: 'Develop Trigger', description: 'Adversary develops trigger patterns for backdoor activation.' },
    ],
  },
  {
    code: 'AML.TA0011',
    title: 'Exfiltration',
    description: 'Adversary stealing ML models, data, or intellectual property.',
    techniques: [
      { code: 'AML.T0100', title: 'Exfiltrate via Inference API', description: 'Adversary exfiltrates model knowledge through repeated inference queries.' },
      { code: 'AML.T0101', title: 'Exfiltrate via Model Outputs', description: 'Adversary encodes stolen data in model outputs for extraction.' },
    ],
  },
  {
    code: 'AML.TA0012',
    title: 'Impact',
    description: 'Adversary disrupting ML system availability, integrity, or confidentiality.',
    techniques: [
      { code: 'AML.T0110', title: 'Denial of ML Service', description: 'Adversary degrades or denies ML service availability through resource exhaustion.' },
      { code: 'AML.T0111', title: 'Evade ML Detection', description: 'Adversary evades ML-based security systems to achieve attack objectives.' },
      { code: 'AML.T0112', title: 'Manipulate ML Output', description: 'Adversary manipulates model outputs to achieve specific malicious outcomes.' },
    ],
  },
];

export async function seedMITREATLAS() {
  console.log('📗 Seeding MITRE ATLAS v1.0...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'MITRE-ATLAS', version: '1.0' } },
    update: {},
    create: {
      name: 'MITRE Adversarial Threat Landscape for AI Systems',
      shortName: 'MITRE-ATLAS',
      version: '1.0',
      effectiveDate: new Date('2024-01-01'),
      description: 'Knowledge base of adversary tactics and techniques based on real-world attack observations against ML systems. Modeled after ATT&CK.',
      category: FrameworkCategory.AI_RISK,
      isActive: true,
    },
  });

  for (let i = 0; i < MITRE_ATLAS_TACTICS.length; i++) {
    const tactic = MITRE_ATLAS_TACTICS[i];
    const tacticControl = await prisma.control.create({
      data: {
        code: tactic.code,
        title: tactic.title,
        description: tactic.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < tactic.techniques.length; j++) {
      await prisma.control.create({
        data: {
          code: tactic.techniques[j].code,
          title: tactic.techniques[j].title,
          description: tactic.techniques[j].description,
          frameworkId: framework.id,
          parentId: tacticControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ MITRE ATLAS v1.0 seeded (12 tactics, 31 techniques)');
  return framework;
}

export async function seedMITREATLASMappings() {
  console.log('🔗 Creating MITRE ATLAS cross-framework mappings...');

  const atlasFramework = await prisma.framework.findFirst({
    where: { shortName: 'MITRE-ATLAS', version: '1.0' },
  });
  const owaspFramework = await prisma.framework.findFirst({
    where: { shortName: 'OWASP-LLM', version: '2025' },
  });
  const nistFramework = await prisma.framework.findFirst({
    where: { shortName: 'NIST-AI-RMF', version: '1.0' },
  });

  if (!atlasFramework) {
    console.log('  ⚠️  MITRE ATLAS framework not found. Skipping mappings.');
    return;
  }

  let created = 0;

  // ATLAS to OWASP LLM mappings
  if (owaspFramework) {
    const owaspMappings = [
      { atlas: 'AML.TA0003', owasp: 'LLM01', reason: 'Initial access techniques relate to prompt injection attacks' },
      { atlas: 'AML.TA0006', owasp: 'LLM03', reason: 'Persistence through data poisoning' },
      { atlas: 'AML.TA0009', owasp: 'LLM10', reason: 'Model extraction is model theft' },
      { atlas: 'AML.TA0003', owasp: 'LLM05', reason: 'Supply chain compromise as initial access' },
      { atlas: 'AML.TA0012', owasp: 'LLM04', reason: 'DoS impact techniques' },
    ];

    for (const mapping of owaspMappings) {
      const atlasControl = await prisma.control.findFirst({
        where: { frameworkId: atlasFramework.id, code: mapping.atlas },
      });
      const owaspControl = await prisma.control.findFirst({
        where: { frameworkId: owaspFramework.id, code: mapping.owasp },
      });

      if (atlasControl && owaspControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: atlasControl.id,
            targetControlId: owaspControl.id,
            sourceFrameworkId: atlasFramework.id,
            targetFrameworkId: owaspFramework.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.RELATED,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  // ATLAS to NIST AI RMF mappings
  if (nistFramework) {
    const nistMappings = [
      { atlas: 'AML.TA0001', nist: 'MAP-4', reason: 'Reconnaissance relates to risk mapping' },
      { atlas: 'AML.TA0007', nist: 'MEASURE-2', reason: 'Defense evasion requires security assessment' },
      { atlas: 'AML.TA0012', nist: 'MANAGE-4', reason: 'Impact requires incident response' },
    ];

    for (const mapping of nistMappings) {
      const atlasControl = await prisma.control.findFirst({
        where: { frameworkId: atlasFramework.id, code: mapping.atlas },
      });
      const nistControl = await prisma.control.findFirst({
        where: { frameworkId: nistFramework.id, code: mapping.nist },
      });

      if (atlasControl && nistControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: atlasControl.id,
            targetControlId: nistControl.id,
            sourceFrameworkId: atlasFramework.id,
            targetFrameworkId: nistFramework.id,
            confidenceScore: ConfidenceLevel.MEDIUM,
            mappingType: MappingType.RELATED,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  console.log(`  ✅ Created ${created} MITRE ATLAS cross-framework mappings`);
}
