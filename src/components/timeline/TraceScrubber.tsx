import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  AlertOctagon,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { TraceStep, ValidationResult } from '../../core/types';

interface TraceScrubberProps {
  validationResult: ValidationResult | null;
  currentStepIndex: number; // 0 = initial state before any events, 1..N = after step i
  onStepChange: (index: number) => void;
  rawTrace: string[];
}

export const TraceScrubber: React.FC<TraceScrubberProps> = ({
  validationResult,
  currentStepIndex,
  onStepChange,
  rawTrace,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  const totalSteps = validationResult ? validationResult.history.length : rawTrace.length;

  // Auto-play effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      if (currentStepIndex >= totalSteps) {
        setIsPlaying(false);
      } else {
        timer = setTimeout(() => {
          onStepChange(currentStepIndex + 1);
        }, playbackSpeed);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed, onStepChange]);

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) onStepChange(currentStepIndex - 1);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps) onStepChange(currentStepIndex + 1);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    onStepChange(totalSteps);
  };

  const handleJumpToFailure = () => {
    if (validationResult?.failureStep) {
      setIsPlaying(false);
      onStepChange(validationResult.failureStep.stepIndex);
    }
  };

  const currentStepData =
    validationResult && currentStepIndex > 0
      ? validationResult.history[currentStepIndex - 1]
      : null;

  return (
    <div className="w-full bg-[#0e1524] border-t border-slate-800 p-3 flex flex-col gap-2.5 shadow-2xl">
      {/* Top Playback Control Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset to Initial State (q0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBack}
            disabled={currentStepIndex <= 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={totalSteps === 0}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] disabled:opacity-30"
            title={isPlaying ? 'Pause Simulation' : 'Play Trace Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= totalSteps}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleJumpToEnd}
            disabled={currentStepIndex >= totalSteps}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Jump to End"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {validationResult?.failureStep && (
            <button
              onClick={handleJumpToFailure}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all ml-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              title="Jump directly to violation step"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Jump to Error</span>
            </button>
          )}
        </div>

        {/* Current Active Step Telemetry */}
        <div className="flex items-center gap-3">
          {currentStepData ? (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Transition:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                {currentStepData.fromState}
              </span>
              <span className="text-cyan-400 font-bold">--({currentStepData.event})--&gt;</span>
              <span
                className={`px-1.5 py-0.5 rounded font-semibold ${
                  currentStepData.status === 'VALID'
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                }`}
              >
                {currentStepData.toState || 'TRAP ⊥'}
              </span>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-400">
              State: <span className="text-emerald-400 font-semibold">Initial (q₀)</span>
            </div>
          )}

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-[#141d30] border border-slate-700/80 rounded px-1.5 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1.0x</option>
              <option value={500}>2.0x</option>
              <option value={250}>4.0x</option>
            </select>
          </div>
        </div>

        {/* Step Index Badge */}
        <div className="text-xs font-mono text-slate-400">
          Step <span className="font-bold text-cyan-300">{currentStepIndex}</span> / {totalSteps}
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={totalSteps}
          value={currentStepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            onStepChange(Number(e.target.value));
          }}
          disabled={totalSteps === 0}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>

      {/* Step Event Tokens Trail */}
      {validationResult && validationResult.history.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(0);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all border ${
              currentStepIndex === 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold ring-1 ring-emerald-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            q₀
          </button>

          {validationResult.history.map((step, idx) => {
            const stepNum = idx + 1;
            const isCurrent = currentStepIndex === stepNum;
            const isStepFailed = step.status !== 'VALID';

            return (
              <button
                key={`step-btn-${idx}`}
                onClick={() => {
                  setIsPlaying(false);
                  onStepChange(stepNum);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all border ${
                  isStepFailed
                    ? isCurrent
                      ? 'bg-rose-500/30 text-rose-200 border-rose-500 ring-2 ring-rose-500/40 font-bold'
                      : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/50'
                    : isCurrent
                    ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 ring-2 ring-cyan-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <span>#{stepNum}</span>
                <span>{step.event}</span>
                {isStepFailed ? (
                  <AlertOctagon className="w-2.5 h-2.5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
