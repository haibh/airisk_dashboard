'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { RiskHeatmapData } from '@/types/dashboard';

function aggregateRiskCounts(heatmap: number[][]) {
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (let likelihood = 0; likelihood < 5; likelihood++) {
    for (let impact = 0; impact < 5; impact++) {
      const count = heatmap[likelihood]?.[impact] || 0;
      const score = (likelihood + 1) * (impact + 1);
      if (score >= 16) critical += count;
      else if (score >= 10) high += count;
      else if (score >= 5) medium += count;
      else low += count;
    }
  }

  return { critical, high, medium, low };
}

interface TopCriticalRisksCardsProps {
  heatmapData: RiskHeatmapData | null;
  isLoading?: boolean;
}

export function TopCriticalRisksCards({ heatmapData, isLoading }: TopCriticalRisksCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!heatmapData) {
    return <p className="text-sm text-muted-foreground">No risk data available</p>;
  }

  const counts = aggregateRiskCounts(heatmapData.heatmap);

  const items = [
    { label: 'Critical', count: counts.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'High', count: counts.high, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Medium', count: counts.medium, icon: Info, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Risk Severity Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {items.map(({ label, count, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-lg p-3 text-center`}>
              <Icon className={`h-5 w-5 ${color} mx-auto mb-1`} />
              <div className={`text-2xl font-bold ${color}`}>{count}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
