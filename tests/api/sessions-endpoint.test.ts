import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { getActiveSessions, getUserSessions } from '@/lib/active-session-tracker-service';
import { mockAdminSession, mockAdminUser, mockSessionUser, mockSession } from '../mocks/mock-session';

// Dynamic import to avoid module resolution issues
const importRoute = async () => {
  const module = await import('@/app/api/sessions/route');
  return module;
};

describe('GET /api/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (query: string = '') => {
    const url = `http://localhost:3000/api/sessions${query}`;
    return new NextRequest(url);
  };

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when session user is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: null,
        expires: '',
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
    });

    it('should return 401 when organizationId is missing', async () => {
      const incompleteSession = {
        user: { id: 'user-1', role: 'ADMIN' },
        expires: '',
      };
      vi.mocked(getServerSession).mockResolvedValue(incompleteSession as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
    });
  });

  describe('Admin - Get All Organization Sessions', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should return paginated sessions for admin with default pagination', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          token: 'token-1',
          organizationId: 'test-org-123',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          isRevoked: false,
          createdAt: '2026-02-01T00:00:00.000Z',
          lastActivityAt: '2026-02-09T00:00:00.000Z',
          expiresAt: '2026-02-10T00:00:00.000Z',
        },
        {
          id: 'session-2',
          userId: 'user-2',
          token: 'token-2',
          organizationId: 'test-org-123',
          ipAddress: '192.168.1.2',
          userAgent: 'Chrome',
          isRevoked: false,
          createdAt: '2026-02-02T00:00:00.000Z',
          lastActivityAt: '2026-02-08T00:00:00.000Z',
          expiresAt: '2026-02-11T00:00:00.000Z',
        },
      ];

      vi.mocked(getActiveSessions).mockResolvedValue({
        sessions: mockSessions,
        total: 2,
      });

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].id).toBe('session-1');
      expect(data.data[1].id).toBe('session-2');
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(10);
      expect(vi.mocked(getActiveSessions)).toHaveBeenCalledWith('test-org-123', 1, 10);
    });

    it('should return paginated sessions with custom page and pageSize', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          organizationId: 'test-org-123',
          isRevoked: false,
          createdAt: '2026-02-01T00:00:00.000Z',
          lastActivityAt: '2026-02-09T00:00:00.000Z',
          expiresAt: '2026-02-10T00:00:00.000Z',
        },
      ];

      vi.mocked(getActiveSessions).mockResolvedValue({
        sessions: mockSessions,
        total: 50,
      });

      const { GET } = await importRoute();
      const response = await GET(createRequest('?page=2&pageSize=10'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.page).toBe(2);
      expect(data.pageSize).toBe(10);
      expect(vi.mocked(getActiveSessions)).toHaveBeenCalledWith('test-org-123', 2, 10);
    });

    it('should handle invalid pagination params gracefully', async () => {
      const mockSessions = [];

      vi.mocked(getActiveSessions).mockResolvedValue({
        sessions: mockSessions,
        total: 0,
      });

      const { GET } = await importRoute();
      const response = await GET(createRequest('?page=invalid&pageSize=invalid'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(20);
    });

    it('should return empty list when no sessions exist', async () => {
      vi.mocked(getActiveSessions).mockResolvedValue({
        sessions: [],
        total: 0,
      });

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Regular User - Get Own Sessions', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(hasMinimumRole).mockReturnValue(false);
    });

    it('should return own sessions for regular user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'test-user-123',
          token: 'token-1',
          organizationId: 'test-org-123',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          isRevoked: false,
          createdAt: '2026-02-01T00:00:00.000Z',
          lastActivityAt: '2026-02-09T00:00:00.000Z',
          expiresAt: '2026-02-10T00:00:00.000Z',
        },
      ];

      vi.mocked(getUserSessions).mockResolvedValue(mockSessions);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe('session-1');
      expect(vi.mocked(getUserSessions)).toHaveBeenCalledWith('test-user-123');
    });

    it('should not include pagination info in regular user response', async () => {
      const mockSessions = [];

      vi.mocked(getUserSessions).mockResolvedValue(mockSessions);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).not.toHaveProperty('total');
      expect(data).not.toHaveProperty('page');
      expect(data).not.toHaveProperty('pageSize');
    });

    it('should ignore pagination params for regular users', async () => {
      const mockSessions = [];

      vi.mocked(getUserSessions).mockResolvedValue(mockSessions);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?page=5&pageSize=50'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(vi.mocked(getUserSessions)).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
      vi.mocked(getActiveSessions).mockRejectedValue(new Error('Database connection failed'));

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
