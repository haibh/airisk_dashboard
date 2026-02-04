/**
 * Tests for Gap Analysis API endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GapAnalysisGET } from '@/app/api/gap-analysis/route';
import { GET as ExportGET } from '@/app/api/gap-analysis/export/route';
import { prismaMock } from '../setup';
import { NextRequest } from 'next/server';

// Mock next-auth
vi.mock('next-auth', () => ({
  default: vi.fn(),
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Import mocked functions
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';

const mockSession = {
  user: {
    id: 'user-1',
    email: 'assessor@test.com',
    role: 'ASSESSOR',
    organizationId: 'org-1',
  },
  expires: '2025-01-01',
};

describe('GET /api/gap-analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis?frameworks=fw-1,fw-2'
    );
    const response = await GapAnalysisGET(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 403 if user role is below ASSESSOR', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      ...mockSession,
      user: { ...mockSession.user, role: 'VIEWER' },
    });
    vi.mocked(hasMinimumRole).mockReturnValue(false);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis?frameworks=fw-1,fw-2'
    );
    const response = await GapAnalysisGET(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toContain('Assessor role');
  });

  it('should return 400 if frameworks parameter is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const request = new NextRequest('http://localhost:3000/api/gap-analysis');
    const response = await GapAnalysisGET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('frameworks parameter is required');
  });

  it('should return 400 if frameworks list is empty', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis?frameworks='
    );
    const response = await GapAnalysisGET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    // Empty frameworks param is caught as "frameworks parameter is required"
    expect(json.error).toContain('frameworks parameter is required');
  });

  it('should return 400 if more than 10 frameworks', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const frameworks = Array.from({ length: 11 }, (_, i) => `fw-${i}`).join(',');
    const request = new NextRequest(
      `http://localhost:3000/api/gap-analysis?frameworks=${frameworks}`
    );
    const response = await GapAnalysisGET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Maximum 10 frameworks allowed');
  });

  it('should return gap analysis results', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    // Mock frameworks
    prismaMock.framework.findMany.mockResolvedValue([
      {
        id: 'fw-1',
        name: 'NIST AI RMF',
        shortName: 'NIST',
        version: '1.0',
        description: null,
        effectiveDate: null,
        isActive: true,
        category: 'AI_RISK',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'fw-2',
        name: 'ISO 42001',
        shortName: 'ISO',
        version: '2023',
        description: null,
        effectiveDate: null,
        isActive: true,
        category: 'AI_MANAGEMENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock controls
    prismaMock.control.findMany.mockResolvedValue([
      {
        id: 'ctrl-1',
        code: 'GOVERN-1.1',
        title: 'AI Risk Management',
        description: null,
        guidance: null,
        parentId: null,
        sortOrder: 1,
        frameworkId: 'fw-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ctrl-2',
        code: 'ISO-5.1',
        title: 'AI Policy',
        description: null,
        guidance: null,
        parentId: null,
        sortOrder: 1,
        frameworkId: 'fw-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock control mappings
    prismaMock.controlMapping.findMany.mockResolvedValue([]);

    // Mock risk assessments
    prismaMock.riskAssessment.findMany.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis?frameworks=fw-1,fw-2'
    );
    const response = await GapAnalysisGET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('frameworks');
    expect(json).toHaveProperty('gaps');
    expect(json).toHaveProperty('matrix');
    expect(json).toHaveProperty('generatedAt');
    expect(Array.isArray(json.frameworks)).toBe(true);
    expect(Array.isArray(json.gaps)).toBe(true);
  });
});

describe('GET /api/gap-analysis/export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis/export?frameworks=fw-1&format=csv'
    );
    const response = await ExportGET(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 403 if user role is below ASSESSOR', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      ...mockSession,
      user: { ...mockSession.user, role: 'AUDITOR' },
    });
    vi.mocked(hasMinimumRole).mockReturnValue(false);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis/export?frameworks=fw-1&format=csv'
    );
    const response = await ExportGET(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toContain('Assessor role');
  });

  it('should return 400 if frameworks parameter is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis/export?format=csv'
    );
    const response = await ExportGET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('frameworks parameter is required');
  });

  it('should return 400 if format is invalid', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis/export?frameworks=fw-1&format=invalid'
    );
    const response = await ExportGET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('format must be csv or pdf');
  });

  it('should return 501 for PDF format (not implemented)', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis/export?frameworks=fw-1&format=pdf'
    );
    const response = await ExportGET(request);
    const json = await response.json();

    expect(response.status).toBe(501);
    expect(json.error).toContain('PDF export not yet implemented');
  });

  it('should return CSV file for valid request', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    // Mock frameworks
    prismaMock.framework.findMany.mockResolvedValue([
      {
        id: 'fw-1',
        name: 'NIST AI RMF',
        shortName: 'NIST',
        version: '1.0',
        description: null,
        effectiveDate: null,
        isActive: true,
        category: 'AI_RISK',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock controls
    prismaMock.control.findMany.mockResolvedValue([
      {
        id: 'ctrl-1',
        code: 'GOVERN-1.1',
        title: 'AI Risk Management',
        description: null,
        guidance: null,
        parentId: null,
        sortOrder: 1,
        frameworkId: 'fw-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock control mappings and assessments
    prismaMock.controlMapping.findMany.mockResolvedValue([]);
    prismaMock.riskAssessment.findMany.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/gap-analysis/export?frameworks=fw-1&format=csv'
    );
    const response = await ExportGET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain('.csv');

    const text = await response.text();
    expect(text).toContain('Framework,Control Code,Control Title');
  });
});
