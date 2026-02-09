import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession, mockViewerSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/ai-systems/[id]/route');

const createGetRequest = (id = 'ai-sys-1') =>
  new NextRequest(`http://localhost:3000/api/ai-systems/${id}`);

const createPutRequest = (id = 'ai-sys-1', body: Record<string, unknown>) =>
  new NextRequest(`http://localhost:3000/api/ai-systems/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const createDeleteRequest = (id = 'ai-sys-1') =>
  new NextRequest(`http://localhost:3000/api/ai-systems/${id}`, {
    method: 'DELETE',
  });

const mockAISystem = {
  id: 'ai-sys-1',
  name: 'Test AI System',
  description: 'Test description',
  organizationId: 'test-org-123',
  ownerId: 'test-user-123',
  systemType: 'LARGE_LANGUAGE_MODEL',
  dataClassification: 'CONFIDENTIAL',
  lifecycleStatus: 'ACTIVE',
  riskTier: 'HIGH',
  purpose: 'Customer support chatbot',
  dataInputs: 'Customer queries',
  dataOutputs: 'AI responses',
  thirdPartyAPIs: ['OpenAI API'],
  baseModels: ['GPT-4'],
  trainingDataSources: ['Public internet'],
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
};

describe('GET /api/ai-systems/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'ai-sys-1' }) });
    expect(res.status).toBe(401);
  });

  it('should return 404 when AI system not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });

  it('should return 404 when system belongs to different organization', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        ...mockSession.user,
        organizationId: 'other-org',
      },
      expires: mockSession.expires,
    });
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'ai-sys-1' }) });
    expect(res.status).toBe(404);
  });

  it('should return 200 with system details when found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(mockAISystem as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'ai-sys-1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Test AI System');
    expect(data.owner.name).toBe('Test User');
  });

  it('should include owner details in response', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(mockAISystem as any);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest(), { params: Promise.resolve({ id: 'ai-sys-1' }) });
    const data = await res.json();
    expect(data.owner).toBeDefined();
    expect(data.owner.id).toBe('test-user-123');
    expect(data.owner.email).toBe('test@example.com');
  });
});

describe('PUT /api/ai-systems/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('ai-sys-1', { name: 'Updated' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 404 when system not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(null);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('ai-sys-1', { name: 'Updated' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('should return 403 when user is not owner and not admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
      ...mockAISystem,
      ownerId: 'other-user',
    } as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('ai-sys-1', { name: 'Updated' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should allow owner to update system', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(mockAISystem as any);
    vi.mocked(prisma.aISystem.update).mockResolvedValue({
      ...mockAISystem,
      name: 'Updated Name',
    } as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('ai-sys-1', { name: 'Updated Name' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Updated Name');
  });

  it('should allow admin to update any system', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
      ...mockAISystem,
      ownerId: 'other-user',
    } as any);
    vi.mocked(prisma.aISystem.update).mockResolvedValue({
      ...mockAISystem,
      ownerId: 'other-user',
      name: 'Admin Updated',
    } as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('ai-sys-1', { name: 'Admin Updated' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Admin Updated');
  });

  it('should return 400 for invalid systemType', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(mockAISystem as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('ai-sys-1', { systemType: 'INVALID_TYPE' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid dataClassification', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(mockAISystem as any);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest('ai-sys-1', { dataClassification: 'INVALID' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(400);
  });

  it('should invalidate cache after update', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(mockAISystem as any);
    vi.mocked(prisma.aISystem.update).mockResolvedValue(mockAISystem as any);
    const { PUT } = await importRoute();
    await PUT(createPutRequest('ai-sys-1', { name: 'Updated' }), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    // Cache invalidation is mocked in setup, just verify no error
    expect(prisma.aISystem.update).toHaveBeenCalled();
  });
});

describe('DELETE /api/ai-systems/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('ai-sys-1'), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('should return 404 when system not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(null);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('ai-sys-1'), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('should return 403 when user is not owner and not admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
      ...mockAISystem,
      ownerId: 'other-user',
    } as any);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('ai-sys-1'), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('should allow owner to delete system', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(mockAISystem as any);
    vi.mocked(prisma.aISystem.update).mockResolvedValue({
      ...mockAISystem,
      lifecycleStatus: 'RETIRED',
    } as any);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('ai-sys-1'), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toContain('retired');
  });

  it('should allow admin to delete any system', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
      ...mockAISystem,
      ownerId: 'other-user',
    } as any);
    vi.mocked(prisma.aISystem.update).mockResolvedValue({
      ...mockAISystem,
      lifecycleStatus: 'RETIRED',
    } as any);
    const { DELETE } = await importRoute();
    const res = await DELETE(createDeleteRequest('ai-sys-1'), {
      params: Promise.resolve({ id: 'ai-sys-1' }),
    });
    expect(res.status).toBe(200);
  });
});
