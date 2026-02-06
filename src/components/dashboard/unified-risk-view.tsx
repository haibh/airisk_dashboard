'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Grid3X3, ListChecks, Bell } from 'lucide-react';
import { RiskHeatmapEnhanced } from '@/components/dashboard/risk-heatmap-enhanced';
import { TopRisksListCard } from '@/components/dashboard/top-risks-list-card';
import { RiskAlertsPanel } from '@/components/ops-center/risk-alerts-panel';
import type { RiskHeatmapData } from '@/types/dashboard';

interface UnifiedRiskViewProps {
  heatmapData: RiskHeatmapData | null;
  isLoading?: boolean;
}

function getRiskSummary(heatmapData: RiskHeatmapData | null): { total: number; critical: number } {
  if (!heatmapData) return { total: 0, critical: 0 };

  let critical = 0;
  const heatmap = heatmapData.heatmap;
  // Critical = high likelihood (rows 3-4) AND high impact (cols 3-4) — top-right quadrant
  for (let row = 3; row <= 4; row++) {
    for (let col = 3; col <= 4; col++) {
      if (heatmap[row]?.[col]) critical += heatmap[row][col];
    }
  }

  return { total: heatmapData.totalRisks, critical };
}

export function UnifiedRiskView({ heatmapData, isLoading }: UnifiedRiskViewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const { total, critical } = getRiskSummary(heatmapData);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Risk Intelligence
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{total} total risks</span>
            {critical > 0 && (
              <span className="text-destructive font-medium">{critical} critical</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heatmap" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-8">
            <TabsTrigger value="heatmap" className="text-xs gap-1.5">
              <Grid3X3 className="h-3 w-3" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="category" className="text-xs gap-1.5">
              <ListChecks className="h-3 w-3" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs gap-1.5">
              <Bell className="h-3 w-3" />
              Alerts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="heatmap" className="mt-3">
            <RiskHeatmapEnhanced data={heatmapData} isLoading={false} compact />
          </TabsContent>
          <TabsContent value="category" className="mt-3">
            <TopRisksListCard heatmapData={heatmapData} isLoading={false} />
          </TabsContent>
          <TabsContent value="alerts" className="mt-3">
            <RiskAlertsPanel heatmapData={heatmapData} isLoading={false} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
