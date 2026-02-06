'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChainFlowDiagram } from './chain-flow-diagram';
import { CoverageDonutChart } from './coverage-donut-chart';
import { AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Node } from 'reactflow';

interface ChainNodeData {
  label: string;
  status: 'COMPLETE' | 'PARTIAL' | 'MISSING';
  type: 'requirement' | 'control' | 'evidence';
  count?: number;
  description?: string;
  linkedItems?: Array<{ id: string; name: string; type: string }>;
}

interface FlowData {
  nodes: Node<ChainNodeData>[];
  edges: Array<{ id: string; source: string; target: string }>;
}

interface CoverageData {
  frameworkId: string;
  frameworkName: string;
  complete: number;
  partial: number;
  missing: number;
  percentage: number;
}

interface ChainExplorerWidgetProps {
  className?: string;
}

export function ChainExplorerWidget({ className }: ChainExplorerWidgetProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [coverageData, setCoverageData] = useState<CoverageData[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<ChainNodeData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch coverage data on mount
  useEffect(() => {
    fetchCoverageData();
  }, []);

  // Fetch flow data when framework changes
  useEffect(() => {
    if (selectedFramework) {
      fetchFlowData(selectedFramework);
    }
  }, [selectedFramework]);

  const fetchCoverageData = async () => {
    try {
      const response = await fetch('/api/compliance-graph/coverage');
      if (!response.ok) throw new Error('Failed to fetch coverage data');
      const data = await response.json();
      setCoverageData(data.coverage || []);
      if (data.coverage?.[0]) setSelectedFramework(data.coverage[0].frameworkId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coverage data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlowData = async (frameworkId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/compliance-graph/flow-data?frameworkId=${frameworkId}`);
      if (!response.ok) throw new Error('Failed to fetch flow data');
      const data = await response.json();
      setFlowData(data);
      setSelectedNode(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chain data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    selectedFramework ? fetchFlowData(selectedFramework) : fetchCoverageData();
  };

  const selectedCoverage = coverageData.find((c) => c.frameworkId === selectedFramework);
  const totalChains = flowData?.nodes.filter((n) => n.data.type === 'requirement').length || 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-xl font-bold">Compliance Chain Explorer</CardTitle>
          <div className="flex items-center gap-3">
            {coverageData.length > 0 && (
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select framework" /></SelectTrigger>
                <SelectContent>
                  {coverageData.map((c) => (
                    <SelectItem key={c.frameworkId} value={c.frameworkId}>{c.frameworkName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {error && (
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />Retry
              </Button>
            )}
          </div>
        </div>
        {selectedCoverage && !error && (
          <div className="flex items-center gap-4 flex-wrap mt-4 text-sm">
            <span className="text-muted-foreground">Chains: <Badge variant="outline">{totalChains}</Badge></span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" />{selectedCoverage.complete} ({selectedCoverage.percentage.toFixed(0)}%)</span>
            <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4 text-yellow-500" />{selectedCoverage.partial}</span>
            <span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-red-500" />{selectedCoverage.missing}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold mb-2">Failed to load data</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[600px] border rounded-lg bg-muted/20">
              {flowData?.nodes.length ? (
                <ChainFlowDiagram flowData={flowData} onNodeClick={setSelectedNode} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No chain data available</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {selectedCoverage && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Coverage</CardTitle></CardHeader>
                  <CardContent>
                    <CoverageDonutChart coverage={{ complete: selectedCoverage.complete, partial: selectedCoverage.partial, missing: selectedCoverage.missing, percentage: selectedCoverage.percentage }} />
                  </CardContent>
                </Card>
              )}
              {selectedNode && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><div className="text-xs text-muted-foreground uppercase mb-1">Type</div><Badge variant="outline">{selectedNode.data.type}</Badge></div>
                    <div><div className="text-xs text-muted-foreground uppercase mb-1">Label</div><p className="font-medium">{selectedNode.data.label}</p></div>
                    <div><div className="text-xs text-muted-foreground uppercase mb-1">Status</div><Badge variant={selectedNode.data.status === 'COMPLETE' ? 'default' : selectedNode.data.status === 'PARTIAL' ? 'secondary' : 'destructive'}>{selectedNode.data.status}</Badge></div>
                    {selectedNode.data.description && <div><div className="text-xs text-muted-foreground uppercase mb-1">Description</div><p>{selectedNode.data.description}</p></div>}
                    {selectedNode.data.linkedItems?.length && (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase mb-2">Linked ({selectedNode.data.linkedItems.length})</div>
                        {selectedNode.data.linkedItems.map((item) => (
                          <div key={item.id} className="text-xs p-2 rounded bg-muted/50 flex justify-between mb-1">
                            <span className="font-medium truncate">{item.name}</span>
                            <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
