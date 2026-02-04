'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComplianceFramework } from '@/types/dashboard';

interface CrossFrameworkMappingVizProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

function getMappingStatus(mapped: number, total: number): 'mapped' | 'partial' | 'unmapped' {
  if (total === 0) return 'unmapped';
  const ratio = mapped / total;
  if (ratio >= 0.8) return 'mapped';
  if (ratio >= 0.3) return 'partial';
  return 'unmapped';
}

const STATUS_STYLES = {
  mapped: 'bg-green-500/80 text-white',
  partial: 'bg-yellow-500/80 text-white',
  unmapped: 'bg-muted text-muted-foreground',
};

export function CrossFrameworkMappingViz({ frameworks, isLoading }: CrossFrameworkMappingVizProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (frameworks.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cross-Framework Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Need 2+ frameworks for mapping</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Cross-Framework Mapping</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-1.5 text-muted-foreground font-medium">Framework</th>
                {frameworks.map((fw) => (
                  <th key={fw.frameworkId} className="text-center p-1.5 text-muted-foreground font-medium">
                    {fw.framework}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frameworks.map((row) => (
                <tr key={row.frameworkId}>
                  <td className="p-1.5 font-medium">{row.framework}</td>
                  {frameworks.map((col) => {
                    if (row.frameworkId === col.frameworkId) {
                      return (
                        <td key={col.frameworkId} className="p-1">
                          <div className="h-7 rounded bg-muted/50 flex items-center justify-center text-muted-foreground">
                            &mdash;
                          </div>
                        </td>
                      );
                    }
                    const status = getMappingStatus(row.mappedControls, row.totalControls);
                    return (
                      <td key={col.frameworkId} className="p-1">
                        <div className={`h-7 rounded flex items-center justify-center text-[10px] font-medium ${STATUS_STYLES[status]}`}>
                          {status}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-green-500/80" /> Mapped
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-yellow-500/80" /> Partial
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-muted" /> Unmapped
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
