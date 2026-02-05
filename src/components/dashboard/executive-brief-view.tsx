'use client';

import { Cpu, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { DashboardStats, RiskHeatmapData, ComplianceFramework, Activity } from '@/types/dashboard';
import { formatTrend, getTrendDirection } from '@/components/dashboard/dashboard-helpers';
import { StatCard, StatCardSkeleton } from '@/components/dashboard/stat-card';
import { OverallRiskScoreGauge } from '@/components/dashboard/overall-risk-score-gauge';
import { FrameworkRagBadges } from '@/components/dashboard/framework-rag-badges';
import { TopCriticalRisksCards } from '@/components/dashboard/top-critical-risks-cards';
import { TrendSparkline } from '@/components/dashboard/trend-sparkline';

interface ExecutiveBriefViewProps {
  stats: DashboardStats | null;
  heatmapData: RiskHeatmapData | null;
  frameworks: ComplianceFramework[];
  activities: Activity[];
  isLoading: boolean;
}

export function ExecutiveBriefView({ stats, heatmapData, frameworks, isLoading }: ExecutiveBriefViewProps) {
  return (
    <div className="space-y-6 mt-4">
      {/* Stat cards row */}
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
              title="Total AI Systems"
              value={stats?.totalSystems.toString() || '0'}
              change={formatTrend(stats?.trends.totalSystems || 0)}
              trend={getTrendDirection(stats?.trends.totalSystems || 0)}
              icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
              status="neutral"
            />
            <StatCard
              title="High Risks"
              value={stats?.highRisks.toString() || '0'}
              change={formatTrend(stats?.trends.highRisks || 0)}
              trend={getTrendDirection(stats?.trends.highRisks || 0, true)}
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
              status={(stats?.highRisks || 0) > 0 ? 'critical' : 'success'}
            />
            <StatCard
              title="Compliance Score"
              value={`${stats?.complianceScore || 0}%`}
              change={formatTrend(stats?.trends.complianceScore || 0)}
              trend={getTrendDirection(stats?.trends.complianceScore || 0)}
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              status={(stats?.complianceScore || 0) >= 80 ? 'success' : (stats?.complianceScore || 0) >= 60 ? 'warning' : 'critical'}
            />
            <StatCard
              title="Pending Actions"
              value={stats?.pendingActions.toString() || '0'}
              change={formatTrend(stats?.trends.pendingActions || 0)}
              trend={getTrendDirection(stats?.trends.pendingActions || 0, true)}
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
              status={(stats?.pendingActions || 0) > 10 ? 'warning' : 'neutral'}
            />
          </>
        )}
      </div>

      {/* Hero risk gauge + RAG badges */}
      <div className="grid gap-6 lg:grid-cols-3">
        <OverallRiskScoreGauge score={stats?.complianceScore || 0} isLoading={isLoading} />
        <div className="lg:col-span-2 space-y-4">
          <FrameworkRagBadges frameworks={frameworks} isLoading={isLoading} />
          <TopCriticalRisksCards heatmapData={heatmapData} isLoading={isLoading} />
        </div>
      </div>

      {/* Trend sparklines */}
      <TrendSparkline stats={stats} isLoading={isLoading} />
    </div>
  );
}
