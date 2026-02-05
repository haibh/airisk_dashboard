'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RiskTrajectoryData, DateRangePreset } from '@/types/dashboard';

interface UseRiskTrajectoryOptions {
  riskId: string | null;
  preset?: DateRangePreset;
  customStart?: string;
  customEnd?: string;
}

interface UseRiskTrajectoryReturn {
  data: RiskTrajectoryData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function getDateRange(preset: DateRangePreset): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function useRiskTrajectoryData({
  riskId,
  preset = '30d',
  customStart,
  customEnd,
}: UseRiskTrajectoryOptions): UseRiskTrajectoryReturn {
  const [data, setData] = useState<RiskTrajectoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!riskId) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const range =
        preset === 'custom' && customStart && customEnd
          ? { start: customStart, end: customEnd }
          : getDateRange(preset);

      const params = new URLSearchParams({
        startDate: range.start,
        endDate: range.end,
      });

      const res = await fetch(`/api/risks/${riskId}/history?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch trajectory data');
      }

      const result = await res.json();

      // Transform history to points
      const points = result.history.map((h: {
        recordedAt: string;
        inherentScore: number;
        residualScore: number;
        targetScore: number | null;
      }) => ({
        date: h.recordedAt,
        inherentScore: h.inherentScore,
        residualScore: h.residualScore,
        targetScore: h.targetScore,
      }));

      setData({
        riskId: result.riskId,
        riskTitle: result.riskTitle,
        points,
        velocity: result.velocity,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [riskId, preset, customStart, customEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
