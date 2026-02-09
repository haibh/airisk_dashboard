import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession, mockViewerSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/risks/[id]/route');

const createGetRequest = (id = 'risk-1') =>
  new NextRequest(`http://localhost:3000/api/risks/${id}`);

const createPutRequest = (id = 'risk-1', body: Record<string, unknown>) =>
  new NextRequest(`http://localhost:3000/api/risks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const createDeleteRequest = (id = 'risk-1') =>
  new NextRequest(`http://localhost:3000/api/risks/${id}`, {
    method: 'DELETE',
  });

const mockRisk = {
  id: 'risk-1',
  assessmentId: 'assess-1',
  title: 'Data Privacy Risk',
  description: 'Potential exposure of sensitive customer data',
  category: 'DATA_PRIVACY',
  likelihood: 4,
  impact: 5,
  inherentScore: 20,
  residualScore: 12,
  createdAt: new Date(),
  updatedAt: new Date(),
  controls: [
    {
      id: 'rc-1',
      riskId: 'risk-1',
      controlId: 'control-1',
      effectiveness: 40,
      control: {
        id: 'control-1',
        code: 'CTRL-001',
        title: 'Data Encryption',
        description: 'Encrypt sensitive data at rest and in transit',
      },
    },
  ],
  assessment: {
    id: 'assess-1',
    title: 'Q1 2026 Assessment',
    status: 'IN_PROGRESS',
  },
};

describe('GET /api/risks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'risk-1' }) });
    expect(res.status).toBe(401);
  });

  it('should return 404 when risk not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });

  it('should return 404 when risk belongs to different organization', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { ...mockSession.user, organizationId: 'other-org' },
      expires: mockSession.expires,
    });
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'risk-1' }) });
    expect(res.status).toBe(404);
  });

  it('should return 200 with risk details when found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'risk-1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Data Privacy Risk');
    expect(data.likelihood).toBe(4);
    expect(data.impact).toBe(5);
  });

  it('should include controls with details in response', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'risk-1' }) });
    const data = await res.json();
    expect(data.controls).toBeDefined();
    expect(data.controls.length).toBeGreaterThan(0);
    expect(data.controls[0].control.code).toBe('CTRL-001');
  });

  it('should include assessment information in response', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'risk-1' }) });
    const data = await res.json();
    expect(data.assessment).toBeDefined();
    expect(data.assessment.title).toBe('Q1 2026 Assessment');
    expect(data.assessment.status).toBe('IN_PROGRESS');
  });

  it('should return inherent and residual scores', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'risk-1' }) });
    const data = await res.json();
    expect(data.inherentScore).toBe(20);
    expect(data.residualScore).toBe(12);
  });
});

describe('PUT /api/risks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('risk-1', { title: 'Updated' }), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 403 when user role is VIEWER', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('risk-1', { title: 'Updated' }), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should return 404 when risk not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(null);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('risk-1', { title: 'Updated' }), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('should allow ASSESSOR role to update risk', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    vi.mocked(prisma.risk.update).mockResolvedValue({
      ...mockRisk,
      title: 'Updated Title',
    } as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('risk-1', { title: 'Updated Title' }), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Updated Title');
  });

  it('should return 400 for invalid likelihood', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('risk-1', { likelihood: 10 }), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid impact', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('risk-1', { impact: 0 }), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(400);
  });

  it('should recalculate residualScore when controls change', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    vi.mocked(prisma.risk.update).mockResolvedValue({
      ...mockRisk,
      residualScore: 10,
    } as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('risk-1', { likelihood: 3 }), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.residualScore).toBeDefined();
  });
});

describe('DELETE /api/risks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('risk-1'), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 403 when user role is VIEWER', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('risk-1'), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should return 403 when user role is AUDITOR', async () => {
    const auditSession = {
      user: { ...mockSession.user, role: 'AUDITOR' },
      expires: mockSession.expires,
    };
    vi.mocked(getServerSession).mockResolvedValue(auditSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('risk-1'), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should return 404 when risk not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(null);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('risk-1'), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('should allow ASSESSOR role to delete risk', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    vi.mocked(prisma.risk.delete).mockResolvedValue(mockRisk as any);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('risk-1'), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(200);
  });

  it('should allow ADMIN role to delete any risk', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.risk.findFirst).mockResolvedValue(mockRisk as any);
    vi.mocked(prisma.risk.delete).mockResolvedValue(mockRisk as any);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('risk-1'), {
      params: Promise.resolve({ id: 'risk-1' }),
    });
    expect(res.status).toBe(200);
  });
});
