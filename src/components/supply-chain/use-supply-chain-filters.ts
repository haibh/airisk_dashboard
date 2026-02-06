import { useMemo } from 'react';

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

export function useSupplyChainFilters(
  nodes: GraphNode[],
  edges: GraphEdge[],
  tierFilter: string,
  riskFilter: string
) {
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (tierFilter !== 'all' && node.tier !== parseInt(tierFilter)) {
        return false;
      }
      if (riskFilter !== 'all') {
        const risk = node.riskScore;
        if (riskFilter === 'low' && risk > 5) return false;
        if (riskFilter === 'medium' && (risk <= 5 || risk > 10)) return false;
        if (riskFilter === 'high' && (risk <= 10 || risk > 15)) return false;
        if (riskFilter === 'critical' && risk <= 15) return false;
      }
      return true;
    });
  }, [nodes, tierFilter, riskFilter]);

  const filteredEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        filteredNodes.some((n) => n.id === edge.source) &&
        filteredNodes.some((n) => n.id === edge.target)
    );
  }, [edges, filteredNodes]);

  return { filteredNodes, filteredEdges };
}
