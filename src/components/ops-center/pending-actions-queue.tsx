'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList } from 'lucide-react';
import type { Activity } from '@/types/dashboard';
import { formatTimestamp } from '@/components/dashboard/dashboard-helpers';

function getPriorityColor(action: string): string {
  if (action === 'DELETE') return 'border-red-500 text-red-500';
  if (action === 'CREATE' || action === 'SUBMIT') return 'border-green-500 text-green-500';
  return 'border-blue-500 text-blue-500';
}

interface PendingActionsQueueProps {
  activities: Activity[];
  isLoading?: boolean;
}

export function PendingActionsQueue({ activities, isLoading }: PendingActionsQueueProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Action Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending actions</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {activities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                </div>
                <Badge variant="outline" className={getPriorityColor(activity.action)}>
                  {activity.action}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
