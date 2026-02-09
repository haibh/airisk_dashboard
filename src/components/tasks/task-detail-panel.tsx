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
import { Button } from '@/components/ui/button';
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
import { Trash2 } from 'lucide-react';
import { TaskCommentFeed } from './task-comment-feed';
import { TaskDetailMetadataView } from './task-detail-metadata-view';

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
      toast.error(t('errors.loadFailed'));
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
      toast.error(t('errors.updateFailed'));
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
      toast.error(t('errors.updateFailed'));
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
      toast.error(t('errors.deleteFailed'));
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
            <TaskDetailMetadataView
              task={task}
              updating={updating}
              onStatusUpdate={handleStatusUpdate}
              onPriorityUpdate={handlePriorityUpdate}
              t={t}
            />

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
