import React, { useState } from 'react';
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
import { normalizeAnswer, QuestionValidationResult } from './PracticeQuiz';
import { TanuMascot } from './mascot/TanuMascot';

interface SmartReviewProps {
  studyData: UserStudyData;
  onRecordAnswer: (questionId: string, isCorrect: boolean) => void;
  onRecordQuizAttempt: (attempt: QuizAttemptRecord) => void;
  onToggleBookmark: (questionId: string) => void;
  onBackToDashboard: () => void;
  onNavigateToFlashcards: () => void;
}

/**
 * Builds a prioritized snapshot of up to 20 review questions.
 * Preserved statically during the review session so questions do not reshuffle.
 */
function buildReviewQueue(currentStudyData: UserStudyData): Question[] {
  const scoredQuestions = ALL_QUESTIONS.map((q) => {
    const stat = currentStudyData.questionStats[q.id];
    let priorityScore = 0;

    if (!stat || stat.attempts === 0) {
      priorityScore = 10;
    } else {
      if (!stat.lastResult) priorityScore += 100;
      const failureRate = (stat.attempts - stat.correct) / stat.attempts;
      priorityScore += failureRate * 50;
      if (stat.nextReviewDate && stat.nextReviewDate <= Date.now()) {
        priorityScore += 40;
      }
      if (stat.attempts < 2) priorityScore += 15;
    }

    if (currentStudyData.bookmarkedQuestionIds.includes(q.id)) {
      priorityScore += 25;
    }

    return {
      question: q,
      score: priorityScore,
    };
  });

  const sorted = scoredQuestions
    .sort((a, b) => b.score - a.score)
    .map((item) => item.question);

  return sorted.slice(0, 20);
}

