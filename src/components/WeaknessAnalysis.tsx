import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserStudyData, ModuleId } from '../types';
import { MODULES } from '../data/modules';
import { ALL_QUESTIONS, QUESTIONS_BY_MODULE } from '../data/questions';

interface WeaknessAnalysisProps {
  studyData: UserStudyData;
  onNavigateToQuiz: (moduleId?: ModuleId) => void;
  onNavigateToSmartReview: () => void;
  onNavigateToMockExam: () => void;
}

export const WeaknessAnalysis: React.FC<WeaknessAnalysisProps> = ({
  studyData,
  onNavigateToQuiz,
  onNavigateToSmartReview,
  onNavigateToMockExam,
}) => {
  // Compute accuracy for each module
  const modulePerformances = MODULES.map((m) => {
    const questions = QUESTIONS_BY_MODULE[m.id] || [];
    let attempts = 0;
    let correct = 0;
    const missedQuestionsList: string[] = [];

    questions.forEach((q) => {
      const stat = studyData.questionStats[q.id];
      if (stat && stat.attempts > 0) {
        attempts += stat.attempts;
        correct += stat.correct;
        if (!stat.lastResult) {
          missedQuestionsList.push(q.id);
        }
      }
    });

    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : null;

    return {
      module: m,
      totalQuestions: questions.length,
      attempts,
      correct,
      accuracy,
      missedCount: missedQuestionsList.length,
      missedQuestionIds: missedQuestionsList,
    };
  });

  const attemptedModules = modulePerformances.filter((p) => p.attempts > 0);

  // Identify strongest and weakest topics
  const sortedByAccuracy = [...attemptedModules].sort(
    (a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0)
  );

  const weakestModule = sortedByAccuracy[0] || null;
  const strongestModule =
    sortedByAccuracy.length > 1 ? sortedByAccuracy[sortedByAccuracy.length - 1] : null;

  // Gather all currently missed questions
  const allMissedQuestionIds = Object.keys(studyData.questionStats).filter(
    (qId) =>
      studyData.questionStats[qId].attempts > 0 && !studyData.questionStats[qId].lastResult
  );

  const missedQuestionsDetailed = allMissedQuestionIds
    .map((qId) => ALL_QUESTIONS.find((q) => q.id === qId))
    .filter((q): q is NonNullable<typeof q> => !!q);

  const totalAnswered = studyData.totalQuestionsAnswered;
  const totalCorrect = studyData.totalCorrectAnswers;
  const overallAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Diagnostic Performance Radar</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Weakness Analysis & Mastery Tracker
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Deep diagnostic insights into your knowledge gaps across all 9 modules based on submitted practice attempts and mock examinations.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Accuracy */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-stone-500">Cumulative Accuracy</div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {overallAccuracy}%
            </span>
          </div>
          <div className="text-[11px] text-stone-500">
            {totalCorrect} correct of {totalAnswered} attempts
          </div>
        </div>

        {/* Strongest Module */}
        <div className="bg-white border border-emerald-200/90 bg-emerald-50/20 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Strongest Topic</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            {strongestModule ? (
              <>
                <div className="text-base font-bold text-slate-900 truncate">
                  {strongestModule.module.title}
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5 tabular-nums">
                  {strongestModule.accuracy}% accuracy
                </div>
              </>
            ) : (
              <span className="text-xs text-stone-400">Complete more modules to rank</span>
            )}
          </div>
          <div className="text-[11px] text-stone-500">
            {strongestModule ? `${strongestModule.attempts} total attempts` : 'Keep practicing'}
          </div>
        </div>

        {/* Weakest Module */}
        <div className="bg-white border border-rose-200/90 bg-rose-50/20 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>Priority Review Target</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="my-2">
            {weakestModule ? (
              <>
                <div className="text-base font-bold text-slate-900 truncate">
                  {weakestModule.module.title}
                </div>
                <div className="text-xs font-semibold text-rose-700 mt-0.5 tabular-nums">
                  {weakestModule.accuracy}% accuracy ({weakestModule.missedCount} missed)
                </div>
              </>
            ) : (
              <span className="text-xs text-stone-400">No weaknesses detected yet</span>
            )}
          </div>
          {weakestModule && (
            <button
              onClick={() => onNavigateToQuiz(weakestModule.module.id)}
              className="text-[11px] font-bold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 cursor-pointer"
            >
              Drill this module <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Module by Module Diagnostics Table */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Module-by-Module Mastery Matrix
        </h2>

        <div className="space-y-3">
          {modulePerformances.map((item, idx) => {
            const hasData = item.attempts > 0;
            const accuracyVal = item.accuracy ?? 0;

            return (
              <div
                key={item.module.id}
                className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-stone-200/70 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.module.title}
                    </h3>
                    <div className="text-xs text-stone-500 font-jp">
                      {item.module.japaneseTitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {hasData ? `${accuracyVal}%` : '—'}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {hasData ? `${item.correct}/${item.attempts} correct` : 'Not attempted'}
                    </div>
                  </div>

                  <div className="w-24 sm:w-32 h-2 bg-stone-200 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full ${
                        accuracyVal >= 80
                          ? 'bg-emerald-500'
                          : accuracyVal >= 60
                          ? 'bg-amber-500'
                          : accuracyVal > 0
                          ? 'bg-rose-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${accuracyVal}%` }}
                    />
                  </div>

                  <button
                    onClick={() => onNavigateToQuiz(item.module.id)}
                    className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Practice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed Questions Catalog with Solutions */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Knowledge Gaps ({missedQuestionsDetailed.length} Missed Questions)
            </h2>
            <p className="text-xs text-stone-500">
              Questions answered incorrectly on your most recent attempt
            </p>
          </div>

          {missedQuestionsDetailed.length > 0 && (
            <button
              onClick={onNavigateToSmartReview}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Launch Smart Review ({missedQuestionsDetailed.length})</span>
            </button>
          )}
        </div>

        {missedQuestionsDetailed.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">
              No active errors recorded!
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Every question you have attempted is currently marked correct. Take a Timed Mock Exam to test your limits.
            </p>
            <button
              onClick={onNavigateToMockExam}
              className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
            >
              Take Mock Exam
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {missedQuestionsDetailed.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between text-stone-500">
                  <span className="font-bold text-rose-900">
                    {MODULES.find((m) => m.id === q.moduleId)?.title} · {q.topic}
                  </span>
                  <span className="text-rose-700 font-semibold">Needs Review</span>
                </div>

                <div className="font-bold text-slate-900 text-sm">{q.prompt}</div>

                <div className="p-2.5 rounded-lg bg-white border border-rose-200/80 text-slate-800 space-y-1">
                  <div className="text-stone-500 text-[11px]">Correct Expected Answer:</div>
                  <div className="font-bold text-emerald-800 text-sm">{q.correctAnswer}</div>
                  <div className="text-stone-600 leading-relaxed pt-1 border-t border-stone-100">
                    {q.explanation}
                  </div>
                </div>

                <div className="text-[11px] text-stone-400">
                  Reference: {q.sourcePdf} ({q.sourceRef})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
