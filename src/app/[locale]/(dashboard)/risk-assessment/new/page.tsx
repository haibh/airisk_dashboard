'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { AISystemWithOwner, AISystemListResponse } from '@/types/ai-system';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import for heavy wizard component
const AssessmentCreationWizard = dynamic(
  () => import('@/components/risk-assessment/assessment-creation-wizard').then(mod => ({ default: mod.AssessmentCreationWizard })),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

export default function NewAssessmentPage() {
  const t = useTranslations('risk');
  const tCommon = useTranslations('common');
  const [aiSystems, setAiSystems] = useState<AISystemWithOwner[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch AI systems
      const systemsResponse = await fetch('/api/ai-systems?pageSize=100');
      if (systemsResponse.ok) {
        const systemsData: AISystemListResponse =
          await systemsResponse.json();
        setAiSystems(systemsData.systems);
      }

      // Fetch frameworks
      const frameworksResponse = await fetch('/api/frameworks');
      if (frameworksResponse.ok) {
        const frameworksData = await frameworksResponse.json();
        setFrameworks(frameworksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-80 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('createNew')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('createSubtitle')}
        </p>
      </div>

      <AssessmentCreationWizard
        aiSystems={aiSystems}
        frameworks={frameworks}
      />
    </div>
  );
}
