import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockSession, mockUser } from '../mocks/mock-session';
import { mockFramework } from '../mocks/mock-prisma-data';

const importRoute = async () => {
  const module = await import('@/app/api/dashboard/compliance/route');
  return module;
};

describe('GET /api/dashboard/compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest('http://localhost:3000/api/dashboard/compliance');
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

    it('should return 200 with compliance data', async () => {
      const frameworks = [{ ...mockFramework }];
      vi.mocked(prisma.framework.findMany).mockResolvedValue(frameworks as any);
      vi.mocked(prisma.control.count).mockResolvedValue(50);
      vi.mocked(prisma.riskControl.count).mockResolvedValue(40);
      vi.mocked(prisma.riskControl.aggregate).mockResolvedValue({
        _avg: { effectiveness: 80 },
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('frameworks');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.frameworks)).toBe(true);
    });

    it('should include required compliance fields', async () => {
      const frameworks = [{ ...mockFramework }];
      vi.mocked(prisma.framework.findMany).mockResolvedValue(frameworks as any);
      vi.mocked(prisma.control.count).mockResolvedValue(50);
      vi.mocked(prisma.riskControl.count).mockResolvedValue(40);
      vi.mocked(prisma.riskControl.aggregate).mockResolvedValue({
        _avg: { effectiveness: 80 },
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      const framework = data.frameworks[0];

      expect(framework).toHaveProperty('framework');
      expect(framework).toHaveProperty('frameworkId');
      expect(framework).toHaveProperty('frameworkName');
      expect(framework).toHaveProperty('percentage');
      expect(framework).toHaveProperty('totalControls');
      expect(framework).toHaveProperty('mappedControls');
      expect(framework).toHaveProperty('avgEffectiveness');
    });

    it('should handle empty frameworks list', async () => {
      vi.mocked(prisma.framework.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.frameworks).toEqual([]);
      expect(data.summary.totalFrameworks).toBe(0);
      expect(data.summary.avgCompliance).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.framework.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
