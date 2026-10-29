import React, { useState, useMemo } from 'react';
import { ProtocolDefinition, EventSymbol, ConformanceCoverageReport, ConformanceTestCase } from '../../core/types';
import { FormalDFA } from '../../core/dfa';
import { ConformanceTestGenerator } from '../../core/generator';
import {
  ShieldCheck,
  Layers,
  ArrowRight,
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
      {/* Header */}
      <div className="rounded-xl border border-neon-blue/30 bg-blue-950/20 p-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-neon-blue" />
          <h4 className="text-xs font-bold text-neon-blue font-mono">
            Automated Conformance Testing Engine
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Synthesizes covering tours over digraph G=(V,E) to mathematically verify state reachability and adversarial fault resilience.
        </p>
      </div>

      {/* Coverage Gauges Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* State Coverage Card */}
        <div className="bg-void-850 border border-void-border p-3.5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>State Coverage (C_state)</span>
            <Layers className="w-4 h-4 text-neon-blue" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neon-blue">
              {report.stateCoveragePct}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({report.coveredStates.length}/{report.totalStates})
            </span>
          </div>
          <div className="w-full bg-void-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-neon-blue h-full rounded-full transition-all duration-500 shadow-neon-blue"
              style={{ width: `${report.stateCoveragePct}%` }}
            />
          </div>
        </div>

        {/* Transition Coverage Card */}
        <div className="bg-void-850 border border-void-border p-3.5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Transition Cover (C_trans)</span>
            <Activity className="w-4 h-4 text-neon-emerald" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neon-emerald">
              {report.transitionCoveragePct}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({report.coveredTransitions.length}/{report.totalTransitions})
            </span>
          </div>
          <div className="w-full bg-void-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-neon-emerald h-full rounded-full transition-all duration-500 shadow-neon-emerald"
              style={{ width: `${report.transitionCoveragePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-blue-600 text-white shadow-neon-blue'
              : 'bg-void-850 text-slate-400 border border-void-border hover:text-slate-200'
          }`}
        >
          All ({report.testCases.length})
        </button>
        <button
          onClick={() => setFilterType('POSITIVE_HAPPY_PATH')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
            filterType === 'POSITIVE_HAPPY_PATH'
              ? 'bg-emerald-500/20 text-neon-emerald border border-neon-emerald font-bold'
              : 'bg-void-850 text-slate-400 border border-void-border hover:text-neon-emerald'
          }`}
        >
          Happy Paths
        </button>
        <button
          onClick={() => setFilterType('BOUNDARY_CYCLE')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
            filterType === 'BOUNDARY_CYCLE'
              ? 'bg-blue-500/20 text-neon-blue border border-neon-blue font-bold'
              : 'bg-void-850 text-slate-400 border border-void-border hover:text-neon-blue'
          }`}
        >
          Edges & Cycles
        </button>
        <button
          onClick={() => setFilterType('ADVERSARIAL_MUTATION')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
            filterType === 'ADVERSARIAL_MUTATION'
              ? 'bg-rose-500/20 text-neon-rose border border-neon-rose font-bold'
              : 'bg-void-850 text-slate-400 border border-void-border hover:text-neon-rose'
          }`}
        >
          Negative Fuzz
        </button>
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredTests.map((tc) => {
          const isExpectedAccept = tc.expectedOutcome === 'ACCEPT';

          return (
            <div
              key={tc.id}
              className="bg-void-850 border border-void-border rounded-xl p-3.5 hover:border-neon-blue/40 transition-all flex flex-col gap-2.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {tc.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-mono rounded font-bold border ${
                        isExpectedAccept
                          ? 'bg-emerald-500/15 text-neon-emerald border-neon-emerald/40'
                          : 'bg-rose-500/15 text-neon-rose border-neon-rose/40'
                      }`}
                    >
                      {tc.expectedOutcome}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {tc.trace.length} event(s)
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-white">{tc.name}</h5>
                </div>

                <button
                  onClick={() => onRunTestCase(tc.trace)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-blue text-void-950 font-bold text-xs hover:bg-cyan-300 transition-all shadow-neon-blue shrink-0"
                  title="Run this test in verifier"
                >
                  <span>Run</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {tc.description}
              </p>

              {/* Tokens Preview */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
                {tc.trace.map((evt, idx) => (
                  <span
                    key={`${tc.id}-tok-${idx}`}
                    className="px-2 py-0.5 bg-void-950 border border-void-border text-xs font-mono text-slate-300 rounded shrink-0"
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
