'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, AlertTriangle, ShieldAlert, ClipboardList, ChevronRight, CheckCircle } from 'lucide-react';
import type { DashboardStats, Activity, RiskHeatmapData, ComplianceFramework } from '@/types/dashboard';

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  detail: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  href: string;
}

function getUrgencyColor(urgency: ActionItem['urgency']): string {
  switch (urgency) {
    case 'critical': return 'text-red-600 dark:text-red-400';
    case 'high': return 'text-orange-600 dark:text-orange-400';
    case 'medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'low': return 'text-muted-foreground';
  }
}

function getUrgencyDot(urgency: ActionItem['urgency']): string {
  switch (urgency) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-muted-foreground';
  }
}

function buildActionItems(
  stats: DashboardStats | null,
  heatmapData: RiskHeatmapData | null,
  frameworks: ComplianceFramework[],
  activities: Activity[],
): ActionItem[] {
  const items: ActionItem[] = [];

  // Critical/High risks from heatmap
  if (heatmapData) {
    let criticalCount = 0;
    const heatmap = heatmapData.heatmap;
    for (let row = 3; row <= 4; row++) {
      for (let col = 3; col <= 4; col++) {
        if (heatmap[row]?.[col]) criticalCount += heatmap[row][col];
      }
    }
    if (criticalCount > 0) {
      items.push({
        icon: <AlertTriangle className="h-4 w-4" />,
        label: `Review ${criticalCount} critical risk${criticalCount > 1 ? 's' : ''}`,
        detail: 'High likelihood & high impact risks need immediate attention',
        urgency: 'critical',
        href: '/risk-assessment',
      });
    }
  }

  // High risks from stats
  if (stats && stats.highRisks > 0) {
    items.push({
      icon: <ShieldAlert className="h-4 w-4" />,
      label: `${stats.highRisks} high-risk item${stats.highRisks > 1 ? 's' : ''} flagged`,
      detail: 'Review and assign mitigation plans',
      urgency: 'high',
      href: '/risk-assessment',
    });
  }

  // Low compliance frameworks
  const lowFrameworks = frameworks.filter((fw) => fw.percentage < 40);
  const attentionFrameworks = frameworks.filter((fw) => fw.percentage >= 40 && fw.percentage < 80);

  if (lowFrameworks.length > 0) {
    items.push({
      icon: <ShieldAlert className="h-4 w-4" />,
      label: `Improve ${lowFrameworks.length} framework${lowFrameworks.length > 1 ? 's' : ''} coverage`,
      detail: lowFrameworks.map((fw) => `${fw.framework} (${fw.percentage}%)`).join(', '),
      urgency: 'high',
      href: '/frameworks',
    });
  }

  if (attentionFrameworks.length > 0) {
    items.push({
      icon: <ClipboardList className="h-4 w-4" />,
      label: `${attentionFrameworks.length} framework${attentionFrameworks.length > 1 ? 's' : ''} need attention`,
      detail: 'Coverage between 40-80% — map additional controls',
      urgency: 'medium',
      href: '/frameworks',
    });
  }

  // Pending actions
  if (stats && stats.pendingActions > 0) {
    items.push({
      icon: <ClipboardList className="h-4 w-4" />,
      label: `${stats.pendingActions} pending action${stats.pendingActions > 1 ? 's' : ''}`,
      detail: 'Complete outstanding assessment tasks',
      urgency: 'medium',
      href: '/risk-assessment',
    });
  }

  return items.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.urgency] - order[b.urgency];
  });
}

interface NextBestActionsCardProps {
  stats: DashboardStats | null;
  activities: Activity[];
  heatmapData: RiskHeatmapData | null;
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

export function NextBestActionsCard({ stats, activities, heatmapData, frameworks, isLoading }: NextBestActionsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-2 w-full rounded-full" />
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const pending = stats?.pendingActions || 0;
  const total = stats?.totalSystems || 0;
  const completed = Math.max(0, total - pending);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const actionItems = buildActionItems(stats, heatmapData, frameworks, activities);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          What Needs Your Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assessment progress summary */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Assessment Progress</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action items */}
        {actionItems.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mb-2 opacity-40 text-green-500" />
            <p className="text-sm font-medium">All clear!</p>
            <p className="text-xs mt-0.5">No urgent actions needed</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className={`mt-0.5 shrink-0 ${getUrgencyColor(item.urgency)}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${getUrgencyDot(item.urgency)}`} />
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
