import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  PanOnScrollMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { ProtocolDefinition, StateId } from '../../core/types';
import { StateNode, StateNodeData } from './StateNode';
import { TransitionEdge, TransitionEdgeData } from './TransitionEdge';
import { Maximize2, LayoutGrid } from 'lucide-react';

const nodeTypes = {
  stateNode: StateNode,
};

const edgeTypes = {
  transitionEdge: TransitionEdge,
};

interface ProtocolCanvasProps {
  protocol: ProtocolDefinition;
  activeState: StateId | null;
  activeTransition: { from: StateId; event: string; to: StateId } | null;
  failedState: StateId | null;
  failedTransition: { from: StateId; event: string } | null;
  coveredStates?: Set<StateId>;
  coveredTransitions?: Set<string>;
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 240;
  const nodeHeight = 105;

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 135,
    edgesep: 35,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const CanvasInner: React.FC<ProtocolCanvasProps> = ({
  protocol,
  activeState,
  activeTransition,
  failedState,
  failedTransition,
  coveredStates,
  coveredTransitions,
}) => {
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
  const { fitView } = useReactFlow();

  const rawNodes: Node[] = useMemo(() => {
    return protocol.states.map((state) => {
      const isInitial = protocol.initialState === state;
      const isFinal = protocol.finalStates.includes(state);
      const isActive = activeState === state;
      const isFailed = failedState === state;
      const isCovered = coveredStates?.has(state);
      const description = protocol.stateDescriptions?.[state];

      const data: StateNodeData = {
        label: state,
        isInitial,
        isFinal,
        isActive,
        isFailed,
        isCovered,
        description,
      };

      return {
        id: state,
        type: 'stateNode',
        data: data as unknown as Record<string, unknown>,
        position: { x: 0, y: 0 },
      };
    });
  }, [protocol, activeState, failedState, coveredStates]);

  const rawEdges: Edge[] = useMemo(() => {
    return protocol.transitions.map((t, index) => {
      const isActive =
        activeTransition?.from === t.from &&
        activeTransition?.event === t.event &&
        activeTransition?.to === t.to;
      const isFailed =
        failedTransition?.from === t.from &&
        failedTransition?.event === t.event;
      const transKey = `${t.from}:${t.event}:${t.to}`;
      const isCovered = coveredTransitions?.has(transKey);

      const edgeData: TransitionEdgeData = {
        event: t.event,
        isActive,
        isFailed,
        isCovered,
      };

      return {
        id: `edge-${t.from}-${t.event}-${t.to}-${index}`,
        source: t.from,
        target: t.to,
        type: 'transitionEdge',
        data: edgeData as unknown as Record<string, unknown>,
        animated: isActive,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: isFailed ? '#f43f5e' : isActive ? '#fbbf24' : '#4b5563',
        },
      };
    });
  }, [protocol, activeTransition, failedTransition, coveredTransitions]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(rawNodes, rawEdges, direction);
  }, [rawNodes, rawEdges, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 400 });
    }, 60);
    return () => clearTimeout(timer);
  }, [protocol.id, direction, fitView]);

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'));
  }, []);

  return (
    <div className="relative w-full h-full bg-graphite-950 select-none overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.25}
        maxZoom={2.5}
        attributionPosition="bottom-left"
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnDrag={true}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#212635" />
        <Controls showInteractive={false} position="top-right" />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as unknown as StateNodeData;
            if (data?.isFailed) return '#f43f5e';
            if (data?.isActive) return '#fbbf24';
            if (data?.isFinal) return '#a855f7';
            if (data?.isInitial) return '#10b981';
            return '#2a3040';
          }}
          maskColor="rgba(9, 10, 15, 0.85)"
          position="bottom-right"
          className="!w-36 !h-28 !bg-graphite-900 !border !border-graphite-border shadow-xl"
        />
      </ReactFlow>

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-graphite-900/90 backdrop-blur-md border border-graphite-border p-1.5 rounded-lg shadow-xl">
        <button
          onClick={toggleDirection}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-gold-400 hover:bg-graphite-850 rounded transition-colors"
          title="Toggle Layout Orientation (Horizontal vs Vertical)"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-gold-400" />
          <span>{direction === 'LR' ? 'Horizontal' : 'Vertical'}</span>
        </button>

        <div className="w-[1px] h-4 bg-graphite-border" />

        <button
          onClick={() => fitView({ padding: 0.15, duration: 300 })}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-graphite-850 rounded transition-colors"
          title="Reset Zoom & Center View"
        >
          <Maximize2 className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Clean Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3.5 bg-graphite-900/90 backdrop-blur-md border border-graphite-border px-3.5 py-1.5 rounded-lg text-xs text-slate-300 font-mono shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-mint-500" />
          <span>q₀ Initial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amethyst-500" />
          <span>F Accept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ruby-500" />
          <span>Violation</span>
        </div>
      </div>
    </div>
  );
};

export const ProtocolCanvas: React.FC<ProtocolCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
};
