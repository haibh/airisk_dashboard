'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap } from 'lucide-react';

const EVENT_OPTIONS = [
  'ai_system.created',
  'ai_system.updated',
  'ai_system.deleted',
  'assessment.created',
  'assessment.updated',
  'assessment.status_changed',
  'risk.created',
  'risk.updated',
  'risk.score_changed',
  'user.invited',
  'user.deactivated',
];

interface WebhookConfigurationFormProps {
  webhookId?: string;
}

export function WebhookConfigurationForm({ webhookId }: WebhookConfigurationFormProps) {
  const t = useTranslations('settings.webhooks');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (webhookId) {
      fetchWebhook();
    }
  }, [webhookId]);

  const fetchWebhook = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/webhooks/${webhookId}`);
      const data = await res.json();
      if (data.success) {
        setUrl(data.data.url);
        setEvents(data.data.events);
        setDescription(data.data.description || '');
      }
    } catch (error) {
      toast.error('Failed to load webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim() || !url.startsWith('https://')) {
      toast.error(t('urlRequired'));
      return;
    }

    if (events.length === 0) {
      toast.error(t('eventsRequired'));
      return;
    }

    try {
      setLoading(true);
      const method = webhookId ? 'PUT' : 'POST';
      const endpoint = webhookId ? `/api/webhooks/${webhookId}` : '/api/webhooks';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          events,
          description: description.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(webhookId ? t('webhookUpdated') : t('webhookCreated'));
        router.push('/settings/webhooks');
      } else {
        toast.error(data.error || 'Failed to save webhook');
      }
    } catch (error) {
      toast.error('Failed to save webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!webhookId) return;

    try {
      setTesting(true);
      const res = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        toast.success(t('testSuccess'));
      } else {
        toast.error(t('testFailed'));
      }
    } catch (error) {
      toast.error(t('testFailed'));
    } finally {
      setTesting(false);
    }
  };

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {webhookId ? tCommon('edit') : t('create')} Webhook
        </h2>
        {webhookId && (
          <Button type="button" variant="outline" onClick={handleTest} disabled={testing}>
            <Zap className="h-4 w-4 mr-2" />
            {t('test')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">{t('url')}</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t('selectEvents')}</Label>
        <div className="grid grid-cols-2 gap-3 p-4 border rounded-md">
          {EVENT_OPTIONS.map((event) => (
            <div key={event} className="flex items-center space-x-2">
              <Checkbox
                id={event}
                checked={events.includes(event)}
                onCheckedChange={() => toggleEvent(event)}
              />
              <label
                htmlFor={event}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {event}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? tCommon('loading') : tCommon('save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/settings/webhooks')}
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
