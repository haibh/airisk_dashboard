/**
 * Framework Control Tree Component
 * Displays hierarchical control structure with expand/collapse
 */

'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Control {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  children?: Control[];
}

interface ControlTreeProps {
  controls: Control[];
  onControlClick?: (control: Control) => void;
}

interface ControlNodeProps {
  control: Control;
  level: number;
  onControlClick?: (control: Control) => void;
}

function ControlNode({ control, level, onControlClick }: ControlNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = control.children && control.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted cursor-pointer transition-colors',
          level === 0 && 'font-semibold text-foreground',
          level === 1 && 'text-sm text-foreground',
          level >= 2 && 'text-sm text-muted-foreground'
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          if (onControlClick) {
            onControlClick(control);
          }
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <FileText className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
        )}
        <span className="font-mono text-xs text-muted-foreground flex-shrink-0">
          {control.code}
        </span>
        <span className="flex-1">{control.title}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {control.children!.map((child) => (
            <ControlNode
              key={child.id}
              control={child}
              level={level + 1}
              onControlClick={onControlClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FrameworkControlTree({ controls, onControlClick }: ControlTreeProps) {
  if (!controls || controls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No controls found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {controls.map((control) => (
        <ControlNode
          key={control.id}
          control={control}
          level={0}
          onControlClick={onControlClick}
        />
      ))}
    </div>
  );
}
