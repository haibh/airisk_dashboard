'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Calendar, User, AlertTriangle } from 'lucide-react';
import { TaskCommentFeed } from './task-comment-feed';

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
    assessment: {
      id: string;
      title: string;
    };
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface TaskDetailPanelProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export function TaskDetailPanel({ taskId, open, onClose, onTaskUpdated }: TaskDetailPanelProps) {
  const t = useTranslations('tasks');
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (taskId && open) {
      fetchTaskDetail();
    }
  }, [taskId, open]);

  const fetchTaskDetail = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');

      const data = await response.json();
      setTask(data.task);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: TaskStatus) => {
    if (!taskId) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      toast.success(t('detail.updateSuccess'));
      fetchTaskDetail();
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async (priority: TaskPriority) => {
    if (!taskId) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      toast.success(t('detail.updateSuccess'));
      fetchTaskDetail();
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      toast.success(t('detail.deleteSuccess'));
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!task) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{task.title}</SheetTitle>
            <SheetDescription>{t('detail.title')}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">{t('detail.description')}</h3>
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('detail.updateStatus')}
                </label>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusUpdate(value as TaskStatus)}
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
                  onValueChange={(value) => handlePriorityUpdate(value as TaskPriority)}
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

            <TaskCommentFeed taskId={task.id} />

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('detail.deleteTask')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('detail.deleteTask')}</AlertDialogTitle>
            <AlertDialogDescription>{t('detail.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
