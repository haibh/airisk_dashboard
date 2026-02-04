'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  description: string | null;
  createdAt: string;
  _count: { deliveries: number };
}

export function WebhookManagementTable() {
  const t = useTranslations('settings.webhooks');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      if (data.success) {
        setWebhooks(data.data);
      }
    } catch (error) {
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t('webhookUpdated'));
        fetchWebhooks();
      } else {
        toast.error(data.error || 'Failed to update webhook');
      }
    } catch (error) {
      toast.error('Failed to update webhook');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(t('webhookDeleted'));
        fetchWebhooks();
      } else {
        toast.error(data.error || 'Failed to delete webhook');
      }
    } catch (error) {
      toast.error('Failed to delete webhook');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="p-6">{tCommon('loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Button onClick={() => router.push('/settings/webhooks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('create')}
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">{t('noWebhooks')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('url')}</TableHead>
              <TableHead>{t('events')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('deliveries')}</TableHead>
              <TableHead>{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell className="font-mono text-sm max-w-xs truncate">
                  {webhook.url}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{webhook.events.length} events</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.isActive}
                      onCheckedChange={(checked: boolean) => handleToggleActive(webhook.id, checked)}
                    />
                    <span className="text-sm">
                      {webhook.isActive ? t('active') : t('inactive')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{webhook._count.deliveries}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/settings/webhooks/${webhook.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all delivery history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              {tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
