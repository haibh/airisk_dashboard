import { describe, it, expect, vi } from 'vitest';

// Import actual implementations, bypassing the global mock
const { hasMinimumRole, hasRole } = await vi.importActual<typeof import('@/lib/auth-helpers')>('@/lib/auth-helpers');

describe('hasMinimumRole', () => {
  it('should return true when user role equals minimum', () => {
    expect(hasMinimumRole('ADMIN', 'ADMIN')).toBe(true);
    expect(hasMinimumRole('VIEWER', 'VIEWER')).toBe(true);
  });

  it('should return true when user role exceeds minimum', () => {
    expect(hasMinimumRole('ADMIN', 'VIEWER')).toBe(true);
    expect(hasMinimumRole('ADMIN', 'ASSESSOR')).toBe(true);
    expect(hasMinimumRole('RISK_MANAGER', 'ASSESSOR')).toBe(true);
    expect(hasMinimumRole('ASSESSOR', 'AUDITOR')).toBe(true);
    expect(hasMinimumRole('AUDITOR', 'VIEWER')).toBe(true);
  });

  it('should return false when user role is below minimum', () => {
    expect(hasMinimumRole('VIEWER', 'ADMIN')).toBe(false);
    expect(hasMinimumRole('AUDITOR', 'ASSESSOR')).toBe(false);
    expect(hasMinimumRole('ASSESSOR', 'RISK_MANAGER')).toBe(false);
    expect(hasMinimumRole('VIEWER', 'AUDITOR')).toBe(false);
  });

  it('should return false for unknown roles', () => {
    expect(hasMinimumRole('UNKNOWN', 'ADMIN')).toBe(false);
    expect(hasMinimumRole('ADMIN', 'UNKNOWN')).toBe(false);
    expect(hasMinimumRole('INVALID', 'INVALID')).toBe(false);
  });

  it('should verify full hierarchy: VIEWER < AUDITOR < ASSESSOR < RISK_MANAGER < ADMIN', () => {
    const hierarchy = ['VIEWER', 'AUDITOR', 'ASSESSOR', 'RISK_MANAGER', 'ADMIN'];
    for (let i = 0; i < hierarchy.length; i++) {
      for (let j = 0; j < hierarchy.length; j++) {
        expect(hasMinimumRole(hierarchy[i], hierarchy[j])).toBe(i >= j);
      }
    }
  });
});

describe('hasRole', () => {
  it('should return true when role is in list', () => {
    expect(hasRole('ADMIN', ['ADMIN', 'RISK_MANAGER'])).toBe(true);
    expect(hasRole('VIEWER', ['VIEWER'])).toBe(true);
  });

  it('should return false when role is not in list', () => {
    expect(hasRole('VIEWER', ['ADMIN', 'RISK_MANAGER'])).toBe(false);
    expect(hasRole('AUDITOR', ['ADMIN'])).toBe(false);
  });

  it('should return false for empty array', () => {
    expect(hasRole('ADMIN', [])).toBe(false);
  });
});
