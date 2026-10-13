import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  Volume2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Filter
} from 'lucide-react';
import { Question, ModuleId, UserStudyData, QuizAttemptRecord } from '../types';
import { MODULES } from '../data/modules';
import { ALL_QUESTIONS, QUESTIONS_BY_MODULE } from '../data/questions';
import { soundManager } from '../utils/audio';

interface PracticeQuizProps {
  initialModuleId?: ModuleId | 'all';
  studyData: UserStudyData;
  onRecordAnswer: (questionId: string, isCorrect: boolean) => void;
  onRecordQuizAttempt: (attempt: QuizAttemptRecord) => void;
  onToggleBookmark: (questionId: string) => void;
  onBackToDashboard: () => void;
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

  // Question selection pool
  const candidateQuestions = useMemo(() => {
    let pool = selectedModule === 'all' ? ALL_QUESTIONS : QUESTIONS_BY_MODULE[selectedModule] || [];

    if (filterMode === 'missed') {
      pool = pool.filter((q) => {
        const stat = studyData.questionStats[q.id];
        return stat && stat.attempts > 0 && !stat.lastResult;
      });
    } else if (filterMode === 'unattempted') {
      pool = pool.filter((q) => !studyData.questionStats[q.id] || studyData.questionStats[q.id].attempts === 0);
    } else if (filterMode === 'bookmarked') {
      pool = pool.filter((q) => studyData.bookmarkedQuestionIds.includes(q.id));
    }

    // Default randomize
    return [...pool].sort(() => Math.random() - 0.5);
  }, [selectedModule, filterMode, studyData]);

  // Quiz execution state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptedHistory, setAttemptedHistory] = useState<{ id: string; correct: boolean }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Current question
  const currentQuestion: Question | undefined = candidateQuestions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedOption === null || isSubmitted) return;

    const isCorrect = selectedOption.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setIsSubmitted(true);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      soundManager.playCorrectChime(studyData.soundEnabled);
    } else {
      soundManager.playIncorrectChime(studyData.soundEnabled);
    }

    onRecordAnswer(currentQuestion.id, isCorrect);
    setAttemptedHistory((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < candidateQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      // Quiz complete
      setQuizCompleted(true);
      const total = candidateQuestions.length;
      const score = correctCount + (selectedOption === currentQuestion?.correctAnswer ? 1 : 0);
      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

      const record: QuizAttemptRecord = {
        id: `quiz-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'practice',
        moduleId: selectedModule,
        score,
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
    newModule?: ModuleId | 'all',
    newFilter?: 'all' | 'missed' | 'unattempted' | 'bookmarked'
  ) => {
    if (newModule !== undefined) setSelectedModule(newModule);
    if (newFilter !== undefined) setFilterMode(newFilter);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
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
            onClick={() => {
              setFilterMode('all');
              handleRestartQuiz(selectedModule, 'all');
            }}
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
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto text-2xl font-bold">
            {percentage >= 80 ? '🌸' : percentage >= 60 ? '✨' : '📖'}
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
              const isCorrectOption = opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

              let containerStyle =
                'border-stone-200 bg-white hover:bg-stone-50/80 text-slate-800';

              if (isSelected && !isSubmitted) {
                containerStyle =
                  'border-rose-600 bg-rose-50/60 text-rose-950 font-semibold ring-1 ring-rose-500';
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

          {/* Explanation Callout (after submission) */}
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

              <p className="leading-relaxed text-stone-700">
                {currentQuestion.explanation}
              </p>

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

          {/* Action Button: Submit or Next */}
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
