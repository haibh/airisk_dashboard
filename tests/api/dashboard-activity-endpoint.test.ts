import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockSession, mockUser } from '../mocks/mock-session';
import { mockAuditLog } from '../mocks/mock-prisma-data';

const importRoute = async () => {
  const module = await import('@/app/api/dashboard/activity/route');
  return module;
};

describe('GET /api/dashboard/activity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest('http://localhost:3000/api/dashboard/activity');
  };

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when user email is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { name: 'Test' },
        expires: '',
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 404 when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(404);
    });

    it('should return 404 when organization not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        organizationId: null,
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(404);
    });
  });

  describe('Successful Response', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should return 200 with activity data', async () => {
      const activities = [mockAuditLog];
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue(activities as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('activities');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.activities)).toBe(true);
    });

    it('should include required activity fields', async () => {
      const activities = [mockAuditLog];
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue(activities as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      const activity = data.activities[0];

      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('action');
      expect(activity).toHaveProperty('entityType');
      expect(activity).toHaveProperty('entityId');
      expect(activity).toHaveProperty('description');
      expect(activity).toHaveProperty('userName');
      expect(activity).toHaveProperty('userId');
      expect(activity).toHaveProperty('timestamp');
      expect(activity).toHaveProperty('metadata');
    });

    it('should handle empty activity list', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.activities).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Activity Description Formatting', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should format CREATE action description', async () => {
      const activities = [
        {
          ...mockAuditLog,
          action: 'CREATE',
          entityType: 'RISK',
        },
      ];
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue(activities as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.activities[0].description).toContain('created a new');
      expect(data.activities[0].description).toContain('risk');
    });

    it('should use user name from user object', async () => {
      const activities = [
        {
          ...mockAuditLog,
          user: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      ];
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue(activities as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.activities[0].userName).toBe('John Doe');
      expect(data.activities[0].description).toContain('John Doe');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.auditLog.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An unexpected error occurred');
    });
  });
});
