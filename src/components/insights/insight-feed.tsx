'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Plus, Filter } from 'lucide-react';
import { InsightCard } from './insight-card';
import { cn } from '@/lib/utils';

type InsightPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

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

interface InsightFeedProps {
  insights: Insight[];
  onAcknowledge?: (insightId: string) => void;
  onRefresh?: () => void;
  onGenerate?: () => void;
}

const priorityOrder: InsightPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

const priorityColors: Record<InsightPriority, string> = {
  CRITICAL: 'border-l-red-500 dark:border-l-red-700',
  HIGH: 'border-l-orange-500 dark:border-l-orange-700',
  MEDIUM: 'border-l-yellow-500 dark:border-l-yellow-700',
  LOW: 'border-l-blue-500 dark:border-l-blue-700',
  INFO: 'border-l-gray-500 dark:border-l-gray-700',
};

export function InsightFeed({
  insights,
  onAcknowledge,
  onRefresh,
  onGenerate,
}: InsightFeedProps) {
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!onRefresh) return;

    const intervalId = setInterval(() => {
      onRefresh();
    }, 300000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [onRefresh]);

  const filteredInsights = showAcknowledged
    ? insights
    : insights.filter((i) => !i.isAcknowledged);

  const groupedInsights = priorityOrder.reduce((acc, priority) => {
    acc[priority] = filteredInsights.filter((i) => i.priority === priority);
    return acc;
  }, {} as Record<InsightPriority, Insight[]>);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerate = async () => {
    if (!onGenerate) return;
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const totalUnacknowledged = insights.filter((i) => !i.isAcknowledged).length;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Insights Feed</h3>
          {totalUnacknowledged > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {totalUnacknowledged} Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAcknowledged(!showAcknowledged)}
          >
            <Filter className="w-4 h-4 mr-1" />
            {showAcknowledged ? 'Hide Acknowledged' : 'Show All'}
          </Button>
          {onRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('w-4 h-4 mr-1', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          )}
          {onGenerate && (
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Plus className="w-4 h-4 mr-1" />
              {isGenerating ? 'Generating...' : 'Generate Insights'}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">No active insights</p>
          <p className="text-sm text-muted-foreground">
            Your systems are running smoothly. New insights will appear here when detected.
          </p>
        </div>
      )}

      {/* Grouped Insights by Priority */}
      {priorityOrder.map((priority) => {
        const priorityInsights = groupedInsights[priority];
        if (priorityInsights.length === 0) return null;

        return (
          <div key={priority} className="space-y-3">
            <div className={cn('border-l-4 pl-4 py-1', priorityColors[priority])}>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide">
                  {priority}
                </h4>
                <Badge variant="outline" className="rounded-full">
                  {priorityInsights.length}
                </Badge>
              </div>
            </div>
            <div className="space-y-3 pl-6">
              {priorityInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAcknowledge={onAcknowledge}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
