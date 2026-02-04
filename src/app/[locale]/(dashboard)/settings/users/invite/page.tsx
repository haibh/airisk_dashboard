import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { UserInviteForm } from '@/components/settings/user-invite-form';

export default async function InviteUserPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Only admins can invite users
  if (!hasMinimumRole(session.user.role, 'ADMIN')) {
    redirect('/settings/profile');
  }

  return <UserInviteForm />;
}
