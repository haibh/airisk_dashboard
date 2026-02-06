'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Grid3X3, Rows3, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardLayoutStore, LayoutPreset } from '@/stores/dashboard-layout-store';

interface PresetOption {
  id: LayoutPreset;
  icon: React.ReactNode;
  name: string;
  description: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'executive',
    icon: <LayoutGrid className="h-4 w-4" />,
    name: 'Executive Overview',
    description: 'High-level KPIs and risk summary',
  },
  {
    id: 'analyst',
    icon: <Grid3X3 className="h-4 w-4" />,
    name: 'Risk Analyst',
    description: 'Detailed risk analysis and trends',
  },
  {
    id: 'auditor',
    icon: <Rows3 className="h-4 w-4" />,
    name: 'Compliance Auditor',
    description: 'Framework compliance and evidence tracking',
  },
];

interface LayoutPresetSelectorProps {
  className?: string;
}

export function LayoutPresetSelector({ className }: LayoutPresetSelectorProps) {
  const { activePreset, setPreset } = useDashboardLayoutStore();

  const currentPresetOption = PRESET_OPTIONS.find((p) => p.id === activePreset);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('min-w-[200px] justify-between', className)}
        >
          <div className="flex items-center gap-2">
            {currentPresetOption?.icon}
            <span className="font-medium">{currentPresetOption?.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        {PRESET_OPTIONS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => setPreset(preset.id)}
              className={cn(
                'flex items-start gap-3 p-3 cursor-pointer',
                isActive && 'bg-accent'
              )}
            >
              <div className="mt-0.5">{preset.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{preset.name}</span>
                  {isActive && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {preset.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
