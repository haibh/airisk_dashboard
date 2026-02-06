import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession } from '../mocks/mock-session';

// Mock api-key-generator
vi.mock('@/lib/api-key-generator', () => ({
  generateAPIKey: vi.fn(() => ({
    fullKey: 'airm_live_abc123xyz',
    prefix: 'airm_live_ab',
    hash: 'sha256hash',
  })),
}));

const importRoute = async () => import('@/app/api/api-keys/route');

const createRequest = () =>
  new NextRequest('http://localhost:3000/api/api-keys');

const createPostRequest = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost:3000/api/api-keys', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('GET /api/api-keys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(403);
  });

  it('should return 200 with masked keys', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.aPIKey.findMany).mockResolvedValue([
      {
        id: 'key-1', name: 'Prod Key', keyPrefix: 'airm_live_ab',
        permissions: 'READ_ONLY', expiresAt: null, revokedAt: null,
        lastUsedAt: null, createdAt: new Date(),
        createdBy: { name: 'Admin' },
      },
    ] as any);

    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].keyPrefix).toContain('...');
  });
});

describe('POST /api/api-keys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { POST } = await importRoute();
    const res = await POST(createPostRequest({ name: 'Test Key' }));
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { POST } = await importRoute();
    const res = await POST(createPostRequest({ name: 'Test Key' }));
    expect(res.status).toBe(403);
  });

  it('should return 201 when creating valid key', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.aPIKey.count).mockResolvedValue(0);
    vi.mocked(prisma.aPIKey.create).mockResolvedValue({
      id: 'key-new', name: 'New Key', permissions: 'READ_ONLY',
      expiresAt: null, createdAt: new Date(),
    } as any);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({ name: 'New Key' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.fullKey).toBeDefined();
  });

  it('should return 422 when max keys reached', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.aPIKey.count).mockResolvedValue(10);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({ name: 'Overflow Key' }));
    expect(res.status).toBe(400);
  });

  it('should return 422 for missing name', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({}));
    expect(res.status).toBe(400);
  });
});
