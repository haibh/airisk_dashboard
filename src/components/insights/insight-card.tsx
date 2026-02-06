'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Eye,
  Shield,
  BarChart3,
  Bell,
} from 'lucide-react';
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

interface InsightCardProps {
  insight: Insight;
  onAcknowledge?: (insightId: string) => void;
}

const priorityConfig: Record<
  InsightPriority,
  { color: string; bgColor: string; label: string }
> = {
  CRITICAL: { color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-950', label: 'Critical' },
  HIGH: { color: 'text-orange-700 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-950', label: 'High' },
  MEDIUM: { color: 'text-yellow-700 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-950', label: 'Medium' },
  LOW: { color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-950', label: 'Low' },
  INFO: { color: 'text-gray-700 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800', label: 'Info' },
};

const templateIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'risk-spike': TrendingUp,
  'compliance-drop': TrendingDown,
  'control-gap': Shield,
  'anomaly-detected': AlertTriangle,
  'performance-alert': BarChart3,
  'notification': Bell,
};

export function InsightCard({ insight, onAcknowledge }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const config = priorityConfig[insight.priority];
  const Icon = templateIcons[insight.templateType] || AlertTriangle;

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const handleAcknowledge = async () => {
    if (!onAcknowledge) return;
    setAcknowledging(true);
    try {
      await onAcknowledge(insight.id);
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        insight.isAcknowledged && 'opacity-60',
        !insight.isAcknowledged && insight.priority === 'CRITICAL' && 'border-red-500 dark:border-red-700',
        !insight.isAcknowledged && insight.priority === 'HIGH' && 'border-orange-500 dark:border-orange-700'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('w-5 h-5', config.color)} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs', config.color, config.bgColor)}>
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(insight.createdAt)}
                </span>
                {insight.isAcknowledged && (
                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acknowledged
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-medium leading-snug">
                {insight.narrative}
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {insight.metrics && Object.keys(insight.metrics).length > 0 && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(insight.metrics).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm font-semibold">{String(value)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {expanded && (
          <div className="text-sm text-muted-foreground space-y-2 pt-2">
            <p><strong>Template:</strong> {insight.templateType}</p>
            <p><strong>Generated:</strong> {new Date(insight.createdAt).toLocaleString()}</p>
            {insight.acknowledgedAt && (
              <p><strong>Acknowledged:</strong> {new Date(insight.acknowledgedAt).toLocaleString()}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {!insight.isAcknowledged && onAcknowledge && (
            <Button
              size="sm"
              variant="default"
              onClick={handleAcknowledge}
              disabled={acknowledging}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {acknowledging ? 'Acknowledging...' : 'Acknowledge'}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {expanded ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
