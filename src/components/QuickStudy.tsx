import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Table,
  Layers,
  Printer
} from 'lucide-react';
import { CHEATSHEETS } from '../data/cheatsheets';

interface QuickStudyProps {
  onStartQuiz: () => void;
  onNavigateToPrint: () => void;
}

export const QuickStudy: React.FC<QuickStudyProps> = ({
  onStartQuiz,
  onNavigateToPrint,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState<string>('cs-diacritics');
  const [cramMode, setCramMode] = useState<'standard' | '5-minute'>('standard');

  const activeSheet = CHEATSHEETS.find((cs) => cs.id === selectedSheetId) || CHEATSHEETS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>High-Yield Rapid Cramming Mode</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Quick Study & Pre-Exam Revision Sheets
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Concise summaries, transformation matrices, and common midterm exam traps distilled from the 9 lecture PDFs.
            </p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={() => setCramMode(cramMode === 'standard' ? '5-minute' : 'standard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                cramMode === '5-minute'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-100 text-slate-800 hover:bg-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{cramMode === '5-minute' ? '5-Min Fast Cram Active' : 'Switch to 5-Min Cram'}</span>
            </button>

            <button
              onClick={onNavigateToPrint}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Printable PDF Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {cramMode === '5-minute' ? (
        /* 5-Minute Emergency Cram View */
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-base">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>The 5-Minute Midterm Cheat Sheet (Top 10 Exam Invariants)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">1. Ten-ten & Maru:</span>
              <p className="text-stone-700 leading-relaxed">
                Placed strictly in <strong>top-right corner</strong>. K→G, S→Z, T→D, H→B. H-row with maru (circle) becomes <strong>P</strong>. ぢ and づ are almost never used except はなぢ (hanaji) and つづく (tsudzuku).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">2. Character ん:</span>
              <p className="text-stone-700 leading-relaxed">
                Pronounced <strong>[m]</strong> before m, p, b (sanmai→sammai, senpai→sempai, shinbun→shimbun, tenpura). Pronounced <strong>[ng]</strong> before k, g, w (ginkou→gingkou, denwa→dengwa).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">3. Sokuon Distinctions:</span>
              <p className="text-stone-700 leading-relaxed">
                Small tsu (っ) doubles the consonant. Remember: <strong>きっぷ (kippu) = ticket</strong>, but <strong>きって (kitte) = postage stamps</strong>!
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">4. Irregular Hundreds:</span>
              <p className="text-stone-700 leading-relaxed">
                300 = <strong>sanbyaku</strong> (byaku). 600 = <strong>roppyaku</strong> (pp). 800 = <strong>happyaku</strong> (pp).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">5. Irregular Thousands:</span>
              <p className="text-stone-700 leading-relaxed">
                3,000 = <strong>sanzen</strong> (zen). 8,000 = <strong>hassen</strong> (double s).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">6. Four-Digit Counting:</span>
              <p className="text-stone-700 leading-relaxed">
                Slice digits into groups of <strong>FOUR</strong> from right: 10,000 is <strong>man</strong>, 100,000,000 is <strong>oku</strong>. 51,181 = 5 (man) | 1181 = <em>go man issen hyaku hachijuu ichi</em>.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">7. Copula 4-Box Matrix:</span>
              <p className="text-stone-700 leading-relaxed">
                Affirmative: <strong>desu</strong> · Negative: <strong>ja arimasen</strong> (formal: dewa arimasen) · Past: <strong>deshita</strong> · Past Negative: <strong>ja arimasen deshita</strong>.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">8. Particle mo Rule:</span>
              <p className="text-stone-700 leading-relaxed">
                Particle <strong>mo (も)</strong> REPLACES particle wa. Never write "wa mo"! E.g. "Tanaka san <strong>mo</strong> Nihonjin desu."
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">9. Particle no & Phone Dashes:</span>
              <p className="text-stone-700 leading-relaxed">
                Possession (Akira san no tomodachi), affiliation (CIT no sensei), origin (Nihon no tabemono), and the dash in phone numbers (272-1416 = <em>ni nana ni <strong>no</strong> ichi yon ichi roku</em>).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5 shadow-xs">
              <span className="font-extrabold text-rose-800">10. Culture True/False Rules:</span>
              <p className="text-stone-700 leading-relaxed">
                Chopstick taboos: Awasebashi (passing food chopstick-to-chopstick) & Tatebashi (standing upright in rice) are strictly prohibited. Kamiza (seat of honor) is furthest from door; in a taxi, it is <strong>behind the driver</strong>!
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => setCramMode('standard')}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Back to Detailed Cheatsheets
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Tabbed Cheatsheets */
        <div className="space-y-6">
          {/* Navigation Pill Strip */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CHEATSHEETS.map((cs) => (
              <button
                key={cs.id}
                onClick={() => setSelectedSheetId(cs.id)}
                className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSheetId === cs.id
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {cs.title.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Active Cheat Sheet Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs text-stone-500 font-semibold">{activeSheet.sourceLabel}</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {activeSheet.title}
              </h2>
              <div className="text-xs text-stone-500 font-jp font-medium">
                {activeSheet.japaneseTitle}
              </div>
            </div>

            {/* High-Yield Points */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>High-Yield Exam Invariants</span>
              </h3>
              <ul className="space-y-2">
                {activeSheet.highYieldPoints.map((pt, i) => (
                  <li key={i} className="text-xs sm:text-sm text-stone-700 flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Table if present */}
            {activeSheet.tables && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-stone-500" />
                  <span>Reference Matrix</span>
                </h3>
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                      <tr>
                        {activeSheet.tables.header.map((h, idx) => (
                          <th key={idx} className="p-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {activeSheet.tables.rows.map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-stone-50/50">
                          {r.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-slate-800">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Exam Traps & Pitfalls */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 sm:p-5 space-y-2">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Exam Traps & Pitfalls to Avoid</span>
              </h3>
              <ul className="space-y-1.5">
                {activeSheet.examTraps.map((trap, i) => (
                  <li key={i} className="text-xs text-rose-950 flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">⚠</span>
                    <span className="leading-relaxed">{trap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
