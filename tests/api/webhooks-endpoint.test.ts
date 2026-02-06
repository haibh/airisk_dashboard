import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/webhooks/route');

const createRequest = () =>
  new NextRequest('http://localhost:3000/api/webhooks');

const createPostRequest = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost:3000/api/webhooks', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('GET /api/webhooks', () => {
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

  it('should return 200 with webhooks list', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.webhook.findMany).mockResolvedValue([
      {
        id: 'wh-1', url: 'https://example.com/hook', events: ['risk.created'],
        isActive: true, createdAt: new Date(), _count: { deliveries: 5 },
      },
    ] as any);

    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
  });
});

describe('POST /api/webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'https://example.com/hook', events: ['risk.created'],
    }));
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'https://example.com/hook', events: ['risk.created'],
    }));
    expect(res.status).toBe(403);
  });

  it('should return 201 when creating valid webhook', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.webhook.count).mockResolvedValue(0);
    vi.mocked(prisma.webhook.create).mockResolvedValue({
      id: 'wh-new', url: 'https://example.com/hook', events: ['risk.created'],
      isActive: true, createdAt: new Date(),
    } as any);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'https://example.com/hook', events: ['risk.created'],
    }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('should reject private IP webhook URLs', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'https://127.0.0.1/hook', events: ['risk.created'],
    }));
    expect(res.status).toBe(400);
  });

  it('should reject localhost webhook URLs', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'https://localhost/hook', events: ['risk.created'],
    }));
    expect(res.status).toBe(400);
  });

  it('should return 422 when max webhooks reached', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.webhook.count).mockResolvedValue(10);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'https://example.com/hook', events: ['risk.created'],
    }));
    expect(res.status).toBe(400);
  });

  it('should return 422 for missing events', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'https://example.com/hook', events: [],
    }));
    expect(res.status).toBe(400);
  });

  it('should return 422 for non-HTTPS URL', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      url: 'http://example.com/hook', events: ['risk.created'],
    }));
    expect(res.status).toBe(400);
  });
});
