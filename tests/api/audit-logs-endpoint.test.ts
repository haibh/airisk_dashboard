import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession, mockViewerSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/audit-logs/route');

// Always include pagination params to avoid null coercion failures in Zod schema
const createRequest = (query = '') => {
  const base = '?page=1&pageSize=10';
  const extra = query ? `&${query.replace('?', '')}` : '';
  return new NextRequest(`http://localhost:3000/api/audit-logs${base}${extra}`);
};

describe('GET /api/audit-logs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('should return 403 for viewer role', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(403);
  });

  it('should return 200 with paginated logs', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const mockLogs = [
      {
        id: 'log-1', action: 'CREATE', entityType: 'User', entityId: 'u-1',
        createdAt: new Date(), user: { id: 'u1', name: 'Admin', email: 'a@test.com' },
      },
    ];
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue(mockLogs as any);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(1);

    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it('should apply entityType filter', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0);

    const { GET } = await importRoute();
    const res = await GET(createRequest('entityType=User'));
    expect(res.status).toBe(200);
  });

  it('should apply action filter', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0);

    const { GET } = await importRoute();
    const res = await GET(createRequest('action=CREATE'));
    expect(res.status).toBe(200);
  });

  it('should apply date range filters', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0);

    const { GET } = await importRoute();
    const res = await GET(createRequest('dateFrom=2026-01-01T00:00:00Z&dateTo=2026-12-31T23:59:59Z'));
    expect(res.status).toBe(200);
  });

  it('should return empty list when no logs match', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0);

    const { GET } = await importRoute();
    const res = await GET(createRequest('search=nonexistent'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(0);
    expect(data.total).toBe(0);
  });
});
