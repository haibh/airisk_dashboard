import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession, mockViewerSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/assessments/[id]/route');

const createGetRequest = (id = 'assess-1') =>
  new NextRequest(`http://localhost:3000/api/assessments/${id}`);

const createPutRequest = (id = 'assess-1', body: Record<string, unknown>) =>
  new NextRequest(`http://localhost:3000/api/assessments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const createDeleteRequest = (id = 'assess-1') =>
  new NextRequest(`http://localhost:3000/api/assessments/${id}`, {
    method: 'DELETE',
  });

const mockAssessment = {
  id: 'assess-1',
  title: 'Q1 2026 Risk Assessment',
  description: 'Quarterly assessment',
  organizationId: 'test-org-123',
  aiSystemId: 'ai-sys-1',
  frameworkId: 'framework-1',
  status: 'IN_PROGRESS',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdById: 'test-user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  aiSystem: {
    id: 'ai-sys-1',
    name: 'Test AI System',
    systemType: 'LARGE_LANGUAGE_MODEL',
  },
  framework: {
    id: 'framework-1',
    name: 'NIST AI RMF',
    shortName: 'NIST',
  },
  createdBy: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
  risks: [
    {
      id: 'risk-1',
      title: 'Data Privacy',
      residualScore: 12,
      controls: [
        {
          id: 'rc-1',
          control: {
            id: 'control-1',
            code: 'CTRL-001',
            title: 'Data Encryption',
          },
        },
      ],
    },
  ],
};

describe('GET /api/assessments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'assess-1' }) });
    expect(res.status).toBe(401);
  });

  it('should return 404 when assessment not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });

  it('should return 404 when assessment belongs to different organization', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { ...mockSession.user, organizationId: 'other-org' },
      expires: mockSession.expires,
    });
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'assess-1' }) });
    expect(res.status).toBe(404);
  });

  it('should return 200 with assessment details when found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(mockAssessment as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'assess-1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Q1 2026 Risk Assessment');
  });

  it('should include aiSystem, framework, createdBy relations', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(mockAssessment as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'assess-1' }) });
    const data = await res.json();
    expect(data.aiSystem).toBeDefined();
    expect(data.aiSystem.name).toBe('Test AI System');
    expect(data.framework).toBeDefined();
    expect(data.framework.name).toBe('NIST AI RMF');
    expect(data.createdBy).toBeDefined();
    expect(data.createdBy.email).toBe('test@example.com');
  });

  it('should include risks with controls in response', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(mockAssessment as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'assess-1' }) });
    const data = await res.json();
    expect(data.risks).toBeDefined();
    expect(data.risks.length).toBeGreaterThan(0);
    expect(data.risks[0].controls).toBeDefined();
  });
});

describe('PUT /api/assessments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('assess-1', { status: 'COMPLETED' }), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 403 when user role is VIEWER', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('assess-1', { status: 'COMPLETED' }), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should return 404 when assessment not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(null);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('assess-1', { status: 'COMPLETED' }), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid status', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(mockAssessment as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('assess-1', { status: 'INVALID_STATUS' }), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(400);
  });

  it('should allow ASSESSOR role to update assessment', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(mockAssessment as any);
    vi.mocked(prisma.riskAssessment.update).mockResolvedValue({
      ...mockAssessment,
      status: 'APPROVED',
    } as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('assess-1', { status: 'APPROVED' }), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('APPROVED');
  });

  it('should allow updating title and description', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(mockAssessment as any);
    vi.mocked(prisma.riskAssessment.update).mockResolvedValue({
      ...mockAssessment,
      title: 'Updated Title',
      description: 'Updated Description',
    } as any);
    const { PUT } = await importRoute();
    const res = await PUT(
      createPutRequest('assess-1', { title: 'Updated Title', description: 'Updated Description' }),
      { params: Promise.resolve({ id: 'assess-1' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Updated Title');
  });
});

describe('DELETE /api/assessments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('assess-1'), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 403 when user role is below ASSESSOR', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('assess-1'), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should return 404 when assessment not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(null);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('assess-1'), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('should allow ASSESSOR role to delete assessment', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.riskAssessment.findFirst).mockResolvedValue(mockAssessment as any);
    vi.mocked(prisma.riskAssessment.delete).mockResolvedValue(mockAssessment as any);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('assess-1'), {
      params: Promise.resolve({ id: 'assess-1' }),
    });
    expect(res.status).toBe(200);
  });
});
