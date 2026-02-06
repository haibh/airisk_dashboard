'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PercentileData {
  metric: string;
  metricLabel: string;
  p25: number;
  p50: number;
  p75: number;
  yourScore: number;
  count: number;
}

interface PercentileChartProps {
  data: PercentileData[];
  className?: string;
}

const getZoneColor = (score: number, p25: number, p50: number, p75: number) => {
  if (score < p25) return 'hsl(var(--destructive))';
  if (score < p50) return 'hsl(var(--warning))';
  if (score < p75) return 'hsl(var(--success))';
  return 'hsl(var(--success-dark))';
};

const getPerformanceIndicator = (
  score: number,
  p25: number,
  p50: number,
  p75: number
) => {
  if (score < p25)
    return { label: 'Below Average', icon: TrendingDown, color: 'destructive' };
  if (score < p50)
    return { label: 'Average', icon: Minus, color: 'warning' };
  if (score < p75)
    return { label: 'Above Average', icon: TrendingUp, color: 'success' };
  return { label: 'Top Performer', icon: TrendingUp, color: 'success-dark' };
};

export function PercentileChart({ data, className }: PercentileChartProps) {
  const chartData = data.map((item) => ({
    name: item.metricLabel,
    p25: item.p25,
    p50: item.p50,
    p75: item.p75,
    yourScore: item.yourScore,
    range: item.p75 - item.p25,
    base: item.p25,
    count: item.count,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const performance = getPerformanceIndicator(
        data.yourScore,
        data.p25,
        data.p50,
        data.p75
      );
      const Icon = performance.icon;

      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Your Score:</span>
              <span className="font-semibold">{data.yourScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">75th Percentile:</span>
              <span>{data.p75.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Median (50th):</span>
              <span>{data.p50.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">25th Percentile:</span>
              <span>{data.p25.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Sample Size:</span>
              <span>{data.count} orgs</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t mt-2">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{performance.label}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Peer Benchmarking - Percentile Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare your organization&apos;s performance against industry peers
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="bg-destructive/10">
            <span className="w-3 h-3 rounded-full bg-destructive mr-2" />
            Below 25th
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            25th - 50th
          </Badge>
          <Badge variant="outline" className="bg-green-500/10">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            50th - 75th
          </Badge>
          <Badge variant="outline" className="bg-emerald-600/10">
            <span className="w-3 h-3 rounded-full bg-emerald-600 mr-2" />
            Above 75th
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
            />

            {/* Percentile range bar */}
            <Bar
              dataKey="range"
              stackId="a"
              fill="hsl(var(--muted))"
              opacity={0.3}
              name="25th-75th Range"
            />

            {/* Median line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Industry Median"
              strokeDasharray="5 5"
            />

            {/* Your score */}
            <Line
              type="monotone"
              dataKey="yourScore"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{
                r: 6,
                strokeWidth: 2,
                fill: 'hsl(var(--background))',
              }}
              name="Your Score"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  stroke={getZoneColor(entry.yourScore, entry.p25, entry.p50, entry.p75)}
                />
              ))}
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
