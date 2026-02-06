'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ROSIResult {
  rosi: number;
  totalALE: number;
  totalInvestment: number;
  annualSavings: number;
  netBenefit: number;
  paybackPeriodMonths: number;
}

interface ROSIResultCardProps {
  result: ROSIResult;
}

export function ROSIResultCard({ result }: ROSIResultCardProps) {
  const isPositiveROI = result.rosi > 0;
  const rosiColor = isPositiveROI ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
  const badgeVariant = isPositiveROI ? 'default' : 'destructive';
  const StatusIcon = isPositiveROI ? CheckCircle2 : AlertTriangle;

  const metrics = [
    {
      icon: Target,
      label: 'Total ALE',
      value: result.totalALE,
      format: 'currency',
      description: 'Annual Loss Expectancy',
    },
    {
      icon: DollarSign,
      label: 'Total Investment',
      value: result.totalInvestment,
      format: 'currency',
      description: 'Implementation + Maintenance',
    },
    {
      icon: TrendingUp,
      label: 'Annual Savings',
      value: result.annualSavings,
      format: 'currency',
      description: 'Risk reduction value',
    },
    {
      icon: result.netBenefit >= 0 ? TrendingUp : TrendingDown,
      label: 'Net Benefit',
      value: result.netBenefit,
      format: 'currency',
      description: 'Savings minus investment',
    },
    {
      icon: Calendar,
      label: 'Payback Period',
      value: result.paybackPeriodMonths,
      format: 'months',
      description: 'Time to recover investment',
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (format === 'months') {
      if (value === Infinity || value < 0) return 'Never';
      if (value < 1) return '< 1 month';
      const years = Math.floor(value / 12);
      const months = Math.round(value % 12);
      if (years > 0) {
        return months > 0 ? `${years}y ${months}mo` : `${years}y`;
      }
      return `${months} months`;
    }
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ROSI Analysis</span>
          <Badge variant={badgeVariant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {isPositiveROI ? 'Positive ROI' : 'Negative ROI'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Large ROSI Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Return on Security Investment
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-5xl font-bold', rosiColor)}>
              {result.rosi > 0 ? '+' : ''}{result.rosi.toFixed(1)}%
            </span>
            {isPositiveROI ? (
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isPositiveROI
              ? 'Investment generates positive returns'
              : 'Investment may not be cost-effective'}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            const isNegative = metric.value < 0 && metric.format === 'currency';

            return (
              <div
                key={idx}
                className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                </div>
                <p className={cn(
                  'text-2xl font-bold',
                  isNegative && 'text-red-600 dark:text-red-500'
                )}>
                  {formatValue(metric.value, metric.format)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Summary Message */}
        <div className={cn(
          'p-4 rounded-lg border',
          isPositiveROI
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
        )}>
          <p className={cn(
            'text-sm font-medium',
            isPositiveROI ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
          )}>
            {isPositiveROI ? (
              <>
                This security investment is expected to generate ${Math.abs(result.netBenefit).toLocaleString()}
                in net value over one year, with a payback period of {formatValue(result.paybackPeriodMonths, 'months').toLowerCase()}.
              </>
            ) : (
              <>
                This investment may not provide sufficient financial returns. Consider adjusting mitigation
                strategies or exploring alternative controls to improve cost-effectiveness.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
