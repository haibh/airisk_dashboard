// AIRM-IP TypeScript Types
// Based on Prisma schema and PRD requirements

// ============================================================================
// USER & ORGANIZATION TYPES
// ============================================================================

export type UserRole = 'ADMIN' | 'RISK_MANAGER' | 'ASSESSOR' | 'AUDITOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  languagePref: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AI SYSTEM TYPES
// ============================================================================

export type AISystemType = 'GENAI' | 'ML' | 'RPA' | 'HYBRID' | 'OTHER';
export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
export type LifecycleStatus = 'DEVELOPMENT' | 'PILOT' | 'PRODUCTION' | 'DEPRECATED' | 'RETIRED';
export type RiskTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AISystem {
  id: string;
  name: string;
  description: string | null;
  systemType: AISystemType;
  dataClassification: DataClassification;
  lifecycleStatus: LifecycleStatus;
  riskTier: RiskTier | null;
  purpose: string | null;
  ownerId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// FRAMEWORK TYPES
// ============================================================================

export type FrameworkCategory = 'AI_RISK' | 'AI_MANAGEMENT' | 'AI_CONTROL' | 'SECURITY' | 'COMPLIANCE';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type MappingType = 'EQUIVALENT' | 'PARTIAL' | 'RELATED' | 'SUPERSET' | 'SUBSET';

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  version: string;
  effectiveDate: Date | null;
  description: string | null;
  isActive: boolean;
  category: FrameworkCategory;
}

export interface Control {
  id: string;
  code: string;
  title: string;
  description: string | null;
  guidance: string | null;
  frameworkId: string;
  parentId: string | null;
  sortOrder: number;
}

export interface ControlMapping {
  id: string;
  sourceControlId: string;
  targetControlId: string;
  sourceFrameworkId: string;
  targetFrameworkId: string;
  confidenceScore: ConfidenceLevel;
  rationale: string | null;
  mappingType: MappingType;
}

// ============================================================================
// RISK ASSESSMENT TYPES
// ============================================================================

export type AssessmentStatus = 'DRAFT' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'ARCHIVED';
export type RiskCategory =
  | 'BIAS_FAIRNESS'
  | 'PRIVACY'
  | 'SECURITY'
  | 'RELIABILITY'
  | 'TRANSPARENCY'
  | 'ACCOUNTABILITY'
  | 'SAFETY'
  | 'OTHER';
export type TreatmentStatus = 'PENDING' | 'ACCEPTED' | 'MITIGATING' | 'TRANSFERRED' | 'AVOIDED' | 'COMPLETED';

export interface RiskAssessment {
  id: string;
  title: string;
  description: string | null;
  status: AssessmentStatus;
  assessmentDate: Date;
  nextReviewDate: Date | null;
  completedAt: Date | null;
  aiSystemId: string;
  frameworkId: string;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Risk {
  id: string;
  title: string;
  description: string | null;
  category: RiskCategory;
  likelihood: number; // 1-5
  impact: number; // 1-5
  inherentScore: number;
  controlEffectiveness: number; // 0-100
  residualScore: number;
  treatmentStatus: TreatmentStatus;
  treatmentPlan: string | null;
  treatmentDueDate: Date | null;
  assessmentId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

export type EvidenceStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type EntityType = 'AI_SYSTEM' | 'ASSESSMENT' | 'RISK' | 'CONTROL';

export interface Evidence {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  hashSha256: string;
  description: string | null;
  reviewStatus: EvidenceStatus;
  validUntil: Date | null;
  organizationId: string;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenceLink {
  id: string;
  evidenceId: string;
  entityType: EntityType;
  aiSystemId?: string;
  assessmentId?: string;
  riskId?: string;
  controlId?: string;
}

// ============================================================================
// TASK TYPES
// ============================================================================

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  completedAt: Date | null;
  riskId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  organizationId: string;
  userId: string;
  createdAt: Date;
}

// ============================================================================
// RISK MATRIX TYPES
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskMatrixCell {
  likelihood: number;
  impact: number;
  score: number;
  level: RiskLevel;
}

export const RISK_MATRIX: RiskMatrixCell[][] = [
  // Likelihood 1 (Rare)
  [
    { likelihood: 1, impact: 1, score: 1, level: 'low' },
    { likelihood: 1, impact: 2, score: 2, level: 'low' },
    { likelihood: 1, impact: 3, score: 3, level: 'low' },
    { likelihood: 1, impact: 4, score: 4, level: 'low' },
    { likelihood: 1, impact: 5, score: 5, level: 'medium' },
  ],
  // Likelihood 2 (Unlikely)
  [
    { likelihood: 2, impact: 1, score: 2, level: 'low' },
    { likelihood: 2, impact: 2, score: 4, level: 'low' },
    { likelihood: 2, impact: 3, score: 6, level: 'medium' },
    { likelihood: 2, impact: 4, score: 8, level: 'medium' },
    { likelihood: 2, impact: 5, score: 10, level: 'high' },
  ],
  // Likelihood 3 (Possible)
  [
    { likelihood: 3, impact: 1, score: 3, level: 'low' },
    { likelihood: 3, impact: 2, score: 6, level: 'medium' },
    { likelihood: 3, impact: 3, score: 9, level: 'medium' },
    { likelihood: 3, impact: 4, score: 12, level: 'high' },
    { likelihood: 3, impact: 5, score: 15, level: 'high' },
  ],
  // Likelihood 4 (Likely)
  [
    { likelihood: 4, impact: 1, score: 4, level: 'low' },
    { likelihood: 4, impact: 2, score: 8, level: 'medium' },
    { likelihood: 4, impact: 3, score: 12, level: 'high' },
    { likelihood: 4, impact: 4, score: 16, level: 'critical' },
    { likelihood: 4, impact: 5, score: 20, level: 'critical' },
  ],
  // Likelihood 5 (Almost Certain)
  [
    { likelihood: 5, impact: 1, score: 5, level: 'medium' },
    { likelihood: 5, impact: 2, score: 10, level: 'high' },
    { likelihood: 5, impact: 3, score: 15, level: 'high' },
    { likelihood: 5, impact: 4, score: 20, level: 'critical' },
    { likelihood: 5, impact: 5, score: 25, level: 'critical' },
  ],
];
