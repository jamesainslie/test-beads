import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, type GraphData } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  open: '#22c55e',
  in_progress: '#3b82f6',
  blocked: '#ef4444',
  closed: '#6b7280',
};

interface SimNode {
  id: string;
  x?: number;
  y?: number;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
}

function applyForceLayout(
  nodes: Array<{ id: string }>,
  edges: Array<{ source: string; target: string }>
): Map<string, { x: number; y: number }> {
  const simNodes: SimNode[] = nodes.map((n) => ({ id: n.id }));
  const simLinks: SimLink[] = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  const simulation = forceSimulation(simNodes)
    .force(
      'link',
      forceLink(simLinks)
        .id((d) => (d as SimNode).id)
        .distance(150)
    )
    .force('charge', forceManyBody().strength(-300))
    .force('center', forceCenter(400, 300))
    .stop();

  // Run simulation
  for (let i = 0; i < 300; i++) {
    simulation.tick();
  }

  const positions = new Map<string, { x: number; y: number }>();
  simNodes.forEach((node) => {
    positions.set(node.id, { x: node.x || 0, y: node.y || 0 });
  });

  return positions;
}

export default function GraphPage() {
  const { data: graphData, isLoading, error } = useQuery<GraphData>({
    queryKey: ['dependencies'],
    queryFn: api.getDependencies,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert graph data to React Flow format with force-directed layout
  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Apply force-directed layout
    const positions = applyForceLayout(
      graphData.nodes,
      graphData.edges
    );

    // Convert to React Flow nodes
    const flowNodes: Node[] = graphData.nodes.map((node) => {
      const pos = positions.get(node.id) || { x: 0, y: 0 };
      return {
        id: node.id,
        position: pos,
        data: {
          label: (
            <div className="text-center p-2">
              <div className="font-mono text-xs opacity-70">{node.id}</div>
              <div className="font-medium text-sm truncate max-w-32">{node.title}</div>
              <div className="text-xs opacity-70 capitalize">{node.type}</div>
            </div>
          ),
        },
        style: {
          backgroundColor: STATUS_COLORS[node.status] || '#6b7280',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          minWidth: '140px',
        },
      };
    });

    // Convert to React Flow edges
    const flowEdges: Edge[] = graphData.edges.map((edge, index) => ({
      id: `e-${index}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: '#94a3b8',
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        Failed to load dependency graph
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dependency Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] border rounded-lg overflow-hidden">
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No dependencies to display
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
