'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SSOConnection {
  id: string;
  scimEnabled: boolean;
  scimToken: string | null;
}

export function SCIMConfigurationPanel() {
  const t = useTranslations('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connection, setConnection] = useState<SSOConnection | null>(null);
  const [scimEnabled, setScimEnabled] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  useEffect(() => {
    fetchConnection();
  }, []);

  const fetchConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sso/connections');
      if (response.ok) {
        const data = await response.json();
        if (data.connections && data.connections.length > 0) {
          const conn = data.connections[0];
          setConnection(conn);
          setScimEnabled(conn.scimEnabled || false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch SCIM configuration:', error);
      toast.error('Failed to load SCIM configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScim = async (enabled: boolean) => {
    if (!connection) {
      toast.error('SSO connection not configured');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/sso/connections/${connection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scimEnabled: enabled }),
      });

      if (!response.ok) throw new Error('Failed to update SCIM configuration');

      setScimEnabled(enabled);
      toast.success(`SCIM ${enabled ? 'enabled' : 'disabled'} successfully`);
      fetchConnection();
    } catch (error) {
      console.error('Failed to update SCIM configuration:', error);
      toast.error('Failed to update SCIM configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateToken = async () => {
    if (!connection) {
      toast.error('SSO connection not configured');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/sso/connections/${connection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateScimToken: true }),
      });

      if (!response.ok) throw new Error('Failed to generate SCIM token');

      const data = await response.json();
      setNewToken(data.scimToken);
      toast.success(t('scim.tokenGenerated'));
      fetchConnection();
    } catch (error) {
      console.error('Failed to generate SCIM token:', error);
      toast.error('Failed to generate SCIM token');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      toast.success('Token copied to clipboard');
    }
  };

  const handleCopyEndpoint = () => {
    const endpoint = `${window.location.origin}/api/scim/v2.0`;
    navigator.clipboard.writeText(endpoint);
    toast.success('Endpoint URL copied to clipboard');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!connection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('scim.title')}</CardTitle>
          <CardDescription>
            Configure SSO first to enable SCIM provisioning
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const scimEndpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/scim/v2.0` : '/api/scim/v2.0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('scim.title')}</CardTitle>
        <CardDescription>
          Automate user provisioning and deprovisioning via SCIM 2.0
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable SCIM */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="scimEnabled">{t('scim.enable')}</Label>
            <p className="text-xs text-muted-foreground">
              Allow identity provider to manage users automatically
            </p>
          </div>
          <Switch
            id="scimEnabled"
            checked={scimEnabled}
            onCheckedChange={handleToggleScim}
            disabled={saving}
          />
        </div>

        {scimEnabled && (
          <>
            {/* SCIM Endpoint */}
            <div className="space-y-2">
              <Label htmlFor="scimEndpoint">{t('scim.endpoint')}</Label>
              <div className="flex gap-2">
                <Input
                  id="scimEndpoint"
                  value={scimEndpoint}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyEndpoint}
                  title="Copy endpoint URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* SCIM Token */}
            <div className="space-y-2">
              <Label>SCIM Bearer Token</Label>
              {newToken ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newToken}
                      readOnly
                      className="font-mono text-sm"
                      type="password"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyToken}
                      title="Copy token"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-destructive font-medium">
                    {t('scim.tokenGenerated')}
                  </p>
                </div>
              ) : connection.scimToken ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t('scim.tokenSet')}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateToken}
                    disabled={saving}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Regenerate
                  </Button>
                </div>
              ) : (
                <Button onClick={handleGenerateToken} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    t('scim.generateToken')
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
