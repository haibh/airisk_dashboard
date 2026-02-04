'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { RiskHeatmapData } from '@/types/dashboard';

function extractAlerts(heatmap: number[][]) {
  const alerts: { severity: 'critical' | 'high'; likelihood: number; impact: number; count: number }[] = [];

  for (let l = 0; l < 5; l++) {
    for (let i = 0; i < 5; i++) {
      const count = heatmap[l]?.[i] || 0;
      if (count === 0) continue;
      const score = (l + 1) * (i + 1);
      if (score >= 16) alerts.push({ severity: 'critical', likelihood: l + 1, impact: i + 1, count });
      else if (score >= 10) alerts.push({ severity: 'high', likelihood: l + 1, impact: i + 1, count });
    }
  }

  return alerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return (b.likelihood * b.impact) - (a.likelihood * a.impact);
  });
}

interface RiskAlertsPanelProps {
  heatmapData: RiskHeatmapData | null;
  isLoading?: boolean;
}

export function RiskAlertsPanel({ heatmapData, isLoading }: RiskAlertsPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  const alerts = heatmapData ? extractAlerts(heatmapData.heatmap) : [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Risk Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No high/critical risks detected</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border p-2.5">
                {alert.severity === 'critical' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">
                    L{alert.likelihood} × I{alert.impact} = {alert.likelihood * alert.impact}
                  </p>
                  <p className="text-xs text-muted-foreground">{alert.count} risk(s)</p>
                </div>
                <Badge
                  variant="outline"
                  className={alert.severity === 'critical' ? 'border-red-500 text-red-500' : 'border-orange-500 text-orange-500'}
                >
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
