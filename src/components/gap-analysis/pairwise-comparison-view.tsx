'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, X } from 'lucide-react';

interface DirectionCoverage {
  sourceShortName: string;
  targetShortName: string;
  totalSourceControls: number;
  mappedControls: number;
  unmappedControls: number;
  coveragePercentage: number;
  mappedDetails: Array<{
    sourceCode: string;
    sourceTitle: string;
    targetCode: string;
    targetTitle: string;
    confidence: string;
    mappingType: string;
  }>;
  unmappedDetails: Array<{
    code: string;
    title: string;
  }>;
}

interface PairwiseComparisonResult {
  sourceToTarget: DirectionCoverage;
  targetToSource: DirectionCoverage;
}

interface PairwiseComparisonViewProps {
  result: PairwiseComparisonResult;
}

function CoverageBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full bg-muted rounded-full h-3">
      <div className={`h-3 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function DirectionSection({ direction }: { direction: DirectionCoverage }) {
  const t = useTranslations('gapAnalysis.pairwise');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span>{direction.sourceShortName}</span>
        <ArrowRight className="h-5 w-5" />
        <span>{direction.targetShortName}</span>
        <Badge variant={direction.coveragePercentage >= 50 ? 'default' : 'destructive'}>
          {direction.coveragePercentage}%
        </Badge>
      </div>

      <CoverageBar percentage={direction.coveragePercentage} />

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold">{direction.totalSourceControls}</div>
          <div className="text-muted-foreground">{t('totalControls')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{direction.mappedControls}</div>
          <div className="text-muted-foreground">{t('mapped')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{direction.unmappedControls}</div>
          <div className="text-muted-foreground">{t('unmapped')}</div>
        </div>
      </div>

      {/* Mapped controls table */}
      {direction.mappedDetails.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-1">
            <Check className="h-4 w-4 text-green-600" />
            {t('mappedControls')}
          </h4>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">{t('sourceControl')}</th>
                  <th className="text-left p-2">{t('targetControl')}</th>
                  <th className="text-left p-2">{t('confidence')}</th>
                </tr>
              </thead>
              <tbody>
                {direction.mappedDetails.map((m, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">
                      <span className="font-mono text-xs">{m.sourceCode}</span>
                      <span className="ml-1 text-muted-foreground">{m.sourceTitle}</span>
                    </td>
                    <td className="p-2">
                      <span className="font-mono text-xs">{m.targetCode}</span>
                      <span className="ml-1 text-muted-foreground">{m.targetTitle}</span>
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={
                          m.confidence === 'HIGH'
                            ? 'default'
                            : m.confidence === 'MEDIUM'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {m.confidence}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unmapped controls table */}
      {direction.unmappedDetails.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-1">
            <X className="h-4 w-4 text-red-600" />
            {t('unmappedControls')} ({direction.unmappedDetails.length})
          </h4>
          <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-2">{t('controlCode')}</th>
                  <th className="text-left p-2">{t('controlTitle')}</th>
                </tr>
              </thead>
              <tbody>
                {direction.unmappedDetails.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-mono text-xs">{c.code}</td>
                    <td className="p-2 text-muted-foreground">{c.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function PairwiseComparisonView({ result }: PairwiseComparisonViewProps) {
  const t = useTranslations('gapAnalysis.pairwise');

  return (
    <div className="space-y-6">
      {/* Coverage Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {result.sourceToTarget.sourceShortName}
              <ArrowRight className="h-4 w-4" />
              {result.sourceToTarget.targetShortName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{result.sourceToTarget.coveragePercentage}%</div>
            <p className="text-xs text-muted-foreground">{t('coverageSummary')}</p>
            <CoverageBar percentage={result.sourceToTarget.coveragePercentage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {result.targetToSource.sourceShortName}
              <ArrowRight className="h-4 w-4" />
              {result.targetToSource.targetShortName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{result.targetToSource.coveragePercentage}%</div>
            <p className="text-xs text-muted-foreground">{t('coverageSummary')}</p>
            <CoverageBar percentage={result.targetToSource.coveragePercentage} />
          </CardContent>
        </Card>
      </div>

      {/* Direction A → B */}
      <Card>
        <CardContent className="pt-6">
          <DirectionSection direction={result.sourceToTarget} />
        </CardContent>
      </Card>

      {/* Direction B → A */}
      <Card>
        <CardContent className="pt-6">
          <DirectionSection direction={result.targetToSource} />
        </CardContent>
      </Card>
    </div>
  );
}
