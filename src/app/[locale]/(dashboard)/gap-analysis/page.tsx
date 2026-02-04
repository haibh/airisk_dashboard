/**
 * Gap Analysis Page
 * Compare frameworks and identify compliance gaps
 * Supports multi-framework analysis and pairwise comparison modes
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, GitCompare, Loader2 } from 'lucide-react';
import { MultiFrameworkAnalysisView } from '@/components/gap-analysis/multi-framework-analysis-view';
import { PairwiseComparisonView } from '@/components/gap-analysis/pairwise-comparison-view';

interface AvailableFramework {
  id: string;
  name: string;
  shortName: string;
}

interface PairwiseResult {
  sourceToTarget: any;
  targetToSource: any;
  generatedAt: string;
}

export default function GapAnalysisPage() {
  const t = useTranslations('gapAnalysis');

  // Shared state
  const [availableFrameworks, setAvailableFrameworks] = useState<AvailableFramework[]>([]);
  const [isLoadingFrameworks, setIsLoadingFrameworks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pairwise state
  const [sourceFrameworkId, setSourceFrameworkId] = useState('');
  const [targetFrameworkId, setTargetFrameworkId] = useState('');
  const [pairwiseResult, setPairwiseResult] = useState<PairwiseResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    async function fetchFrameworks() {
      try {
        setIsLoadingFrameworks(true);
        const response = await fetch('/api/frameworks');
        if (!response.ok) throw new Error('Failed to fetch frameworks');
        const data = await response.json();
        const frameworks = Array.isArray(data) ? data : (data.frameworks || []);
        setAvailableFrameworks(frameworks);
      } catch (err) {
        console.error('Error fetching frameworks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load frameworks');
      } finally {
        setIsLoadingFrameworks(false);
      }
    }
    fetchFrameworks();
  }, []);

  async function runPairwiseComparison() {
    if (!sourceFrameworkId || !targetFrameworkId) {
      setError(t('pairwise.selectBoth'));
      return;
    }
    if (sourceFrameworkId === targetFrameworkId) {
      setError(t('pairwise.sameFramework'));
      return;
    }

    try {
      setIsComparing(true);
      setError(null);
      const response = await fetch(
        `/api/gap-analysis?mode=pairwise&source=${sourceFrameworkId}&target=${targetFrameworkId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run comparison');
      }
      setPairwiseResult(await response.json());
    } catch (err) {
      console.error('Error running pairwise comparison:', err);
      setError(err instanceof Error ? err.message : 'Failed to run comparison');
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="multi" onValueChange={() => setError(null)}>
        <TabsList>
          <TabsTrigger value="multi">{t('tabs.multiFramework')}</TabsTrigger>
          <TabsTrigger value="pairwise">{t('tabs.pairwise')}</TabsTrigger>
        </TabsList>

        <TabsContent value="multi">
          <MultiFrameworkAnalysisView
            availableFrameworks={availableFrameworks}
            isLoadingFrameworks={isLoadingFrameworks}
            error={error}
            setError={setError}
          />
        </TabsContent>

        <TabsContent value="pairwise">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('pairwise.title')}</CardTitle>
                <CardDescription>{t('pairwise.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('pairwise.sourceFramework')}
                    </label>
                    <Select value={sourceFrameworkId} onValueChange={setSourceFrameworkId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('pairwise.selectSource')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFrameworks.map((fw) => (
                          <SelectItem key={fw.id} value={fw.id}>
                            {fw.shortName} - {fw.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('pairwise.targetFramework')}
                    </label>
                    <Select value={targetFrameworkId} onValueChange={setTargetFrameworkId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('pairwise.selectTarget')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFrameworks.map((fw) => (
                          <SelectItem key={fw.id} value={fw.id}>
                            {fw.shortName} - {fw.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={runPairwiseComparison}
                    disabled={!sourceFrameworkId || !targetFrameworkId || isComparing}
                    className="gap-2"
                  >
                    {isComparing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('pairwise.comparing')}
                      </>
                    ) : (
                      <>
                        <GitCompare className="h-4 w-4" />
                        {t('pairwise.compare')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {pairwiseResult && <PairwiseComparisonView result={pairwiseResult} />}

            {!pairwiseResult && !isComparing && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GitCompare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">{t('pairwise.title')}</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    {t('pairwise.description')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
