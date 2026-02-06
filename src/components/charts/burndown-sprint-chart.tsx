'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BurndownDataPoint {
  date: string;
  remaining: number;
  completed: number;
  ideal: number;
}

interface BurndownSprintChartProps {
  data: BurndownDataPoint[];
  title?: string;
  className?: string;
}

export function BurndownSprintChart({
  data,
  title = 'Sprint Burndown',
  className,
}: BurndownSprintChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const actual = data.remaining;
    const ideal = data.ideal;
    const delta = actual - ideal;
    const status = delta > 0 ? 'Behind' : delta < 0 ? 'Ahead' : 'On Track';
    const statusColor =
      delta > 0
        ? 'text-orange-600 dark:text-orange-400'
        : delta < 0
          ? 'text-green-600 dark:text-green-400'
          : 'text-blue-600 dark:text-blue-400';

    return (
      <div className="rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-2 font-semibold">{formatDate(data.date)}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Actual Remaining:</span>
            <span className="font-medium">{actual}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Ideal Remaining:</span>
            <span className="font-medium">{ideal.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Delta:</span>
            <span className={cn('font-medium', statusColor)}>
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)} ({status})
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Completed:</span>
            <span className="font-medium">{data.completed}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs text-muted-foreground"
              stroke="hsl(var(--muted-foreground))"
              opacity={0.5}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              stroke="hsl(var(--muted-foreground))"
              opacity={0.5}
              label={{
                value: 'Tasks Remaining',
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
              iconType="line"
            />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            {/* Ideal burndown line - dashed */}
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Ideal Burndown"
              opacity={0.6}
            />
            {/* Actual remaining - area chart */}
            <Area
              type="monotone"
              dataKey="remaining"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#colorActual)"
              name="Actual Remaining"
              dot={{
                fill: 'hsl(var(--background))',
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--primary))',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
