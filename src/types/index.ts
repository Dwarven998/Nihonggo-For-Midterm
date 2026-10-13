export type ModuleId =
  | 'module-1'
  | 'module-2'
  | 'module-3'
  | 'module-4'
  | 'module-5'
  | 'module-6'
  | 'module-7'
  | 'module-8'
  | 'module-9';

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-in-blank'
  | 'particle-select'
  | 'dialogue-comprehension'
  | 'matching';

export type SourceType = 'pdf' | 'video';

export interface Question {
  id: string;
  moduleId: ModuleId;
  topic: string;
  questionType: QuestionType;
  prompt: string;
  instruction?: string;
  japaneseContext?: string;
  options: string[]; // For true-false, strictly ['True', 'False']
  correctAnswer: string; // The exact option string or text answer
  explanation: string;
  sourcePdf: string;
  sourceRef: string; // e.g. "Slide 4" or "Video 12:40"
  sourceType: SourceType;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface ModuleInfo {
  id: ModuleId;
  title: string;
  japaneseTitle: string;
  sourcePdfName: string;
  description: string;
  category: 'Writing & Phonetics' | 'Communication' | 'Grammar' | 'Culture';
  iconName: string;
  topics: string[];
  totalQuestionsCount: number;
}

export interface Flashcard {
  id: string;
  moduleId: ModuleId;
  front: string; // e.g. "きゃ" or "Ohayou gozaimasu"
  back: string; // e.g. "kya (digraph: ki + small ya)" or "Good morning"
  pronunciation?: string;
  note?: string;
  exampleSentence?: string;
  category: 'character' | 'vocabulary' | 'expression' | 'grammar';
}

export interface QuizAttemptRecord {
  id: string;
  timestamp: number;
  mode: 'practice' | 'mock-exam' | 'smart-review' | 'culture-video';
  moduleId?: ModuleId | 'all';
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  incorrectQuestionIds: string[];
  correctQuestionIds: string[];
}

export type CharacterGroup = 'basic' | 'diacritics' | 'digraphs' | 'sokuon';

export type MasteryStatus = 'not-started' | 'learning' | 'needs-practice' | 'mastered';

export interface CharacterStroke {
  order: number;
  path: string; // SVG path data (viewBox 0 0 100 100)
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  directionTip: string;
}

export interface HiraganaCharacter {
  id: string;
  character: string;
  romaji: string;
  group: CharacterGroup;
  subGroup: string; // e.g. "Vowels", "Ka-row", "Dakuten Ga-row", "Digraphs (Kya-row)"
  strokeCount: number;
  writingTip: string;
  soundGuide: string;
  isCoursePrimary: boolean; // true for Lesson 1.2/1.3/1.4/1.5 characters; false for foundational basic chart
  strokes: CharacterStroke[];
}

export interface CharacterWritingStat {
  status: MasteryStatus;
  attemptsCount: number;
  successfulCount: number;
  tracingCompleted: boolean;
  lastAttemptDate: number;
  consecutiveSuccesses: number;
  hintsUsedCount: number;
}

export interface UserStudyData {
  version: number;
  streakCount: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  questionStats: Record<
    string,
    {
      attempts: number;
      correct: number;
      lastAttempted: number;
      lastResult: boolean;
      spacedRepetitionInterval: number; // in days
      nextReviewDate: number; // timestamp
    }
  >;
  flashcardStatus: Record<
    string,
    {
      known: boolean;
      reviewCount: number;
      lastReviewed: number;
    }
  >;
  bookmarkedQuestionIds: string[];
  quizHistory: QuizAttemptRecord[];
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  writingProgress: Record<string, CharacterWritingStat>;
}

export interface ExamConfig {
  questionCount: number;
  durationMinutes: number;
  selectedModules: ModuleId[];
}

export interface VocabularyItem {
  id: string;
  japanese: string;
  romaji: string;
  english: string;
  moduleId: ModuleId;
  category: string;
  example?: string;
  exampleEnglish?: string;
  note?: string;
}

