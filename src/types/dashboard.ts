export interface DashboardStats {
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

export interface RiskHeatmapData {
  heatmap: number[][];
  totalRisks: number;
  maxCount: number;
}

export interface ComplianceFramework {
  framework: string;
  frameworkId: string;
  frameworkName: string;
  percentage: number;
  totalControls: number;
  mappedControls: number;
  avgEffectiveness: number;
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  description: string;
  userName: string;
  timestamp: string;
}
