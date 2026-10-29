import React from 'react';
import { ProtocolDefinition } from '../../core/types';
import { PROTOCOL_PRESETS } from '../../core/presets';
import {
  Cpu,
  BookOpen,
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
    <header className="h-14 bg-void-900 border-b border-void-border px-4 flex items-center justify-between select-none shrink-0 shadow-md">
      {/* Brand Title: Clean, Bold, Minimal */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 text-neon-blue border border-neon-blue/40 shadow-[0_0_12px_rgba(0,212,255,0.3)]">
          <Cpu className="w-4 h-4 text-neon-blue" />
        </div>
        <h1 className="text-base font-bold tracking-wider text-white font-mono uppercase bg-gradient-to-r from-white via-slate-100 to-neon-blue bg-clip-text text-transparent">
          Protocol State Validator
        </h1>
      </div>

      {/* Protocol Selector & Controls */}
      <div className="flex items-center gap-3">
        {/* Protocol Dropdown */}
        <div className="flex items-center gap-2 bg-void-850 border border-void-border rounded-lg px-3 py-1.5 focus-within:border-neon-blue transition-colors">
          <span className="text-xs font-mono text-slate-400">Protocol:</span>
          <select
            value={currentProtocol.id}
            onChange={(e) => {
              const selected = PROTOCOL_PRESETS.find((p) => p.id === e.target.value);
              if (selected) onSelectProtocol(selected);
            }}
            className="bg-transparent text-sm font-semibold text-neon-blue focus:outline-none cursor-pointer pr-1"
          >
            {PROTOCOL_PRESETS.map((p) => (
              <option key={p.id} value={p.id} className="bg-void-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Protocol Math Cardinalities */}
        <div className="hidden md:flex items-center gap-2.5 text-xs font-mono text-slate-400 bg-void-950 px-3 py-1.5 rounded-lg border border-void-border">
          <span>Q: <strong className="text-slate-100 font-bold">{currentProtocol.states.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span>Σ: <strong className="text-slate-100 font-bold">{currentProtocol.alphabet.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span>δ: <strong className="text-slate-100 font-bold">{currentProtocol.transitions.length}</strong></span>
        </div>

        {/* Formal 5-Tuple Button */}
        <button
          onClick={onOpenFormalModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-void-850 hover:bg-void-800 text-slate-200 border border-void-border hover:border-neon-blue/60 transition-all text-sm"
          title="View Formal 5-Tuple Definition"
        >
          <BookOpen className="w-3.5 h-3.5 text-neon-blue" />
          <span>Formal 5-Tuple</span>
        </button>
      </div>
    </header>
  );
};
