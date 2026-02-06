import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 'stat-card' | 'chart' | 'table' | 'feed' | 'gauge' | 'heatmap';
export type LayoutPreset = 'executive' | 'analyst' | 'auditor';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  component: string;
  colSpan: number; // 1-4 (out of 4 columns)
  rowSpan: number; // 1-2
}

interface DashboardLayoutState {
  activePreset: LayoutPreset;
  widgets: WidgetConfig[];
  setPreset: (preset: LayoutPreset) => void;
  reorderWidgets: (oldIndex: number, newIndex: number) => void;
  resetToDefault: () => void;
}

// Preset configurations
const EXECUTIVE_PRESET: WidgetConfig[] = [
  {
    id: 'exec-stat-1',
    type: 'stat-card',
    title: 'Total AI Systems',
    component: 'TotalSystemsStat',
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 'exec-stat-2',
    type: 'stat-card',
    title: 'Critical Risks',
    component: 'CriticalRisksStat',
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 'exec-stat-3',
    type: 'stat-card',
    title: 'Compliance Score',
    component: 'ComplianceScoreStat',
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 'exec-stat-4',
    type: 'stat-card',
    title: 'Open Assessments',
    component: 'OpenAssessmentsStat',
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 'exec-gauge-1',
    type: 'gauge',
    title: 'Risk Exposure',
    component: 'RiskGauge',
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 'exec-chart-1',
    type: 'chart',
    title: 'Compliance Overview',
    component: 'ComplianceChart',
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 'exec-feed-1',
    type: 'feed',
    title: 'Recent Activity',
    component: 'ActivityFeed',
    colSpan: 4,
    rowSpan: 1,
  },
];

const ANALYST_PRESET: WidgetConfig[] = [
  {
    id: 'analyst-stat-1',
    type: 'stat-card',
    title: 'High Risks',
    component: 'HighRisksStat',
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 'analyst-stat-2',
    type: 'stat-card',
    title: 'Risk Trend',
    component: 'RiskTrendStat',
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 'analyst-heatmap-1',
    type: 'heatmap',
    title: 'Risk Heatmap',
    component: 'RiskHeatmap',
    colSpan: 2,
    rowSpan: 2,
  },
  {
    id: 'analyst-chart-1',
    type: 'chart',
    title: 'Risk Burndown',
    component: 'RiskBurndownChart',
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 'analyst-table-1',
    type: 'table',
    title: 'Risk Register',
    component: 'RiskTable',
    colSpan: 4,
    rowSpan: 2,
  },
  {
    id: 'analyst-chart-2',
    type: 'chart',
    title: 'Risk by Category',
    component: 'RiskCategoryChart',
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 'analyst-chart-3',
    type: 'chart',
    title: 'Control Effectiveness',
    component: 'ControlEffectivenessChart',
    colSpan: 2,
    rowSpan: 1,
  },
];

const AUDITOR_PRESET: WidgetConfig[] = [
  {
    id: 'auditor-chart-1',
    type: 'chart',
    title: 'Compliance Status',
    component: 'ComplianceStatusChart',
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 'auditor-chart-2',
    type: 'chart',
    title: 'Framework Progress',
    component: 'FrameworkProgressChart',
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 'auditor-table-1',
    type: 'table',
    title: 'Audit Log',
    component: 'AuditLogTable',
    colSpan: 4,
    rowSpan: 2,
  },
  {
    id: 'auditor-table-2',
    type: 'table',
    title: 'Evidence Tracker',
    component: 'EvidenceTrackerTable',
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 'auditor-chart-3',
    type: 'chart',
    title: 'Gap Summary',
    component: 'GapSummaryChart',
    colSpan: 2,
    rowSpan: 1,
  },
];

const PRESET_CONFIGS: Record<LayoutPreset, WidgetConfig[]> = {
  executive: EXECUTIVE_PRESET,
  analyst: ANALYST_PRESET,
  auditor: AUDITOR_PRESET,
};

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set, get) => ({
      activePreset: 'executive',
      widgets: EXECUTIVE_PRESET,

      setPreset: (preset: LayoutPreset) => {
        set({
          activePreset: preset,
          widgets: PRESET_CONFIGS[preset],
        });
      },

      reorderWidgets: (oldIndex: number, newIndex: number) => {
        const { widgets } = get();
        const newWidgets = [...widgets];
        const [movedWidget] = newWidgets.splice(oldIndex, 1);
        newWidgets.splice(newIndex, 0, movedWidget);
        set({ widgets: newWidgets });
      },

      resetToDefault: () => {
        const { activePreset } = get();
        set({ widgets: PRESET_CONFIGS[activePreset] });
      },
    }),
    {
      name: 'dashboard-layout-storage',
      version: 1,
    }
  )
);
