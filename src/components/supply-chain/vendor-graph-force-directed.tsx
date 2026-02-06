'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VendorNodeData {
  id: string;
  name: string;
  tier: number;
  riskScore: number;
  status: string;
}

// Custom node component for vendor display
function VendorNode({ data }: NodeProps<VendorNodeData>) {
  const riskColor = useMemo(() => {
    if (data.riskScore <= 5) return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400';
    if (data.riskScore <= 10) return 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-400';
    if (data.riskScore <= 15) return 'bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-400';
    return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400';
  }, [data.riskScore]);

  const tierVariant = useMemo(() => {
    if (data.tier === 1) return 'default';
    if (data.tier === 2) return 'secondary';
    return 'outline';
  }, [data.tier]);

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 bg-background shadow-lg min-w-[180px]',
        riskColor
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight">{data.name}</h3>
        <Badge variant={tierVariant} className="text-xs shrink-0">
          T{data.tier}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">Risk: {data.riskScore}</span>
        <Badge variant={data.status === 'active' ? 'default' : 'outline'} className="text-xs">
          {data.status}
        </Badge>
      </div>
    </div>
  );
}

const nodeTypes = {
  vendorNode: VendorNode,
};

interface VendorGraphForceDirectedProps {
  nodes: Array<{
    id: string;
    name: string;
    tier: number;
    riskScore: number;
    status: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationshipStrength?: number;
  }>;
  onNodeClick?: (nodeId: string) => void;
}

export function VendorGraphForceDirected({
  nodes: rawNodes,
  edges: rawEdges,
  onNodeClick,
}: VendorGraphForceDirectedProps) {
  // Transform raw nodes to React Flow nodes
  const initialNodes: Node<VendorNodeData>[] = useMemo(
    () =>
      rawNodes.map((node, index) => ({
        id: node.id,
        type: 'vendorNode',
        position: {
          x: (index % 5) * 250,
          y: Math.floor(index / 5) * 150,
        },
        data: {
          id: node.id,
          name: node.name,
          tier: node.tier,
          riskScore: node.riskScore,
          status: node.status,
        },
      })),
    [rawNodes]
  );

  // Transform raw edges to React Flow edges
  const initialEdges: Edge[] = useMemo(
    () =>
      rawEdges.map((edge, index) => {
        const strength = edge.relationshipStrength ?? 0.5;
        return {
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: strength > 0.7,
          style: {
            strokeWidth: Math.max(1, strength * 4),
            stroke: 'hsl(var(--muted-foreground))',
            opacity: 0.6,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: 'hsl(var(--muted-foreground))',
          },
        };
      }),
    [rawEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-muted/10"
      >
        <Background gap={16} size={1} className="bg-muted/5" />
        <Controls className="bg-background border border-border rounded-md shadow-md" />
        <MiniMap
          className="bg-background border border-border rounded-md shadow-md"
          nodeColor={(node) => {
            const data = node.data as VendorNodeData;
            if (data.riskScore <= 5) return '#22c55e';
            if (data.riskScore <= 10) return '#eab308';
            if (data.riskScore <= 15) return '#f97316';
            return '#ef4444';
          }}
          maskColor="hsl(var(--muted) / 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
