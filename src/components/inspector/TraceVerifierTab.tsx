import React, { useState } from 'react';
import { ProtocolDefinition, ValidationResult, EventSymbol } from '../../core/types';
import { DiagnosticsCard } from './DiagnosticsCard';
import {
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Plus,
  ArrowRight,
  ListOrdered,
  XCircle,
} from 'lucide-react';

interface TraceVerifierTabProps {
  protocol: ProtocolDefinition;
  validationResult: ValidationResult | null;
  onRunValidation: (trace: EventSymbol[]) => void;
  onSelectStep: (stepIndex: number) => void;
  currentStepIndex: number;
}

export const TraceVerifierTab: React.FC<TraceVerifierTabProps> = ({
  protocol,
  validationResult,
  onRunValidation,
  onSelectStep,
  currentStepIndex,
}) => {
  const [traceInput, setTraceInput] = useState<string>('');

  const parseInputTokens = (raw: string): EventSymbol[] => {
    return raw
      .split(/[\s,→]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  const handleValidate = () => {
    const tokens = parseInputTokens(traceInput);
    onRunValidation(tokens);
  };

  const handleAddSymbol = (sym: EventSymbol) => {
    setTraceInput((prev) => {
      const trimmed = prev.trim();
      return trimmed.length > 0 ? `${trimmed}, ${sym}` : sym;
    });
  };

  const handleLoadSample = (valid: boolean) => {
    if (protocol.id === 'tcp-rfc793') {
      const sample = valid
        ? 'ACTIVE_OPEN, RCV_SYN_ACK, SEND_DATA, RCV_DATA, CLOSE_APP, RCV_ACK, RCV_FIN, TIMEOUT_2MSL'
        : 'ACTIVE_OPEN, SEND_DATA'; // Illegal SEND_DATA before ESTABLISHED!
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else if (protocol.id === 'oauth2-pkce') {
      const sample = valid
        ? 'GEN_CODE_VERIFIER, REDIRECT_TO_AUTH_SERVER, USER_APPROVES_CONSENT, RECEIVE_AUTH_CODE, POST_TOKEN_WITH_VERIFIER, TOKEN_SUCCESS, ACCESS_API_RESOURCE, REVOKE_TOKEN'
        : 'GEN_CODE_VERIFIER, POST_TOKEN_WITH_VERIFIER'; // Skipped user consent & auth code
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else if (protocol.id === 'tls13-handshake') {
      const sample = valid
        ? 'SEND_CLIENT_HELLO, RCV_SERVER_HELLO, RCV_ENCRYPTED_EXTENSIONS, VERIFY_SERVER_CERT, RCV_SERVER_FINISHED, SEND_CLIENT_FINISHED, APP_DATA_TX, SEND_CLOSE_NOTIFY'
        : 'SEND_CLIENT_HELLO, APP_DATA_TX'; // Trying to send unencrypted app data before handshake!
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else if (protocol.id === 'iso8583-atm') {
      const sample = valid
        ? 'INSERT_CARD, SUBMIT_PIN, SELECT_SAVINGS, ENTER_AMOUNT, SEND_0200_REQ, RCV_0210_APPROVED, DISPENSE_CASH_OK, PRINT_RECEIPT, EJECT_CARD'
        : 'INSERT_CARD, DISPENSE_CASH_OK'; // Trying to dispense cash without PIN or authorization!
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else {
      // Default
      const sample = valid
        ? protocol.transitions.slice(0, 3).map((t) => t.event).join(', ')
        : `${protocol.transitions[0]?.event}, ${protocol.alphabet[protocol.alphabet.length - 1]}`;
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    }
  };

  const handleApplyRecoveryTrace = (recoveryTrace: EventSymbol[]) => {
    // Append recovery steps cleanly
    const current = parseInputTokens(traceInput);
    // Remove the failed event if it was invalid
    if (validationResult?.failureStep) {
      // Keep everything before the failure step
      const validPrefix = current.slice(0, validationResult.failureStep.stepIndex - 1);
      const repaired = [...validPrefix, ...recoveryTrace];
      const joined = repaired.join(', ');
      setTraceInput(joined);
      onRunValidation(repaired);
    } else {
      const repaired = [...current, ...recoveryTrace];
      const joined = repaired.join(', ');
      setTraceInput(joined);
      onRunValidation(repaired);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-full">
      {/* Sample Quick-Loaders */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Demo Presets
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleLoadSample(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Valid Happy Path</span>
          </button>
          <button
            onClick={() => handleLoadSample(false)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Injected Fault</span>
          </button>
        </div>
      </div>

      {/* Trace Input Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-300">
            Event Trace Sequence (Σ*)
          </label>
          {traceInput && (
            <button
              onClick={() => {
                setTraceInput('');
                onRunValidation([]);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          rows={3}
          value={traceInput}
          onChange={(e) => setTraceInput(e.target.value)}
          placeholder="e.g. ACTIVE_OPEN, RCV_SYN_ACK, SEND_DATA..."
          className="w-full bg-[#080c14] border border-slate-700/80 rounded-lg p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 font-mono">
            {parseInputTokens(traceInput).length} token(s) specified
          </span>
          <button
            onClick={handleValidate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute & Verify</span>
          </button>
        </div>
      </div>

      {/* Alphabet Symbol Quick Palette */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Plus className="w-3 h-3 text-cyan-400" />
          Click to Append Alphabet Symbol (Σ):
        </span>
        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-[#080c14] rounded-lg border border-slate-800 scrollbar-thin">
          {protocol.alphabet.map((sym) => (
            <button
              key={sym}
              onClick={() => handleAddSymbol(sym)}
              className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 hover:border-cyan-500/70 hover:text-cyan-200 hover:bg-cyan-950/40 text-[10px] font-mono text-slate-300 transition-all"
            >
              +{sym}
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostics Card Output */}
      {validationResult && (
        <DiagnosticsCard
          validationResult={validationResult}
          onApplyRecoveryTrace={handleApplyRecoveryTrace}
        />
      )}

      {/* Trace History Execution Log Table */}
      {validationResult && validationResult.history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <ListOrdered className="w-4 h-4 text-cyan-400" />
            <span>Trace Execution Log (δ transitions)</span>
          </div>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141d30] text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                <tr>
                  <th className="py-1.5 px-2.5">#</th>
                  <th className="py-1.5 px-2">From</th>
                  <th className="py-1.5 px-2">Event (a)</th>
                  <th className="py-1.5 px-2">Next δ(q,a)</th>
                  <th className="py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#0e1524]">
                {validationResult.history.map((step) => {
                  const isCurrent = currentStepIndex === step.stepIndex;
                  return (
                    <tr
                      key={step.stepIndex}
                      onClick={() => onSelectStep(step.stepIndex)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-cyan-950/40 text-cyan-200'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-1.5 px-2.5 font-bold text-slate-500">
                        {step.stepIndex}
                      </td>
                      <td className="py-1.5 px-2 text-slate-300 truncate max-w-[80px]" title={step.fromState}>
                        {step.fromState}
                      </td>
                      <td className="py-1.5 px-2 text-cyan-300 truncate max-w-[100px]" title={step.event}>
                        {step.event}
                      </td>
                      <td className="py-1.5 px-2 truncate max-w-[80px]" title={step.toState || '⊥'}>
                        {step.toState ? (
                          <span className="text-slate-300">{step.toState}</span>
                        ) : (
                          <span className="text-rose-400 font-bold">TRAP ⊥</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2">
                        {step.status === 'VALID' ? (
                          <span className="text-emerald-400 font-bold text-[10px]">OK</span>
                        ) : (
                          <span className="text-rose-400 font-bold text-[10px]">VIOLATION</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
