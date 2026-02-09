import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { calculateBatchVelocity } from '@/lib/risk-velocity-batch-calculator';
import { mockSession } from '../mocks/mock-session';

const importRoute = async () =>
  import('@/app/api/dashboard/risk-heatmap/cell/route');

const createRequest = (likelihood: number, impact: number, includeVelocity = false) => {
  const params = new URLSearchParams();
  params.set('likelihood', likelihood.toString());
  params.set('impact', impact.toString());
  if (includeVelocity) {
    params.set('includeVelocity', 'true');
  }
  return new NextRequest(
    `http://localhost:3000/api/dashboard/risk-heatmap/cell?${params.toString()}`
  );
};

describe('GET /api/dashboard/risk-heatmap/cell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 3));

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when user is null', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: null } as any);
      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 3));

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 400 when likelihood is below 1', async () => {
      const { GET } = await importRoute();
      const response = await GET(createRequest(0, 3));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Likelihood and impact must be between 1 and 5');
    });

    it('should return 400 when likelihood is above 5', async () => {
      const { GET } = await importRoute();
      const response = await GET(createRequest(6, 3));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Likelihood and impact must be between 1 and 5');
    });

    it('should return 400 when impact is below 1', async () => {
      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 0));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Likelihood and impact must be between 1 and 5');
    });

    it('should return 400 when impact is above 5', async () => {
      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 6));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Likelihood and impact must be between 1 and 5');
    });

    it('should return 400 for negative likelihood', async () => {
      const { GET } = await importRoute();
      const response = await GET(createRequest(-1, 3));

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative impact', async () => {
      const { GET } = await importRoute();
      const response = await GET(createRequest(3, -1));

      expect(response.status).toBe(400);
    });
  });

  describe('Risk retrieval', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 200 with risks at specified cell', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          residualScore: 12,
          treatmentStatus: 'MITIGATING',
          assessment: {
            title: 'Assessment 1',
            aiSystem: { name: 'System 1' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 4));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.likelihood).toBe(3);
      expect(data.impact).toBe(4);
      expect(data.count).toBe(1);
      expect(data.risks).toHaveLength(1);
    });

    it('should filter risks by likelihood and impact', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest(2, 5));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            likelihood: 2,
            impact: 5,
          }),
        })
      );
    });

    it('should sort risks by residual score descending', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest(3, 3));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { residualScore: 'desc' },
        })
      );
    });

    it('should limit results to 50 risks', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest(4, 4));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });
  });

  describe('Multi-tenancy', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should filter risks by organization', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest(3, 3));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assessment: expect.objectContaining({
              organizationId: mockSession.user.organizationId,
            }),
          }),
        })
      );
    });
  });

  describe('Risk formatting', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should format risks with all required fields', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-123',
          title: 'Data Breach Risk',
          category: 'PRIVACY',
          residualScore: 15,
          treatmentStatus: 'MITIGATING',
          assessment: {
            title: 'Q1 Assessment',
            aiSystem: { name: 'ML Model' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 4));

      const data = await response.json();
      expect(data.risks[0]).toEqual({
        id: 'risk-123',
        title: 'Data Breach Risk',
        category: 'PRIVACY',
        residualScore: 15,
        treatmentStatus: 'MITIGATING',
        assessmentTitle: 'Q1 Assessment',
        aiSystemName: 'ML Model',
        velocity: undefined,
      });
    });
  });

  describe('Velocity calculation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should not include velocity when includeVelocity is false', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          residualScore: 10,
          treatmentStatus: 'PENDING',
          assessment: {
            title: 'Assessment 1',
            aiSystem: { name: 'System 1' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 3, false));

      const data = await response.json();
      expect(data.risks[0].velocity).toBeUndefined();
    });

    it('should include velocity when includeVelocity=true', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          residualScore: 10,
          treatmentStatus: 'PENDING',
          assessment: {
            title: 'Assessment 1',
            aiSystem: { name: 'System 1' },
          },
        },
        {
          id: 'risk-2',
          title: 'Risk 2',
          category: 'PRIVACY',
          residualScore: 12,
          treatmentStatus: 'MITIGATING',
          assessment: {
            title: 'Assessment 1',
            aiSystem: { name: 'System 1' },
          },
        },
      ] as any);

      // Mock the velocity calculator
      vi.mocked(calculateBatchVelocity).mockResolvedValue(
        new Map([
          ['risk-1', { inherentChange: 0.5, residualChange: -0.3, trend: 'improving', periodDays: 30 }],
          ['risk-2', { inherentChange: 1.2, residualChange: 0.8, trend: 'worsening', periodDays: 30 }],
        ])
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 3, true));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.risks[0]).toHaveProperty('velocity');
    });

    it('should not calculate velocity for empty risk list', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest(5, 5, true));

      const data = await response.json();
      expect(data.risks).toEqual([]);
      expect(data.count).toBe(0);
    });
  });

  describe('Response structure', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return correct response structure', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          residualScore: 10,
          treatmentStatus: 'PENDING',
          assessment: {
            title: 'Assessment 1',
            aiSystem: { name: 'System 1' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest(2, 3));

      const data = await response.json();
      expect(data).toHaveProperty('likelihood');
      expect(data).toHaveProperty('impact');
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('risks');
    });

    it('should report correct count of risks', async () => {
      const risks = Array(25)
        .fill(null)
        .map((_, i) => ({
          id: `risk-${i}`,
          title: `Risk ${i}`,
          category: 'SECURITY',
          residualScore: 10 + i,
          treatmentStatus: 'PENDING',
          assessment: {
            title: 'Assessment',
            aiSystem: { name: 'System' },
          },
        }));

      vi.mocked(prisma.risk.findMany).mockResolvedValue(risks as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 3));

      const data = await response.json();
      expect(data.count).toBe(25);
    });

    it('should return empty risks array with count 0 when no risks exist', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest(5, 5));

      const data = await response.json();
      expect(data.count).toBe(0);
      expect(data.risks).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should handle boundary values 1 and 5 correctly', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET: get1 } = await importRoute();
      const response1 = await get1(createRequest(1, 1));
      expect(response1.status).toBe(200);

      const { GET: get5 } = await importRoute();
      const response5 = await get5(createRequest(5, 5));
      expect(response5.status).toBe(200);
    });

    it('should handle float values in likelihood/impact params', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const params = new URLSearchParams();
      params.set('likelihood', '3.5');
      params.set('impact', '4.5');
      const request = new NextRequest(
        `http://localhost:3000/api/dashboard/risk-heatmap/cell?${params.toString()}`
      );

      const { GET } = await importRoute();
      const response = await GET(request);

      // parseInt will truncate to 3 and 4, which are valid
      expect(response.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.risk.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 3));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch heatmap cell risks');
    });

    it('should handle missing likelihood parameter', async () => {
      const params = new URLSearchParams();
      params.set('impact', '3');
      const request = new NextRequest(
        `http://localhost:3000/api/dashboard/risk-heatmap/cell?${params.toString()}`
      );

      const { GET } = await importRoute();
      const response = await GET(request);

      // parseInt(null) = NaN, which fails validation
      expect(response.status).toBe(400);
    });

    it('should handle missing impact parameter', async () => {
      const params = new URLSearchParams();
      params.set('likelihood', '3');
      const request = new NextRequest(
        `http://localhost:3000/api/dashboard/risk-heatmap/cell?${params.toString()}`
      );

      const { GET } = await importRoute();
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Query parameter handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should handle includeVelocity parameter correctly', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const params = new URLSearchParams();
      params.set('likelihood', '3');
      params.set('impact', '3');
      params.set('includeVelocity', 'false');
      const request = new NextRequest(
        `http://localhost:3000/api/dashboard/risk-heatmap/cell?${params.toString()}`
      );

      const { GET } = await importRoute();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      // When includeVelocity is explicitly false, velocity should not be fetched
    });

    it('should treat missing includeVelocity as false', async () => {
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          residualScore: 10,
          treatmentStatus: 'PENDING',
          assessment: {
            title: 'Assessment',
            aiSystem: { name: 'System' },
          },
        },
      ] as any);

      const params = new URLSearchParams();
      params.set('likelihood', '3');
      params.set('impact', '3');
      const request = new NextRequest(
        `http://localhost:3000/api/dashboard/risk-heatmap/cell?${params.toString()}`
      );

      const { GET } = await importRoute();
      const response = await GET(request);

      const data = await response.json();
      expect(data.risks[0].velocity).toBeUndefined();
    });
  });

  describe('All risk categories', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should retrieve risks regardless of category', async () => {
      const risks = [
        { category: 'SECURITY' },
        { category: 'PRIVACY' },
        { category: 'BIAS' },
        { category: 'TRANSPARENCY' },
        { category: 'ACCOUNTABILITY' },
      ].map((risk, i) => ({
        id: `risk-${i}`,
        title: `Risk ${i}`,
        residualScore: 10,
        treatmentStatus: 'PENDING',
        assessment: {
          title: 'Assessment',
          aiSystem: { name: 'System' },
        },
        ...risk,
      }));

      vi.mocked(prisma.risk.findMany).mockResolvedValue(risks as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest(3, 3));

      const data = await response.json();
      expect(data.risks).toHaveLength(5);
      const categories = data.risks.map((r: any) => r.category);
      expect(categories).toContain('SECURITY');
      expect(categories).toContain('PRIVACY');
    });
  });
});
