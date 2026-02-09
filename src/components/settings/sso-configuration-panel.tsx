'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SSOConnection {
  id: string;
  metadataUrl: string | null;
  metadataXml: string | null;
  idpEntityId: string;
  idpSsoUrl: string;
  idpCertificate: string;
  allowedDomains: string[];
  defaultRole: string;
  forceSSO: boolean;
}

export function SSOConfigurationPanel() {
  const t = useTranslations('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connection, setConnection] = useState<SSOConnection | null>(null);
  const [formData, setFormData] = useState({
    metadataUrl: '',
    metadataXml: '',
    idpEntityId: '',
    idpSsoUrl: '',
    idpCertificate: '',
    allowedDomains: '',
    defaultRole: 'VIEWER',
    forceSSO: false,
  });

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
          setFormData({
            metadataUrl: conn.metadataUrl || '',
            metadataXml: conn.metadataXml || '',
            idpEntityId: conn.idpEntityId || '',
            idpSsoUrl: conn.idpSsoUrl || '',
            idpCertificate: conn.idpCertificate || '',
            allowedDomains: conn.allowedDomains.join(', '),
            defaultRole: conn.defaultRole || 'VIEWER',
            forceSSO: conn.forceSSO || false,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch SSO connection:', error);
      toast.error('Failed to load SSO configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        metadataUrl: formData.metadataUrl || null,
        metadataXml: formData.metadataXml || null,
        idpEntityId: formData.idpEntityId,
        idpSsoUrl: formData.idpSsoUrl,
        idpCertificate: formData.idpCertificate,
        allowedDomains: formData.allowedDomains.split(',').map((d) => d.trim()).filter(Boolean),
        defaultRole: formData.defaultRole,
        forceSSO: formData.forceSSO,
      };

      const method = connection ? 'PUT' : 'POST';
      const url = connection ? `/api/sso/connections/${connection.id}` : '/api/sso/connections';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save SSO configuration');

      toast.success('SSO configuration saved successfully');
      fetchConnection();
    } catch (error) {
      console.error('Failed to save SSO configuration:', error);
      toast.error('Failed to save SSO configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!connection) {
      toast.error('Please save the configuration first');
      return;
    }

    try {
      setTesting(true);
      const response = await fetch(`/api/sso/connections/${connection.id}/test`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t('sso.testSuccess'));
      } else {
        toast.error(`${t('sso.testFailed')}: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to test SSO connection:', error);
      toast.error(t('sso.testFailed'));
    } finally {
      setTesting(false);
    }
  };

  const handleDownloadMetadata = () => {
    window.open('/api/auth/saml/metadata', '_blank');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tabs.sso')}</CardTitle>
        <CardDescription>
          Configure SAML 2.0 Single Sign-On for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metadata URL */}
        <div className="space-y-2">
          <Label htmlFor="metadataUrl">{t('sso.metadataUrl')}</Label>
          <Input
            id="metadataUrl"
            placeholder="https://idp.example.com/metadata"
            value={formData.metadataUrl}
            onChange={(e) => setFormData({ ...formData, metadataUrl: e.target.value })}
          />
        </div>

        {/* Metadata XML */}
        <div className="space-y-2">
          <Label htmlFor="metadataXml">{t('sso.metadataXml')}</Label>
          <Textarea
            id="metadataXml"
            placeholder="<EntityDescriptor>...</EntityDescriptor>"
            rows={4}
            value={formData.metadataXml}
            onChange={(e) => setFormData({ ...formData, metadataXml: e.target.value })}
          />
        </div>

        {/* IdP Entity ID */}
        <div className="space-y-2">
          <Label htmlFor="idpEntityId">{t('sso.idpEntityId')}</Label>
          <Input
            id="idpEntityId"
            placeholder="https://idp.example.com/entity"
            value={formData.idpEntityId}
            onChange={(e) => setFormData({ ...formData, idpEntityId: e.target.value })}
          />
        </div>

        {/* IdP SSO URL */}
        <div className="space-y-2">
          <Label htmlFor="idpSsoUrl">{t('sso.idpSsoUrl')}</Label>
          <Input
            id="idpSsoUrl"
            placeholder="https://idp.example.com/sso"
            value={formData.idpSsoUrl}
            onChange={(e) => setFormData({ ...formData, idpSsoUrl: e.target.value })}
          />
        </div>

        {/* IdP Certificate */}
        <div className="space-y-2">
          <Label htmlFor="idpCertificate">{t('sso.idpCertificate')}</Label>
          <Textarea
            id="idpCertificate"
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            rows={6}
            value={formData.idpCertificate}
            onChange={(e) => setFormData({ ...formData, idpCertificate: e.target.value })}
          />
        </div>

        {/* Allowed Domains */}
        <div className="space-y-2">
          <Label htmlFor="allowedDomains">{t('sso.allowedDomains')}</Label>
          <Input
            id="allowedDomains"
            placeholder="example.com, corp.example.com"
            value={formData.allowedDomains}
            onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Comma-separated list of email domains</p>
        </div>

        {/* Default Role */}
        <div className="space-y-2">
          <Label htmlFor="defaultRole">{t('sso.defaultRole')}</Label>
          <Select
            value={formData.defaultRole}
            onValueChange={(value) => setFormData({ ...formData, defaultRole: value })}
          >
            <SelectTrigger id="defaultRole">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEWER">VIEWER</SelectItem>
              <SelectItem value="AUDITOR">AUDITOR</SelectItem>
              <SelectItem value="ASSESSOR">ASSESSOR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Force SSO */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="forceSSO">{t('sso.forceSSO')}</Label>
              <p className="text-xs text-muted-foreground">
                Disable password login for allowed domains
              </p>
            </div>
            <Switch
              id="forceSSO"
              checked={formData.forceSSO}
              onCheckedChange={(checked) => setFormData({ ...formData, forceSSO: checked })}
            />
          </div>
          {formData.forceSSO && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t('sso.forceSSOWarning')}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              t('sso.saveConnection')
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!connection || testing}
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              t('sso.testConnection')
            )}
          </Button>
          <Button variant="outline" onClick={handleDownloadMetadata}>
            <Download className="mr-2 h-4 w-4" />
            {t('sso.spMetadata')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
