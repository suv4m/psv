import { FormalDFA } from './dfa';
import { StateId, EventSymbol } from './types';

export interface RecoveryPath {
  found: boolean;
  targetState: StateId | null;
  path: { from: StateId; event: EventSymbol; to: StateId }[];
  trace: EventSymbol[];
  explanation: string;
}

export class BacktrackingRecoveryEngine {
  private dfa: FormalDFA;

  constructor(dfa: FormalDFA) {
    this.dfa = dfa;
  }

  /**
   * BFS to find shortest sequence of events leading from `fromState` to any accepting state in F.
   */
  public findShortestPathToAccepting(fromState: StateId): RecoveryPath {
    if (this.dfa.isFinal(fromState)) {
      return {
        found: true,
        targetState: fromState,
        path: [],
        trace: [],
        explanation: `Current state "${fromState}" is already an accepting/quiescent state.`,
      };
    }

    const visited = new Set<StateId>([fromState]);
    interface QueueItem {
      state: StateId;
      path: { from: StateId; event: EventSymbol; to: StateId }[];
    }
    const queue: QueueItem[] = [{ state: fromState, path: [] }];

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;

      for (const event of this.dfa.getAllowedEvents(state)) {
        const next = this.dfa.getTransition(state, event);
        if (!next) continue;

        const newPath = [...path, { from: state, event, to: next }];

        if (this.dfa.isFinal(next)) {
          return {
            found: true,
            targetState: next,
            path: newPath,
            trace: newPath.map(p => p.event),
            explanation: `Shortest recovery to accepting state "${next}" in ${newPath.length} step(s): [${newPath.map(p => p.event).join(' → ')}]`,
          };
        }

        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ state: next, path: newPath });
        }
      }
    }

    return {
      found: false,
      targetState: null,
      path: [],
      trace: [],
      explanation: `No deterministic path exists from state "${fromState}" to any accepting state. System is in a dead-end trap.`,
    };
  }

  /**
   * BFS to find shortest sequence of events leading from `fromState` to a specified `targetState`.
   */
  public findShortestPathToState(fromState: StateId, targetState: StateId): RecoveryPath {
    if (fromState === targetState) {
      return {
        found: true,
        targetState,
        path: [],
        trace: [],
        explanation: `Current state is already "${targetState}".`,
      };
    }

    const visited = new Set<StateId>([fromState]);
    interface QueueItem {
      state: StateId;
      path: { from: StateId; event: EventSymbol; to: StateId }[];
    }
    const queue: QueueItem[] = [{ state: fromState, path: [] }];

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;

      for (const event of this.dfa.getAllowedEvents(state)) {
        const next = this.dfa.getTransition(state, event);
        if (!next) continue;

        const newPath = [...path, { from: state, event, to: next }];

        if (next === targetState) {
          return {
            found: true,
            targetState,
            path: newPath,
            trace: newPath.map(p => p.event),
            explanation: `Shortest path to "${targetState}" in ${newPath.length} step(s): [${newPath.map(p => p.event).join(' → ')}]`,
          };
        }

        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ state: next, path: newPath });
        }
      }
    }

    return {
      found: false,
      targetState: null,
      path: [],
      trace: [],
      explanation: `State "${targetState}" is unreachable from "${fromState}".`,
    };
  }

  /**
   * Comprehensive recovery diagnosis for a violation point
   */
  public diagnoseAndRecover(currentState: StateId, attemptedEvent: EventSymbol): {
    allowedEvents: EventSymbol[];
    recoveryToFinal: RecoveryPath;
    recoveryToInitial: RecoveryPath;
  } {
    const allowed = this.dfa.getAllowedEvents(currentState);
    const toFinal = this.findShortestPathToAccepting(currentState);
    const toInitial = this.findShortestPathToState(currentState, this.dfa.protocol.initialState);

    return {
      allowedEvents: allowed,
      recoveryToFinal: toFinal,
      recoveryToInitial: toInitial,
    };
  }
}
