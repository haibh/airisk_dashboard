'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ChevronRight, Cpu, AlertTriangle, CheckCircle, Clock, Gauge, PieChart, ListChecks, Bell, Grid3X3, Target, ClipboardList, TrendingUp, Database, TreeDeciduous, BarChart3, Network, Tags, Activity as ActivityIcon, Shield, ShieldCheck, Zap, LayoutGrid } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useDashboardWidgetConfig } from '@/hooks/use-dashboard-widget-config';
import type { Activity, ComplianceFramework } from '@/types/dashboard';

// Simple mode consolidated widgets
import { RiskPulseStrip } from '@/components/dashboard/risk-pulse-strip';
import { UnifiedRiskView } from '@/components/dashboard/unified-risk-view';
import { ComplianceStatusCard } from '@/components/dashboard/compliance-status-card';
import { NextBestActionsCard } from '@/components/dashboard/next-best-actions-card';

// Widget components
import { SortableWidget } from '@/components/dashboard/sortable-widget';
import { DashboardSortableContainer } from '@/components/dashboard/dashboard-sortable-container';
import { DashboardWidgetSettingsPanel } from '@/components/dashboard/dashboard-widget-settings-panel';

// Stat cards
import { StatCard, StatCardSkeleton } from '@/components/dashboard/stat-card';
import { formatTrend, getTrendDirection } from '@/components/dashboard/dashboard-helpers';

// Executive Brief widgets
import { OverallRiskScoreGauge } from '@/components/dashboard/overall-risk-score-gauge';
import { FrameworkRagBadges } from '@/components/dashboard/framework-rag-badges';

// Analytics widgets
import { ComplianceDonutChart } from '@/components/dashboard/compliance-donut-chart';
import { RiskHeatmapEnhanced } from '@/components/dashboard/risk-heatmap-enhanced';
import { TopRisksListCard } from '@/components/dashboard/top-risks-list-card';
import { ActivityFeedCompact } from '@/components/dashboard/activity-feed-compact';
import { FrameworkCoverageBars } from '@/components/dashboard/framework-coverage-bars';

// Operations widgets
import { RiskAlertsPanel } from '@/components/ops-center/risk-alerts-panel';
import { ComplianceRadarPanel } from '@/components/ops-center/compliance-radar-panel';
import { PendingActionsQueue } from '@/components/ops-center/pending-actions-queue';
import { AssessmentProgressPanel } from '@/components/ops-center/assessment-progress-panel';

// AI Risk widgets
import { AIModelRegistry, type AISystemSummary } from '@/components/ai-risk-view/ai-model-registry';
import { FrameworkCoverageTreemap } from '@/components/ai-risk-view/framework-coverage-treemap';
import { CrossFrameworkMappingViz } from '@/components/ai-risk-view/cross-framework-mapping-viz';

