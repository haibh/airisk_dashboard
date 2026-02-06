/**
 * Compliance Chain Builder Utility
 * Builds React Flow graph data and calculates coverage statistics
 */

import type { ComplianceChain, Control, Evidence } from '@prisma/client';

export interface FlowNode {
  id: string;
  type: 'requirement' | 'control' | 'evidence';
  data: {
    label: string;
    status?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface CoverageStats {
  total: number;
  complete: number;
  partial: number;
  missing: number;
  coveragePercent: number;
}

export interface FrameworkCoverage {
  id: string;
  name: string;
  total: number;
  complete: number;
  partial: number;
  missing: number;
  coveragePercent: number;
}

/**
 * Build React Flow data from compliance chains
 */
export function buildFlowData(
  chains: (ComplianceChain & { control?: { id: string; code: string; title: string } | null })[],
  evidenceMap: Map<string, { id: string; filename: string; originalName: string }[]>
): FlowData {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const addedNodes = new Set<string>();

  for (const chain of chains) {
    // Add requirement node
    const reqNodeId = `req-${chain.id}`;
    if (!addedNodes.has(reqNodeId)) {
      nodes.push({
        id: reqNodeId,
        type: 'requirement',
        data: {
          label: chain.requirement.substring(0, 50) + (chain.requirement.length > 50 ? '...' : ''),
        },
      });
      addedNodes.add(reqNodeId);
    }

    // Add control node if exists
    if (chain.controlId && chain.control) {
      const ctrlNodeId = `ctrl-${chain.controlId}`;
      if (!addedNodes.has(ctrlNodeId)) {
        nodes.push({
          id: ctrlNodeId,
          type: 'control',
          data: {
            label: chain.control.code || 'Unknown',
            status: chain.chainStatus,
          },
        });
        addedNodes.add(ctrlNodeId);
      }

      // Add edge: requirement -> control
      edges.push({
        id: `e-req-ctrl-${chain.id}`,
        source: reqNodeId,
        target: ctrlNodeId,
      });

      // Add evidence nodes
      const evidences = evidenceMap.get(chain.id) || [];
      for (const evidence of evidences) {
        const evNodeId = `ev-${evidence.id}`;
        if (!addedNodes.has(evNodeId)) {
          nodes.push({
            id: evNodeId,
            type: 'evidence',
            data: {
              label: evidence.filename || evidence.originalName || 'Evidence',
            },
          });
          addedNodes.add(evNodeId);
        }

        // Add edge: control -> evidence
        edges.push({
          id: `e-ctrl-ev-${chain.id}-${evidence.id}`,
          source: ctrlNodeId,
          target: evNodeId,
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Calculate coverage statistics for framework controls
 */
export function calculateCoverageStats(
  chains: ComplianceChain[],
  totalControls: number
): CoverageStats {
  const complete = chains.filter((c) => c.chainStatus === 'COMPLETE').length;
  const partial = chains.filter((c) => c.chainStatus === 'PARTIAL').length;
  const missing = chains.filter((c) => c.chainStatus === 'MISSING').length;
  const unmapped = totalControls - (complete + partial + missing);

  return {
    total: totalControls,
    complete,
    partial,
    missing: missing + unmapped,
    coveragePercent: totalControls > 0 ? Math.round((complete / totalControls) * 100) : 0,
  };
}

/**
 * Get color for chain status
 */
export function getChainStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETE':
      return 'green';
    case 'PARTIAL':
      return 'yellow';
    case 'MISSING':
      return 'red';
    default:
      return 'gray';
  }
}
