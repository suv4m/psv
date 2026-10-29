import React, { useState, useMemo } from 'react';
import { ProtocolDefinition, EventSymbol, ConformanceCoverageReport, ConformanceTestCase } from '../../core/types';
import { FormalDFA } from '../../core/dfa';
import { ConformanceTestGenerator } from '../../core/generator';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Filter,
  Activity,
} from 'lucide-react';

interface ConformanceTabProps {
  protocol: ProtocolDefinition;
  onRunTestCase: (trace: EventSymbol[]) => void;
}

export const ConformanceTab: React.FC<ConformanceTabProps> = ({
  protocol,
  onRunTestCase,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  // Compute coverage report for active protocol
  const report: ConformanceCoverageReport = useMemo(() => {
    const dfa = new FormalDFA(protocol);
    const generator = new ConformanceTestGenerator(dfa);
    return generator.generateSuite();
  }, [protocol]);

  const filteredTests = useMemo(() => {
    if (filterType === 'ALL') return report.testCases;
    return report.testCases.filter((t) => t.type === filterType);
  }, [report, filterType]);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-full">
      {/* Header & Theory Card */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/15 p-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-cyan-200">
            Automated Conformance Testing Engine
          </h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Synthesizes covering tours over digraph G=(V,E) to mathematically verify state reachability and adversarial fault resilience.
        </p>
      </div>

      {/* Coverage Gauges Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* State Coverage Card */}
        <div className="bg-[#0e1524] border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>State Coverage (C_state)</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {report.stateCoveragePct}%
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ({report.coveredStates.length}/{report.totalStates})
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${report.stateCoveragePct}%` }}
            />
          </div>
        </div>

        {/* Transition Coverage Card */}
        <div className="bg-[#0e1524] border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Transition Cover (C_trans)</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {report.transitionCoveragePct}%
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ({report.coveredTransitions.length}/{report.totalTransitions})
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${report.transitionCoveragePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Test Case Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            filterType === 'ALL'
              ? 'bg-slate-700 text-white font-semibold'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({report.testCases.length})
        </button>
        <button
          onClick={() => setFilterType('POSITIVE_HAPPY_PATH')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            filterType === 'POSITIVE_HAPPY_PATH'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
              : 'bg-slate-800/60 text-slate-400 hover:text-emerald-300'
          }`}
        >
          Happy Paths
        </button>
        <button
          onClick={() => setFilterType('BOUNDARY_CYCLE')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            filterType === 'BOUNDARY_CYCLE'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
              : 'bg-slate-800/60 text-slate-400 hover:text-cyan-300'
          }`}
        >
          Edges & Cycles
        </button>
        <button
          onClick={() => setFilterType('ADVERSARIAL_MUTATION')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            filterType === 'ADVERSARIAL_MUTATION'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
              : 'bg-slate-800/60 text-slate-400 hover:text-rose-300'
          }`}
        >
          Negative Fuzz
        </button>
      </div>

      {/* Synthesized Test Cases List */}
      <div className="space-y-2.5">
        {filteredTests.map((tc) => {
          const isExpectedAccept = tc.expectedOutcome === 'ACCEPT';

          return (
            <div
              key={tc.id}
              className="bg-[#0e1524] border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-all flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {tc.id}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded font-bold border ${
                        isExpectedAccept
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {tc.expectedOutcome}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {tc.trace.length} event(s)
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-200">{tc.name}</h5>
                </div>

                <button
                  onClick={() => onRunTestCase(tc.trace)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all text-xs font-medium shrink-0"
                  title="Load and execute this test trace in the verifier"
                >
                  <span>Run</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                {tc.description}
              </p>

              {/* Trace Tokens Preview */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin">
                {tc.trace.map((evt, idx) => (
                  <span
                    key={`${tc.id}-tok-${idx}`}
                    className="px-1.5 py-0.5 bg-[#080c14] border border-slate-800 text-[10px] font-mono text-slate-400 rounded shrink-0"
                  >
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
