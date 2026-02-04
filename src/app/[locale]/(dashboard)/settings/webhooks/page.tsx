import { redirect } from 'next/navigation';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { WebhookManagementTable } from '@/components/settings/webhook-management-table';

export default async function WebhooksPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasMinimumRole(session.user.role, 'ADMIN')) {
    redirect('/settings/profile');
  }

  return <WebhookManagementTable />;
}
