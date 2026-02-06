'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, BarChart3, Table2, Activity, Gauge, Grid3X3, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardLayoutStore, WidgetConfig, WidgetType } from '@/stores/dashboard-layout-store';

// Widget component registry - maps component names to placeholder content
const WIDGET_ICON_MAP: Record<WidgetType, React.ReactNode> = {
  'stat-card': <LayoutDashboard className="h-8 w-8 text-muted-foreground" />,
  'chart': <BarChart3 className="h-8 w-8 text-muted-foreground" />,
  'table': <Table2 className="h-8 w-8 text-muted-foreground" />,
  'feed': <Activity className="h-8 w-8 text-muted-foreground" />,
  'gauge': <Gauge className="h-8 w-8 text-muted-foreground" />,
  'heatmap': <Grid3X3 className="h-8 w-8 text-muted-foreground" />,
};

interface SortableWidgetProps {
  widget: WidgetConfig;
  onRemove?: (id: string) => void;
}

function SortableWidget({ widget, onRemove }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        `col-span-${widget.colSpan}`,
        `row-span-${widget.rowSpan}`,
        isDragging && 'opacity-50 z-50'
      )}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
              aria-label="Drag to reorder widget"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
            <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onRemove(widget.id)}
              aria-label="Remove widget"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {WIDGET_ICON_MAP[widget.type]}
            <p className="mt-2 text-xs text-muted-foreground">
              {widget.component}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {widget.colSpan}×{widget.rowSpan} grid
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface BentoGridLayoutProps {
  className?: string;
}

export function BentoGridLayout({ className }: BentoGridLayoutProps) {
  const { widgets, reorderWidgets } = useDashboardLayoutStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      reorderWidgets(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div
          className={cn(
            'grid auto-rows-[200px] gap-4',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
            className
          )}
        >
          {widgets.map((widget) => (
            <SortableWidget key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
