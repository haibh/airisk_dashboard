import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers';
import { UserProfileForm } from '@/components/settings/user-profile-form';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { Separator } from '@/components/ui/separator';

export default async function ProfileSettingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <UserProfileForm />
      <Separator />
      <ChangePasswordForm />
    </div>
  );
}
