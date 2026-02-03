/**
 * Framework Seed Script
 * Seeds NIST AI RMF 1.0 and ISO/IEC 42001:2023 frameworks with controls
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed NIST AI RMF 1.0
 * 4 Functions → 19 Categories → 72 Subcategories
 */
async function seedNISTFramework() {
  console.log('📘 Seeding NIST AI RMF 1.0...');

  const nistFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'NIST-AI-RMF', version: '1.0' } },
    update: {},
    create: {
      name: 'NIST Artificial Intelligence Risk Management Framework',
      shortName: 'NIST-AI-RMF',
      version: '1.0',
      effectiveDate: new Date('2023-01-26'),
      description: 'Framework for managing risks associated with artificial intelligence systems',
      category: FrameworkCategory.AI_RISK,
      isActive: true,
    },
  });

  // GOVERN Function (6 categories)
  const governFunction = await prisma.control.create({
    data: {
      code: 'GOVERN',
      title: 'Govern',
      description: 'Provides cross-cutting governance foundational to all AI risk activities',
      frameworkId: nistFramework.id,
      sortOrder: 1,
    },
  });

  const governCategories = [
    { code: 'GOVERN-1', title: 'Policies, Processes, Procedures, and Practices', desc: 'Establish transparent, documented governance structures', subcats: 7 },
    { code: 'GOVERN-2', title: 'Accountability and Responsibility', desc: 'Define roles, responsibilities, training for AI teams', subcats: 3 },
    { code: 'GOVERN-3', title: 'Workforce Diversity, Equity, Inclusion, Accessibility', desc: 'Prioritize inclusive risk management approach', subcats: 2 },
    { code: 'GOVERN-4', title: 'Organizational Culture and Commitment', desc: 'Foster safety-first mindset for AI risks', subcats: 3 },
    { code: 'GOVERN-5', title: 'Stakeholder Engagement', desc: 'Establish robust engagement with AI actors', subcats: 2 },
    { code: 'GOVERN-6', title: 'Third-Party and Supply Chain Risk', desc: 'Mitigate software, data, and supply chain risks', subcats: 2 },
  ];

  for (let i = 0; i < governCategories.length; i++) {
    const cat = governCategories[i];
    const category = await prisma.control.create({
      data: {
        code: cat.code,
        title: cat.title,
        description: cat.desc,
        frameworkId: nistFramework.id,
        parentId: governFunction.id,
        sortOrder: i + 1,
      },
    });

    // Create subcategories
    for (let j = 1; j <= cat.subcats; j++) {
      await prisma.control.create({
        data: {
          code: `${cat.code}.${j}`,
          title: `${cat.title} - Subcategory ${j}`,
          description: `Implementation guidance for ${cat.title}`,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j,
        },
      });
    }
  }

  // MAP Function (5 categories)
  const mapFunction = await prisma.control.create({
    data: {
      code: 'MAP',
      title: 'Map',
      description: 'Establish context to frame AI risks and benefits',
      frameworkId: nistFramework.id,
      sortOrder: 2,
    },
  });

  const mapCategories = [
    { code: 'MAP-1', title: 'Context Establishment', desc: 'Understand intended purpose, deployment, risk tolerance', subcats: 6 },
    { code: 'MAP-2', title: 'AI System Categorization', desc: 'Perform system classification and characterization', subcats: 3 },
    { code: 'MAP-3', title: 'System Capabilities and Benefit Analysis', desc: 'Examine system capabilities against benchmarks', subcats: 5 },
    { code: 'MAP-4', title: 'Risk and Benefit Mapping', desc: 'Map risks/benefits for all system components', subcats: 2 },
    { code: 'MAP-5', title: 'Impact Characterization', desc: 'Document impacts to individuals, groups, society', subcats: 2 },
  ];

  for (let i = 0; i < mapCategories.length; i++) {
    const cat = mapCategories[i];
    const category = await prisma.control.create({
      data: {
        code: cat.code,
        title: cat.title,
        description: cat.desc,
        frameworkId: nistFramework.id,
        parentId: mapFunction.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 1; j <= cat.subcats; j++) {
      await prisma.control.create({
        data: {
          code: `${cat.code}.${j}`,
          title: `${cat.title} - Subcategory ${j}`,
          description: `Implementation guidance for ${cat.title}`,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j,
        },
      });
    }
  }

  // MEASURE Function (4 categories)
  const measureFunction = await prisma.control.create({
    data: {
      code: 'MEASURE',
      title: 'Measure',
      description: 'Analyze and assess AI risks using quantitative/qualitative methods',
      frameworkId: nistFramework.id,
      sortOrder: 3,
    },
  });

  const measureCategories = [
    { code: 'MEASURE-1', title: 'Measurement Methods and Metrics', desc: 'Align methods with identified risks', subcats: 3 },
    { code: 'MEASURE-2', title: 'Trustworthy AI Characteristics Assessment', desc: 'Evaluate fairness, transparency, robustness', subcats: 13 },
    { code: 'MEASURE-3', title: 'Risk Tracking and Monitoring', desc: 'Track identified risks through lifecycle', subcats: 3 },
    { code: 'MEASURE-4', title: 'Measurement Feedback and Validation', desc: 'Validate measurement approach effectiveness', subcats: 3 },
  ];

  for (let i = 0; i < measureCategories.length; i++) {
    const cat = measureCategories[i];
    const category = await prisma.control.create({
      data: {
        code: cat.code,
        title: cat.title,
        description: cat.desc,
        frameworkId: nistFramework.id,
        parentId: measureFunction.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 1; j <= cat.subcats; j++) {
      await prisma.control.create({
        data: {
          code: `${cat.code}.${j}`,
          title: `${cat.title} - Subcategory ${j}`,
          description: `Implementation guidance for ${cat.title}`,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j,
        },
      });
    }
  }

  // MANAGE Function (4 categories)
  const manageFunction = await prisma.control.create({
    data: {
      code: 'MANAGE',
      title: 'Manage',
      description: 'Allocate resources to manage identified risks',
      frameworkId: nistFramework.id,
      sortOrder: 4,
    },
  });

  const manageCategories = [
    { code: 'MANAGE-1', title: 'Risk Prioritization and Response', desc: 'Prioritize, respond to, and manage AI risks', subcats: 4 },
    { code: 'MANAGE-2', title: 'Risk Mitigation and Benefit Maximization', desc: 'Maximize benefits, minimize negative impacts', subcats: 4 },
    { code: 'MANAGE-3', title: 'Third-Party Resource Monitoring', desc: 'Monitor and control third-party risks', subcats: 2 },
    { code: 'MANAGE-4', title: 'Risk Treatment and Communication', desc: 'Monitor risk treatment and communication plans', subcats: 3 },
  ];

  for (let i = 0; i < manageCategories.length; i++) {
    const cat = manageCategories[i];
    const category = await prisma.control.create({
      data: {
        code: cat.code,
        title: cat.title,
        description: cat.desc,
        frameworkId: nistFramework.id,
        parentId: manageFunction.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 1; j <= cat.subcats; j++) {
      await prisma.control.create({
        data: {
          code: `${cat.code}.${j}`,
          title: `${cat.title} - Subcategory ${j}`,
          description: `Implementation guidance for ${cat.title}`,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j,
        },
      });
    }
  }

  console.log('  ✅ NIST AI RMF 1.0 seeded (4 functions, 19 categories, 72 subcategories)');
  return nistFramework;
}

/**
 * Seed ISO/IEC 42001:2023
 * 9 Domains → 38 Controls
 */
async function seedISOFramework() {
  console.log('📗 Seeding ISO/IEC 42001:2023...');

  const isoFramework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'ISO-42001', version: '2023' } },
    update: {},
    create: {
      name: 'ISO/IEC 42001:2023 - Artificial Intelligence Management System',
      shortName: 'ISO-42001',
      version: '2023',
      effectiveDate: new Date('2023-12-15'),
      description: 'International standard for AI management systems using Plan-Do-Check-Act model',
      category: FrameworkCategory.AI_MANAGEMENT,
      isActive: true,
    },
  });

  // A.2: Policies Related to AI (3 Controls)
  const a2Domain = await prisma.control.create({
    data: {
      code: 'A.2',
      title: 'Policies Related to AI',
      description: 'AI policy development, alignment, review',
      frameworkId: isoFramework.id,
      sortOrder: 1,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.2.1', title: 'AI Policy Development', description: 'Develop and document AI policies', frameworkId: isoFramework.id, parentId: a2Domain.id, sortOrder: 1 },
      { code: 'A.2.2', title: 'Align with Organizational Frameworks', description: 'Align with privacy, cybersecurity, ethics frameworks', frameworkId: isoFramework.id, parentId: a2Domain.id, sortOrder: 2 },
      { code: 'A.2.3', title: 'Policy Review and Evolution', description: 'Establish policy review mechanisms', frameworkId: isoFramework.id, parentId: a2Domain.id, sortOrder: 3 },
    ],
  });

  // A.3: Internal Organization (2 Controls)
  const a3Domain = await prisma.control.create({
    data: {
      code: 'A.3',
      title: 'Internal Organization',
      description: 'Roles, responsibilities, escalation processes',
      frameworkId: isoFramework.id,
      sortOrder: 2,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.3.1', title: 'Roles and Responsibilities', description: 'Assign clear roles and responsibilities', frameworkId: isoFramework.id, parentId: a3Domain.id, sortOrder: 1 },
      { code: 'A.3.2', title: 'Escalation Processes', description: 'Establish concern reporting and escalation', frameworkId: isoFramework.id, parentId: a3Domain.id, sortOrder: 2 },
    ],
  });

  // A.4: Resources for AI Systems (5 Controls)
  const a4Domain = await prisma.control.create({
    data: {
      code: 'A.4',
      title: 'Resources for AI Systems',
      description: 'Data, tooling, infrastructure, human resources',
      frameworkId: isoFramework.id,
      sortOrder: 3,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.4.1', title: 'Resource Documentation', description: 'Document required resources', frameworkId: isoFramework.id, parentId: a4Domain.id, sortOrder: 1 },
      { code: 'A.4.2', title: 'Data Resource Inventory', description: 'Inventory data resources', frameworkId: isoFramework.id, parentId: a4Domain.id, sortOrder: 2 },
      { code: 'A.4.3', title: 'Tooling Requirements', description: 'Identify tooling requirements', frameworkId: isoFramework.id, parentId: a4Domain.id, sortOrder: 3 },
      { code: 'A.4.4', title: 'Computing Infrastructure', description: 'Allocate computing infrastructure', frameworkId: isoFramework.id, parentId: a4Domain.id, sortOrder: 4 },
      { code: 'A.4.5', title: 'Human Expertise', description: 'Assign human expertise and personnel', frameworkId: isoFramework.id, parentId: a4Domain.id, sortOrder: 5 },
    ],
  });

  // A.5: Assessing Impacts of AI Systems (4 Controls)
  const a5Domain = await prisma.control.create({
    data: {
      code: 'A.5',
      title: 'Assessing Impacts of AI Systems',
      description: 'Risk assessment, bias, fairness, societal impact',
      frameworkId: isoFramework.id,
      sortOrder: 4,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.5.1', title: 'Impact Assessment Processes', description: 'Establish impact assessment processes', frameworkId: isoFramework.id, parentId: a5Domain.id, sortOrder: 1 },
      { code: 'A.5.2', title: 'Individual and Group Impacts', description: 'Document individual and group impacts', frameworkId: isoFramework.id, parentId: a5Domain.id, sortOrder: 2 },
      { code: 'A.5.3', title: 'Fairness and Bias Evaluation', description: 'Evaluate fairness and bias concerns', frameworkId: isoFramework.id, parentId: a5Domain.id, sortOrder: 3 },
      { code: 'A.5.4', title: 'Societal-Level Impacts', description: 'Consider societal-level impacts', frameworkId: isoFramework.id, parentId: a5Domain.id, sortOrder: 4 },
    ],
  });

  // A.6: AI System Life Cycle (9 Controls)
  const a6Domain = await prisma.control.create({
    data: {
      code: 'A.6',
      title: 'AI System Life Cycle',
      description: 'Development, design, validation, deployment, operation',
      frameworkId: isoFramework.id,
      sortOrder: 5,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.6.1', title: 'Responsible Development Objectives', description: 'Define responsible development objectives', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 1 },
      { code: 'A.6.2', title: 'Design and Development Processes', description: 'Establish design and development processes', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 2 },
      { code: 'A.6.3', title: 'Requirements and Specifications', description: 'Specify requirements and system specifications', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 3 },
      { code: 'A.6.4', title: 'Design Documentation', description: 'Create design documentation', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 4 },
      { code: 'A.6.5', title: 'Verification and Validation', description: 'Implement verification and validation procedures', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 5 },
      { code: 'A.6.6', title: 'Deployment Planning', description: 'Plan and document deployment', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 6 },
      { code: 'A.6.7', title: 'Operation and Monitoring', description: 'Operate and monitor systems', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 7 },
      { code: 'A.6.8', title: 'Technical Documentation', description: 'Maintain technical documentation', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 8 },
      { code: 'A.6.9', title: 'Event Logging and Audit Trails', description: 'Enable event logging and audit trails', frameworkId: isoFramework.id, parentId: a6Domain.id, sortOrder: 9 },
    ],
  });

  // A.7: Data for AI Systems (5 Controls)
  const a7Domain = await prisma.control.create({
    data: {
      code: 'A.7',
      title: 'Data for AI Systems',
      description: 'Data quality, acquisition, provenance, preparation',
      frameworkId: isoFramework.id,
      sortOrder: 6,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.7.1', title: 'Data Acquisition Requirements', description: 'Define data acquisition requirements', frameworkId: isoFramework.id, parentId: a7Domain.id, sortOrder: 1 },
      { code: 'A.7.2', title: 'Data Quality Assurance', description: 'Implement data quality assurance', frameworkId: isoFramework.id, parentId: a7Domain.id, sortOrder: 2 },
      { code: 'A.7.3', title: 'Data Provenance Tracking', description: 'Track data provenance', frameworkId: isoFramework.id, parentId: a7Domain.id, sortOrder: 3 },
      { code: 'A.7.4', title: 'Data Preparation Techniques', description: 'Document data preparation techniques', frameworkId: isoFramework.id, parentId: a7Domain.id, sortOrder: 4 },
      { code: 'A.7.5', title: 'Data Governance Records', description: 'Maintain data governance records', frameworkId: isoFramework.id, parentId: a7Domain.id, sortOrder: 5 },
    ],
  });

  // A.8: Information for Interested Parties (4 Controls)
  const a8Domain = await prisma.control.create({
    data: {
      code: 'A.8',
      title: 'Information for Interested Parties',
      description: 'User documentation, transparency, incident reporting',
      frameworkId: isoFramework.id,
      sortOrder: 7,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.8.1', title: 'User Documentation', description: 'Provide user documentation and guidance', frameworkId: isoFramework.id, parentId: a8Domain.id, sortOrder: 1 },
      { code: 'A.8.2', title: 'External Reporting and Transparency', description: 'Enable external reporting and transparency', frameworkId: isoFramework.id, parentId: a8Domain.id, sortOrder: 2 },
      { code: 'A.8.3', title: 'Incident Communication', description: 'Communicate incidents and issues', frameworkId: isoFramework.id, parentId: a8Domain.id, sortOrder: 3 },
      { code: 'A.8.4', title: 'System Limitations Disclosure', description: 'Disclose system limitations and capabilities', frameworkId: isoFramework.id, parentId: a8Domain.id, sortOrder: 4 },
    ],
  });

  // A.9: Use of AI Systems (3 Controls)
  const a9Domain = await prisma.control.create({
    data: {
      code: 'A.9',
      title: 'Use of AI Systems',
      description: 'Responsible use, human oversight, intended boundaries',
      frameworkId: isoFramework.id,
      sortOrder: 8,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.9.1', title: 'Responsible Use Processes', description: 'Establish responsible use processes', frameworkId: isoFramework.id, parentId: a9Domain.id, sortOrder: 1 },
      { code: 'A.9.2', title: 'Intended Use Boundaries', description: 'Define intended use boundaries', frameworkId: isoFramework.id, parentId: a9Domain.id, sortOrder: 2 },
      { code: 'A.9.3', title: 'Human Oversight Mechanisms', description: 'Ensure human oversight mechanisms', frameworkId: isoFramework.id, parentId: a9Domain.id, sortOrder: 3 },
    ],
  });

  // A.10: Third-Party and Customer Relationships (3 Controls)
  const a10Domain = await prisma.control.create({
    data: {
      code: 'A.10',
      title: 'Third-Party and Customer Relationships',
      description: 'Supplier management, responsibility allocation',
      frameworkId: isoFramework.id,
      sortOrder: 9,
    },
  });

  await prisma.control.createMany({
    data: [
      { code: 'A.10.1', title: 'Responsibility Allocation', description: 'Allocate responsibilities clearly', frameworkId: isoFramework.id, parentId: a10Domain.id, sortOrder: 1 },
      { code: 'A.10.2', title: 'Supplier Management', description: 'Manage supplier and vendor relationships', frameworkId: isoFramework.id, parentId: a10Domain.id, sortOrder: 2 },
      { code: 'A.10.3', title: 'Customer Expectations', description: 'Document customer expectations and agreements', frameworkId: isoFramework.id, parentId: a10Domain.id, sortOrder: 3 },
    ],
  });

  console.log('  ✅ ISO/IEC 42001:2023 seeded (9 domains, 38 controls)');
  return isoFramework;
}

/**
 * Seed control mappings between frameworks
 */
async function seedControlMappings(nistFramework: any, isoFramework: any) {
  console.log('🔗 Creating cross-framework mappings...');

  // Get controls for mapping
  const nistGovern1 = await prisma.control.findFirst({
    where: { frameworkId: nistFramework.id, code: 'GOVERN-1' },
  });

  const isoA2 = await prisma.control.findFirst({
    where: { frameworkId: isoFramework.id, code: 'A.2' },
  });

  const isoA3 = await prisma.control.findFirst({
    where: { frameworkId: isoFramework.id, code: 'A.3' },
  });

  // Governance mapping: GOVERN-1 ↔ A.2 (Policies)
  if (nistGovern1 && isoA2) {
    await prisma.controlMapping.create({
      data: {
        sourceControlId: nistGovern1.id,
        targetControlId: isoA2.id,
        sourceFrameworkId: nistFramework.id,
        targetFrameworkId: isoFramework.id,
        confidenceScore: ConfidenceLevel.HIGH,
        mappingType: MappingType.EQUIVALENT,
        rationale: 'Both address governance policies and procedures',
      },
    });
  }

  // Governance mapping: GOVERN-2 ↔ A.3 (Accountability)
  const nistGovern2 = await prisma.control.findFirst({
    where: { frameworkId: nistFramework.id, code: 'GOVERN-2' },
  });

  if (nistGovern2 && isoA3) {
    await prisma.controlMapping.create({
      data: {
        sourceControlId: nistGovern2.id,
        targetControlId: isoA3.id,
        sourceFrameworkId: nistFramework.id,
        targetFrameworkId: isoFramework.id,
        confidenceScore: ConfidenceLevel.HIGH,
        mappingType: MappingType.EQUIVALENT,
        rationale: 'Both define accountability and organizational roles',
      },
    });
  }

  // Risk assessment mapping: MAP-1 ↔ A.5 (Impact Assessment)
  const nistMap1 = await prisma.control.findFirst({
    where: { frameworkId: nistFramework.id, code: 'MAP-1' },
  });

  const isoA5 = await prisma.control.findFirst({
    where: { frameworkId: isoFramework.id, code: 'A.5' },
  });

  if (nistMap1 && isoA5) {
    await prisma.controlMapping.create({
      data: {
        sourceControlId: nistMap1.id,
        targetControlId: isoA5.id,
        sourceFrameworkId: nistFramework.id,
        targetFrameworkId: isoFramework.id,
        confidenceScore: ConfidenceLevel.MEDIUM,
        mappingType: MappingType.PARTIAL,
        rationale: 'Both address risk and impact assessment',
      },
    });
  }

  console.log('  ✅ Cross-framework mappings created');
}

/**
 * Main seed function for frameworks
 */
export async function seedFrameworks() {
  console.log('\n🏛️  Seeding Compliance Frameworks...\n');

  const nistFramework = await seedNISTFramework();
  const isoFramework = await seedISOFramework();
  await seedControlMappings(nistFramework, isoFramework);

  console.log('\n✅ Framework seeding completed!\n');
}
