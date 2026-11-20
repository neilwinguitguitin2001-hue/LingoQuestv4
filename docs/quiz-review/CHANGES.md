# Quiz graphics and question variety review

## Changed
- Picture Hunt: four distinct same-module choices, including Easy; answer IDs and correct answers retained. Distractors vary by question instead of reusing the first anchors. Server shuffles answer order as before.
- Added Inspect pictures: enlarged comparison viewer, previous/next buttons and arrow keys. Inspection does not submit an answer, reveal correctness, or stop the timer. Removed 50/50 choices are excluded from inspection.
- Unmapped terms use readable neutral word cards rather than unrelated generic art. Recognized terms retain colored illustrations; answer cards respond to hover and keyboard focus with reduced-motion support.
- Existing labeled question diagrams support selecting their already-visible labels. No new hint is revealed.
- Server and faculty simulations deduplicate exact normalized clues. Full Quest Mix keeps two tasks per mode and distinct learning targets. Single-mode games require 10 distinct verified clues.

## Shared database, authorized by user
- Applied distinct_quiz_sessions_and_module_picture_choices.
- 4,683 Picture Hunt questions audited; 4,673 now have four choices. Ten questions belonging to recently unfinished sessions were deferred to preserve existing games. Re-run scripts/sql/quiz-choice-variety.sql after those sessions complete or age past one day.
- Correct answer/source preservation checked in a rolled-back trial: zero changed answers or references.
- All 4,683 Picture Hunt rows retain a valid correct choice and unique choice labels.
- 180 rollback-only session starts passed across six modes and three difficulties for Grade 7 Q1 Module 1: 10 items, distinct clues, and no repeated learning target in Full Quest Mix. No test sessions/rewards retained.
- Direct authenticated execution of quest_start remains denied; existing authenticated Edge Function and lesson-completion trigger remain in place.

## Source gaps
There are 231 single-mode/difficulty pools across 23 modules with fewer than ten distinct clues. Picture Hunt accounts for 42 pools. See insufficient-question-pools.csv. Those single-mode games now report source review instead of silently repeating questions; mixed mode can still play when each mode supplies its required two distinct items. This update does not fabricate more questions or claim a full pedagogical review of every source excerpt.

## Preserved
10 questions per session, game names, existing answer submission, timers, difficulty-specific clues, server grading, coins, XP, badges, accounts, saved progress, and bridge rules. Existing accepted answer terms unchanged. Choices are reviewed-source module terms; no outside educational examples added.

## Validation
TypeScript and build pass. Four automated regression checks cover all 106 module banks, unique supported choices, distractor variety, truthful unmapped graphics, and inspection accessibility. Browser testing recorded in the PR.

## Files
src/components/QuizConceptCard.tsx; src/components/QuizPictureInspector.tsx; src/components/LessonAndQuizView.tsx; src/data/curriculum/tieredQuestions.ts; src/utils/sourceGameSession.ts; tests/quiz-variety.test.tsx; scripts/sql/quiz-choice-variety.sql; scripts/sql/quiz-distinct-sessions.sql; this review and its CSV.

