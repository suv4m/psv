import { FormalDFA } from './dfa';
import { ConformanceCoverageReport, ConformanceTestCase, EventSymbol, StateId } from './types';

export class ConformanceTestGenerator {
  private dfa: FormalDFA;

  constructor(dfa: FormalDFA) {
    this.dfa = dfa;
  }

  /**
   * Synthesizes a comprehensive conformance test suite with coverage guarantees.
   */
  public generateSuite(): ConformanceCoverageReport {
    const testCases: ConformanceTestCase[] = [];
    const coveredStates = new Set<StateId>([this.dfa.protocol.initialState]);
    const coveredTransitions = new Set<string>(); // "from:event:to"

    // 1. Positive Happy Paths: BFS paths from q0 to each reachable accepting state in F
    let caseIdx = 1;
    for (const finalState of this.dfa.protocol.finalStates) {
      const path = this.findPathBetween(this.dfa.protocol.initialState, finalState);
      if (path) {
        testCases.push({
          id: `TC-POS-${caseIdx++}`,
          name: `Happy Path to [${finalState}]`,
          trace: path.map(p => p.event),
          type: 'POSITIVE_HAPPY_PATH',
          expectedOutcome: 'ACCEPT',
          description: `Traverses legal transition sequence from ${this.dfa.protocol.initialState} to accepting state ${finalState}.`,
          targetCoverage: `Final state: ${finalState}`,
        });

        for (const seg of path) {
          coveredStates.add(seg.to);
          coveredTransitions.add(`${seg.from}:${seg.event}:${seg.to}`);
        }
      }
    }

    // 2. State-Covering Paths: Ensure all reachable states are touched
    const reachable = this.dfa.getReachableStates();
    for (const targetState of reachable) {
      if (!coveredStates.has(targetState)) {
        const path = this.findPathBetween(this.dfa.protocol.initialState, targetState);
        if (path) {
          testCases.push({
            id: `TC-STATE-${caseIdx++}`,
            name: `State Cover: [${targetState}]`,
            trace: path.map(p => p.event),
            type: 'POSITIVE_HAPPY_PATH',
            expectedOutcome: this.dfa.isFinal(targetState) ? 'ACCEPT' : 'ACCEPT', // valid sequence
            description: `Ensures reachability and state-entry verification for state "${targetState}".`,
            targetCoverage: `State: ${targetState}`,
          });

          for (const seg of path) {
            coveredStates.add(seg.to);
            coveredTransitions.add(`${seg.from}:${seg.event}:${seg.to}`);
          }
        }
      }
    }

    // 3. Transition-Covering Paths: Ensure all edges are traversed
    for (const t of this.dfa.protocol.transitions) {
      const transKey = `${t.from}:${t.event}:${t.to}`;
      if (!coveredTransitions.has(transKey)) {
        // Find path to t.from, then append t.event
        const prefix = this.findPathBetween(this.dfa.protocol.initialState, t.from);
        if (prefix !== null) {
          const fullPath = [...prefix, t];
          testCases.push({
            id: `TC-TRANS-${caseIdx++}`,
            name: `Edge Cover: ${t.from} --(${t.event})--> ${t.to}`,
            trace: fullPath.map(p => p.event),
            type: 'BOUNDARY_CYCLE',
            expectedOutcome: this.dfa.isFinal(t.to) ? 'ACCEPT' : 'ACCEPT',
            description: `Exercises protocol edge transition (${t.from}, ${t.event}) -> ${t.to}.`,
            targetCoverage: `Transition: ${t.from} -> ${t.to}`,
          });

          for (const seg of fullPath) {
            coveredStates.add(seg.to);
            coveredTransitions.add(`${seg.from}:${seg.event}:${seg.to}`);
          }
        }
      }
    }

    // 4. Adversarial Negative Mutations: Take a valid prefix and inject a forbidden symbol
    for (const state of reachable) {
      const allowed = new Set(this.dfa.getAllowedEvents(state));
      // Find a symbol in alphabet that is NOT allowed in this state
      const forbidden = this.dfa.protocol.alphabet.find(a => !allowed.has(a));
      if (forbidden) {
        const prefix = this.findPathBetween(this.dfa.protocol.initialState, state);
        if (prefix !== null) {
          const adversarialTrace = [...prefix.map(p => p.event), forbidden];
          testCases.push({
            id: `TC-ADV-${caseIdx++}`,
            name: `Negative Fuzz: Forbidden [${forbidden}] at [${state}]`,
            trace: adversarialTrace,
            type: 'ADVERSARIAL_MUTATION',
            expectedOutcome: 'REJECT',
            description: `Injects forbidden event "${forbidden}" into state "${state}" to verify protocol fault rejection.`,
            targetCoverage: `Negative boundary of ${state}`,
          });
          // Limit to max 4 adversarial tests to avoid cluttering
          if (testCases.filter(t => t.type === 'ADVERSARIAL_MUTATION').length >= 4) break;
        }
      }
    }

    const totalStates = this.dfa.protocol.states.length;
    const totalTransitions = this.dfa.protocol.transitions.length;

    const stateCoveragePct = Number(((coveredStates.size / Math.max(1, totalStates)) * 100).toFixed(1));
    const transitionCoveragePct = Number(((coveredTransitions.size / Math.max(1, totalTransitions)) * 100).toFixed(1));

    const uncoveredStates = this.dfa.protocol.states.filter(s => !coveredStates.has(s));
    const allTransKeys = this.dfa.protocol.transitions.map(t => `${t.from}:${t.event}:${t.to}`);
    const uncoveredTransitions = allTransKeys.filter(k => !coveredTransitions.has(k));

    return {
      stateCoveragePct,
      transitionCoveragePct,
      totalStates,
      coveredStates: Array.from(coveredStates),
      uncoveredStates,
      totalTransitions,
      coveredTransitions: Array.from(coveredTransitions),
      uncoveredTransitions,
      testCases,
    };
  }

  private findPathBetween(start: StateId, end: StateId): { from: StateId; event: EventSymbol; to: StateId }[] | null {
    if (start === end) return [];

    const visited = new Set<StateId>([start]);
    interface QueueItem {
      state: StateId;
      path: { from: StateId; event: EventSymbol; to: StateId }[];
    }
    const queue: QueueItem[] = [{ state: start, path: [] }];

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;
      for (const event of this.dfa.getAllowedEvents(state)) {
        const next = this.dfa.getTransition(state, event);
        if (!next) continue;

        const newPath = [...path, { from: state, event, to: next }];
        if (next === end) return newPath;

        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ state: next, path: newPath });
        }
      }
    }
    return null;
  }
}
