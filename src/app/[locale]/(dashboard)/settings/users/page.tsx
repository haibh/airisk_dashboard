import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { UserManagementTable } from '@/components/settings/user-management-table';

export default async function UsersSettingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Only admins can access user management
  if (!hasMinimumRole(session.user.role, 'ADMIN')) {
    redirect('/settings/profile');
  }

  return <UserManagementTable />;
}
