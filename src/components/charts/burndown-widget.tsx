'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { BurndownSprintChart } from './burndown-sprint-chart';
import { VelocityBarChart } from './velocity-bar-chart';
import { cn } from '@/lib/utils';

interface BurndownDataPoint {
  date: string;
  remaining: number;
  completed: number;
  ideal: number;
}

interface VelocityDataPoint {
  week: string;
  tasksCompleted: number;
  averageCompletionTime: number;
}

interface BurndownWidgetProps {
  assessmentId?: string;
  className?: string;
}

type TabType = 'burndown' | 'velocity';
type DateRange = 30 | 60 | 90;

export function BurndownWidget({ assessmentId, className }: BurndownWidgetProps) {
  const [activeTab, setActiveTab] = useState<TabType>('burndown');
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [selectedAssessment, setSelectedAssessment] = useState(assessmentId || '');
  const [burndownData, setBurndownData] = useState<BurndownDataPoint[]>([]);
  const [velocityData, setVelocityData] = useState<VelocityDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch burndown data
  const fetchBurndownData = async () => {
    if (!selectedAssessment) return;

    setLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const response = await fetch(
        `/api/remediation/burndown?assessmentId=${selectedAssessment}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch burndown data');
      }

      const data = await response.json();
      setBurndownData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch velocity data
  const fetchVelocityData = async () => {
    if (!selectedAssessment) return;

    setLoading(true);
    setError(null);

    try {
      const weeks = Math.ceil(dateRange / 7);
      const response = await fetch(
        `/api/remediation/velocity?assessmentId=${selectedAssessment}&weeks=${weeks}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch velocity data');
      }

      const data = await response.json();
      setVelocityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when assessment or date range changes
  useEffect(() => {
    if (activeTab === 'burndown') {
      fetchBurndownData();
    } else {
      fetchVelocityData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssessment, dateRange, activeTab]);

  // Calculate stats from burndown data
  const stats = React.useMemo(() => {
    if (burndownData.length === 0) {
      return {
        totalTasks: 0,
        completed: 0,
        remaining: 0,
        percentComplete: 0,
        avgVelocity: 0,
      };
    }

    const latest = burndownData[burndownData.length - 1];
    const totalTasks = latest.completed + latest.remaining;
    const percentComplete = totalTasks > 0 ? (latest.completed / totalTasks) * 100 : 0;

    // Calculate average velocity (tasks completed per day)
    const avgVelocity =
      burndownData.length > 1
        ? (burndownData[0].remaining - latest.remaining) / burndownData.length
        : 0;

    return {
      totalTasks,
      completed: latest.completed,
      remaining: latest.remaining,
      percentComplete,
      avgVelocity,
    };
  }, [burndownData]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Remediation Burndown
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* Assessment selector */}
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assessment-1">Q1 2026 Assessment</SelectItem>
                <SelectItem value="assessment-2">Annual Review 2025</SelectItem>
                <SelectItem value="assessment-3">NIST AI RMF Audit</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range filter */}
            <Select
              value={dateRange.toString()}
              onValueChange={(value) => setDateRange(Number(value) as DateRange)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats summary bar */}
        {!loading && !error && selectedAssessment && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Total Tasks
              </div>
              <div className="text-lg font-semibold">{stats.totalTasks}</div>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {stats.completed}
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Remaining
              </div>
              <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {stats.remaining}
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Avg Velocity
              </div>
              <div className="text-lg font-semibold">
                {stats.avgVelocity.toFixed(1)}/d
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Progress
              </div>
              <div className="text-lg font-semibold text-primary">
                {stats.percentComplete.toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Tab toggle */}
        <div className="mb-4 flex gap-2">
          <Badge
            variant={activeTab === 'burndown' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-1.5"
            onClick={() => setActiveTab('burndown')}
          >
            Burndown
          </Badge>
          <Badge
            variant={activeTab === 'velocity' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-1.5"
            onClick={() => setActiveTab('velocity')}
          >
            Velocity
          </Badge>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex h-[350px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex h-[350px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() =>
                  activeTab === 'burndown' ? fetchBurndownData() : fetchVelocityData()
                }
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* No assessment selected */}
        {!loading && !error && !selectedAssessment && (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select an assessment to view burndown data
            </p>
          </div>
        )}

        {/* Chart content */}
        {!loading && !error && selectedAssessment && (
          <>
            {activeTab === 'burndown' && burndownData.length > 0 && (
              <BurndownSprintChart data={burndownData} title="" />
            )}
            {activeTab === 'velocity' && velocityData.length > 0 && (
              <VelocityBarChart data={velocityData} title="" />
            )}
            {activeTab === 'burndown' && burndownData.length === 0 && (
              <div className="flex h-[350px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No burndown data available</p>
              </div>
            )}
            {activeTab === 'velocity' && velocityData.length === 0 && (
              <div className="flex h-[350px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No velocity data available</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
