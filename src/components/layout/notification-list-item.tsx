'use client';

import { NotificationType } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Shield,
  UserCog,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationItemProps {
  notification: {
    id: string;
    type: NotificationType;
    title: string;
    body: string | null;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
  };
  onClick?: (notification: NotificationItemProps['notification']) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'INVITE_ACCEPTED':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'ASSESSMENT_STATUS':
      return <Bell className="h-5 w-5 text-blue-500" />;
    case 'RISK_CRITICAL':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'WEBHOOK_FAILED':
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    case 'PASSWORD_CHANGED':
      return <Shield className="h-5 w-5 text-purple-500" />;
    case 'ROLE_CHANGED':
      return <UserCog className="h-5 w-5 text-indigo-500" />;
    case 'SYSTEM_ALERT':
      return <Info className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

export function NotificationListItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left px-4 py-3 hover:bg-accent transition-colors flex gap-3 items-start',
        !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-tight',
              !notification.isRead && 'font-semibold'
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1" />
          )}
        </div>

        {notification.body && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.body}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">{relativeTime}</p>
      </div>
    </button>
  );
}
