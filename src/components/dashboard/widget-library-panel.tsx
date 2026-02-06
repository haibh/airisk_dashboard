'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Table2, Activity, Gauge, Grid3X3, LayoutDashboard, RotateCcw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardLayoutStore, WidgetType } from '@/stores/dashboard-layout-store';

interface WidgetTypeInfo {
  type: WidgetType;
  icon: React.ReactNode;
  name: string;
  description: string;
  presets: string[];
}

const WIDGET_TYPES: WidgetTypeInfo[] = [
  {
    type: 'stat-card',
    icon: <LayoutDashboard className="h-5 w-5" />,
    name: 'Stat Card',
    description: 'Single metric with trend indicator',
    presets: ['Executive', 'Analyst'],
  },
  {
    type: 'chart',
    icon: <BarChart3 className="h-5 w-5" />,
    name: 'Chart',
    description: 'Visual data representation (bar, line, pie)',
    presets: ['Executive', 'Analyst', 'Auditor'],
  },
  {
    type: 'table',
    icon: <Table2 className="h-5 w-5" />,
    name: 'Table',
    description: 'Tabular data with sorting and filtering',
    presets: ['Analyst', 'Auditor'],
  },
  {
    type: 'feed',
    icon: <Activity className="h-5 w-5" />,
    name: 'Activity Feed',
    description: 'Recent events and notifications',
    presets: ['Executive'],
  },
  {
    type: 'gauge',
    icon: <Gauge className="h-5 w-5" />,
    name: 'Gauge',
    description: 'Progress or score visualization',
    presets: ['Executive'],
  },
  {
    type: 'heatmap',
    icon: <Grid3X3 className="h-5 w-5" />,
    name: 'Heatmap',
    description: 'Risk matrix or distribution visualization',
    presets: ['Analyst'],
  },
];

interface WidgetLibraryPanelProps {
  className?: string;
}

export function WidgetLibraryPanel({ className }: WidgetLibraryPanelProps) {
  const { resetToDefault, activePreset } = useDashboardLayoutStore();

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Widget Library</CardTitle>
            <CardDescription>
              Available widgets for your dashboard
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info banner */}
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Preset-based Layout System
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Widgets are managed by layout presets (Executive, Analyst, Auditor).
              Switch presets to see different widget combinations.
              Use drag handles to reorder widgets within your active preset.
            </p>
          </div>
        </div>

        {/* Widget types list */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Available Widget Types
          </h4>
          <div className="space-y-2">
            {WIDGET_TYPES.map((widget) => (
              <div
                key={widget.type}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <div className="mt-0.5 text-muted-foreground">
                  {widget.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{widget.name}</span>
                    <div className="flex flex-wrap gap-1">
                      {widget.presets.map((preset) => (
                        <Badge
                          key={preset}
                          variant={
                            preset.toLowerCase() === activePreset
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {preset}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {widget.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
