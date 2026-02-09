'use client';

import dynamic from 'next/dynamic';
import type { DashboardStats, RiskHeatmapData, ComplianceFramework, Activity } from '@/types/dashboard';
import { TopRisksListCard } from '@/components/dashboard/top-risks-list-card';
import { ActivityFeedCompact } from '@/components/dashboard/activity-feed-compact';
import { FrameworkCoverageBars } from '@/components/dashboard/framework-coverage-bars';

// Dynamic imports for recharts-heavy components to reduce initial bundle
const OverallRiskScoreGauge = dynamic(() => import('@/components/dashboard/overall-risk-score-gauge').then(m => ({ default: m.OverallRiskScoreGauge })), { ssr: false });
const ComplianceDonutChart = dynamic(() => import('@/components/dashboard/compliance-donut-chart').then(m => ({ default: m.ComplianceDonutChart })), { ssr: false });
const RiskHeatmapEnhanced = dynamic(() => import('@/components/dashboard/risk-heatmap-enhanced').then(m => ({ default: m.RiskHeatmapEnhanced })), { ssr: false });
const ControlRiskSankeyDiagramChart = dynamic(() => import('@/components/dashboard/widgets/control-risk-sankey-diagram-chart').then(m => ({ default: m.ControlRiskSankeyDiagramChart })), { ssr: false });

interface DetailedAnalyticsViewProps {
  stats: DashboardStats | null;
  heatmapData: RiskHeatmapData | null;
  frameworks: ComplianceFramework[];
  activities: Activity[];
  isLoading: boolean;
}

export function DetailedAnalyticsView({
  stats,
  heatmapData,
  frameworks,
  activities,
  isLoading,
}: DetailedAnalyticsViewProps) {
  return (
    <div className="mt-4">
      {/* Bento grid layout */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Hero risk gauge — 2 cols, 2 rows */}
        <div className="md:col-span-1 lg:col-span-2 lg:row-span-2">
          <OverallRiskScoreGauge score={stats?.complianceScore || 0} isLoading={isLoading} />
        </div>

        {/* Compliance donut — 1 col */}
        <div className="md:col-span-1 lg:col-span-1">
          <ComplianceDonutChart frameworks={frameworks} isLoading={isLoading} />
        </div>

        {/* Top risks list — 1 col */}
        <div className="md:col-span-1 lg:col-span-1">
          <TopRisksListCard heatmapData={heatmapData} isLoading={isLoading} />
        </div>

        {/* Enhanced heatmap — 2 cols */}
        <div className="md:col-span-1 lg:col-span-2">
          <RiskHeatmapEnhanced data={heatmapData} isLoading={isLoading} />
        </div>

        {/* Framework coverage — 2 cols */}
        <div className="md:col-span-1 lg:col-span-2">
          <FrameworkCoverageBars frameworks={frameworks} isLoading={isLoading} />
        </div>

        {/* Activity feed — 2 cols */}
        <div className="md:col-span-2 lg:col-span-2">
          <ActivityFeedCompact activities={activities} isLoading={isLoading} />
        </div>

        {/* Control-Risk Sankey — 4 cols (full width) */}
        <div className="md:col-span-2 lg:col-span-4">
          <ControlRiskSankeyDiagramChart
            frameworkOptions={frameworks.map((f) => ({
              id: f.frameworkId,
              name: f.framework,
            }))}
            categoryOptions={[
              'BIAS_FAIRNESS',
              'PRIVACY',
              'SECURITY',
              'RELIABILITY',
              'TRANSPARENCY',
              'ACCOUNTABILITY',
              'SAFETY',
              'OTHER',
            ]}
          />
        </div>
      </div>
    </div>
  );
}