// Mock data for empty states
const MOCK_AI_SYSTEMS: AISystemSummary[] = [
  { id: '1', name: 'Customer Service Chatbot', type: 'LLM', riskTier: 'HIGH', lifecycleStatus: 'Production' },
  { id: '2', name: 'Fraud Detection Engine', type: 'ML Model', riskTier: 'CRITICAL', lifecycleStatus: 'Production' },
  { id: '3', name: 'Credit Scoring Model', type: 'ML Model', riskTier: 'HIGH', lifecycleStatus: 'Testing' },
  { id: '4', name: 'Document Classifier', type: 'NLP', riskTier: 'MEDIUM', lifecycleStatus: 'Production' },
  { id: '5', name: 'HR Resume Screener', type: 'ML Model', riskTier: 'HIGH', lifecycleStatus: 'Development' },
  { id: '6', name: 'Claims Processing AI', type: 'ML Model', riskTier: 'MEDIUM', lifecycleStatus: 'Production' },
  { id: '7', name: 'Marketing Content Generator', type: 'LLM', riskTier: 'LOW', lifecycleStatus: 'Pilot' },
  { id: '8', name: 'Sentiment Analysis API', type: 'NLP', riskTier: 'LOW', lifecycleStatus: 'Production' },
];

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', action: 'CREATE', entityType: 'Assessment', description: 'New risk assessment initiated for Fraud Detection Engine', userName: 'John Smith', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '2', action: 'UPDATE', entityType: 'Control', description: 'Control effectiveness updated for NIST AI RMF compliance', userName: 'Sarah Chen', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: '3', action: 'SUBMIT', entityType: 'Evidence', description: 'Evidence uploaded for ISO 42001 certification', userName: 'Mike Johnson', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: '4', action: 'APPROVE', entityType: 'Risk', description: 'Risk mitigation plan approved by Risk Manager', userName: 'Lisa Wang', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: '5', action: 'CREATE', entityType: 'AISystem', description: 'New AI system registered: Marketing Content Generator', userName: 'David Lee', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: '6', action: 'DELETE', entityType: 'AISystem', description: 'Deprecated model removed from registry', userName: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: '7', action: 'UPDATE', entityType: 'Framework', description: 'Framework mapping updated for EU AI Act compliance', userName: 'Emily Brown', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: '8', action: 'SUBMIT', entityType: 'Report', description: 'Quarterly compliance report submitted', userName: 'James Wilson', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
];

