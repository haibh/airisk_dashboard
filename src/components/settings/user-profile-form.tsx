'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
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

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  languagePreference: string;
  avatarUrl: string | null;
}

export function UserProfileForm() {
  const t = useTranslations('settings.profile');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    languagePreference: 'en',
    avatarUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setFormData(data.data);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          languagePreference: formData.languagePreference,
          avatarUrl: formData.avatarUrl,
        }),
      });

      if (response.ok) {
        toast.success(t('saved'));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save profile');
      }
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">{tCommon('loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={formData.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t('language')}</Label>
          <Select
            value={formData.languagePreference}
            onValueChange={(value) => setFormData({ ...formData, languagePreference: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">{t('avatar')}</Label>
          <Input
            id="avatar"
            value={formData.avatarUrl || ''}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-xs text-muted-foreground">Optional: URL to your profile picture</p>
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? tCommon('loading') : t('save')}
      </Button>
    </form>
  );
}
