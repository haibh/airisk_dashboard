'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { AISystemWithOwner } from '@/types/ai-system';
import { LifecycleStatus, RiskTier } from '@prisma/client';

export default function AISystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations();
  const router = useRouter();
  const [system, setSystem] = useState<AISystemWithOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemId, setSystemId] = useState<string>('');

  useEffect(() => {
    params.then(p => setSystemId(p.id));
  }, [params]);

  useEffect(() => {
    if (systemId) {
      fetchSystem();
    }
  }, [systemId]);

  const fetchSystem = async () => {
    try {
      const response = await fetch(`/api/ai-systems/${systemId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSystem(data);
    } catch (error) {
      console.error('Error fetching system:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to retire this AI system?')) return;

    try {
      const response = await fetch(`/api/ai-systems/${systemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      router.push('/ai-systems');
    } catch (error) {
      console.error('Error deleting system:', error);
      alert('Failed to delete AI system');
    }
  };

  const getRiskBadgeVariant = (tier: RiskTier | null) => {
    if (!tier) return 'secondary';
    switch (tier) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: LifecycleStatus) => {
    switch (status) {
      case 'PRODUCTION': return 'default';
      case 'DEVELOPMENT': return 'secondary';
      case 'PILOT': return 'outline';
      case 'DEPRECATED': return 'destructive';
      case 'RETIRED': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{t('common.loading')}</div>;
  }

  if (!system) {
    return <div className="p-8 text-center">AI system not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/ai-systems')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{system.name}</h1>
            <p className="text-muted-foreground">AI System Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/ai-systems/${systemId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Retire
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">System Type</div>
              <Badge variant="outline" className="mt-1">{system.systemType}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Data Classification</div>
              <div className="mt-1">{system.dataClassification}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Lifecycle Status</div>
              <Badge variant={getStatusBadgeVariant(system.lifecycleStatus)} className="mt-1">
                {system.lifecycleStatus}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Risk Tier</div>
              {system.riskTier ? (
                <Badge variant={getRiskBadgeVariant(system.riskTier)} className="mt-1">
                  {system.riskTier}
                </Badge>
              ) : (
                <div className="mt-1 text-muted-foreground">Not assessed</div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Owner</div>
              <div className="mt-1">{system.owner.name || system.owner.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="mt-1">{new Date(system.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          {system.description && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <div className="mt-1">{system.description}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Details */}
      <Card>
        <CardHeader>
          <CardTitle>System Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {system.purpose && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Purpose</div>
              <div className="mt-1 whitespace-pre-wrap">{system.purpose}</div>
            </div>
          )}

          {system.dataInputs && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Data Inputs</div>
              <div className="mt-1 whitespace-pre-wrap">{system.dataInputs}</div>
            </div>
          )}

          {system.dataOutputs && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Data Outputs</div>
              <div className="mt-1 whitespace-pre-wrap">{system.dataOutputs}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Third-Party APIs</div>
            {system.thirdPartyAPIs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {system.thirdPartyAPIs.map((api, index) => (
                  <Badge key={index} variant="secondary">{api}</Badge>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Base Models</div>
            {system.baseModels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {system.baseModels.map((model, index) => (
                  <Badge key={index} variant="secondary">{model}</Badge>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Training Data Sources</div>
            {system.trainingDataSources.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {system.trainingDataSources.map((source, index) => (
                  <Badge key={index} variant="secondary">{source}</Badge>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
