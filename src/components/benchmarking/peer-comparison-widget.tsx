'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenchmarkMetric {
  label: string;
  yourScore: number;
  industryMedian: number;
  percentile: number;
  trend?: 'up' | 'down' | 'stable';
}

interface PeerComparisonWidgetProps {
  overallRisk: BenchmarkMetric;
  compliance: BenchmarkMetric;
  controlEffectiveness: BenchmarkMetric;
  sampleSize?: number;
  className?: string;
}

export function PeerComparisonWidget({
  overallRisk,
  compliance,
  controlEffectiveness,
  sampleSize = 0,
  className,
}: PeerComparisonWidgetProps) {
  const getPercentileBadgeVariant = (percentile: number) => {
    if (percentile >= 75) return 'default';
    if (percentile >= 50) return 'secondary';
    if (percentile >= 25) return 'outline';
    return 'destructive';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 75) return 'Top Performer';
    if (percentile >= 50) return 'Above Average';
    if (percentile >= 25) return 'Average';
    return 'Below Average';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const renderMetricRow = (metric: BenchmarkMetric) => {
    const delta = metric.yourScore - metric.industryMedian;
    const TrendIcon = getTrendIcon(metric.trend);
    const trendColor = getTrendColor(metric.trend);

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex-1">
          <p className="text-sm font-medium">{metric.label}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold">{metric.yourScore.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className="text-sm text-muted-foreground">
              {metric.industryMedian.toFixed(1)}
            </span>
            {delta !== 0 && (
              <Badge
                variant={delta > 0 ? 'default' : 'destructive'}
                className="text-xs font-medium"
              >
                {delta > 0 ? '+' : ''}
                {delta.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <Badge
              variant={getPercentileBadgeVariant(metric.percentile)}
              className="mb-1"
            >
              {metric.percentile}th
            </Badge>
            <p className="text-xs text-muted-foreground">
              {getPercentileLabel(metric.percentile)}
            </p>
          </div>
          {metric.trend && (
            <TrendIcon className={cn('h-5 w-5', trendColor)} />
          )}
        </div>
      </div>
    );
  };

  // Calculate average percentile
  const avgPercentile = Math.round(
    (overallRisk.percentile + compliance.percentile + controlEffectiveness.percentile) / 3
  );

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Peer Comparison Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your organization vs industry benchmarks
            </p>
          </div>
          {sampleSize > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{sampleSize} peers</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Performance Badge */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Ranking</p>
              <p className="text-2xl font-bold mt-1">
                {avgPercentile}
                <span className="text-base align-super">th</span>
              </p>
            </div>
            <Badge
              variant={getPercentileBadgeVariant(avgPercentile)}
              className="text-base px-4 py-2"
            >
              {getPercentileLabel(avgPercentile)}
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-2">
          {renderMetricRow(overallRisk)}
          {renderMetricRow(compliance)}
          {renderMetricRow(controlEffectiveness)}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Performance Indicators</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">Improving</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-muted-foreground">Declining</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Minus className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Stable</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
