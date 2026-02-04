'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePasswordForm() {
  const t = useTranslations('settings.password');
  const tCommon = useTranslations('common');

  const [changing, setChanging] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('mismatch'));
      return;
    }

    setChanging(true);

    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success(t('changed'));
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        if (error.error?.includes('incorrect')) {
          toast.error(t('incorrect'));
        } else {
          toast.error(error.error || 'Failed to change password');
        }
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t('current')}</Label>
          <Input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">{t('new')}</Label>
          <Input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            minLength={8}
            required
          />
          <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirm')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            minLength={8}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={changing}>
        {changing ? tCommon('loading') : t('change')}
      </Button>
    </form>
  );
}
