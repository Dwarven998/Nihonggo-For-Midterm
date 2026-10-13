import { UserStudyData, QuizAttemptRecord } from '../types';

const STORAGE_KEY = 'nihongo_midterm_mastery_v1';

export function getDefaultStudyData(): UserStudyData {
  return {
    version: 1,
    streakCount: 0,
    lastStudyDate: '',
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    questionStats: {},
    flashcardStatus: {},
    bookmarkedQuestionIds: [],
    quizHistory: [],
    soundEnabled: true,
    theme: 'light',
    writingProgress: {},
  };
}

export function loadStudyData(): UserStudyData {
  if (typeof window === 'undefined') return getDefaultStudyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStudyData();
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultStudyData(),
      ...parsed,
    };
  } catch (e) {
    console.error('Failed to parse study progress from localStorage, initializing fresh data', e);
    return getDefaultStudyData();
  }
}

export function saveStudyData(data: UserStudyData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist study progress to localStorage', e);
  }
}

export function updateStreak(data: UserStudyData): UserStudyData {
  const today = new Date().toISOString().split('T')[0];
  if (data.lastStudyDate === today) {
    return data;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = data.streakCount;

  if (data.lastStudyDate === yesterday) {
    newStreak += 1;
  } else if (!data.lastStudyDate) {
    newStreak = 1;
  } else {
    // Missed at least one day
    newStreak = 1;
  }

  const updated: UserStudyData = {
    ...data,
    streakCount: newStreak,
    lastStudyDate: today,
  };
  saveStudyData(updated);
  return updated;
}

export function recordQuestionAnswer(
  data: UserStudyData,
  questionId: string,
  isCorrect: boolean
): UserStudyData {
  const current = data.questionStats[questionId] || {
    attempts: 0,
    correct: 0,
    lastAttempted: 0,
    lastResult: false,
    spacedRepetitionInterval: 1,
    nextReviewDate: 0,
  };

  const newAttempts = current.attempts + 1;
  const newCorrect = current.correct + (isCorrect ? 1 : 0);
  const now = Date.now();

  // Spaced repetition interval in days
  let newInterval = current.spacedRepetitionInterval || 1;
  if (isCorrect) {
    newInterval = Math.min(newInterval * 2, 21); // 1, 2, 4, 8, 16, 21 days
  } else {
    newInterval = 1; // reset on incorrect
  }
  const nextReview = now + newInterval * 24 * 60 * 60 * 1000;

  const updatedData: UserStudyData = {
    ...data,
    totalQuestionsAnswered: data.totalQuestionsAnswered + 1,
    totalCorrectAnswers: data.totalCorrectAnswers + (isCorrect ? 1 : 0),
    questionStats: {
      ...data.questionStats,
      [questionId]: {
        attempts: newAttempts,
        correct: newCorrect,
        lastAttempted: now,
        lastResult: isCorrect,
        spacedRepetitionInterval: newInterval,
        nextReviewDate: nextReview,
      },
    },
  };

  const withStreak = updateStreak(updatedData);
  saveStudyData(withStreak);
  return withStreak;
}

export function recordQuizAttempt(
  data: UserStudyData,
  attempt: QuizAttemptRecord
): UserStudyData {
  const updated: UserStudyData = {
    ...data,
    quizHistory: [attempt, ...data.quizHistory].slice(0, 50), // keep latest 50 attempts
  };
  saveStudyData(updated);
  return updated;
}

export function toggleQuestionBookmark(
  data: UserStudyData,
  questionId: string
): UserStudyData {
  const exists = data.bookmarkedQuestionIds.includes(questionId);
  const updatedIds = exists
    ? data.bookmarkedQuestionIds.filter((id) => id !== questionId)
    : [...data.bookmarkedQuestionIds, questionId];

  const updated: UserStudyData = {
    ...data,
    bookmarkedQuestionIds: updatedIds,
  };
  saveStudyData(updated);
  return updated;
}

export function setFlashcardStatus(
  data: UserStudyData,
  cardId: string,
  known: boolean
): UserStudyData {
  const current = data.flashcardStatus[cardId] || {
    known: false,
    reviewCount: 0,
    lastReviewed: 0,
  };

  const updated: UserStudyData = {
    ...data,
    flashcardStatus: {
      ...data.flashcardStatus,
      [cardId]: {
        known,
        reviewCount: current.reviewCount + 1,
        lastReviewed: Date.now(),
      },
    },
  };
  const withStreak = updateStreak(updated);
  saveStudyData(withStreak);
  return withStreak;
}

export function recordCharacterWriting(
  data: UserStudyData,
  charId: string,
  isSuccess: boolean,
  isTracing: boolean,
  usedHint: boolean
): UserStudyData {
  const current = data.writingProgress[charId] || {
    status: 'not-started',
    attemptsCount: 0,
    successfulCount: 0,
    tracingCompleted: false,
    lastAttemptDate: 0,
    consecutiveSuccesses: 0,
    hintsUsedCount: 0,
  };

  const newAttempts = current.attemptsCount + 1;
  const newSuccessCount = current.successfulCount + (isSuccess ? 1 : 0);
  const newConsecutive = isSuccess ? current.consecutiveSuccesses + 1 : 0;
  const newHints = current.hintsUsedCount + (usedHint ? 1 : 0);
  const now = Date.now();

  let newStatus = current.status;
  if (isTracing) {
    if (newStatus === 'not-started') newStatus = 'learning';
  } else {
    // Independent writing criteria:
    // At least 2 consecutive successes without hint = 'mastered'
    if (isSuccess && newConsecutive >= 2 && !usedHint) {
      newStatus = 'mastered';
    } else if (isSuccess) {
      newStatus = 'learning';
    } else {
      newStatus = 'needs-practice';
    }
  }

  const updated: UserStudyData = {
    ...data,
    writingProgress: {
      ...data.writingProgress,
      [charId]: {
        status: newStatus,
        attemptsCount: newAttempts,
        successfulCount: newSuccessCount,
        tracingCompleted: current.tracingCompleted || isTracing,
        lastAttemptDate: now,
        consecutiveSuccesses: newConsecutive,
        hintsUsedCount: newHints,
      },
    },
  };

  const withStreak = updateStreak(updated);
  saveStudyData(withStreak);
  return withStreak;
}

export function resetWritingProgress(data: UserStudyData): UserStudyData {
  const updated: UserStudyData = {
    ...data,
    writingProgress: {},
  };
  saveStudyData(updated);
  return updated;
}

export function clearAllProgress(): UserStudyData {
  const fresh = getDefaultStudyData();
  saveStudyData(fresh);
  return fresh;
}

export function exportDataAsJson(data: UserStudyData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nihongo_exam_progress_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDataFromJson(jsonString: string): UserStudyData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed.version === 'number') {
      const merged = { ...getDefaultStudyData(), ...parsed };
      saveStudyData(merged);
      return merged;
    }
  } catch (e) {
    console.error('Invalid JSON import', e);
  }
  return null;
}
