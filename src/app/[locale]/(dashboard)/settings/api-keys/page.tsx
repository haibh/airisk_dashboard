import { redirect } from 'next/navigation';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { APIKeyManagementTable } from '@/components/settings/api-key-management-table';

export default async function APIKeysPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasMinimumRole(session.user.role, 'ADMIN')) {
    redirect('/settings/profile');
  }

  return <APIKeyManagementTable />;
}
