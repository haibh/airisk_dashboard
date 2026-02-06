import { describe, it, expect } from 'vitest';
import {
  createAISystemSchema,
  updateAISystemSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  createRiskSchema,
  paginationSchema,
  aiSystemFilterSchema,
  assessmentFilterSchema,
  evidenceFilterSchema,
  updateEvidenceSchema,
  approveEvidenceSchema,
  updateOrganizationSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  createInvitationSchema,
  userFilterSchema,
  auditLogFilterSchema,
  createAPIKeySchema,
  createWebhookSchema,
  updateWebhookSchema,
  validateBody,
  formatZodErrors,
} from '@/lib/api-validation-schemas';
import { z } from 'zod';

// ============================================
// validateBody helper
// ============================================
describe('validateBody', () => {
  const testSchema = z.object({ name: z.string().min(1) });

  it('should return success for valid data', () => {
    const result = validateBody(testSchema, { name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Test');
  });

  it('should return error for invalid data', () => {
    const result = validateBody(testSchema, { name: '' });
    expect(result.success).toBe(false);
  });

  it('should return error for missing fields', () => {
    const result = validateBody(testSchema, {});
    expect(result.success).toBe(false);
  });
});

// ============================================
// formatZodErrors helper
// ============================================
describe('formatZodErrors', () => {
  it('should format single error', () => {
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'bad' });
    if (!result.success) {
      const msg = formatZodErrors(result.error);
      expect(msg).toContain('email');
    }
  });

  it('should format multiple errors', () => {
    const schema = z.object({ a: z.string(), b: z.number() });
    const result = schema.safeParse({ a: 123, b: 'str' });
    if (!result.success) {
      const msg = formatZodErrors(result.error);
      expect(msg).toContain(',');
    }
  });
});

