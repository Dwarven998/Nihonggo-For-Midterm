import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Volume2,
  VolumeX,
  Flame,
  Menu,
  X,
  RotateCcw,
  Download,
  GraduationCap,
  Layers,
  Sparkles,
  Search,
  Compass,
  Printer,
  FileCheck,
  Edit3
} from 'lucide-react';
import { UserStudyData } from '../types';
import { exportDataAsJson } from '../utils/storage';

export type ActiveTab =
  | 'dashboard'
  | 'quiz'
  | 'writing'
  | 'flashcards'
  | 'smart-review'
  | 'mock-exam'
  | 'weakness'
  | 'quick-study'
  | 'culture-video'
  | 'glossary'
  | 'print';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  studyData: UserStudyData;
  onToggleSound: () => void;
  onRequestReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  studyData,
  onToggleSound,
  onRequestReset,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quiz', label: 'Practice Quiz', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'writing', label: 'Write Hiragana', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'mock-exam', label: 'Mock Exam', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'smart-review', label: 'Smart Review', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'quick-study', label: 'Quick Study', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'culture-video', label: 'Culture & Video', icon: <Compass className="w-4 h-4" /> },
    { id: 'weakness', label: 'Analysis', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'glossary', label: 'Glossary', icon: <Search className="w-4 h-4" /> },
    { id: 'print', label: 'Print Sheet', icon: <Printer className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-700 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-rose-800 transition-colors">
              日
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-tight whitespace-nowrap">
                Nihongo Exam Pro
              </span>
              <span className="text-[11px] text-stone-500 font-medium whitespace-nowrap hidden sm:block">
                Japanese Midterm Mastery
              </span>
            </div>
          </button>

          {/* Zone 2: Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-stone-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Streak */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold"
              title="Consecutive daily study streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="tabular-nums">{studyData.streakCount}d</span>
            </div>

            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              aria-label={studyData.soundEnabled ? 'Mute audio' : 'Unmute audio'}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
              title={studyData.soundEnabled ? 'Sound effects enabled' : 'Sound effects muted'}
            >
              {studyData.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {/* Export data */}
            <button
              onClick={() => exportDataAsJson(studyData)}
              aria-label="Export study progress"
              className="hidden sm:flex p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="Export progress backup (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset data */}
            <button
              onClick={onRequestReset}
              aria-label="Reset all progress"
              className="hidden sm:flex p-2 text-slate-500 hover:text-rose-700 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
              title="Reset progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNavClick('mock-exam')}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Take Mock Exam
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="xl:hidden p-2 text-slate-700 hover:text-slate-900 rounded-md hover:bg-stone-200/60 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-stone-200 bg-[#faf8f5] px-4 pt-3 pb-6 space-y-1 shadow-lg max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => handleNavClick('mock-exam')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-rose-700 text-white font-bold text-xs"
            >
              <FileCheck className="w-4 h-4" />
              Mock Exam
            </button>
            <button
              onClick={() => handleNavClick('smart-review')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs"
            >
              <Sparkles className="w-4 h-4" />
              Smart Review
            </button>
          </div>

          <div className="border-t border-stone-200 pt-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-rose-100/70 text-rose-900 font-bold'
                    : 'text-slate-700 hover:bg-stone-200/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-3 flex items-center justify-between text-xs text-stone-500">
            <button
              onClick={() => {
                exportDataAsJson(studyData);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 hover:text-slate-900 p-1"
            >
              <Download className="w-4 h-4" />
              Export Progress
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestReset();
              }}
              className="flex items-center gap-1.5 hover:text-rose-700 p-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Progress
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
