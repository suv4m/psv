import React, { useState } from 'react';
import { ProtocolDefinition, EventSymbol } from '../../core/types';
import { LogStreamParser } from '../../core/logParser';
import {
  FileCode,
  AlertTriangle,
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
      {/* Header */}
      <div className="rounded-xl border border-graphite-border bg-graphite-850 p-3.5 space-y-1">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gold-400" />
          <h4 className="text-xs font-bold text-white font-mono">
            Log Stream Tokenizer
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ingest raw server or telemetry text. The deterministic regex parser maps unstructured messages directly to protocol alphabet tokens (Σ).
        </p>
      </div>

      {/* Quick Loaders */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-slate-400">
          Sample Logs
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadSample(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-mint-500/15 text-mint-400 border border-mint-500/30 hover:bg-mint-500/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Normal Log</span>
          </button>
          <button
            onClick={() => handleLoadSample(false)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-ruby-500/15 text-ruby-400 border border-ruby-500/30 hover:bg-ruby-500/25 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Anomaly Log</span>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-semibold text-slate-300">
            Raw Log Stream
          </label>
          {rawLogs && (
            <button
              onClick={() => {
                setRawLogs('');
                setParsedData(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          rows={6}
          value={rawLogs}
          onChange={(e) => setRawLogs(e.target.value)}
          placeholder={`[2026-10-29 07:00:01] [INFO] Connection opened via ${protocol.alphabet[0]}...`}
          className="w-full bg-graphite-950 border border-graphite-border rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold-400 transition-colors resize-none"
        />
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={handleParse}
            disabled={!rawLogs.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-graphite-850 hover:bg-graphite-800 text-white font-bold text-xs border border-graphite-border hover:border-gold-400 transition-all disabled:opacity-40"
          >
            <Search className="w-3.5 h-3.5 text-gold-400" />
            <span>Tokenize Stream</span>
          </button>
        </div>
      </div>

      {/* Extracted Tokens Card */}
      {parsedData && (
        <div className="rounded-xl border border-graphite-border bg-graphite-850 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Extracted Protocol Trace
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-950 text-gold-400 border border-gold-400/40 font-bold">
              {parsedData.extractedTrace.length} Event(s) Matched
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-graphite-950 p-2.5 rounded-lg border border-graphite-border">
            <div>
              <span className="text-slate-400 block">Total Log Lines:</span>
              <span className="text-slate-100 font-bold">{parsedData.totalLines}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Non-Protocol:</span>
              <span className="text-slate-400 font-bold">{parsedData.unmatchedCount}</span>
            </div>
          </div>

          {/* Tokens Flow */}
          <div className="flex items-center gap-1.5 flex-wrap max-h-32 overflow-y-auto p-2 bg-graphite-950 rounded-lg border border-graphite-border scrollbar-thin">
            {parsedData.extractedTrace.map((evt, idx) => (
              <span
                key={`tok-${idx}`}
                className="px-2.5 py-1 rounded bg-amber-950/70 border border-gold-400/40 text-gold-400 font-mono text-xs font-semibold"
              >
                #{idx + 1} {evt}
              </span>
            ))}
          </div>

          <button
            onClick={() => onRunExtractedTrace(parsedData.extractedTrace)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-graphite-950 font-bold text-xs transition-all shadow-gold-glow"
          >
            <span>Pipe Trace into Verifier</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
