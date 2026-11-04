import type { DifficultyLevel, Module, QuizGameType, QuizQuestion } from '../types/lingoquest';
export const GAME_QUESTION_COUNT = 5;
export const SOURCE_GAME_MODES: QuizGameType[] = ['analogyMaster', 'missingPiece', 'crosswordGame', 'pictureHunt', 'typeHunter'];

function shuffled<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createSourceGameSession(module: Module, bank: QuizQuestion[], mode: QuizGameType | 'all', difficulty: DifficultyLevel, random = Math.random): QuizQuestion[] | null {
  const valid = bank.filter((q) => module.pdfLesson && q.source && q.source.fileId === module.pdfLesson.source.fileId &&
    q.source.page >= 1 && q.source.page <= (module.pdfLesson?.source.pageCount || 0) &&
    q.source.quote && q.source.answerQuote && q.answer);
  const unique = (items: QuizQuestion[]) => [...new Map(items.map((q) => [q.source!.sourceId, q])).values()];
  let selected: QuizQuestion[];
  if (mode === 'all') {
    if (SOURCE_GAME_MODES.some((type) => !valid.some((q) => q.type === type))) return null;
    // Search for one distinct source item per existing mode, never borrow/pad.
    function choose(index: number, used: Set<string>, result: QuizQuestion[]): QuizQuestion[] | null {
      if (index === SOURCE_GAME_MODES.length) return result;
      for (const q of shuffled(unique(valid.filter((x) => x.type === SOURCE_GAME_MODES[index])), random)) {
        if (used.has(q.source!.sourceId)) continue;
        const next = choose(index + 1, new Set([...used, q.source!.sourceId]), [...result, q]);
        if (next) return next;
      }
      return null;
    }
    const mixed = choose(0, new Set(), []);
    if (!mixed) return null;
    selected = shuffled(mixed, random);
  } else {
    const pool = unique(valid.filter((q) => q.type === mode));
    if (pool.length < GAME_QUESTION_COUNT) return null;
    selected = shuffled(pool, random).slice(0, GAME_QUESTION_COUNT);
  }
  if (selected.length !== GAME_QUESTION_COUNT || new Set(selected.map((q) => q.source!.sourceId)).size !== GAME_QUESTION_COUNT) return null;
  return selected.map((q) => ({ ...q, options: q.options ? shuffled(q.options, random) : undefined, difficulty, timeLimitSeconds: difficulty === 'easy' ? 45 : difficulty === 'moderate' ? 30 : 20 }));
}
