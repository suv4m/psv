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
    borderRadius: 20,
  });

  let strokeColor = '#2b3d63';
  let strokeWidth = 2.2;
  let strokeDasharray = undefined;

  if (isFailed) {
    strokeColor = '#ff2a5f';
    strokeWidth = 3.2;
  } else if (isActive) {
    strokeColor = '#00d4ff';
    strokeWidth = 3.5;
    strokeDasharray = '6 6';
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
          transition: 'all 0.25s ease',
          filter: isActive
            ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.7))'
            : isFailed
            ? 'drop-shadow(0 0 8px rgba(255, 42, 95, 0.7))'
            : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan z-20"
        >
          <div
            className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold border shadow-md transition-all duration-300 backdrop-blur-md ${
              isFailed
                ? 'bg-[#1e0811] text-neon-rose border-neon-rose shadow-[0_0_12px_rgba(255,42,95,0.5)] font-bold scale-105'
                : isActive
                ? 'bg-[#041a2f] text-neon-blue border-neon-blue shadow-[0_0_16px_rgba(0,212,255,0.6)] font-bold scale-110 ring-1 ring-neon-blue/60'
                : 'bg-void-900/95 text-slate-300 border-void-border hover:border-neon-blue/50 hover:text-white'
            }`}
            title={`Transition event: ${event}`}
          >
            {event}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

TransitionEdge.displayName = 'TransitionEdge';
