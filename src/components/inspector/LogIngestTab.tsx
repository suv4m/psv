import React, { useState } from 'react';
import { ProtocolDefinition, EventSymbol } from '../../core/types';
import { LogStreamParser } from '../../core/logParser';
import {
  FileText,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';

interface LogIngestTabProps {
  protocol: ProtocolDefinition;
  onRunExtractedTrace: (trace: EventSymbol[]) => void;
}

export const LogIngestTab: React.FC<LogIngestTabProps> = ({
  protocol,
  onRunExtractedTrace,
}) => {
  const [rawLogs, setRawLogs] = useState<string>('');
  const [parsedData, setParsedData] = useState<{
    extractedTrace: EventSymbol[];
    unmatchedCount: number;
    totalLines: number;
  } | null>(null);

  const parser = new LogStreamParser(protocol);

  const handleParse = () => {
    if (!rawLogs.trim()) return;
    const res = parser.parseLogText(rawLogs);
    setParsedData({
      extractedTrace: res.extractedTrace,
      unmatchedCount: res.unmatchedCount,
      totalLines: res.entries.length,
    });
  };

  const handleLoadSample = (valid: boolean) => {
    const sample = parser.generateSampleLogStream(valid);
    setRawLogs(sample);
    const res = parser.parseLogText(sample);
    setParsedData({
      extractedTrace: res.extractedTrace,
      unmatchedCount: res.unmatchedCount,
      totalLines: res.entries.length,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-full">
      {/* Informational Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0e1524] p-3.5 space-y-1">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-200">
            Real-World Log Stream Ingestion
          </h4>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Ingest raw server or telemetry text. The deterministic regex parser maps unstructured messages directly to protocol alphabet tokens (Σ).
        </p>
      </div>

      {/* Quick Demo Log Loaders */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Sample Logs
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleLoadSample(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Normal Session Log</span>
          </button>
          <button
            onClick={() => handleLoadSample(false)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Anomalous Attack Log</span>
          </button>
        </div>
      </div>

      {/* Raw Log Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
          <span>Raw Log Stream Content</span>
          {rawLogs && (
            <button
              onClick={() => {
                setRawLogs('');
                setParsedData(null);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </label>
        <textarea
          rows={6}
          value={rawLogs}
          onChange={(e) => setRawLogs(e.target.value)}
          placeholder={`[2026-10-29 07:00:01] [INFO] Connection opened via ${protocol.alphabet[0]}...`}
          className="w-full bg-[#080c14] border border-slate-700/80 rounded-lg p-2.5 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
        />
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={handleParse}
            disabled={!rawLogs.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-colors disabled:opacity-40"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tokenize Stream</span>
          </button>
        </div>
      </div>

      {/* Parse Results Preview Card */}
      {parsedData && (
        <div className="rounded-xl border border-slate-800 bg-[#0e1524] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Extracted Protocol Trace
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-bold">
              {parsedData.extractedTrace.length} Event(s) Matched
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#080c14] p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block">Total Log Lines:</span>
              <span className="text-slate-200 font-bold">{parsedData.totalLines}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Ignored / Non-Protocol:</span>
              <span className="text-slate-400 font-bold">{parsedData.unmatchedCount}</span>
            </div>
          </div>

          {/* Tokens Flow */}
          <div className="flex items-center gap-1.5 flex-wrap max-h-32 overflow-y-auto p-1.5 bg-[#080c14] rounded-lg border border-slate-800 scrollbar-thin">
            {parsedData.extractedTrace.map((evt, idx) => (
              <span
                key={`tok-${idx}`}
                className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-[11px]"
              >
                #{idx + 1} {evt}
              </span>
            ))}
          </div>

          <button
            onClick={() => onRunExtractedTrace(parsedData.extractedTrace)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <span>Pipe Trace into Formal Verifier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
