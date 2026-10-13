import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  BookOpen,
  Filter,
  X
} from 'lucide-react';
import { ALL_VOCABULARY } from '../data/vocabulary';
import { MODULES } from '../data/modules';
import { ModuleId } from '../types';
import { soundManager } from '../utils/audio';

export const GlossaryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<ModuleId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    ALL_VOCABULARY.forEach((v) => set.add(v.category));
    return Array.from(set).sort();
  }, []);

  // Filtered vocabulary
  const filteredVocabulary = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ALL_VOCABULARY.filter((item) => {
      // Module filter
      if (selectedModule !== 'all' && item.moduleId !== selectedModule) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Text search
      if (query) {
        const matchJp = item.japanese.toLowerCase().includes(query);
        const matchRomaji = item.romaji.toLowerCase().includes(query);
        const matchEn = item.english.toLowerCase().includes(query);
        const matchNote = item.note?.toLowerCase().includes(query);
        if (!matchJp && !matchRomaji && !matchEn && !matchNote) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedModule, selectedCategory]);

  const handleSpeak = (text: string) => {
    soundManager.speakJapanese(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Title Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Lexicon</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Course Vocabulary & Expressions Glossary
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Search over 150 essential vocabulary words, numbers, expressions, and cultural phrases from your 9 Japanese lecture PDFs with authentic Japanese pronunciation.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Japanese, Romaji, or English meaning (e.g. newspaper, byouin, itadakimasu)..."
            className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-module" className="font-semibold text-stone-600">
              Module:
            </label>
            <select
              id="filter-module"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as ModuleId | 'all')}
              className="bg-stone-50 border border-stone-300 rounded-md px-2 py-1 text-slate-800"
            >
              <option value="all">All Modules</option>
              {MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-cat" className="font-semibold text-stone-600">
              Category:
            </label>
            <select
              id="filter-cat"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-md px-2 py-1 text-slate-800"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <span className="text-stone-500 text-right tabular-nums">
            Showing <strong>{filteredVocabulary.length}</strong> entries
          </span>
        </div>
      </div>

      {/* Vocabulary Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVocabulary.map((item) => {
          const mod = MODULES.find((m) => m.id === item.moduleId);
          return (
            <div
              key={item.id}
              className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs hover:border-stone-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-rose-800">{mod?.title}</span>
                  <span className="bg-stone-100 px-2 py-0.5 rounded-sm text-[10px]">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-jp text-xl font-bold text-slate-900 leading-snug">
                      {item.japanese}
                    </div>
                    <div className="text-xs font-semibold text-stone-500 mt-0.5">
                      {item.romaji}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeak(item.japanese)}
                    className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                    title="Pronounce audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-slate-800 pt-1">
                  {item.english}
                </div>

                {item.note && (
                  <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-100">
                    Note: {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
