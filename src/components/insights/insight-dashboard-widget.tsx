'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { AnomalyAlertBanner } from './anomaly-alert-banner';
import { InsightFeed } from './insight-feed';
import { InsightStatsCards } from './insight-stats-cards';

type InsightPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Insight {
  id: string;
  templateType: string;
  narrative: string;
  priority: InsightPriority;
  metrics?: Record<string, unknown>;
  isAcknowledged: boolean;
  acknowledgedAt?: string | null;
  createdAt: string;
}

interface Anomaly {
  id: string;
  metricName: string;
  description: string;
  severity: AnomalySeverity;
  detectedAt: string;
}

export function InsightDashboardWidget() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [insightsRes, anomaliesRes] = await Promise.all([
        fetch('/api/insights/active'),
        fetch('/api/insights/anomalies'),
      ]);

      if (!insightsRes.ok || !anomaliesRes.ok) {
        throw new Error('Failed to fetch insights data');
      }

      const insightsData = await insightsRes.json();
      const anomaliesData = await anomaliesRes.json();

      setInsights(insightsData.insights || []);
      setAnomalies(anomaliesData.anomalies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      // Refetch data after generation
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    }
  };

  const handleAcknowledge = async (insightId: string) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/acknowledge`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge insight');
      }

      // Optimistically update local state
      setInsights((prev) =>
        prev.map((insight) =>
          insight.id === insightId
            ? { ...insight, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
            : insight
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge insight');
    }
  };

  const scrollToFeed = () => {
    const feedElement = document.getElementById('insights-feed');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error && insights.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Error loading insights: {error}</span>
          <Button size="sm" variant="outline" onClick={fetchData}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Anomaly Banner */}
      <AnomalyAlertBanner anomalies={anomalies} onViewAll={scrollToFeed} />

      {/* Stats Row */}
      <InsightStatsCards insights={insights} anomalies={anomalies} />

      {/* Main Feed */}
      <div id="insights-feed">
        <InsightFeed
          insights={insights}
          onAcknowledge={handleAcknowledge}
          onRefresh={fetchData}
          onGenerate={handleGenerate}
        />
      </div>
    </div>
  );
}
