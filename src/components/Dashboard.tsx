import React from 'react';
import {
  Sparkles,
  Flame,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  RotateCcw,
  BookOpen,
  Layers,
  GraduationCap
} from 'lucide-react';
import { UserStudyData, ModuleId } from '../types';
import { MODULES } from '../data/modules';
import { QUESTIONS_BY_MODULE, ALL_QUESTIONS } from '../data/questions';

interface DashboardProps {
  studyData: UserStudyData;
  onNavigateToQuiz: (moduleId?: ModuleId) => void;
  onNavigateToMockExam: () => void;
  onNavigateToSmartReview: () => void;
  onNavigateToFlashcards: () => void;
  onNavigateToQuickStudy: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  studyData,
  onNavigateToQuiz,
  onNavigateToMockExam,
  onNavigateToSmartReview,
  onNavigateToFlashcards,
  onNavigateToQuickStudy,
}) => {
  // Compute real statistics
  const totalQuestions = ALL_QUESTIONS.length;
  const attemptedQuestionsCount = Object.keys(studyData.questionStats).length;
  const totalAttempts = studyData.totalQuestionsAnswered;
  const overallAccuracy =
    totalAttempts > 0
      ? Math.round((studyData.totalCorrectAnswers / totalAttempts) * 100)
      : 0;

  // Compute stats per module
  const moduleStats = MODULES.map((m) => {
    const questionsInModule = QUESTIONS_BY_MODULE[m.id] || [];
    let attemptedInModule = 0;
    let correctInModule = 0;
    let attemptsInModule = 0;

    questionsInModule.forEach((q) => {
      const stat = studyData.questionStats[q.id];
      if (stat && stat.attempts > 0) {
        attemptedInModule += 1;
        attemptsInModule += stat.attempts;
        correctInModule += stat.correct;
      }
    });

    const accuracy =
      attemptsInModule > 0
        ? Math.round((correctInModule / attemptsInModule) * 100)
        : 0;

    return {
      module: m,
      totalCount: questionsInModule.length,
      attemptedCount: attemptedInModule,
      accuracy,
      attempts: attemptsInModule,
    };
  });

  // Find weakest modules (attempted with lowest accuracy)
  const attemptedModules = moduleStats.filter((s) => s.attempts > 0);
  const weakestModules = [...attemptedModules]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2);

  // Count total questions currently answered incorrectly on last try
  const currentlyMissedQuestionsCount = Object.values(studyData.questionStats).filter(
    (s) => s.attempts > 0 && !s.lastResult
  ).length;

  // Flashcards needing review
  const flashcardsNeedingReviewCount = Object.values(studyData.flashcardStatus).filter(
    (f) => !f.known
  ).length;

  const isBrandNewUser = totalAttempts === 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-slate-900 to-rose-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-rose-300 font-medium text-xs tracking-wide">
            <span className="font-jp text-sm font-semibold">頑張ってください！</span>
            <span aria-hidden="true">·</span>
            <span>FL033 Japanese 1 Midterm Exam Preparation</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Master your Japanese Midterm Examination
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Complete interactive preparation for all 9 lecture units: Hiragana diacritics & digraphs, greetings, numerals to trillions, basic sentence patterns, Irodori Can Do dialogues, particles (wa, mo, no, ka), and True/False Japanese Culture.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToMockExam}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Take Timed Mock Exam
            </button>
            <button
              onClick={onNavigateToSmartReview}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Start Smart Review ({currentlyMissedQuestionsCount} missed)
            </button>
            <button
              onClick={onNavigateToQuickStudy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-stone-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              5-Min Cram Sheet
            </button>
          </div>
        </div>

        {/* Decorative background watermark pattern */}
        <div className="absolute -right-8 -bottom-10 opacity-10 select-none pointer-events-none text-9xl font-jp font-bold text-white">
          日本語
        </div>
      </section>

      {/* Primary KPI Metrics Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Lessons Available</span>
            <BookOpen className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              9
            </span>
            <span className="text-xs text-stone-500 font-medium">Lectures</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            {totalQuestions} total practice questions
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Practiced Questions</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {attemptedQuestionsCount}
            </span>
            <span className="text-xs text-stone-500 font-medium">/ {totalQuestions}</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            {totalAttempts} total attempts made
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Overall Accuracy</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {overallAccuracy}%
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {studyData.totalCorrectAnswers} correct
            </span>
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            {isBrandNewUser ? 'Ready to begin' : `${studyData.totalCorrectAnswers}/${totalAttempts} answered correctly`}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {studyData.streakCount}
            </span>
            <span className="text-xs text-stone-500 font-medium">Days active</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-600">
            {studyData.lastStudyDate ? `Last: ${studyData.lastStudyDate}` : 'Start today!'}
          </div>
        </div>
      </section>

      {/* Action Recommendation Callout */}
      {isBrandNewUser ? (
        <section className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" />
              Welcome to your Midterm Review!
            </h2>
            <p className="text-xs sm:text-sm text-rose-900/80">
              Begin with <span className="font-semibold">Module 1 (Hiragana Diacritics)</span> or review essential greetings with flashcards.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigateToQuiz('module-1')}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Start Module 1 Quiz
            </button>
            <button
              onClick={onNavigateToFlashcards}
              className="px-4 py-2 bg-white border border-rose-300 text-rose-900 text-xs font-semibold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Study Flashcards
            </button>
          </div>
        </section>
      ) : currentlyMissedQuestionsCount > 0 ? (
        <section className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Targeted Practice: {currentlyMissedQuestionsCount} missed concepts need review</span>
            </div>
            <p className="text-xs text-amber-800">
              Spaced repetition shows you struggled with these items recently. Practicing them now prevents mistakes on the exam.
            </p>
          </div>
          <button
            onClick={onNavigateToSmartReview}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Review Missed ({currentlyMissedQuestionsCount})
          </button>
        </section>
      ) : (
        <section className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Excellent progress! No pending missed questions.</span>
            </div>
            <p className="text-xs text-emerald-800">
              Test your full mastery with a realistic 50-question Timed Mock Examination.
            </p>
          </div>
          <button
            onClick={onNavigateToMockExam}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Take Mock Exam
          </button>
        </section>
      )}

      {/* Weakest Topics Spotlight (if user has attempted quizzes) */}
      {weakestModules.length > 0 && weakestModules[0].accuracy < 80 && (
        <section className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Focus Areas / Weakest Topics
              </h2>
              <p className="text-xs text-stone-500">
                Topics where your accuracy is below 80% based on submitted questions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakestModules.map((item) => (
              <div
                key={item.module.id}
                className="border border-stone-200 rounded-lg p-4 bg-stone-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span className="font-semibold text-rose-800">{item.module.category}</span>
                    <span className="font-bold tabular-nums text-slate-800">
                      {item.accuracy}% Accuracy
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {item.module.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                    {item.module.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    {item.attemptedCount} / {item.totalCount} questions practiced
                  </span>
                  <button
                    onClick={() => onNavigateToQuiz(item.module.id)}
                    className="text-xs font-bold text-rose-700 hover:text-rose-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    Target Practice <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All 9 Modules Study Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Exam Modules & Study Coverage
            </h2>
            <p className="text-xs text-stone-500">
              Authoritative curriculum from your 9 uploaded PDF lecture materials
            </p>
          </div>
          <button
            onClick={() => onNavigateToQuiz()}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
          >
            Practice All Modules ({totalQuestions} Qs) <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleStats.map((item, index) => {
            const isCompleted = item.attemptedCount >= item.totalCount && item.accuracy >= 80;
            const progressPercent = Math.round((item.attemptedCount / item.totalCount) * 100);

            return (
              <div
                key={item.module.id}
                className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-stone-600 font-semibold tracking-wider text-[10px]">
                      0{index + 1} · {item.module.category}
                    </span>
                    {isCompleted ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        Mastered
                      </span>
                    ) : item.attempts > 0 ? (
                      <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                        {item.accuracy}% accuracy
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-600">Not started</span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-800 transition-colors">
                    {item.module.title}
                  </h3>
                  <div className="text-xs text-stone-500 font-jp font-medium mt-0.5">
                    {item.module.japaneseTitle}
                  </div>

                  <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {item.module.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>Progress</span>
                      <span className="tabular-nums font-semibold text-slate-700">
                        {item.attemptedCount} / {item.totalCount} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : progressPercent > 0
                            ? 'bg-rose-600'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-600 truncate max-w-[150px]" title={item.module.sourcePdfName}>
                      {item.module.sourcePdfName.split(' - ')[1] || item.module.sourcePdfName}
                    </span>
                    <button
                      onClick={() => onNavigateToQuiz(item.module.id)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-rose-700 hover:text-white text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Quiz Attempts History */}
      {studyData.quizHistory.length > 0 && (
        <section className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Exam & Quiz Activity
              </h2>
              <p className="text-xs text-stone-500">
                Log of your latest study and examination attempts
              </p>
            </div>
            <span className="text-xs text-stone-500">
              {studyData.quizHistory.length} total sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {studyData.quizHistory.slice(0, 6).map((attempt) => {
                  const dateStr = new Date(attempt.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isPassing = attempt.percentage >= 70;

                  return (
                    <tr key={attempt.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap capitalize">
                        {attempt.mode === 'mock-exam' ? 'Mock Exam' : attempt.mode.replace('-', ' ')}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums font-bold text-slate-900">
                        {attempt.score} / {attempt.totalQuestions}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums font-bold">
                        {attempt.percentage}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
                            isPassing ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPassing ? 'Passed' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
