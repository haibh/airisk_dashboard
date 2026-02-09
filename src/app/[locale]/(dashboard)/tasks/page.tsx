'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskListTable } from '@/components/tasks/task-list-table';
import { TaskDetailPanel } from '@/components/tasks/task-detail-panel';
import { TaskCreateForm } from '@/components/tasks/task-create-form';
import { toast } from 'sonner';

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Task {
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
  risk: {
    id: string;
    title: string;
    category: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function TasksPage() {
  const t = useTranslations('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (priorityFilter !== 'ALL') {
        params.append('priority', priorityFilter);
      }

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter, priorityFilter]);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    setSelectedTaskId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createTask')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <TaskListTable
              tasks={tasks}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onStatusFilter={setStatusFilter}
              onPriorityFilter={setPriorityFilter}
              onSelectTask={setSelectedTaskId}
            />
          )}
        </CardContent>
      </Card>

      <TaskCreateForm
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />

      <TaskDetailPanel
        taskId={selectedTaskId}
        open={selectedTaskId !== null}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}
