'use client';

import type { DashboardStats, RiskHeatmapData, ComplianceFramework, Activity } from '@/types/dashboard';
import { SystemHealthIndicators } from '@/components/ops-center/system-health-indicators';
import { RiskAlertsPanel } from '@/components/ops-center/risk-alerts-panel';
import { MonitoringHeatmapPanel } from '@/components/ops-center/monitoring-heatmap-panel';
import { ComplianceRadarPanel } from '@/components/ops-center/compliance-radar-panel';
import { PendingActionsQueue } from '@/components/ops-center/pending-actions-queue';
import { AssessmentProgressPanel } from '@/components/ops-center/assessment-progress-panel';

interface OperationsViewProps {
  stats: DashboardStats | null;
  heatmapData: RiskHeatmapData | null;
  frameworks: ComplianceFramework[];
  activities: Activity[];
  isLoading: boolean;
}

export function OperationsView({ stats, heatmapData, frameworks, activities, isLoading }: OperationsViewProps) {
  return (
    <div className="space-y-4 mt-4">
      <SystemHealthIndicators stats={stats} isLoading={isLoading} />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RiskAlertsPanel heatmapData={heatmapData} isLoading={isLoading} />
        <MonitoringHeatmapPanel heatmapData={heatmapData} isLoading={isLoading} />
        <ComplianceRadarPanel frameworks={frameworks} isLoading={isLoading} />
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <PendingActionsQueue activities={activities} isLoading={isLoading} />
        <AssessmentProgressPanel stats={stats} isLoading={isLoading} />
      </div>
    </div>
  );
}
