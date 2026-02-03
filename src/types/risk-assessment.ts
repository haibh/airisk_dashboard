import {
  AssessmentStatus,
  RiskCategory,
  TreatmentStatus
} from '@prisma/client';

/**
 * Form data for creating/editing risk assessments
 */
export interface AssessmentFormData {
  title: string;
  description?: string;
  aiSystemId: string;
  frameworkId: string;
  assessmentDate: Date;
  nextReviewDate?: Date;
}

/**
 * Form data for creating/editing risks
 */
export interface RiskFormData {
  title: string;
  description?: string;
  category: RiskCategory;
  likelihood: number; // 1-5
  impact: number; // 1-5
  treatmentPlan?: string;
  treatmentDueDate?: Date;
}

/**
 * Filters for assessment list
 */
export interface AssessmentFilters {
  search?: string;
  status?: AssessmentStatus;
  aiSystemId?: string;
  frameworkId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Risk assessment with detailed relations
 */
export interface AssessmentWithDetails {
  id: string;
  title: string;
  description: string | null;
  status: AssessmentStatus;
  assessmentDate: Date | string;
  nextReviewDate: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  aiSystem: {
    id: string;
    name: string;
    systemType: string;
  };
  framework: {
    id: string;
    name: string;
    shortName: string;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  risks: RiskWithControls[];
  _count?: {
    risks: number;
  };
}

/**
 * Risk with control information
 */
export interface RiskWithControls {
  id: string;
  title: string;
  description: string | null;
  category: RiskCategory;
  likelihood: number;
  impact: number;
  inherentScore: number;
  controlEffectiveness: number;
  residualScore: number;
  treatmentStatus: TreatmentStatus;
  treatmentPlan: string | null;
  treatmentDueDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  controls: RiskControlInfo[];
}

/**
 * Risk control information
 */
export interface RiskControlInfo {
  id: string;
  effectiveness: number;
  notes: string | null;
  control: {
    id: string;
    code: string;
    title: string;
  };
}

/**
 * Risk matrix cell
 */
export interface RiskMatrixCell {
  likelihood: number; // 1-5
  impact: number; // 1-5
  score: number; // 1-25
  level: RiskLevel;
  count: number;
  risks: string[]; // Risk IDs
}

/**
 * Risk level classification
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Risk matrix (5x5 grid)
 */
export type RiskMatrix = RiskMatrixCell[][];

/**
 * List response with pagination
 */
export interface AssessmentListResponse {
  assessments: AssessmentWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
