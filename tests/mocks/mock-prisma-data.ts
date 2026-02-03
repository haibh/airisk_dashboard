/**
 * Mock data generators for Prisma models
 */

export const mockAISystem = {
  id: 'system-123',
  name: 'Fraud Detection AI',
  organizationId: 'test-org-123',
  systemType: 'MACHINE_LEARNING',
  dataClassification: 'CONFIDENTIAL',
  lifecycleStatus: 'ACTIVE',
  riskTier: 'HIGH',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockRiskAssessment = {
  id: 'assessment-123',
  organizationId: 'test-org-123',
  aiSystemId: 'system-123',
  frameworkId: 'framework-123',
  title: 'AI System Risk Assessment',
  description: 'Comprehensive risk assessment',
  status: 'COMPLETED',
  assessmentDate: new Date(),
  nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  completedAt: new Date(),
  createdBy: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockRisk = {
  id: 'risk-123',
  assessmentId: 'assessment-123',
  title: 'Data Privacy Breach',
  description: 'Unauthorized access to personal data',
  category: 'PRIVACY',
  likelihood: 3,
  impact: 4,
  inherentScore: 12,
  controlEffectiveness: 75,
  residualScore: 3,
  treatmentStatus: 'MITIGATING',
  treatmentPlan: 'Implement encryption',
  treatmentDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockRiskHigh = {
  ...mockRisk,
  id: 'risk-high-456',
  title: 'Model Bias',
  likelihood: 5,
  impact: 5,
  inherentScore: 25,
  residualScore: 18,
};

export const mockRiskControl = {
  id: 'control-link-123',
  riskId: 'risk-123',
  controlId: 'control-123',
  effectiveness: 85,
  evidenceDescription: 'Security audit completed',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockFramework = {
  id: 'framework-123',
  name: 'NIST AI Risk Management Framework',
  shortName: 'NIST AI RMF',
  version: '1.0',
  category: 'AI_GOVERNANCE',
  description: 'NIST framework for AI risk management',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockControl = {
  id: 'control-123',
  frameworkId: 'framework-123',
  code: 'GOV-1.1',
  title: 'Governance Structure',
  description: 'Establish governance structure',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTask = {
  id: 'task-123',
  riskId: 'risk-123',
  title: 'Implement encryption protocol',
  description: 'Apply AES-256 encryption',
  status: 'PENDING',
  priority: 'HIGH',
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAuditLog = {
  id: 'audit-log-123',
  organizationId: 'test-org-123',
  userId: 'test-user-123',
  action: 'CREATE',
  entityType: 'RISK',
  entityId: 'risk-123',
  oldValues: null,
  newValues: { title: 'Data Privacy Breach' },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  createdAt: new Date(),
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
};

/**
 * Generate mock array of risks with varying scores
 */
export function generateMockRisks(count: number = 10) {
  const risks = [];
  for (let i = 0; i < count; i++) {
    const likelihood = Math.floor(Math.random() * 5) + 1;
    const impact = Math.floor(Math.random() * 5) + 1;
    risks.push({
      id: `risk-${i}`,
      assessmentId: 'assessment-123',
      title: `Risk ${i + 1}`,
      category: ['PRIVACY', 'SECURITY', 'BIAS', 'TRANSPARENCY', 'ACCOUNTABILITY'][i % 5],
      likelihood,
      impact,
      inherentScore: likelihood * impact,
      controlEffectiveness: Math.floor(Math.random() * 100),
      residualScore: Math.floor(Math.random() * 20),
      treatmentStatus: ['PENDING', 'MITIGATING', 'ACCEPTED'][i % 3],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return risks;
}

/**
 * Generate mock 5x5 heatmap with random risk distribution
 */
export function generateMockHeatmap() {
  const heatmap = Array(5)
    .fill(0)
    .map(() =>
      Array(5)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))
    );
  return heatmap;
}

/**
 * Generate mock compliance data for frameworks
 */
export function generateMockComplianceData(frameworks: number = 3) {
  return Array.from({ length: frameworks }, (_, i) => ({
    framework: `Framework ${i + 1}`,
    frameworkId: `framework-${i}`,
    frameworkName: `Test Framework ${i + 1}`,
    percentage: Math.floor(Math.random() * 100),
    totalControls: 50 + i * 10,
    mappedControls: Math.floor(Math.random() * 50),
    avgEffectiveness: Math.floor(Math.random() * 100),
  }));
}
