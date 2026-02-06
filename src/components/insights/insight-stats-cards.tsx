'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, CheckCircle, Bell } from 'lucide-react';

type InsightPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

interface Insight {
  id: string;
  priority: InsightPriority;
  isAcknowledged: boolean;
  acknowledgedAt?: string | null;
}

interface Anomaly {
  id: string;
}

interface InsightStatsCardsProps {
  insights: Insight[];
  anomalies: Anomaly[];
}

export function InsightStatsCards({ insights, anomalies }: InsightStatsCardsProps) {
  const criticalCount = insights.filter(
    (i) => !i.isAcknowledged && i.priority === 'CRITICAL'
  ).length;

  const acknowledgedToday = insights.filter((i) => {
    if (!i.acknowledgedAt) return false;
    const acknowledgedDate = new Date(i.acknowledgedAt);
    const today = new Date();
    return acknowledgedDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold">{insights.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Critical
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-2xl font-bold">{criticalCount}</span>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                Action Required
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Acknowledged Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold">{acknowledgedToday}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Anomalies Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-2xl font-bold">{anomalies.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
