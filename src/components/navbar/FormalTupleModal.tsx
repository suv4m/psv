import React from 'react';
import { ProtocolDefinition } from '../../core/types';
import { X, BookOpen } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-graphite-900 border border-graphite-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-graphite-border flex items-center justify-between bg-graphite-850">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-gold-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Formal Automata Specification: M = (Q, Σ, δ, q₀, F)
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical Language Formulation for {protocol.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-200">
          {/* Formal Language Math Box */}
          <div className="p-4 rounded-xl bg-graphite-950 border border-gold-400/40 font-mono space-y-2 shadow-gold-glow">
            <div className="text-gold-400 font-bold text-sm">
              Language of Accepted Protocol Traces:
            </div>
            <div className="text-white text-sm font-semibold">
              L(M) = &#123; w &isin; &Sigma;* | &delta;&#770;(q&#8320;, w) &isin; F &#125;
            </div>
            <p className="text-xs text-slate-400">
              Where &delta;&#770;(q, &epsilon;) = q and &delta;&#770;(q, wa) = &delta;(&delta;&#770;(q, w), a).
            </p>
          </div>

          {/* 5 Tuples Breakdown */}
          <div className="space-y-3 font-mono">
            <div className="p-3.5 rounded-xl bg-graphite-850 border border-graphite-border space-y-1">
              <span className="text-gold-400 font-bold block text-xs">1. Q (Finite Set of States):</span>
              <div className="text-slate-200 flex flex-wrap gap-1 text-xs">
                &#123; {protocol.states.join(', ')} &#125;
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-graphite-850 border border-graphite-border space-y-1">
              <span className="text-mint-400 font-bold block text-xs">2. &Sigma; (Protocol Input Alphabet):</span>
              <div className="text-slate-200 flex flex-wrap gap-1 text-xs">
                &#123; {protocol.alphabet.join(', ')} &#125;
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-graphite-850 border border-graphite-border space-y-1">
              <span className="text-mint-400 font-bold block text-xs">3. q&#8320; (Initial Entry State):</span>
              <div className="text-slate-200 text-xs">
                q&#8320; = <strong className="text-white">{protocol.initialState}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-graphite-850 border border-graphite-border space-y-1">
              <span className="text-amethyst-400 font-bold block text-xs">4. F (Accepting States):</span>
              <div className="text-slate-200 text-xs">
                F = &#123; {protocol.finalStates.join(', ')} &#125;
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-graphite-850 border border-graphite-border space-y-1">
              <span className="text-gold-400 font-bold block text-xs">5. &delta; (Transition Function):</span>
              <div className="text-slate-200 text-xs">
                Total {protocol.transitions.length} deterministic mappings defined in transition table.
              </div>
            </div>
          </div>

          {/* Credentials Card */}
          <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-border flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Registered Student:</span>
              <span className="font-bold text-white text-sm">Suvam Sabyasachi Parida</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Registration ID:</span>
              <span className="font-mono font-bold text-gold-400 text-sm">2402040095</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Topic:</span>
              <span className="font-bold text-mint-400 text-sm">Protocol State Validator</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-graphite-border bg-graphite-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-graphite-950 font-bold text-xs transition-colors shadow-gold-glow"
          >
            Close Formal View
          </button>
        </div>
      </div>
    </div>
  );
};
