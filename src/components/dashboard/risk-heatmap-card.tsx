'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Grid3X3 } from 'lucide-react';
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
    return (
      <div className="flex flex-col items-center py-4 text-muted-foreground">
        <Grid3X3 className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">No risk data available</p>
      </div>
    );
  }

  const reversedHeatmap = [...data.heatmap].reverse();

  return (
    <div className="min-w-0 w-full overflow-hidden">
      {/* Responsive grid: label column + 5 equal cell columns */}
      <div
        className="grid gap-0.5 sm:gap-1 min-w-0 w-full"
        style={{ gridTemplateColumns: 'minmax(12px, max-content) repeat(5, minmax(0, 1fr))' }}
      >
        {/* Header row */}
        <div className="text-[10px] sm:text-xs text-muted-foreground text-right pr-0.5 self-end">
          Likelihood &uarr;
        </div>
        <div className="col-span-5 text-center text-[10px] sm:text-xs text-muted-foreground self-end">
          Impact &rarr;
        </div>

        {/* Data rows */}
        {reversedHeatmap.map((row, i) => (
          <div key={i} className="contents">
            <div className="text-[10px] sm:text-xs text-muted-foreground text-right pr-0.5 sm:pr-1 self-center leading-none">
              {5 - i}
            </div>
            {row.map((count, j) => {
              const isCritical = isCriticalZone(i, j) && count > 0;
              return (
                <div
                  key={j}
                  className={`aspect-square min-w-0 ${COLOR_MATRIX[i][j]} rounded sm:rounded-md flex items-center justify-center text-white text-[10px] sm:text-xs font-medium transition-all ${
                    isCritical
                      ? 'ring-2 ring-destructive ring-offset-1 sm:ring-offset-2 ring-offset-background z-10 scale-105'
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

        {/* X-axis labels */}
        <div />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="text-center text-[10px] sm:text-xs text-muted-foreground min-w-0">
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
