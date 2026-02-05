/**
 * Risk Score History Types
 * Used for trajectory visualization and velocity calculations
 */

export type HistorySource =
  | 'MANUAL'
  | 'AUTO_RECALC'
  | 'CONTROL_CHANGE'
  | 'IMPORT'
  | 'INITIAL';

export interface RiskScoreHistoryRecord {
  id: string;
  riskId: string;
  inherentScore: number;
  residualScore: number;
  targetScore: number | null;
  controlEffectiveness: number;
  source: HistorySource;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface RiskTrajectoryData {
  riskId: string;
  riskTitle: string;
  history: RiskScoreHistoryRecord[];
  velocity: RiskVelocity;
}

export interface RiskVelocity {
  inherentChange: number; // Change per day
  residualChange: number; // Change per day
  trend: 'improving' | 'worsening' | 'stable';
  periodDays: number;
}

export interface RiskHistoryFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface RiskTrajectoryPoint {
  date: string;
  inherent: number;
  residual: number;
  target: number | null;
  label?: string;
}

export interface RiskVelocityBadgeProps {
  velocity: RiskVelocity;
  compact?: boolean;
  showPeriod?: boolean;
}

export interface TrajectoryTimelineProps {
  riskId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  showTarget?: boolean;
  height?: number;
}
