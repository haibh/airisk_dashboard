'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers } from 'lucide-react';
import { FrameworkDrilldownModal } from './widgets/framework-drilldown-modal';
import type { ComplianceFramework } from '@/types/dashboard';

function getEffectivenessColor(effectiveness: number): string {
  if (effectiveness >= 80) return 'text-green-500';
  if (effectiveness >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getBarColor(pct: number): string {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-yellow-500';
  if (pct >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

interface FrameworkCoverageBarsProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

export function FrameworkCoverageBars({ frameworks, isLoading }: FrameworkCoverageBarsProps) {
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (frameworks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Framework Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4 text-muted-foreground">
            <Layers className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No framework data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Framework Coverage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {frameworks.map((fw) => (
          <button
            key={fw.frameworkId}
            type="button"
            className="w-full text-left space-y-1 rounded-md px-1.5 py-1 -mx-1.5 cursor-pointer hover:bg-muted/60 transition-colors"
            onClick={() => setSelectedFramework(fw)}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{fw.framework}</span>
              <div className="flex items-center gap-2">
                <span className={getEffectivenessColor(fw.avgEffectiveness)}>
                  {fw.avgEffectiveness}% eff.
                </span>
                <span className="text-muted-foreground">
                  {fw.mappedControls}/{fw.totalControls}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(fw.percentage)} transition-all`}
                style={{ width: `${fw.percentage}%` }}
              />
            </div>
          </button>
        ))}
      </CardContent>

      <FrameworkDrilldownModal
        open={selectedFramework !== null}
        onOpenChange={(open) => !open && setSelectedFramework(null)}
        framework={selectedFramework}
      />
    </Card>
  );
}
