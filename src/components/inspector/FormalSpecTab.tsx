import React, { useState } from 'react';
import { ProtocolDefinition } from '../../core/types';
import { FormalDFA } from '../../core/dfa';
import {
  Code2,
  Copy,
  Check,
  Table,
  Shield,
  Layers,
  ArrowRightCircle,
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
      {/* 5-Tuple Definition Mathematical Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0e1524] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-200">
            Formal 5-Tuple Definition: M = (Q, Σ, δ, q₀, F)
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#080c14] border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Q (States):</span>
            <span className="text-cyan-300 font-bold">{protocol.states.length} states</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#080c14] border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Σ (Alphabet):</span>
            <span className="text-emerald-300 font-bold">{protocol.alphabet.length} symbols</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#080c14] border border-slate-800">
            <span className="text-slate-500 text-[10px] block">q₀ (Initial State):</span>
            <span className="text-amber-300 font-bold">{protocol.initialState}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#080c14] border border-slate-800">
            <span className="text-slate-500 text-[10px] block">F (Accepting / Final):</span>
            <span className="text-purple-300 font-bold">[{protocol.finalStates.join(', ')}]</span>
          </div>
        </div>
      </div>

      {/* Safety Invariants */}
      {protocol.safetyInvariants && protocol.safetyInvariants.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0e1524] p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Safety & Liveness Invariants</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {protocol.safetyInvariants.map((inv, idx) => (
              <li key={`inv-${idx}`} className="flex items-start gap-2 leading-tight">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>{inv}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* State Transition Matrix δ Table */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Table className="w-4 h-4 text-cyan-400" />
          <span>Transition Function Matrix δ: Q × Σ → Q</span>
        </div>
        <div className="border border-slate-800 rounded-lg overflow-x-auto max-h-64 scrollbar-thin">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141d30] text-slate-400 border-b border-slate-800 text-[10px]">
              <tr>
                <th className="py-1.5 px-3 whitespace-nowrap bg-[#141d30] sticky left-0 z-10 border-r border-slate-800">
                  State (Q)
                </th>
                {protocol.alphabet.map((sym) => (
                  <th key={sym} className="py-1.5 px-2.5 whitespace-nowrap text-slate-300">
                    {sym}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0e1524]">
              {protocol.states.map((s) => {
                const isInit = protocol.initialState === s;
                const isFin = protocol.finalStates.includes(s);

                return (
                  <tr key={s} className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 whitespace-nowrap font-semibold bg-[#0e1524] sticky left-0 z-10 border-r border-slate-800 flex items-center gap-1.5">
                      {isInit && <span className="text-emerald-400 font-bold">→</span>}
                      {isFin && <span className="text-purple-400 font-bold">*</span>}
                      <span className="text-slate-200">{s}</span>
                    </td>
                    {protocol.alphabet.map((sym) => {
                      const next = dfa.getTransition(s, sym);
                      return (
                        <td key={`${s}-${sym}`} className="py-1.5 px-2.5 whitespace-nowrap">
                          {next ? (
                            <span className="text-cyan-300 font-medium">{next}</span>
                          ) : (
                            <span className="text-slate-600">⊥</span>
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            LaTeX Math Code (for Reports/Slides)
          </span>
          <button
            onClick={handleCopyLatex}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy LaTeX</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3 bg-[#080c14] border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto max-h-36 scrollbar-thin">
          {latexCode}
        </pre>
      </div>
    </div>
  );
};
