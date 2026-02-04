'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Cpu,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';

// Dynamic import for heavy chart component (Recharts)
const ComplianceSpiderChart = dynamic(
  () => import('@/components/dashboard/compliance-spider-chart').then(mod => ({ default: mod.ComplianceSpiderChart })),
  {
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        <Skeleton className="h-[250px] w-[250px] rounded-full" />
      </div>
    ),
    ssr: false,
  }
);

// Types for API responses
interface DashboardStats {
  totalSystems: number;
  highRisks: number;
  complianceScore: number;
  pendingActions: number;
  trends: {
    totalSystems: number;
    highRisks: number;
    complianceScore: number;
    pendingActions: number;
  };
}

interface RiskHeatmapData {
  heatmap: number[][];
  totalRisks: number;
  maxCount: number;
}

interface ComplianceFramework {
  framework: string;
  frameworkId: string;
  frameworkName: string;
  percentage: number;
  totalControls: number;
  mappedControls: number;
  avgEffectiveness: number;
}

interface Activity {
  id: string;
  action: string;
  entityType: string;
  description: string;
  userName: string;
  timestamp: string;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  // State for API data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<RiskHeatmapData | null>(null);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all endpoints in parallel
        const [statsRes, heatmapRes, complianceRes, activityRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/risk-heatmap'),
          fetch('/api/dashboard/compliance'),
          fetch('/api/dashboard/activity'),
        ]);

        // Check for errors
        if (!statsRes.ok || !heatmapRes.ok || !complianceRes.ok || !activityRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        // Parse responses
        const [statsData, heatmapData, complianceData, activityData] = await Promise.all([
          statsRes.json(),
          heatmapRes.json(),
          complianceRes.json(),
          activityRes.json(),
        ]);

        // Update state
        setStats(statsData);
        setHeatmapData(heatmapData);
        setFrameworks(complianceData.frameworks || []);
        setActivities(activityData.activities || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Failed to load dashboard data</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title={t('totalSystems')}
              value={stats?.totalSystems.toString() || '0'}
              change={formatTrend(stats?.trends.totalSystems || 0)}
              trend={getTrendDirection(stats?.trends.totalSystems || 0)}
              icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title={t('highRisks')}
              value={stats?.highRisks.toString() || '0'}
              change={formatTrend(stats?.trends.highRisks || 0)}
              trend={getTrendDirection(stats?.trends.highRisks || 0, true)}
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            />
            <StatCard
              title={t('complianceScore')}
              value={`${stats?.complianceScore || 0}%`}
              change={formatTrend(stats?.trends.complianceScore || 0)}
              trend={getTrendDirection(stats?.trends.complianceScore || 0)}
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
            />
            <StatCard
              title={t('pendingActions')}
              value={stats?.pendingActions.toString() || '0'}
              change={formatTrend(stats?.trends.pendingActions || 0)}
              trend={getTrendDirection(stats?.trends.pendingActions || 0, true)}
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>{t('riskHeatmap')}</CardTitle>
            <CardDescription>5×5 Risk Assessment Matrix</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <HeatmapSkeleton />
            ) : (
              <RiskHeatmap data={heatmapData} />
            )}
          </CardContent>
        </Card>

        {/* Framework Compliance - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('frameworkCompliance')}</CardTitle>
            <CardDescription>Compliance status by framework</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <ComplianceBarSkeleton />
                <ComplianceBarSkeleton />
                <ComplianceBarSkeleton />
                <ComplianceBarSkeleton />
              </div>
            ) : frameworks.length > 0 ? (
              <div className="space-y-4">
                {frameworks.slice(0, 4).map((fw) => (
                  <ComplianceBar
                    key={fw.frameworkId}
                    framework={fw.framework}
                    percentage={fw.percentage}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No compliance data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compliance Spider Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('complianceScore')}</CardTitle>
          <CardDescription>Compliance overview across all frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </div>
          ) : (
            <ComplianceSpiderChart data={frameworks} />
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
          <CardDescription>Latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  action={activity.action}
                  target={activity.description}
                  time={formatTimestamp(activity.timestamp)}
                  status={getActivityStatus(activity.action)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function formatTrend(value: number): string {
  const absValue = Math.abs(value);
  return `${value >= 0 ? '+' : '-'}${absValue.toFixed(1)}%`;
}

function getTrendDirection(value: number, inverse = false): 'up' | 'down' {
  const isPositive = value >= 0;
  return inverse ? (isPositive ? 'down' : 'up') : (isPositive ? 'up' : 'down');
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

function getActivityStatus(action: string): 'success' | 'warning' | 'info' {
  const successActions = ['CREATE', 'APPROVE', 'SUBMIT'];
  const warningActions = ['DELETE'];

  if (successActions.includes(action)) return 'success';
  if (warningActions.includes(action)) return 'warning';
  return 'info';
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span
            className={
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }
          >
            {trend === 'up' ? (
              <TrendingUp className="inline h-3 w-3" />
            ) : (
              <TrendingDown className="inline h-3 w-3" />
            )}{' '}
            {change}
          </span>{' '}
          from last month
        </p>
      </CardContent>
    </Card>
  );
}

// Risk Heatmap Component
function RiskHeatmap({ data }: { data: RiskHeatmapData | null }) {
  if (!data) {
    return <p className="text-sm text-muted-foreground">No risk data available</p>;
  }

  const colorMatrix = [
    ['bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-600', 'bg-red-700'],
    ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-600'],
    ['bg-green-400', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'],
    ['bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500'],
    ['bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-yellow-500'],
  ];

  // Reverse the heatmap data to match display (high likelihood at top)
  const reversedHeatmap = [...data.heatmap].reverse();

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1">
        <div className="w-16 text-xs text-muted-foreground">Likelihood</div>
        <div className="flex-1">
          <div className="text-center text-xs text-muted-foreground mb-1">
            Impact →
          </div>
        </div>
      </div>
      {reversedHeatmap.map((row, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="w-16 text-xs text-muted-foreground text-right pr-2">
            {5 - i}
          </div>
          {row.map((count, j) => (
            <div
              key={j}
              className={`flex-1 aspect-square ${colorMatrix[i][j]} rounded flex items-center justify-center text-white text-xs font-medium`}
            >
              {count > 0 && count}
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-1 mt-2">
        <div className="w-16" />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex-1 text-center text-xs text-muted-foreground">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compliance Bar Component
function ComplianceBar({
  framework,
  percentage,
}: {
  framework: string;
  percentage: number;
}) {
  const getColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    if (pct >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{framework}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({
  action,
  target,
  time,
  status,
}: {
  action: string;
  target: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}) {
  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{action}</p>
        <p className="text-sm text-muted-foreground">{target}</p>
      </div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </div>
  );
}

// Skeleton Components
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 mb-4" />
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex gap-1">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
        </div>
      ))}
    </div>
  );
}

function ComplianceBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-2 w-2 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
