'use client';

import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RiskVelocityBadgeProps {
  trend: 'improving' | 'worsening' | 'stable';
  changePerDay: number;
  periodDays: number;
  compact?: boolean;
}

export function RiskVelocityBadge({
  trend,
  changePerDay,
  periodDays,
  compact = false,
}: RiskVelocityBadgeProps) {
  const config = {
    improving: {
      icon: TrendingDown,
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800',
      label: 'Improving',
    },
    worsening: {
      icon: TrendingUp,
      className:
        'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-200 dark:border-red-800',
      label: 'Worsening',
    },
    stable: {
      icon: Minus,
      className:
        'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200 border-gray-200 dark:border-gray-700',
      label: 'Stable',
    },
  }[trend];

  const Icon = config.icon;
  const rateText =
    Math.abs(changePerDay) < 0.01
      ? ''
      : ` (${changePerDay > 0 ? '+' : ''}${changePerDay.toFixed(2)}/day)`;

  if (compact) {
    return (
      <Badge variant="outline" className={`gap-1 px-1.5 py-0.5 ${config.className}`}>
        <Icon className="h-3 w-3" />
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      <span>
        {config.label}
        {rateText}
      </span>
      {periodDays > 0 && <span className="text-xs opacity-70">({periodDays}d)</span>}
    </Badge>
  );
}
