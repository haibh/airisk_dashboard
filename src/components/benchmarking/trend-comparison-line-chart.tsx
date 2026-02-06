'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendDataPoint {
  month: string;
  yourScore: number;
  industryMedian: number;
}

interface TrendComparisonLineChartProps {
  data: TrendDataPoint[];
  className?: string;
  title?: string;
}

export function TrendComparisonLineChart({
  data,
  className,
  title = 'Performance Trends vs Industry',
}: TrendComparisonLineChartProps) {
  // Calculate overall trend
  const calculateTrend = () => {
    if (data.length < 2) return null;
    const firstScore = data[0].yourScore;
    const lastScore = data[data.length - 1].yourScore;
    const change = lastScore - firstScore;
    const percentChange = (change / firstScore) * 100;
    return {
      change,
      percentChange,
      isImproving: change > 0,
    };
  };

  const trend = calculateTrend();

  // Calculate average gap
  const avgGap =
    data.reduce((sum, d) => sum + (d.yourScore - d.industryMedian), 0) /
    data.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const yourScore = payload[0].value;
      const industryMedian = payload[1].value;
      const delta = yourScore - industryMedian;

      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Your Score:</span>
              <span className="font-semibold text-primary">
                {yourScore.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Industry Median:</span>
              <span className="font-semibold">{industryMedian.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t mt-2">
              <span className="text-muted-foreground">Difference:</span>
              <span
                className={cn(
                  'font-semibold flex items-center gap-1',
                  delta > 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {delta > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {delta > 0 ? '+' : ''}
                {delta.toFixed(1)}
              </span>
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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track your performance over time compared to industry benchmarks
            </p>
          </div>
          {trend && (
            <div className="text-right">
              <div
                className={cn(
                  'flex items-center gap-1 font-semibold',
                  trend.isImproving ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isImproving ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {trend.percentChange > 0 ? '+' : ''}
                {trend.percentChange.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.length} month trend
              </p>
            </div>
          )}
        </div>
        {avgGap !== 0 && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50">
            <p className="text-sm">
              <span className="font-medium">Average Gap: </span>
              <span
                className={cn(
                  'font-semibold',
                  avgGap > 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {avgGap > 0 ? '+' : ''}
                {avgGap.toFixed(1)} points
              </span>
              <span className="text-muted-foreground">
                {' '}
                {avgGap > 0 ? 'above' : 'below'} industry median
              </span>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
            />

            {/* Your organization line */}
            <Line
              type="monotone"
              dataKey="yourScore"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6 }}
              name="Your Organization"
            />

            {/* Industry median line */}
            <Line
              type="monotone"
              dataKey="industryMedian"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: 'hsl(var(--muted-foreground))' }}
              name="Industry Median"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
