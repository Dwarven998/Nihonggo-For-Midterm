import React, { useState, useMemo } from 'react';
import {
  Youtube,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Question, UserStudyData, QuizAttemptRecord } from '../types';
import { MODULE_9_QUESTIONS } from '../data/questions/module9';
import { soundManager } from '../utils/audio';

interface CultureVideoReviewProps {
  studyData: UserStudyData;
  onRecordAnswer: (questionId: string, isCorrect: boolean) => void;
  onRecordQuizAttempt: (attempt: QuizAttemptRecord) => void;
  onBackToDashboard: () => void;
}

export const CultureVideoReview: React.FC<CultureVideoReviewProps> = ({
  studyData,
  onRecordAnswer,
  onRecordQuizAttempt,
  onBackToDashboard,
}) => {
  // Source filtering: 'all' | 'pdf' | 'video'
  const [sourceFilter, setSourceFilter] = useState<'all' | 'pdf' | 'video'>('all');
  const [activeTab, setActiveTab] = useState<'video-notes' | 'tf-quiz'>('video-notes');

  // Filter questions based on selected source
  const filteredQuestions = useMemo(() => {
    let list = MODULE_9_QUESTIONS;
    if (sourceFilter === 'pdf') {
      list = list.filter((q) => q.sourceType === 'pdf');
    } else if (sourceFilter === 'video') {
      list = list.filter((q) => q.sourceType === 'video');
    }
    return list;
  }, [sourceFilter]);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedOption === null || isSubmitted) return;

    const isCorrect =
      selectedOption.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setIsSubmitted(true);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      soundManager.playCorrectChime(studyData.soundEnabled);
    } else {
      soundManager.playIncorrectChime(studyData.soundEnabled);
    }

    onRecordAnswer(currentQuestion.id, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setQuizCompleted(true);
      const total = filteredQuestions.length;
      const score = correctCount;
      const pct = Math.round((score / total) * 100);

      const record: QuizAttemptRecord = {
        id: `culture-quiz-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'culture-video',
        moduleId: 'module-9',
        score,
        totalQuestions: total,
        percentage: pct,
        timeSpentSeconds: 0,
        correctQuestionIds: [],
        incorrectQuestionIds: [],
      };
      onRecordQuizAttempt(record);
    }
  };

  const handleRestartQuiz = (source: 'all' | 'pdf' | 'video' = sourceFilter) => {
    setSourceFilter(source);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setCorrectCount(0);
    setQuizCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Module Title Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Module 9 · FL033 Lecture & JapanesePod101 Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The Japanese Culture & Video Masterclass
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              Verified cultural concepts from your course slide deck and the official JapanesePod101 curriculum. All examination questions for this module are strictly <strong>True or False</strong>.
            </p>
          </div>

          {/* Toggle between Video Notes and T/F Quiz */}
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('video-notes')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'video-notes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              Video & Study Notes
            </button>
            <button
              onClick={() => setActiveTab('tf-quiz')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tf-quiz'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              True / False Quiz ({MODULE_9_QUESTIONS.length} Qs)
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'video-notes' ? (
        <div className="space-y-8">
          {/* YouTube Video Player Section */}
          <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Learn All about Japanese Culture in 30 Minutes!
                </h2>
              </div>
              <a
                href="https://www.youtube.com/watch?v=0gWyI5g2MX4"
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 16:9 Aspect Ratio Embed */}
            <div className="relative w-full overflow-hidden rounded-xl bg-black pt-[56.25%] shadow-inner">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/0gWyI5g2MX4"
                title="Learn All about Japanese Culture in 30 Minutes - JapanesePod101"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="text-[11px] text-stone-500 italic">
              Channel: Learn Japanese with JapanesePod101.com · Official supplementary reference cited in slide 9 of course material.
            </div>
          </section>

          {/* Structured Cultural Study Notes Grid */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Core Cultural Knowledge Units
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Note 1 */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>01. Greeting Gestures & Bowing</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-sm">
                    Lecture Slide 3
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Ojigi (お辞儀) & Body Language
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  People bow from the waist. The deeper the bow, the more respectful it is. Light head nod for casual street greetings with friends. Hugging or kissing on the cheeks is <strong>NOT</strong> common. Shaking hands is infrequent even in business. Putting palms together in front of the chest is done before meals, <strong>never</strong> when greeting on the street!
                </p>
              </div>

              {/* Note 2 */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>02. Honorific Suffixes (~san, ~sama)</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-sm">
                    Lecture Slides 4–5
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Namae no Yobikata (How to Call Someone)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>~san</strong> is universal: male or female, older or younger, married or unmarried. For Japanese people, use family name + ~san; given names are reserved for family and close friends. Foreigners may use family or given name + ~san. <strong>~kun</strong> is for younger/equal males; <strong>~chan</strong> is for children/close friends; <strong>~sama</strong> is highly polite, used by shop staff for customers.
                </p>
              </div>

              {/* Note 3 */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>03. Business Cards & Residence ID</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-sm">
                    Lecture Slides 6–7
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Meishi Koukan & Zairyuu Kaado
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Meishi (名刺)</strong> exchange is a delicate ritual with strict etiquette; cards represent the person and must be treated with high respect. <strong>Zairyuu kaado (在留カード)</strong> is the legal residence ID for foreigners staying 3+ months. It lists residency status, work permission, and address; foreign residents <strong>must always carry it</strong>.
                </p>
              </div>

              {/* Note 4 */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>04. Dining Etiquette & Chopsticks</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-sm">
                    Lecture Slides 8 & 22
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Oshiburi, Ohiya, and Chopstick Taboos
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Restaurants provide <strong>oshiburi</strong> (wet hand towel) and free tap water (<strong>ohiya</strong>). Crucial Chopstick Taboos: <strong>Awasebashi</strong> (passing food chopstick-to-chopstick) mimics gathering cremated bones; <strong>Tatebashi</strong> (sticking chopsticks vertically in rice) represents funeral incense offerings; <strong>Yosebashi</strong> (pulling bowls with chopsticks) is bad manners.
                </p>
              </div>

              {/* Note 5 */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>05. Train Manners & Visiting Homes</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-sm">
                    Lecture Slides 11–18
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Public Transit & Home Etiquette
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  On crowded trains, say "Sumimasen. Orimasu" to get off. Wear backpacks in front, and do not leak music through headphones. Respect women-only cars (<strong>Josei senyou sharyou</strong>). At home visits: say <strong>Ojama shimasu</strong> upon entering, turn shoes around facing outward at the genkan, and present a gift (<strong>temiyage</strong>).
                </p>
              </div>

              {/* Note 6 */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>06. Seating & Workplace Hierarchy</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-sm">
                    Lecture Slides 25–31
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Kamiza (Honor) vs Shimoza (Lower)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Leaving work ahead: "Osaki ni shitsurei shimasu" → response: "Otsukaresama (deshita)". Kouhai speaks politely to Senpai. <strong>Kamiza (上座)</strong> is the seat of honor: furthest from the door in rooms, <strong>behind the driver</strong> in taxis, and innermost in elevators. <strong>Shimoza (下座)</strong> is near the door or control buttons.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setActiveTab('tf-quiz')}
                className="px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Take Scored True/False Cultural Practice Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      ) : (
        /* True / False Interactive Quiz Mode */
        <div className="space-y-6">
          {/* Source Filter Switcher */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-700" />
              <span className="text-xs font-bold text-slate-900">Source Filter:</span>
            </div>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => handleRestartQuiz('all')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  sourceFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                All Cultural Questions ({MODULE_9_QUESTIONS.length})
              </button>
              <button
                onClick={() => handleRestartQuiz('pdf')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  sourceFilter === 'pdf'
                    ? 'bg-white text-rose-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                Lecture PDF Only (16 Qs)
              </button>
              <button
                onClick={() => handleRestartQuiz('video')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  sourceFilter === 'video'
                    ? 'bg-white text-rose-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                Supplementary Video Only (14 Qs)
              </button>
            </div>
          </div>

          {/* Quiz Completion View */}
          {quizCompleted ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto text-2xl">
                🎎
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Cultural Etiquette Quiz Complete!
              </h2>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {correctCount} / {filteredQuestions.length} (
                {Math.round((correctCount / filteredQuestions.length) * 100)}%)
              </div>
              <div className="flex gap-3 justify-center pt-3">
                <button
                  onClick={() => handleRestartQuiz(sourceFilter)}
                  className="px-5 py-2.5 bg-rose-700 text-white font-bold text-xs rounded-xl"
                >
                  Retry This Cultural Quiz
                </button>
                <button
                  onClick={() => setActiveTab('video-notes')}
                  className="px-5 py-2.5 bg-stone-100 text-slate-800 font-semibold text-xs rounded-xl"
                >
                  Review Video & Notes
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            /* Active T/F Question Card */
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-800">
                    {currentQuestion.sourceType === 'pdf' ? 'Lecture Slide Source' : 'JapanesePod101 Video Source'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{currentQuestion.topic}</span>
                </div>
                <span className="tabular-nums font-semibold text-slate-700">
                  Question {currentIndex + 1} of {filteredQuestions.length}
                </span>
              </div>

              {/* Strict True or False Notice */}
              <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                Exam Format: True or False Only
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQuestion.prompt}
              </h2>

              {/* Exact True / False Choice Buttons */}
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map((choice) => {
                  const isSelected = selectedOption === choice;
                  const isCorrectChoice =
                    choice.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

                  let style =
                    'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-slate-800 font-bold';

                  if (isSelected && !isSubmitted) {
                    style =
                      'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-500';
                  }

                  if (isSubmitted) {
                    if (isCorrectChoice) {
                      style =
                        'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500';
                    } else if (isSelected && !isCorrectChoice) {
                      style =
                        'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-500';
                    } else {
                      style = 'border-stone-200 bg-stone-50 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={choice}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(choice)}
                      className={`p-5 rounded-xl border text-center text-base sm:text-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${style}`}
                    >
                      {choice === 'True' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                      <span>{choice}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Source Citation */}
              {isSubmitted && (
                <div
                  className={`p-4 sm:p-5 rounded-xl border text-xs sm:text-sm space-y-2.5 ${
                    selectedOption?.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/80 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {selectedOption?.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct! The statement is {currentQuestion.correctAnswer}.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect. The correct answer is {currentQuestion.correctAnswer}.</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed text-stone-700">{currentQuestion.explanation}</p>
                  <div className="pt-2 border-t border-black/10 text-[11px] text-stone-500">
                    Source: <strong>{currentQuestion.sourcePdf}</strong> ({currentQuestion.sourceRef})
                  </div>
                </div>
              )}

              {/* Submit or Next */}
              <div className="pt-2 flex justify-end">
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
                    Submit True/False Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex + 1 < filteredQuestions.length ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
