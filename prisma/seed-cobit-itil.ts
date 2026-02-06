/**
 * COBIT 2019 and ITIL v4 Seed Script
 * IT Governance and Service Management Frameworks
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// COBIT 2019 - Control Objectives for Information Technologies
// ============================================================================

const COBIT_DOMAINS = [
  {
    code: 'COBIT-EDM',
    title: 'Evaluate, Direct and Monitor',
    description: 'Governance domain - Board-level objectives ensuring stakeholder needs are evaluated.',
    objectives: [
      { code: 'EDM01', title: 'Ensured Governance Framework Setting and Maintenance', description: 'Analyze and articulate the requirements for the governance of enterprise IT.' },
      { code: 'EDM02', title: 'Ensured Benefits Delivery', description: 'Secure optimal value from IT-enabled initiatives, services, and assets.' },
      { code: 'EDM03', title: 'Ensured Risk Optimization', description: 'Ensure that IT-related enterprise risk does not exceed risk appetite.' },
      { code: 'EDM04', title: 'Ensured Resource Optimization', description: 'Ensure that adequate and sufficient IT resources are available.' },
      { code: 'EDM05', title: 'Ensured Stakeholder Engagement', description: 'Ensure stakeholders are supportive of the IT strategy and roadmap.' },
    ],
  },
  {
    code: 'COBIT-APO',
    title: 'Align, Plan and Organize',
    description: 'Management domain - Providing direction for solution delivery and service support.',
    objectives: [
      { code: 'APO01', title: 'Managed IT Management Framework', description: 'Implement and maintain mechanisms to manage information and technology.' },
      { code: 'APO02', title: 'Managed Strategy', description: 'Provide holistic view of current IT environment and strategic direction.' },
      { code: 'APO03', title: 'Managed Enterprise Architecture', description: 'Establish common architecture for business process and IT standardization.' },
      { code: 'APO04', title: 'Managed Innovation', description: 'Achieve competitive advantage through IT innovation.' },
      { code: 'APO05', title: 'Managed Portfolio', description: 'Execute strategic direction by managing IT investments portfolio.' },
      { code: 'APO06', title: 'Managed Budget and Costs', description: 'Foster IT partnership while controlling costs and improving value.' },
      { code: 'APO07', title: 'Managed Human Resources', description: 'Optimize human resources capabilities to meet enterprise objectives.' },
      { code: 'APO08', title: 'Managed Relationships', description: 'Create improved outcomes and confidence through effective relationships.' },
      { code: 'APO09', title: 'Managed Service Agreements', description: 'Ensure IT services meet enterprise requirements.' },
      { code: 'APO10', title: 'Managed Vendors', description: 'Manage IT-related products and services provided by vendors.' },
      { code: 'APO11', title: 'Managed Quality', description: 'Define and communicate quality requirements and ensure compliance.' },
      { code: 'APO12', title: 'Managed Risk', description: 'Identify, assess, and reduce IT-related risk within risk appetite.' },
      { code: 'APO13', title: 'Managed Security', description: 'Define, operate, and monitor information security management system.' },
      { code: 'APO14', title: 'Managed Data', description: 'Achieve effective management of enterprise data assets.' },
    ],
  },
  {
    code: 'COBIT-BAI',
    title: 'Build, Acquire and Implement',
    description: 'Management domain - Defining, acquiring, and implementing solutions.',
    objectives: [
      { code: 'BAI01', title: 'Managed Programs', description: 'Realize business benefits through program management.' },
      { code: 'BAI02', title: 'Managed Requirements Definition', description: 'Create optimal solution meeting enterprise needs while minimizing risk.' },
      { code: 'BAI03', title: 'Managed Solutions Identification and Build', description: 'Establish timely, cost-effective solutions with automated business processes.' },
      { code: 'BAI04', title: 'Managed Availability and Capacity', description: 'Maintain service availability and resource optimization.' },
      { code: 'BAI05', title: 'Managed Organizational Change', description: 'Prepare and commit stakeholders for IT changes.' },
      { code: 'BAI06', title: 'Managed IT Changes', description: 'Enable fast, reliable IT changes while mitigating risks.' },
      { code: 'BAI07', title: 'Managed IT Change Acceptance and Transitioning', description: 'Accept and transition solutions safely and in line with execution plans.' },
      { code: 'BAI08', title: 'Managed Knowledge', description: 'Provide knowledge required to support IT delivery.' },
      { code: 'BAI09', title: 'Managed Assets', description: 'Account for all IT assets and optimize value provided.' },
      { code: 'BAI10', title: 'Managed Configuration', description: 'Define and maintain accurate configuration items and relationships.' },
      { code: 'BAI11', title: 'Managed Projects', description: 'Realize business benefits by managing project scope, time, cost, and quality.' },
    ],
  },
  {
    code: 'COBIT-DSS',
    title: 'Deliver, Service and Support',
    description: 'Management domain - Operational delivery of required services.',
    objectives: [
      { code: 'DSS01', title: 'Managed Operations', description: 'Deliver IT operational product and service outcomes as planned.' },
      { code: 'DSS02', title: 'Managed Service Requests and Incidents', description: 'Achieve increased productivity through quick resolution of queries and incidents.' },
      { code: 'DSS03', title: 'Managed Problems', description: 'Increase availability and reduce costs through reduced incidents via root cause analysis.' },
      { code: 'DSS04', title: 'Managed Continuity', description: 'Continue critical business operations and maintain IT services availability.' },
      { code: 'DSS05', title: 'Managed Security Services', description: 'Minimize business impact of operational security vulnerabilities and incidents.' },
      { code: 'DSS06', title: 'Managed Business Process Controls', description: 'Maintain information integrity and security within business processes.' },
    ],
  },
  {
    code: 'COBIT-MEA',
    title: 'Monitor, Evaluate and Assess',
    description: 'Management domain - Performance monitoring and compliance assessment.',
    objectives: [
      { code: 'MEA01', title: 'Managed Performance and Conformance Monitoring', description: 'Provide transparency of IT performance and conformance.' },
      { code: 'MEA02', title: 'Managed System of Internal Control', description: 'Obtain transparency on effectiveness of internal controls.' },
      { code: 'MEA03', title: 'Managed Compliance with External Requirements', description: 'Ensure compliance with laws and regulations.' },
      { code: 'MEA04', title: 'Managed Assurance', description: 'Enable management to implement cost-effective assurance approach.' },
    ],
  },
];

// ============================================================================
// ITIL v4 - IT Service Management
// ============================================================================

const ITIL_PRACTICES = [
  {
    code: 'ITIL-GEN',
    title: 'General Management Practices',
    description: 'Practices adopted and adapted from general business management for service management.',
    practices: [
      { code: 'ITIL-SM', title: 'Strategy Management', description: 'Formulate the goals of the organization and adopt courses of action to achieve those goals.' },
      { code: 'ITIL-PM', title: 'Portfolio Management', description: 'Ensure that the organization has the right mix of programmes, projects, products, and services.' },
      { code: 'ITIL-ARCH', title: 'Architecture Management', description: 'Understand all the elements that make up an organization and how they interrelate.' },
      { code: 'ITIL-SFM', title: 'Service Financial Management', description: 'Support the organization\'s strategies and plans for service management.' },
      { code: 'ITIL-WFM', title: 'Workforce and Talent Management', description: 'Ensure the organization has the right people with appropriate skills and knowledge.' },
      { code: 'ITIL-CI', title: 'Continual Improvement', description: 'Align the organization\'s practices and services with changing business needs.' },
      { code: 'ITIL-MEAS', title: 'Measurement and Reporting', description: 'Support good decision-making and continual improvement.' },
      { code: 'ITIL-RM', title: 'Risk Management', description: 'Ensure the organization understands and effectively handles risks.' },
      { code: 'ITIL-ISM', title: 'Information Security Management', description: 'Protect information needed by the organization to conduct business.' },
      { code: 'ITIL-KM', title: 'Knowledge Management', description: 'Maintain and improve effective use of information and knowledge.' },
      { code: 'ITIL-OCM', title: 'Organizational Change Management', description: 'Ensure changes are smoothly and successfully implemented.' },
      { code: 'ITIL-PJM', title: 'Project Management', description: 'Ensure all projects are successfully delivered.' },
      { code: 'ITIL-REM', title: 'Relationship Management', description: 'Establish and nurture links between the organization and stakeholders.' },
      { code: 'ITIL-SRM', title: 'Supplier Management', description: 'Ensure suppliers and their performance are managed appropriately.' },
    ],
  },
  {
    code: 'ITIL-SVC',
    title: 'Service Management Practices',
    description: 'Practices developed in service management and IT service management industries.',
    practices: [
      { code: 'ITIL-AVL', title: 'Availability Management', description: 'Ensure services deliver agreed levels of availability.' },
      { code: 'ITIL-BA', title: 'Business Analysis', description: 'Analyze a business or element of a business to recommend solutions.' },
      { code: 'ITIL-CAP', title: 'Capacity and Performance Management', description: 'Ensure services achieve agreed performance levels.' },
      { code: 'ITIL-CHG', title: 'Change Enablement', description: 'Maximize successful service and product changes.' },
      { code: 'ITIL-INC', title: 'Incident Management', description: 'Minimize negative impact of incidents by restoring normal service quickly.' },
      { code: 'ITIL-ITAM', title: 'IT Asset Management', description: 'Plan and manage full lifecycle of all IT assets.' },
      { code: 'ITIL-MON', title: 'Monitoring and Event Management', description: 'Systematically observe services and components.' },
      { code: 'ITIL-PRB', title: 'Problem Management', description: 'Reduce likelihood and impact of incidents by identifying causes.' },
      { code: 'ITIL-REL', title: 'Release Management', description: 'Make new and changed services available for use.' },
      { code: 'ITIL-CAT', title: 'Service Catalogue Management', description: 'Provide single source of consistent information on all services.' },
      { code: 'ITIL-CFG', title: 'Service Configuration Management', description: 'Ensure accurate information about services configuration is available.' },
      { code: 'ITIL-SCM', title: 'Service Continuity Management', description: 'Ensure service availability and performance maintained during disasters.' },
      { code: 'ITIL-SDN', title: 'Service Design', description: 'Design products and services fit for purpose and use.' },
      { code: 'ITIL-SDK', title: 'Service Desk', description: 'Capture demand for incident resolution and service requests.' },
      { code: 'ITIL-SLM', title: 'Service Level Management', description: 'Set clear business-based targets for service performance.' },
      { code: 'ITIL-SRQ', title: 'Service Request Management', description: 'Support agreed quality of service by handling user-initiated requests.' },
      { code: 'ITIL-SVV', title: 'Service Validation and Testing', description: 'Ensure new or changed products meet defined requirements.' },
    ],
  },
  {
    code: 'ITIL-TECH',
    title: 'Technical Management Practices',
    description: 'Practices adapted from technology management domains for service management.',
    practices: [
      { code: 'ITIL-DPL', title: 'Deployment Management', description: 'Move new or changed components to live environments.' },
      { code: 'ITIL-INF', title: 'Infrastructure and Platform Management', description: 'Oversee the infrastructure and platforms used by an organization.' },
      { code: 'ITIL-SWD', title: 'Software Development and Management', description: 'Ensure applications meet stakeholder needs.' },
    ],
  },
];

export async function seedCOBIT() {
  console.log('📘 Seeding COBIT 2019...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'COBIT', version: '2019' } },
    update: {},
    create: {
      name: 'COBIT 2019 - Control Objectives for Information Technologies',
      shortName: 'COBIT',
      version: '2019',
      effectiveDate: new Date('2019-01-01'),
      description: 'ISACA framework for IT governance and management. Provides end-to-end business view of governance of enterprise IT.',
      category: FrameworkCategory.SECURITY,
      isActive: true,
    },
  });

  for (let i = 0; i < COBIT_DOMAINS.length; i++) {
    const domain = COBIT_DOMAINS[i];
    const domainControl = await prisma.control.create({
      data: {
        code: domain.code,
        title: domain.title,
        description: domain.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < domain.objectives.length; j++) {
      await prisma.control.create({
        data: {
          code: domain.objectives[j].code,
          title: domain.objectives[j].title,
          description: domain.objectives[j].description,
          frameworkId: framework.id,
          parentId: domainControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ COBIT 2019 seeded (5 domains, 40 objectives)');
  return framework;
}

export async function seedITIL() {
  console.log('📗 Seeding ITIL v4...');

  const framework = await prisma.framework.upsert({
    where: { shortName_version: { shortName: 'ITIL', version: '4' } },
    update: {},
    create: {
      name: 'ITIL v4 - IT Service Management',
      shortName: 'ITIL',
      version: '4',
      effectiveDate: new Date('2019-02-01'),
      description: 'Best practice framework for IT service management. Focuses on co-creating value through the service value system.',
      category: FrameworkCategory.SECURITY,
      isActive: true,
    },
  });

  for (let i = 0; i < ITIL_PRACTICES.length; i++) {
    const category = ITIL_PRACTICES[i];
    const categoryControl = await prisma.control.create({
      data: {
        code: category.code,
        title: category.title,
        description: category.description,
        frameworkId: framework.id,
        sortOrder: i + 1,
      },
    });

    for (let j = 0; j < category.practices.length; j++) {
      await prisma.control.create({
        data: {
          code: category.practices[j].code,
          title: category.practices[j].title,
          description: category.practices[j].description,
          frameworkId: framework.id,
          parentId: categoryControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ ITIL v4 seeded (3 practice categories, 34 practices)');
  return framework;
}

export async function seedCOBITITILMappings() {
  console.log('🔗 Creating COBIT and ITIL cross-framework mappings...');

  const cobit = await prisma.framework.findFirst({
    where: { shortName: 'COBIT', version: '2019' },
  });
  const itil = await prisma.framework.findFirst({
    where: { shortName: 'ITIL', version: '4' },
  });
  const iso27001 = await prisma.framework.findFirst({
    where: { shortName: 'ISO-27001', version: '2022' },
  });

  let created = 0;

  // COBIT to ITIL mappings
  if (cobit && itil) {
    const cobitItilMappings = [
      { cobit: 'APO09', itil: 'ITIL-SLM', reason: 'Service agreements to service level management' },
      { cobit: 'APO10', itil: 'ITIL-SRM', reason: 'Vendor management to supplier management' },
      { cobit: 'APO12', itil: 'ITIL-RM', reason: 'Risk management alignment' },
      { cobit: 'APO13', itil: 'ITIL-ISM', reason: 'Security management alignment' },
      { cobit: 'BAI06', itil: 'ITIL-CHG', reason: 'IT changes to change enablement' },
      { cobit: 'DSS02', itil: 'ITIL-INC', reason: 'Incidents to incident management' },
      { cobit: 'DSS03', itil: 'ITIL-PRB', reason: 'Problems to problem management' },
      { cobit: 'DSS04', itil: 'ITIL-SCM', reason: 'Continuity to service continuity' },
    ];

    for (const mapping of cobitItilMappings) {
      const cobitControl = await prisma.control.findFirst({
        where: { frameworkId: cobit.id, code: mapping.cobit },
      });
      const itilControl = await prisma.control.findFirst({
        where: { frameworkId: itil.id, code: mapping.itil },
      });

      if (cobitControl && itilControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: cobitControl.id,
            targetControlId: itilControl.id,
            sourceFrameworkId: cobit.id,
            targetFrameworkId: itil.id,
            confidenceScore: ConfidenceLevel.HIGH,
            mappingType: MappingType.EQUIVALENT,
            rationale: mapping.reason,
          },
        });
        created++;
      }
    }
  }

  // COBIT to ISO 27001 mappings
  if (cobit && iso27001) {
    const cobitIsoMappings = [
      { cobit: 'APO13', iso: 'A.5', reason: 'Security management to information security policies' },
      { cobit: 'DSS05', iso: 'A.9', reason: 'Security services to access control' },
      { cobit: 'BAI10', iso: 'A.8', reason: 'Configuration to asset management' },
    ];

    for (const mapping of cobitIsoMappings) {
      const cobitControl = await prisma.control.findFirst({
        where: { frameworkId: cobit.id, code: mapping.cobit },
      });
      const isoControl = await prisma.control.findFirst({
        where: { frameworkId: iso27001.id, code: mapping.iso },
      });

      if (cobitControl && isoControl) {
        await prisma.controlMapping.create({
          data: {
            sourceControlId: cobitControl.id,
            targetControlId: isoControl.id,
            sourceFrameworkId: cobit.id,
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

  console.log(`  ✅ Created ${created} COBIT/ITIL cross-framework mappings`);
}
