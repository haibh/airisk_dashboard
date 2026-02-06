'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PercentileChart } from './percentile-chart';
import { TrendComparisonLineChart } from './trend-comparison-line-chart';
import { PeerComparisonWidget } from './peer-comparison-widget';
import { Skeleton } from '@/components/ui/skeleton';

interface BenchmarkResult {
  metric: string;
  metricLabel: string;
  p25: number;
  p50: number;
  p75: number;
  yourScore: number;
  count: number;
}

interface TrendData {
  month: string;
  yourScore: number;
  industryMedian: number;
}

const METRICS = [
  { value: 'overallRiskScore', label: 'Overall Risk Score' },
  { value: 'complianceScore', label: 'Compliance Score' },
  { value: 'controlEffectiveness', label: 'Control Effectiveness' },
  { value: 'incidentRate', label: 'Incident Rate' },
  { value: 'responseTime', label: 'Response Time' },
];

const INDUSTRIES = [
  { value: 'all', label: 'All Industries' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
];

const ORG_SIZES = [
  { value: 'all', label: 'All Sizes' },
  { value: 'small', label: 'Small (1-100)' },
  { value: 'medium', label: 'Medium (101-1000)' },
  { value: 'large', label: 'Large (1001-10000)' },
  { value: 'enterprise', label: 'Enterprise (10000+)' },
];

export function BenchmarkingDashboardPage() {
  const [selectedMetric, setSelectedMetric] = useState('overallRiskScore');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedOrgSize, setSelectedOrgSize] = useState('all');

  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [resultsRes, trendsRes] = await Promise.all([
        fetch(
          `/api/benchmarking/results?metric=${selectedMetric}&industry=${selectedIndustry}&orgSize=${selectedOrgSize}`
        ),
        fetch(`/api/benchmarking/trends?metric=${selectedMetric}&months=12`),
      ]);

      if (!resultsRes.ok || !trendsRes.ok) {
        throw new Error('Failed to fetch benchmarking data');
      }

      const resultsData = await resultsRes.json();
      const trendsData = await trendsRes.json();

      setResults(resultsData.results || []);
      setTrends(trendsData.trends || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric, selectedIndustry, selectedOrgSize]);

  // Extract key metrics for summary widget
  const getSummaryMetrics = () => {
    const overallRisk = results.find((r) => r.metric === 'overallRiskScore');
    const compliance = results.find((r) => r.metric === 'complianceScore');
    const controlEffectiveness = results.find((r) => r.metric === 'controlEffectiveness');

    const calculatePercentile = (score: number, p25: number, p50: number, p75: number) => {
      if (score >= p75) return 75 + ((score - p75) / (100 - p75)) * 25;
      if (score >= p50) return 50 + ((score - p50) / (p75 - p50)) * 25;
      if (score >= p25) return 25 + ((score - p25) / (p50 - p25)) * 25;
      return (score / p25) * 25;
    };

    const calculateTrend = (metric: string): 'up' | 'down' | 'stable' => {
      if (trends.length < 2) return 'stable';
      const filtered = trends.filter((t) => t.yourScore !== undefined);
      if (filtered.length < 2) return 'stable';
      const first = filtered[0].yourScore;
      const last = filtered[filtered.length - 1].yourScore;
      const change = last - first;
      if (Math.abs(change) < 1) return 'stable';
      return change > 0 ? 'up' : 'down';
    };

    return {
      overallRisk: overallRisk
        ? {
            label: 'Overall Risk Score',
            yourScore: overallRisk.yourScore,
            industryMedian: overallRisk.p50,
            percentile: Math.round(
              calculatePercentile(
                overallRisk.yourScore,
                overallRisk.p25,
                overallRisk.p50,
                overallRisk.p75
              )
            ),
            trend: calculateTrend('overallRiskScore'),
          }
        : null,
      compliance: compliance
        ? {
            label: 'Compliance Score',
            yourScore: compliance.yourScore,
            industryMedian: compliance.p50,
            percentile: Math.round(
              calculatePercentile(
                compliance.yourScore,
                compliance.p25,
                compliance.p50,
                compliance.p75
              )
            ),
            trend: calculateTrend('complianceScore'),
          }
        : null,
      controlEffectiveness: controlEffectiveness
        ? {
            label: 'Control Effectiveness',
            yourScore: controlEffectiveness.yourScore,
            industryMedian: controlEffectiveness.p50,
            percentile: Math.round(
              calculatePercentile(
                controlEffectiveness.yourScore,
                controlEffectiveness.p25,
                controlEffectiveness.p50,
                controlEffectiveness.p75
              )
            ),
            trend: calculateTrend('controlEffectiveness'),
          }
        : null,
      sampleSize: results[0]?.count || 0,
    };
  };

  const summaryMetrics = getSummaryMetrics();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Peer Benchmarking</h1>
        <p className="text-muted-foreground mt-2">
          Compare your organization&apos;s risk management performance against industry peers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Organization Size</label>
              <Select value={selectedOrgSize} onValueChange={setSelectedOrgSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORG_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchData} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error loading benchmarking data</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={fetchData} variant="outline" className="ml-auto">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Summary Widget */}
          {summaryMetrics.overallRisk &&
            summaryMetrics.compliance &&
            summaryMetrics.controlEffectiveness && (
              <PeerComparisonWidget
                overallRisk={summaryMetrics.overallRisk}
                compliance={summaryMetrics.compliance}
                controlEffectiveness={summaryMetrics.controlEffectiveness}
                sampleSize={summaryMetrics.sampleSize}
              />
            )}

          {/* Percentile Chart */}
          {results.length > 0 && <PercentileChart data={results} />}

          {/* Trend Chart */}
          {trends.length > 0 && (
            <TrendComparisonLineChart
              data={trends}
              title={`${METRICS.find((m) => m.value === selectedMetric)?.label} - Trends`}
            />
          )}
        </div>
      )}
    </div>
  );
}
