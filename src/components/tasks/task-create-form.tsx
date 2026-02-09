'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Risk {
  id: string;
  title: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskCreateForm({ open, onClose, onSuccess }: TaskCreateFormProps) {
  const t = useTranslations('tasks');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [riskId, setRiskId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [risks, setRisks] = useState<Risk[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRisks();
      fetchUsers();
    }
  }, [open]);

  const fetchRisks = async () => {
    try {
      const response = await fetch('/api/risks?pageSize=100');
      if (!response.ok) throw new Error('Failed to fetch risks');

      const data = await response.json();
      setRisks(data.risks || []);
    } catch (error) {
      console.error('Failed to fetch risks:', error);
      toast.error('Failed to load risks');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?pageSize=100');
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!riskId) {
      toast.error('Risk is required');
      return;
    }

    try {
      setSubmitting(true);

      const body: any = {
        title: title.trim(),
        description: description.trim() || null,
        riskId,
        priority,
      };

      if (assigneeId) {
        body.assigneeId = assigneeId;
      }

      if (dueDate) {
        body.dueDate = new Date(dueDate).toISOString();
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to create task');

      toast.success(t('create.success'));
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRiskId('');
    setAssigneeId('');
    setPriority('MEDIUM');
    setDueDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('create.title')}</DialogTitle>
          <DialogDescription>{t('create.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('create.titleLabel')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('create.titlePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('create.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('create.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk">{t('create.riskLabel')}</Label>
            <Select value={riskId} onValueChange={setRiskId} required>
              <SelectTrigger>
                <SelectValue placeholder={t('create.riskPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {risks.map((risk) => (
                  <SelectItem key={risk.id} value={risk.id}>
                    {risk.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">{t('create.assigneeLabel')}</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder={t('create.assigneePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{t('create.priorityLabel')}</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
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

            <div className="space-y-2">
              <Label htmlFor="dueDate">{t('create.dueDateLabel')}</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : t('createTask')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
