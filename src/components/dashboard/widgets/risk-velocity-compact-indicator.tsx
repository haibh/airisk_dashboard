'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RiskVelocityIndicatorCompactProps {
  trend: 'improving' | 'worsening' | 'stable';
  changePerDay: number;
  periodDays: number;
  showLabel?: boolean;
}

export function RiskVelocityIndicatorCompact({
  trend,
  changePerDay,
  periodDays,
  showLabel = false,
}: RiskVelocityIndicatorCompactProps) {
  const config = {
    improving: {
      icon: TrendingDown,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Improving',
    },
    worsening: {
      icon: TrendingUp,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Worsening',
    },
    stable: {
      icon: Minus,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      label: 'Stable',
    },
  }[trend];

  const Icon = config.icon;

  const tooltipText =
    periodDays > 0
      ? `${config.label}: Residual score ${changePerDay > 0 ? '+' : ''}${changePerDay.toFixed(2)}/day over ${periodDays} days`
      : 'No trend data available';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}
          >
            <Icon className="h-3 w-3" />
            {showLabel && <span className="text-[10px] font-medium">{config.label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
