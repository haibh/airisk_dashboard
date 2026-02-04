'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Briefcase, BarChart3, Activity, Brain } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { ExecutiveBriefView } from '@/components/dashboard/executive-brief-view';
import { DetailedAnalyticsView } from '@/components/dashboard/detailed-analytics-view';
import { OperationsView } from '@/components/dashboard/operations-view';
import { AIRiskViewPanel } from '@/components/dashboard/ai-risk-view-panel';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { stats, heatmapData, frameworks, activities, isLoading, error, refetch } = useDashboardData();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <Tabs defaultValue="executive-brief">
        <TabsList className="internal-tabs-list">
          <TabsTrigger value="executive-brief" className="gap-1.5">
            <Briefcase className="h-4 w-4" />
            {t('tabs.executiveBrief')}
          </TabsTrigger>
          <TabsTrigger value="detailed-analytics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {t('tabs.detailedAnalytics')}
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-1.5">
            <Activity className="h-4 w-4" />
            {t('tabs.operations')}
          </TabsTrigger>
          <TabsTrigger value="ai-risk" className="gap-1.5">
            <Brain className="h-4 w-4" />
            {t('tabs.aiRisk')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive-brief">
          <ExecutiveBriefView
            stats={stats}
            heatmapData={heatmapData}
            frameworks={frameworks}
            activities={activities}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="detailed-analytics">
          <DetailedAnalyticsView
            stats={stats}
            heatmapData={heatmapData}
            frameworks={frameworks}
            activities={activities}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="operations">
          <OperationsView
            stats={stats}
            heatmapData={heatmapData}
            frameworks={frameworks}
            activities={activities}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="ai-risk">
          <AIRiskViewPanel
            frameworks={frameworks}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
