import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react';

export interface TransitionEdgeData {
  event: string;
  isActive?: boolean;
  isFailed?: boolean;
  isCovered?: boolean;
  [key: string]: unknown;
}

export const TransitionEdge: React.FC<EdgeProps> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const edgeData = data as unknown as TransitionEdgeData;
  const event = edgeData?.event || '';
  const isActive = edgeData?.isActive || false;
  const isFailed = edgeData?.isFailed || false;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  let strokeColor = '#334155';
  let strokeWidth = 1.8;
  let strokeDasharray = undefined;

  if (isFailed) {
    strokeColor = '#ef4444';
    strokeWidth = 2.5;
  } else if (isActive) {
    strokeColor = '#06b6d4';
    strokeWidth = 3;
    strokeDasharray = '5 5';
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          transition: 'all 0.3s ease',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-medium border shadow-sm transition-all duration-300 backdrop-blur-md ${
              isFailed
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/60 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                : isActive
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.5)] font-bold scale-110'
                : 'bg-[#111827]/90 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white'
            }`}
            title={`Transition on: ${event}`}
          >
            {event}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

TransitionEdge.displayName = 'TransitionEdge';
