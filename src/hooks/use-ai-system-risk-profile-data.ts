'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AISystemRiskProfile } from '@/types/dashboard';

interface UseAISystemRiskProfileOptions {
  systemId: string | null;
}

interface UseAISystemRiskProfileReturn {
  data: AISystemRiskProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAISystemRiskProfileData({
  systemId,
}: UseAISystemRiskProfileOptions): UseAISystemRiskProfileReturn {
  const [data, setData] = useState<AISystemRiskProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!systemId) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/ai-systems/${systemId}/risk-profile`);

      if (!res.ok) {
        throw new Error('Failed to fetch risk profile');
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [systemId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
