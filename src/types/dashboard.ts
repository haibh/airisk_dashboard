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

// Risk Trajectory Types (for Sprint 1-3 visualization)
export interface RiskTrajectoryPoint {
  date: string;
  inherentScore: number;
  residualScore: number;
  targetScore: number | null;
}

export interface RiskTrajectoryData {
  riskId: string;
  riskTitle: string;
  points: RiskTrajectoryPoint[];
  velocity: {
    inherentChange: number;
    residualChange: number;
    trend: 'improving' | 'worsening' | 'stable';
    periodDays: number;
  };
}

export type DateRangePreset = '7d' | '30d' | '90d' | '1y' | 'custom';

// Control-Risk Sankey Types
export interface ControlRiskFlowNode {
  id: string;
  name: string;
  type: 'control' | 'risk';
}

export interface ControlRiskFlowLink {
  source: string;
  target: string;
  value: number; // effectiveness %
}

export interface ControlRiskFlowData {
  nodes: ControlRiskFlowNode[];
  links: ControlRiskFlowLink[];
}

// Heatmap Drill-down Types
export interface HeatmapCellRisk {
  id: string;
  title: string;
  category: string;
  residualScore: number;
  treatmentStatus: string;
  assessmentTitle: string;
  aiSystemName: string;
}

// Sankey Diagram Types
export interface SankeyNode {
  name: string;
  id: string;
  type: 'control' | 'risk';
  category?: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  controlId: string;
  riskId: string;
  controlName: string;
  riskName: string;
  effectiveness: number;
}

export interface ControlRiskSankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  totalControls: number;
  totalRisks: number;
  avgEffectiveness: number;
}

// AI Model Risk Radar Types
export interface RiskRadarAxis {
  axis: string;
  category: string;
  score: number;
  riskCount: number;
  maxScore: number;
}

export interface AISystemRiskProfile {
  systemId: string;
  systemName: string;
  axes: RiskRadarAxis[];
  overallScore: number;
  overallLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  totalRisks: number;
}

export const RADAR_AXES = [
  { axis: 'Fairness', category: 'BIAS_FAIRNESS' },
  { axis: 'Privacy', category: 'PRIVACY' },
  { axis: 'Security', category: 'SECURITY' },
  { axis: 'Reliability', category: 'RELIABILITY' },
  { axis: 'Robustness', category: 'SAFETY' },
  { axis: 'Transparency', category: 'TRANSPARENCY' },
] as const;
