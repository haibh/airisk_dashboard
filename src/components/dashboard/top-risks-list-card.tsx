'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Scale, Lock, ShieldAlert, Cpu, Eye } from 'lucide-react';
import type { RiskHeatmapData } from '@/types/dashboard';

const RISK_CATEGORIES = ['Bias/Fairness', 'Privacy', 'Security', 'Reliability', 'Transparency'];

/** Map risk category name to a contextual Lucide icon */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Bias/Fairness': Scale,
  'Privacy': Lock,
  'Security': ShieldAlert,
  'Reliability': Cpu,
  'Transparency': Eye,
};

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
  // Hooks must be called before any early returns to satisfy Rules of Hooks
  const categories = useMemo(
    () => heatmapData ? getCategoryDistribution(heatmapData.heatmap) : [],
    [heatmapData]
  );

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
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Risk by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Risk by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map(({ name, count, percentage }) => {
          const CatIcon = CATEGORY_ICONS[name] || ShieldAlert;
          return (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <CatIcon className="h-3.5 w-3.5 shrink-0" />
              {name}
            </span>
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
          );
        })}
      </CardContent>
    </Card>
  );
}
