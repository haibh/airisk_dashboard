'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, Shield, Folder, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ChainStatus = 'COMPLETE' | 'PARTIAL' | 'MISSING';

interface ChainNodeData {
  label: string;
  status: ChainStatus;
  type: 'requirement' | 'control' | 'evidence';
  count?: number;
}

const ICONS = {
  requirement: FileText,
  control: Shield,
  evidence: Folder,
};

const STATUS_ICONS = {
  COMPLETE: CheckCircle,
  PARTIAL: AlertCircle,
  MISSING: XCircle,
};

const NODE_COLORS = {
  requirement: 'bg-blue-500/10 border-blue-500/30',
  control: 'bg-purple-500/10 border-purple-500/30',
  evidence_COMPLETE: 'bg-green-500/10 border-green-500/30',
  evidence_PARTIAL: 'bg-yellow-500/10 border-yellow-500/30',
  evidence_MISSING: 'bg-red-500/10 border-red-500/30',
};

function ChainNode({ data }: { data: ChainNodeData }) {
  const Icon = ICONS[data.type];
  const StatusIcon = STATUS_ICONS[data.status];
  const bgColor = data.type === 'evidence'
    ? NODE_COLORS[`evidence_${data.status}`]
    : NODE_COLORS[data.type];
  const variant = data.status === 'COMPLETE' ? 'default' : data.status === 'PARTIAL' ? 'secondary' : 'destructive';

  return (
    <div className={cn('px-4 py-3 rounded-lg border-2 bg-card shadow-md min-w-[180px] transition-all hover:shadow-lg', bgColor)}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div className="flex items-start gap-2">
        <Icon className="h-5 w-5 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-1 line-clamp-2">{data.label}</div>
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-4 w-4',
              data.status === 'COMPLETE' ? 'text-green-500' :
              data.status === 'PARTIAL' ? 'text-yellow-500' : 'text-red-500'
            )} />
            <Badge variant={variant} className="text-xs">{data.status}</Badge>
            {data.count !== undefined && <span className="text-xs text-muted-foreground">({data.count})</span>}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  );
}

const nodeTypes = { chainNode: ChainNode };

interface FlowData {
  nodes: Node<ChainNodeData>[];
  edges: Edge[];
}

interface ChainFlowDiagramProps {
  flowData: FlowData;
  onNodeClick?: (node: Node<ChainNodeData>) => void;
}

const POSITIONS = { requirement: 50, control: 350, evidence: 650 };

function ChainFlowDiagramInner({ flowData, onNodeClick }: ChainFlowDiagramProps) {
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const layoutNodes = flowData.nodes.map((node, index) => ({
      ...node,
      position: { x: POSITIONS[node.data.type as keyof typeof POSITIONS] || 0, y: index * 120 },
      type: 'chainNode',
    }));

    const styledEdges = flowData.edges.map((edge) => {
      const targetNode = flowData.nodes.find((n) => n.id === edge.target);
      const status = targetNode?.data?.status || 'COMPLETE';
      const strokeColor = status === 'COMPLETE' ? 'hsl(var(--primary))' :
                          status === 'PARTIAL' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

      return {
        ...edge,
        animated: status === 'PARTIAL',
        style: { stroke: strokeColor, strokeWidth: 2, strokeDasharray: status === 'MISSING' ? '5,5' : undefined },
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
      };
    });

    return { nodes: layoutNodes, edges: styledEdges };
  }, [flowData]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => onNodeClick?.(node as Node<ChainNodeData>),
    [onNodeClick]
  );

  React.useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [fitView, flowData]);

  return (
    <div className="w-full h-full">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={handleNodeClick} fitView proOptions={{ hideAttribution: true }}>
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export function ChainFlowDiagram(props: ChainFlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <ChainFlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
}
