/**
 * Framework Comparison Chart Component
 * Bar chart comparing compliance scores per framework using Recharts
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

interface FrameworkScore {
  id: string;
  name: string;
  shortName: string;
  totalControls: number;
  compliantControls: number;
  partialControls: number;
  nonCompliantControls: number;
  notAssessedControls: number;
  complianceScore: number;
}

interface FrameworkComparisonChartProps {
  frameworks: FrameworkScore[];
}

export function FrameworkComparisonChart({ frameworks }: FrameworkComparisonChartProps) {
  if (frameworks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No framework data available
      </div>
    );
  }

  // Transform data for chart
  const chartData = frameworks.map((fw) => ({
    name: fw.shortName,
    fullName: fw.name,
    score: fw.complianceScore,
    compliant: fw.compliantControls,
    partial: fw.partialControls,
    nonCompliant: fw.nonCompliantControls,
    notAssessed: fw.notAssessedControls,
    total: fw.totalControls,
  }));

  const getBarColor = (score: number) => {
    if (score >= 80) return 'hsl(142, 76%, 36%)'; // green-600
    if (score >= 60) return 'hsl(45, 93%, 47%)'; // yellow-500
    if (score >= 40) return 'hsl(25, 95%, 53%)'; // orange-500
    return 'hsl(0, 84%, 60%)'; // red-500
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{data.fullName}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Compliance Score:</span>
            <span className="font-medium">{data.score}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-600">Compliant:</span>
            <span className="font-medium">{data.compliant}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-yellow-600">Partial:</span>
            <span className="font-medium">{data.partial}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-red-600">Non-Compliant:</span>
            <span className="font-medium">{data.nonCompliant}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Not Assessed:</span>
            <span className="font-medium">{data.notAssessed}</span>
          </div>
          <div className="border-t pt-1 mt-1 flex justify-between gap-4">
            <span className="text-muted-foreground">Total Controls:</span>
            <span className="font-medium">{data.total}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            stroke="hsl(var(--border))"
            label={{
              value: 'Compliance Score (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
