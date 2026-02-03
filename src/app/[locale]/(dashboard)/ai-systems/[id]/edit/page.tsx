'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AISystemForm } from '@/components/ai-systems/ai-system-form';
import { AISystemFormData, AISystemWithOwner } from '@/types/ai-system';

export default function EditAISystemPage({ params }: { params: Promise<{ id: string }> }) {
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
      router.push('/ai-systems');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: AISystemFormData) => {
    try {
      const response = await fetch(`/api/ai-systems/${systemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update system');
      }

      router.push(`/ai-systems/${systemId}`);
    } catch (error) {
      console.error('Error updating AI system:', error);
      alert(error instanceof Error ? error.message : 'Failed to update AI system');
    }
  };

  const handleCancel = () => {
    router.push(`/ai-systems/${systemId}`);
  };

  if (loading) {
    return <div className="p-8 text-center">{t('common.loading')}</div>;
  }

  if (!system) {
    return <div className="p-8 text-center">AI system not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit AI System</h1>
        <p className="text-muted-foreground">Update {system.name}</p>
      </div>

      <AISystemForm
        initialData={{
          name: system.name,
          description: system.description || undefined,
          systemType: system.systemType,
          dataClassification: system.dataClassification,
          lifecycleStatus: system.lifecycleStatus,
          riskTier: system.riskTier || undefined,
          purpose: system.purpose || undefined,
          dataInputs: system.dataInputs || undefined,
          dataOutputs: system.dataOutputs || undefined,
          thirdPartyAPIs: system.thirdPartyAPIs,
          baseModels: system.baseModels,
          trainingDataSources: system.trainingDataSources,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit
      />
    </div>
  );
}
