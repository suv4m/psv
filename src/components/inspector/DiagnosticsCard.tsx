import React from 'react';
import { ValidationResult, StateId, EventSymbol } from '../../core/types';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
  ShieldAlert,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface DiagnosticsCardProps {
  validationResult: ValidationResult | null;
  onApplyRecoveryTrace?: (recoveryTrace: EventSymbol[]) => void;
}

export const DiagnosticsCard: React.FC<DiagnosticsCardProps> = ({
  validationResult,
  onApplyRecoveryTrace,
}) => {
  if (!validationResult) return null;

  const {
    isValid,
    isAccepted,
    failureStep,
    finalState,
    recoveryTrace,
    recoveryTargetState,
    recoveryExplanation,
    executionTimeMs,
  } = validationResult;

  // Case 1: Fully Accepted Sequence
  if (isAccepted) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-emerald-300">
                Protocol Accepted (L(M) Member)
              </h4>
              <span className="text-[11px] font-mono text-emerald-400/80">
                {executionTimeMs} ms
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Trace satisfied all safety and transition invariants. Quiescent state{' '}
              <span className="font-mono font-bold text-emerald-300">[{finalState}]</span> reached in{' '}
              <span className="font-mono font-bold text-white">{validationResult.totalSteps}</span> step(s).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Incomplete Trace (Valid transitions, but not in final state F)
  if (isValid && !isAccepted) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-amber-300">
                Incomplete Protocol (Non-Accepting Quiescence)
              </h4>
              <span className="text-[11px] font-mono text-amber-400/80">
                {executionTimeMs} ms
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              All transitions executed legally, but protocol terminated in intermediate non-accepting state{' '}
              <span className="font-mono font-bold text-amber-300">[{finalState}]</span>.
            </p>

            {recoveryTrace && recoveryTrace.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-[#0e1524] border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Shortest Path to Quiescent Final State [{recoveryTargetState}]
                  </div>
                  {onApplyRecoveryTrace && (
                    <button
                      onClick={() => onApplyRecoveryTrace(recoveryTrace)}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1"
                    >
                      <span>Append Recovery</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {recoveryTrace.map((evt, idx) => (
                    <span
                      key={`rec-${idx}`}
                      className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono text-xs"
                    >
                      {evt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Protocol Violation Point (Safety Property Broken)
  return (
    <div className="rounded-xl border border-rose-500/50 bg-rose-950/25 p-4 backdrop-blur-sm space-y-3 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-rose-300">
              Protocol Violation Detected
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Step #{failureStep?.stepIndex}
            </span>
          </div>
          <p className="mt-1 text-xs text-rose-200 leading-relaxed font-mono">
            δ({failureStep?.fromState}, {failureStep?.event}) = ⊥ (Undefined Transition)
          </p>
        </div>
      </div>

      {/* Violation Breakdown Matrix */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0e1524] p-3 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">
            State at Failure
          </span>
          <span className="font-bold text-slate-200">{failureStep?.fromState}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">
            Illegal Attempted Event
          </span>
          <span className="font-bold text-rose-400">{failureStep?.event}</span>
        </div>
        <div className="col-span-2 mt-1 pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
            Allowed Events Σ_valid({failureStep?.fromState})
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {failureStep?.allowedEvents && failureStep.allowedEvents.length > 0 ? (
              failureStep.allowedEvents.map((evt) => (
                <span
                  key={evt}
                  className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px]"
                >
                  {evt}
                </span>
              ))
            ) : (
              <span className="text-rose-400 text-xs italic">No outgoing transitions (Dead-end Trap)</span>
            )}
          </div>
        </div>
      </div>

      {/* Backtracking Recovery Recommendation */}
      {recoveryTrace && recoveryTrace.length > 0 && (
        <div className="p-3 rounded-lg bg-[#0e1524] border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5" />
              Minimum Backtracking Recovery Path (to [{recoveryTargetState}])
            </div>
            {onApplyRecoveryTrace && (
              <button
                onClick={() => onApplyRecoveryTrace(recoveryTrace)}
                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                title="Append recovery steps to trace to verify resolution"
              >
                <span>Apply Recovery</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-300 leading-snug">
            {recoveryExplanation}
          </p>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {recoveryTrace.map((evt, idx) => (
              <span
                key={`rec-${idx}`}
                className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs"
              >
                {evt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
