'use client';

import { useState, useEffect, useCallback } from 'react';
import { VendorGraphForceDirected } from './vendor-graph-force-directed';
import { VendorRiskHeatmapOverlay } from './vendor-risk-heatmap-overlay';
import { VendorDetailPanel } from './vendor-detail-panel';
import { SupplyChainToolbar } from './supply-chain-toolbar';
import { SupplyChainErrorState } from './supply-chain-error-state';
import { SupplyChainLoadingState } from './supply-chain-loading-state';
import { useSupplyChainFilters } from './use-supply-chain-filters';
import { cn } from '@/lib/utils';

interface GraphNode {
  id: string;
  name: string;
  tier: number;
  riskScore: number;
  status: string;
}

interface GraphEdge {
  source: string;
  target: string;
  relationshipStrength?: number;
}

interface RiskPath {
  sourceVendorId: string;
  sourceVendorName: string;
  targetVendorId: string;
  targetVendorName: string;
  riskScore: number;
  propagationFactor: number;
  propagatedRisk: number;
  path: string[];
}

interface VendorDetails {
  id: string;
  name: string;
  tier: number;
  status: string;
  riskScore: number;
  services: string[];
  contactEmail?: string;
  contactPhone?: string;
  lastAssessmentDate?: string;
  childVendors?: Array<{
    id: string;
    name: string;
    riskScore: number;
  }>;
}

export function SupplyChainDashboardPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [riskPaths, setRiskPaths] = useState<RiskPath[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorDetails | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/supply-chain/graph');
      if (!response.ok) {
        throw new Error('Failed to fetch supply chain graph');
      }
      const data = await response.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRiskPropagation = useCallback(async (vendorId: string) => {
    try {
      const response = await fetch(`/api/supply-chain/risk-propagation?vendorId=${vendorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch risk propagation');
      }
      const data = await response.json();
      setRiskPaths(data.paths || []);
    } catch (err) {
      console.error('Error fetching risk propagation:', err);
      setRiskPaths([]);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        // Fetch detailed vendor information
        const vendorDetails: VendorDetails = {
          ...node,
          services: ['Cloud Infrastructure', 'Data Storage', 'API Services'],
          contactEmail: `contact@${node.name.toLowerCase().replace(/\s+/g, '')}.com`,
          contactPhone: '+1 (555) 123-4567',
          lastAssessmentDate: new Date().toISOString(),
          childVendors: edges
            .filter((e) => e.source === nodeId)
            .map((e) => {
              const child = nodes.find((n) => n.id === e.target);
              return child
                ? { id: child.id, name: child.name, riskScore: child.riskScore }
                : null;
            })
            .filter((v): v is NonNullable<typeof v> => v !== null),
        };
        setSelectedVendor(vendorDetails);
        fetchRiskPropagation(nodeId);
      }
    },
    [nodes, edges, fetchRiskPropagation]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedVendor(null);
    setRiskPaths([]);
    setShowHeatmap(false);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchGraphData();
    setSelectedVendor(null);
    setRiskPaths([]);
    setShowHeatmap(false);
  }, [fetchGraphData]);

  const { filteredNodes, filteredEdges } = useSupplyChainFilters(
    nodes,
    edges,
    tierFilter,
    riskFilter
  );

  if (loading) {
    return <SupplyChainLoadingState />;
  }

  if (error) {
    return <SupplyChainErrorState error={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <SupplyChainToolbar
        nodeCount={nodes.length}
        tierFilter={tierFilter}
        riskFilter={riskFilter}
        onTierFilterChange={setTierFilter}
        onRiskFilterChange={setRiskFilter}
        onRefresh={handleRefresh}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph Area */}
        <div className={cn('flex-1 relative', selectedVendor && 'w-2/3')}>
          {selectedVendor && (
            <div className="absolute top-4 left-4 z-10">
              <VendorRiskHeatmapOverlay
                riskPaths={riskPaths}
                isVisible={showHeatmap}
                onToggle={() => setShowHeatmap(!showHeatmap)}
              />
            </div>
          )}
          <VendorGraphForceDirected
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Detail Panel */}
        {selectedVendor && (
          <div className="w-1/3 min-w-[400px] max-w-[500px]">
            <VendorDetailPanel vendor={selectedVendor} onClose={handleClosePanel} />
          </div>
        )}
      </div>
    </div>
  );
}
