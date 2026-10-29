import React, { useState, useMemo, useCallback } from 'react';
import { ProtocolDefinition, ValidationResult, EventSymbol, StateId } from './core/types';
import { PROTOCOL_PRESETS } from './core/presets';
import { FormalDFA } from './core/dfa';
import { TraceVerifier } from './core/verifier';
import { Header } from './components/navbar/Header';
import { FormalTupleModal } from './components/navbar/FormalTupleModal';
import { ProtocolCanvas } from './components/canvas/ProtocolCanvas';
import { TraceScrubber } from './components/timeline/TraceScrubber';
import { TraceVerifierTab } from './components/inspector/TraceVerifierTab';
import { ConformanceTab } from './components/inspector/ConformanceTab';
import { LogIngestTab } from './components/inspector/LogIngestTab';
import { FormalSpecTab } from './components/inspector/FormalSpecTab';
import { PlayCircle, ShieldCheck, FileText, Code2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentProtocol, setCurrentProtocol] = useState<ProtocolDefinition>(PROTOCOL_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'VERIFIER' | 'CONFORMANCE' | 'LOG_INGEST' | 'FORMAL_SPEC'>('VERIFIER');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [rawTrace, setRawTrace] = useState<EventSymbol[]>([]);
  const [isFormalModalOpen, setIsFormalModalOpen] = useState<boolean>(false);

  // Core DFA engine instance for active protocol
  const dfa = useMemo(() => new FormalDFA(currentProtocol), [currentProtocol]);

  // Handler to execute verification on a trace
  const handleRunValidation = useCallback((trace: EventSymbol[]) => {
    setRawTrace(trace);
    const verifier = new TraceVerifier(dfa);
    const result = verifier.verify(trace);
    setValidationResult(result);
    // Jump to the final step or failure point automatically
    setCurrentStepIndex(result.history.length);
  }, [dfa]);

  // Protocol change handler
  const handleSelectProtocol = useCallback((protocol: ProtocolDefinition) => {
    setCurrentProtocol(protocol);
    setValidationResult(null);
    setCurrentStepIndex(0);
    setRawTrace([]);
  }, []);

  // Compute active state and edge transitions from scrubber step index
  const { activeState, activeTransition, failedState, failedTransition } = useMemo(() => {
    if (!validationResult || currentStepIndex === 0) {
      return {
        activeState: currentProtocol.initialState,
        activeTransition: null,
        failedState: null,
        failedTransition: null,
      };
    }

    const step = validationResult.history[currentStepIndex - 1];
    if (!step) {
      return {
        activeState: currentProtocol.initialState,
        activeTransition: null,
        failedState: null,
        failedTransition: null,
      };
    }

    if (step.status === 'VALID' && step.toState) {
      return {
        activeState: step.toState,
        activeTransition: { from: step.fromState, event: step.event, to: step.toState },
        failedState: null,
        failedTransition: null,
      };
    } else {
      // Violation point
      return {
        activeState: null,
        activeTransition: null,
        failedState: step.fromState,
        failedTransition: { from: step.fromState, event: step.event },
      };
    }
  }, [validationResult, currentStepIndex, currentProtocol]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        currentProtocol={currentProtocol}
        onSelectProtocol={handleSelectProtocol}
        onOpenFormalModal={() => setIsFormalModalOpen(true)}
      />

      {/* Main Workspace (Split Pane: Left Graph Canvas 65%, Right Inspector Dock 35%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Interactive React Flow Canvas */}
        <div className="flex-1 relative h-full border-r border-slate-800">
          <ProtocolCanvas
            protocol={currentProtocol}
            activeState={activeState}
            activeTransition={activeTransition}
            failedState={failedState}
            failedTransition={failedTransition}
          />
        </div>

        {/* Right: Inspector Workbench Dock */}
        <div className="w-[420px] 2xl:w-[480px] h-full bg-[#0e1524] flex flex-col shrink-0">
          {/* Tab Navigation Bar */}
          <div className="flex items-center border-b border-slate-800 bg-[#141d30] px-2 pt-1 select-none">
            <button
              onClick={() => setActiveTab('VERIFIER')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'VERIFIER'
                  ? 'border-cyan-400 text-cyan-300 bg-[#0e1524] rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Trace Verifier</span>
            </button>

            <button
              onClick={() => setActiveTab('CONFORMANCE')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'CONFORMANCE'
                  ? 'border-cyan-400 text-cyan-300 bg-[#0e1524] rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conformance Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('LOG_INGEST')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'LOG_INGEST'
                  ? 'border-cyan-400 text-cyan-300 bg-[#0e1524] rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Log Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('FORMAL_SPEC')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'FORMAL_SPEC'
                  ? 'border-cyan-400 text-cyan-300 bg-[#0e1524] rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>5-Tuple Spec</span>
            </button>
          </div>

          {/* Active Tab Viewport */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'VERIFIER' && (
              <TraceVerifierTab
                protocol={currentProtocol}
                validationResult={validationResult}
                onRunValidation={handleRunValidation}
                onSelectStep={setCurrentStepIndex}
                currentStepIndex={currentStepIndex}
              />
            )}
            {activeTab === 'CONFORMANCE' && (
              <ConformanceTab
                protocol={currentProtocol}
                onRunTestCase={(testTrace) => {
                  handleRunValidation(testTrace);
                  setActiveTab('VERIFIER');
                }}
              />
            )}
            {activeTab === 'LOG_INGEST' && (
              <LogIngestTab
                protocol={currentProtocol}
                onRunExtractedTrace={(extractedTrace) => {
                  handleRunValidation(extractedTrace);
                  setActiveTab('VERIFIER');
                }}
              />
            )}
            {activeTab === 'FORMAL_SPEC' && (
              <FormalSpecTab protocol={currentProtocol} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline Playback Scrubber Bar */}
      <TraceScrubber
        validationResult={validationResult}
        currentStepIndex={currentStepIndex}
        onStepChange={setCurrentStepIndex}
        rawTrace={rawTrace}
      />

      {/* Formal 5-Tuple Mathematics Modal */}
      <FormalTupleModal
        isOpen={isFormalModalOpen}
        onClose={() => setIsFormalModalOpen(false)}
        protocol={currentProtocol}
      />
    </div>
  );
};

export default App;
