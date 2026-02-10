'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { FrameworkDrilldownModal } from './widgets/framework-drilldown-modal';
import type { ComplianceFramework } from '@/types/dashboard';

const ComplianceSpiderChart = dynamic(
  () => import('@/components/dashboard/compliance-spider-chart').then(mod => ({ default: mod.ComplianceSpiderChart })),
  {
    loading: () => (
      <div className="h-[220px] flex items-center justify-center">
        <Skeleton className="h-[160px] w-[160px] rounded-full" />
      </div>
    ),
    ssr: false,
  }
);

function getTrafficLightColor(pct: number): string {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getTrafficLightLabel(pct: number): string {
  if (pct >= 80) return 'On track';
  if (pct >= 40) return 'Attention needed';
  return 'Action required';
}

interface ComplianceStatusCardProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

export function ComplianceStatusCard({ frameworks, isLoading }: ComplianceStatusCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);

  // Hooks must be called before any early returns to satisfy Rules of Hooks
  const sorted = useMemo(
    () => [...frameworks].sort((a, b) => a.percentage - b.percentage),
    [frameworks]
  );
  const avgCompliance = useMemo(
    () => frameworks.length > 0
      ? Math.round(frameworks.reduce((sum, fw) => sum + fw.percentage, 0) / frameworks.length)
      : 0,
    [frameworks]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
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
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No framework data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Compliance Status
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Avg: {avgCompliance}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Traffic-light framework bars */}
        <div className="space-y-2.5">
          {sorted.map((fw) => (
            <button
              key={fw.frameworkId}
              type="button"
              className="w-full text-left space-y-1 rounded-md px-1.5 py-1 -mx-1.5 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => setSelectedFramework(fw)}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium truncate mr-2">{fw.framework}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground">{fw.percentage}%</span>
                  <span className={`text-[10px] ${fw.percentage >= 80 ? 'text-green-600 dark:text-green-400' : fw.percentage >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {getTrafficLightLabel(fw.percentage)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${getTrafficLightColor(fw.percentage)} transition-all duration-500`}
                  style={{ width: `${fw.percentage}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Expandable radar chart */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show Details
              </>
            )}
          </Button>
          {showDetails && (
            <div className="mt-2 pt-3 border-t">
              <ComplianceSpiderChart data={frameworks} />
            </div>
          )}
        </div>
      </CardContent>

      <FrameworkDrilldownModal
        open={selectedFramework !== null}
        onOpenChange={(open) => !open && setSelectedFramework(null)}
        framework={selectedFramework}
      />
    </Card>
  );
}
