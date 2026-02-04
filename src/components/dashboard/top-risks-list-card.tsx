'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RiskHeatmapData } from '@/types/dashboard';

const RISK_CATEGORIES = ['Bias/Fairness', 'Privacy', 'Security', 'Reliability', 'Transparency'];

function getCategoryDistribution(heatmap: number[][]) {
  const total = heatmap.flat().reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  // Distribute risks proportionally across categories based on severity bands
  return RISK_CATEGORIES.map((name, idx) => {
    const band = heatmap[Math.min(idx, 4)] || [];
    const count = band.reduce((s, v) => s + v, 0);
    return { name, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 };
  }).sort((a, b) => b.count - a.count);
}

interface TopRisksListCardProps {
  heatmapData: RiskHeatmapData | null;
  isLoading?: boolean;
}

export function TopRisksListCard({ heatmapData, isLoading }: TopRisksListCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!heatmapData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Risk by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data</p>
        </CardContent>
      </Card>
    );
  }

  const categories = getCategoryDistribution(heatmapData.heatmap);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Risk by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map(({ name, count, percentage }) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{name}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="font-medium w-6 text-right">{count}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
