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

interface OrganizationData {
  id: string;
  name: string;
  timezone: string;
  defaultLanguage: string;
  industrySector: string | null;
}

export function OrganizationProfileForm() {
  const t = useTranslations('settings.organization');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<OrganizationData>({
    id: '',
    name: '',
    timezone: 'UTC',
    defaultLanguage: 'en',
    industrySector: '',
  });

  useEffect(() => {
    if (session?.user?.organizationId) {
      fetchOrganization();
    }
  }, [session]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${session?.user?.organizationId}`);
      if (response.ok) {
        const responseData = await response.json();
        // Handle both { data: {...} } and direct object response formats
        const orgData = responseData.data || responseData;
        if (orgData && orgData.id) {
          setFormData(orgData);
        }
      }
    } catch (error) {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/organizations/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          timezone: formData.timezone,
          defaultLanguage: formData.defaultLanguage,
          industrySector: formData.industrySector,
        }),
      });

      if (response.ok) {
        toast.success(t('saved'));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save organization settings');
      }
    } catch (error) {
      toast.error('Failed to save organization settings');
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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">{t('timezone')}</Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => setFormData({ ...formData, timezone: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los Angeles (PST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (ICT)</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t('language')}</Label>
          <Select
            value={formData.defaultLanguage}
            onValueChange={(value) => setFormData({ ...formData, defaultLanguage: value })}
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
          <Label htmlFor="industry">{t('industry')}</Label>
          <Input
            id="industry"
            value={formData.industrySector || ''}
            onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
            placeholder="e.g., Finance, Healthcare, Technology"
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? tCommon('loading') : t('save')}
      </Button>
    </form>
  );
}
