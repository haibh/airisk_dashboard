import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession, mockViewerSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/frameworks/[id]/route');

const createGetRequest = (id = 'framework-1') =>
  new NextRequest(`http://localhost:3000/api/frameworks/${id}`);

const createPatchRequest = (id = 'framework-1', body: Record<string, unknown>) =>
  new NextRequest(`http://localhost:3000/api/frameworks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const mockFramework = {
  id: 'framework-1',
  name: 'NIST AI Risk Management Framework 1.0',
  shortName: 'NIST AI RMF',
  description: 'NIST AI RMF for managing AI risks',
  category: 'AI_RISK',
  version: '1.0',
  source: 'https://ai.gov',
  scoringConfig: {
    compliantThreshold: 80,
    partialThreshold: 50,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  controls: [
    {
      id: 'ctrl-1',
      frameworkId: 'framework-1',
      code: 'AI-1.1',
      title: 'Map',
      sortOrder: 1,
    },
    {
      id: 'ctrl-2',
      frameworkId: 'framework-1',
      code: 'AI-1.2',
      title: 'Measure',
      sortOrder: 2,
    },
  ],
  _count: {
    controls: 2,
  },
};

describe('GET /api/frameworks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 404 when framework not found', async () => {
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });

  it('should return 200 with framework details', async () => {
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'framework-1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('NIST AI Risk Management Framework 1.0');
    expect(data.shortName).toBe('NIST AI RMF');
  });

  it('should include controls in hierarchical structure', async () => {
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'framework-1' }) });
    const data = await res.json();
    expect(data.controls).toBeDefined();
    expect(data.controls.length).toBe(2);
    expect(data.controls[0].code).toBe('AI-1.1');
  });

  it('should include control count metadata', async () => {
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'framework-1' }) });
    const data = await res.json();
    expect(data._count.controls).toBe(2);
  });

  it('should include scoring configuration', async () => {
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'framework-1' }) });
    const data = await res.json();
    expect(data.scoringConfig).toBeDefined();
    expect(data.scoringConfig.compliantThreshold).toBe(80);
  });
});

describe('PATCH /api/frameworks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { PATCH } = await importRoute();
    const res = await PATCH(createPatchRequest('framework-1', { scoringConfig: { compliantThreshold: 75 } }), {
      params: Promise.resolve({ id: 'framework-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 403 when user role is below RISK_MANAGER', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { PATCH } = await importRoute();
    const res = await PATCH(createPatchRequest('framework-1', { scoringConfig: { compliantThreshold: 75 } }), {
      params: Promise.resolve({ id: 'framework-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should return 404 when framework not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(null);
    const { PATCH } = await importRoute();
    const res = await PATCH(createPatchRequest('nonexistent', { scoringConfig: { compliantThreshold: 75 } }), {
      params: Promise.resolve({ id: 'nonexistent' }),
    });
    expect(res.status).toBe(404);
  });

  it('should allow RISK_MANAGER to update scoring config', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    vi.mocked(prisma.framework.update).mockResolvedValue({
      ...mockFramework,
      scoringConfig: { compliantThreshold: 75, partialThreshold: 50, priorityWeights: { CRITICAL: 4.0, HIGH: 2.0, MEDIUM: 1.0, LOW: 0.5 } },
    } as any);
    const { PATCH } = await importRoute();
    const res = await PATCH(
      createPatchRequest('framework-1', { scoringConfig: { compliantThreshold: 75 } }),
      { params: Promise.resolve({ id: 'framework-1' }) }
    );
    expect(res.status).toBe(200);
    const response = await res.json();
    expect(response.data.scoringConfig.compliantThreshold).toBe(75);
  });

  it('should allow ADMIN to update framework', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    vi.mocked(prisma.framework.update).mockResolvedValue({
      ...mockFramework,
      scoringConfig: { compliantThreshold: 85, partialThreshold: 50 },
    } as any);
    const { PATCH } = await importRoute();
    const res = await PATCH(
      createPatchRequest('framework-1', { scoringConfig: { compliantThreshold: 85 } }),
      { params: Promise.resolve({ id: 'framework-1' }) }
    );
    expect(res.status).toBe(200);
  });

  it('should clamp compliantThreshold between 1-100', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    vi.mocked(prisma.framework.update).mockResolvedValue({
      ...mockFramework,
      scoringConfig: { compliantThreshold: 100, partialThreshold: 50 },
    } as any);
    const { PATCH } = await importRoute();
    const res = await PATCH(
      createPatchRequest('framework-1', { scoringConfig: { compliantThreshold: 200 } }),
      { params: Promise.resolve({ id: 'framework-1' }) }
    );
    expect(res.status).toBe(200);
  });

  it('should clamp partialThreshold between 0-99', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.framework.findUnique).mockResolvedValue(mockFramework as any);
    vi.mocked(prisma.framework.update).mockResolvedValue({
      ...mockFramework,
      scoringConfig: { compliantThreshold: 80, partialThreshold: 60 },
    } as any);
    const { PATCH } = await importRoute();
    const res = await PATCH(
      createPatchRequest('framework-1', { scoringConfig: { partialThreshold: 60 } }),
      { params: Promise.resolve({ id: 'framework-1' }) }
    );
    expect(res.status).toBe(200);
  });
});
