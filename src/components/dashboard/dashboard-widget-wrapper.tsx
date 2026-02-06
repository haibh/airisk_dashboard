'use client';

import { useState, useCallback, ReactNode, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  minimized: boolean;
}

interface DashboardWidgetWrapperProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isSelected?: boolean;
  isMinimized?: boolean;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onSelect?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DashboardWidgetWrapper = forwardRef<HTMLDivElement, DashboardWidgetWrapperProps>(
  function DashboardWidgetWrapper(
    {
      id,
      title,
      icon,
      children,
      isSelected = false,
      isMinimized = false,
      isDragging = false,
      dragHandleProps,
      onSelect,
      onMinimize,
      onClose,
      className,
      style,
    },
    ref
  ) {
    const [isHovered, setIsHovered] = useState(false);

    const handleSelect = useCallback(() => {
      onSelect?.();
    }, [onSelect]);

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          'relative rounded-lg transition-all duration-200 ease-out',
          isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg',
          isHovered && !isSelected && !isDragging && 'shadow-md',
          isDragging && 'opacity-50 shadow-2xl scale-[1.02] z-50 ring-2 ring-primary/50',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleSelect}
        data-widget-id={id}
      >
        {/* Selection glow effect */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none z-10" />
        )}

        {/* Floating control buttons - appear on hover */}
        <div
          className={cn(
            'absolute top-2 right-2 z-20 flex items-center gap-1 transition-opacity duration-150',
            isHovered || isSelected ? 'opacity-100' : 'opacity-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="h-6 w-6 flex items-center justify-center bg-background/80 backdrop-blur-sm shadow-sm rounded-md cursor-grab active:cursor-grabbing hover:bg-muted"
            title="Drag to reorder"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-destructive/20 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            title="Hide widget"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Widget content with collapse animation */}
        <div
          className={cn(
            'transition-all duration-200 ease-out overflow-hidden',
            isMinimized ? 'max-h-12' : 'max-h-[2000px]'
          )}
        >
          {isMinimized ? (
            <div className="h-12 flex items-center px-4 bg-muted/50 rounded-lg border">
              {/* Minimized drag handle */}
              <div
                {...dragHandleProps}
                className="mr-2 cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium flex items-center gap-2">
                {icon}
                {title}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">(minimized)</span>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  }
);

// Widget toggle button for settings panel
interface WidgetToggleProps {
  widget: WidgetConfig;
  onToggle: (id: string) => void;
}

export function WidgetToggle({ widget, onToggle }: WidgetToggleProps) {
  return (
    <button
      onClick={() => onToggle(widget.id)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 cursor-pointer w-full text-left',
        widget.visible
          ? 'bg-primary/10 border-primary/30 text-primary'
          : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
      )}
    >
      <div
        className={cn(
          'w-3 h-3 rounded-full transition-colors duration-150',
          widget.visible ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      />
      <span className="text-sm font-medium truncate">{widget.title}</span>
    </button>
  );
}
