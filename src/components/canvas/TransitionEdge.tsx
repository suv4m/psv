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

  let strokeColor = '#3b4358';
  let strokeWidth = 2.2;
  let strokeDasharray = undefined;

  if (isFailed) {
    strokeColor = '#f43f5e';
    strokeWidth = 3.2;
  } else if (isActive) {
    strokeColor = '#fbbf24';
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
            ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.75))'
            : isFailed
            ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.75))'
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
                ? 'bg-[#2a0e14] text-ruby-400 border-ruby-500 shadow-ruby-glow font-bold scale-105'
                : isActive
                ? 'bg-[#291804] text-gold-400 border-gold-400 shadow-gold-glow font-bold scale-110 ring-1 ring-gold-400/60'
                : 'bg-graphite-900/95 text-slate-300 border-graphite-border hover:border-gold-400/50 hover:text-white'
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
