import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/risks/[id]/history/route');

const createRequest = (riskId: string, queryParams = '') => {
  const baseUrl = `http://localhost:3000/api/risks/${riskId}/history`;
  const params = new URLSearchParams(queryParams);
  return new NextRequest(`${baseUrl}?${params.toString()}`);
};

describe('GET /api/risks/[id]/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(response.status).toBe(401);
    });

    it('should return 401 when user is null', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: null } as any);
      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(response.status).toBe(401);
    });
  });

  describe('Risk validation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 404 when risk does not exist', async () => {
      vi.mocked(prisma.risk.findFirst).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('non-existent'),
        { params: Promise.resolve({ id: 'non-existent' }) }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Risk not found');
    });

    it('should verify risk belongs to user organization', async () => {
      vi.mocked(prisma.risk.findFirst).mockResolvedValue(null);

      const { GET } = await importRoute();
      await GET(createRequest('risk-1'), { params: Promise.resolve({ id: 'risk-1' }) });

      expect(prisma.risk.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'risk-1',
            assessment: expect.objectContaining({
              organizationId: mockSession.user.organizationId,
            }),
          }),
        })
      );
    });
  });

  describe('History retrieval', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.risk.findFirst).mockResolvedValue({
        id: 'risk-1',
        title: 'Test Risk',
        inherentScore: 15,
        residualScore: 8,
        targetScore: 5,
        controlEffectiveness: 50,
      } as any);
    });

    it('should return 200 with risk history', async () => {
      const historyRecords = [
        {
          id: 'hist-1',
          riskId: 'risk-1',
          inherentScore: 12,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL',
          notes: 'Initial assessment',
          recordedAt: new Date('2026-01-01'),
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 'hist-2',
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 8,
          targetScore: 5,
          controlEffectiveness: 50,
          source: 'CONTROL_CHANGE',
          notes: 'Control implemented',
          recordedAt: new Date('2026-01-11'),
          createdAt: new Date('2026-01-11'),
        },
      ];

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue(
        historyRecords as any
      );

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.riskId).toBe('risk-1');
      expect(data.riskTitle).toBe('Test Risk');
      expect(data.history).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should return current scores in response', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      const data = await response.json();
      expect(data.currentScores).toEqual({
        inherent: 15,
        residual: 8,
        target: 5,
        controlEffectiveness: 50,
      });
    });

    it('should include velocity in response', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          id: 'hist-1',
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 8,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL',
          notes: null,
          recordedAt: new Date('2026-01-01'),
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 'hist-2',
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 8,
          targetScore: 5,
          controlEffectiveness: 50,
          source: 'CONTROL_CHANGE',
          notes: null,
          recordedAt: new Date('2026-01-11'),
          createdAt: new Date('2026-01-11'),
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      const data = await response.json();
      expect(data).toHaveProperty('velocity');
      expect(data.velocity).toHaveProperty('trend');
      expect(data.velocity).toHaveProperty('inherentChange');
      expect(data.velocity).toHaveProperty('residualChange');
      expect(data.velocity).toHaveProperty('periodDays');
    });

    it('should convert dates to ISO string format', async () => {
      const recordedDate = new Date('2026-01-01T10:30:00Z');
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          id: 'hist-1',
          riskId: 'risk-1',
          inherentScore: 12,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL',
          notes: null,
          recordedAt: recordedDate,
          createdAt: recordedDate,
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      const data = await response.json();
      expect(typeof data.history[0].recordedAt).toBe('string');
      expect(data.history[0].recordedAt).toContain('2026-01-01');
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.risk.findFirst).mockResolvedValue({
        id: 'risk-1',
        title: 'Test Risk',
        inherentScore: 15,
        residualScore: 8,
        targetScore: 5,
        controlEffectiveness: 50,
      } as any);
    });

    it('should filter by startDate', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1', 'startDate=2026-01-05'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskId: 'risk-1',
            recordedAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should filter by endDate', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1', 'endDate=2026-01-31'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskId: 'risk-1',
            recordedAt: expect.objectContaining({
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should filter by both startDate and endDate', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1', 'startDate=2026-01-05&endDate=2026-01-31'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskId: 'risk-1',
            recordedAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should not apply date filter when not provided', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            recordedAt: expect.anything(),
          }),
        })
      );
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.risk.findFirst).mockResolvedValue({
        id: 'risk-1',
        title: 'Test Risk',
        inherentScore: 15,
        residualScore: 8,
        targetScore: 5,
        controlEffectiveness: 50,
      } as any);
    });

    it('should default limit to 100', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should respect custom limit parameter', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1', 'limit=50'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should order history by recordedAt ascending', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { recordedAt: 'asc' },
        })
      );
    });
  });

  describe('History mapping', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.risk.findFirst).mockResolvedValue({
        id: 'risk-1',
        title: 'Test Risk',
        inherentScore: 15,
        residualScore: 8,
        targetScore: 5,
        controlEffectiveness: 50,
      } as any);
    });

    it('should map all history record fields correctly', async () => {
      const recordedDate = new Date('2026-01-01T10:00:00Z');
      const createdDate = new Date('2026-01-01T10:30:00Z');

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          id: 'hist-123',
          riskId: 'risk-1',
          inherentScore: 12,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 25,
          source: 'MANUAL',
          notes: 'Manual update',
          recordedAt: recordedDate,
          createdAt: createdDate,
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      const data = await response.json();
      const record = data.history[0];

      expect(record).toEqual({
        id: 'hist-123',
        riskId: 'risk-1',
        inherentScore: 12,
        residualScore: 10,
        targetScore: 5,
        controlEffectiveness: 25,
        source: 'MANUAL',
        notes: 'Manual update',
        recordedAt: recordedDate.toISOString(),
        createdAt: createdDate.toISOString(),
      });
    });

    it('should handle null notes field', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          id: 'hist-1',
          riskId: 'risk-1',
          inherentScore: 12,
          residualScore: 10,
          targetScore: 5,
          controlEffectiveness: 0,
          source: 'INITIAL',
          notes: null,
          recordedAt: new Date(),
          createdAt: new Date(),
        },
      ] as any);

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      const data = await response.json();
      expect(data.history[0].notes).toBeNull();
    });
  });

  describe('Empty history', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.risk.findFirst).mockResolvedValue({
        id: 'risk-1',
        title: 'Test Risk',
        inherentScore: 15,
        residualScore: 8,
        targetScore: 5,
        controlEffectiveness: 50,
      } as any);
    });

    it('should return empty history array when no records exist', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      const data = await response.json();
      expect(data.history).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 500 on database error during risk lookup', async () => {
      vi.mocked(prisma.risk.findFirst).mockRejectedValue(
        new Error('DB Error')
      );

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch risk history');
    });

    it('should return 500 on database error during history fetch', async () => {
      vi.mocked(prisma.risk.findFirst).mockResolvedValue({
        id: 'risk-1',
        title: 'Test Risk',
        inherentScore: 15,
        residualScore: 8,
        targetScore: 5,
        controlEffectiveness: 50,
      } as any);

      vi.mocked(prisma.riskScoreHistory.findMany).mockRejectedValue(
        new Error('Query failed')
      );

      const { GET } = await importRoute();
      const response = await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch risk history');
    });
  });

  describe('Multi-tenancy', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should only return history for risks in user organization', async () => {
      vi.mocked(prisma.risk.findFirst).mockResolvedValue(null);

      const { GET } = await importRoute();
      await GET(
        createRequest('risk-1'),
        { params: Promise.resolve({ id: 'risk-1' }) }
      );

      expect(prisma.risk.findFirst).toHaveBeenCalledWith(
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
});
