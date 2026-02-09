/**
 * Task Detail Metadata View
 * Displays task metadata: risk, assignee, dates, status/priority selectors
 */

'use client';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar, User, AlertTriangle } from 'lucide-react';

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  riskId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  risk: {
    id: string;
    title: string;
    category: string;
    assessment: { id: string; title: string };
  };
  assignee: { id: string; name: string; email: string } | null;
}

interface TaskDetailMetadataViewProps {
  task: TaskDetail;
  updating: boolean;
  onStatusUpdate: (status: TaskStatus) => void;
  onPriorityUpdate: (priority: TaskPriority) => void;
  t: (key: string) => string;
}

export function TaskDetailMetadataView({
  task,
  updating,
  onStatusUpdate,
  onPriorityUpdate,
  t,
}: TaskDetailMetadataViewProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-sm font-medium mb-2">{t('detail.description')}</h3>
        <p className="text-sm text-muted-foreground">
          {task.description || 'No description provided'}
        </p>
      </div>

      {/* Status / Priority selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('detail.updateStatus')}
          </label>
          <Select
            value={task.status}
            onValueChange={(value) => onStatusUpdate(value as TaskStatus)}
            disabled={updating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">{t('status.open')}</SelectItem>
              <SelectItem value="IN_PROGRESS">{t('status.inProgress')}</SelectItem>
              <SelectItem value="COMPLETED">{t('status.completed')}</SelectItem>
              <SelectItem value="CANCELLED">{t('status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('detail.updatePriority')}
          </label>
          <Select
            value={task.priority}
            onValueChange={(value) => onPriorityUpdate(value as TaskPriority)}
            disabled={updating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{t('priority.low')}</SelectItem>
              <SelectItem value="MEDIUM">{t('priority.medium')}</SelectItem>
              <SelectItem value="HIGH">{t('priority.high')}</SelectItem>
              <SelectItem value="CRITICAL">{t('priority.critical')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Linked risk */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {t('detail.linkedRisk')}
        </h3>
        <div className="text-sm text-muted-foreground">
          <div className="font-medium text-foreground">{task.risk.title}</div>
          <div className="text-xs">
            {task.risk.category} • {task.risk.assessment.title}
          </div>
        </div>
      </div>

      {/* Assignee */}
      {task.assignee && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Assignee
          </h3>
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{task.assignee.name}</div>
            <div className="text-xs">{task.assignee.email}</div>
          </div>
        </div>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Due Date
          </h3>
          <div className="text-sm text-muted-foreground">
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">{t('detail.createdAt')}:</span>{' '}
          {format(new Date(task.createdAt), 'MMM d, yyyy')}
        </div>
        <div>
          <span className="font-medium">{t('detail.updatedAt')}:</span>{' '}
          {format(new Date(task.updatedAt), 'MMM d, yyyy')}
        </div>
      </div>

      {task.completedAt && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{t('detail.completedAt')}:</span>{' '}
          {format(new Date(task.completedAt), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}
