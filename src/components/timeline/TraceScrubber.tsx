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
    <div className="w-full h-full bg-void-900 border-t border-void-border px-4 py-3 flex flex-col justify-between select-none shadow-2xl">
      {/* Playback Controls & Status Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-void-850 transition-colors"
            title="Reset to Initial State (q₀)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBack}
            disabled={currentStepIndex <= 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-void-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={totalSteps === 0}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-neon-blue transition-all disabled:opacity-30"
            title={isPlaying ? 'Pause' : 'Play Trace'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= totalSteps}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-void-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleJumpToEnd}
            disabled={currentStepIndex >= totalSteps}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-void-850 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Jump to End"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {validationResult?.failureStep && (
            <button
              onClick={handleJumpToFailure}
              className="p-1.5 rounded-lg bg-rose-500/15 text-neon-rose border border-neon-rose/40 hover:bg-rose-500/25 transition-all ml-1"
              title="Jump to Error Step"
            >
              <AlertOctagon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Current Active Step Telemetry */}
        <div className="flex items-center gap-3">
          {currentStepData ? (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Step #{currentStepData.stepIndex}:</span>
              <span className="px-2 py-0.5 rounded bg-void-850 text-slate-200 font-bold border border-void-border">
                {currentStepData.fromState}
              </span>
              <span className="text-neon-blue font-bold">--({currentStepData.event})--&gt;</span>
              <span
                className={`px-2 py-0.5 rounded font-bold border ${
                  currentStepData.status === 'VALID'
                    ? 'bg-blue-950/80 text-neon-blue border-neon-blue/40'
                    : 'bg-rose-950/80 text-neon-rose border-neon-rose/40'
                }`}
              >
                {currentStepData.toState || 'TRAP ⊥'}
              </span>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-400">
              State: <span className="text-neon-emerald font-bold">q₀ (Initial)</span>
            </div>
          )}

          <div className="w-[1px] h-4 bg-void-border" />

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-void-850 border border-void-border rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-neon-blue font-mono"
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
          Step <span className="font-bold text-neon-blue text-sm">{currentStepIndex}</span> / {totalSteps}
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="my-1.5">
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
          className="w-full h-1.5 bg-void-800 rounded-lg appearance-none cursor-pointer accent-neon-blue focus:outline-none"
        />
      </div>

      {/* Step Event Tokens Trail */}
      {validationResult && validationResult.history.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          <button
            onClick={() => {
              setIsPlaying(false);
              onStepChange(0);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
              currentStepIndex === 0
                ? 'bg-emerald-500/20 text-neon-emerald border-neon-emerald font-bold ring-1 ring-neon-emerald/50'
                : 'bg-void-850 text-slate-400 border-void-border hover:text-slate-200'
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                  isStepFailed
                    ? isCurrent
                      ? 'bg-neon-rose/30 text-neon-rose border-neon-rose ring-2 ring-neon-rose/50 font-bold'
                      : 'bg-rose-950/40 text-neon-rose border-neon-rose/40 hover:bg-rose-900/40'
                    : isCurrent
                    ? 'bg-blue-600/30 text-neon-blue border-neon-blue ring-2 ring-neon-blue/50 font-bold'
                    : 'bg-void-850 text-slate-300 border-void-border hover:bg-void-800 hover:text-white'
                }`}
              >
                <span>#{stepNum}</span>
                <span>{step.event}</span>
                {isStepFailed ? (
                  <AlertOctagon className="w-3 h-3 text-neon-rose" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-neon-emerald" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
