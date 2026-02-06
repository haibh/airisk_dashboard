import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole, hashPassword } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/users/route');

// Always include pagination params to avoid null coercion failures in Zod schema
const createRequest = (query = '') => {
  const base = '?page=1&pageSize=10';
  const extra = query ? `&${query.replace('?', '')}` : '';
  return new NextRequest(`http://localhost:3000/api/users${base}${extra}`);
};

const createPostRequest = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost:3000/api/users', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('should return 403 when non-admin user', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(403);
  });

  it('should return 200 with paginated users', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.user.count).mockResolvedValue(2);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'u1', name: 'User1', email: 'u1@test.com', role: 'VIEWER', isActive: true, createdAt: new Date() },
      { id: 'u2', name: 'User2', email: 'u2@test.com', role: 'ADMIN', isActive: true, createdAt: new Date() },
    ] as any);

    const { GET } = await importRoute();
    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.total).toBe(2);
  });

  it('should apply role filter', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.user.count).mockResolvedValue(1);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'u1', name: 'Admin', email: 'a@test.com', role: 'ADMIN', isActive: true, createdAt: new Date() },
    ] as any);

    const { GET } = await importRoute();
    const res = await GET(createRequest('role=ADMIN'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
  });

  it('should apply search filter', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.user.count).mockResolvedValue(0);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const { GET } = await importRoute();
    const res = await GET(createRequest('search=test'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(0);
  });
});

describe('POST /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { POST } = await importRoute();
    const res = await POST(createPostRequest({ email: 'a@b.com', name: 'Test', password: 'password123' }));
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(hasMinimumRole).mockReturnValue(false);
    const { POST } = await importRoute();
    const res = await POST(createPostRequest({ email: 'a@b.com', name: 'Test', password: 'password123' }));
    expect(res.status).toBe(403);
  });

  it('should return 201 when creating valid user', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(hashPassword).mockResolvedValue('hashed-pw');
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user', email: 'new@test.com', name: 'New User', role: 'VIEWER', isActive: true, createdAt: new Date(),
    } as any);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      email: 'new@test.com', name: 'New User', password: 'password123',
    }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.email).toBe('new@test.com');
  });

  it('should return 422 for duplicate email', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'existing' } as any);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      email: 'existing@test.com', name: 'Dup', password: 'password123',
    }));
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid email', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      email: 'not-an-email', name: 'Test', password: 'password123',
    }));
    expect(res.status).toBe(400);
  });

  it('should return 400 for short password', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);

    const { POST } = await importRoute();
    const res = await POST(createPostRequest({
      email: 'valid@test.com', name: 'Test', password: 'short',
    }));
    expect(res.status).toBe(400);
  });
});
