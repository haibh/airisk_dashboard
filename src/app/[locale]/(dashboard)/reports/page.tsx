/**
 * Reports Page
 * Compliance reports with framework status overview and CSV export
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  Download,
  FileText,
  Loader2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

// Types matching the compliance API response
interface ControlData {
  id: string;
  code: string;
  title: string;
  description: string | null;
  assessmentStatus: string;
  linkedRisks: number;
  evidenceCount: number;
}

interface FrameworkComplianceData {
  id: string;
  name: string;
  shortName: string;
  version: string;
  category: string;
  totalControls: number;
  assessedControls: number;
  compliancePercentage: number;
  status: string;
  totalAssessments: number;
  controls: ControlData[];
}

interface ComplianceReport {
  frameworks: FrameworkComplianceData[];
  overallStatistics: {
    totalFrameworks: number;
    compliantFrameworks: number;
    inProgressFrameworks: number;
    notStartedFrameworks: number;
  };
  generatedAt: string;
}

// Status badge configuration
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  COMPLIANT: { label: 'Compliant', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
  MOSTLY_COMPLIANT: { label: 'Mostly Compliant', variant: 'secondary', icon: <AlertCircle className="w-3 h-3" /> },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
  NOT_STARTED: { label: 'Not Started', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
};

export default function ReportsPage() {
  const t = useTranslations('common');

  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  // Fetch compliance report data
  useEffect(() => {
    async function fetchReport() {
      try {
        setIsLoading(true);
        setError(null);
        const url = selectedFramework !== 'all'
          ? `/api/reports/compliance?frameworkId=${selectedFramework}`
          : '/api/reports/compliance';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch report');

        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [selectedFramework]);

  // Export CSV
  async function handleExport() {
    try {
      setIsExporting(true);
      const url = selectedFramework !== 'all'
        ? `/api/reports/compliance?format=csv&frameworkId=${selectedFramework}`
        : '/api/reports/compliance?format=csv';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports')}</h1>
          <p className="text-muted-foreground">Compliance status reports and exports</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports')}</h1>
          <p className="text-muted-foreground">Compliance status reports and exports</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Frameworks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              {report?.frameworks.map((fw) => (
                <SelectItem key={fw.id} value={fw.id}>
                  {fw.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Frameworks</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.overallStatistics.totalFrameworks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliant</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.overallStatistics.compliantFrameworks}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {report.overallStatistics.inProgressFrameworks}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Not Started</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.overallStatistics.notStartedFrameworks}</div>
              </CardContent>
            </Card>
          </div>

          {/* Frameworks Compliance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Framework Compliance Status
              </CardTitle>
              <CardDescription>
                Overview of compliance posture across all active frameworks.
                Generated {new Date(report.generatedAt).toLocaleString()}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Framework</TableHead>
                      <TableHead className="w-[100px]">Version</TableHead>
                      <TableHead className="w-[120px]">Category</TableHead>
                      <TableHead className="w-[100px] text-right">Controls</TableHead>
                      <TableHead className="w-[100px] text-right">Assessed</TableHead>
                      <TableHead className="w-[120px]">Compliance</TableHead>
                      <TableHead className="w-[140px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.frameworks.map((fw) => {
                      const config = statusConfig[fw.status] || statusConfig.NOT_STARTED;
                      return (
                        <TableRow key={fw.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fw.shortName}</div>
                              <div className="text-xs text-muted-foreground">{fw.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{fw.version}</TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 rounded bg-muted">
                              {fw.category.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{fw.totalControls}</TableCell>
                          <TableCell className="text-right">{fw.assessedControls}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    fw.compliancePercentage >= 80
                                      ? 'bg-green-500'
                                      : fw.compliancePercentage >= 40
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${fw.compliancePercentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{fw.compliancePercentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className="gap-1">
                              {config.icon}
                              {config.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {report.frameworks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No framework data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
