'use client';

import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SSOLoginButtonProps {
  email: string;
  organizationName?: string;
}

export function SSOLoginButton({ email, organizationName }: SSOLoginButtonProps) {
  const t = useTranslations('login');

  const handleSSOLogin = () => {
    // Redirect to SSO authorization endpoint
    const params = new URLSearchParams({ email });
    window.location.href = `/api/auth/saml/authorize?${params.toString()}`;
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleSSOLogin}
      >
        <Lock className="mr-2 h-4 w-4" />
        {t('sso.signInWithSSO')}
      </Button>
      {organizationName && (
        <p className="text-xs text-center text-muted-foreground">
          {organizationName}
        </p>
      )}
    </div>
  );
}
