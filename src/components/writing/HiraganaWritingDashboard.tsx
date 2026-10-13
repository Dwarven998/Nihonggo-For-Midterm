import React, { useState, useMemo } from 'react';
import {
  Edit3,
  Award,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Volume2,
  RotateCcw,
  Search,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers,
  GraduationCap
} from 'lucide-react';
import { HiraganaCharacter, UserStudyData, MasteryStatus, CharacterGroup } from '../../types';
import { HIRAGANA_CHARACTERS } from '../../data/hiraganaStrokes';
import { CharacterLessonModal } from './CharacterLessonModal';
import { soundManager } from '../../utils/audio';

interface HiraganaWritingDashboardProps {
  studyData: UserStudyData;
  onRecordCharacterWriting: (charId: string, isSuccess: boolean, isTracing: boolean, usedHint: boolean) => void;
  onResetWritingProgress: () => void;
  onBackToDashboard: () => void;
}

export const HiraganaWritingDashboard: React.FC<HiraganaWritingDashboardProps> = ({
  studyData,
  onRecordCharacterWriting,
  onResetWritingProgress,
  onBackToDashboard,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<CharacterGroup | 'all' | 'primary'>('primary');
  const [statusFilter, setStatusFilter] = useState<MasteryStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCharacter, setActiveCharacter] = useState<HiraganaCharacter | null>(null);
  const [challengeMode, setChallengeMode] = useState<string | null>(null);

  // Stats calculation
  const totalCharacters = HIRAGANA_CHARACTERS.length;
  const progressMap = studyData.writingProgress || {};

  const stats = useMemo(() => {
    let masteredCount = 0;
    let learningCount = 0;
    let needsPracticeCount = 0;
    let totalAttempts = 0;
    let totalSuccesses = 0;

    HIRAGANA_CHARACTERS.forEach((c) => {
      const p = progressMap[c.id];
      if (p) {
        if (p.status === 'mastered') masteredCount++;
        else if (p.status === 'learning') learningCount++;
        else if (p.status === 'needs-practice') needsPracticeCount++;
        totalAttempts += p.attemptsCount;
        totalSuccesses += p.successfulCount;
      }
    });

    const practicedCount = masteredCount + learningCount + needsPracticeCount;
    const successRate = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 0;

    return {
      totalCharacters,
      practicedCount,
      masteredCount,
      learningCount,
      needsPracticeCount,
      totalAttempts,
      successRate,
    };
  }, [totalCharacters, progressMap]);

  // Filtered characters list
  const filteredCharacters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return HIRAGANA_CHARACTERS.filter((c) => {
      // Group filter
      if (selectedGroup === 'primary' && !c.isCoursePrimary) return false;
      if (selectedGroup !== 'all' && selectedGroup !== 'primary' && c.group !== selectedGroup) return false;

      // Status filter
      const stat = progressMap[c.id];
      const currentStatus: MasteryStatus = stat ? stat.status : 'not-started';
      if (statusFilter !== 'all' && currentStatus !== statusFilter) return false;

      // Search query
      if (q) {
        const matchChar = c.character.includes(q);
        const matchRomaji = c.romaji.toLowerCase().includes(q);
        const matchSub = c.subGroup.toLowerCase().includes(q);
        if (!matchChar && !matchRomaji && !matchSub) return false;
      }

      return true;
    });
  }, [selectedGroup, statusFilter, searchQuery, progressMap]);

  // Weak characters list (needs practice or low success rate)
  const weakCharacters = useMemo(() => {
    return HIRAGANA_CHARACTERS.filter((c) => {
      const p = progressMap[c.id];
      return p && (p.status === 'needs-practice' || (p.attemptsCount > 0 && p.successfulCount / p.attemptsCount < 0.6));
    });
  }, [progressMap]);

  const handleLaunchWeakReview = () => {
    if (weakCharacters.length > 0) {
      setActiveCharacter(weakCharacters[0]);
    } else {
      // Pick first uncompleted character
      const unmastered = HIRAGANA_CHARACTERS.find((c) => progressMap[c.id]?.status !== 'mastered');
      if (unmastered) setActiveCharacter(unmastered);
      else setActiveCharacter(HIRAGANA_CHARACTERS[0]);
    }
  };

  const handleLaunchDailyChallenge = () => {
    const unmasteredPool = HIRAGANA_CHARACTERS.filter((c) => progressMap[c.id]?.status !== 'mastered');
    const pool = unmasteredPool.length > 0 ? unmasteredPool : HIRAGANA_CHARACTERS;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    setActiveCharacter(randomPick);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hero Writing Header */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <Edit3 className="w-4 h-4" />
              <span>Interactive Hiragana Writing Tutor · 筆順練習</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Hiragana Stroke Order & Writing Studio
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Step-by-step stroke animations, guided tracing, and independent memory writing with instant feedback. Practice course primary diacritics (Lesson 1.2), digraphs (Lesson 1.3), sokuon (Lesson 1.4), and foundational Hiragana.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            {weakCharacters.length > 0 && (
              <button
                onClick={handleLaunchWeakReview}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Practice Weak ({weakCharacters.length})</span>
              </button>
            )}
            <button
              onClick={handleLaunchDailyChallenge}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Writing Drill</span>
            </button>
          </div>
        </div>
      </section>

      {/* Writing Progress Overview Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-stone-500 text-xs font-semibold">Total Characters</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {stats.practicedCount} <span className="text-xs text-stone-400 font-normal">/ {stats.totalCharacters}</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Practiced at least once</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-emerald-700 text-xs font-semibold">Characters Mastered</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1 tabular-nums">
            {stats.masteredCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">2+ consecutive successes</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-amber-700 text-xs font-semibold">Needs Practice</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1 tabular-nums">
            {stats.needsPracticeCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Identified review gaps</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-blue-700 text-xs font-semibold">Writing Accuracy</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {stats.successRate}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">{stats.totalAttempts} total written attempts</div>
        </div>
      </section>

      {/* Curriculum Group Tabs & Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedGroup('primary')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedGroup === 'primary'
                  ? 'bg-rose-700 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Course Primary (Diacritics & Digraphs)
            </button>
            <button
              onClick={() => setSelectedGroup('diacritics')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedGroup === 'diacritics'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Dakuten & Handakuten (L1.2)
            </button>
            <button
              onClick={() => setSelectedGroup('digraphs')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedGroup === 'digraphs'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Digraphs (L1.3)
            </button>
            <button
              onClick={() => setSelectedGroup('basic')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedGroup === 'basic'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Foundational Basic Chart
            </button>
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedGroup === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              All Characters
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (e.g. ka, が, kya)..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Sub-status filter buttons */}
        <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-stone-100 overflow-x-auto">
          <span className="text-stone-500 font-semibold mr-1">Status:</span>
          {(['all', 'not-started', 'learning', 'needs-practice', 'mastered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-stone-900 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {st.replace('-', ' ')}
            </button>
          ))}
          <span className="ml-auto text-stone-400 text-[11px] tabular-nums whitespace-nowrap">
            Showing {filteredCharacters.length} cards
          </span>
        </div>
      </div>

      {/* Foundational Note if Basic group selected */}
      {selectedGroup === 'basic' && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-600 flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <span>
            <strong>Note on Course Scope:</strong> The 46 standard basic Hiragana characters are included here as foundational supplementary writing practice to ensure mastery of the core alphabet before tackling the course lecture diacritics and digraphs.
          </span>
        </div>
      )}

      {/* Character Learning Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredCharacters.map((char) => {
          const stat = progressMap[char.id];
          const status = stat ? stat.status : 'not-started';

          let statusBadgeColor = 'bg-stone-100 text-stone-500';
          if (status === 'mastered') statusBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          else if (status === 'learning') statusBadgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
          else if (status === 'needs-practice') statusBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';

          return (
            <button
              key={char.id}
              onClick={() => setActiveCharacter(char)}
              className="bg-white border border-stone-200/90 rounded-2xl p-4 text-center hover:border-rose-400 hover:shadow-sm transition-all group flex flex-col justify-between cursor-pointer"
            >
              {/* Header badge */}
              <div className="w-full flex items-center justify-between text-[10px] text-stone-400">
                <span className="tabular-nums">{char.strokeCount} str</span>
                <span
                  className={`px-1.5 py-0.5 rounded-sm font-semibold border ${statusBadgeColor} capitalize`}
                >
                  {status === 'not-started' ? 'New' : status.replace('-', ' ')}
                </span>
              </div>

              {/* Character Glyph */}
              <div className="my-2.5">
                <div className="font-jp text-4xl sm:text-5xl font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                  {char.character}
                </div>
                <div className="text-xs font-bold text-stone-500 mt-1">
                  {char.romaji}
                </div>
              </div>

              {/* Footer Progress Indicator */}
              <div className="w-full pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="tabular-nums text-stone-600">
                  {stat ? `${stat.successfulCount}/${stat.attemptsCount}` : '0 tries'}
                </span>
                <span className="text-rose-700 font-bold group-hover:translate-x-0.5 transition-transform">
                  Practice →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lesson Modal */}
      {activeCharacter && (
        <CharacterLessonModal
          character={activeCharacter}
          currentStat={progressMap[activeCharacter.id]}
          soundEnabled={studyData.soundEnabled}
          onClose={() => setActiveCharacter(null)}
          onRecordAttempt={(isSuccess, isTracing, usedHint) => {
            onRecordCharacterWriting(activeCharacter.id, isSuccess, isTracing, usedHint);
          }}
        />
      )}
    </div>
  );
};
