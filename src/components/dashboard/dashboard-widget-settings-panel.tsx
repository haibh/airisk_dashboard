'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Settings2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetConfig } from './dashboard-widget-wrapper';

interface DashboardWidgetSettingsPanelProps {
  widgets: WidgetConfig[];
  onToggleVisibility: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onResetAll: () => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export function DashboardWidgetSettingsPanel({
  widgets,
  onToggleVisibility,
  onToggleMinimize,
  onResetAll,
  onShowAll,
  onHideAll,
}: DashboardWidgetSettingsPanelProps) {
  const [open, setOpen] = useState(false);

  const visibleCount = widgets.filter((w) => w.visible).length;
  const minimizedCount = widgets.filter((w) => w.minimized).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Customize</span>
          <span className="text-xs text-muted-foreground">
            ({visibleCount}/{widgets.length})
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Widget Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onShowAll} className="flex-1 gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={onHideAll} className="flex-1 gap-1.5">
              <EyeOff className="h-3.5 w-3.5" />
              Hide All
            </Button>
            <Button variant="outline" size="sm" onClick={onResetAll} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Visible: {visibleCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Minimized: {minimizedCount}</span>
            </div>
          </div>

          {/* Widget list */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Widgets</h4>
            <div className="space-y-1.5 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-all duration-150',
                    widget.visible
                      ? 'bg-card border-border'
                      : 'bg-muted/30 border-transparent opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        widget.visible
                          ? widget.minimized
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-muted-foreground/30'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium truncate',
                        !widget.visible && 'text-muted-foreground'
                      )}
                    >
                      {widget.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Minimize toggle (only when visible) */}
                    {widget.visible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-7 px-2 text-xs',
                          widget.minimized && 'text-yellow-600'
                        )}
                        onClick={() => onToggleMinimize(widget.id)}
                      >
                        {widget.minimized ? 'Expand' : 'Min'}
                      </Button>
                    )}

                    {/* Visibility toggle */}
                    <Switch
                      checked={widget.visible}
                      onCheckedChange={() => onToggleVisibility(widget.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help text */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>• Toggle switches to show/hide widgets</p>
            <p>• Click &quot;Min&quot; to collapse a widget</p>
            <p>• Click on any widget to select it</p>
            <p>• Use hover controls on widgets for quick actions</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
