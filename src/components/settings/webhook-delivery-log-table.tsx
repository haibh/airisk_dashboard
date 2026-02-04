'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Delivery {
  id: string;
  eventType: string;
  status: string;
  responseStatus: number | null;
  duration: number | null;
  attempt: number;
  createdAt: string;
}

interface WebhookDeliveryLogTableProps {
  webhookId: string;
}

export function WebhookDeliveryLogTable({ webhookId }: WebhookDeliveryLogTableProps) {
  const t = useTranslations('settings.webhooks');
  const tCommon = useTranslations('common');

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (webhookId) {
      fetchDeliveries();
    }
  }, [webhookId]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/webhooks/${webhookId}/deliveries`);
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (error) {
      toast.error('Failed to load delivery log');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      SUCCESS: 'default',
      FAILED: 'destructive',
      RETRYING: 'secondary',
      PENDING: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-6">{tCommon('loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t('deliveries')}</h3>

      {deliveries.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">{t('noDeliveries')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('eventType')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('httpCode')}</TableHead>
              <TableHead>{t('duration')}</TableHead>
              <TableHead>{t('attempt')}</TableHead>
              <TableHead>{t('timestamp')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">{delivery.eventType}</TableCell>
                <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                <TableCell>
                  {delivery.responseStatus || '-'}
                </TableCell>
                <TableCell>
                  {delivery.duration ? `${delivery.duration}ms` : '-'}
                </TableCell>
                <TableCell>{delivery.attempt}</TableCell>
                <TableCell>
                  {new Date(delivery.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
