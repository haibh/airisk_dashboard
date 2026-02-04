import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers';
import { hasMinimumRole } from '@/lib/auth-helpers';

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect admins to organization settings, others to profile
  const isAdmin = hasMinimumRole(session.user.role, 'ADMIN');
  const targetPath = isAdmin ? '/settings/organization' : '/settings/profile';

  redirect(targetPath);
}
