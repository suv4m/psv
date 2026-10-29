import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowRightCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

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

  // Determine styling based on active/failed/final/initial status
  let borderClasses = 'border-slate-700/80 bg-[#0e1524]';
  let haloClasses = '';
  let badge = null;

  if (isFailed) {
    borderClasses = 'border-rose-500 bg-rose-950/40 shadow-[0_0_25px_rgba(239,68,68,0.35)]';
    haloClasses = 'animate-pulse-crimson';
    badge = (
      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
        <AlertTriangle className="w-3 h-3 text-rose-400" />
        VIOLATION POINT
      </span>
    );
  } else if (isActive) {
    borderClasses = 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.35)]';
    haloClasses = 'animate-pulse-cyan';
    badge = (
      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        ACTIVE STATE
      </span>
    );
  }

  return (
    <div
      className={`relative min-w-[170px] max-w-[240px] rounded-xl border-2 p-3 transition-all duration-300 backdrop-blur-md ${borderClasses} ${haloClasses}`}
    >
      {/* Handles for incoming and outgoing transitions */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-cyan-500/70 !border-slate-800" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-cyan-500/70 !border-slate-800" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-cyan-500/70 !border-slate-800" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-cyan-500/70 !border-slate-800" />

      {/* Header tags: Initial (q0) or Final (F) */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1">
          {isInitial && (
            <span
              title="Initial Entry State (q0)"
              className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            >
              <ArrowRightCircle className="w-2.5 h-2.5 text-emerald-400" />
              q₀ Start
            </span>
          )}
          {isFinal && (
            <span
              title="Accepting / Quiescent State (F)"
              className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30"
            >
              <ShieldCheck className="w-2.5 h-2.5 text-purple-400" />
              F Accept
            </span>
          )}
        </div>
        {badge}
      </div>

      {/* State Identifier */}
      <div className="flex items-center gap-2">
        {isFinal ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-400/80 p-0.5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          </div>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
        )}
        <span className="font-mono text-sm font-semibold tracking-wide text-slate-100 truncate" title={label}>
          {label}
        </span>
      </div>

      {/* State Description */}
      {description && (
        <p className="mt-1.5 text-[11px] leading-tight text-slate-400/90 line-clamp-2">
          {description}
        </p>
      )}

      {/* Double Ring indicator for Final Accepting State */}
      {isFinal && (
        <div className="absolute -inset-1 rounded-2xl border border-purple-500/30 pointer-events-none" />
      )}
    </div>
  );
});

StateNode.displayName = 'StateNode';
