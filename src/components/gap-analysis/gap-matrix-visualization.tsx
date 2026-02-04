/**
 * Gap Matrix Visualization Component
 * Displays control mapping matrix between frameworks
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FrameworkScore {
  id: string;
  name: string;
  shortName: string;
}

interface GapMatrixProps {
  frameworks: FrameworkScore[];
  matrix: Record<string, Record<string, 'MAPPED' | 'PARTIAL' | 'UNMAPPED'>>;
}

export function GapMatrixVisualization({ frameworks, matrix }: GapMatrixProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  if (frameworks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No frameworks selected for comparison
      </div>
    );
  }

  const getCellColor = (status: 'MAPPED' | 'PARTIAL' | 'UNMAPPED') => {
    switch (status) {
      case 'MAPPED':
        return 'bg-green-500 hover:bg-green-600';
      case 'PARTIAL':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'UNMAPPED':
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getStatusLabel = (status: 'MAPPED' | 'PARTIAL' | 'UNMAPPED') => {
    switch (status) {
      case 'MAPPED':
        return 'Fully Mapped';
      case 'PARTIAL':
        return 'Partially Mapped';
      case 'UNMAPPED':
        return 'Unmapped';
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500" />
          <span>Mapped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-yellow-500" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-500" />
          <span>Unmapped</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${frameworks.length}, 80px)` }}>
            {/* Header row */}
            <div className="h-20" /> {/* Empty corner cell */}
            {frameworks.map((fw) => (
              <div
                key={`header-${fw.id}`}
                className="flex items-end justify-center pb-2"
              >
                <span className="text-xs font-medium text-center transform -rotate-45 origin-bottom-left whitespace-nowrap">
                  {fw.shortName}
                </span>
              </div>
            ))}

            {/* Data rows */}
            {frameworks.map((sourceFramework) => (
              <>
                {/* Row label */}
                <div
                  key={`label-${sourceFramework.id}`}
                  className="flex items-center justify-end pr-2"
                >
                  <span className="text-sm font-medium text-right">
                    {sourceFramework.shortName}
                  </span>
                </div>

                {/* Cells */}
                {frameworks.map((targetFramework) => {
                  if (sourceFramework.id === targetFramework.id) {
                    return (
                      <div
                        key={`cell-${sourceFramework.id}-${targetFramework.id}`}
                        className="aspect-square bg-muted/50 rounded flex items-center justify-center"
                      >
                        <span className="text-xs text-muted-foreground">—</span>
                      </div>
                    );
                  }

                  const status = matrix[sourceFramework.id]?.[targetFramework.id] || 'UNMAPPED';
                  const cellKey = `${sourceFramework.id}-${targetFramework.id}`;

                  return (
                    <TooltipProvider key={cellKey}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'aspect-square rounded flex items-center justify-center text-white text-xs font-medium transition-colors cursor-pointer',
                              getCellColor(status)
                            )}
                            onClick={() => setExpandedCell(expandedCell === cellKey ? null : cellKey)}
                          >
                            {status === 'MAPPED' && '✓'}
                            {status === 'PARTIAL' && '~'}
                            {status === 'UNMAPPED' && '✗'}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {sourceFramework.shortName} → {targetFramework.shortName}
                            </p>
                            <p className="text-xs">{getStatusLabel(status)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        This matrix shows how controls map between frameworks. Each cell represents the mapping status
        from the row framework to the column framework.
      </p>
    </div>
  );
}
