import type { QuestPowerUp } from '../services/questGameService';

export const QUEST_MARKET_ITEMS: Array<{ kind: QuestPowerUp; label: string; cost: number; detail: string }> = [
  { kind: 'smart_hint', label: 'Smart Hint', cost: 30, detail: 'Reveal a clue for the current question.' },
  { kind: 'time_freeze', label: 'Time Freeze', cost: 50, detail: 'Pause the question timer for 10 seconds.' },
  { kind: 'fifty_fifty', label: '50/50', cost: 60, detail: 'Remove two incorrect choices when four choices are available.' },
  { kind: 'extra_time', label: 'Extra Time', cost: 40, detail: 'Add 15 seconds to the question timer.' },
  { kind: 'second_chance', label: 'Second Chance', cost: 80, detail: 'Retry one incorrect answer in the same game.' },
  { kind: 'lesson_peek', label: 'Lesson Peek', cost: 20, detail: 'Show a related reminder from this module’s PDF.' },
];
