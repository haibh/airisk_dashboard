'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardWidgetWrapper } from './dashboard-widget-wrapper';
import { ReactNode } from 'react';

interface SortableWidgetProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isSelected?: boolean;
  isMinimized?: boolean;
  onSelect?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
  className?: string;
}

export function SortableWidget({
  id,
  title,
  icon,
  children,
  isSelected,
  isMinimized,
  onSelect,
  onMinimize,
  onClose,
  className,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <DashboardWidgetWrapper
      ref={setNodeRef}
      style={style}
      id={id}
      title={title}
      icon={icon}
      isSelected={isSelected}
      isMinimized={isMinimized}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
      onSelect={onSelect}
      onMinimize={onMinimize}
      onClose={onClose}
      className={className}
    >
      {children}
    </DashboardWidgetWrapper>
  );
}
