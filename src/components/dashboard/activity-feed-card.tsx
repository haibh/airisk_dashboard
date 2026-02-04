'use client';

import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

interface ActivityItemProps {
  action: string;
  target: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

export function ActivityItem({ action, target, time, status }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{action}</p>
        <p className="text-sm text-muted-foreground">{target}</p>
      </div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-2 w-2 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