const MOCK_FRAMEWORKS: ComplianceFramework[] = [
  { framework: 'NIST AI RMF', frameworkId: 'nist-ai-rmf', frameworkName: 'NIST AI RMF 1.0', percentage: 78, totalControls: 72, mappedControls: 56, avgEffectiveness: 75 },
  { framework: 'ISO 42001', frameworkId: 'iso-42001', frameworkName: 'ISO 42001:2023', percentage: 65, totalControls: 93, mappedControls: 60, avgEffectiveness: 68 },
  { framework: 'EU AI Act', frameworkId: 'eu-ai-act', frameworkName: 'EU AI Act', percentage: 52, totalControls: 85, mappedControls: 44, avgEffectiveness: 55 },
  { framework: 'NIST 800-53', frameworkId: 'nist-800-53', frameworkName: 'NIST 800-53 Rev.5', percentage: 85, totalControls: 323, mappedControls: 274, avgEffectiveness: 82 },
  { framework: 'ISO 27001', frameworkId: 'iso-27001', frameworkName: 'ISO 27001:2022', percentage: 92, totalControls: 93, mappedControls: 86, avgEffectiveness: 88 },
  { framework: 'SOC 2', frameworkId: 'soc-2', frameworkName: 'SOC 2 Type II', percentage: 88, totalControls: 64, mappedControls: 56, avgEffectiveness: 85 },
  { framework: 'OWASP LLM', frameworkId: 'owasp-llm', frameworkName: 'OWASP LLM Top 10', percentage: 45, totalControls: 10, mappedControls: 5, avgEffectiveness: 42 },
  { framework: 'MITRE ATLAS', frameworkId: 'mitre-atlas', frameworkName: 'MITRE ATLAS', percentage: 38, totalControls: 45, mappedControls: 17, avgEffectiveness: 35 },
];

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { stats, heatmapData, frameworks, activities, isLoading, error, refetch } = useDashboardData();

  // Widget configuration
  const {
    viewMode,
    toggleViewMode,
    widgets,
    widgetOrder,
    toggleVisibility,
    toggleMinimize,
    closeWidget,
    resetAll,
    showAll,
    hideAll,
    selectWidget,
    reorderWidgets,
    isVisible,
    isMinimized,
    isSelected,
  } = useDashboardWidgetConfig();

  // AI Systems state
  const [systems, setSystems] = useState<AISystemSummary[]>([]);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchSystems = useCallback(async () => {
    try {
      setSystemsLoading(true);
      const res = await fetch('/api/ai-systems?pageSize=50');
      if (res.ok) {
        const data = await res.json();
        const items = (data.systems || data.items || []).map((s: Record<string, string>) => ({
          id: s.id,
          name: s.name,
          type: s.systemType || s.type,
          riskTier: s.riskTier,
          lifecycleStatus: s.lifecycleStatus,
        }));
        setSystems(items);
        if (items.length > 0 && !selectedId) setSelectedId(items[0].id);
      }
    } catch {
      // Silent fail for secondary fetch
    } finally {
      setSystemsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  // Use mock data when real data is empty
  const displaySystems = useMemo(() => systems.length > 0 ? systems : MOCK_AI_SYSTEMS, [systems]);
  const displayActivities = useMemo(() => activities.length > 0 ? activities : MOCK_ACTIVITIES, [activities]);
  const displayFrameworks = useMemo(() => frameworks.length > 0 ? frameworks : MOCK_FRAMEWORKS, [frameworks]);
  const displayScore = stats?.complianceScore || 72;

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
              onClick={() => refetch()}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aiLoading = isLoading || systemsLoading;

  // Widget icon mapping (simple + advanced)
  const widgetIcons: Record<string, React.ReactNode> = {
    'risk-pulse-strip': <LayoutGrid className="h-4 w-4" />,
    'unified-risk-view': <Shield className="h-4 w-4" />,
    'compliance-status': <ShieldCheck className="h-4 w-4" />,
    'next-best-actions': <Zap className="h-4 w-4" />,
    'stat-cards': <BarChart3 className="h-4 w-4" />,
    'risk-score': <Gauge className="h-4 w-4" />,
    'compliance-overview': <PieChart className="h-4 w-4" />,
    'top-risks': <ListChecks className="h-4 w-4" />,
    'risk-alerts': <Bell className="h-4 w-4" />,
    'risk-heatmap': <Grid3X3 className="h-4 w-4" />,
    'compliance-radar': <Target className="h-4 w-4" />,
    'action-queue': <ClipboardList className="h-4 w-4" />,
    'assessment-progress': <TrendingUp className="h-4 w-4" />,
    'ai-model-registry': <Database className="h-4 w-4" />,
    'framework-treemap': <TreeDeciduous className="h-4 w-4" />,
    'framework-bars': <BarChart3 className="h-4 w-4" />,
    'cross-framework-mapping': <Network className="h-4 w-4" />,
    'framework-rag': <Tags className="h-4 w-4" />,
    'activity-feed': <ActivityIcon className="h-4 w-4" />,
  };

  // Widget title mapping (simple + advanced)
  const widgetTitles: Record<string, string> = {
    'risk-pulse-strip': 'Risk Pulse Strip',
    'unified-risk-view': 'Risk Intelligence',
    'compliance-status': 'Compliance Status',
    'next-best-actions': 'What Needs Attention',
    'stat-cards': 'Statistics Cards',
    'risk-score': 'Overall Risk Score',
    'compliance-overview': 'Compliance Overview',
    'top-risks': 'Top Risks',
    'risk-alerts': 'Risk Alerts',
    'risk-heatmap': 'Risk Heatmap',
    'compliance-radar': 'Compliance Radar',
    'action-queue': 'Action Queue',
    'assessment-progress': 'Assessment Progress',
    'ai-model-registry': 'AI Model Registry',
    'framework-treemap': 'Framework Coverage Treemap',
    'framework-bars': 'Framework Coverage Bars',
    'cross-framework-mapping': 'Cross-Framework Mapping',
    'framework-rag': 'Framework RAG Status',
    'activity-feed': 'Recent Activity',
  };

  // Render widget content by ID
  const renderWidgetContent = (widgetId: string) => {
    switch (widgetId) {
      // Simple mode consolidated widgets
      case 'risk-pulse-strip':
        return <RiskPulseStrip stats={stats} frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'unified-risk-view':
        return <UnifiedRiskView heatmapData={heatmapData} isLoading={isLoading} />;
      case 'compliance-status':
        return <ComplianceStatusCard frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'next-best-actions':
        return (
          <NextBestActionsCard
            stats={stats}
            activities={displayActivities}
            heatmapData={heatmapData}
            frameworks={displayFrameworks}
            isLoading={isLoading}
          />
        );
      // Advanced mode individual widgets
      case 'stat-cards':
        return (
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
        );
      case 'risk-score':
        return <OverallRiskScoreGauge score={displayScore} isLoading={isLoading} />;
      case 'compliance-overview':
        return <ComplianceDonutChart frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'top-risks':
        return <TopRisksListCard heatmapData={heatmapData} isLoading={isLoading} />;
      case 'risk-alerts':
        return <RiskAlertsPanel heatmapData={heatmapData} isLoading={isLoading} />;
      case 'risk-heatmap':
        return <RiskHeatmapEnhanced data={heatmapData} isLoading={isLoading} />;
      case 'compliance-radar':
        return <ComplianceRadarPanel frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'action-queue':
        return <PendingActionsQueue activities={displayActivities} isLoading={isLoading} />;
      case 'assessment-progress':
        return <AssessmentProgressPanel stats={stats} isLoading={isLoading} />;
      case 'ai-model-registry':
        return (
          <AIModelRegistry
            systems={displaySystems}
            selectedId={selectedId || displaySystems[0]?.id || null}
            onSelect={setSelectedId}
            isLoading={aiLoading}
          />
        );
      case 'framework-treemap':
        return <FrameworkCoverageTreemap frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'framework-bars':
        return <FrameworkCoverageBars frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'cross-framework-mapping':
        return <CrossFrameworkMappingViz frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'framework-rag':
        return <FrameworkRagBadges frameworks={displayFrameworks} isLoading={isLoading} />;
      case 'activity-feed':
        return <ActivityFeedCompact activities={displayActivities} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  // Get visible widget IDs in order
  const visibleWidgetIds = widgetOrder.filter((id) => isVisible(id));

  // Widget column spans for responsive grid (1→2→3 cols at sm→md→xl)
  // 'full' = spans all columns, 'half' = 1 col (default)
  const widgetSpans: Record<string, string> = {
    'risk-pulse-strip': 'sm:col-span-2 xl:col-span-3',
    'stat-cards': 'sm:col-span-2 xl:col-span-3',
    'unified-risk-view': 'xl:col-span-2',
    'risk-heatmap': '',
    'compliance-overview': '',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center text-xs font-medium text-muted-foreground mb-2" aria-label="Breadcrumb">
            <span>Overview</span>
            <ChevronRight size={12} className="mx-1" aria-hidden="true" />
            <span className="text-primary font-semibold">Dashboard</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Simple / Advanced toggle */}
          <div className="inline-flex items-center rounded-lg border bg-muted p-0.5 text-xs">
            <button
              onClick={viewMode === 'simple' ? undefined : toggleViewMode}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'simple'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Simple
            </button>
            <button
              onClick={viewMode === 'advanced' ? undefined : toggleViewMode}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'advanced'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Advanced
            </button>
          </div>
          <DashboardWidgetSettingsPanel
            widgets={widgets}
            onToggleVisibility={toggleVisibility}
            onToggleMinimize={toggleMinimize}
            onResetAll={resetAll}
            onShowAll={showAll}
            onHideAll={hideAll}
          />
        </div>
      </div>

      {/* Sortable Widgets Container — responsive grid: 1→2→3 cols */}
      <DashboardSortableContainer
        items={visibleWidgetIds}
        onReorder={reorderWidgets}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-auto">
          {visibleWidgetIds.map((widgetId) => (
            <SortableWidget
              key={widgetId}
              id={widgetId}
              title={widgetTitles[widgetId] || widgetId}
              icon={widgetIcons[widgetId]}
              isSelected={isSelected(widgetId)}
              isMinimized={isMinimized(widgetId)}
              onSelect={() => selectWidget(widgetId)}
              onMinimize={() => toggleMinimize(widgetId)}
              onClose={() => closeWidget(widgetId)}
              className={widgetSpans[widgetId] || ''}
            >
              {renderWidgetContent(widgetId)}
            </SortableWidget>
          ))}
        </div>
      </DashboardSortableContainer>
    </div>
  );
}
