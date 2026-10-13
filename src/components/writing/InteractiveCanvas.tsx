import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Undo2, Eye, EyeOff } from 'lucide-react';
import { HiraganaCharacter } from '../../types';

export interface DrawnStroke {
  points: { x: number; y: number }[];
}

export interface WritingEvaluation {
  strokeCountMatches: boolean;
  userStrokeCount: number;
  expectedStrokeCount: number;
  coverageScore: number; // 0-100
  accuracyGrade: 'great' | 'good' | 'needs-practice';
  feedbackText: string;
}

interface InteractiveCanvasProps {
  character: HiraganaCharacter;
  mode: 'tracing' | 'independent';
  onEvaluate?: (evaluation: WritingEvaluation) => void;
  showGhostByDefault?: boolean;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  character,
  mode,
  onEvaluate,
  showGhostByDefault = mode === 'tracing',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGhost, setShowGhost] = useState(showGhostByDefault);
  const currentStrokePoints = useRef<{ x: number; y: number }[]>([]);

  // Redraw canvas whenever strokes, ghost guide, or mode changes
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw Japanese Genkouyoushi practice grid
    ctx.save();
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Center vertical cross line
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Center horizontal cross line
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Outer margin box
    ctx.strokeRect(12, 12, width - 24, height - 24);
    ctx.restore();

    // Draw reference ghost outline if enabled
    if (showGhost) {
      ctx.save();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)'; // soft faint slate
      ctx.lineWidth = Math.max(16, width * 0.08);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      character.strokes.forEach((stroke) => {
        try {
          const path2d = new Path2D(stroke.path);
          ctx.save();
          // Scale from 100x100 space to canvas width/height
          ctx.scale(width / 100, height / 100);
          ctx.stroke(path2d);
          ctx.restore();
        } catch {
          // Fallback if Path2D parsing is not supported
        }
      });
      ctx.restore();
    }

    // Draw user handwritten strokes in dark calligraphy sumi ink style
    ctx.save();
    ctx.strokeStyle = '#0f172a'; // Deep sumi ink slate
    ctx.lineWidth = Math.max(10, width * 0.05);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        // Smooth line curves
        const xc = (stroke.points[i - 1].x + stroke.points[i].x) / 2;
        const yc = (stroke.points[i - 1].y + stroke.points[i].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
      }
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });

    ctx.restore();
  }, [character, showGhost, strokes]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer event handlers with pointer capture and normalized coordinates
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    currentStrokePoints.current = [coords];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    currentStrokePoints.current.push(coords);

    // Live continuous drawing render
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts = currentStrokePoints.current;
    if (pts.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(10, canvas.width * 0.05);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    if (currentStrokePoints.current.length > 0) {
      setStrokes((prev) => [...prev, { points: [...currentStrokePoints.current] }]);
    }
    currentStrokePoints.current = [];
  };

  const handlePointerCancel = () => {
    setIsDrawing(false);
    currentStrokePoints.current = [];
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  // Perform transparent heuristic evaluation
  const runEvaluation = () => {
    const userStrokeCount = strokes.length;
    const expectedStrokeCount = character.strokeCount;
    const strokeCountMatches = userStrokeCount === expectedStrokeCount;

    // Calculate bounding box of user's writing
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let totalPoints = 0;

    strokes.forEach((s) => {
      s.points.forEach((p) => {
        totalPoints++;
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });

    if (totalPoints < 10) {
      if (onEvaluate) {
        onEvaluate({
          strokeCountMatches: false,
          userStrokeCount: 0,
          expectedStrokeCount,
          coverageScore: 0,
          accuracyGrade: 'needs-practice',
          feedbackText: 'The canvas is empty or strokes are too short. Please try writing the full character.',
        });
      }
      return;
    }

    const canvasWidth = canvasRef.current?.width || 300;
    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;
    const isBalancedSize = boxWidth > canvasWidth * 0.25 && boxHeight > canvasWidth * 0.25;

    let grade: 'great' | 'good' | 'needs-practice' = 'good';
    let feedback = '';

    if (strokeCountMatches && isBalancedSize) {
      grade = 'great';
      feedback = `Great job! Stroke count (${userStrokeCount}/${expectedStrokeCount}) is accurate and proportions are well-balanced.`;
    } else if (!strokeCountMatches && isBalancedSize) {
      grade = 'good';
      feedback = `Good shape! However, you drew ${userStrokeCount} stroke(s), while ${character.character} is written with ${expectedStrokeCount} stroke(s). Check the stroke order.`;
    } else {
      grade = 'needs-practice';
      feedback = `Keep practicing! Try making the character larger, centered inside the quadrant grid, with all ${expectedStrokeCount} strokes.`;
    }

    if (onEvaluate) {
      onEvaluate({
        strokeCountMatches,
        userStrokeCount,
        expectedStrokeCount,
        coverageScore: Math.min(100, Math.round((boxWidth * boxHeight) / (canvasWidth * canvasWidth * 0.4) * 100)),
        accuracyGrade: grade,
        feedbackText: feedback,
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none">
      {/* Canvas Frame with Native Touch Action Disabled */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-white border-2 border-stone-300 rounded-2xl shadow-sm overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="w-full h-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* Small badge showing current stroke count */}
        <div className="absolute bottom-2.5 left-2.5 bg-stone-900/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md tabular-nums backdrop-blur-xs">
          Strokes drawn: <strong>{strokes.length}</strong> / {character.strokeCount}
        </div>
      </div>

      {/* Canvas Tool Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Undo last stroke"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        <button
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Clear canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          onClick={() => setShowGhost(!showGhost)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            showGhost
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
          }`}
          title="Toggle reference ghost outline"
        >
          {showGhost ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showGhost ? 'Hide Guide' : 'Show Guide'}</span>
        </button>

        <button
          onClick={runEvaluation}
          disabled={strokes.length === 0}
          className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          Check Writing
        </button>
      </div>
    </div>
  );
};
