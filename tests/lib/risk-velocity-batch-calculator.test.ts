import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/db';

// Restore actual implementation for unit testing
vi.unmock('@/lib/risk-velocity-batch-calculator');

import {
  calculateBatchVelocity,
  calculateSingleVelocity,
} from '@/lib/risk-velocity-batch-calculator';

describe('calculateBatchVelocity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty input', () => {
    it('should return empty map when riskIds array is empty', async () => {
      const result = await calculateBatchVelocity([]);
      expect(result.size).toBe(0);
      expect(result instanceof Map).toBe(true);
    });
  });

  describe('Single risk with no history', () => {
    it('should return stable velocity with 0 values when no history records exist', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      const result = await calculateBatchVelocity(['risk-1']);

      expect(result.size).toBe(1);
      const velocity = result.get('risk-1');
      expect(velocity).toEqual({
        inherentChange: 0,
        residualChange: 0,
        trend: 'stable',
        periodDays: 0,
      });
    });

    it('should return stable velocity with < 2 history records', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 8,
          recordedAt: new Date('2026-01-01'),
        } as any,
      ]);

      const result = await calculateBatchVelocity(['risk-1']);

      const velocity = result.get('risk-1');
      expect(velocity?.trend).toBe('stable');
      expect(velocity?.inherentChange).toBe(0);
      expect(velocity?.residualChange).toBe(0);
    });
  });

  describe('Single risk with velocity calculation', () => {
    it('should calculate improving trend when residual score decreases', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-11'); // 10 days later

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 12,
          recordedAt: startDate,
        },
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 2,
          recordedAt: endDate,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      expect(velocity?.trend).toBe('improving');
      expect(velocity?.residualChange).toBeLessThan(0);
      expect(velocity?.periodDays).toBe(10);
    });

    it('should calculate worsening trend when residual score increases', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-11');

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 12,
          residualScore: 3,
          recordedAt: startDate,
        },
        {
          riskId: 'risk-1',
          inherentScore: 12,
          residualScore: 12,
          recordedAt: endDate,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      expect(velocity?.trend).toBe('worsening');
      expect(velocity?.residualChange).toBeGreaterThan(0);
      expect(velocity?.periodDays).toBe(10);
    });

    it('should calculate stable trend when residual change is below threshold', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-11');

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 8,
          recordedAt: startDate,
        },
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 8.5,
          recordedAt: endDate,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      expect(velocity?.trend).toBe('stable');
      // Change: (8.5 - 8) / 10 = 0.05 per day (below 0.1 threshold)
      expect(Math.abs(velocity?.residualChange ?? 0)).toBeLessThan(0.1);
    });
  });

  describe('Multiple risks batch calculation', () => {
    it('should calculate velocity for multiple risks independently', async () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-11');

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 12,
          recordedAt: date1,
        },
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 2,
          recordedAt: date2,
        },
        {
          riskId: 'risk-2',
          inherentScore: 10,
          residualScore: 3,
          recordedAt: date1,
        },
        {
          riskId: 'risk-2',
          inherentScore: 10,
          residualScore: 8,
          recordedAt: date2,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1', 'risk-2']);

      expect(result.size).toBe(2);
      expect(result.get('risk-1')?.trend).toBe('improving');
      expect(result.get('risk-2')?.trend).toBe('worsening');
    });

    it('should handle risks with no history in batch', async () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-11');

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 12,
          recordedAt: date1,
        },
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 2,
          recordedAt: date2,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1', 'risk-2']);

      expect(result.size).toBe(2);
      expect(result.get('risk-1')?.trend).toBe('improving');
      expect(result.get('risk-2')?.trend).toBe('stable');
    });
  });

  describe('Date range filtering', () => {
    it('should filter history records by date range', async () => {
      const startDate = new Date('2026-01-08');
      const records = [
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 12,
          recordedAt: new Date('2026-01-01'),
        },
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 10,
          recordedAt: new Date('2026-01-11'),
        },
      ];

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue(
        records as any
      );

      const result = await calculateBatchVelocity(['risk-1'], 3); // 3 days

      // Should call with date range starting 3 days ago
      expect(prisma.riskScoreHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskId: { in: ['risk-1'] },
            recordedAt: {
              gte: expect.any(Date),
            },
          }),
        })
      );
    });

    it('should respect custom period days parameter', async () => {
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

      await calculateBatchVelocity(['risk-1'], 7); // 7 days

      const callArgs = vi.mocked(prisma.riskScoreHistory.findMany).mock
        .calls[0][0];
      const where = callArgs.where as any;
      const startDate = where.recordedAt.gte;

      // Should be roughly 7 days ago
      const daysBack = Math.floor(
        (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysBack).toBe(7);
    });
  });

  describe('Rounding and precision', () => {
    it('should round velocity changes to 2 decimal places', async () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-04'); // 3 days

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 10,
          recordedAt: date1,
        },
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 11.333,
          recordedAt: date2,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      // Change: (11.333 - 10) / 3 = 0.444333... rounded to 0.44
      expect(velocity?.residualChange).toBe(0.44);
    });

    it('should round periodDays to whole number', async () => {
      const date1 = new Date('2026-01-01T00:00:00Z');
      const date2 = new Date('2026-01-01T12:00:00Z'); // 0.5 days

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 10,
          recordedAt: date1,
        },
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 10,
          recordedAt: date2,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      expect(Number.isInteger(velocity?.periodDays)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle same-day history records', async () => {
      const sameDate = new Date('2026-01-01');

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 10,
          recordedAt: sameDate,
        },
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 12,
          recordedAt: sameDate,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      // Should use Math.max(1, daysDiff) so periodDays = 1
      expect(velocity?.periodDays).toBe(1);
      expect(velocity?.residualChange).toBe(2.0); // 2 points per day
    });

    it('should maintain correct sign for inherent and residual changes', async () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-06'); // 5 days

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 5,
          residualScore: 4,
          recordedAt: date1,
        },
        {
          riskId: 'risk-1',
          inherentScore: 15,
          residualScore: 3,
          recordedAt: date2,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      // Inherent: (15 - 5) / 5 = 2.0 (positive)
      // Residual: (3 - 4) / 5 = -0.2 (negative, improving)
      expect(velocity?.inherentChange).toBe(2.0);
      expect(velocity?.residualChange).toBe(-0.2);
      expect(velocity?.trend).toBe('improving');
    });
  });

  describe('Threshold detection', () => {
    it('should use 0.1 threshold to determine trend', async () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-11'); // 10 days

      // Test exactly at threshold boundary
      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 10,
          recordedAt: date1,
        },
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 9.0,
          recordedAt: date2,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      // Change: (9 - 10) / 10 = -0.1 per day (exactly at threshold)
      // Should be improving (< -0.1 threshold exclusive? need to check implementation)
      // Implementation uses: if (residualChange < -threshold) → improving
      expect(velocity?.trend).toBe('stable');
    });

    it('should detect worsening just above threshold', async () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-11');

      vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 10,
          recordedAt: date1,
        },
        {
          riskId: 'risk-1',
          inherentScore: 10,
          residualScore: 11.01,
          recordedAt: date2,
        },
      ] as any);

      const result = await calculateBatchVelocity(['risk-1']);
      const velocity = result.get('risk-1');

      // Change: (11.01 - 10) / 10 = 0.101 per day (> 0.1)
      expect(velocity?.trend).toBe('worsening');
    });
  });
});

