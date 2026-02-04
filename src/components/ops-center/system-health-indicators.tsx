'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';

interface SystemHealthIndicatorsProps {
  stats: DashboardStats | null;
  isLoading?: boolean;
}

export function SystemHealthIndicators({ stats, isLoading }: SystemHealthIndicatorsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const indicators = [
    { label: 'AI Systems', value: stats?.totalSystems || 0, icon: Cpu, color: 'text-primary' },
    { label: 'High Risks', value: stats?.highRisks || 0, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Compliance', value: `${stats?.complianceScore || 0}%`, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Pending', value: stats?.pendingActions || 0, icon: Clock, color: 'text-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {indicators.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-3 flex items-center gap-3">
            <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
            <div>
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
