'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { APIKeyCreationDialog } from './api-key-creation-dialog';
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

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  createdBy: { name: string };
}

export function APIKeyManagementTable() {
  const t = useTranslations('settings.apiKeys');
  const tCommon = useTranslations('common');

  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch (error) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(t('keyRevoked'));
        fetchKeys();
      } else {
        toast.error(data.error || 'Failed to revoke key');
      }
    } catch (error) {
      toast.error('Failed to revoke key');
    } finally {
      setRevokeId(null);
    }
  };

  if (loading) {
    return <div className="p-6">{tCommon('loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('create')}
        </Button>
      </div>

      {keys.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">{t('noKeys')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('keyPrefix')}</TableHead>
              <TableHead>{t('permissions')}</TableHead>
              <TableHead>{t('expires')}</TableHead>
              <TableHead>{t('lastUsed')}</TableHead>
              <TableHead>{tCommon('status')}</TableHead>
              <TableHead>{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell className="font-mono text-sm">{key.keyPrefix}</TableCell>
                <TableCell>
                  <Badge variant={key.permissions === 'READ_WRITE' ? 'default' : 'secondary'}>
                    {key.permissions === 'READ_WRITE' ? t('readWrite') : t('readOnly')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : t('neverExpires')}
                </TableCell>
                <TableCell>
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : '-'}
                </TableCell>
                <TableCell>
                  {key.revokedAt ? (
                    <Badge variant="destructive">{t('revoked')}</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!key.revokedAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRevokeId(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <APIKeyCreationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchKeys}
      />

      <AlertDialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('revokeConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => revokeId && handleRevoke(revokeId)}>
              {t('revoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
