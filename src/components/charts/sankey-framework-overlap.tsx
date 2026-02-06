'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Types for the data structure
interface FrameworkNode {
  id: string;
  label: string;
  group: 'source' | 'target';
  controlCount: number;
}

interface FrameworkEdge {
  source: string;
  target: string;
  value: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SankeyData {
  nodes: FrameworkNode[];
  edges: FrameworkEdge[];
}

interface SankeyFrameworkOverlapProps {
  data: SankeyData;
}

// Custom node component
const FrameworkNodeComponent = ({ data }: { data: { label: string; controlCount: number } }) => {
  return (
    <div className="relative">
      <div className={cn(
        'px-4 py-3 rounded-lg border-2 bg-card text-card-foreground shadow-lg',
        'min-w-[180px] transition-all hover:shadow-xl hover:scale-105'
      )}>
        <div className="font-semibold text-sm mb-1">{data.label}</div>
        <Badge variant="secondary" className="text-xs">
          {data.controlCount} controls
        </Badge>
      </div>
    </div>
  );
};

const nodeTypes = {
  frameworkNode: FrameworkNodeComponent,
};

export function SankeyFrameworkOverlap({ data }: SankeyFrameworkOverlapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Calculate positions for nodes
  const layoutNodes = useCallback((nodeData: FrameworkNode[]): Node[] => {
    const sourceNodes = nodeData.filter((n) => n.group === 'source');
    const targetNodes = nodeData.filter((n) => n.group === 'target');

    const sourceX = 50;
    const targetX = 600;
    const verticalSpacing = 100;
    const startY = 50;

    const createNodes = (
      items: FrameworkNode[],
      x: number,
      position: Position
    ): Node[] => {
      return items.map((item, index) => ({
        id: item.id,
        type: 'frameworkNode',
        position: { x, y: startY + index * verticalSpacing },
        data: {
          label: item.label,
          controlCount: item.controlCount,
        },
        sourcePosition: position,
        targetPosition: position === Position.Right ? Position.Left : Position.Right,
      }));
    };

    return [
      ...createNodes(sourceNodes, sourceX, Position.Right),
      ...createNodes(targetNodes, targetX, Position.Left),
    ];
  }, []);

  // Get edge color and animation based on confidence
  const getEdgeStyle = useCallback((confidence: string) => {
    const baseStyle = {
      strokeWidth: 2,
    };

    switch (confidence) {
      case 'HIGH':
        return {
          ...baseStyle,
          stroke: 'hsl(var(--primary))',
          strokeWidth: 3,
        };
      case 'MEDIUM':
        return {
          ...baseStyle,
          stroke: 'hsl(var(--warning) / 0.7)',
          strokeWidth: 2,
        };
      case 'LOW':
        return {
          ...baseStyle,
          stroke: 'hsl(var(--muted-foreground) / 0.4)',
          strokeWidth: 1.5,
        };
      default:
        return baseStyle;
    }
  }, []);

  // Create edges with styling
  const layoutEdges = useMemo((): Edge[] => {
    return data.edges.map((edge, index) => {
      const style = getEdgeStyle(edge.confidence);

      return {
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: ConnectionLineType.SmoothStep,
        animated: edge.confidence === 'HIGH',
        style,
        label: `${edge.value}`,
        labelStyle: {
          fontSize: 11,
          fill: 'hsl(var(--foreground))',
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: 'hsl(var(--background))',
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 4],
        labelBgBorderRadius: 4,
        data: {
          value: edge.value,
          confidence: edge.confidence,
        },
      };
    });
  }, [data.edges, getEdgeStyle]);

  // Initialize layout when data changes
  useEffect(() => {
    if (data.nodes.length > 0) {
      const layoutedNodes = layoutNodes(data.nodes);
      setNodes(layoutedNodes);
    }
  }, [data.nodes, layoutNodes, setNodes]);

  useEffect(() => {
    if (data.edges.length > 0) {
      setEdges(layoutEdges);
    }
  }, [data.edges, layoutEdges, setEdges]);

  if (!data.nodes.length || !data.edges.length) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        No framework overlap data available
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full border rounded-lg bg-background/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        attributionPosition="bottom-right"
      >
        <Controls showInteractive={false} />
        <Background gap={16} size={1} color="hsl(var(--muted-foreground) / 0.1)" />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="text-xs font-semibold mb-2">Confidence Level</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary rounded" />
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 rounded" style={{ background: 'hsl(var(--warning) / 0.7)' }} />
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-muted-foreground/40 rounded" />
            <span className="text-xs">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
