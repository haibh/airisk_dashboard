'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatTrend, getTrendDirection } from '@/components/dashboard/dashboard-helpers';
import type { DashboardStats, ComplianceFramework } from '@/types/dashboard';

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Good';
  if (score >= 50) return 'Moderate';
  return 'At Risk';
}

function getRagBadgeColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
  if (percentage >= 40) return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
  return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
}

function TrendBadge({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const direction = getTrendDirection(value, inverse);
  const isPositive = direction === 'up';
  return (
    <span className={`text-[10px] font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {formatTrend(value)}
    </span>
  );
}

interface RiskPulseStripProps {
  stats: DashboardStats | null;
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

export function RiskPulseStrip({ stats, frameworks, isLoading }: RiskPulseStripProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2 min-w-[120px]">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = stats?.complianceScore || 0;
  const highRisks = stats?.highRisks || 0;

  return (
    <Card>
      <CardContent className="pt-5 pb-4 space-y-3">
        {/* KPI Row */}
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-1">
          {/* Overall Score */}
          <div className="flex items-center gap-3 min-w-[140px]">
            <div className={`flex items-center justify-center h-11 w-11 rounded-full ${getScoreBgColor(score)} text-white font-bold text-sm shrink-0`}>
              {score}%
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Overall Score</p>
              <p className={`text-sm font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border shrink-0" />

          {/* AI Systems */}
          <div className="flex items-center gap-2.5 min-w-[100px]">
            <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">AI Systems</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold">{stats?.totalSystems || 0}</span>
                <TrendBadge value={stats?.trends.totalSystems || 0} />
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-border shrink-0" />

          {/* High Risks */}
          <div className="flex items-center gap-2.5 min-w-[100px]">
            <div className="relative shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              {highRisks > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">High Risks</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-lg font-bold ${highRisks > 0 ? 'text-destructive' : ''}`}>{highRisks}</span>
                <TrendBadge value={stats?.trends.highRisks || 0} inverse />
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-border shrink-0" />

          {/* Compliance */}
          <div className="flex items-center gap-2.5 min-w-[100px]">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Compliance</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold">{score}%</span>
                <TrendBadge value={stats?.trends.complianceScore || 0} />
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-border shrink-0" />

          {/* Pending Actions */}
          <div className="flex items-center gap-2.5 min-w-[110px]">
            <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Pending</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold">{stats?.pendingActions || 0}</span>
                <TrendBadge value={stats?.trends.pendingActions || 0} inverse />
              </div>
            </div>
          </div>
        </div>

        {/* Mini Framework RAG Badges */}
        {frameworks.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {frameworks.map((fw) => (
              <Badge
                key={fw.frameworkId}
                variant="outline"
                className={`text-[10px] px-2 py-0.5 font-medium ${getRagBadgeColor(fw.percentage)}`}
              >
                {fw.framework} {fw.percentage}%
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
