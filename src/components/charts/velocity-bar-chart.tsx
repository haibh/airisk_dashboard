'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VelocityDataPoint {
  week: string;
  tasksCompleted: number;
  averageCompletionTime: number;
}

interface VelocityBarChartProps {
  data: VelocityDataPoint[];
  title?: string;
  className?: string;
}

export function VelocityBarChart({
  data,
  title = 'Team Velocity',
  className,
}: VelocityBarChartProps) {
  // Calculate average velocity
  const avgVelocity =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.tasksCompleted, 0) / data.length
      : 0;

  // Determine bar color based on performance vs average
  const getBarColor = (value: number) => {
    if (value >= avgVelocity) {
      return 'hsl(var(--chart-2))'; // Green for above average
    }
    return 'hsl(var(--chart-1))'; // Orange for below average
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const tasksCompleted = data.tasksCompleted;
    const avgTime = data.averageCompletionTime;
    const performance = tasksCompleted >= avgVelocity ? 'Above' : 'Below';
    const performanceColor =
      tasksCompleted >= avgVelocity
        ? 'text-green-600 dark:text-green-400'
        : 'text-orange-600 dark:text-orange-400';

    return (
      <div className="rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-2 font-semibold">{data.week}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Tasks Completed:</span>
            <span className="font-medium">{tasksCompleted}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Avg Completion Time:</span>
            <span className="font-medium">{avgTime.toFixed(1)}d</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">vs Average:</span>
            <span className={cn('font-medium', performanceColor)}>
              {performance} ({((tasksCompleted / avgVelocity) * 100 - 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            Avg: {avgVelocity.toFixed(1)} tasks/week
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.5}
            />
            <XAxis
              dataKey="week"
              className="text-xs text-muted-foreground"
              stroke="hsl(var(--muted-foreground))"
              opacity={0.5}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              stroke="hsl(var(--muted-foreground))"
              opacity={0.5}
              label={{
                value: 'Tasks Completed',
                angle: -90,
                position: 'insideLeft',
                className: 'text-xs fill-muted-foreground',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              content={() => (
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                    <span>Above Average</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                    <span>Below Average</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-6" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                    <span>Average Velocity</span>
                  </div>
                </div>
              )}
            />
            <ReferenceLine
              y={avgVelocity}
              stroke="hsl(var(--primary))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Avg: ${avgVelocity.toFixed(1)}`,
                position: 'right',
                className: 'text-xs fill-primary font-medium',
              }}
            />
            <Bar dataKey="tasksCompleted" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.tasksCompleted)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
