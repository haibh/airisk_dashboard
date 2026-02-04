'use client';

import { useEffect, useState, useCallback } from 'react';
import type { DashboardStats, RiskHeatmapData, ComplianceFramework, Activity } from '@/types/dashboard';

interface UseDashboardDataReturn {
  stats: DashboardStats | null;
  heatmapData: RiskHeatmapData | null;
  frameworks: ComplianceFramework[];
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<RiskHeatmapData | null>(null);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsRes, heatmapRes, complianceRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/risk-heatmap'),
        fetch('/api/dashboard/compliance'),
        fetch('/api/dashboard/activity'),
      ]);

      if (!statsRes.ok || !heatmapRes.ok || !complianceRes.ok || !activityRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, heatmapResult, complianceData, activityData] = await Promise.all([
        statsRes.json(),
        heatmapRes.json(),
        complianceRes.json(),
        activityRes.json(),
      ]);

      setStats(statsData);
      setHeatmapData(heatmapResult);
      setFrameworks(complianceData.frameworks || []);
      setActivities(activityData.activities || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, heatmapData, frameworks, activities, isLoading, error, refetch: fetchDashboardData };
}
