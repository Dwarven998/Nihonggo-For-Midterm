import React, { useState, useEffect } from 'react';
import {
  loadStudyData,
  saveStudyData,
  recordQuestionAnswer,
  recordQuizAttempt,
  toggleQuestionBookmark,
  setFlashcardStatus,
  clearAllProgress
} from './utils/storage';
import { UserStudyData, ModuleId, QuizAttemptRecord } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PracticeQuiz } from './components/PracticeQuiz';
import { FlashcardsView } from './components/FlashcardsView';
import { SmartReview } from './components/SmartReview';
import { TimedMockExam } from './components/TimedMockExam';
import { CultureVideoReview } from './components/CultureVideoReview';
import { WeaknessAnalysis } from './components/WeaknessAnalysis';
import { QuickStudy } from './components/QuickStudy';
import { GlossaryView } from './components/GlossaryView';
import { PrintableRevisionSheet } from './components/PrintableRevisionSheet';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [studyData, setStudyData] = useState<UserStudyData>(() => loadStudyData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [targetQuizModule, setTargetQuizModule] = useState<ModuleId | 'all'>('all');
  const [showResetModal, setShowResetModal] = useState(false);

  // Sync to storage on state change
  useEffect(() => {
    saveStudyData(studyData);
  }, [studyData]);

  // Handlers
  const handleRecordAnswer = (questionId: string, isCorrect: boolean) => {
    setStudyData((prev) => recordQuestionAnswer(prev, questionId, isCorrect));
  };

  const handleRecordQuizAttempt = (attempt: QuizAttemptRecord) => {
    setStudyData((prev) => recordQuizAttempt(prev, attempt));
  };

  const handleToggleBookmark = (questionId: string) => {
    setStudyData((prev) => toggleQuestionBookmark(prev, questionId));
  };

  const handleSetFlashcardStatus = (cardId: string, known: boolean) => {
    setStudyData((prev) => setFlashcardStatus(prev, cardId, known));
  };

  const handleToggleSound = () => {
    setStudyData((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleConfirmReset = () => {
    const fresh = clearAllProgress();
    setStudyData(fresh);
    setShowResetModal(false);
    setActiveTab('dashboard');
  };

  const navigateToQuiz = (moduleId?: ModuleId) => {
    setTargetQuizModule(moduleId || 'all');
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studyData={studyData}
        onToggleSound={handleToggleSound}
        onRequestReset={() => setShowResetModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            studyData={studyData}
            onNavigateToQuiz={navigateToQuiz}
            onNavigateToMockExam={() => setActiveTab('mock-exam')}
            onNavigateToSmartReview={() => setActiveTab('smart-review')}
            onNavigateToFlashcards={() => setActiveTab('flashcards')}
            onNavigateToQuickStudy={() => setActiveTab('quick-study')}
          />
        )}

        {activeTab === 'quiz' && (
          <PracticeQuiz
            key={targetQuizModule}
            initialModuleId={targetQuizModule}
            studyData={studyData}
            onRecordAnswer={handleRecordAnswer}
            onRecordQuizAttempt={handleRecordQuizAttempt}
            onToggleBookmark={handleToggleBookmark}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            studyData={studyData}
            onSetFlashcardStatus={handleSetFlashcardStatus}
          />
        )}

        {activeTab === 'smart-review' && (
          <SmartReview
            studyData={studyData}
            onRecordAnswer={handleRecordAnswer}
            onRecordQuizAttempt={handleRecordQuizAttempt}
            onToggleBookmark={handleToggleBookmark}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNavigateToFlashcards={() => setActiveTab('flashcards')}
          />
        )}

        {activeTab === 'mock-exam' && (
          <TimedMockExam
            studyData={studyData}
            onRecordAnswer={handleRecordAnswer}
            onRecordQuizAttempt={handleRecordQuizAttempt}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNavigateToQuiz={navigateToQuiz}
          />
        )}

        {activeTab === 'culture-video' && (
          <CultureVideoReview
            studyData={studyData}
            onRecordAnswer={handleRecordAnswer}
            onRecordQuizAttempt={handleRecordQuizAttempt}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'weakness' && (
          <WeaknessAnalysis
            studyData={studyData}
            onNavigateToQuiz={navigateToQuiz}
            onNavigateToSmartReview={() => setActiveTab('smart-review')}
            onNavigateToMockExam={() => setActiveTab('mock-exam')}
          />
        )}

        {activeTab === 'quick-study' && (
          <QuickStudy
            onStartQuiz={() => navigateToQuiz()}
            onNavigateToPrint={() => setActiveTab('print')}
          />
        )}

        {activeTab === 'glossary' && <GlossaryView />}

        {activeTab === 'print' && (
          <PrintableRevisionSheet onBack={() => setActiveTab('quick-study')} />
        )}
      </main>

      {/* Subtle Academic Footer */}
      <footer className="no-print mt-auto border-t border-stone-200/80 bg-[#f5f2eb] py-8 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Nihongo Exam Pro</span>
            <span aria-hidden="true">·</span>
            <span>FL033 Japanese 1 Midterm Course Review</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span>9 Lecture Modules</span>
            <span>·</span>
            <span>224 Scored Questions</span>
            <span>·</span>
            <span>JapanesePod101 Video Review</span>
          </div>

          <div className="text-[11px] text-stone-600">
            Local study persistence · No external API keys required
          </div>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Reset All Progress?
              </h3>
              <p className="text-xs text-stone-500">
                This will reset your study streak, answer statistics, flashcard review intervals, and exam history. This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
