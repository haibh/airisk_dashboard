'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
          <CardTitle className="text-sm font-medium">Framework Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data</p>
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
          <div key={fw.frameworkId} className="space-y-1">
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
