/**
 * Compliance Spider/Radar Chart Component
 * Visualizes compliance scores across multiple frameworks in a radar chart
 * This component is dynamically imported to reduce initial bundle size
 */

'use client';

// Standard recharts imports (optimized via next.config.ts)
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ComplianceData {
  framework: string;
  frameworkId: string;
  frameworkName: string;
  percentage: number;
  totalControls: number;
  mappedControls: number;
  avgEffectiveness: number;
}

interface ComplianceSpiderChartProps {
  data: ComplianceData[];
}

export function ComplianceSpiderChart({ data }: ComplianceSpiderChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No compliance data available
      </div>
    );
  }

  // Transform data for the radar chart
  const chartData = data.map(item => ({
    framework: item.framework,
    percentage: item.percentage,
    fullMark: 100,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.3}
          />
          <PolarAngleAxis
            dataKey="framework"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.5}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.3}
            tickFormatter={(value) => `${value}%`}
          />
          <Radar
            name="Compliance"
            dataKey="percentage"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value) => [`${value}%`, 'Compliance']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
