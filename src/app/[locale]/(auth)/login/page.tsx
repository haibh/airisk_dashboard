'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Loader2, Shield, Info } from 'lucide-react';
import { SSOLoginButton } from '@/components/auth/sso-login-button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SSOConfig {
  enabled: boolean;
  forceSSO: boolean;
  organizationName?: string;
}

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ssoConfig, setSSOConfig] = useState<SSOConfig | null>(null);
  const [checkingSSO, setCheckingSSO] = useState(false);

  const checkSSOAvailability = async (emailValue: string) => {
    if (!emailValue || !emailValue.includes('@')) {
      setSSOConfig(null);
      return;
    }

    try {
      setCheckingSSO(true);
      const response = await fetch(`/api/auth/saml/authorize?email=${encodeURIComponent(emailValue)}`);

      if (response.ok) {
        const data = await response.json();
        setSSOConfig({
          enabled: true,
          forceSSO: data.forceSSO || false,
          organizationName: data.organizationName,
        });
      } else {
        setSSOConfig(null);
      }
    } catch (err) {
      // SSO not available, continue with password login
      setSSOConfig(null);
    } finally {
      setCheckingSSO(false);
    }
  };

  const handleEmailBlur = () => {
    checkSSOAvailability(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check SSO before attempting password login
    if (!ssoConfig) {
      await checkSSOAvailability(email);
    }

    // If SSO is forced, redirect to SSO
    if (ssoConfig?.forceSSO) {
      window.location.href = `/api/auth/saml/authorize?email=${encodeURIComponent(email)}`;
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(t('auth.loginError'));
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.loginError'));
      setIsLoading(false);
    }
  };

  return (
    <Card className="auth-card-adaptive">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          {t('common.appNameShort')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('auth.login')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              required
              disabled={isLoading || checkingSSO}
              autoComplete="email"
            />
          </div>

          {ssoConfig?.enabled && !ssoConfig.forceSSO && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{t('login.sso.ssoDetected')}</AlertDescription>
            </Alert>
          )}

          {ssoConfig?.forceSSO && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{t('login.sso.forceSSOMessage')}</AlertDescription>
            </Alert>
          )}

          {!ssoConfig?.forceSSO && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!ssoConfig?.forceSSO && (
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || checkingSSO}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>
          )}

          {ssoConfig?.enabled && (
            <SSOLoginButton
              email={email}
              organizationName={ssoConfig.organizationName}
            />
          )}

          {!ssoConfig?.forceSSO && (
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {t('auth.forgotPassword')}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
