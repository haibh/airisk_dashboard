import { redirect } from 'next/navigation';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { WebhookConfigurationForm } from '@/components/settings/webhook-configuration-form';
import { WebhookDeliveryLogTable } from '@/components/settings/webhook-delivery-log-table';

interface WebhookEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function WebhookEditPage({ params }: WebhookEditPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasMinimumRole(session.user.role, 'ADMIN')) {
    redirect('/settings/profile');
  }

  const { id } = await params;

  return (
    <div className="space-y-8">
      <WebhookConfigurationForm webhookId={id} />
      <WebhookDeliveryLogTable webhookId={id} />
    </div>
  );
}
