'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComplianceFramework } from '@/types/dashboard';

interface CrossFrameworkMappingVizProps {
  frameworks: ComplianceFramework[];
  isLoading?: boolean;
}

interface MappingData {
  sourceFrameworkId: string;
  targetFrameworkId: string;
  count: number;
}

function getMappingStatus(mappingCount: number): 'mapped' | 'partial' | 'unmapped' {
  if (mappingCount >= 10) return 'mapped';
  if (mappingCount >= 1) return 'partial';
  return 'unmapped';
}

const STATUS_STYLES = {
  mapped: 'bg-green-500/20 text-green-400 border border-green-500/30',
  partial: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  unmapped: 'bg-muted/50 text-muted-foreground',
};

export function CrossFrameworkMappingViz({ frameworks, isLoading }: CrossFrameworkMappingVizProps) {
  const [mappingMatrix, setMappingMatrix] = useState<Map<string, number>>(new Map());
  const [loadingMappings, setLoadingMappings] = useState(true);

  // Fetch actual mapping data
  useEffect(() => {
    async function fetchMappings() {
      try {
        const response = await fetch('/api/frameworks/mappings');
        if (response.ok) {
          const data = await response.json();
          // Build mapping matrix: key = "sourceId-targetId", value = count
          const matrix = new Map<string, number>();
          for (const mapping of data) {
            const key = `${mapping.sourceFrameworkId}-${mapping.targetFrameworkId}`;
            matrix.set(key, (matrix.get(key) || 0) + 1);
          }
          setMappingMatrix(matrix);
        }
      } catch (error) {
        console.error('Failed to fetch mappings:', error);
      } finally {
        setLoadingMappings(false);
      }
    }
    if (frameworks.length >= 2) {
      fetchMappings();
    }
  }, [frameworks]);

  const getMappingCount = (sourceId: string, targetId: string): number => {
    // Check both directions since mappings can be bidirectional
    const direct = mappingMatrix.get(`${sourceId}-${targetId}`) || 0;
    const reverse = mappingMatrix.get(`${targetId}-${sourceId}`) || 0;
    return direct + reverse;
  };
  if (isLoading || loadingMappings) {
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
        <p className="text-xs text-muted-foreground">Control mappings between frameworks</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-1.5 text-muted-foreground font-medium sticky left-0 bg-card z-10">Framework</th>
                {frameworks.map((fw) => (
                  <th key={fw.frameworkId} className="text-center p-1.5 text-muted-foreground font-medium whitespace-nowrap">
                    {fw.framework}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frameworks.map((row) => (
                <tr key={row.frameworkId}>
                  <td className="p-1.5 font-medium whitespace-nowrap sticky left-0 bg-card z-10">{row.framework}</td>
                  {frameworks.map((col) => {
                    if (row.frameworkId === col.frameworkId) {
                      return (
                        <td key={col.frameworkId} className="p-1">
                          <div className="h-7 rounded bg-muted/30 flex items-center justify-center text-muted-foreground">
                            &mdash;
                          </div>
                        </td>
                      );
                    }
                    const count = getMappingCount(row.frameworkId, col.frameworkId);
                    const status = getMappingStatus(count);
                    return (
                      <td key={col.frameworkId} className="p-1">
                        <div
                          className={`h-7 rounded flex items-center justify-center text-[10px] font-medium ${STATUS_STYLES[status]}`}
                          title={`${count} control mapping(s)`}
                        >
                          {count > 0 ? count : '—'}
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
            <div className="h-2.5 w-2.5 rounded bg-green-500/20 border border-green-500/30" /> 10+ mappings
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-yellow-500/20 border border-yellow-500/30" /> 1-9 mappings
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-muted/50" /> No mappings
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
