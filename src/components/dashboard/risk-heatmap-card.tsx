'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { RiskHeatmapData } from '@/types/dashboard';

/** 5x5 color matrix: rows = likelihood (high to low), cols = impact (low to high) */
const COLOR_MATRIX = [
  ['bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-600', 'bg-red-700'],
  ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-600'],
  ['bg-green-400', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'],
  ['bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500'],
  ['bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-yellow-500'],
];

/**
 * Check if a cell is in the critical zone (high likelihood + high impact).
 * Critical zone: likelihood >= 4 AND impact >= 4 (top-right corner of matrix)
 */
function isCriticalZone(likelihoodIndex: number, impactIndex: number): boolean {
  // likelihoodIndex 0 = highest (5), impactIndex 4 = highest (5)
  return likelihoodIndex <= 1 && impactIndex >= 3;
}

export function RiskHeatmap({ data }: { data: RiskHeatmapData | null }) {
  if (!data) {
    return <p className="text-sm text-muted-foreground">No risk data available</p>;
  }

  const reversedHeatmap = [...data.heatmap].reverse();

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1">
        <div className="w-16 text-xs text-muted-foreground">Likelihood</div>
        <div className="flex-1">
          <div className="text-center text-xs text-muted-foreground mb-1">
            Impact &rarr;
          </div>
        </div>
      </div>
      {reversedHeatmap.map((row, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="w-16 text-xs text-muted-foreground text-right pr-2">
            {5 - i}
          </div>
          {row.map((count, j) => {
            const isCritical = isCriticalZone(i, j) && count > 0;
            return (
              <div
                key={j}
                className={`flex-1 aspect-square ${COLOR_MATRIX[i][j]} rounded flex items-center justify-center text-white text-xs font-medium transition-all ${
                  isCritical
                    ? 'ring-2 ring-destructive ring-offset-2 ring-offset-background z-10 scale-105'
                    : ''
                }`}
                title={`Likelihood ${5 - i}, Impact ${j + 1}: ${count} risk${count !== 1 ? 's' : ''}`}
              >
                {count > 0 && count}
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-1 mt-2">
        <div className="w-16" />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex-1 text-center text-xs text-muted-foreground">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 mb-4" />
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex gap-1">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
        </div>
      ))}
    </div>
  );
}