export const SmartReview: React.FC<SmartReviewProps> = ({
  studyData,
  onRecordAnswer,
  onRecordQuizAttempt,
  onToggleBookmark,
  onBackToDashboard,
  onNavigateToFlashcards,
}) => {
  // Stable session review queue
  const [reviewQueue, setReviewQueue] = useState<Question[]>(() =>
    buildReviewQueue(studyData)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<QuestionValidationResult | null>(null);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [attemptedHistory, setAttemptedHistory] = useState<
    { id: string; correct: boolean; selectedOption: string }[]
  >([]);

  const currentQuestion: Question | undefined = reviewQueue[currentIndex];
  const isSubmitted = validationResult !== null;

  const handleSelectOption = (opt: string) => {
    if (validationResult !== null) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedOption === null || validationResult !== null) return;

    const authoritativeCorrect = currentQuestion.correctAnswer;
    const isCorrect = normalizeAnswer(selectedOption) === normalizeAnswer(authoritativeCorrect);

    const result: QuestionValidationResult = {
      questionId: currentQuestion.id,
      selectedOption,
      correctAnswer: authoritativeCorrect,
      isCorrect,
      explanation: currentQuestion.explanation,
    };

    setValidationResult(result);

    if (isCorrect) {
      setSessionCorrectCount((prev) => prev + 1);
      soundManager.playCorrectChime(studyData.soundEnabled);
    } else {
      soundManager.playIncorrectChime(studyData.soundEnabled);
    }

    onRecordAnswer(currentQuestion.id, isCorrect);
    setAttemptedHistory((prev) => [
      ...prev,
      { id: currentQuestion.id, correct: isCorrect, selectedOption }
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < reviewQueue.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setValidationResult(null);
    } else {
      setSessionCompleted(true);
      const total = reviewQueue.length;
      const finalScore = sessionCorrectCount;
      const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;

      const record: QuizAttemptRecord = {
        id: `smart-review-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'smart-review',
        score: finalScore,
        totalQuestions: total,
        percentage,
        timeSpentSeconds: 0,
        correctQuestionIds: attemptedHistory.filter((a) => a.correct).map((a) => a.id),
        incorrectQuestionIds: attemptedHistory.filter((a) => !a.correct).map((a) => a.id),
      };
      onRecordQuizAttempt(record);
    }
  };

  const handleRestart = () => {
    const newQueue = buildReviewQueue(studyData);
    setReviewQueue(newQueue);
    setCurrentIndex(0);
    setSelectedOption(null);
    setValidationResult(null);
    setSessionCorrectCount(0);
    setSessionCompleted(false);
    setAttemptedHistory([]);
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
    const pct = total > 0 ? Math.round((finalScore / total) * 100) : 0;

    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="flex justify-center mb-2">
            <TanuMascot
              pose={pct >= 80 ? 'celebration' : pct >= 60 ? 'happy' : 'encouraging'}
              size="lg"
              alt="Tanu completing review session"
            />
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
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header Info */}
      <div className="bg-amber-500/10 border border-amber-300/40 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Priority Spaced Repetition Mode</span>
        </div>
        <div className="text-xs font-medium text-stone-500 tabular-nums">
          Review {currentIndex + 1} of {reviewQueue.length}
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-800">
                {currentModuleInfo?.title || currentQuestion.moduleId}
              </span>
              <span>·</span>
              <span>{currentQuestion.topic}</span>
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
            {currentQuestion.instruction && (
              <p className="text-xs text-stone-500 italic">
                {currentQuestion.instruction}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === opt;

              let containerStyle =
                'border-stone-200 bg-white hover:bg-stone-50/80 text-slate-800';

              if (isSelected && !isSubmitted) {
                containerStyle =
                  'border-amber-600 bg-amber-50/70 text-amber-950 font-semibold ring-2 ring-amber-500 shadow-xs';
              }

              if (isSubmitted && validationResult) {
                const isThisTheCorrectAnswer =
                  normalizeAnswer(opt) === normalizeAnswer(validationResult.correctAnswer);
                const isThisUserSelectedWrong =
                  isSelected && !validationResult.isCorrect;

                if (isThisTheCorrectAnswer) {
                  containerStyle =
                    'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-xs';
                } else if (isThisUserSelectedWrong) {
                  containerStyle =
                    'border-rose-600 bg-rose-50 text-rose-950 font-semibold ring-2 ring-rose-500 shadow-xs';
                } else {
                  containerStyle = 'border-stone-200 bg-stone-50/40 text-stone-400 opacity-60';
                }
              }

              const isThisCorrect =
                isSubmitted &&
                validationResult !== null &&
                normalizeAnswer(opt) === normalizeAnswer(validationResult.correctAnswer);
              const isThisWrongSelection =
                isSubmitted &&
                validationResult !== null &&
                isSelected &&
                !validationResult.isCorrect;

              return (
                <button
                  key={`${currentQuestion.id}-opt-${i}`}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-3.5 sm:p-4 text-left rounded-xl border transition-all flex items-start gap-3 text-sm sm:text-base ${
                    isSubmitted ? 'cursor-default' : 'cursor-pointer'
                  } ${containerStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isThisCorrect
                        ? 'bg-emerald-600 text-white'
                        : isThisWrongSelection
                        ? 'bg-rose-600 text-white'
                        : isSelected && !isSubmitted
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-100 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>

                  {isThisCorrect && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="hidden sm:inline">Correct Answer</span>
                    </span>
                  )}
                  {isThisWrongSelection && (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-700 shrink-0 mt-0.5">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span className="hidden sm:inline">Your Answer</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation governed by single validationResult */}
          {validationResult && (
            <div
              className={`p-4 sm:p-5 rounded-xl border text-xs sm:text-sm space-y-3 transition-all ${
                validationResult.isCorrect
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                  {validationResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-900">正解 (Correct!)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="text-rose-900">不正解 (Incorrect)</span>
                    </>
                  )}
                </div>

                <div className="shrink-0 hidden sm:block">
                  <TanuMascot
                    pose={validationResult.isCorrect ? 'happy' : 'encouraging'}
                    size="xs"
                    animated={false}
                    alt={
                      validationResult.isCorrect
                        ? 'Tanu celebrating your correct answer'
                        : 'Tanu encouraging you to review'
                    }
                  />
                </div>
              </div>

              {!validationResult.isCorrect && (
                <div className="bg-white/80 border border-rose-200 rounded-lg p-3 space-y-1.5 text-xs text-slate-800">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-rose-700 shrink-0">Your selection:</span>
                    <span className="line-through text-stone-600 font-medium">
                      {validationResult.selectedOption}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 shrink-0">Correct answer:</span>
                    <span className="font-bold text-emerald-950">
                      {validationResult.correctAnswer}
                    </span>
                  </div>
                </div>
              )}

              <p className="leading-relaxed text-stone-700">{validationResult.explanation}</p>
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
