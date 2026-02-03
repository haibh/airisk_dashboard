'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AISystemForm } from '@/components/ai-systems/ai-system-form';
import { AISystemFormData } from '@/types/ai-system';
import { Card } from '@/components/ui/card';

export default function NewAISystemPage() {
  const t = useTranslations();
  const router = useRouter();

  const handleSubmit = async (data: AISystemFormData) => {
    try {
      const response = await fetch('/api/ai-systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create system');
      }

      const system = await response.json();
      router.push(`/ai-systems/${system.id}`);
    } catch (error) {
      console.error('Error creating AI system:', error);
      alert(error instanceof Error ? error.message : 'Failed to create AI system');
    }
  };

  const handleCancel = () => {
    router.push('/ai-systems');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('aiSystems.addSystem')}</h1>
        <p className="text-muted-foreground">Create a new AI system in the registry</p>
      </div>

      <AISystemForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
