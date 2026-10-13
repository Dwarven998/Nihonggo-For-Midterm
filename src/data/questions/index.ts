import { Question, ModuleId } from '../../types';
import { MODULE_1_QUESTIONS } from './module1';
import { MODULE_2_QUESTIONS } from './module2';
import { MODULE_3_QUESTIONS } from './module3';
import { MODULE_4_QUESTIONS } from './module4';
import { MODULE_5_QUESTIONS } from './module5';
import { MODULE_6_QUESTIONS } from './module6';
import { MODULE_7_QUESTIONS } from './module7';
import { MODULE_8_QUESTIONS } from './module8';
import { MODULE_9_QUESTIONS } from './module9';

export const ALL_QUESTIONS: Question[] = [
  ...MODULE_1_QUESTIONS,
  ...MODULE_2_QUESTIONS,
  ...MODULE_3_QUESTIONS,
  ...MODULE_4_QUESTIONS,
  ...MODULE_5_QUESTIONS,
  ...MODULE_6_QUESTIONS,
  ...MODULE_7_QUESTIONS,
  ...MODULE_8_QUESTIONS,
  ...MODULE_9_QUESTIONS,
];

export const QUESTIONS_BY_MODULE: Record<ModuleId, Question[]> = {
  'module-1': MODULE_1_QUESTIONS,
  'module-2': MODULE_2_QUESTIONS,
  'module-3': MODULE_3_QUESTIONS,
  'module-4': MODULE_4_QUESTIONS,
  'module-5': MODULE_5_QUESTIONS,
  'module-6': MODULE_6_QUESTIONS,
  'module-7': MODULE_7_QUESTIONS,
  'module-8': MODULE_8_QUESTIONS,
  'module-9': MODULE_9_QUESTIONS,
};

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsForModule(moduleId: ModuleId): Question[] {
  return QUESTIONS_BY_MODULE[moduleId] || [];
}

export function getRandomQuestions(count: number, moduleFilter?: ModuleId | 'all'): Question[] {
  const pool = moduleFilter && moduleFilter !== 'all' ? QUESTIONS_BY_MODULE[moduleFilter] : ALL_QUESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
