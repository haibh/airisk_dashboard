'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity as ActivityIcon } from 'lucide-react';
import { ActivityItem, ActivityItemSkeleton } from '@/components/dashboard/activity-feed-card';
import { formatTimestamp, getActivityStatus } from '@/components/dashboard/dashboard-helpers';
import type { Activity } from '@/types/dashboard';

interface ActivityFeedCompactProps {
  activities: Activity[];
  isLoading?: boolean;
  maxItems?: number;
}

export function ActivityFeedCompact({ activities, isLoading, maxItems = 5 }: ActivityFeedCompactProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, maxItems).map((activity) => (
              <ActivityItem
                key={activity.id}
                action={activity.action}
                target={activity.description}
                time={formatTimestamp(activity.timestamp)}
                status={getActivityStatus(activity.action)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-muted-foreground">
            <ActivityIcon className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
