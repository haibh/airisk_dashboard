'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, X } from 'lucide-react';

type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Anomaly {
  id: string;
  metricName: string;
  description: string;
  severity: AnomalySeverity;
  detectedAt: string;
}

interface AnomalyAlertBannerProps {
  anomalies: Anomaly[];
  onViewAll?: () => void;
}

export function AnomalyAlertBanner({ anomalies, onViewAll }: AnomalyAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  const criticalAnomalies = anomalies.filter((a) => a.severity === 'CRITICAL');

  useEffect(() => {
    if (criticalAnomalies.length === 0 || dismissed) {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        setAutoHideTimer(null);
      }
      return;
    }

    // Auto-hide after 30 seconds
    const timer = setTimeout(() => {
      setDismissed(true);
    }, 30000);

    setAutoHideTimer(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [criticalAnomalies.length, dismissed]);

  // Reset dismissed state when new critical anomalies arrive
  useEffect(() => {
    if (criticalAnomalies.length > 0 && dismissed) {
      setDismissed(false);
    }
  }, [criticalAnomalies.length]);

  if (criticalAnomalies.length === 0 || dismissed) {
    return null;
  }

  const firstAnomaly = criticalAnomalies[0];

  return (
    <Alert variant="destructive" className="relative mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-2 mb-2">
        Critical Anomalies Detected
        <Badge variant="destructive" className="rounded-full">
          {criticalAnomalies.length}
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">
          <strong>{firstAnomaly.metricName}:</strong> {firstAnomaly.description}
        </p>
        {criticalAnomalies.length > 1 && (
          <p className="text-sm text-muted-foreground">
            + {criticalAnomalies.length - 1} more critical {criticalAnomalies.length === 2 ? 'anomaly' : 'anomalies'}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          {onViewAll && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onViewAll}
            >
              <Eye className="w-4 h-4 mr-1" />
              View All
            </Button>
          )}
        </div>
      </AlertDescription>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
