import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import { HiraganaCharacter } from '../../types';

interface StrokeOrderAnimatorProps {
  character: HiraganaCharacter;
  autoPlay?: boolean;
}

export const StrokeOrderAnimator: React.FC<StrokeOrderAnimatorProps> = ({
  character,
  autoPlay = true,
}) => {
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalStrokes = character.strokes.length;

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.round(1400 / speedMultiplier);

    timerRef.current = setInterval(() => {
      setCurrentStrokeIndex((prev) => {
        if (prev + 1 >= totalStrokes) {
          // Loop after pause
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalStrokes, speedMultiplier]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStrokeIndex(0);
    setIsPlaying(true);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentStrokeIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentStrokeIndex((prev) => (prev + 1 < totalStrokes ? prev + 1 : prev));
  };

  const cycleSpeed = () => {
    if (speedMultiplier === 1) setSpeedMultiplier(0.6);
    else if (speedMultiplier === 0.6) setSpeedMultiplier(1.4);
    else setSpeedMultiplier(1);
  };

  const activeStroke = character.strokes[currentStrokeIndex];

  return (
    <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-5 flex flex-col items-center space-y-4">
      {/* SVG Animation Stage */}
      <div className="relative w-48 h-48 sm:w-60 sm:h-60 bg-white border border-stone-200 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
        {/* Japanese Practice Grid Guidelines */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none stroke-stone-200"
          strokeWidth="0.7"
          strokeDasharray="2,2"
        >
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <rect x="5" y="5" width="90" height="90" fill="none" strokeWidth="0.5" strokeDasharray="1,2" stroke="#e7e5e4" />
        </svg>

        {/* Character Strokes */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-3">
          {/* Faint complete ghost guide in background */}
          {character.strokes.map((stroke, idx) => (
            <path
              key={`ghost-${idx}`}
              d={stroke.path}
              fill="none"
              stroke="#f5f5f4"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Past completed strokes rendered in dark charcoal */}
          {character.strokes.slice(0, currentStrokeIndex).map((stroke, idx) => (
            <path
              key={`done-${idx}`}
              d={stroke.path}
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current active stroke highlighted in crimson/rose with glow */}
          {activeStroke && (
            <g className="animate-in fade-in duration-200">
              <path
                d={activeStroke.path}
                fill="none"
                stroke="#be123c"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Start point marker */}
              <circle
                cx={activeStroke.startPoint.x}
                cy={activeStroke.startPoint.y}
                r="3.5"
                fill="#be123c"
                className="animate-pulse"
              />
              {/* Stroke number badge */}
              <g transform={`translate(${activeStroke.startPoint.x - 7}, ${activeStroke.startPoint.y - 7})`}>
                <circle cx="7" cy="7" r="6" fill="#be123c" />
                <text
                  x="7"
                  y="10.5"
                  fill="white"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {currentStrokeIndex + 1}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Top-right stroke counter badge */}
        <div className="absolute top-2.5 right-2.5 bg-stone-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums backdrop-blur-xs">
          Stroke {currentStrokeIndex + 1} / {totalStrokes}
        </div>
      </div>

      {/* Stroke instruction callout */}
      <div className="text-center space-y-1 max-w-sm">
        <div className="text-xs font-bold text-rose-800">
          Stroke {currentStrokeIndex + 1}: {activeStroke?.directionTip}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleStepPrev}
          disabled={currentStrokeIndex === 0}
          className="p-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 transition-colors cursor-pointer"
          title="Previous stroke"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleTogglePlay}
          className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={handleStepNext}
          disabled={currentStrokeIndex + 1 >= totalStrokes}
          className="p-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 transition-colors cursor-pointer"
          title="Next stroke"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-slate-700 transition-colors cursor-pointer"
          title="Show from beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={cycleSpeed}
          className="px-2.5 py-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-slate-700 text-xs font-semibold tabular-nums transition-colors cursor-pointer flex items-center gap-1"
          title="Adjust animation speed"
        >
          <Gauge className="w-3.5 h-3.5 text-stone-400" />
          <span>{speedMultiplier}x</span>
        </button>
      </div>
    </div>
  );
};
