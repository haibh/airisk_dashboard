import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { OrganizationProfileForm } from '@/components/settings/organization-profile-form';

export default async function OrganizationSettingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Only admins can access organization settings
  if (!hasMinimumRole(session.user.role, 'ADMIN')) {
    redirect('/settings/profile');
  }

  return <OrganizationProfileForm />;
}
