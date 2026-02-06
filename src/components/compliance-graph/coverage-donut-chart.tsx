'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CoverageData {
  complete: number;
  partial: number;
  missing: number;
  percentage: number;
  frameworkName?: string;
}

interface CoverageDonutChartProps {
  coverage: CoverageData | CoverageData[];
  className?: string;
}

const COLORS = {
  COMPLETE: 'hsl(142, 76%, 36%)', // green-600
  PARTIAL: 'hsl(48, 96%, 53%)', // yellow-400
  MISSING: 'hsl(0, 84%, 60%)', // red-500
};

function SingleDonut({ data }: { data: CoverageData }) {
  const chartData = [
    { name: 'Complete', value: data.complete, color: COLORS.COMPLETE },
    { name: 'Partial', value: data.partial, color: COLORS.PARTIAL },
    { name: 'Missing', value: data.missing, color: COLORS.MISSING },
  ].filter((item) => item.value > 0);

  const total = data.complete + data.partial + data.missing;

  const renderCustomLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground"
      >
        <tspan x="50%" dy="-0.5em" className="text-3xl font-bold">
          {data.percentage.toFixed(0)}%
        </tspan>
        <tspan x="50%" dy="1.5em" className="text-sm text-muted-foreground">
          Coverage
        </tspan>
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {data.frameworkName && (
        <div className="text-center">
          <h4 className="font-semibold text-sm">{data.frameworkName}</h4>
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0];
                return (
                  <Card className="p-2 shadow-lg">
                    <div className="text-sm">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-muted-foreground">
                        {data.value} ({((Number(data.value) / total) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </Card>
                );
              }
              return null;
            }}
          />
          {renderCustomLabel()}
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.COMPLETE }} />
            <span className="text-xs font-medium">Complete</span>
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {data.complete}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.PARTIAL }} />
            <span className="text-xs font-medium">Partial</span>
          </div>
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {data.partial}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.MISSING }} />
            <span className="text-xs font-medium">Missing</span>
          </div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{data.missing}</div>
        </div>
      </div>
    </div>
  );
}

export function CoverageDonutChart({ coverage, className }: CoverageDonutChartProps) {
  const isMultiple = Array.isArray(coverage);

  if (isMultiple) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
        {coverage.map((data, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <SingleDonut data={data} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <SingleDonut data={coverage} />
    </div>
  );
}
