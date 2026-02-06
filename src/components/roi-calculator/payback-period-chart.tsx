'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Calendar } from 'lucide-react';

interface PaybackPeriodChartProps {
  implementationCost: number;
  annualMaintenance: number;
  annualSavings: number;
}

export function PaybackPeriodChart({
  implementationCost,
  annualMaintenance,
  annualSavings,
}: PaybackPeriodChartProps) {
  // Generate 36 months of cumulative data
  const generateChartData = () => {
    const data = [];
    let breakEvenMonth = -1;

    for (let month = 0; month <= 36; month++) {
      const years = month / 12;
      const cumulativeCost = implementationCost + annualMaintenance * years;
      const cumulativeSavings = annualSavings * years;

      // Find break-even point
      if (breakEvenMonth === -1 && cumulativeSavings >= cumulativeCost && month > 0) {
        breakEvenMonth = month;
      }

      data.push({
        month,
        cost: Math.round(cumulativeCost),
        savings: Math.round(cumulativeSavings),
        breakEven: breakEvenMonth === month,
      });
    }

    return { data, breakEvenMonth };
  };

  const { data, breakEvenMonth } = generateChartData();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const netValue = data.savings - data.cost;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
        <p className="font-semibold text-sm">Month {data.month}</p>
        <div className="space-y-0.5 text-xs">
          <p className="text-red-600 dark:text-red-400">
            Cost: {formatCurrency(data.cost)}
          </p>
          <p className="text-green-600 dark:text-green-400">
            Savings: {formatCurrency(data.savings)}
          </p>
          <p className={`font-semibold ${netValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            Net: {formatCurrency(Math.abs(netValue))} {netValue >= 0 ? 'profit' : 'deficit'}
          </p>
        </div>
        {data.breakEven && (
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 pt-1 border-t">
            ⚡ Break-even Point
          </p>
        )}
      </div>
    );
  };

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.cost, d.savings))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Payback Period Timeline
        </CardTitle>
        {breakEvenMonth > 0 && (
          <p className="text-sm text-muted-foreground">
            Break-even expected at month {breakEvenMonth} ({(breakEvenMonth / 12).toFixed(1)} years)
          </p>
        )}
        {breakEvenMonth === -1 && annualSavings > 0 && (
          <p className="text-sm text-destructive">
            Investment does not break even within 36 months
          </p>
        )}
        {annualSavings === 0 && (
          <p className="text-sm text-muted-foreground">
            No savings projected - update inputs to see payback analysis
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {/* Break-even line */}
            {breakEvenMonth > 0 && (
              <ReferenceLine
                x={breakEvenMonth}
                stroke="hsl(var(--primary))"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: 'Break-even',
                  position: 'top',
                  fill: 'hsl(var(--primary))',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="cost"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCost)"
              name="Cumulative Cost"
            />
            <Area
              type="monotone"
              dataKey="savings"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSavings)"
              name="Cumulative Savings"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
