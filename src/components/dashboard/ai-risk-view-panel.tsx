'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { ComplianceFramework } from '@/types/dashboard';
import { AIModelRegistry, type AISystemSummary } from '@/components/ai-risk-view/ai-model-registry';
import { ModelRiskCard } from '@/components/ai-risk-view/model-risk-card';
import { ModelLifecycleIndicators } from '@/components/ai-risk-view/model-lifecycle-indicators';
import { CrossFrameworkMappingViz } from '@/components/ai-risk-view/cross-framework-mapping-viz';
import { BiasDriftMetricsPlaceholder } from '@/components/ai-risk-view/bias-drift-metrics-placeholder';

// Dynamic imports for recharts-heavy components
const FrameworkCoverageTreemap = dynamic(() => import('@/components/ai-risk-view/framework-coverage-treemap').then(m => ({ default: m.FrameworkCoverageTreemap })), { ssr: false });
const AIModelRiskRadarChart = dynamic(() => import('@/components/ai-risk-view/ai-model-risk-radar-chart').then(m => ({ default: m.AIModelRiskRadarChart })), { ssr: false });

interface AIRiskViewPanelProps {
  frameworks: ComplianceFramework[];
  isLoading: boolean;
}

export function AIRiskViewPanel({ frameworks, isLoading }: AIRiskViewPanelProps) {
  const [systems, setSystems] = useState<AISystemSummary[]>([]);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchSystems = useCallback(async () => {
    try {
      setSystemsLoading(true);
      const res = await fetch('/api/ai-systems?pageSize=50');
      if (res.ok) {
        const data = await res.json();
        const items = (data.items || []).map((s: Record<string, string>) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          riskTier: s.riskTier,
          lifecycleStatus: s.lifecycleStatus,
        }));
        setSystems(items);
        if (items.length > 0 && !selectedId) setSelectedId(items[0].id);
      }
    } catch {
      // Secondary fetch — silent fail
    } finally {
      setSystemsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  const aiLoading = isLoading || systemsLoading;
  const selectedSystem = systems.find((s) => s.id === selectedId) || null;

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mt-4">
      <div className="lg:col-span-1">
        <AIModelRegistry
          systems={systems}
          selectedId={selectedId}
          onSelect={setSelectedId}
          isLoading={aiLoading}
        />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <ModelRiskCard system={selectedSystem} isLoading={aiLoading} />
        <AIModelRiskRadarChart
          systemId={selectedId}
          systemName={selectedSystem?.name}
          showTarget={true}
        />
        <ModelLifecycleIndicators
          currentStage={selectedSystem?.lifecycleStatus || null}
          isLoading={aiLoading}
        />
        <FrameworkCoverageTreemap frameworks={frameworks} isLoading={isLoading} />
        <CrossFrameworkMappingViz frameworks={frameworks} isLoading={isLoading} />
        <BiasDriftMetricsPlaceholder />
      </div>
    </div>
  );
}
