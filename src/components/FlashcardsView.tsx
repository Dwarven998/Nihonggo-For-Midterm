import React, { useState, useMemo } from 'react';
import {
  Shuffle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeftRight,
  BookOpen
} from 'lucide-react';
import { Flashcard, ModuleId, UserStudyData } from '../types';
import { ALL_FLASHCARDS } from '../data/flashcards';
import { MODULES } from '../data/modules';
import { soundManager } from '../utils/audio';

interface FlashcardsViewProps {
  studyData: UserStudyData;
  onSetFlashcardStatus: (cardId: string, known: boolean) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  studyData,
  onSetFlashcardStatus,
}) => {
  const [selectedModule, setSelectedModule] = useState<ModuleId | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'need-practice'>('all');
  const [direction, setDirection] = useState<'jp-to-en' | 'en-to-jp'>('jp-to-en');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  // Deck generation
  const activeDeck = useMemo(() => {
    let list =
      selectedModule === 'all'
        ? ALL_FLASHCARDS
        : ALL_FLASHCARDS.filter((c) => c.moduleId === selectedModule);

    if (filterDifficulty === 'need-practice') {
      list = list.filter((c) => {
        const stat = studyData.flashcardStatus[c.id];
        return stat && !stat.known;
      });
    }

    if (shuffleKey > 0) {
      return [...list].sort(() => Math.random() - 0.5);
    }
    return list;
  }, [selectedModule, filterDifficulty, shuffleKey, studyData]);

  const currentCard: Flashcard | undefined = activeDeck[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeDeck.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    setShuffleKey((prev) => prev + 1);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkStatus = (known: boolean) => {
    if (!currentCard) return;
    onSetFlashcardStatus(currentCard.id, known);
    if (known) {
      soundManager.playCorrectChime(studyData.soundEnabled);
    }
    // Auto advance
    handleNext();
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    soundManager.speakJapanese(text);
  };

  const knownCount = useMemo(() => {
    return activeDeck.filter((c) => studyData.flashcardStatus[c.id]?.known).length;
  }, [activeDeck, studyData]);

  if (activeDeck.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No cards in this deck</h3>
        <p className="text-xs text-stone-500">
          {filterDifficulty === 'need-practice'
            ? 'Great job! You have no cards marked "Need Practice" in this category.'
            : 'Select another module or reset the filter.'}
        </p>
        <button
          onClick={() => {
            setFilterDifficulty('all');
            setCurrentIndex(0);
          }}
          className="px-4 py-2 bg-rose-700 text-white rounded-lg text-xs font-bold"
        >
          View All Flashcards
        </button>
      </div>
    );
  }

  // Determine what is shown on front and back based on direction
  const frontContent = direction === 'jp-to-en' ? currentCard?.front : currentCard?.back;
  const backContent = direction === 'jp-to-en' ? currentCard?.back : currentCard?.front;
  const isJpFront = direction === 'jp-to-en';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Controls Bar */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Module Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="fc-module" className="text-xs font-bold text-slate-900 whitespace-nowrap">
              Deck:
            </label>
            <select
              id="fc-module"
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value as ModuleId | 'all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="text-xs font-semibold bg-stone-50 border border-stone-300 rounded-md px-2 py-1 text-slate-800 cursor-pointer"
            >
              <option value="all">All Modules ({ALL_FLASHCARDS.length} cards)</option>
              {MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDirection(direction === 'jp-to-en' ? 'en-to-jp' : 'jp-to-en');
                setIsFlipped(false);
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="Toggle Flashcard prompt direction"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{direction === 'jp-to-en' ? 'JP → EN' : 'EN → JP'}</span>
            </button>

            <button
              onClick={handleShuffle}
              className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="Shuffle card order"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => {
                setFilterDifficulty(filterDifficulty === 'all' ? 'need-practice' : 'all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterDifficulty === 'need-practice'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'bg-stone-100 text-slate-800 hover:bg-stone-200'
              }`}
            >
              Need Practice
            </button>
          </div>
        </div>

        {/* Counter & Mastered tally */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span>
            Card <strong className="text-slate-900 tabular-nums">{currentIndex + 1}</strong> of{' '}
            <strong className="text-slate-900 tabular-nums">{activeDeck.length}</strong>
          </span>
          <span className="tabular-nums">
            Known in deck: <strong className="text-emerald-700">{knownCount}</strong> / {activeDeck.length}
          </span>
        </div>
      </div>

      {/* The Interactive Flippable Flashcard */}
      {currentCard && (
        <div
          onClick={handleFlip}
          className="relative min-h-[320px] sm:min-h-[360px] bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col justify-between items-center text-center cursor-pointer hover:border-stone-300 transition-all select-none group"
        >
          {/* Card Category Tag */}
          <div className="w-full flex items-center justify-between text-xs text-stone-400">
            <span className="font-semibold text-rose-800">
              {MODULES.find((m) => m.id === currentCard.moduleId)?.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="capitalize">{currentCard.category}</span>
              {isJpFront && (
                <button
                  onClick={(e) => handleSpeak(e, currentCard.front)}
                  className="p-1 rounded-md text-stone-400 hover:text-slate-800 hover:bg-stone-100 transition-colors"
                  title="Pronounce Japanese audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="my-auto py-6 space-y-4">
            {!isFlipped ? (
              <div className="space-y-3">
                <div
                  className={`font-bold tracking-tight text-slate-900 ${
                    isJpFront ? 'font-jp text-3xl sm:text-5xl leading-tight' : 'text-xl sm:text-2xl'
                  }`}
                >
                  {frontContent}
                </div>
                <div className="text-xs text-stone-400">
                  Click anywhere to reveal answer
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                  Answer
                </div>
                <div
                  className={`font-bold text-slate-900 ${
                    !isJpFront ? 'font-jp text-2xl sm:text-4xl text-rose-800' : 'text-xl sm:text-2xl'
                  }`}
                >
                  {backContent}
                </div>
                {currentCard.note && (
                  <p className="text-xs text-stone-600 max-w-md mx-auto pt-2 border-t border-stone-100">
                    {currentCard.note}
                  </p>
                )}
                {!isJpFront && (
                  <button
                    onClick={(e) => handleSpeak(e, currentCard.front)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen pronunciation</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Card Navigation */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-stone-100 text-xs text-stone-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-[11px] text-stone-400">
              {isFlipped ? 'Tap to hide' : 'Tap to flip'}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={currentIndex + 1 === activeDeck.length}
              className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons: Know It vs Need Practice */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleMarkStatus(false)}
          className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-4 h-4 text-amber-700" />
          <span>Need Practice</span>
        </button>
        <button
          onClick={() => handleMarkStatus(true)}
          className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <Check className="w-4 h-4" />
          <span>Know It!</span>
        </button>
      </div>
    </div>
  );
};
