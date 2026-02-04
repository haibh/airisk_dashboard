'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function UserInviteForm() {
  const t = useTranslations('settings.invite');
  const tRoles = useTranslations('roles');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'VIEWER',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(t('sent'));
        router.push('/settings/users');
      } else {
        const error = await response.json();
        if (error.error?.includes('already exists')) {
          toast.error(t('emailExists'));
        } else if (error.error?.includes('pending')) {
          toast.error(t('pendingExists'));
        } else {
          toast.error(error.error || 'Failed to send invitation');
        }
      }
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">{t('role')}</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">{tRoles('admin')}</SelectItem>
              <SelectItem value="RISK_MANAGER">{tRoles('riskManager')}</SelectItem>
              <SelectItem value="ASSESSOR">{tRoles('assessor')}</SelectItem>
              <SelectItem value="AUDITOR">{tRoles('auditor')}</SelectItem>
              <SelectItem value="VIEWER">{tRoles('viewer')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={sending}>
          {sending ? tCommon('loading') : t('send')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
