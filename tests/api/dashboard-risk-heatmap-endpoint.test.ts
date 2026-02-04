import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockSession, mockUser } from '../mocks/mock-session';
import { generateMockRisks } from '../mocks/mock-prisma-data';

const importRoute = async () => {
  const module = await import('@/app/api/dashboard/risk-heatmap/route');
  return module;
};

describe('GET /api/dashboard/risk-heatmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest('http://localhost:3000/api/dashboard/risk-heatmap');
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
      const data = await response.json();
      expect(data.error).toBe('User or organization not found');
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

  describe('Heatmap Generation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should return 200 with valid heatmap structure', async () => {
      const mockRisks = generateMockRisks(20);
      vi.mocked(prisma.risk.findMany).mockResolvedValue(mockRisks as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('heatmap');
      expect(data).toHaveProperty('totalRisks');
      expect(data).toHaveProperty('maxCount');
      expect(data).toHaveProperty('dimensions');
    });

    it('should return 5x5 heatmap matrix', async () => {
      const mockRisks = generateMockRisks(10);
      vi.mocked(prisma.risk.findMany).mockResolvedValue(mockRisks as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(Array.isArray(data.heatmap)).toBe(true);
      expect(data.heatmap.length).toBe(5);
      data.heatmap.forEach((row: number[]) => {
        expect(row.length).toBe(5);
      });
    });

    it('should correctly count risks at likelihood/impact intersections', async () => {
      const risks = [
        { likelihood: 1, impact: 1 },
        { likelihood: 1, impact: 1 },
        { likelihood: 3, impact: 4 },
        { likelihood: 5, impact: 5 },
      ];
      vi.mocked(prisma.risk.findMany).mockResolvedValue(risks as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.heatmap[0][0]).toBe(2);
      expect(data.heatmap[2][3]).toBe(1);
      expect(data.heatmap[4][4]).toBe(1);
    });

    it('should report total risk count', async () => {
      const mockRisks = generateMockRisks(15);
      vi.mocked(prisma.risk.findMany).mockResolvedValue(mockRisks as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.totalRisks).toBe(15);
    });

    it('should handle empty risk dataset', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.totalRisks).toBe(0);
      expect(data.maxCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.risk.findMany).mockRejectedValue(
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
