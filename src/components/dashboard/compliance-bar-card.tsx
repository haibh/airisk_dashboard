'use client';

import { Skeleton } from '@/components/ui/skeleton';

function getBarColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-yellow-500';
  if (pct >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function ComplianceBar({ framework, percentage }: { framework: string; percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{framework}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${getBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ComplianceBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}
