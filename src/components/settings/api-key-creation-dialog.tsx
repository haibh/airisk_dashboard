'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check } from 'lucide-react';

interface APIKeyCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function APIKeyCreationDialog({
  open,
  onOpenChange,
  onSuccess,
}: APIKeyCreationDialogProps) {
  const t = useTranslations('settings.apiKeys');
  const tCommon = useTranslations('common');

  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState('READ_ONLY');
  const [expiresAt, setExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          permissions,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCreatedKey(data.data.fullKey);
        toast.success(t('keyCreated'));
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to create key');
      }
    } catch (error) {
      toast.error('Failed to create key');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    }
  };

  const handleClose = () => {
    setName('');
    setPermissions('READ_ONLY');
    setExpiresAt('');
    setCreatedKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create')}</DialogTitle>
          {!createdKey && (
            <DialogDescription>
              Create a new API key for programmatic access
            </DialogDescription>
          )}
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                {t('keyWarning')}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm break-all">
                  {createdKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full">
              {tCommon('confirm')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Production API"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissions">{t('permissions')}</Label>
              <Select value={permissions} onValueChange={setPermissions}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ_ONLY">{t('readOnly')}</SelectItem>
                  <SelectItem value="READ_WRITE">{t('readWrite')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">{t('expiresAt')}</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? tCommon('loading') : t('create')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
