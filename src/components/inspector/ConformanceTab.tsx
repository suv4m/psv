import React, { useState, useMemo } from 'react';
import { ProtocolDefinition, EventSymbol, ConformanceCoverageReport } from '../../core/types';
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
      <div className="rounded-xl border border-gold-400/30 bg-amber-950/20 p-3.5 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          <h4 className="text-xs font-bold text-gold-400 font-mono">
            Automated Conformance Testing Engine
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Synthesizes covering tours over digraph G=(V,E) to mathematically verify state reachability and adversarial fault resilience.
        </p>
      </div>

      {/* Coverage Gauges Row */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        {/* State Coverage Card */}
        <div className="bg-graphite-850 border border-graphite-border p-3.5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>State Coverage (C_state)</span>
            <Layers className="w-4 h-4 text-gold-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gold-400">
              {report.stateCoveragePct}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({report.coveredStates.length}/{report.totalStates})
            </span>
          </div>
          <div className="w-full bg-graphite-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gold-500 h-full rounded-full transition-all duration-500 shadow-gold-glow"
              style={{ width: `${report.stateCoveragePct}%` }}
            />
          </div>
        </div>

        {/* Transition Coverage Card */}
        <div className="bg-graphite-850 border border-graphite-border p-3.5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Transition Cover (C_trans)</span>
            <Activity className="w-4 h-4 text-mint-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-mint-400">
              {report.transitionCoveragePct}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({report.coveredTransitions.length}/{report.totalTransitions})
            </span>
          </div>
          <div className="w-full bg-graphite-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-mint-500 h-full rounded-full transition-all duration-500 shadow-mint-glow"
              style={{ width: `${report.transitionCoveragePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs (Clean Flex-Wrap so they never clip or hide) */}
      <div className="flex items-center gap-2 flex-wrap shrink-0 py-1">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 text-xs rounded-lg font-semibold shrink-0 transition-all ${
            filterType === 'ALL'
              ? 'bg-gold-500 text-graphite-950 font-bold shadow-gold-glow'
              : 'bg-graphite-850 text-slate-300 border border-graphite-border hover:text-white hover:border-gold-400/50'
          }`}
        >
          All ({report.testCases.length})
        </button>
        <button
          onClick={() => setFilterType('POSITIVE_HAPPY_PATH')}
          className={`px-3 py-1.5 text-xs rounded-lg font-semibold shrink-0 transition-all ${
            filterType === 'POSITIVE_HAPPY_PATH'
              ? 'bg-mint-500/20 text-mint-400 border border-mint-500 font-bold'
              : 'bg-graphite-850 text-slate-300 border border-graphite-border hover:text-mint-400'
          }`}
        >
          Happy Paths
        </button>
        <button
          onClick={() => setFilterType('BOUNDARY_CYCLE')}
          className={`px-3 py-1.5 text-xs rounded-lg font-semibold shrink-0 transition-all ${
            filterType === 'BOUNDARY_CYCLE'
              ? 'bg-gold-500/20 text-gold-400 border border-gold-400 font-bold'
              : 'bg-graphite-850 text-slate-300 border border-graphite-border hover:text-gold-400'
          }`}
        >
          Edges & Cycles
        </button>
        <button
          onClick={() => setFilterType('ADVERSARIAL_MUTATION')}
          className={`px-3 py-1.5 text-xs rounded-lg font-semibold shrink-0 transition-all ${
            filterType === 'ADVERSARIAL_MUTATION'
              ? 'bg-ruby-500/20 text-ruby-400 border border-ruby-500 font-bold'
              : 'bg-graphite-850 text-slate-300 border border-graphite-border hover:text-ruby-400'
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
              className="bg-graphite-850 border border-graphite-border rounded-xl p-3.5 hover:border-gold-400/40 transition-all flex flex-col gap-2.5 shadow-sm"
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
                          ? 'bg-mint-500/15 text-mint-400 border-mint-500/40'
                          : 'bg-ruby-500/15 text-ruby-400 border-ruby-500/40'
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 text-graphite-950 font-bold text-xs hover:bg-gold-400 transition-all shadow-gold-glow shrink-0"
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
              <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-thin">
                {tc.trace.map((evt, idx) => (
                  <span
                    key={`${tc.id}-tok-${idx}`}
                    className="px-2 py-0.5 bg-graphite-950 border border-graphite-border text-xs font-mono text-slate-300 rounded shrink-0"
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
