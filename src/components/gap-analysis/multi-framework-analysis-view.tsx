'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, GitCompare, Loader2, TrendingUp } from 'lucide-react';
import { GapListTable } from '@/components/gap-analysis/gap-list-table';

const FrameworkComparisonChart = dynamic(
  () =>
    import('@/components/gap-analysis/framework-comparison-chart').then((mod) => ({
      default: mod.FrameworkComparisonChart,
    })),
  { loading: () => <Skeleton className="h-[350px] w-full" />, ssr: false }
);

const GapMatrixVisualization = dynamic(
  () =>
    import('@/components/gap-analysis/gap-matrix-visualization').then((mod) => ({
      default: mod.GapMatrixVisualization,
    })),
  { loading: () => <Skeleton className="h-[400px] w-full" />, ssr: false }
);

interface FrameworkScore {
  id: string;
  name: string;
  shortName: string;
  totalControls: number;
  compliantControls: number;
  partialControls: number;
  nonCompliantControls: number;
  notAssessedControls: number;
  complianceScore: number;
}

interface FrameworkGap {
  controlId: string;
  controlCode: string;
  controlTitle: string;
  frameworkId: string;
  frameworkName: string;
  hasAssessment: boolean;
  hasEvidence: boolean;
  complianceStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_ASSESSED';
  mappedControls: Array<{
    controlId: string;
    controlCode: string;
    frameworkId: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

interface GapAnalysisResult {
  frameworks: FrameworkScore[];
  gaps: FrameworkGap[];
  matrix: Record<string, Record<string, 'MAPPED' | 'PARTIAL' | 'UNMAPPED'>>;
  generatedAt: string;
}

interface AvailableFramework {
  id: string;
  name: string;
  shortName: string;
}

interface MultiFrameworkAnalysisViewProps {
  availableFrameworks: AvailableFramework[];
  isLoadingFrameworks: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export function MultiFrameworkAnalysisView({
  availableFrameworks,
  isLoadingFrameworks,
  error,
  setError,
}: MultiFrameworkAnalysisViewProps) {
  const t = useTranslations('gapAnalysis');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function runAnalysis() {
    if (selectedFrameworks.length < 2) {
      setError('Please select at least 2 frameworks to compare');
      return;
    }
    if (selectedFrameworks.length > 5) {
      setError('Maximum 5 frameworks can be compared at once');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const response = await fetch(`/api/gap-analysis?frameworks=${selectedFrameworks.join(',')}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run gap analysis');
      }
      setAnalysisResult(await response.json());
    } catch (err) {
      console.error('Error running gap analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to run analysis');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function exportGaps() {
    if (!analysisResult) return;
    const csvRows = [
      ['Control Code', 'Control Title', 'Framework', 'Status', 'Mapped Controls', 'Has Evidence'].join(','),
      ...analysisResult.gaps.map((gap) =>
        [
          gap.controlCode,
          `"${gap.controlTitle.replace(/"/g, '""')}"`,
          gap.frameworkName,
          gap.complianceStatus,
          gap.mappedControls.map((mc) => mc.controlCode).join('; '),
          gap.hasEvidence ? 'Yes' : 'No',
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gap-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleFramework(frameworkId: string) {
    setSelectedFrameworks((prev) =>
      prev.includes(frameworkId) ? prev.filter((id) => id !== frameworkId) : [...prev, frameworkId]
    );
  }

  const summaryStats = analysisResult
    ? {
        totalGaps: analysisResult.gaps.length,
        notAssessed: analysisResult.gaps.filter((g) => g.complianceStatus === 'NOT_ASSESSED').length,
        nonCompliant: analysisResult.gaps.filter((g) => g.complianceStatus === 'NON_COMPLIANT').length,
        avgCompliance:
          analysisResult.frameworks.length > 0
            ? Math.round(
                analysisResult.frameworks.reduce((sum, fw) => sum + fw.complianceScore, 0) /
                  analysisResult.frameworks.length
              )
            : 0,
      }
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('selectFrameworks')}</CardTitle>
          <CardDescription>{t('selectFrameworksDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingFrameworks ? (
            <div className="flex gap-2 flex-wrap">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-32" />)}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {availableFrameworks.map((fw) => (
                <Button
                  key={fw.id}
                  variant={selectedFrameworks.includes(fw.id) ? 'default' : 'outline'}
                  onClick={() => toggleFramework(fw.id)}
                  className="gap-2"
                >
                  {fw.shortName}
                  {selectedFrameworks.includes(fw.id) && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedFrameworks.indexOf(fw.id) + 1}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {selectedFrameworks.length} {t('frameworksSelected')} (2-5 required)
            </p>
            <Button
              onClick={runAnalysis}
              disabled={selectedFrameworks.length < 2 || selectedFrameworks.length > 5 || isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t('analyzing')}</>
              ) : (
                <><GitCompare className="h-4 w-4" />{t('runAnalysis')}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && summaryStats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalGaps')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalGaps}</div>
                <p className="text-xs text-muted-foreground">{t('identifiedGaps')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('avgCompliance')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.avgCompliance}%</div>
                <p className="text-xs text-muted-foreground">{t('acrossFrameworks')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('notAssessed')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.notAssessed}</div>
                <p className="text-xs text-muted-foreground">{t('requiresAssessment')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('nonCompliant')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.nonCompliant}</div>
                <p className="text-xs text-muted-foreground">{t('needsAttention')}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('comparisonChart')}</CardTitle>
              <CardDescription>{t('comparisonChartDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FrameworkComparisonChart frameworks={analysisResult.frameworks} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('mappingMatrix')}</CardTitle>
              <CardDescription>{t('mappingMatrixDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <GapMatrixVisualization frameworks={analysisResult.frameworks} matrix={analysisResult.matrix} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('identifiedGaps')}</CardTitle>
              <CardDescription>{t('identifiedGapsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <GapListTable gaps={analysisResult.gaps} frameworks={analysisResult.frameworks} onExport={exportGaps} />
            </CardContent>
          </Card>
        </>
      )}

      {!analysisResult && !error && !isAnalyzing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitCompare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">{t('noAnalysis')}</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">{t('noAnalysisDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
