'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Radar as RadarIcon } from 'lucide-react';
import { useAISystemRiskProfileData } from '@/hooks/use-ai-system-risk-profile-data';

interface AIModelRiskRadarChartProps {
  systemId: string | null;
  systemName?: string;
  showTarget?: boolean;
  targetScores?: Record<string, number>;
  height?: number;
}

function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-500 text-white';
    case 'HIGH':
      return 'bg-orange-500 text-white';
    case 'MEDIUM':
      return 'bg-yellow-500 text-black';
    default:
      return 'bg-green-500 text-white';
  }
}

function getRadarFillColor(level: string): string {
  switch (level) {
    case 'CRITICAL':
      return '#ef4444';
    case 'HIGH':
      return '#f97316';
    case 'MEDIUM':
      return '#eab308';
    default:
      return '#22c55e';
  }
}

export function AIModelRiskRadarChart({
  systemId,
  systemName,
  showTarget = false,
  targetScores = {},
  height = 280,
}: AIModelRiskRadarChartProps) {
  const { data, isLoading, error } = useAISystemRiskProfileData({ systemId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RadarIcon className="h-4 w-4" />
            AI Risk Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {error || 'Select an AI system to view risk profile'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts
  const chartData = data.axes.map((axis) => ({
    axis: axis.axis,
    score: axis.score,
    fullMark: 25,
    riskCount: axis.riskCount,
    target: targetScores[axis.category] ?? 5, // Default target: 5 (Low)
  }));

  const fillColor = getRadarFillColor(data.overallLevel);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RadarIcon className="h-4 w-4" />
            {data.systemName || systemName || 'AI Risk Radar'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getRiskLevelColor(data.overallLevel)}>{data.overallLevel}</Badge>
            <span className="text-xs text-muted-foreground">Score: {data.overallScore}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {data.totalRisks} risks across 6 dimensions
        </p>
      </CardHeader>
      <CardContent>
        {data.totalRisks === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <RadarIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No risks assessed for this system</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a risk assessment to see the radar profile
            </p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={height}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid gridType="polygon" className="stroke-muted" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-foreground"
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 25]}
                  tick={{ fontSize: 9 }}
                  tickCount={6}
                  className="text-muted-foreground"
                />

                {/* Target profile (dashed) */}
                {showTarget && (
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    dot={false}
                  />
                )}

                {/* Current profile (filled) */}
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke={fillColor}
                  strokeWidth={2}
                  fill={fillColor}
                  fillOpacity={0.3}
                  dot={{ r: 4, fill: fillColor }}
                  activeDot={{ r: 6 }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-2 shadow-lg text-xs">
                        <p className="font-medium">{item.axis}</p>
                        <p>
                          Score: <span className="font-bold">{item.score}</span> / 25
                        </p>
                        <p className="text-muted-foreground">
                          {item.riskCount} risk{item.riskCount !== 1 ? 's' : ''}
                        </p>
                        {showTarget && <p className="text-green-600">Target: {item.target}</p>}
                      </div>
                    );
                  }}
                />

                {showTarget && <Legend wrapperStyle={{ fontSize: '11px' }} iconSize={10} />}
              </RadarChart>
            </ResponsiveContainer>

            {/* Axis Legend */}
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              {data.axes.map((axis) => (
                <div
                  key={axis.axis}
                  className="flex items-center justify-between px-2 py-1 rounded bg-muted/50"
                >
                  <span className="font-medium">{axis.axis}</span>
                  <span
                    className={axis.score >= 10 ? 'text-red-600 font-bold' : 'text-muted-foreground'}
                  >
                    {axis.score}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
