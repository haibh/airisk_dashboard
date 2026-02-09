/**
 * Zod validation schemas for API request bodies
 * Provides type-safe validation with proper error messages
 */

import { z } from 'zod';
import {
  AISystemType,
  DataClassification,
  LifecycleStatus,
  RiskTier,
  AssessmentStatus,
  RiskCategory,
  TreatmentStatus,
  UserRole,
  InvitationStatus,
} from '@prisma/client';

// ============================================
// AI Systems Schemas
// ============================================

export const createAISystemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional().nullable(),
  systemType: z.nativeEnum(AISystemType, { message: 'Invalid system type' }),
  dataClassification: z.nativeEnum(DataClassification, { message: 'Invalid data classification' }),
  lifecycleStatus: z.nativeEnum(LifecycleStatus).optional().default(LifecycleStatus.DEVELOPMENT),
  riskTier: z.nativeEnum(RiskTier).optional().nullable(),
  purpose: z.string().max(2000).optional().nullable(),
  dataInputs: z.string().max(2000).optional().nullable(),
  dataOutputs: z.string().max(2000).optional().nullable(),
  thirdPartyAPIs: z.array(z.string()).optional().default([]),
  baseModels: z.array(z.string()).optional().default([]),
  trainingDataSources: z.array(z.string()).optional().default([]),
});

export const updateAISystemSchema = createAISystemSchema.partial();

export type CreateAISystemInput = z.infer<typeof createAISystemSchema>;
export type UpdateAISystemInput = z.infer<typeof updateAISystemSchema>;

// ============================================
// Assessment Schemas
// ============================================

export const createAssessmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().max(2000).optional().nullable(),
  aiSystemId: z.string().min(1, 'AI system ID is required'),
  frameworkId: z.string().min(1, 'Framework ID is required'),
  assessmentDate: z.string().datetime().optional(),
  nextReviewDate: z.string().datetime().optional().nullable(),
});

export const updateAssessmentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(AssessmentStatus).optional(),
  nextReviewDate: z.string().datetime().optional().nullable(),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;

// ============================================
// Risk Schemas
// ============================================

export const createRiskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional().nullable(),
  category: z.nativeEnum(RiskCategory),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  controlEffectiveness: z.number().min(0).max(100).optional().default(0),
  treatmentPlan: z.string().max(2000).optional().nullable(),
  treatmentStatus: z.nativeEnum(TreatmentStatus).optional(),
});

export const updateRiskSchema = createRiskSchema.partial();

export type CreateRiskInput = z.infer<typeof createRiskSchema>;
export type UpdateRiskInput = z.infer<typeof updateRiskSchema>;

// ============================================
// Pagination & Filter Schemas
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().max(255).optional(),
});

export const aiSystemFilterSchema = paginationSchema.extend({
  systemType: z.nativeEnum(AISystemType).optional(),
  lifecycleStatus: z.nativeEnum(LifecycleStatus).optional(),
  riskTier: z.nativeEnum(RiskTier).optional(),
});

export const assessmentFilterSchema = paginationSchema.extend({
  status: z.nativeEnum(AssessmentStatus).optional(),
  aiSystemId: z.string().min(1).optional(),
  frameworkId: z.string().min(1).optional(),
});

// ============================================
// Evidence Schemas
// ============================================

export const evidenceFilterSchema = paginationSchema.extend({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  entityType: z.enum(['AI_SYSTEM', 'ASSESSMENT', 'RISK', 'CONTROL']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateEvidenceSchema = z.object({
  description: z.string().max(2000).optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
});

export const approveEvidenceSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT'], { message: 'Action must be APPROVE or REJECT' }),
  reason: z.string().max(500).optional(),
  reviewNotes: z.string().max(2000).optional(),
});

export type EvidenceFilterInput = z.infer<typeof evidenceFilterSchema>;
export type UpdateEvidenceInput = z.infer<typeof updateEvidenceSchema>;
export type ApproveEvidenceInput = z.infer<typeof approveEvidenceSchema>;

// ============================================
// Organization Schemas
// ============================================

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  settings: z.object({
    timezone: z.string().max(100).optional(),
    defaultLanguage: z.enum(['en', 'vi']).optional(),
    logoUrl: z.string().url().max(500).optional().nullable(),
    industrySector: z.string().max(100).optional().nullable(),
  }).optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

// ============================================
// User Management Schemas
// ============================================

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  languagePref: z.enum(['en', 'vi']).optional(),
  image: z.string().url().max(500).optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// Invitation Schemas
// ============================================

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  role: z.nativeEnum(UserRole).optional().default(UserRole.VIEWER),
});

export const invitationFilterSchema = paginationSchema.extend({
  status: z.nativeEnum(InvitationStatus).optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

// ============================================
// User Filter Schema
// ============================================

export const userFilterSchema = paginationSchema.extend({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ============================================
// Audit Log Filter Schema
// ============================================

export const auditLogFilterSchema = paginationSchema.extend({
  entityType: z.string().max(50).optional(),
  action: z.string().max(50).optional(),
  userId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// ============================================
// Validation Helper
// ============================================

/**
 * Parse and validate request body with Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: z.ZodError<T> } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatZodErrors<T>(error: z.ZodError<T>): string {
  return error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
}

// ============================================
// API Key Schemas
// ============================================

export const createAPIKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  permissions: z.enum(['READ_ONLY', 'READ_WRITE']).optional().default('READ_ONLY'),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type CreateAPIKeyInput = z.infer<typeof createAPIKeySchema>;

// ============================================
// Webhook Schemas
// ============================================

const urlRegex = /^https:\/\//;

export const createWebhookSchema = z.object({
  url: z.string().url('Invalid URL').regex(urlRegex, 'URL must use HTTPS'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  description: z.string().max(500).optional().nullable(),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().regex(urlRegex, 'URL must use HTTPS').optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(500).optional().nullable(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
