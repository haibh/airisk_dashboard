'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCheck } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';

interface AssessmentProgressPanelProps {
  stats: DashboardStats | null;
  isLoading?: boolean;
}

export function AssessmentProgressPanel({ stats, isLoading }: AssessmentProgressPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  const pending = stats?.pendingActions || 0;
  const total = stats?.totalSystems || 0;
  const completed = Math.max(0, total - pending);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const items = [
    { label: 'Completed', value: completed, color: 'bg-green-500' },
    { label: 'In Progress', value: Math.min(pending, Math.ceil(pending / 2)), color: 'bg-yellow-500' },
    { label: 'Pending', value: Math.max(0, pending - Math.ceil(pending / 2)), color: 'bg-muted-foreground' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Assessment Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Overall</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="space-y-2">
          {items.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
