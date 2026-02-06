'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

const LIKELIHOOD_LABELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const IMPACT_LABELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 16) return { label: 'Critical', color: 'text-red-600 dark:text-red-400' };
  if (score >= 10) return { label: 'High', color: 'text-orange-600 dark:text-orange-400' };
  if (score >= 5) return { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
  return { label: 'Low', color: 'text-green-600 dark:text-green-400' };
}

interface HoverInfo {
  likelihood: number;
  impact: number;
  count: number;
  clientX: number;
  clientY: number;
}

interface RiskHeatmapEnhancedProps {
  data: RiskHeatmapData | null;
  isLoading?: boolean;
  /** When true, renders without Card wrapper (for embedding inside another Card) */
  compact?: boolean;
  onSelectRiskForTrajectory?: (riskId: string) => void;
}

export function RiskHeatmapEnhanced({
  data,
  isLoading,
  compact,
  onSelectRiskForTrajectory,
}: RiskHeatmapEnhancedProps) {
  const [selectedCell, setSelectedCell] = useState<{
    likelihood: number;
    impact: number;
  } | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (isLoading) {
    const skeleton = (
      <div className="grid gap-0.5 sm:gap-1 min-w-0 w-full" style={{ gridTemplateColumns: 'minmax(16px, max-content) repeat(5, minmax(0, 1fr))' }}>
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="contents">
            <Skeleton className="h-6 sm:h-8 w-4 sm:w-12" />
            {Array(5).fill(0).map((_, j) => (
              <Skeleton key={j} className="aspect-square rounded sm:rounded-md" />
            ))}
          </div>
        ))}
      </div>
    );
    if (compact) return skeleton;
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6">{skeleton}</CardContent>
      </Card>
    );
  }

  if (!data) {
    const empty = <p className="text-sm text-muted-foreground">No risk data</p>;
    if (compact) return empty;
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent>{empty}</CardContent>
      </Card>
    );
  }

  const reversed = [...data.heatmap].reverse();

  const handleCellClick = (likelihoodIndex: number, impactIndex: number, count: number) => {
    if (count === 0) return;
    const likelihood = 5 - likelihoodIndex;
    const impact = impactIndex + 1;
    setSelectedCell({ likelihood, impact });
  };

  const handleCellHover = (
    e: React.MouseEvent,
    likelihoodIndex: number,
    impactIndex: number,
    count: number
  ) => {
    setHoverInfo({
      likelihood: 5 - likelihoodIndex,
      impact: impactIndex + 1,
      count,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const heatmapGrid = (
    <div ref={containerRef} className="relative min-w-0 w-full overflow-hidden">
      <div
        className="grid gap-0.5 sm:gap-1 min-w-0 w-full"
        style={{ gridTemplateColumns: 'minmax(16px, max-content) repeat(5, minmax(0, 1fr))' }}
      >
        {/* Header row */}
        <div className="text-[10px] sm:text-xs text-muted-foreground text-right pr-0.5 sm:pr-1 self-end">
          Likelihood &uarr;
        </div>
        <div className="col-span-5 text-center text-[10px] sm:text-xs text-muted-foreground font-medium self-end">
          Impact &rarr;
        </div>

        {/* Data rows */}
        {reversed.map((row, i) => (
          <div key={i} className="contents">
            <div className="text-[10px] sm:text-xs text-muted-foreground text-right pr-0.5 sm:pr-1 self-center leading-none">
              <span className="font-medium">{5 - i}</span>
              <span className="text-[9px] sm:text-[11px] ml-0.5 hidden md:inline">
                {LIKELIHOOD_LABELS[4 - i]}
              </span>
            </div>
            {row.map((count, j) => (
              <button
                key={j}
                onClick={() => handleCellClick(i, j, count)}
                onMouseEnter={(e) => handleCellHover(e, i, j, count)}
                onMouseMove={(e) => handleCellHover(e, i, j, count)}
                onMouseLeave={() => setHoverInfo(null)}
                disabled={count === 0}
                className={`aspect-square min-w-0 ${BG_COLORS[i][j]} rounded sm:rounded-md flex items-center justify-center text-white text-[10px] sm:text-sm font-bold shadow-sm transition-all duration-150 ${
                  count > 0
                    ? 'hover:ring-2 hover:ring-white/60 hover:shadow-md cursor-pointer hover:z-10'
                    : 'cursor-default opacity-70'
                }`}
              >
                {count > 0 && count}
              </button>
            ))}
          </div>
        ))}

        {/* X-axis labels */}
        <div />
        {IMPACT_LABELS.map((label, n) => (
          <div key={n} className="text-center text-[10px] sm:text-xs text-muted-foreground leading-tight min-w-0">
            <div className="font-medium">{n + 1}</div>
            <div className="text-[9px] sm:text-[10px] hidden sm:block truncate">{label}</div>
          </div>
        ))}
      </div>

      {/* Hover tooltip — portalled to body to escape parent CSS transforms from dnd-kit */}
      {mounted && hoverInfo && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: hoverInfo.clientX + 16,
            top: hoverInfo.clientY + 16,
          }}
        >
          <div className="bg-gray-900 dark:bg-gray-800 text-white border border-gray-700 rounded-lg shadow-xl p-3 text-xs min-w-[200px]">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="font-semibold text-sm">
                L{hoverInfo.likelihood} × I{hoverInfo.impact}
              </span>
              <span className={`font-bold text-sm ${getRiskLevel(hoverInfo.likelihood * hoverInfo.impact).color}`}>
                Score: {hoverInfo.likelihood * hoverInfo.impact}
              </span>
            </div>
            <div className="space-y-0.5 text-gray-300">
              <div>Likelihood: <span className="text-white">{LIKELIHOOD_LABELS[hoverInfo.likelihood - 1]}</span></div>
              <div>Impact: <span className="text-white">{IMPACT_LABELS[hoverInfo.impact - 1]}</span></div>
              <div>
                Level:{' '}
                <span className={`font-medium ${getRiskLevel(hoverInfo.likelihood * hoverInfo.impact).color}`}>
                  {getRiskLevel(hoverInfo.likelihood * hoverInfo.impact).label}
                </span>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-gray-600 font-medium text-white">
              {hoverInfo.count} risk{hoverInfo.count !== 1 ? 's' : ''} in this cell
              {hoverInfo.count > 0 && (
                <span className="text-gray-400 font-normal"> — click to view</span>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );

  const drilldownModal = (
    <RiskHeatmapDrilldownModal
      open={selectedCell !== null}
      onOpenChange={(open) => !open && setSelectedCell(null)}
      likelihood={selectedCell?.likelihood || 1}
      impact={selectedCell?.impact || 1}
      onViewTrajectory={onSelectRiskForTrajectory}
    />
  );

  if (compact) {
    return (
      <>
        <p className="text-xs text-muted-foreground mb-2">Hover for details, click to drill down</p>
        {heatmapGrid}
        {drilldownModal}
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Risk Heatmap</CardTitle>
            <span className="text-xs text-muted-foreground">
              {data.totalRisks} total risk{data.totalRisks !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Hover for details, click to drill down</p>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {heatmapGrid}
        </CardContent>
      </Card>
      {drilldownModal}
    </>
  );
}
