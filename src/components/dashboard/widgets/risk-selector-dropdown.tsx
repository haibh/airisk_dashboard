'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRiskLevel } from '@/lib/risk-scoring-calculator';

interface Risk {
  id: string;
  title: string;
  residualScore: number;
}

interface RiskSelectorDropdownProps {
  value: string | null;
  onChange: (riskId: string | null) => void;
  placeholder?: string;
}

export function RiskSelectorDropdown({
  value,
  onChange,
  placeholder = 'Select a risk',
}: RiskSelectorDropdownProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRisks() {
      try {
        // Fetch top risks sorted by residual score
        const res = await fetch('/api/dashboard/risk-heatmap');
        if (res.ok) {
          const data = await res.json();
          // Extract unique risks from heatmap data if available
          // Or fetch from a dedicated risks endpoint
          const risksRes = await fetch('/api/risks?pageSize=50');
          if (risksRes.ok) {
            const risksData = await risksRes.json();
            setRisks(risksData.items || []);
          }
        }
      } catch {
        // Silent fail - dropdown will be empty
      } finally {
        setLoading(false);
      }
    }
    fetchRisks();
  }, []);

  const getRiskLevelColor = (score: number) => {
    const level = getRiskLevel(score);
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600',
    };
    return colors[level];
  };

  return (
    <Select
      value={value || ''}
      onValueChange={(v) => onChange(v || null)}
      disabled={loading}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder={loading ? 'Loading risks...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {risks.length === 0 ? (
          <SelectItem value="_empty" disabled>
            No risks available
          </SelectItem>
        ) : (
          risks.map((risk) => (
            <SelectItem key={risk.id} value={risk.id}>
              <div className="flex items-center justify-between w-full gap-2">
                <span className="truncate max-w-[200px]">{risk.title}</span>
                <span className={`text-xs font-medium ${getRiskLevelColor(risk.residualScore)}`}>
                  {risk.residualScore.toFixed(1)}
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
