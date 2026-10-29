import React from 'react';
import { ProtocolDefinition } from '../../core/types';
import { PROTOCOL_PRESETS } from '../../core/presets';
import {
  ShieldCheck,
  Cpu,
  BookOpen,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentProtocol: ProtocolDefinition;
  onSelectProtocol: (protocol: ProtocolDefinition) => void;
  onOpenFormalModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProtocol,
  onSelectProtocol,
  onOpenFormalModal,
}) => {
  return (
    <header className="h-14 bg-[#0e1524] border-b border-slate-800 px-4 flex items-center justify-between shadow-md select-none shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Cpu className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white font-mono">
              PROTOCOL STATE VALIDATOR
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold">
              v1.0 Formal Engine
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Theory of Computation • Finite Automata Formal Verification Studio
          </p>
        </div>
      </div>

      {/* Protocol Preset Selector & Telemetry */}
      <div className="flex items-center gap-3">
        {/* Preset Selector */}
        <div className="flex items-center gap-2 bg-[#141d30] border border-slate-700/80 rounded-lg px-2.5 py-1">
          <span className="text-[11px] font-mono text-slate-400">Protocol:</span>
          <select
            value={currentProtocol.id}
            onChange={(e) => {
              const selected = PROTOCOL_PRESETS.find((p) => p.id === e.target.value);
              if (selected) onSelectProtocol(selected);
            }}
            className="bg-transparent text-xs font-semibold text-cyan-300 focus:outline-none cursor-pointer pr-1"
          >
            {PROTOCOL_PRESETS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0e1524] text-slate-200">
                {p.name} ({p.category})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Protocol Metrics */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#080c14] px-2.5 py-1 rounded-lg border border-slate-800">
          <span>|Q| = <strong className="text-slate-200">{currentProtocol.states.length}</strong></span>
          <span className="text-slate-600">•</span>
          <span>|Σ| = <strong className="text-slate-200">{currentProtocol.alphabet.length}</strong></span>
          <span className="text-slate-600">•</span>
          <span>|δ| = <strong className="text-slate-200">{currentProtocol.transitions.length}</strong></span>
        </div>

        {/* Academic Proof / 5-Tuple Definition Modal Button */}
        <button
          onClick={onOpenFormalModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="View Formal 5-Tuple (Q, Σ, δ, q0, F) Machine Definition"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Formal 5-Tuple</span>
        </button>
      </div>
    </header>
  );
};
