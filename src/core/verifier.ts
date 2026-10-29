import { FormalDFA } from './dfa';
import { BacktrackingRecoveryEngine } from './backtracking';
import { EventSymbol, StateId, TraceStep, ValidationResult } from './types';

export class TraceVerifier {
  private dfa: FormalDFA;
  private recoveryEngine: BacktrackingRecoveryEngine;

  constructor(dfa: FormalDFA) {
    this.dfa = dfa;
    this.recoveryEngine = new BacktrackingRecoveryEngine(dfa);
  }

  /**
   * Evaluates an event sequence against the DFA.
   * Pure functional: does not mutate state.
   */
  public verify(trace: EventSymbol[]): ValidationResult {
    const startTime = performance.now();
    let currentState: StateId = this.dfa.protocol.initialState;
    const history: TraceStep[] = [];
    let failureStep: TraceStep | undefined = undefined;

    // Handle empty trace epsilon
    if (trace.length === 0) {
      const isAccepted = this.dfa.isFinal(currentState);
      return {
        isValid: true,
        isAccepted,
        totalSteps: 0,
        history: [],
        finalState: currentState,
        executionTimeMs: Number((performance.now() - startTime).toFixed(3)),
      };
    }

    for (let i = 0; i < trace.length; i++) {
      const event = trace[i].trim();
      const allowedEvents = this.dfa.getAllowedEvents(currentState);

      // Check symbol membership in Sigma
      if (!this.dfa.isValidSymbol(event)) {
        failureStep = {
          stepIndex: i + 1,
          fromState: currentState,
          event,
          toState: null,
          status: 'UNREGISTERED_SYMBOL',
          allowedEvents,
          explanation: `Event "${event}" is not in the protocol alphabet Σ.`,
        };
        history.push(failureStep);
        break;
      }

      // Check transition delta(currentState, event)
      const nextState = this.dfa.getTransition(currentState, event);

      if (!nextState) {
        failureStep = {
          stepIndex: i + 1,
          fromState: currentState,
          event,
          toState: null,
          status: 'INVALID_EVENT',
          allowedEvents,
          explanation: `Forbidden transition: event "${event}" is illegal from state "${currentState}". Expected one of: [${allowedEvents.join(', ')}].`,
        };
        history.push(failureStep);
        break;
      }

      // Valid transition
      history.push({
        stepIndex: i + 1,
        fromState: currentState,
        event,
        toState: nextState,
        status: 'VALID',
        allowedEvents,
        explanation: `Transitioned from "${currentState}" to "${nextState}" on event "${event}".`,
      });

      currentState = nextState;
    }

    const isValid = failureStep === undefined;
    const isAccepted = isValid && this.dfa.isFinal(currentState);

    let recoveryTrace: EventSymbol[] | undefined;
    let recoveryTargetState: StateId | undefined;
    let recoveryExplanation: string | undefined;

    // Compute backtracking diagnosis if invalid or terminated in non-accepting state
    if (!isValid && failureStep) {
      const diag = this.recoveryEngine.diagnoseAndRecover(failureStep.fromState, failureStep.event);
      if (diag.recoveryToFinal.found) {
        recoveryTrace = diag.recoveryToFinal.trace;
        recoveryTargetState = diag.recoveryToFinal.targetState!;
        recoveryExplanation = `Recovery Recommendation: At state "${failureStep.fromState}", execute [${recoveryTrace.join(' → ')}] to reach valid quiescent state "${recoveryTargetState}".`;
      } else if (diag.recoveryToInitial.found) {
        recoveryTrace = diag.recoveryToInitial.trace;
        recoveryTargetState = this.dfa.protocol.initialState;
        recoveryExplanation = `Recovery Reset: No path to accepting state. Execute [${recoveryTrace.join(' → ')}] to reset protocol to initial state "${recoveryTargetState}".`;
      } else {
        recoveryExplanation = `Unrecoverable Protocol Trap: State "${failureStep.fromState}" is a dead-end with no path to accepting states or reset.`;
      }
    } else if (isValid && !isAccepted) {
      // Completed sequence, but terminated in non-final state
      const toFinal = this.recoveryEngine.findShortestPathToAccepting(currentState);
      if (toFinal.found) {
        recoveryTrace = toFinal.trace;
        recoveryTargetState = toFinal.targetState!;
        recoveryExplanation = `Incomplete Protocol Trace: Ended in intermediate state "${currentState}". Execute [${recoveryTrace.join(' → ')}] to finalize into "${recoveryTargetState}".`;
      }
    }

    return {
      isValid,
      isAccepted,
      totalSteps: history.length,
      history,
      failureStep,
      finalState: isValid ? currentState : (failureStep ? failureStep.fromState : null),
      recoveryTrace,
      recoveryTargetState,
      recoveryExplanation,
      executionTimeMs: Number((performance.now() - startTime).toFixed(3)),
    };
  }
}
