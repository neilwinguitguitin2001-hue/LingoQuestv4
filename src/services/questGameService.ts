import { supabase } from '../lib/supabase';
import type { QuizQuestion } from '../types/lingoquest';

export type QuestPowerUp = 'smart_hint' | 'time_freeze' | 'fifty_fifty' | 'extra_time' | 'second_chance' | 'lesson_peek';
export interface QuestQuestionResponse {
  sessionId: string;
  index: number;
  question: QuizQuestion;
  deadline: string;
}
export interface QuestGradeResponse {
  correct: boolean;
  expired: boolean;
  answer: string;
  explanation: string;
  sourcePage: string;
  balance: number | null;
}
export interface QuestPurchaseResponse {
  balance: number;
  hint?: string;
  reminder?: string;
  remove?: string[];
  seconds?: number;
  retry?: boolean;
}

export async function questGame<T>(action: string, fields: Record<string, unknown> = {}): Promise<T> {
  if (!supabase) throw new Error('Supabase is not configured for this preview.');
  const { data, error } = await supabase.functions.invoke('quest-game', { body: { action, ...fields } });
  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      try { message = (await context.json()).error || message; } catch { /* network response */ }
    }
    throw new Error(message);
  }
  return data as T;
}
