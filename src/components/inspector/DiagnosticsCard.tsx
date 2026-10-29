import React from 'react';
import { ValidationResult, EventSymbol } from '../../core/types';
import {
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
      <div className="rounded-xl border border-neon-emerald/50 bg-emerald-950/20 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 border border-neon-emerald/40 text-neon-emerald">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neon-emerald font-mono">
                Protocol Accepted (w ∈ L(M))
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {executionTimeMs} ms
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
              Trace satisfied all safety and transition invariants. Clean quiescent state reached in{' '}
              <span className="font-mono font-bold text-neon-emerald">[{finalState}]</span> in{' '}
              <span className="font-mono font-bold text-white">{validationResult.totalSteps}</span> step(s).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Incomplete Trace (Valid steps, but non-accepting state)
  if (isValid && !isAccepted) {
    return (
      <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-neon-amber">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neon-amber font-mono">
                Incomplete Protocol Trace
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {executionTimeMs} ms
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
              All transitions executed legally, but protocol terminated prematurely in intermediate state{' '}
              <span className="font-mono font-bold text-neon-amber">[{finalState}]</span>.
            </p>

            {recoveryTrace && recoveryTrace.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-void-950 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-neon-amber flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Shortest Path to Quiescent Final State [{recoveryTargetState}]
                  </div>
                  {onApplyRecoveryTrace && (
                    <button
                      onClick={() => onApplyRecoveryTrace(recoveryTrace)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/20 text-neon-amber border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1"
                    >
                      <span>Append Steps</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {recoveryTrace.map((evt, idx) => (
                    <span
                      key={`rec-${idx}`}
                      className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-neon-amber font-mono text-xs"
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

  // Case 3: Violation Point
  return (
    <div className="rounded-xl border border-neon-rose/50 bg-rose-950/25 p-4 backdrop-blur-sm space-y-3 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-neon-rose/20 border border-neon-rose/40 text-neon-rose">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-neon-rose font-mono">
              Protocol Violation Detected
            </h4>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-neon-rose/20 text-neon-rose border border-neon-rose/40 font-bold">
              Step #{failureStep?.stepIndex}
            </span>
          </div>
          <p className="mt-1 text-xs text-rose-200 font-mono">
            δ({failureStep?.fromState}, {failureStep?.event}) = ⊥ (Undefined Transition)
          </p>
        </div>
      </div>

      {/* Breakdown Matrix */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-void-950 p-3 rounded-lg border border-void-border">
        <div>
          <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
            State at Failure
          </span>
          <span className="font-bold text-slate-100 text-sm">{failureStep?.fromState}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
            Illegal Attempted Event
          </span>
          <span className="font-bold text-neon-rose text-sm">{failureStep?.event}</span>
        </div>
        <div className="col-span-2 mt-2 pt-2 border-t border-void-border">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-1.5">
            Permitted in [{failureStep?.fromState}]:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {failureStep?.allowedEvents && failureStep.allowedEvents.length > 0 ? (
              failureStep.allowedEvents.map((evt) => (
                <span
                  key={evt}
                  className="px-2 py-0.5 rounded bg-blue-950/60 border border-neon-blue/40 text-neon-blue text-xs font-medium"
                >
                  {evt}
                </span>
              ))
            ) : (
              <span className="text-neon-rose text-xs italic">No outgoing transitions (Deadlock Trap)</span>
            )}
          </div>
        </div>
      </div>

      {/* Backtracking Recovery Recommendation */}
      {recoveryTrace && recoveryTrace.length > 0 && (
        <div className="p-3 rounded-lg bg-void-950 border border-neon-blue/40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-neon-blue flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5" />
              Minimum Recovery Path to [{recoveryTargetState}]
            </div>
            {onApplyRecoveryTrace && (
              <button
                onClick={() => onApplyRecoveryTrace(recoveryTrace)}
                className="px-2.5 py-1 text-xs font-bold rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/40 hover:bg-neon-blue/30 transition-all flex items-center gap-1"
                title="Append recovery steps to trace"
              >
                <span>Apply Recovery</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-snug">
            {recoveryExplanation}
          </p>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {recoveryTrace.map((evt, idx) => (
              <span
                key={`rec-${idx}`}
                className="px-2 py-0.5 rounded bg-blue-950/60 border border-neon-blue/40 text-neon-blue font-mono text-xs font-semibold"
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
