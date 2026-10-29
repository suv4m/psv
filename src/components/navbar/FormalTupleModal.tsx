import React from 'react';
import { ProtocolDefinition } from '../../core/types';
import { X, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FormalTupleModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: ProtocolDefinition;
}

export const FormalTupleModal: React.FC<FormalTupleModalProps> = ({
  isOpen,
  onClose,
  protocol,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0e1524] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#141d30]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Formal Automata Specification: M = (Q, Σ, δ, q₀, F)
              </h3>
              <p className="text-[11px] text-slate-400">
                Mathematical Language Formulation for {protocol.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
          {/* Formal Language Math Box */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-cyan-500/30 font-mono space-y-2">
            <div className="text-cyan-300 font-bold text-sm">
              Language of Accepted Protocol Traces:
            </div>
            <div className="text-slate-200">
              L(M) = &#123; w &isin; &Sigma;* | &delta;&#770;(q&#8320;, w) &isin; F &#125;
            </div>
            <p className="text-[11px] text-slate-400">
              Where &delta;&#770;(q, &epsilon;) = q and &delta;&#770;(q, wa) = &delta;(&delta;&#770;(q, w), a).
            </p>
          </div>

          {/* 5 Tuples Breakdown */}
          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-xl bg-[#141d30] border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block">1. Q (Finite Set of States):</span>
              <div className="text-slate-300 flex flex-wrap gap-1">
                &#123; {protocol.states.join(', ')} &#125;
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141d30] border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold block">2. &Sigma; (Protocol Input Alphabet):</span>
              <div className="text-slate-300 flex flex-wrap gap-1">
                &#123; {protocol.alphabet.join(', ')} &#125;
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141d30] border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">3. q&#8320; (Initial Entry State):</span>
              <div className="text-slate-300">
                q&#8320; = <strong className="text-white">{protocol.initialState}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141d30] border border-slate-800 space-y-1">
              <span className="text-purple-400 font-bold block">4. F (Set of Accepting / Final States):</span>
              <div className="text-slate-300">
                F = &#123; {protocol.finalStates.join(', ')} &#125;
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141d30] border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block">5. &delta; (Transition Function):</span>
              <div className="text-slate-300">
                Total {protocol.transitions.length} deterministic mappings defined in transition table.
              </div>
            </div>
          </div>

          {/* Project Credentials Card */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Registered Student:</span>
              <span className="font-bold text-slate-100">Suvam Sabyasachi Parida</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Registration ID:</span>
              <span className="font-mono font-bold text-cyan-300">2402040095</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Topic:</span>
              <span className="font-bold text-emerald-300">Protocol State Validator</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#141d30] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Formal View
          </button>
        </div>
      </div>
    </div>
  );
};
