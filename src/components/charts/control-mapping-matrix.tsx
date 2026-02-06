'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Types for the statistics data
interface FrameworkPairStatistic {
  sourceFramework: string;
  targetFramework: string;
  totalMappings: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
}

interface ControlMappingMatrixProps {
  statistics: FrameworkPairStatistic[];
  onCellClick?: (source: string, target: string) => void;
}

interface MatrixCell {
  source: string;
  target: string;
  count: number;
  high: number;
  medium: number;
  low: number;
}

export function ControlMappingMatrix({ statistics, onCellClick }: ControlMappingMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{ source: string; target: string } | null>(null);

  // Extract unique frameworks
  const { sourceFrameworks, targetFrameworks, matrix } = useMemo(() => {
    const sources = new Set<string>();
    const targets = new Set<string>();
    const matrixMap = new Map<string, MatrixCell>();

    statistics.forEach((stat) => {
      sources.add(stat.sourceFramework);
      targets.add(stat.targetFramework);
      const key = `${stat.sourceFramework}::${stat.targetFramework}`;
      matrixMap.set(key, {
        source: stat.sourceFramework,
        target: stat.targetFramework,
        count: stat.totalMappings,
        high: stat.highConfidence,
        medium: stat.mediumConfidence,
        low: stat.lowConfidence,
      });
    });

    return {
      sourceFrameworks: Array.from(sources).sort(),
      targetFrameworks: Array.from(targets).sort(),
      matrix: matrixMap,
    };
  }, [statistics]);

  // Calculate max value for color scaling
  const maxValue = useMemo(() => {
    return Math.max(...statistics.map((s) => s.totalMappings), 1);
  }, [statistics]);

  // Get cell data
  const getCellData = (source: string, target: string): MatrixCell | null => {
    const key = `${source}::${target}`;
    return matrix.get(key) || null;
  };

  // Get background color intensity based on count
  const getCellColor = (count: number): string => {
    if (count === 0) return 'bg-muted/20';

    const intensity = count / maxValue;
    if (intensity > 0.7) return 'bg-primary/80 text-primary-foreground';
    if (intensity > 0.4) return 'bg-primary/50 text-foreground';
    if (intensity > 0.2) return 'bg-primary/30 text-foreground';
    return 'bg-primary/15 text-foreground';
  };

  // Handle cell click
  const handleCellClick = (source: string, target: string, count: number) => {
    if (count > 0 && onCellClick) {
      onCellClick(source, target);
    }
  };

  if (!statistics.length) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        No mapping statistics available
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <div className="inline-block min-w-full">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-card border border-border p-2 min-w-[140px]">
                <div className="text-xs font-semibold text-muted-foreground">Source → Target</div>
              </th>
              {targetFrameworks.map((target) => (
                <th
                  key={target}
                  className="border border-border p-2 min-w-[100px] bg-muted/30"
                >
                  <div className="text-xs font-semibold text-center transform -rotate-45 origin-center whitespace-nowrap">
                    {target}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sourceFrameworks.map((source) => (
              <tr key={source}>
                <td className="sticky left-0 z-10 bg-card border border-border p-2 font-medium text-sm">
                  {source}
                </td>
                {targetFrameworks.map((target) => {
                  const cellData = getCellData(source, target);
                  const count = cellData?.count || 0;
                  const isHovered =
                    hoveredCell?.source === source && hoveredCell?.target === target;

                  return (
                    <td
                      key={`${source}-${target}`}
                      className={cn(
                        'border border-border p-2 text-center relative transition-all',
                        getCellColor(count),
                        count > 0 && 'cursor-pointer hover:ring-2 hover:ring-primary hover:z-30',
                        isHovered && 'ring-2 ring-primary z-30'
                      )}
                      onMouseEnter={() => setHoveredCell({ source, target })}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => handleCellClick(source, target, count)}
                    >
                      <div className="text-sm font-semibold">
                        {count > 0 ? count : '-'}
                      </div>

                      {/* Tooltip on hover */}
                      {isHovered && cellData && count > 0 && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-40 pointer-events-none">
                          <div className="bg-popover border border-border rounded-lg shadow-xl p-3 min-w-[200px]">
                            <div className="text-xs font-semibold mb-2 text-popover-foreground">
                              {source} → {target}
                            </div>
                            <div className="space-y-1 text-xs text-popover-foreground/90">
                              <div className="flex justify-between">
                                <span>Total mappings:</span>
                                <span className="font-semibold">{cellData.count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                  High:
                                </span>
                                <span>{cellData.high}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--warning))' }} />
                                  Medium:
                                </span>
                                <span>{cellData.medium}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                                  Low:
                                </span>
                                <span>{cellData.low}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <span className="font-semibold text-muted-foreground">Intensity:</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-primary/15 border border-border rounded" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-primary/50 border border-border rounded" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-primary/80 border border-border rounded" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
