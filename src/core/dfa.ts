import { ProtocolDefinition, StateId, EventSymbol, Transition } from './types';

export class FormalDFA {
  public readonly protocol: ProtocolDefinition;
  private readonly transitionMap: Map<string, StateId>; // "from:event" -> to
  private readonly outgoingEventsMap: Map<StateId, Set<EventSymbol>>;
  private readonly incomingTransitionsMap: Map<StateId, Transition[]>;

  constructor(protocol: ProtocolDefinition) {
    this.protocol = protocol;
    this.transitionMap = new Map();
    this.outgoingEventsMap = new Map();
    this.incomingTransitionsMap = new Map();

    // Initialize state indices
    for (const s of protocol.states) {
      this.outgoingEventsMap.set(s, new Set());
      this.incomingTransitionsMap.set(s, []);
    }

    // Populate transitions
    for (const t of protocol.transitions) {
      const key = `${t.from}:${t.event}`;
      this.transitionMap.set(key, t.to);
      
      const outgoing = this.outgoingEventsMap.get(t.from);
      if (outgoing) outgoing.add(t.event);

      const incoming = this.incomingTransitionsMap.get(t.to);
      if (incoming) incoming.push(t);
    }
  }

  public getTransition(from: StateId, event: EventSymbol): StateId | null {
    return this.transitionMap.get(`${from}:${event}`) || null;
  }

  public getAllowedEvents(state: StateId): EventSymbol[] {
    const set = this.outgoingEventsMap.get(state);
    return set ? Array.from(set) : [];
  }

  public isInitial(state: StateId): boolean {
    return this.protocol.initialState === state;
  }

  public isFinal(state: StateId): boolean {
    return this.protocol.finalStates.includes(state);
  }

  public isValidSymbol(event: EventSymbol): boolean {
    return this.protocol.alphabet.includes(event);
  }

  /**
   * BFS reachability from initial state q0
   */
  public getReachableStates(): Set<StateId> {
    const reachable = new Set<StateId>();
    const queue: StateId[] = [this.protocol.initialState];
    reachable.add(this.protocol.initialState);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const event of this.getAllowedEvents(current)) {
        const next = this.getTransition(current, event);
        if (next && !reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }
    return reachable;
  }

  /**
   * Detect sink states (states with no outgoing transitions that are non-accepting)
   */
  public getSinkStates(): Set<StateId> {
    const sinks = new Set<StateId>();
    for (const state of this.protocol.states) {
      const outgoing = this.getAllowedEvents(state);
      if (outgoing.length === 0 && !this.isFinal(state)) {
        sinks.add(state);
      }
    }
    return sinks;
  }

  /**
   * Formal 5-tuple verification check
   */
  public validateSpecification(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check q0 in Q
    if (!this.protocol.states.includes(this.protocol.initialState)) {
      errors.push(`Initial state "${this.protocol.initialState}" is not defined in state set Q.`);
    }

    // Check F subset of Q
    for (const f of this.protocol.finalStates) {
      if (!this.protocol.states.includes(f)) {
        errors.push(`Final state "${f}" is not defined in state set Q.`);
      }
    }

    // Check transition validity
    for (const t of this.protocol.transitions) {
      if (!this.protocol.states.includes(t.from)) {
        errors.push(`Transition source "${t.from}" is not in Q.`);
      }
      if (!this.protocol.states.includes(t.to)) {
        errors.push(`Transition target "${t.to}" is not in Q.`);
      }
      if (!this.protocol.alphabet.includes(t.event)) {
        errors.push(`Transition event "${t.event}" is not in alphabet Σ.`);
      }
    }

    // Check reachability
    const reachable = this.getReachableStates();
    for (const state of this.protocol.states) {
      if (!reachable.has(state)) {
        warnings.push(`State "${state}" is unreachable from initial state "${this.protocol.initialState}".`);
      }
    }

    // Check for accepting state reachability
    const acceptingReachable = this.protocol.finalStates.some(f => reachable.has(f));
    if (!acceptingReachable && this.protocol.finalStates.length > 0) {
      warnings.push(`No final accepting state is reachable from q0.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generates formal LaTeX transition matrix
   */
  public toLatexMatrix(): string {
    const { states, alphabet } = this.protocol;
    let latex = `\\begin{array}{|c|${'c|'.repeat(alphabet.length)}}\n\\hline\n`;
    latex += `\\delta & ${alphabet.map(a => `\\text{${a}}`).join(' & ')} \\\\\n\\hline\n`;

    for (const s of states) {
      const prefix = this.isInitial(s) && this.isFinal(s) ? '\\to * ' :
                     this.isInitial(s) ? '\\to ' :
                     this.isFinal(s) ? '* ' : '';
      const row = alphabet.map(a => {
        const next = this.getTransition(s, a);
        return next ? `\\text{${next}}` : '\\bot';
      });
      latex += `${prefix}\\text{${s}} & ${row.join(' & ')} \\\\\n\\hline\n`;
    }
    latex += `\\end{array}`;
    return latex;
  }
}

