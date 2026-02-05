'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskHeatmapDrilldownModal } from './widgets/risk-heatmap-drilldown-modal';
import type { RiskHeatmapData } from '@/types/dashboard';

const BG_COLORS = [
  ['bg-yellow-500/80', 'bg-orange-500/80', 'bg-red-500/80', 'bg-red-600/90', 'bg-red-700/90'],
  ['bg-green-500/80', 'bg-yellow-500/80', 'bg-orange-500/80', 'bg-red-500/80', 'bg-red-600/90'],
  ['bg-green-400/80', 'bg-green-500/80', 'bg-yellow-500/80', 'bg-orange-500/80', 'bg-red-500/80'],
  ['bg-green-300/80', 'bg-green-400/80', 'bg-green-500/80', 'bg-yellow-500/80', 'bg-orange-500/80'],
  ['bg-green-200/80', 'bg-green-300/80', 'bg-green-400/80', 'bg-green-500/80', 'bg-yellow-500/80'],
];

interface RiskHeatmapEnhancedProps {
  data: RiskHeatmapData | null;
  isLoading?: boolean;
  onSelectRiskForTrajectory?: (riskId: string) => void;
}

export function RiskHeatmapEnhanced({
  data,
  isLoading,
  onSelectRiskForTrajectory,
}: RiskHeatmapEnhancedProps) {
  const [selectedCell, setSelectedCell] = useState<{
    likelihood: number;
    impact: number;
  } | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex gap-1.5">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-10 flex-1 rounded-lg" />
                    ))}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No risk data</p>
        </CardContent>
      </Card>
    );
  }

  const reversed = [...data.heatmap].reverse();

  const handleCellClick = (likelihoodIndex: number, impactIndex: number, count: number) => {
    if (count === 0) return;

    // Convert reversed index back to actual likelihood (1-5)
    const likelihood = 5 - likelihoodIndex;
    const impact = impactIndex + 1;

    setSelectedCell({ likelihood, impact });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Risk Heatmap</CardTitle>
          <p className="text-xs text-muted-foreground">Click cell to view risks</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <div className="flex items-end gap-1.5">
              <div className="w-8 text-[10px] text-muted-foreground leading-tight">Likely</div>
              <div className="flex-1 text-center text-[10px] text-muted-foreground">
                Impact &rarr;
              </div>
            </div>
            {reversed.map((row, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-8 text-[10px] text-muted-foreground text-right">{5 - i}</div>
                {row.map((count, j) => (
                  <button
                    key={j}
                    onClick={() => handleCellClick(i, j, count)}
                    disabled={count === 0}
                    className={`flex-1 aspect-square ${BG_COLORS[i][j]} rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-sm transition-all ${
                      count > 0
                        ? 'hover:scale-105 hover:ring-2 hover:ring-white/50 cursor-pointer'
                        : 'cursor-default opacity-80'
                    }`}
                    title={`Likelihood: ${5 - i}, Impact: ${j + 1} — ${count} risk(s)`}
                  >
                    {count > 0 && count}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-8" />
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <RiskHeatmapDrilldownModal
        open={selectedCell !== null}
        onOpenChange={(open) => !open && setSelectedCell(null)}
        likelihood={selectedCell?.likelihood || 1}
        impact={selectedCell?.impact || 1}
        onViewTrajectory={onSelectRiskForTrajectory}
      />
    </>
  );
}
