'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ComplianceFramework } from '@/types/dashboard';

const CHART_COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 76%, 36%)',
  'hsl(48, 96%, 53%)',
  'hsl(25, 95%, 53%)',
  'hsl(0, 84%, 60%)',
  'hsl(271, 76%, 53%)',
  'hsl(191, 91%, 37%)',
  'hsl(340, 82%, 52%)',
];

interface ComplianceDonutChartProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

export function ComplianceDonutChart({ frameworks, isLoading }: ComplianceDonutChartProps) {
  // Hooks must be called before any early returns to satisfy Rules of Hooks
  const avg = useMemo(
    () => frameworks.length > 0
      ? Math.round(frameworks.reduce((sum, fw) => sum + fw.percentage, 0) / frameworks.length)
      : 0,
    [frameworks]
  );

  const chartData = useMemo(
    () => frameworks.map((fw) => ({ name: fw.framework, value: fw.percentage })),
    [frameworks]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-44 w-44 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (frameworks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4 text-muted-foreground">
            <PieChartIcon className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No compliance data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value) => [`${value}%`, 'Compliance']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">{avg}%</span>
            <span className="text-xs text-muted-foreground">Average</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
