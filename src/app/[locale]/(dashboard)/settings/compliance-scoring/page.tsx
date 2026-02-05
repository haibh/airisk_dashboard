'use client';

import { useTranslations } from 'next-intl';
import { ComplianceScoringConfigForm } from '@/components/settings/compliance-scoring-config-form';

export default function ComplianceScoringPage() {
  const t = useTranslations('settings');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Compliance Scoring</h2>
        <p className="text-muted-foreground">
          Configure compliance thresholds and control priority weights per framework
        </p>
      </div>
      <ComplianceScoringConfigForm />
    </div>
  );
}