describe('calculateSingleVelocity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return velocity for single risk', async () => {
    const date1 = new Date('2026-01-01');
    const date2 = new Date('2026-01-11');

    vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([
      {
        riskId: 'risk-1',
        inherentScore: 15,
        residualScore: 12,
        recordedAt: date1,
      },
      {
        riskId: 'risk-1',
        inherentScore: 15,
        residualScore: 2,
        recordedAt: date2,
      },
    ] as any);

    const velocity = await calculateSingleVelocity('risk-1');

    expect(velocity.trend).toBe('improving');
    expect(velocity.periodDays).toBe(10);
  });

  it('should return stable velocity when no history', async () => {
    vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

    const velocity = await calculateSingleVelocity('risk-1');

    expect(velocity).toEqual({
      inherentChange: 0,
      residualChange: 0,
      trend: 'stable',
      periodDays: 0,
    });
  });

  it('should respect custom period days', async () => {
    vi.mocked(prisma.riskScoreHistory.findMany).mockResolvedValue([]);

    await calculateSingleVelocity('risk-1', 14);

    const callArgs = vi.mocked(prisma.riskScoreHistory.findMany).mock
      .calls[0][0];
    const where = callArgs.where as any;
    const startDate = where.recordedAt.gte;

    const daysBack = Math.floor(
      (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(daysBack).toBe(14);
  });
});
