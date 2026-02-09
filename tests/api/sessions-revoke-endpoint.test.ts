import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { revokeSession } from '@/lib/active-session-tracker-service';
import { mockAdminSession, mockAdminUser, mockSessionUser, mockSession } from '../mocks/mock-session';

// Dynamic import to avoid module resolution issues
const importRoute = async () => {
  const module = await import('@/app/api/sessions/[id]/revoke/route');
  return module;
};

describe('PATCH /api/sessions/[id]/revoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    const url = 'http://localhost:3000/api/sessions/session-1/revoke';
    return new NextRequest(url, { method: 'PATCH' });
  };

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when user is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: null,
        expires: '',
      } as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 when organizationId is missing', async () => {
      const incompleteSession = {
        user: { id: 'user-1', role: 'ADMIN' },
        expires: '',
      };
      vi.mocked(getServerSession).mockResolvedValue(incompleteSession as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Session Validation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should return 404 when session not found', async () => {
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(null);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'nonexistent-session' }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('Session');
    });

    it('should return 403 when session belongs to different organization', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'user-2',
        organizationId: 'other-org',
        isRevoked: false,
        user: {
          name: 'Other User',
          email: 'other@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('organization');
    });

    it('should return 400 when session is already revoked', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'user-2',
        organizationId: 'test-org-123',
        isRevoked: true,
        user: {
          name: 'Other User',
          email: 'other@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('already revoked');
    });
  });

  describe('Admin Revoke', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should allow admin to revoke another user session', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'user-2',
        organizationId: 'test-org-123',
        isRevoked: false,
        user: {
          name: 'Other User',
          email: 'other@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);
      vi.mocked(revokeSession).mockResolvedValue(undefined);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: 'audit-1',
        action: 'REVOKE_SESSION',
        entityType: 'ActiveSession',
        entityId: 'session-1',
        oldValues: { userId: 'user-2', isRevoked: false },
        newValues: { userId: 'user-2', isRevoked: true },
        userId: 'admin-user-123',
        organizationId: 'test-org-123',
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
      } as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('revoked successfully');
      expect(vi.mocked(revokeSession)).toHaveBeenCalledWith('session-1', 'admin-user-123');
      expect(vi.mocked(prisma.auditLog.create)).toHaveBeenCalled();
    });

    it('should allow admin to revoke their own session', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'admin-user-123',
        organizationId: 'test-org-123',
        isRevoked: false,
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);
      vi.mocked(revokeSession).mockResolvedValue(undefined);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Regular User Revoke', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(hasMinimumRole).mockReturnValue(false);
    });

    it('should allow user to revoke their own session', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'test-user-123',
        organizationId: 'test-org-123',
        isRevoked: false,
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);
      vi.mocked(revokeSession).mockResolvedValue(undefined);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(vi.mocked(revokeSession)).toHaveBeenCalledWith('session-1', 'test-user-123');
    });

    it('should return 403 when user tries to revoke another user session', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'other-user-123',
        organizationId: 'test-org-123',
        isRevoked: false,
        user: {
          name: 'Other User',
          email: 'other@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('own sessions');
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should create audit log on successful revoke', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'user-2',
        organizationId: 'test-org-123',
        isRevoked: false,
        user: {
          name: 'Other User',
          email: 'other@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);
      vi.mocked(revokeSession).mockResolvedValue(undefined);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/sessions/session-1/revoke', {
        method: 'PATCH',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
      });

      const { PATCH } = await importRoute();
      await PATCH(request, {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(vi.mocked(prisma.auditLog.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'REVOKE_SESSION',
            entityType: 'ActiveSession',
            entityId: 'session-1',
            userId: 'admin-user-123',
            organizationId: 'test-org-123',
            oldValues: { userId: 'user-2', isRevoked: false },
            newValues: expect.objectContaining({
              userId: 'user-2',
              isRevoked: true,
              revokedBy: 'admin-user-123',
            }),
          }),
        })
      );
    });

    it('should capture IP address and user agent in audit log', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'user-2',
        organizationId: 'test-org-123',
        isRevoked: false,
        user: {
          name: 'Other User',
          email: 'other@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);
      vi.mocked(revokeSession).mockResolvedValue(undefined);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/sessions/session-1/revoke', {
        method: 'PATCH',
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Chrome/119.0',
        },
      });

      const { PATCH } = await importRoute();
      await PATCH(request, {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(vi.mocked(prisma.auditLog.create)).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/119.0',
        }),
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(prisma.activeSession.findUnique).mockRejectedValue(
        new Error('Database connection failed')
      );

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle revoke service errors gracefully', async () => {
      const targetSession = {
        id: 'session-1',
        userId: 'user-2',
        organizationId: 'test-org-123',
        isRevoked: false,
        user: {
          name: 'Other User',
          email: 'other@example.com',
        },
      };
      vi.mocked(prisma.activeSession.findUnique).mockResolvedValue(targetSession as any);
      vi.mocked(revokeSession).mockRejectedValue(new Error('Revoke failed'));

      const { PATCH } = await importRoute();
      const response = await PATCH(createRequest(), {
        params: Promise.resolve({ id: 'session-1' }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
