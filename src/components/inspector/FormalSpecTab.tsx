import React, { useState } from 'react';
import { ProtocolDefinition } from '../../core/types';
import { FormalDFA } from '../../core/dfa';
import {
  Code2,
  Copy,
  Check,
  Table,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

interface FormalSpecTabProps {
  protocol: ProtocolDefinition;
}

export const FormalSpecTab: React.FC<FormalSpecTabProps> = ({ protocol }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const dfa = new FormalDFA(protocol);
  const latexCode = dfa.toLatexMatrix();

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-full">
      {/* 5-Tuple Definition Card */}
      <div className="rounded-xl border border-graphite-border bg-graphite-850 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gold-400" />
          <h4 className="text-xs font-bold text-white font-mono">
            Formal 5-Tuple Definition: M = (Q, Σ, δ, q₀, F)
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-graphite-950 border border-graphite-border">
            <span className="text-slate-400 text-xs block">Q (States):</span>
            <span className="text-gold-400 font-bold text-sm">{protocol.states.length} states</span>
          </div>
          <div className="p-3 rounded-lg bg-graphite-950 border border-graphite-border">
            <span className="text-slate-400 text-xs block">Σ (Alphabet):</span>
            <span className="text-mint-400 font-bold text-sm">{protocol.alphabet.length} symbols</span>
          </div>
          <div className="p-3 rounded-lg bg-graphite-950 border border-graphite-border">
            <span className="text-slate-400 text-xs block">q₀ (Initial):</span>
            <span className="text-mint-400 font-bold text-sm">{protocol.initialState}</span>
          </div>
          <div className="p-3 rounded-lg bg-graphite-950 border border-graphite-border">
            <span className="text-slate-400 text-xs block">F (Accepting):</span>
            <span className="text-amethyst-400 font-bold text-sm">[{protocol.finalStates.join(', ')}]</span>
          </div>
        </div>
      </div>

      {/* Safety Invariants */}
      {protocol.safetyInvariants && protocol.safetyInvariants.length > 0 && (
        <div className="rounded-xl border border-graphite-border bg-graphite-850 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
            <Shield className="w-4 h-4 text-mint-400" />
            <span>Safety & Liveness Invariants</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {protocol.safetyInvariants.map((inv, idx) => (
              <li key={`inv-${idx}`} className="flex items-start gap-2 leading-relaxed">
                <span className="text-mint-400 font-bold">✓</span>
                <span>{inv}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transition Matrix δ Table */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
          <Table className="w-4 h-4 text-gold-400" />
          <span>Transition Function Matrix δ: Q × Σ → Q</span>
        </div>
        <div className="border border-graphite-border rounded-xl overflow-x-auto max-h-64 scrollbar-thin">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-graphite-850 text-slate-400 border-b border-graphite-border text-xs">
              <tr>
                <th className="py-2 px-3 whitespace-nowrap bg-graphite-850 sticky left-0 z-10 border-r border-graphite-border">
                  State (Q)
                </th>
                {protocol.alphabet.map((sym) => (
                  <th key={sym} className="py-2 px-3 whitespace-nowrap text-slate-200">
                    {sym}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-border bg-graphite-900">
              {protocol.states.map((s) => {
                const isInit = protocol.initialState === s;
                const isFin = protocol.finalStates.includes(s);

                return (
                  <tr key={s} className="hover:bg-graphite-850">
                    <td className="py-2 px-3 whitespace-nowrap font-bold bg-graphite-900 sticky left-0 z-10 border-r border-graphite-border flex items-center gap-1.5">
                      {isInit && <span className="text-mint-400 font-bold">→</span>}
                      {isFin && <span className="text-amethyst-400 font-bold">*</span>}
                      <span className="text-slate-100">{s}</span>
                    </td>
                    {protocol.alphabet.map((sym) => {
                      const next = dfa.getTransition(s, sym);
                      return (
                        <td key={`${s}-${sym}`} className="py-2 px-3 whitespace-nowrap">
                          {next ? (
                            <span className="text-gold-400 font-bold">{next}</span>
                          ) : (
                            <span className="text-slate-600 font-semibold">⊥</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LaTeX Matrix Code Exporter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
            <FileSpreadsheet className="w-3.5 h-3.5 text-gold-400" />
            LaTeX Math Code
          </span>
          <button
            onClick={handleCopyLatex}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-graphite-850 hover:bg-graphite-800 text-slate-200 border border-graphite-border hover:border-gold-400 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-mint-400" />
                <span className="text-mint-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy LaTeX</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3 bg-graphite-950 border border-graphite-border rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-36 scrollbar-thin">
          {latexCode}
        </pre>
      </div>
    </div>
  );
};
