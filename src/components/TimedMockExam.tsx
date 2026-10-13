import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Flag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  HelpCircle
} from 'lucide-react';
import { Question, ModuleId, UserStudyData, QuizAttemptRecord } from '../types';
import { ALL_QUESTIONS, QUESTIONS_BY_MODULE } from '../data/questions';
import { MODULES } from '../data/modules';
import { soundManager } from '../utils/audio';

interface TimedMockExamProps {
  studyData: UserStudyData;
  onRecordAnswer: (questionId: string, isCorrect: boolean) => void;
  onRecordQuizAttempt: (attempt: QuizAttemptRecord) => void;
  onBackToDashboard: () => void;
  onNavigateToQuiz: (moduleId?: ModuleId) => void;
}

export const TimedMockExam: React.FC<TimedMockExamProps> = ({
  studyData,
  onRecordAnswer,
  onRecordQuizAttempt,
  onBackToDashboard,
  onNavigateToQuiz,
}) => {
  // Exam setup configuration
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questionCountChoice, setQuestionCountChoice] = useState<number>(35);
  const [durationMinutesChoice, setDurationMinutesChoice] = useState<number>(30);

  // Active exam state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(1800);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter for post-exam review: 'all' | 'missed' | 'flagged'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'missed' | 'flagged'>('all');

  // Start Exam
  const handleStartExam = () => {
    // Generate balanced questions across all 9 modules
    const selected: Question[] = [];
    const questionsPerModule = Math.floor(questionCountChoice / 9);
    const remainder = questionCountChoice % 9;

    MODULES.forEach((m, idx) => {
      const pool = [...(QUESTIONS_BY_MODULE[m.id] || [])].sort(() => Math.random() - 0.5);
      const takeCount = questionsPerModule + (idx < remainder ? 1 : 0);
      selected.push(...pool.slice(0, takeCount));
    });

    // Shuffle the final exam order
    const finalShuffled = selected.sort(() => Math.random() - 0.5);

    setExamQuestions(finalShuffled);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestionIds([]);
    setSecondsRemaining(durationMinutesChoice * 60);
    setExamStarted(true);
    setExamSubmitted(false);
    setShowConfirmModal(false);
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!examStarted || examSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examSubmitted]);

  const handleAutoSubmit = () => {
    finishExam();
  };

  const handleManualSubmit = () => {
    setShowConfirmModal(false);
    finishExam();
  };

  const finishExam = () => {
    setExamSubmitted(true);

    // Calculate score
    let score = 0;
    const correctIds: string[] = [];
    const incorrectIds: string[] = [];

    examQuestions.forEach((q) => {
      const userAns = userAnswers[q.id];
      const isCorrect = userAns && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) {
        score += 1;
        correctIds.push(q.id);
      } else {
        incorrectIds.push(q.id);
      }
      onRecordAnswer(q.id, !!isCorrect);
    });

    const total = examQuestions.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    const record: QuizAttemptRecord = {
      id: `exam-${Date.now()}`,
      timestamp: Date.now(),
      mode: 'mock-exam',
      moduleId: 'all',
      score,
      totalQuestions: total,
      percentage: pct,
      timeSpentSeconds: durationMinutesChoice * 60 - secondsRemaining,
      correctQuestionIds: correctIds,
      incorrectQuestionIds: incorrectIds,
    };
    onRecordQuizAttempt(record);

    if (pct >= 75) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      soundManager.playCorrectChime(studyData.soundEnabled);
    }
  };

  const toggleFlag = (id: string) => {
    setFlaggedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAnswer = (qId: string, opt: string) => {
    if (examSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: opt,
    }));
  };

  // Format time MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exam Setup Pre-Screen
  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              試
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Japanese Midterm Mock Examination
              </h1>
              <p className="text-xs text-stone-500">
                Full-spectrum timed practice simulation covering all 9 course modules
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-2 text-xs text-stone-700">
            <h3 className="font-bold text-slate-900">Examination Protocol:</h3>
            <ul className="list-disc list-inside space-y-1 text-stone-600">
              <li>Questions are distributed evenly across all 9 lecture modules.</li>
              <li>Module 9 (Japanese Culture) questions are strictly <strong>True or False</strong>.</li>
              <li>Explanations and feedback are withheld during testing to simulate exam conditions.</li>
              <li>You may flag questions for review and jump freely between items.</li>
              <li>Automatic submission occurs if the countdown timer expires.</li>
            </ul>
          </div>

          {/* Config: Number of questions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">
              Number of Questions:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[25, 35, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCountChoice(num)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    questionCountChoice === num
                      ? 'border-rose-600 bg-rose-50/80 text-rose-950 ring-1 ring-rose-500'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {num} Questions
                  <span className="block text-[10px] text-stone-400 font-normal mt-0.5">
                    {num === 25 ? 'Quick drill' : num === 35 ? 'Standard midterm' : 'Full challenge'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Config: Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">
              Exam Time Limit:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDurationMinutesChoice(mins)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    durationMinutesChoice === mins
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {mins} Minutes
                  <span className="block text-[10px] opacity-70 font-normal mt-0.5">
                    {Math.round((mins * 60) / questionCountChoice)} sec / question
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartExam}
              className="flex-1 py-3 px-6 bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Begin Timed Examination</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToDashboard}
              className="py-3 px-5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Question during exam
  const currentQuestion: Question | undefined = examQuestions[currentIndex];
  const isFlagged = currentQuestion ? flaggedQuestionIds.includes(currentQuestion.id) : false;
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = examQuestions.length;

  // Post-Exam Results Screen
  if (examSubmitted) {
    let score = 0;
    examQuestions.forEach((q) => {
      if (userAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score += 1;
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    let letterGrade = 'F';
    let gradeLabel = 'Needs Immediate Review';
    let gradeColor = 'text-rose-700 bg-rose-50 border-rose-200';

    if (percentage >= 90) {
      letterGrade = 'S';
      gradeLabel = 'Outstanding (秀)';
      gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (percentage >= 80) {
      letterGrade = 'A';
      gradeLabel = 'Excellent (優)';
      gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (percentage >= 70) {
      letterGrade = 'B';
      gradeLabel = 'Passing (良)';
      gradeColor = 'text-blue-700 bg-blue-50 border-blue-200';
    } else if (percentage >= 60) {
      letterGrade = 'C';
      gradeLabel = 'Marginal (可)';
      gradeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    // Module-by-module performance breakdown
    const moduleBreakdown = MODULES.map((m) => {
      const qInMod = examQuestions.filter((q) => q.moduleId === m.id);
      const correctInMod = qInMod.filter(
        (q) => userAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      ).length;
      const modPct = qInMod.length > 0 ? Math.round((correctInMod / qInMod.length) * 100) : 0;
      return {
        module: m,
        total: qInMod.length,
        correct: correctInMod,
        percentage: modPct,
      };
    }).filter((item) => item.total > 0);

    // Questions list for post-exam review
    const reviewList = examQuestions.filter((q) => {
      const userAns = userAnswers[q.id];
      const isCorrect = userAns?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (reviewFilter === 'missed') return !isCorrect;
      if (reviewFilter === 'flagged') return flaggedQuestionIds.includes(q.id);
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 pb-20">
        {/* Scorecard Hero */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Examination Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Midterm Mock Exam Results
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-6 border-y border-stone-100">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tabular-nums">
                {score} <span className="text-xl text-stone-400">/ {totalQuestions}</span>
              </div>
              <div className="text-xs text-stone-500 font-semibold mt-1">Raw Score</div>
            </div>

            <div className="h-12 w-px bg-stone-200 hidden sm:block" />

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tabular-nums">
                {percentage}%
              </div>
              <div className="text-xs text-stone-500 font-semibold mt-1">Percentage</div>
            </div>

            <div className="h-12 w-px bg-stone-200 hidden sm:block" />

            <div>
              <div
                className={`inline-block px-4 py-1.5 rounded-xl border font-extrabold text-2xl sm:text-3xl ${gradeColor}`}
              >
                Grade {letterGrade}
              </div>
              <div className="text-xs text-stone-600 font-medium mt-1">{gradeLabel}</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleStartExam}
              className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Another Mock Exam
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>

        {/* Breakdown by Module */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Accuracy Breakdown by Lecture Topic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {moduleBreakdown.map((item) => (
              <div
                key={item.module.id}
                className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-700 truncate pr-2">
                    {item.module.title}
                  </span>
                  <span
                    className={`font-bold tabular-nums shrink-0 ${
                      item.percentage >= 70 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      item.percentage >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500 mt-2 flex justify-between">
                  <span>
                    {item.correct} / {item.total} correct
                  </span>
                  <button
                    onClick={() => onNavigateToQuiz(item.module.id)}
                    className="text-rose-700 hover:underline font-bold"
                  >
                    Drill
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Detailed Answer & Explanation Review
              </h2>
              <p className="text-xs text-stone-500">
                Review every question, your selected response, and grounded lesson citations
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs self-start sm:self-auto">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                All ({examQuestions.length})
              </button>
              <button
                onClick={() => setReviewFilter('missed')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  reviewFilter === 'missed'
                    ? 'bg-white text-rose-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                Missed ({examQuestions.length - score})
              </button>
              <button
                onClick={() => setReviewFilter('flagged')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  reviewFilter === 'flagged'
                    ? 'bg-white text-amber-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                Flagged ({flaggedQuestionIds.length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {reviewList.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums px-2 py-0.5 rounded-md bg-stone-100 text-slate-800">
                        #{examQuestions.findIndex((item) => item.id === q.id) + 1}
                      </span>
                      <span className="font-bold text-rose-800">
                        {MODULES.find((m) => m.id === q.moduleId)?.title}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-500">{q.topic}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold">
                      {isCorrect ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  {q.japaneseContext && (
                    <div className="p-2.5 bg-stone-50 rounded-lg text-center font-jp font-bold text-slate-900 border border-stone-200/60 text-sm">
                      {q.japaneseContext}
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-slate-900">{q.prompt}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div
                      className={`p-2.5 rounded-lg border ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950 font-semibold'
                      }`}
                    >
                      <span className="text-stone-500 block text-[10px]">Your Answer:</span>
                      <span>{userAns || '(Unanswered)'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-white border-stone-200 text-slate-800">
                      <span className="text-stone-500 block text-[10px]">Correct Answer:</span>
                      <span className="font-bold text-emerald-800">{q.correctAnswer}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed pt-1">
                    {q.explanation}
                  </p>

                  <div className="text-[11px] text-stone-600 pt-1 border-t border-black/5">
                    Source: {q.sourcePdf} ({q.sourceRef})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Exam In-Progress View
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Floating Exam Status Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900">
            Q <span className="tabular-nums text-rose-700 text-sm">{currentIndex + 1}</span> of{' '}
            <span className="tabular-nums">{totalQuestions}</span>
          </span>
          <span className="hidden sm:inline-block text-stone-300">|</span>
          <span className="hidden sm:inline-block text-xs text-stone-500 tabular-nums">
            {answeredCount} answered · {flaggedQuestionIds.length} flagged
          </span>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-sm tabular-nums ${
            secondsRemaining < 300
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : 'bg-stone-50 border-stone-200 text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-stone-500" />
          <span>{formatTime(secondsRemaining)}</span>
        </div>

        {/* Submit Early Trigger */}
        <button
          onClick={() => setShowConfirmModal(true)}
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Exam</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Main Question Area (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {currentQuestion && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-800">
                    {MODULES.find((m) => m.id === currentQuestion.moduleId)?.title}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-600">{currentQuestion.topic}</span>
                </div>

                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    isFlagged
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone-100 text-stone-600 hover:text-slate-900'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>

              {currentQuestion.japaneseContext && (
                <div className="p-3 bg-stone-50 rounded-lg text-center font-jp text-lg font-bold text-slate-900 border border-stone-200/60">
                  {currentQuestion.japaneseContext}
                </div>
              )}

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQuestion.prompt}
              </h2>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = userAnswers[currentQuestion.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                      className={`w-full p-3.5 sm:p-4 text-left rounded-xl border transition-all flex items-start gap-3 cursor-pointer text-sm sm:text-base ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs ring-1 ring-slate-900'
                          : 'border-stone-200 bg-white text-slate-800 hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 disabled:pointer-events-none text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-xs text-stone-400">
                  {userAnswers[currentQuestion.id] ? 'Answer recorded' : 'Unanswered'}
                </span>

                <button
                  disabled={currentIndex + 1 === totalQuestions}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Question Navigation Palette (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Question Navigator
            </h3>

            <div className="flex items-center gap-3 text-[11px] text-stone-500 pb-2 border-b border-stone-100">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-stone-100 border border-stone-300 inline-block" /> Empty
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-[360px] overflow-y-auto p-0.5">
              {examQuestions.map((q, idx) => {
                const isAns = !!userAnswers[q.id];
                const isFlg = flaggedQuestionIds.includes(q.id);
                const isCurr = idx === currentIndex;

                let btnBg = 'bg-stone-100 text-slate-700 hover:bg-stone-200';
                if (isAns) btnBg = 'bg-slate-900 text-white font-bold';
                if (isFlg) btnBg = 'bg-amber-400 text-amber-950 font-bold';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${btnBg} ${
                      isCurr ? 'ring-2 ring-rose-500 ring-offset-1 font-extrabold' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-2 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Finish & Submit
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              Submit Examination?
            </h3>
            <div className="space-y-2 text-xs text-stone-600">
              <p>
                You have answered <strong>{answeredCount}</strong> out of{' '}
                <strong>{totalQuestions}</strong> questions.
              </p>
              {totalQuestions - answeredCount > 0 && (
                <p className="text-rose-700 font-semibold">
                  Warning: You still have {totalQuestions - answeredCount} unanswered questions!
                </p>
              )}
              {flaggedQuestionIds.length > 0 && (
                <p className="text-amber-800">
                  You have {flaggedQuestionIds.length} questions flagged for review.
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Continue Exam
              </button>
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
