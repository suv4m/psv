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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { ProtocolDefinition, StateId } from '../../core/types';
import { StateNode, StateNodeData } from './StateNode';
import { TransitionEdge, TransitionEdgeData } from './TransitionEdge';
import { Maximize2, LayoutGrid, RotateCw } from 'lucide-react';

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

  const nodeWidth = 200;
  const nodeHeight = 85;

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 45,
    ranksep: 90,
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

  // Construct raw nodes and edges from protocol definition
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
    // Group identical transitions to prevent overlapping edge clutter
    return protocol.transitions.map((t, index) => {
      const isSelfLoop = t.from === t.to;
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
          width: 14,
          height: 14,
          color: isFailed ? '#ef4444' : isActive ? '#06b6d4' : '#475569',
        },
      };
    });
  }, [protocol, activeTransition, failedTransition, coveredTransitions]);

  // Compute Dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(rawNodes, rawEdges, direction);
  }, [rawNodes, rawEdges, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Synchronize when layouted changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Re-fit view when protocol changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
    return () => clearTimeout(timer);
  }, [protocol.id, direction, fitView]);

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'));
  }, []);

  return (
    <div className="relative w-full h-full bg-[#080c14] select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.2}
        maxZoom={2.0}
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
        <Controls showInteractive={false} position="top-right" />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as unknown as StateNodeData;
            if (data?.isFailed) return '#ef4444';
            if (data?.isActive) return '#06b6d4';
            if (data?.isFinal) return '#a855f7';
            if (data?.isInitial) return '#10b981';
            return '#1e293b';
          }}
          maskColor="rgba(8, 12, 20, 0.75)"
          position="bottom-right"
          className="!w-32 !h-24 !bg-[#0e1524] !border !border-slate-800"
        />
      </ReactFlow>

      {/* Floating Canvas Quick Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0e1524]/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg shadow-xl">
        <button
          onClick={toggleDirection}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors"
          title="Toggle Hierarchical Orientation (Horizontal LR vs Vertical TB)"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
          <span>Layout: {direction === 'LR' ? 'Horizontal (LR)' : 'Vertical (TB)'}</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700/60" />

        <button
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          title="Reset Zoom & Center Canvas"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-[#0e1524]/85 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>q₀ Initial</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>F Accepting</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
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
