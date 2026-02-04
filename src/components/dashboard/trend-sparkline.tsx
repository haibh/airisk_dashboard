'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '@/types/dashboard';

/* Generate synthetic trend points from a current value and its trend percentage.
   In production, this would come from a time-series endpoint. */
function generateTrendPoints(currentValue: number, trendPercent: number) {
  const prevValue = currentValue / (1 + trendPercent / 100);
  const steps = 6;
  return Array.from({ length: steps }, (_, i) => ({
    value: Math.round(prevValue + ((currentValue - prevValue) * i) / (steps - 1)),
  }));
}

interface TrendSparklineProps {
  stats: DashboardStats | null;
  isLoading?: boolean;
}

export function TrendSparkline({ stats, isLoading }: TrendSparklineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const sparklines = [
    { label: 'Systems', data: generateTrendPoints(stats.totalSystems, stats.trends.totalSystems), color: 'hsl(var(--primary))' },
    { label: 'High Risks', data: generateTrendPoints(stats.highRisks, stats.trends.highRisks), color: 'hsl(0, 84%, 60%)' },
    { label: 'Compliance', data: generateTrendPoints(stats.complianceScore, stats.trends.complianceScore), color: 'hsl(142, 76%, 36%)' },
    { label: 'Pending', data: generateTrendPoints(stats.pendingActions, stats.trends.pendingActions), color: 'hsl(48, 96%, 53%)' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sparklines.map(({ label, data, color }) => (
            <div key={label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <div className="h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
