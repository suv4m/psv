import React, { useState } from 'react';
import { ProtocolDefinition, ValidationResult, EventSymbol } from '../../core/types';
import { DiagnosticsCard } from './DiagnosticsCard';
import {
  Play,
  Sparkles,
  AlertTriangle,
  Plus,
  ListOrdered,
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
        : 'ACTIVE_OPEN, SEND_DATA';
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else if (protocol.id === 'oauth2-pkce') {
      const sample = valid
        ? 'GEN_CODE_VERIFIER, REDIRECT_TO_AUTH_SERVER, USER_APPROVES_CONSENT, RECEIVE_AUTH_CODE, POST_TOKEN_WITH_VERIFIER, TOKEN_SUCCESS, ACCESS_API_RESOURCE, REVOKE_TOKEN'
        : 'GEN_CODE_VERIFIER, POST_TOKEN_WITH_VERIFIER';
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else if (protocol.id === 'tls13-handshake') {
      const sample = valid
        ? 'SEND_CLIENT_HELLO, RCV_SERVER_HELLO, RCV_ENCRYPTED_EXTENSIONS, VERIFY_SERVER_CERT, RCV_SERVER_FINISHED, SEND_CLIENT_FINISHED, APP_DATA_TX, SEND_CLOSE_NOTIFY'
        : 'SEND_CLIENT_HELLO, APP_DATA_TX';
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else if (protocol.id === 'iso8583-atm') {
      const sample = valid
        ? 'INSERT_CARD, SUBMIT_PIN, SELECT_SAVINGS, ENTER_AMOUNT, SEND_0200_REQ, RCV_0210_APPROVED, DISPENSE_CASH_OK, PRINT_RECEIPT, EJECT_CARD'
        : 'INSERT_CARD, DISPENSE_CASH_OK';
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    } else {
      const sample = valid
        ? protocol.transitions.slice(0, 3).map((t) => t.event).join(', ')
        : `${protocol.transitions[0]?.event}, ${protocol.alphabet[protocol.alphabet.length - 1]}`;
      setTraceInput(sample);
      onRunValidation(parseInputTokens(sample));
    }
  };

  const handleApplyRecoveryTrace = (recoveryTrace: EventSymbol[]) => {
    const current = parseInputTokens(traceInput);
    if (validationResult?.failureStep) {
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
      {/* Sleek Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-slate-400">
          Trace Verification
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadSample(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-mint-500/15 text-mint-400 border border-mint-500/30 hover:bg-mint-500/25 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Valid Path</span>
          </button>
          <button
            onClick={() => handleLoadSample(false)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-ruby-500/15 text-ruby-400 border border-ruby-500/30 hover:bg-ruby-500/25 transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Injected Fault</span>
          </button>
        </div>
      </div>

      {/* Trace Input Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-semibold text-slate-300">
            Event Sequence Trace (Σ*)
          </label>
          {traceInput && (
            <button
              onClick={() => {
                setTraceInput('');
                onRunValidation([]);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
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
          className="w-full bg-graphite-950 border border-graphite-border rounded-xl p-3 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-400 focus:shadow-gold-glow transition-all resize-none"
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400 font-mono">
            {parseInputTokens(traceInput).length} event token(s)
          </span>
          <button
            onClick={handleValidate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-graphite-950 font-bold text-xs hover:bg-gold-400 transition-all shadow-gold-glow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute & Verify</span>
          </button>
        </div>
      </div>

      {/* Alphabet Symbol Quick Palette */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-gold-400" />
          Click to Append Alphabet Symbol (Σ):
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-graphite-950 rounded-xl border border-graphite-border scrollbar-thin">
          {protocol.alphabet.map((sym) => (
            <button
              key={sym}
              onClick={() => handleAddSymbol(sym)}
              className="px-2.5 py-1 rounded-lg bg-graphite-850 border border-graphite-border hover:border-gold-400 hover:text-gold-400 text-xs font-mono font-medium text-slate-300 transition-all"
            >
              +{sym}
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostics Card */}
      {validationResult && (
        <DiagnosticsCard
          validationResult={validationResult}
          onApplyRecoveryTrace={handleApplyRecoveryTrace}
        />
      )}

      {/* Trace History Execution Log Table */}
      {validationResult && validationResult.history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <ListOrdered className="w-4 h-4 text-gold-400" />
            <span>Trace Execution Steps</span>
          </div>
          <div className="border border-graphite-border rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-graphite-850 text-slate-400 border-b border-graphite-border text-xs uppercase">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-2.5">From</th>
                  <th className="py-2 px-2.5">Event (a)</th>
                  <th className="py-2 px-2.5">Next δ</th>
                  <th className="py-2 px-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border bg-graphite-900">
                {validationResult.history.map((step) => {
                  const isCurrent = currentStepIndex === step.stepIndex;
                  return (
                    <tr
                      key={step.stepIndex}
                      onClick={() => onSelectStep(step.stepIndex)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-amber-950/40 text-gold-400'
                          : 'hover:bg-graphite-850 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-slate-500">
                        {step.stepIndex}
                      </td>
                      <td className="py-2 px-2.5 text-slate-200 font-semibold truncate max-w-[90px]" title={step.fromState}>
                        {step.fromState}
                      </td>
                      <td className="py-2 px-2.5 text-gold-400 font-semibold truncate max-w-[110px]" title={step.event}>
                        {step.event}
                      </td>
                      <td className="py-2 px-2.5 truncate max-w-[90px]" title={step.toState || '⊥'}>
                        {step.toState ? (
                          <span className="text-slate-200 font-medium">{step.toState}</span>
                        ) : (
                          <span className="text-ruby-400 font-bold">TRAP ⊥</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5">
                        {step.status === 'VALID' ? (
                          <span className="text-mint-400 font-bold">OK</span>
                        ) : (
                          <span className="text-ruby-400 font-bold">VIOLATION</span>
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
