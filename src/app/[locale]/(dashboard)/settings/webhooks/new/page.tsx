import { redirect } from 'next/navigation';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { WebhookConfigurationForm } from '@/components/settings/webhook-configuration-form';

export default async function NewWebhookPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasMinimumRole(session.user.role, 'ADMIN')) {
    redirect('/settings/profile');
  }

  return <WebhookConfigurationForm />;
}
