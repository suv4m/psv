import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ProtocolDefinition, ValidationResult, EventSymbol } from './core/types';
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

  // VS Code style resizable panel dimensions
  const [sidebarWidth, setSidebarWidth] = useState<number>(440);
  const [bottomHeight, setBottomHeight] = useState<number>(145);

  const isResizingSidebar = useRef<boolean>(false);
  const isResizingBottom = useRef<boolean>(false);

  // Resize Handlers
  const handleMouseDownSidebar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
  }, []);

  const handleMouseDownBottom = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingBottom.current = true;
    document.body.style.cursor = 'row-resize';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 320 && newWidth <= 750) {
          setSidebarWidth(newWidth);
        }
      }
      if (isResizingBottom.current) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 90 && newHeight <= 480) {
          setBottomHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizingSidebar.current || isResizingBottom.current) {
        isResizingSidebar.current = false;
        isResizingBottom.current = false;
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Core DFA engine instance for active protocol
  const dfa = useMemo(() => new FormalDFA(currentProtocol), [currentProtocol]);

  // Handler to execute verification on a trace
  const handleRunValidation = useCallback((trace: EventSymbol[]) => {
    setRawTrace(trace);
    const verifier = new TraceVerifier(dfa);
    const result = verifier.verify(trace);
    setValidationResult(result);
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
      return {
        activeState: null,
        activeTransition: null,
        failedState: step.fromState,
        failedTransition: { from: step.fromState, event: step.event },
      };
    }
  }, [validationResult, currentStepIndex, currentProtocol]);

  return (
    <div className="flex flex-col h-screen w-screen bg-graphite-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        currentProtocol={currentProtocol}
        onSelectProtocol={handleSelectProtocol}
        onOpenFormalModal={() => setIsFormalModalOpen(true)}
      />

      {/* Main Workspace (Canvas + Sliding Divider + Right Inspector) */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left: Interactive Canvas Viewport */}
        <div className="flex-1 relative h-full min-w-0">
          <ProtocolCanvas
            protocol={currentProtocol}
            activeState={activeState}
            activeTransition={activeTransition}
            failedState={failedState}
            failedTransition={failedTransition}
          />
        </div>

        {/* VS Code Style Horizontal Sliding Bar (Resize Inspector Sidebar) */}
        <div
          onMouseDown={handleMouseDownSidebar}
          className="w-1.5 hover:w-2 bg-graphite-border hover:bg-gold-500 active:bg-gold-500 cursor-col-resize transition-all duration-150 relative z-30 group flex items-center justify-center shrink-0"
          title="Drag to resize inspector panel"
        >
          <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-graphite-950 transition-colors" />
        </div>

        {/* Right: Inspector Workbench Dock */}
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="h-full bg-graphite-900 flex flex-col shrink-0 overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-graphite-border bg-graphite-850 px-2 pt-1 select-none">
            <button
              onClick={() => setActiveTab('VERIFIER')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'VERIFIER'
                  ? 'border-gold-400 text-gold-400 bg-graphite-900 rounded-t-lg font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-4 h-4 text-gold-400" />
              <span>Trace Verifier</span>
            </button>

            <button
              onClick={() => setActiveTab('CONFORMANCE')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'CONFORMANCE'
                  ? 'border-gold-400 text-gold-400 bg-graphite-900 rounded-t-lg font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-mint-400" />
              <span>Conformance</span>
            </button>

            <button
              onClick={() => setActiveTab('LOG_INGEST')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'LOG_INGEST'
                  ? 'border-gold-400 text-gold-400 bg-graphite-900 rounded-t-lg font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-300" />
              <span>Log Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('FORMAL_SPEC')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'FORMAL_SPEC'
                  ? 'border-gold-400 text-gold-400 bg-graphite-900 rounded-t-lg font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4 text-amethyst-400" />
              <span>5-Tuple</span>
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

      {/* VS Code Style Vertical Sliding Bar (Resize Bottom Timeline/Terminal) */}
      <div
        onMouseDown={handleMouseDownBottom}
        className="h-1.5 hover:h-2 bg-graphite-border hover:bg-gold-500 active:bg-gold-500 cursor-row-resize transition-all duration-150 relative z-30 group flex items-center justify-center shrink-0"
        title="Drag up to expand terminal/timeline panel (like in VS Code)"
      >
        <div className="w-10 h-1 rounded-full bg-slate-600 group-hover:bg-graphite-950 transition-colors" />
      </div>

      {/* Bottom Timeline Playback Scrubber Bar (Resizable) */}
      <div style={{ height: `${bottomHeight}px` }} className="shrink-0 overflow-hidden">
        <TraceScrubber
          validationResult={validationResult}
          currentStepIndex={currentStepIndex}
          onStepChange={setCurrentStepIndex}
          rawTrace={rawTrace}
        />
      </div>

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
