import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/lib/notification-service';
import { mockSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/notifications/route');
const importUnreadRoute = async () => import('@/app/api/notifications/unread-count/route');

const createGetRequest = (query = '') =>
  new NextRequest(`http://localhost:3000/api/notifications${query}`);

const createPutRequest = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost:3000/api/notifications', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest());
    expect(res.status).toBe(401);
  });

  it('should return 200 with notifications', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getNotifications).mockResolvedValue({
      notifications: [{ id: 'n1', title: 'Test', message: 'msg', isRead: false }],
      total: 1, page: 1, pageSize: 10,
    } as any);

    const { GET } = await importRoute();
    const res = await GET(createGetRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
  });

  it('should return 400 for invalid pagination', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest('?page=0'));
    expect(res.status).toBe(400);
  });

  it('should return 400 for oversized pageSize', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const { GET } = await importRoute();
    const res = await GET(createGetRequest('?pageSize=200'));
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest({ all: true }));
    expect(res.status).toBe(401);
  });

  it('should mark all notifications as read', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(markAllAsRead).mockResolvedValue(5 as any);

    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest({ all: true }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.count).toBe(5);
  });

  it('should mark specific notifications as read', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(markAsRead).mockResolvedValue(true as any);

    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest({ ids: ['n1', 'n2'] }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.count).toBe(2);
  });

  it('should return 400 for invalid body', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const { PUT } = await importRoute();
    const res = await PUT(createPutRequest({ invalid: true }));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/notifications/unread-count', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const { GET } = await importUnreadRoute();
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('should return unread count', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(getUnreadCount).mockResolvedValue(3 as any);

    const { GET } = await importUnreadRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.count).toBe(3);
  });
});
