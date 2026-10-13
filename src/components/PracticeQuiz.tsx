import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { Question, ModuleId, UserStudyData, QuizAttemptRecord } from '../types';
import { MODULES } from '../data/modules';
import { ALL_QUESTIONS, QUESTIONS_BY_MODULE } from '../data/questions';
import { soundManager } from '../utils/audio';
import { TanuMascot } from './mascot/TanuMascot';

interface PracticeQuizProps {
  initialModuleId?: ModuleId | 'all';
  studyData: UserStudyData;
  onRecordAnswer: (questionId: string, isCorrect: boolean) => void;
  onRecordQuizAttempt: (attempt: QuizAttemptRecord) => void;
  onToggleBookmark: (questionId: string) => void;
  onBackToDashboard: () => void;
}

/**
 * Normalized string comparison helper to ensure robust, whitespace- and
 * case-insensitive matching without subtle unicode or whitespace disparities.
 */
export function normalizeAnswer(ans: string | null | undefined): string {
  if (!ans) return '';
  return ans
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

/**
 * Single Authoritative Source of Truth for a Question's Evaluation
 */
export interface QuestionValidationResult {
  questionId: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

/**
 * Builds a deterministic snapshot of candidate questions for a given session.
 * Shuffled once on session start/restart; never reshuffled during an active quiz.
 */
function buildQuestionPool(
  moduleFilter: ModuleId | 'all',
  filter: 'all' | 'missed' | 'unattempted' | 'bookmarked',
  currentStudyData: UserStudyData
): Question[] {
  let pool = moduleFilter === 'all' ? ALL_QUESTIONS : QUESTIONS_BY_MODULE[moduleFilter] || [];

  if (filter === 'missed') {
    pool = pool.filter((q) => {
      const stat = currentStudyData.questionStats[q.id];
      return stat && stat.attempts > 0 && !stat.lastResult;
    });
  } else if (filter === 'unattempted') {
    pool = pool.filter(
      (q) => !currentStudyData.questionStats[q.id] || currentStudyData.questionStats[q.id].attempts === 0
    );
  } else if (filter === 'bookmarked') {
    pool = pool.filter((q) => currentStudyData.bookmarkedQuestionIds.includes(q.id));
  }

  // Randomize once for this quiz session
  return [...pool].sort(() => Math.random() - 0.5);
}

export const PracticeQuiz: React.FC<PracticeQuizProps> = ({
  initialModuleId = 'all',
  studyData,
  onRecordAnswer,
  onRecordQuizAttempt,
  onToggleBookmark,
  onBackToDashboard,
}) => {
  const [selectedModule, setSelectedModule] = useState<ModuleId | 'all'>(initialModuleId);
  const [filterMode, setFilterMode] = useState<'all' | 'missed' | 'unattempted' | 'bookmarked'>('all');

  // Stable session question pool - preserved across answer recordings
  const [candidateQuestions, setCandidateQuestions] = useState<Question[]>(() =>
    buildQuestionPool(initialModuleId, 'all', studyData)
  );

  // Sync if initialModuleId prop explicitly changes from parent navigation
  useEffect(() => {
    setSelectedModule(initialModuleId);
    setFilterMode('all');
    setCandidateQuestions(buildQuestionPool(initialModuleId, 'all', studyData));
    setCurrentIndex(0);
    setSelectedOption(null);
    setValidationResult(null);
    setCorrectCount(0);
    setAttemptedHistory([]);
    setQuizCompleted(false);
  }, [initialModuleId]);

  // Quiz execution state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<QuestionValidationResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptedHistory, setAttemptedHistory] = useState<
    { id: string; correct: boolean; selectedOption: string }[]
  >([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Current question from stable session pool
  const currentQuestion: Question | undefined = candidateQuestions[currentIndex];

  const handleSelectOption = (opt: string) => {
    // Lock answer selection once submitted
    if (validationResult !== null) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    // Prevent submission if no question, no selection, or already validated
    if (!currentQuestion || selectedOption === null || validationResult !== null) return;

    // 1. Retrieve authoritative correct answer
    const authoritativeCorrect = currentQuestion.correctAnswer;

    // 2. Compare using normalized values
    const isCorrect = normalizeAnswer(selectedOption) === normalizeAnswer(authoritativeCorrect);

    // 3. Establish the single source of truth for this question's outcome
    const result: QuestionValidationResult = {
      questionId: currentQuestion.id,
      selectedOption,
      correctAnswer: authoritativeCorrect,
      isCorrect,
      explanation: currentQuestion.explanation,
    };

    setValidationResult(result);

    // 4. Update score once and play auditory feedback
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      soundManager.playCorrectChime(studyData.soundEnabled);
    } else {
      soundManager.playIncorrectChime(studyData.soundEnabled);
    }

    // 5. Persist answer to study progress state and local session history
    onRecordAnswer(currentQuestion.id, isCorrect);
    setAttemptedHistory((prev) => [
      ...prev,
      { id: currentQuestion.id, correct: isCorrect, selectedOption }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < candidateQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setValidationResult(null);
    } else {
      // Quiz complete
      setQuizCompleted(true);
      const total = candidateQuestions.length;
      // Note: correctCount already accurately contains total points awarded
      const finalScore = correctCount;
      const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;

      const record: QuizAttemptRecord = {
        id: `quiz-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'practice',
        moduleId: selectedModule,
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

  const handleRestartQuiz = (
    newModule: ModuleId | 'all' = selectedModule,
    newFilter: 'all' | 'missed' | 'unattempted' | 'bookmarked' = filterMode
  ) => {
    setSelectedModule(newModule);
    setFilterMode(newFilter);
    const newPool = buildQuestionPool(newModule, newFilter, studyData);
    setCandidateQuestions(newPool);
    setCurrentIndex(0);
    setSelectedOption(null);
    setValidationResult(null);
    setCorrectCount(0);
    setAttemptedHistory([]);
    setQuizCompleted(false);
  };

  // If candidate questions pool is empty
  if (candidateQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            No questions match this filter
          </h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            {filterMode === 'missed'
              ? 'Great news! You have no questions currently marked incorrect in this module.'
              : filterMode === 'bookmarked'
              ? 'You have not bookmarked any questions in this module yet. Click the bookmark ribbon on questions to save them.'
              : filterMode === 'unattempted'
              ? 'You have already attempted all questions in this module!'
              : 'No questions available.'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => handleRestartQuiz(selectedModule, 'all')}
            className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Practice All Questions ({selectedModule === 'all' ? ALL_QUESTIONS.length : (QUESTIONS_BY_MODULE[selectedModule]?.length || 0)} Qs)
          </button>
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Quiz Completed View
  if (quizCompleted) {
    const total = candidateQuestions.length;
    const finalScore = correctCount;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    const missedItems = attemptedHistory.filter((a) => !a.correct);

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="flex justify-center mb-2">
            <TanuMascot
              pose={percentage >= 80 ? 'celebration' : percentage >= 60 ? 'happy' : 'encouraging'}
              size="lg"
              alt="Tanu celebrating quiz completion"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Quiz Completed!
            </h2>
            <p className="text-xs text-stone-500">
              {selectedModule === 'all'
                ? 'All Modules Practice Session'
                : MODULES.find((m) => m.id === selectedModule)?.title}
            </p>
          </div>

          <div className="py-4 border-y border-stone-100 flex items-center justify-center gap-8">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                {finalScore} <span className="text-lg text-stone-400">/ {total}</span>
              </div>
              <div className="text-xs text-stone-500 font-semibold mt-0.5">Score</div>
            </div>
            <div className="h-10 w-px bg-stone-200" />
            <div>
              <div
                className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${
                  percentage >= 80
                    ? 'text-emerald-700'
                    : percentage >= 60
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {percentage}%
              </div>
              <div className="text-xs text-stone-500 font-semibold mt-0.5">Accuracy</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {missedItems.length > 0 && (
              <button
                onClick={() => handleRestartQuiz(selectedModule, 'missed')}
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Missed Questions ({missedItems.length})
              </button>
            )}
            <button
              onClick={() => handleRestartQuiz(selectedModule, 'all')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Retake All Questions
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

  const isCurrentBookmarked = currentQuestion
    ? studyData.bookmarkedQuestionIds.includes(currentQuestion.id)
    : false;

  const currentModuleInfo = MODULES.find((m) => m.id === currentQuestion?.moduleId);
  const isSubmitted = validationResult !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Module Selector Bar & Filters */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-700" />
            <label htmlFor="module-select" className="text-xs font-bold text-slate-900">
              Module:
            </label>
            <select
              id="module-select"
              value={selectedModule}
              onChange={(e) => handleRestartQuiz(e.target.value as ModuleId | 'all', filterMode)}
              className="text-xs font-semibold bg-stone-50 border border-stone-300 rounded-md px-2.5 py-1 text-slate-800 focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="all">All 9 Modules (Mixed Comprehensive)</option>
              {MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter sub-selector */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => handleRestartQuiz(selectedModule, 'all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleRestartQuiz(selectedModule, 'missed')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'missed'
                  ? 'bg-white text-amber-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Missed
            </button>
            <button
              onClick={() => handleRestartQuiz(selectedModule, 'unattempted')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'unattempted'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Unseen
            </button>
            <button
              onClick={() => handleRestartQuiz(selectedModule, 'bookmarked')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'bookmarked'
                  ? 'bg-white text-rose-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Bookmarked
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1 pt-1 border-t border-stone-100">
          <div className="flex justify-between text-xs text-stone-500 font-medium">
            <span>
              Question <strong className="text-slate-900 tabular-nums">{currentIndex + 1}</strong> of{' '}
              <strong className="text-slate-900 tabular-nums">{candidateQuestions.length}</strong>
            </span>
            <span className="tabular-nums">
              Score: <strong className="text-slate-900">{correctCount}</strong>
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 transition-all duration-200"
              style={{
                width: `${Math.round(((currentIndex + 1) / candidateQuestions.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-800">
                {currentModuleInfo?.title || currentQuestion.moduleId}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-600">{currentQuestion.topic}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleBookmark(currentQuestion.id)}
                className={`p-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer ${
                  isCurrentBookmarked ? 'text-amber-500 fill-amber-500' : 'text-stone-400'
                }`}
                title={isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prompt */}
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

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === opt;

              let containerStyle =
                'border-stone-200 bg-white hover:bg-stone-50/80 text-slate-800';

              if (isSelected && !isSubmitted) {
                // Clear selection state before submission without revealing correctness
                containerStyle =
                  'border-rose-600 bg-rose-50/70 text-rose-950 font-semibold ring-2 ring-rose-500 shadow-xs';
              }

              if (isSubmitted && validationResult) {
                const isThisTheCorrectAnswer =
                  normalizeAnswer(opt) === normalizeAnswer(validationResult.correctAnswer);
                const isThisUserSelectedWrong =
                  isSelected && !validationResult.isCorrect;

                if (isThisTheCorrectAnswer) {
                  // The authoritative correct option is highlighted in emerald green
                  containerStyle =
                    'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-xs';
                } else if (isThisUserSelectedWrong) {
                  // User's wrong selection is marked in rose red
                  containerStyle =
                    'border-rose-600 bg-rose-50 text-rose-950 font-semibold ring-2 ring-rose-500 shadow-xs';
                } else {
                  // Unselected options are muted
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
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                      isThisCorrect
                        ? 'bg-emerald-600 text-white'
                        : isThisWrongSelection
                        ? 'bg-rose-600 text-white'
                        : isSelected && !isSubmitted
                        ? 'bg-rose-700 text-white'
                        : 'bg-stone-100 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>

                  {/* Visual badges for submitted answer state */}
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

          {/* Explanation Callout (governed strictly by single validationResult source of truth) */}
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

                {/* Tanu Mascot encouragement */}
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

              {/* Explicit Breakdown when answer is incorrect */}
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

              {/* Authoritative Explanation */}
              <div className="space-y-1">
                <div className="font-bold text-[11px] uppercase tracking-wider text-stone-500">
                  Explanation & Lecture Notes
                </div>
                <p className="leading-relaxed text-stone-700">
                  {validationResult.explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                <span>
                  Source: <strong>{currentQuestion.sourcePdf}</strong> ({currentQuestion.sourceRef})
                </span>
                {currentQuestion.sourceType === 'video' && (
                  <span className="text-rose-700 font-bold">JapanesePod101 Video Resource</span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons: Submit or Next */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-stone-400">
              {isSubmitted ? 'Proceed to next question' : 'Select an answer above'}
            </span>

            {!isSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                  selectedOption !== null
                    ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{currentIndex + 1 < candidateQuestions.length ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
