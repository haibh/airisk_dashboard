'use client';

import { RiskHeatmapEnhanced } from '@/components/dashboard/risk-heatmap-enhanced';
import type { RiskHeatmapData } from '@/types/dashboard';

interface MonitoringHeatmapPanelProps {
  heatmapData: RiskHeatmapData | null;
  isLoading?: boolean;
}

export function MonitoringHeatmapPanel({ heatmapData, isLoading }: MonitoringHeatmapPanelProps) {
  return <RiskHeatmapEnhanced data={heatmapData} isLoading={isLoading} />;
}
