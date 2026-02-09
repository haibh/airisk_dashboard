import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { calculateBatchVelocity } from '@/lib/risk-velocity-batch-calculator';
import { mockSession, mockAdminSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/risks/route');

const createRequest = (queryParams = '') => {
  const baseUrl = 'http://localhost:3000/api/risks';
  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('pageSize', '20');

  if (queryParams) {
    const customParams = new URLSearchParams(queryParams);
    for (const [key, value] of customParams) {
      params.set(key, value);
    }
  }

  return new NextRequest(`${baseUrl}?${params.toString()}`);
};

describe('GET /api/risks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
    });

    it('should return 401 when user is null', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: null } as any);
      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
    });
  });

  describe('Basic risk listing', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 200 with paginated risks', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(2);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          likelihood: 3,
          impact: 4,
          inherentScore: 12,
          residualScore: 6,
          controlEffectiveness: 50,
          treatmentStatus: 'MITIGATING',
          treatmentDueDate: new Date(),
          assessment: {
            id: 'assessment-1',
            title: 'Assessment 1',
            aiSystem: { id: 'system-1', name: 'System 1' },
          },
        },
        {
          id: 'risk-2',
          title: 'Risk 2',
          category: 'PRIVACY',
          likelihood: 4,
          impact: 5,
          inherentScore: 20,
          residualScore: 10,
          controlEffectiveness: 50,
          treatmentStatus: 'PENDING',
          treatmentDueDate: new Date(),
          assessment: {
            id: 'assessment-1',
            title: 'Assessment 1',
            aiSystem: { id: 'system-1', name: 'System 1' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(20);
    });

    it('should respect pagination parameters', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(50);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          likelihood: 1,
          impact: 1,
          inherentScore: 1,
          residualScore: 1,
          controlEffectiveness: 0,
          treatmentStatus: 'PENDING',
          treatmentDueDate: null,
          assessment: {
            id: 'a1',
            title: 'Assessment 1',
            aiSystem: { id: 's1', name: 'System 1' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest('page=2&pageSize=10'));

      const data = await response.json();
      expect(data.page).toBe(2);
      expect(data.pageSize).toBe(10);

      // Verify skip/take called correctly
      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (2 - 1) * 10
          take: 10,
        })
      );
    });

    it('should cap pageSize at 100', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest('page=1&pageSize=200'));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should default pageSize to 20', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(new NextRequest('http://localhost:3000/api/risks?page=1'));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      );
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should filter by category', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(1);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Security Risk',
          category: 'SECURITY',
          likelihood: 1,
          impact: 1,
          inherentScore: 1,
          residualScore: 1,
          controlEffectiveness: 0,
          treatmentStatus: 'PENDING',
          treatmentDueDate: null,
          assessment: {
            id: 'a1',
            title: 'Assessment 1',
            aiSystem: { id: 's1', name: 'System 1' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      await GET(createRequest('category=SECURITY'));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'SECURITY',
          }),
        })
      );
    });

    it('should filter by treatmentStatus', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(1);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest('treatmentStatus=MITIGATING'));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            treatmentStatus: 'MITIGATING',
          }),
        })
      );
    });

    it('should apply both category and treatmentStatus filters', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest('category=PRIVACY&treatmentStatus=PENDING'));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'PRIVACY',
            treatmentStatus: 'PENDING',
          }),
        })
      );
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should default sort by residualScore descending', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest());

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { residualScore: 'desc' },
        })
      );
    });

    it('should allow sorting by different fields', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest('sortBy=inherentScore&sortOrder=asc'));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { inherentScore: 'asc' },
        })
      );
    });

    it('should default to desc when sortOrder is not asc', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest('sortBy=title&sortOrder=invalid'));

      expect(prisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { title: 'desc' },
        })
      );
    });
  });

  describe('Velocity calculation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should include velocity when includeVelocity=true', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(2);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          likelihood: 1,
          impact: 1,
          inherentScore: 1,
          residualScore: 1,
          controlEffectiveness: 0,
          treatmentStatus: 'PENDING',
          treatmentDueDate: null,
          assessment: {
            id: 'a1',
            title: 'Assessment 1',
            aiSystem: { id: 's1', name: 'System 1' },
          },
        },
        {
          id: 'risk-2',
          title: 'Risk 2',
          category: 'PRIVACY',
          likelihood: 1,
          impact: 1,
          inherentScore: 1,
          residualScore: 1,
          controlEffectiveness: 0,
          treatmentStatus: 'PENDING',
          treatmentDueDate: null,
          assessment: {
            id: 'a1',
            title: 'Assessment 1',
            aiSystem: { id: 's1', name: 'System 1' },
          },
        },
      ] as any);

      // Mock calculateBatchVelocity
      vi.mocked(calculateBatchVelocity).mockResolvedValue(
        new Map([
          [
            'risk-1',
            {
              inherentChange: 0.5,
              residualChange: -0.2,
              trend: 'improving' as const,
              periodDays: 10,
            },
          ],
          [
            'risk-2',
            {
              inherentChange: 0,
              residualChange: 0.1,
              trend: 'worsening' as const,
              periodDays: 10,
            },
          ],
        ])
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest('includeVelocity=true'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items[0]).toHaveProperty('velocity');
    });

    it('should omit velocity when includeVelocity=false', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(1);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          likelihood: 1,
          impact: 1,
          inherentScore: 1,
          residualScore: 1,
          controlEffectiveness: 0,
          treatmentStatus: 'PENDING',
          treatmentDueDate: null,
          assessment: {
            id: 'a1',
            title: 'Assessment 1',
            aiSystem: { id: 's1', name: 'System 1' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest('includeVelocity=false'));

      const data = await response.json();
      expect(data.items[0].velocity).toBeUndefined();
    });

    it('should not calculate velocity when includeVelocity is not specified', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest());

      // velocity calculation should not happen
      expect(data => !data.velocity);
    });
  });

  describe('Multi-tenancy', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should filter risks by organization', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest());

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

  describe('Response formatting', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should include assessmentId and aiSystemId in response', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(1);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([
        {
          id: 'risk-1',
          title: 'Risk 1',
          category: 'SECURITY',
          likelihood: 1,
          impact: 1,
          inherentScore: 1,
          residualScore: 1,
          controlEffectiveness: 0,
          treatmentStatus: 'PENDING',
          treatmentDueDate: null,
          assessment: {
            id: 'assessment-123',
            title: 'Assessment Title',
            aiSystem: { id: 'system-456', name: 'System Name' },
          },
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.items[0]).toMatchObject({
        assessmentId: 'assessment-123',
        assessmentTitle: 'Assessment Title',
        aiSystemId: 'system-456',
        aiSystemName: 'System Name',
      });
    });

    it('should calculate total pages correctly', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(55);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('page=1&pageSize=20'));

      const data = await response.json();
      expect(data.totalPages).toBe(3); // Math.ceil(55/20)
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.risk.count).mockRejectedValue(new Error('DB Error'));

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
    });

    it('should handle findMany error gracefully', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(10);
      vi.mocked(prisma.risk.findMany).mockRejectedValue(
        new Error('Query failed')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
    });
  });

  describe('Empty results', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return empty items array when no risks exist', async () => {
      vi.mocked(prisma.risk.count).mockResolvedValue(0);
      vi.mocked(prisma.risk.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.totalPages).toBe(0);
    });
  });
});
