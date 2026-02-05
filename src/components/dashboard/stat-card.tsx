'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

type StatCardStatus = 'critical' | 'warning' | 'success' | 'neutral';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  /** Optional status indicator — shows colored border on card edge */
  status?: StatCardStatus;
}

/**
 * KPI stat card with optional status indicator border.
 * Status: critical (red), warning (amber), success (green), neutral (none)
 */
export function StatCard({ title, value, change, trend, icon, status = 'neutral' }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Status indicator border — right edge */}
      {status !== 'neutral' && (
        <div
          className={`absolute top-0 right-0 w-1 h-full ${
            status === 'critical' ? 'bg-destructive' :
            status === 'warning' ? 'bg-amber-500' :
            'bg-emerald-500'
          }`}
          aria-hidden="true"
        />
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {/* Trend badge with background pill */}
        <div className="flex items-center gap-1 mt-1">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend === 'up'
                ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950'
                : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change}
          </span>
          <span className="text-xs text-muted-foreground">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}
