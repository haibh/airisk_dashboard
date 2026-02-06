/**
 * Control mapping transformation utilities for framework overlap visualization
 * Supports Sankey diagram data generation and overlap statistics calculation
 */

import type { ControlMapping, ConfidenceLevel, MappingType } from '@prisma/client';

export interface SankeyNode {
  id: string;
  name: string;
  type: 'framework' | 'control';
}

export interface SankeyEdge {
  source: string;
  target: string;
  value: number;
  label: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  edges: SankeyEdge[];
}

export interface FrameworkInfo {
  id: string;
  name: string;
  shortName: string;
}

export interface ControlInfo {
  id: string;
  code: string;
  title: string;
  frameworkId: string;
}

export interface MappingWithControls {
  id: string;
  sourceControl: ControlInfo;
  targetControl: ControlInfo;
  confidenceScore: ConfidenceLevel;
  mappingType: MappingType;
}

export interface OverlapStatistics {
  framework1: string;
  framework2: string;
  totalMappings: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  equivalent: number;
  partial: number;
  related: number;
  superset: number;
  subset: number;
}

/**
 * Transform control mappings to Sankey/React Flow visualization format
 */
export function transformToSankeyData(
  mappings: MappingWithControls[],
  frameworks: FrameworkInfo[]
): SankeyData {
  const nodes: SankeyNode[] = [];
  const edges: SankeyEdge[] = [];
  const nodeIds = new Set<string>();

  // Add framework nodes
  frameworks.forEach((fw) => {
    const nodeId = `fw-${fw.id}`;
    if (!nodeIds.has(nodeId)) {
      nodes.push({
        id: nodeId,
        name: fw.shortName,
        type: 'framework',
      });
      nodeIds.add(nodeId);
    }
  });

  // Add control nodes and edges from mappings
  mappings.forEach((mapping) => {
    const sourceNodeId = `ctrl-${mapping.sourceControl.id}`;
    const targetNodeId = `ctrl-${mapping.targetControl.id}`;

    // Add source control node
    if (!nodeIds.has(sourceNodeId)) {
      nodes.push({
        id: sourceNodeId,
        name: mapping.sourceControl.code,
        type: 'control',
      });
      nodeIds.add(sourceNodeId);
    }

    // Add target control node
    if (!nodeIds.has(targetNodeId)) {
      nodes.push({
        id: targetNodeId,
        name: mapping.targetControl.code,
        type: 'control',
      });
      nodeIds.add(targetNodeId);
    }

    // Add edge between controls
    const value = getConfidenceWeight(mapping.confidenceScore);
    edges.push({
      source: sourceNodeId,
      target: targetNodeId,
      value,
      label: mapping.confidenceScore,
    });
  });

  return { nodes, edges };
}

/**
 * Calculate overlap statistics between framework pairs
 */
export function calculateOverlapStatistics(
  mappings: Array<{
    sourceFrameworkId: string;
    targetFrameworkId: string;
    confidenceScore: ConfidenceLevel;
    mappingType: MappingType;
  }>,
  frameworks: FrameworkInfo[]
): OverlapStatistics[] {
  const statistics: OverlapStatistics[] = [];
  const frameworkMap = new Map(frameworks.map((f) => [f.id, f.shortName]));

  // Generate all framework pairs
  for (let i = 0; i < frameworks.length; i++) {
    for (let j = i + 1; j < frameworks.length; j++) {
      const fw1 = frameworks[i];
      const fw2 = frameworks[j];

      // Filter mappings for this pair (bidirectional)
      const pairMappings = mappings.filter(
        (m) =>
          (m.sourceFrameworkId === fw1.id && m.targetFrameworkId === fw2.id) ||
          (m.sourceFrameworkId === fw2.id && m.targetFrameworkId === fw1.id)
      );

      if (pairMappings.length === 0) continue;

      // Count by confidence level
      const highConfidence = pairMappings.filter((m) => m.confidenceScore === 'HIGH').length;
      const mediumConfidence = pairMappings.filter((m) => m.confidenceScore === 'MEDIUM').length;
      const lowConfidence = pairMappings.filter((m) => m.confidenceScore === 'LOW').length;

      // Count by mapping type
      const equivalent = pairMappings.filter((m) => m.mappingType === 'EQUIVALENT').length;
      const partial = pairMappings.filter((m) => m.mappingType === 'PARTIAL').length;
      const related = pairMappings.filter((m) => m.mappingType === 'RELATED').length;
      const superset = pairMappings.filter((m) => m.mappingType === 'SUPERSET').length;
      const subset = pairMappings.filter((m) => m.mappingType === 'SUBSET').length;

      statistics.push({
        framework1: frameworkMap.get(fw1.id) || fw1.shortName,
        framework2: frameworkMap.get(fw2.id) || fw2.shortName,
        totalMappings: pairMappings.length,
        highConfidence,
        mediumConfidence,
        lowConfidence,
        equivalent,
        partial,
        related,
        superset,
        subset,
      });
    }
  }

  // Sort by total mappings descending
  return statistics.sort((a, b) => b.totalMappings - a.totalMappings);
}

/**
 * Get numeric weight for confidence level (for Sankey edge values)
 */
export function getConfidenceWeight(level: ConfidenceLevel): number {
  switch (level) {
    case 'HIGH':
      return 3;
    case 'MEDIUM':
      return 2;
    case 'LOW':
      return 1;
    default:
      return 1;
  }
}
