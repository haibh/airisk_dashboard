import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockSession, mockUser, mockOrganization } from '../mocks/mock-session';

// Dynamic import to avoid module resolution issues
const importRoute = async () => {
  const module = await import('@/app/api/dashboard/stats/route');
  return module;
};

describe('GET /api/dashboard/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest('http://localhost:3000/api/dashboard/stats');
  };

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when session user email is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { name: 'Test', email: null },
        expires: '',
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
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
      const data = await response.json();
      expect(data.error).toBe('User or organization not found');
    });

    it('should return 404 when user has no organization', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        organizationId: null,
        organization: null,
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(404);
    });
  });

  describe('Successful Response', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        organization: mockOrganization,
      } as any);
    });

    it('should return 200 with valid stats structure', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(5);
      vi.mocked(prisma.risk.count).mockResolvedValue(3);
      vi.mocked(prisma.riskControl.aggregate).mockResolvedValue({
        _avg: { effectiveness: 85 },
      } as any);
      vi.mocked(prisma.task.count).mockResolvedValue(2);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('totalSystems');
      expect(data).toHaveProperty('highRisks');
      expect(data).toHaveProperty('complianceScore');
      expect(data).toHaveProperty('pendingActions');
      expect(data).toHaveProperty('trends');
    });

    it('should include trends in response', async () => {
      vi.mocked(prisma.aISystem.count)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);
      vi.mocked(prisma.risk.count)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(4);
      vi.mocked(prisma.riskControl.aggregate)
        .mockResolvedValueOnce({ _avg: { effectiveness: 85 } } as any)
        .mockResolvedValueOnce({ _avg: { effectiveness: 80 } } as any);
      vi.mocked(prisma.task.count)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.trends).toHaveProperty('totalSystems');
      expect(data.trends).toHaveProperty('highRisks');
      expect(data.trends).toHaveProperty('complianceScore');
      expect(data.trends).toHaveProperty('pendingActions');
    });

    it('should calculate trend as 100 when previous value is 0', async () => {
      vi.mocked(prisma.aISystem.count)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0);
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.riskControl.aggregate).mockResolvedValue({
        _avg: { effectiveness: 0 },
      } as any);
      vi.mocked(prisma.task.count).mockResolvedValue(0);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.trends.totalSystems).toBe(100);
    });

    it('should round compliance score to integer', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(5);
      vi.mocked(prisma.risk.count).mockResolvedValue(3);
      vi.mocked(prisma.riskControl.aggregate).mockResolvedValue({
        _avg: { effectiveness: 85.7 },
      } as any);
      vi.mocked(prisma.task.count).mockResolvedValue(2);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(typeof data.complianceScore).toBe('number');
      expect(data.complianceScore).toBe(86);
    });

    it('should handle null effectiveness values', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(5);
      vi.mocked(prisma.risk.count).mockResolvedValue(3);
      vi.mocked(prisma.riskControl.aggregate).mockResolvedValue({
        _avg: { effectiveness: null },
      } as any);
      vi.mocked(prisma.task.count).mockResolvedValue(2);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.complianceScore).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        organization: mockOrganization,
      } as any);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.aISystem.count).mockRejectedValue(
        new Error('Database connection failed')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An unexpected error occurred');
    });
  });
});
