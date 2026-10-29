import { describe, it, expect } from 'vitest';
import { FormalDFA } from '../src/core/dfa';
import { TraceVerifier } from '../src/core/verifier';
import { BacktrackingRecoveryEngine } from '../src/core/backtracking';
import { ConformanceTestGenerator } from '../src/core/generator';
import { LogStreamParser } from '../src/core/logParser';
import { PROTOCOL_PRESETS } from '../src/core/presets';

describe('TOC Formal Automata Engine Tests', () => {
  const tcpProtocol = PROTOCOL_PRESETS.find(p => p.id === 'tcp-rfc793')!;
  const oauthProtocol = PROTOCOL_PRESETS.find(p => p.id === 'oauth2-pkce')!;

  it('validates formal 5-tuple specification for all presets', () => {
    for (const preset of PROTOCOL_PRESETS) {
      const dfa = new FormalDFA(preset);
      const report = dfa.validateSpecification();
      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
    }
  });

  it('verifies valid 3-way handshake and active close in TCP', () => {
    const dfa = new FormalDFA(tcpProtocol);
    const verifier = new TraceVerifier(dfa);

    // CLOSED -> SYN_SENT -> ESTABLISHED -> FIN_WAIT_1 -> FIN_WAIT_2 -> TIME_WAIT -> CLOSED
    const trace = [
      'ACTIVE_OPEN',
      'RCV_SYN_ACK',
      'SEND_DATA',
      'RCV_DATA',
      'CLOSE_APP',
      'RCV_ACK',
      'RCV_FIN',
      'TIMEOUT_2MSL'
    ];

    const result = verifier.verify(trace);
    expect(result.isValid).toBe(true);
    expect(result.isAccepted).toBe(true);
    expect(result.finalState).toBe('CLOSED');
    expect(result.failureStep).toBeUndefined();
  });

  it('detects protocol violation (out-of-order data before handshake) and computes recovery', () => {
    const dfa = new FormalDFA(tcpProtocol);
    const verifier = new TraceVerifier(dfa);

    // CLOSED -> SYN_SENT -> (Illegal SEND_DATA!)
    const trace = ['ACTIVE_OPEN', 'SEND_DATA'];
    const result = verifier.verify(trace);

    expect(result.isValid).toBe(false);
    expect(result.isAccepted).toBe(false);
    expect(result.failureStep).toBeDefined();
    expect(result.failureStep?.fromState).toBe('SYN_SENT');
    expect(result.failureStep?.event).toBe('SEND_DATA');
    expect(result.failureStep?.status).toBe('INVALID_EVENT');
    expect(result.recoveryTrace).toBeDefined();
    // In SYN_SENT, shortest recovery to CLOSED is CLOSE_APP
    expect(result.recoveryTrace).toContain('CLOSE_APP');
  });

  it('computes shortest recovery path to accepting state via backtracking', () => {
    const dfa = new FormalDFA(oauthProtocol);
    const engine = new BacktrackingRecoveryEngine(dfa);

    // From AUTHORIZED_ACTIVE, shortest path to accepting state SESSION_REVOKED is REVOKE_TOKEN
    const recovery = engine.findShortestPathToAccepting('AUTHORIZED_ACTIVE');
    expect(recovery.found).toBe(true);
    expect(recovery.targetState).toBe('SESSION_REVOKED');
    expect(recovery.trace).toEqual(['REVOKE_TOKEN']);
  });

  it('generates high-coverage conformance test suite', () => {
    const dfa = new FormalDFA(tcpProtocol);
    const generator = new ConformanceTestGenerator(dfa);
    const report = generator.generateSuite();

    expect(report.stateCoveragePct).toBeGreaterThan(90);
    expect(report.transitionCoveragePct).toBeGreaterThan(80);
    expect(report.testCases.length).toBeGreaterThan(5);

    const hasAdversarial = report.testCases.some(t => t.type === 'ADVERSARIAL_MUTATION');
    expect(hasAdversarial).toBe(true);
  });

  it('parses raw server logs into protocol event traces', () => {
    const parser = new LogStreamParser(tcpProtocol);
    const sampleLog = parser.generateSampleLogStream(true);
    const parsed = parser.parseLogText(sampleLog);

    expect(parsed.extractedTrace.length).toBeGreaterThan(3);
    expect(parsed.extractedTrace).toContain('ACTIVE_OPEN');

    const dfa = new FormalDFA(tcpProtocol);
    const verifier = new TraceVerifier(dfa);
    const result = verifier.verify(parsed.extractedTrace);
    expect(result.isValid).toBe(true);
  });
});
