'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ControlRiskSankeyData } from '@/types/dashboard';

interface UseControlRiskFlowOptions {
  frameworkId?: string;
  riskCategory?: string;
  limit?: number;
}

interface UseControlRiskFlowReturn {
  data: ControlRiskSankeyData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useControlRiskFlowData(
  options: UseControlRiskFlowOptions = {}
): UseControlRiskFlowReturn {
  const [data, setData] = useState<ControlRiskSankeyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.frameworkId) params.set('frameworkId', options.frameworkId);
      if (options.riskCategory) params.set('riskCategory', options.riskCategory);
      if (options.limit) params.set('limit', options.limit.toString());

      const res = await fetch(`/api/dashboard/control-risk-flow?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch control-risk flow data');
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [options.frameworkId, options.riskCategory, options.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
