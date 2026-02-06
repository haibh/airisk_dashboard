'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, CheckCircle, Send, FileText, RefreshCw } from 'lucide-react';

const STATUS_COLORS = {
  success: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40',
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
  info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
};

/** Map activity action verb to a contextual Lucide icon */
function getActionIcon(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes('CREATE') || upper.includes('ADD')) return Plus;
  if (upper.includes('UPDATE') || upper.includes('EDIT') || upper.includes('MODIFY')) return Pencil;
  if (upper.includes('DELETE') || upper.includes('REMOVE')) return Trash2;
  if (upper.includes('APPROVE') || upper.includes('COMPLETE')) return CheckCircle;
  if (upper.includes('SUBMIT') || upper.includes('SEND')) return Send;
  if (upper.includes('REVIEW')) return FileText;
  return RefreshCw;
}

interface ActivityItemProps {
  action: string;
  target: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

export function ActivityItem({ action, target, time, status }: ActivityItemProps) {
  const Icon = getActionIcon(action);
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 ${STATUS_COLORS[status]}`}>
        <Icon className="h-3 w-3" />
      </div>
      <div className="flex-1 space-y-0.5 min-w-0">
        <p className="text-sm font-medium leading-none">{action}</p>
        <p className="text-xs text-muted-foreground truncate">{target}</p>
      </div>
      <div className="text-xs text-muted-foreground shrink-0">{time}</div>
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
