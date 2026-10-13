import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Bookmark,
  ArrowRight,
  TrendingDown,
  Layers,
  Award
} from 'lucide-react';
import { Question, UserStudyData, QuizAttemptRecord } from '../types';
import { ALL_QUESTIONS } from '../data/questions';
import { MODULES } from '../data/modules';
import { soundManager } from '../utils/audio';

interface SmartReviewProps {
  studyData: UserStudyData;
  onRecordAnswer: (questionId: string, isCorrect: boolean) => void;
  onRecordQuizAttempt: (attempt: QuizAttemptRecord) => void;
  onToggleBookmark: (questionId: string) => void;
  onBackToDashboard: () => void;
  onNavigateToFlashcards: () => void;
}

export const SmartReview: React.FC<SmartReviewProps> = ({
  studyData,
  onRecordAnswer,
  onRecordQuizAttempt,
  onToggleBookmark,
  onBackToDashboard,
  onNavigateToFlashcards,
}) => {
  // Spaced repetition & priority queue sorting
  const reviewQueue = useMemo(() => {
    const scoredQuestions = ALL_QUESTIONS.map((q) => {
      const stat = studyData.questionStats[q.id];
      let priorityScore = 0;

      if (!stat || stat.attempts === 0) {
        // Unseen questions have baseline priority
        priorityScore = 10;
      } else {
        // Last attempt failed: HIGH PRIORITY
        if (!stat.lastResult) priorityScore += 100;

        // Failure rate
        const failureRate = (stat.attempts - stat.correct) / stat.attempts;
        priorityScore += failureRate * 50;

        // Due for spaced repetition review
        if (stat.nextReviewDate && stat.nextReviewDate <= Date.now()) {
          priorityScore += 40;
        }

        // Low attempt count
        if (stat.attempts < 2) priorityScore += 15;
      }

      // Bookmarked by user
      if (studyData.bookmarkedQuestionIds.includes(q.id)) {
        priorityScore += 25;
      }

      return {
        question: q,
        score: priorityScore,
        attempts: stat?.attempts || 0,
        lastResult: stat ? stat.lastResult : null,
      };
    });

    // Sort descending by priority score and pick top 20
    const sorted = scoredQuestions
      .sort((a, b) => b.score - a.score)
      .map((item) => item.question);

    return sorted.slice(0, 20);
  }, [studyData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const currentQuestion: Question | undefined = reviewQueue[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedOption === null || isSubmitted) return;

    const isCorrect =
      selectedOption.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setIsSubmitted(true);
    if (isCorrect) {
      setSessionCorrectCount((prev) => prev + 1);
      soundManager.playCorrectChime(studyData.soundEnabled);
    } else {
      soundManager.playIncorrectChime(studyData.soundEnabled);
    }

    onRecordAnswer(currentQuestion.id, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex + 1 < reviewQueue.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setSessionCompleted(true);
      const record: QuizAttemptRecord = {
        id: `smart-review-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'smart-review',
        score: sessionCorrectCount + (selectedOption === currentQuestion?.correctAnswer ? 1 : 0),
        totalQuestions: reviewQueue.length,
        percentage: Math.round(((sessionCorrectCount + (selectedOption === currentQuestion?.correctAnswer ? 1 : 0)) / reviewQueue.length) * 100),
        timeSpentSeconds: 0,
        correctQuestionIds: [],
        incorrectQuestionIds: [],
      };
      onRecordQuizAttempt(record);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setSessionCorrectCount(0);
    setSessionCompleted(false);
  };

  if (reviewQueue.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Queue is Clear!</h3>
        <p className="text-xs text-stone-500">
          You have no pending high-priority review items right now.
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (sessionCompleted) {
    const total = reviewQueue.length;
    const finalScore = sessionCorrectCount;
    const pct = Math.round((finalScore / total) * 100);

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">
              Smart Review Complete!
            </h2>
            <p className="text-xs text-stone-500">
              Spaced repetition intervals updated for {total} prioritized items
            </p>
          </div>

          <div className="py-4 border-y border-stone-100 flex items-center justify-center gap-8">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {finalScore} <span className="text-base text-stone-400">/ {total}</span>
              </div>
              <div className="text-xs text-stone-500 font-semibold mt-0.5">Score</div>
            </div>
            <div className="h-8 w-px bg-stone-200" />
            <div>
              <div className="text-3xl font-extrabold text-emerald-700 tabular-nums">
                {pct}%
              </div>
              <div className="text-xs text-stone-500 font-semibold mt-0.5">Retention</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Review Another Round
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentModuleInfo = MODULES.find((m) => m.id === currentQuestion?.moduleId);
  const isBookmarked = currentQuestion
    ? studyData.bookmarkedQuestionIds.includes(currentQuestion.id)
    : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header Explainer Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Personalized Spaced Repetition Session</span>
          </div>
          <p className="text-[11px] text-amber-900/80">
            Dynamically prioritizes recently missed questions, flagged items, and decay intervals.
          </p>
        </div>

        <button
          onClick={onNavigateToFlashcards}
          className="text-xs font-bold text-amber-900 bg-white/80 hover:bg-white border border-amber-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          Review Flashcards
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-1.5">
        <div className="flex justify-between text-xs text-stone-500 font-medium">
          <span>
            Target Question <strong className="text-slate-900 tabular-nums">{currentIndex + 1}</strong> of{' '}
            <strong className="text-slate-900 tabular-nums">{reviewQueue.length}</strong>
          </span>
          <span className="tabular-nums">
            Session Score: <strong className="text-emerald-700">{sessionCorrectCount}</strong>
          </span>
        </div>
        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 transition-all duration-200"
            style={{
              width: `${Math.round(((currentIndex + 1) / reviewQueue.length) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-800">
                {currentModuleInfo?.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-600">{currentQuestion.topic}</span>
            </div>

            <button
              onClick={() => onToggleBookmark(currentQuestion.id)}
              className={`p-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer ${
                isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-stone-400'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {currentQuestion.japaneseContext && (
              <div className="p-3 bg-stone-50 rounded-lg text-center font-jp text-lg font-bold text-slate-900 border border-stone-200/60">
                {currentQuestion.japaneseContext}
              </div>
            )}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.prompt}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrectOption =
                opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

              let containerStyle =
                'border-stone-200 bg-white hover:bg-stone-50/80 text-slate-800';

              if (isSelected && !isSubmitted) {
                containerStyle =
                  'border-amber-600 bg-amber-50/70 text-amber-950 font-semibold ring-1 ring-amber-500';
              }

              if (isSubmitted) {
                if (isCorrectOption) {
                  containerStyle =
                    'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrectOption) {
                  containerStyle =
                    'border-rose-600 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
                } else {
                  containerStyle = 'border-stone-200 bg-stone-50/40 text-stone-400 opacity-60';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-3.5 sm:p-4 text-left rounded-xl border transition-all flex items-start gap-3 cursor-pointer text-sm sm:text-base ${containerStyle}`}
                >
                  <span className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                  {isSubmitted && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isSubmitted && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isSubmitted && (
            <div
              className={`p-4 sm:p-5 rounded-xl border text-xs sm:text-sm space-y-2.5 ${
                selectedOption?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {selectedOption?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>正解 (Correct!)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>不正解 (Incorrect) — Correct Answer: {currentQuestion.correctAnswer}</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed text-stone-700">{currentQuestion.explanation}</p>
              <div className="pt-2 border-t border-black/10 text-[11px] text-stone-500 font-medium">
                Lesson Source: <strong>{currentQuestion.sourcePdf}</strong> ({currentQuestion.sourceRef})
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end">
            {!isSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                  selectedOption !== null
                    ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{currentIndex + 1 < reviewQueue.length ? 'Next Review' : 'Finish Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
