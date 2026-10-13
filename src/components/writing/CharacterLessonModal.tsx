import React, { useState } from 'react';
import {
  X,
  Volume2,
  BookOpen,
  Eye,
  Edit3,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { HiraganaCharacter, CharacterWritingStat } from '../../types';
import { StrokeOrderAnimator } from './StrokeOrderAnimator';
import { InteractiveCanvas, WritingEvaluation } from './InteractiveCanvas';
import { soundManager } from '../../utils/audio';

type LessonStage = 'intro' | 'watch' | 'trace' | 'write' | 'evaluate';

interface CharacterLessonModalProps {
  character: HiraganaCharacter;
  currentStat?: CharacterWritingStat;
  soundEnabled: boolean;
  onClose: () => void;
  onRecordAttempt: (isSuccess: boolean, isTracing: boolean, usedHint: boolean) => void;
}

export const CharacterLessonModal: React.FC<CharacterLessonModalProps> = ({
  character,
  currentStat,
  soundEnabled,
  onClose,
  onRecordAttempt,
}) => {
  const [stage, setStage] = useState<LessonStage>('intro');
  const [lastEvaluation, setLastEvaluation] = useState<WritingEvaluation | null>(null);
  const [usedHint, setUsedHint] = useState(false);

  const handleSpeak = () => {
    soundManager.speakJapanese(character.character);
  };

  const handleCanvasEvaluation = (evaluation: WritingEvaluation) => {
    setLastEvaluation(evaluation);
    setStage('evaluate');

    const isSuccess = evaluation.accuracyGrade === 'great' || evaluation.accuracyGrade === 'good';
    if (isSuccess) {
      soundManager.playCorrectChime(soundEnabled);
    } else {
      soundManager.playIncorrectChime(soundEnabled);
    }
  };

  const handleSelfAssess = (verdict: 'great' | 'close' | 'practice') => {
    const isSuccess = verdict === 'great' || verdict === 'close';
    onRecordAttempt(isSuccess, false, usedHint);
    onClose();
  };

  const handleCompleteTracing = () => {
    onRecordAttempt(true, true, false);
    setStage('write');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-rose-800">
              {character.subGroup}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500 font-medium">
              {character.isCoursePrimary ? 'Lecture Primary' : 'Foundational'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-slate-800 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lesson Stage Stepper */}
        <div className="bg-stone-100/60 border-b border-stone-200 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto">
          {[
            { id: 'intro', label: '1. Intro' },
            { id: 'watch', label: '2. Watch' },
            { id: 'trace', label: '3. Trace' },
            { id: 'write', label: '4. Write' },
            { id: 'evaluate', label: '5. Feedback' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStage(st.id as LessonStage)}
              className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                stage === st.id
                  ? 'bg-rose-700 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Main Stage Content */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Stage 1: Intro */}
          {stage === 'intro' && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-32 h-32 mx-auto bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-center font-jp text-7xl font-extrabold text-slate-900 shadow-inner">
                  {character.character}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl font-bold text-slate-800">
                    "{character.romaji}"
                  </span>
                  <button
                    onClick={handleSpeak}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-rose-700 transition-colors cursor-pointer"
                    title="Pronounce audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-xs text-stone-500">
                  {character.soundGuide}
                </div>
              </div>

              {/* Stroke Count & Tip Card */}
              <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Stroke Count: {character.strokeCount} stroke(s)</span>
                  <span className="text-stone-400 capitalize">
                    Status: {currentStat?.status || 'Not started'}
                  </span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  <strong>Writing Advice:</strong> {character.writingTip}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setStage('watch')}
                  className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Step 2: Watch Animation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Watch Animation */}
          {stage === 'watch' && (
            <div className="space-y-5 flex flex-col items-center">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Stroke-by-Stroke Animation: {character.character} ({character.romaji})
                </h3>
                <p className="text-xs text-stone-500">
                  Observe the stroke sequence, numbers, and writing direction carefully.
                </p>
              </div>

              <StrokeOrderAnimator character={character} autoPlay={true} />

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setStage('trace')}
                  className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Step 3: Start Guided Tracing</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stage 3: Guided Tracing */}
          {stage === 'trace' && (
            <div className="space-y-4 flex flex-col items-center text-center">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Guided Tracing Mode
                </h3>
                <p className="text-xs text-stone-500">
                  Trace directly over the ghost guide with finger, mouse, or stylus.
                </p>
              </div>

              <InteractiveCanvas
                character={character}
                mode="tracing"
                showGhostByDefault={true}
                onEvaluate={(ev) => {
                  setLastEvaluation(ev);
                  if (ev.accuracyGrade === 'great' || ev.accuracyGrade === 'good') {
                    handleCompleteTracing();
                  }
                }}
              />

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onRecordAttempt(true, true, false);
                    setStage('write');
                  }}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Ready for Independent Writing →
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Independent Writing */}
          {stage === 'write' && (
            <div className="space-y-4 flex flex-col items-center text-center">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Write from Memory: {character.character} ({character.romaji})
                </h3>
                <p className="text-xs text-stone-500">
                  Write on the blank grid from memory. Click "Check Writing" when finished.
                </p>
              </div>

              <InteractiveCanvas
                character={character}
                mode="independent"
                showGhostByDefault={false}
                onEvaluate={handleCanvasEvaluation}
              />
            </div>
          )}

          {/* Stage 5: Evaluation & Feedback */}
          {stage === 'evaluate' && lastEvaluation && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Writing Feedback & Evaluation
                </h3>
                <p className="text-xs text-stone-500">
                  Comparing your strokes against the standard reference for {character.character}
                </p>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center space-y-1">
                  <span className="text-[11px] font-semibold text-stone-500">Standard Target</span>
                  <div className="font-jp text-5xl font-extrabold text-slate-900 py-3">
                    {character.character}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {character.strokeCount} strokes
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center space-y-1">
                  <span className="text-[11px] font-semibold text-stone-500">Your Attempt</span>
                  <div
                    className={`font-jp text-5xl font-extrabold py-3 ${
                      lastEvaluation.accuracyGrade === 'great'
                        ? 'text-emerald-700'
                        : lastEvaluation.accuracyGrade === 'good'
                        ? 'text-blue-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {character.character}
                  </div>
                  <div className="text-[11px] text-stone-400 tabular-nums">
                    {lastEvaluation.userStrokeCount} strokes drawn
                  </div>
                </div>
              </div>

              {/* Diagnostic Feedback Alert */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  lastEvaluation.accuracyGrade === 'great'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : lastEvaluation.accuracyGrade === 'good'
                    ? 'bg-blue-50 border-blue-200 text-blue-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {lastEvaluation.accuracyGrade === 'great' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Excellent stroke execution!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Review advice:</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed">{lastEvaluation.feedbackText}</p>
                <div className="text-[11px] opacity-75 pt-1 border-t border-black/5">
                  Mastery requirement: 2 consecutive successful independent writings without hints.
                </div>
              </div>

              {/* Transparent Self-Assessment */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-800 block text-center">
                  How does your character look compared to the model?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSelfAssess('great')}
                    className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Looks Great!
                  </button>
                  <button
                    onClick={() => handleSelfAssess('close')}
                    className="p-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close Enough
                  </button>
                  <button
                    onClick={() => handleSelfAssess('practice')}
                    className="p-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Need Practice
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setStage('write')}
                  className="text-xs font-bold text-stone-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Writing Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
