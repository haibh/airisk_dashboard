'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Network, Grid3x3, RefreshCw, AlertCircle } from 'lucide-react';
import { SankeyFrameworkOverlap } from './sankey-framework-overlap';
import { ControlMappingMatrix } from './control-mapping-matrix';
import { cn } from '@/lib/utils';

// Types
interface SankeyNode {
  id: string;
  label: string;
  group: 'source' | 'target';
  controlCount: number;
}

interface SankeyEdge {
  source: string;
  target: string;
  value: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SankeyData {
  nodes: SankeyNode[];
  edges: SankeyEdge[];
}

interface StatisticData {
  sourceFramework: string;
  targetFramework: string;
  totalMappings: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
}

interface FrameworkOverlapWidgetProps {
  className?: string;
}

type ViewMode = 'sankey' | 'matrix';

export function FrameworkOverlapWidget({ className }: FrameworkOverlapWidgetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('sankey');
  const [sankeyData, setSankeyData] = useState<SankeyData>({ nodes: [], edges: [] });
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch sankey data
      const sankeyResponse = await fetch('/api/framework-overlap/sankey-data');
      if (!sankeyResponse.ok) throw new Error('Failed to fetch sankey data');
      const sankeyResult = await sankeyResponse.json();

      // Fetch statistics
      const statsResponse = await fetch('/api/framework-overlap/statistics');
      if (!statsResponse.ok) throw new Error('Failed to fetch statistics');
      const statsResult = await statsResponse.json();

      setSankeyData(sankeyResult);
      setStatistics(statsResult.statistics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get unique source frameworks for filter
  const sourceFrameworks = React.useMemo(() => {
    const sources = new Set<string>();
    statistics.forEach((stat) => sources.add(stat.sourceFramework));
    return Array.from(sources).sort();
  }, [statistics]);

  // Filter data based on selections
  const filteredSankeyData = React.useMemo(() => {
    if (sourceFilter === 'all' && confidenceFilter === 'all') {
      return sankeyData;
    }

    let filteredEdges = sankeyData.edges;

    if (sourceFilter !== 'all') {
      filteredEdges = filteredEdges.filter((edge) => edge.source === sourceFilter);
    }

    if (confidenceFilter !== 'all') {
      filteredEdges = filteredEdges.filter((edge) => edge.confidence === confidenceFilter);
    }

    // Filter nodes to only include those referenced in edges
    const referencedNodes = new Set<string>();
    filteredEdges.forEach((edge) => {
      referencedNodes.add(edge.source);
      referencedNodes.add(edge.target);
    });

    const filteredNodes = sankeyData.nodes.filter((node) => referencedNodes.has(node.id));

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [sankeyData, sourceFilter, confidenceFilter]);

  const filteredStatistics = React.useMemo(() => {
    if (sourceFilter === 'all') return statistics;
    return statistics.filter((stat) => stat.sourceFramework === sourceFilter);
  }, [statistics, sourceFilter]);

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    const totalMappings = filteredStatistics.reduce((sum, stat) => sum + stat.totalMappings, 0);
    const frameworksCovered = new Set([
      ...filteredStatistics.map((s) => s.sourceFramework),
      ...filteredStatistics.map((s) => s.targetFramework),
    ]).size;
    const avgOverlap = frameworksCovered > 0 ? (totalMappings / frameworksCovered).toFixed(1) : '0';

    return { totalMappings, frameworksCovered, avgOverlap };
  }, [filteredStatistics]);

  // Loading skeleton
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Framework Control Overlap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Framework Control Overlap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 mb-3">
              <Network className="h-5 w-5" />
              Framework Control Overlap
            </CardTitle>

            {/* Summary stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Mappings:</span>
                <Badge variant="secondary">{summaryStats.totalMappings}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Frameworks:</span>
                <Badge variant="secondary">{summaryStats.frameworksCovered}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Avg Overlap:</span>
                <Badge variant="secondary">{summaryStats.avgOverlap}</Badge>
              </div>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'sankey' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('sankey')}
              className="h-8"
            >
              <Network className="h-4 w-4 mr-1" />
              Sankey
            </Button>
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('matrix')}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4 mr-1" />
              Matrix
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All source frameworks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Source Frameworks</SelectItem>
                {sourceFrameworks.map((fw) => (
                  <SelectItem key={fw} value={fw}>
                    {fw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All confidence levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence Levels</SelectItem>
                <SelectItem value="HIGH">High Confidence</SelectItem>
                <SelectItem value="MEDIUM">Medium Confidence</SelectItem>
                <SelectItem value="LOW">Low Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="h-9"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'sankey' ? (
          <SankeyFrameworkOverlap data={filteredSankeyData} />
        ) : (
          <ControlMappingMatrix
            statistics={filteredStatistics}
            onCellClick={(source, target) => {
              console.log('Cell clicked:', source, target);
              // Could navigate to detailed mappings view or open a modal
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
