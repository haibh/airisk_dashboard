'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComplianceFramework } from '@/types/dashboard';

function getRagColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500 hover:bg-green-600 text-white';
  if (percentage >= 40) return 'bg-yellow-500 hover:bg-yellow-600 text-white';
  return 'bg-red-500 hover:bg-red-600 text-white';
}

function getRagLabel(percentage: number): string {
  if (percentage >= 80) return 'Green';
  if (percentage >= 40) return 'Amber';
  return 'Red';
}

interface FrameworkRagBadgesProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

export function FrameworkRagBadges({ frameworks, isLoading }: FrameworkRagBadgesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-7 w-28 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (frameworks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Framework Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {frameworks.map((fw) => (
            <Badge
              key={fw.frameworkId}
              className={`${getRagColor(fw.percentage)} text-xs px-3 py-1`}
            >
              {fw.framework} — {fw.percentage}% ({getRagLabel(fw.percentage)})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
