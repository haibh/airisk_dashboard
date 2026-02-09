'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  risk: {
    id: string;
    title: string;
  };
}

interface TaskListTableProps {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: TaskStatus | 'ALL') => void;
  onPriorityFilter: (priority: TaskPriority | 'ALL') => void;
  onSelectTask: (taskId: string) => void;
}

const statusColors: Record<TaskStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function TaskListTable({
  tasks,
  total,
  page,
  pageSize,
  onPageChange,
  onStatusFilter,
  onPriorityFilter,
  onSelectTask,
}: TaskListTableProps) {
  const t = useTranslations('tasks');

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select onValueChange={(value) => onStatusFilter(value as TaskStatus | 'ALL')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('table.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('common.all')}</SelectItem>
            <SelectItem value="OPEN">{t('status.open')}</SelectItem>
            <SelectItem value="IN_PROGRESS">{t('status.inProgress')}</SelectItem>
            <SelectItem value="COMPLETED">{t('status.completed')}</SelectItem>
            <SelectItem value="CANCELLED">{t('status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onPriorityFilter(value as TaskPriority | 'ALL')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('table.priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('common.all')}</SelectItem>
            <SelectItem value="LOW">{t('priority.low')}</SelectItem>
            <SelectItem value="MEDIUM">{t('priority.medium')}</SelectItem>
            <SelectItem value="HIGH">{t('priority.high')}</SelectItem>
            <SelectItem value="CRITICAL">{t('priority.critical')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('noTasks')}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.title')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.priority')}</TableHead>
                  <TableHead>{t('table.assignee')}</TableHead>
                  <TableHead>{t('table.dueDate')}</TableHead>
                  <TableHead>{t('table.risk')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectTask(task.id)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status]} variant="secondary">
                        {t(`status.${task.status.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[task.priority]} variant="secondary">
                        {t(`priority.${task.priority.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.assignee ? task.assignee.name : t('table.unassigned')}
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? format(new Date(task.dueDate), 'MMM d, yyyy')
                        : t('table.noDueDate')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.risk.title}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span>Page {page} of {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
