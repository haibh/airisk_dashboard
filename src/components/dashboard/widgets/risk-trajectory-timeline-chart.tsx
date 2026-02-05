'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useRiskTrajectoryData } from '@/hooks/use-risk-trajectory-data';
import { RiskVelocityBadge } from './risk-velocity-badge';
import { RiskTrajectoryDateRangePicker } from './risk-trajectory-date-range-picker';
import type { DateRangePreset } from '@/types/dashboard';

interface RiskTrajectoryTimelineChartProps {
  riskId: string | null;
  title?: string;
  height?: number;
}

const RISK_LEVELS = [
  { y: 4, label: 'Low', color: '#22c55e' },
  { y: 9, label: 'Medium', color: '#eab308' },
  { y: 16, label: 'High', color: '#f97316' },
];

export function RiskTrajectoryTimelineChart({
  riskId,
  title = 'Risk Trajectory',
  height = 250,
}: RiskTrajectoryTimelineChartProps) {
  const [preset, setPreset] = useState<DateRangePreset>('30d');

  const { data, isLoading, error } = useRiskTrajectoryData({
    riskId,
    preset,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {error || 'Select a risk to view trajectory'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for Recharts
  const chartData = data.points.map((point) => ({
    date: format(new Date(point.date), 'MMM dd'),
    fullDate: point.date,
    inherent: point.inherentScore,
    residual: point.residualScore,
    target: point.targetScore,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {data.riskTitle ? `${title}: ${data.riskTitle}` : title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <RiskVelocityBadge
              trend={data.velocity.trend}
              changePerDay={data.velocity.residualChange}
              periodDays={data.velocity.periodDays}
            />
            <RiskTrajectoryDateRangePicker value={preset} onChange={setPreset} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            No history data for selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis domain={[0, 25]} tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-popover border rounded-lg p-2 shadow-lg text-xs">
                      <p className="font-medium mb-1">{label}</p>
                      {payload.map((entry) => (
                        <p key={entry.name} style={{ color: entry.color as string }}>
                          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : '-'}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconSize={8} />

              {/* Risk level reference lines */}
              {RISK_LEVELS.map((level) => (
                <ReferenceLine
                  key={level.label}
                  y={level.y}
                  stroke={level.color}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              ))}

              {/* Score lines */}
              <Line
                type="monotone"
                dataKey="inherent"
                name="Inherent"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="residual"
                name="Residual"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
