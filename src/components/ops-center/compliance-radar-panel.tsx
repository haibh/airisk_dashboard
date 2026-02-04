'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';
import type { ComplianceFramework } from '@/types/dashboard';

const ComplianceSpiderChart = dynamic(
  () => import('@/components/dashboard/compliance-spider-chart').then(mod => ({ default: mod.ComplianceSpiderChart })),
  {
    loading: () => (
      <div className="h-[200px] flex items-center justify-center">
        <Skeleton className="h-[150px] w-[150px] rounded-full" />
      </div>
    ),
    ssr: false,
  }
);

interface ComplianceRadarPanelProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

export function ComplianceRadarPanel({ frameworks, isLoading }: ComplianceRadarPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-[150px] w-[150px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Compliance Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComplianceSpiderChart data={frameworks} />
      </CardContent>
    </Card>
  );
}
