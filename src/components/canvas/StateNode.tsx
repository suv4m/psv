import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowRightCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface StateNodeData {
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  isActive: boolean;
  isFailed: boolean;
  isCovered?: boolean;
  description?: string;
  [key: string]: unknown;
}

export const StateNode: React.FC<NodeProps> = memo(({ data }) => {
  const nodeData = data as unknown as StateNodeData;
  const { label, isInitial, isFinal, isActive, isFailed, description } = nodeData;

  let borderClasses = 'border-void-border bg-void-850 hover:border-slate-600';
  let haloClasses = '';
  let badge = null;

  if (isFailed) {
    borderClasses = 'border-neon-rose bg-red-950/40 shadow-neon-rose';
    haloClasses = 'animate-neon-rose';
    badge = (
      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-neon-rose/20 text-neon-rose border border-neon-rose/40 font-mono">
        <AlertTriangle className="w-3 h-3 text-neon-rose" />
        VIOLATION
      </span>
    );
  } else if (isActive) {
    borderClasses = 'border-neon-blue bg-blue-950/40 shadow-neon-blue';
    haloClasses = 'animate-neon-blue';
    badge = (
      <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/50 font-mono">
        <span className="w-2 h-2 rounded-full bg-neon-blue animate-ping" />
        ACTIVE
      </span>
    );
  }

  return (
    <div
      className={`relative min-w-[210px] max-w-[280px] rounded-xl border-2 p-3.5 transition-all duration-300 backdrop-blur-md ${borderClasses} ${haloClasses}`}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-neon-blue !border-void-950" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-neon-blue !border-void-950" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-neon-blue !border-void-950" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-neon-blue !border-void-950" />

      {/* Header Badges: Initial (q0), Final (F), or Status */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isInitial && (
            <span
              title="Initial Entry State (q0)"
              className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-neon-emerald/15 text-neon-emerald border border-neon-emerald/40"
            >
              <ArrowRightCircle className="w-3 h-3 text-neon-emerald" />
              q₀ Initial
            </span>
          )}
          {isFinal && (
            <span
              title="Accepting / Quiescent State (F)"
              className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple border border-neon-purple/40"
            >
              <ShieldCheck className="w-3 h-3 text-neon-purple" />
              F Accept
            </span>
          )}
        </div>
        {badge}
      </div>

      {/* State Name */}
      <div className="flex items-center gap-2">
        {isFinal ? (
          <div className="w-4 h-4 rounded-full border-2 border-neon-purple/90 p-0.5 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-neon-purple" />
          </div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
        )}
        <span className="font-mono text-sm font-bold tracking-wide text-white truncate" title={label}>
          {label}
        </span>
      </div>

      {/* State Description */}
      {description && (
        <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-2">
          {description}
        </p>
      )}

      {/* Outer halo ring for Final State */}
      {isFinal && (
        <div className="absolute -inset-1.5 rounded-2xl border border-neon-purple/40 pointer-events-none" />
      )}
    </div>
  );
});

StateNode.displayName = 'StateNode';