// ============================================
// AI System schemas
// ============================================
describe('createAISystemSchema', () => {
  it('should accept valid AI system data', () => {
    const result = createAISystemSchema.safeParse({
      name: 'ChatBot', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createAISystemSchema.safeParse({
      name: '', systemType: 'GENAI', dataClassification: 'CONFIDENTIAL',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid systemType', () => {
    const result = createAISystemSchema.safeParse({
      name: 'Bot', systemType: 'INVALID', dataClassification: 'CONFIDENTIAL',
    });
    expect(result.success).toBe(false);
  });

  it('should apply defaults for optional fields', () => {
    const result = createAISystemSchema.safeParse({
      name: 'Bot', systemType: 'GENAI', dataClassification: 'PUBLIC',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lifecycleStatus).toBe('DEVELOPMENT');
      expect(result.data.thirdPartyAPIs).toEqual([]);
    }
  });
});

describe('updateAISystemSchema', () => {
  it('should accept partial updates', () => {
    const result = updateAISystemSchema.safeParse({ name: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateAISystemSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ============================================
// Assessment schemas
// ============================================
describe('createAssessmentSchema', () => {
  it('should accept valid assessment', () => {
    const result = createAssessmentSchema.safeParse({
      title: 'Risk Assessment Q1', aiSystemId: 'ai-1', frameworkId: 'fw-1',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing title', () => {
    const result = createAssessmentSchema.safeParse({
      aiSystemId: 'ai-1', frameworkId: 'fw-1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing aiSystemId', () => {
    const result = createAssessmentSchema.safeParse({
      title: 'Test', frameworkId: 'fw-1',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateAssessmentSchema', () => {
  it('should accept valid status update', () => {
    const result = updateAssessmentSchema.safeParse({ status: 'IN_PROGRESS' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = updateAssessmentSchema.safeParse({ status: 'INVALID' });
    expect(result.success).toBe(false);
  });
});

// ============================================
// Risk schemas
// ============================================
describe('createRiskSchema', () => {
  it('should accept valid risk data', () => {
    const result = createRiskSchema.safeParse({
      title: 'Data Leak', category: 'SECURITY', likelihood: 3, impact: 4,
    });
    expect(result.success).toBe(true);
  });

  it('should reject likelihood > 5', () => {
    const result = createRiskSchema.safeParse({
      title: 'Risk', category: 'SECURITY', likelihood: 6, impact: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject impact < 1', () => {
    const result = createRiskSchema.safeParse({
      title: 'Risk', category: 'SECURITY', likelihood: 3, impact: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should default controlEffectiveness to 0', () => {
    const result = createRiskSchema.safeParse({
      title: 'Risk', category: 'SECURITY', likelihood: 3, impact: 3,
    });
    if (result.success) {
      expect(result.data.controlEffectiveness).toBe(0);
    }
  });
});

// ============================================
// Pagination schemas
// ============================================
describe('paginationSchema', () => {
  it('should apply defaults', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(10);
    }
  });

  it('should coerce string numbers', () => {
    const result = paginationSchema.safeParse({ page: '3', pageSize: '20' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('should reject pageSize > 100', () => {
    const result = paginationSchema.safeParse({ pageSize: '200' });
    expect(result.success).toBe(false);
  });
});

// ============================================
// Evidence schemas
// ============================================
describe('approveEvidenceSchema', () => {
  it('should accept APPROVE action', () => {
    const result = approveEvidenceSchema.safeParse({ action: 'APPROVE' });
    expect(result.success).toBe(true);
  });

  it('should accept REJECT action', () => {
    const result = approveEvidenceSchema.safeParse({ action: 'REJECT', reason: 'Incomplete' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid action', () => {
    const result = approveEvidenceSchema.safeParse({ action: 'PENDING' });
    expect(result.success).toBe(false);
  });
});

// ============================================
// User management schemas
// ============================================
describe('changePasswordSchema', () => {
  it('should accept matching passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old123456', newPassword: 'new1234567', confirmPassword: 'new1234567',
    });
    expect(result.success).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old123456', newPassword: 'new1234567', confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old123456', newPassword: 'short', confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('createInvitationSchema', () => {
  it('should accept valid invitation', () => {
    const result = createInvitationSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe('VIEWER');
  });

  it('should reject invalid email', () => {
    const result = createInvitationSchema.safeParse({ email: 'not-email' });
    expect(result.success).toBe(false);
  });
});

// ============================================
// API Key schema
// ============================================
describe('createAPIKeySchema', () => {
  it('should accept valid key data', () => {
    const result = createAPIKeySchema.safeParse({ name: 'Prod Key' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.permissions).toBe('READ_ONLY');
  });

  it('should accept READ_WRITE permission', () => {
    const result = createAPIKeySchema.safeParse({ name: 'RW Key', permissions: 'READ_WRITE' });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createAPIKeySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

// ============================================
// Webhook schema
// ============================================
describe('createWebhookSchema', () => {
  it('should accept valid webhook', () => {
    const result = createWebhookSchema.safeParse({
      url: 'https://example.com/hook', events: ['risk.created'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject HTTP URL', () => {
    const result = createWebhookSchema.safeParse({
      url: 'http://example.com/hook', events: ['risk.created'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty events', () => {
    const result = createWebhookSchema.safeParse({
      url: 'https://example.com/hook', events: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('updateWebhookSchema', () => {
  it('should accept partial update', () => {
    const result = updateWebhookSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });

  it('should reject HTTP URL in update', () => {
    const result = updateWebhookSchema.safeParse({ url: 'http://bad.com' });
    expect(result.success).toBe(false);
  });
});

// ============================================
// Organization schema
// ============================================
describe('updateOrganizationSchema', () => {
  it('should accept name update', () => {
    const result = updateOrganizationSchema.safeParse({ name: 'New Org Name' });
    expect(result.success).toBe(true);
  });

  it('should accept settings update', () => {
    const result = updateOrganizationSchema.safeParse({
      settings: { timezone: 'UTC', defaultLanguage: 'en' },
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid language', () => {
    const result = updateOrganizationSchema.safeParse({
      settings: { defaultLanguage: 'fr' },
    });
    expect(result.success).toBe(false);
  });
});
