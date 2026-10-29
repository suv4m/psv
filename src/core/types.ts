export type StateId = string;
export type EventSymbol = string;

export interface Transition {
  from: StateId;
  event: EventSymbol;
  to: StateId;
  label?: string;
  description?: string;
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'Network' | 'Security' | 'Financial' | 'IoT' | 'Application';
  states: StateId[];
  alphabet: EventSymbol[];
  initialState: StateId;
  finalStates: StateId[];
  transitions: Transition[];
  stateDescriptions?: Record<StateId, string>;
  eventDescriptions?: Record<EventSymbol, string>;
  safetyInvariants?: string[];
}

export type StepStatus = 
  | 'VALID' 
  | 'INVALID_EVENT' 
  | 'UNREGISTERED_SYMBOL' 
  | 'DEADLOCK_STATE' 
  | 'ACCEPTING' 
  | 'NON_ACCEPTING_TERMINATION';

export interface TraceStep {
  stepIndex: number;
  fromState: StateId;
  event: EventSymbol;
  toState: StateId | null;
  status: StepStatus;
  allowedEvents: EventSymbol[];
  explanation: string;
}

export interface ValidationResult {
  isValid: boolean;          // True iff all transitions are defined (Safety satisfied)
  isAccepted: boolean;       // True iff all transitions are valid AND final state in F
  totalSteps: number;
  history: TraceStep[];
  failureStep?: TraceStep;
  finalState: StateId | null;
  recoveryTrace?: EventSymbol[];
  recoveryTargetState?: StateId;
  recoveryExplanation?: string;
  executionTimeMs: number;
}

export interface ConformanceTestCase {
  id: string;
  name: string;
  trace: EventSymbol[];
  type: 'POSITIVE_HAPPY_PATH' | 'BOUNDARY_CYCLE' | 'ADVERSARIAL_MUTATION';
  expectedOutcome: 'ACCEPT' | 'REJECT';
  description: string;
  targetCoverage: string;
}

export interface ConformanceCoverageReport {
  stateCoveragePct: number;
  transitionCoveragePct: number;
  totalStates: number;
  coveredStates: StateId[];
  uncoveredStates: StateId[];
  totalTransitions: number;
  coveredTransitions: string[];
  uncoveredTransitions: string[];
  testCases: ConformanceTestCase[];
}

export interface ParsedLogEntry {
  rawLine: string;
  timestamp?: string;
  extractedEvent: EventSymbol | null;
  isMatched: boolean;
  metadata?: Record<string, string>;
}

