/**
 * Framework Seed Script
 * Seeds NIST AI RMF 1.0 and ISO/IEC 42001:2023 frameworks with controls
 * Contains actual control content from the standards
 */

import { PrismaClient, FrameworkCategory, ConfidenceLevel, MappingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * NIST AI RMF 1.0 Subcategories with actual descriptions
 */
const NIST_GOVERN_SUBCATEGORIES = {
  'GOVERN-1': [
    { code: 'GOVERN-1.1', title: 'Legal and Regulatory Requirements', description: 'Legal and regulatory requirements involving AI are understood, managed, and documented.' },
    { code: 'GOVERN-1.2', title: 'Internal AI Policies', description: 'The characteristics of trustworthy AI are integrated into organizational policies, processes, procedures, and practices.' },
    { code: 'GOVERN-1.3', title: 'Hierarchy of Authority', description: 'Processes, procedures, and practices are in place to determine the needed level of risk management activities based on the organization\'s risk tolerance.' },
    { code: 'GOVERN-1.4', title: 'Risk Management Process', description: 'The risk management process and its outcomes are established through transparent policies, procedures, and other controls based on organizational risk priorities.' },
    { code: 'GOVERN-1.5', title: 'Ongoing Monitoring', description: 'Ongoing monitoring and periodic review of the risk management process and its outcomes are planned and organizational roles and responsibilities clearly defined.' },
    { code: 'GOVERN-1.6', title: 'Mechanisms for Inventory', description: 'Mechanisms are in place to inventory AI systems and are resourced according to organizational risk priorities.' },
    { code: 'GOVERN-1.7', title: 'Decommissioning Processes', description: 'Processes and procedures are in place for decommissioning and phasing out AI systems safely and in ways that do not increase risks or harms.' },
  ],
  'GOVERN-2': [
    { code: 'GOVERN-2.1', title: 'Roles and Responsibilities', description: 'Roles and responsibilities and lines of communication related to mapping, measuring, and managing AI risks are documented and are clear to individuals and teams throughout the organization.' },
    { code: 'GOVERN-2.2', title: 'Personnel Training', description: 'The organization\'s personnel and partners receive AI risk management training to enable them to perform their duties and responsibilities consistent with related policies, procedures, and agreements.' },
    { code: 'GOVERN-2.3', title: 'Executive Leadership', description: 'Executive leadership of the organization takes responsibility for decisions about risks associated with AI system development and deployment.' },
  ],
  'GOVERN-3': [
    { code: 'GOVERN-3.1', title: 'Workforce Diversity', description: 'Decision-making related to mapping, measuring, and managing AI risks throughout the lifecycle is informed by a diverse team.' },
    { code: 'GOVERN-3.2', title: 'Accessibility Considerations', description: 'Policies and procedures are in place to address AI actor diversity, equity, inclusion, and accessibility.' },
  ],
  'GOVERN-4': [
    { code: 'GOVERN-4.1', title: 'Organizational Practices', description: 'Organizational practices are in place to foster critical thinking and safety-first mindset in design, development, deployment, and uses of AI systems.' },
    { code: 'GOVERN-4.2', title: 'Safety Culture', description: 'Organizational teams document the risks and potential impacts of the AI technology they design, develop, deploy, evaluate, and use.' },
    { code: 'GOVERN-4.3', title: 'Incident Response', description: 'Organizational practices are in place to enable AI testing, identification of incidents, and information sharing.' },
  ],
  'GOVERN-5': [
    { code: 'GOVERN-5.1', title: 'Stakeholder Feedback', description: 'Organizational policies and practices are in place to collect, consider, prioritize, and integrate feedback from those external to the team that developed or deployed the AI system.' },
    { code: 'GOVERN-5.2', title: 'Engagement Mechanisms', description: 'Mechanisms are established to enable AI actors to regularly incorporate adjudicated feedback from relevant AI actors into system design and implementation.' },
  ],
  'GOVERN-6': [
    { code: 'GOVERN-6.1', title: 'Third-Party Policies', description: 'Policies and procedures are in place that address AI risks associated with third-party entities, including risks of infringement of a third party\'s intellectual property or other rights.' },
    { code: 'GOVERN-6.2', title: 'Supply Chain Assessment', description: 'Contingency processes are in place to handle failures or incidents in third-party data or AI systems deemed to be high-risk.' },
  ],
};

const NIST_MAP_SUBCATEGORIES = {
  'MAP-1': [
    { code: 'MAP-1.1', title: 'Intended Purpose', description: 'Intended purposes, potentially beneficial uses, context of use, and deployment environment are understood and documented.' },
    { code: 'MAP-1.2', title: 'Interdisciplinary Teams', description: 'Interdisciplinary AI actors, competencies, skills, and capacities for establishing context are identified and documented.' },
    { code: 'MAP-1.3', title: 'Assessment of Business Value', description: 'The business value or context of business use has been clearly defined or – in the case of assessing existing AI systems – re-evaluated.' },
    { code: 'MAP-1.4', title: 'Assumptions Documentation', description: 'The organization\'s mission and relevant goals for AI technology are understood and documented.' },
    { code: 'MAP-1.5', title: 'Risk Tolerance', description: 'Organizational risk tolerances are determined and documented.' },
    { code: 'MAP-1.6', title: 'System Requirements', description: 'System requirements are derived from intended purpose, context of use, and deployment environment.' },
  ],
  'MAP-2': [
    { code: 'MAP-2.1', title: 'AI System Classification', description: 'The specific task and methods used to implement the task is documented.' },
    { code: 'MAP-2.2', title: 'Information About AI System', description: 'Information about the AI system is documented.' },
    { code: 'MAP-2.3', title: 'Scientific Integrity', description: 'Scientific integrity and TEVV considerations are identified and documented.' },
  ],
  'MAP-3': [
    { code: 'MAP-3.1', title: 'Potential Positive Impacts', description: 'Potential benefits of intended AI system functionality and performance are examined and documented.' },
    { code: 'MAP-3.2', title: 'Potential Costs', description: 'Potential costs of the AI system are examined and documented.' },
    { code: 'MAP-3.3', title: 'Specific Populations', description: 'Targeted application scope is specified and documented based on potential benefits and costs.' },
    { code: 'MAP-3.4', title: 'Technology Limits', description: 'Technology limitations are understood and documented.' },
    { code: 'MAP-3.5', title: 'Inferences and Outputs', description: 'The types of output from the AI system are specified and documented.' },
  ],
  'MAP-4': [
    { code: 'MAP-4.1', title: 'Negative Risks Mapping', description: 'Approaches for mapping AI risks have been identified, and proper techniques are employed to measure and/or estimate AI risks.' },
    { code: 'MAP-4.2', title: 'Internal Risk Sources', description: 'Internal risk sources are identified.' },
  ],
  'MAP-5': [
    { code: 'MAP-5.1', title: 'Impacted Individuals', description: 'Individuals or groups affected by the system have been identified.' },
    { code: 'MAP-5.2', title: 'Environmental Impacts', description: 'Systemic or societal-level impacts have been characterized.' },
  ],
};

const NIST_MEASURE_SUBCATEGORIES = {
  'MEASURE-1': [
    { code: 'MEASURE-1.1', title: 'Approaches and Metrics', description: 'Approaches and metrics for measurement of AI risks enumerated during MAP are selected and documented.' },
    { code: 'MEASURE-1.2', title: 'Appropriateness of Metrics', description: 'Appropriateness of AI metrics and effectiveness of existing controls are assessed and documented.' },
    { code: 'MEASURE-1.3', title: 'Internal Experts', description: 'Internal experts who did not serve as combatants in the AI\'s development, and external experts are engaged for independent measurement and evaluation.' },
  ],
  'MEASURE-2': [
    { code: 'MEASURE-2.1', title: 'Test Sets', description: 'Test sets, metrics, and details about the tools used during testing are documented.' },
    { code: 'MEASURE-2.2', title: 'Decisions About System Validity', description: 'Evaluations involving human subjects meet applicable requirements.' },
    { code: 'MEASURE-2.3', title: 'Bias Assessment', description: 'Fairness and bias – loss of representation, inclusion, and diversity – are evaluated.' },
    { code: 'MEASURE-2.4', title: 'Privacy Concerns', description: 'Privacy risk of the AI system is examined and documented.' },
    { code: 'MEASURE-2.5', title: 'Environmental Impact', description: 'Environmental impact of AI model training and management is measured.' },
    { code: 'MEASURE-2.6', title: 'Safety Assessment', description: 'Safety of AI systems is assessed, documented, and monitored.' },
    { code: 'MEASURE-2.7', title: 'Security Assessment', description: 'AI system security and resilience are evaluated.' },
    { code: 'MEASURE-2.8', title: 'Robustness Evaluation', description: 'Robustness of AI system is assessed.' },
    { code: 'MEASURE-2.9', title: 'Explainability Assessment', description: 'AI model explainability and interpretability are evaluated.' },
    { code: 'MEASURE-2.10', title: 'Human-AI Configurations', description: 'Privacy and other applicable requirements are evaluated.' },
    { code: 'MEASURE-2.11', title: 'Fairness Analysis', description: 'Fairness and bias – loss of representation – are evaluated.' },
    { code: 'MEASURE-2.12', title: 'Documentation Effectiveness', description: 'Documentation of AI system design and development is evaluated for completeness.' },
    { code: 'MEASURE-2.13', title: 'Accountability Effectiveness', description: 'Effectiveness of accountability mechanisms is evaluated.' },
  ],
  'MEASURE-3': [
    { code: 'MEASURE-3.1', title: 'Risk Tracking', description: 'Risks are tracked through time and integrated into risk management approach.' },
    { code: 'MEASURE-3.2', title: 'Risk Aggregation', description: 'Risk-tracking approaches are monitored for effectiveness.' },
    { code: 'MEASURE-3.3', title: 'Feedback Mechanisms', description: 'Feedback about efficacy of measurement is gathered and integrated.' },
  ],
  'MEASURE-4': [
    { code: 'MEASURE-4.1', title: 'Measurement Approaches', description: 'Measurement approaches are reviewed and validated.' },
    { code: 'MEASURE-4.2', title: 'Measurement Results', description: 'Measurement results regarding AI system trustworthiness in deployment context(s) are documented.' },
    { code: 'MEASURE-4.3', title: 'Mechanisms for Feedback', description: 'Mechanisms for feedback about measurement relevance are in place.' },
  ],
};

const NIST_MANAGE_SUBCATEGORIES = {
  'MANAGE-1': [
    { code: 'MANAGE-1.1', title: 'Risk Prioritization', description: 'A determination is made as to whether the AI system achieves its intended purpose and stated objectives.' },
    { code: 'MANAGE-1.2', title: 'Risk Treatment', description: 'Treatment of documented AI risks is prioritized based on organization risk tolerance.' },
    { code: 'MANAGE-1.3', title: 'Responses to Risks', description: 'Responses to AI risks are developed, planned, and documented.' },
    { code: 'MANAGE-1.4', title: 'Risk Management Plans', description: 'Risk management plans are integrated into organizational risk management approaches.' },
  ],
  'MANAGE-2': [
    { code: 'MANAGE-2.1', title: 'Resources Allocated', description: 'Resources required to manage AI risks are taken into account.' },
    { code: 'MANAGE-2.2', title: 'Mechanisms to Inform', description: 'Mechanisms are in place and applied to sustain the value of deployed AI systems.' },
    { code: 'MANAGE-2.3', title: 'Procedures to Respond', description: 'Procedures are followed to respond to and recover from a previously unknown risk when it is identified.' },
    { code: 'MANAGE-2.4', title: 'Mechanisms Adjusted', description: 'Mechanisms are in place and applied, and responsibilities are assigned and understood, to supersede, disengage, or deactivate AI systems that demonstrate performance or outcomes inconsistent with intended use.' },
  ],
  'MANAGE-3': [
    { code: 'MANAGE-3.1', title: 'Third-Party Risks', description: 'AI risks and benefits from third-party entities are monitored over time.' },
    { code: 'MANAGE-3.2', title: 'Third-Party Reviews', description: 'Pre-trained models used for development are reviewed and monitored for performance and trustworthiness.' },
  ],
  'MANAGE-4': [
    { code: 'MANAGE-4.1', title: 'Risk Treatments Documented', description: 'Post-deployment monitoring plans for AI systems are implemented.' },
    { code: 'MANAGE-4.2', title: 'Incident Response', description: 'Measurable activities for continual improvements are integrated into AI system updates.' },
    { code: 'MANAGE-4.3', title: 'Incident Communication', description: 'Incident response and recovery plans are in place, activated, and continually improved if AI system incidents occur.' },
  ],
};

/**
 * ISO 42001 Controls with detailed descriptions
 */
const ISO_CONTROLS = {
  'A.2': [
    { code: 'A.2.1', title: 'AI Policy Development', description: 'The organization shall develop, approve and maintain a policy for AI systems that is appropriate to its purpose and context, provides a framework for setting AI objectives, and includes a commitment to satisfy applicable requirements and continually improve the AI management system.' },
    { code: 'A.2.2', title: 'Alignment with Organizational Frameworks', description: 'The organization shall ensure that AI policies are aligned with privacy frameworks, cybersecurity policies, data governance frameworks, and applicable ethical guidelines established within the organization or required by external regulations.' },
    { code: 'A.2.3', title: 'Policy Review and Evolution', description: 'The organization shall establish mechanisms to periodically review AI policies, incorporate lessons learned from AI system operations, and evolve policies based on changes in technology, regulations, and organizational context.' },
  ],
  'A.3': [
    { code: 'A.3.1', title: 'Roles and Responsibilities', description: 'The organization shall assign clear roles and responsibilities for AI system development, deployment, operation, and oversight. This includes identification of decision-makers, technical staff, compliance officers, and executive sponsors.' },
    { code: 'A.3.2', title: 'Escalation Processes', description: 'The organization shall establish clear escalation processes for reporting and addressing concerns, incidents, or anomalies related to AI systems, including timelines for response and resolution.' },
  ],
  'A.4': [
    { code: 'A.4.1', title: 'Resource Documentation', description: 'The organization shall document all resources required for AI system development, deployment, and operation, including data, computational infrastructure, human expertise, and tooling.' },
    { code: 'A.4.2', title: 'Data Resource Inventory', description: 'The organization shall maintain an inventory of all data resources used by AI systems, including source, quality characteristics, update frequency, access controls, and retention policies.' },
    { code: 'A.4.3', title: 'Tooling Requirements', description: 'The organization shall identify and document tooling requirements for AI development, testing, deployment, and monitoring, ensuring tools are appropriate for the intended AI applications.' },
    { code: 'A.4.4', title: 'Computing Infrastructure', description: 'The organization shall allocate and manage computing infrastructure sufficient to support AI system requirements, including training, inference, storage, and backup capabilities.' },
    { code: 'A.4.5', title: 'Human Expertise', description: 'The organization shall ensure availability of personnel with appropriate competencies for AI development, deployment, and oversight, including data scientists, engineers, domain experts, and ethicists.' },
  ],
  'A.5': [
    { code: 'A.5.1', title: 'Impact Assessment Processes', description: 'The organization shall establish systematic processes for assessing potential impacts of AI systems, including algorithmic impact assessments, risk assessments, and ethical reviews conducted at appropriate lifecycle stages.' },
    { code: 'A.5.2', title: 'Individual and Group Impacts', description: 'The organization shall document potential impacts on individuals and groups affected by AI system decisions, including impacts on rights, safety, wellbeing, economic interests, and social outcomes.' },
    { code: 'A.5.3', title: 'Fairness and Bias Evaluation', description: 'The organization shall evaluate AI systems for potential fairness concerns and bias, including demographic disparities, historical bias in training data, and algorithmic discrimination.' },
    { code: 'A.5.4', title: 'Societal-Level Impacts', description: 'The organization shall consider broader societal impacts of AI systems, including effects on employment, social structures, democratic processes, and environmental sustainability.' },
  ],
  'A.6': [
    { code: 'A.6.1', title: 'Responsible Development Objectives', description: 'The organization shall define clear objectives for responsible AI development that incorporate trustworthiness, ethical considerations, regulatory compliance, and alignment with organizational values.' },
    { code: 'A.6.2', title: 'Design and Development Processes', description: 'The organization shall establish and follow documented processes for AI system design and development that incorporate risk management, quality assurance, and responsible AI principles.' },
    { code: 'A.6.3', title: 'Requirements and Specifications', description: 'The organization shall specify functional and non-functional requirements for AI systems, including performance criteria, safety requirements, and constraints on system behavior.' },
    { code: 'A.6.4', title: 'Design Documentation', description: 'The organization shall create and maintain design documentation describing AI system architecture, algorithms, data flows, interfaces, and key design decisions with their rationale.' },
    { code: 'A.6.5', title: 'Verification and Validation', description: 'The organization shall implement verification and validation procedures to ensure AI systems meet specified requirements and perform as intended under expected operating conditions.' },
    { code: 'A.6.6', title: 'Deployment Planning', description: 'The organization shall plan and document deployment activities including environment setup, integration testing, rollback procedures, and go-live criteria.' },
    { code: 'A.6.7', title: 'Operation and Monitoring', description: 'The organization shall establish procedures for operating and monitoring AI systems in production, including performance tracking, anomaly detection, and incident response.' },
    { code: 'A.6.8', title: 'Technical Documentation', description: 'The organization shall maintain comprehensive technical documentation throughout the AI system lifecycle, enabling understanding, maintenance, and audit of the system.' },
    { code: 'A.6.9', title: 'Event Logging and Audit Trails', description: 'The organization shall enable comprehensive event logging and audit trails for AI systems, capturing decisions, inputs, outputs, and system events for accountability and forensic purposes.' },
  ],
  'A.7': [
    { code: 'A.7.1', title: 'Data Acquisition Requirements', description: 'The organization shall define requirements for acquiring data for AI systems, including data sources, quality criteria, consent requirements, and compliance with applicable data protection regulations.' },
    { code: 'A.7.2', title: 'Data Quality Assurance', description: 'The organization shall implement data quality assurance measures including validation, cleansing, enrichment, and ongoing monitoring of data quality metrics.' },
    { code: 'A.7.3', title: 'Data Provenance Tracking', description: 'The organization shall track and document data provenance including origin, transformations applied, ownership, and lineage throughout the data lifecycle.' },
    { code: 'A.7.4', title: 'Data Preparation Techniques', description: 'The organization shall document data preparation techniques including preprocessing, feature engineering, labeling processes, and their potential impact on AI system behavior.' },
    { code: 'A.7.5', title: 'Data Governance Records', description: 'The organization shall maintain data governance records documenting data management practices, access controls, retention policies, and compliance with applicable regulations.' },
  ],
  'A.8': [
    { code: 'A.8.1', title: 'User Documentation', description: 'The organization shall provide clear documentation for users of AI systems explaining system capabilities, limitations, intended use, and guidance for appropriate interaction.' },
    { code: 'A.8.2', title: 'External Reporting and Transparency', description: 'The organization shall enable appropriate transparency about AI systems through external reporting, disclosure of relevant information to stakeholders, and public communication as appropriate.' },
    { code: 'A.8.3', title: 'Incident Communication', description: 'The organization shall establish procedures for communicating incidents, failures, or significant issues related to AI systems to affected parties and relevant authorities.' },
    { code: 'A.8.4', title: 'System Limitations Disclosure', description: 'The organization shall disclose known limitations, uncertainties, and potential failure modes of AI systems to enable informed decisions by users and stakeholders.' },
  ],
  'A.9': [
    { code: 'A.9.1', title: 'Responsible Use Processes', description: 'The organization shall establish processes to ensure responsible use of AI systems, including guidelines for acceptable use, prohibited applications, and ethical considerations.' },
    { code: 'A.9.2', title: 'Intended Use Boundaries', description: 'The organization shall define and communicate clear boundaries for intended use of AI systems, including scope limitations and scenarios where the system should not be applied.' },
    { code: 'A.9.3', title: 'Human Oversight Mechanisms', description: 'The organization shall ensure appropriate human oversight mechanisms are in place for AI systems, including human-in-the-loop controls, review processes, and override capabilities.' },
  ],
  'A.10': [
    { code: 'A.10.1', title: 'Responsibility Allocation', description: 'The organization shall clearly allocate responsibilities between the organization, suppliers, and customers for AI system development, deployment, operation, and outcomes.' },
    { code: 'A.10.2', title: 'Supplier Management', description: 'The organization shall manage relationships with AI suppliers including due diligence, contractual requirements, performance monitoring, and risk management.' },
    { code: 'A.10.3', title: 'Customer Expectations', description: 'The organization shall document and manage customer expectations regarding AI system capabilities, limitations, support, and compliance with applicable requirements.' },
  ],
};

/**
 * Seed NIST AI RMF 1.0
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

  // GOVERN Function
  const governFunction = await prisma.control.create({
    data: {
      code: 'GOVERN',
      title: 'Govern',
      description: 'A culture of risk management is cultivated and present. Governance policies, processes, procedures, and practices are in place to establish appropriate accountability structures.',
      frameworkId: nistFramework.id,
      sortOrder: 1,
    },
  });

  const governCategories = [
    { code: 'GOVERN-1', title: 'Policies, Processes, Procedures, and Practices', desc: 'Establish transparent, documented governance structures for AI risk management.' },
    { code: 'GOVERN-2', title: 'Accountability and Responsibility', desc: 'Define roles, responsibilities, and training requirements for AI teams.' },
    { code: 'GOVERN-3', title: 'Workforce Diversity, Equity, Inclusion, Accessibility', desc: 'Prioritize diverse and inclusive approach to AI risk management.' },
    { code: 'GOVERN-4', title: 'Organizational Culture and Commitment', desc: 'Foster safety-first mindset and culture for AI risks.' },
    { code: 'GOVERN-5', title: 'Stakeholder Engagement', desc: 'Establish robust engagement with AI actors and stakeholders.' },
    { code: 'GOVERN-6', title: 'Third-Party and Supply Chain Risk', desc: 'Mitigate software, data, and supply chain risks from third parties.' },
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

    const subcats = NIST_GOVERN_SUBCATEGORIES[cat.code as keyof typeof NIST_GOVERN_SUBCATEGORIES];
    for (let j = 0; j < subcats.length; j++) {
      await prisma.control.create({
        data: {
          code: subcats[j].code,
          title: subcats[j].title,
          description: subcats[j].description,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  // MAP Function
  const mapFunction = await prisma.control.create({
    data: {
      code: 'MAP',
      title: 'Map',
      description: 'Context is recognized and risks related to context are identified. AI system benefits and risks are understood and documented.',
      frameworkId: nistFramework.id,
      sortOrder: 2,
    },
  });

  const mapCategories = [
    { code: 'MAP-1', title: 'Context Establishment', desc: 'Understand intended purpose, deployment context, and risk tolerance.' },
    { code: 'MAP-2', title: 'AI System Categorization', desc: 'Perform system classification and characterization.' },
    { code: 'MAP-3', title: 'System Capabilities and Benefit Analysis', desc: 'Examine system capabilities against benchmarks.' },
    { code: 'MAP-4', title: 'Risk and Benefit Mapping', desc: 'Map risks and benefits for all system components.' },
    { code: 'MAP-5', title: 'Impact Characterization', desc: 'Document impacts to individuals, groups, and society.' },
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

    const subcats = NIST_MAP_SUBCATEGORIES[cat.code as keyof typeof NIST_MAP_SUBCATEGORIES];
    for (let j = 0; j < subcats.length; j++) {
      await prisma.control.create({
        data: {
          code: subcats[j].code,
          title: subcats[j].title,
          description: subcats[j].description,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  // MEASURE Function
  const measureFunction = await prisma.control.create({
    data: {
      code: 'MEASURE',
      title: 'Measure',
      description: 'AI systems are analyzed using quantitative and qualitative methods to assess system reliability, validity, safety, security, and robustness.',
      frameworkId: nistFramework.id,
      sortOrder: 3,
    },
  });

  const measureCategories = [
    { code: 'MEASURE-1', title: 'Measurement Methods and Metrics', desc: 'Align measurement methods with identified risks.' },
    { code: 'MEASURE-2', title: 'Trustworthy AI Characteristics Assessment', desc: 'Evaluate fairness, transparency, robustness, and other trustworthy characteristics.' },
    { code: 'MEASURE-3', title: 'Risk Tracking and Monitoring', desc: 'Track identified risks through system lifecycle.' },
    { code: 'MEASURE-4', title: 'Measurement Feedback and Validation', desc: 'Validate measurement approach effectiveness.' },
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

    const subcats = NIST_MEASURE_SUBCATEGORIES[cat.code as keyof typeof NIST_MEASURE_SUBCATEGORIES];
    for (let j = 0; j < subcats.length; j++) {
      await prisma.control.create({
        data: {
          code: subcats[j].code,
          title: subcats[j].title,
          description: subcats[j].description,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  // MANAGE Function
  const manageFunction = await prisma.control.create({
    data: {
      code: 'MANAGE',
      title: 'Manage',
      description: 'AI risks based on assessments and other analysis are prioritized, responded to, and managed.',
      frameworkId: nistFramework.id,
      sortOrder: 4,
    },
  });

  const manageCategories = [
    { code: 'MANAGE-1', title: 'Risk Prioritization and Response', desc: 'Prioritize, respond to, and manage AI risks.' },
    { code: 'MANAGE-2', title: 'Risk Mitigation and Benefit Maximization', desc: 'Maximize benefits while minimizing negative impacts.' },
    { code: 'MANAGE-3', title: 'Third-Party Resource Monitoring', desc: 'Monitor and control third-party risks.' },
    { code: 'MANAGE-4', title: 'Risk Treatment and Communication', desc: 'Monitor risk treatment and communication plans.' },
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

    const subcats = NIST_MANAGE_SUBCATEGORIES[cat.code as keyof typeof NIST_MANAGE_SUBCATEGORIES];
    for (let j = 0; j < subcats.length; j++) {
      await prisma.control.create({
        data: {
          code: subcats[j].code,
          title: subcats[j].title,
          description: subcats[j].description,
          frameworkId: nistFramework.id,
          parentId: category.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ NIST AI RMF 1.0 seeded (4 functions, 19 categories, 72 subcategories)');
  return nistFramework;
}

/**
 * Seed ISO/IEC 42001:2023
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

  const domains = [
    { code: 'A.2', title: 'Policies Related to AI', desc: 'AI policy development, organizational alignment, and review mechanisms.' },
    { code: 'A.3', title: 'Internal Organization', desc: 'Roles, responsibilities, and escalation processes for AI governance.' },
    { code: 'A.4', title: 'Resources for AI Systems', desc: 'Data, tooling, infrastructure, and human resource requirements.' },
    { code: 'A.5', title: 'Assessing Impacts of AI Systems', desc: 'Risk assessment, fairness, bias, and societal impact evaluation.' },
    { code: 'A.6', title: 'AI System Life Cycle', desc: 'Development, design, validation, deployment, and operation processes.' },
    { code: 'A.7', title: 'Data for AI Systems', desc: 'Data quality, acquisition, provenance, preparation, and governance.' },
    { code: 'A.8', title: 'Information for Interested Parties', desc: 'User documentation, transparency, and incident communication.' },
    { code: 'A.9', title: 'Use of AI Systems', desc: 'Responsible use, human oversight, and intended use boundaries.' },
    { code: 'A.10', title: 'Third-Party and Customer Relationships', desc: 'Supplier management, responsibility allocation, and customer expectations.' },
  ];

  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    const domainControl = await prisma.control.create({
      data: {
        code: domain.code,
        title: domain.title,
        description: domain.desc,
        frameworkId: isoFramework.id,
        sortOrder: i + 1,
      },
    });

    const controls = ISO_CONTROLS[domain.code as keyof typeof ISO_CONTROLS];
    for (let j = 0; j < controls.length; j++) {
      await prisma.control.create({
        data: {
          code: controls[j].code,
          title: controls[j].title,
          description: controls[j].description,
          frameworkId: isoFramework.id,
          parentId: domainControl.id,
          sortOrder: j + 1,
        },
      });
    }
  }

  console.log('  ✅ ISO/IEC 42001:2023 seeded (9 domains, 38 controls)');
  return isoFramework;
}

/**
 * Seed control mappings between frameworks
 */
async function seedControlMappings(nistFramework: any, isoFramework: any) {
  console.log('🔗 Creating cross-framework mappings...');

  const mappings = [
    { nist: 'GOVERN-1', iso: 'A.2', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address governance policies and procedures' },
    { nist: 'GOVERN-2', iso: 'A.3', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both define accountability and organizational roles' },
    { nist: 'MAP-1', iso: 'A.5', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address risk and impact assessment' },
    { nist: 'MAP-2', iso: 'A.6', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address AI system characterization and lifecycle' },
    { nist: 'MEASURE-2', iso: 'A.5', confidence: ConfidenceLevel.HIGH, type: MappingType.PARTIAL, reason: 'Both address trustworthy AI characteristics and impact assessment' },
    { nist: 'GOVERN-4', iso: 'A.9', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address organizational culture and responsible use' },
    { nist: 'GOVERN-6', iso: 'A.10', confidence: ConfidenceLevel.HIGH, type: MappingType.EQUIVALENT, reason: 'Both address third-party and supply chain management' },
    { nist: 'MAP-3', iso: 'A.4', confidence: ConfidenceLevel.MEDIUM, type: MappingType.PARTIAL, reason: 'Both address system capabilities and resource analysis' },
  ];

  for (const mapping of mappings) {
    const nistControl = await prisma.control.findFirst({
      where: { frameworkId: nistFramework.id, code: mapping.nist },
    });
    const isoControl = await prisma.control.findFirst({
      where: { frameworkId: isoFramework.id, code: mapping.iso },
    });

    if (nistControl && isoControl) {
      await prisma.controlMapping.create({
        data: {
          sourceControlId: nistControl.id,
          targetControlId: isoControl.id,
          sourceFrameworkId: nistFramework.id,
          targetFrameworkId: isoFramework.id,
          confidenceScore: mapping.confidence,
          mappingType: mapping.type,
          rationale: mapping.reason,
        },
      });
    }
  }

  console.log('  ✅ Cross-framework mappings created');
}

/**
 * Main seed function for frameworks
 */
export async function seedFrameworks() {
  console.log('\n🏛️  Seeding Compliance Frameworks...\n');

  // Clear existing data
  await prisma.controlMapping.deleteMany({});
  await prisma.control.deleteMany({});
  await prisma.framework.deleteMany({});

  const nistFramework = await seedNISTFramework();
  const isoFramework = await seedISOFramework();
  await seedControlMappings(nistFramework, isoFramework);

  // Import and seed CSA AICM
  const { seedCSAAICM, seedCSAMappings } = await import('./seed-csa-aicm');
  await seedCSAAICM();
  await seedCSAMappings();

  // Import and seed PCI DSS 4.0.1
  const { seedPCIDSS, seedPCIDSSMappings } = await import('./seed-pci-dss');
  await seedPCIDSS();
  await seedPCIDSSMappings();

  // Import and seed CIS Controls v8.1
  const { seedCISControls, seedCISMappings } = await import('./seed-cis-controls');
  await seedCISControls();
  await seedCISMappings();

  // Import and seed NIST CSF 2.0
  const { seedNISTCSF, seedNISTCSFMappings } = await import('./seed-nist-csf');
  await seedNISTCSF();
  await seedNISTCSFMappings();

  // Import and seed ISO 27001:2022
  const { seedISO27001, seedISO27001Mappings } = await import('./seed-iso-27001');
  await seedISO27001();
  await seedISO27001Mappings();

  // Import and seed SCF 2024.1
  const { seedSCF, seedSCFMappings } = await import('./seed-scf');
  await seedSCF();
  await seedSCFMappings();

  console.log('\n✅ Framework seeding completed!\n');
}
