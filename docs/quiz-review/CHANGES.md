# Quiz graphics and question variety review

## Changed
- Picture Hunt: four distinct same-module choices, including Easy; answer IDs and correct answers retained. Distractors vary by question instead of reusing the first anchors. Server shuffles answer order as before.
- Added Inspect pictures: enlarged comparison viewer, previous/next buttons and arrow keys. Inspection does not submit an answer, reveal correctness, or stop the timer. Removed 50/50 choices are excluded from inspection.
- Unmapped terms use readable neutral word cards rather than unrelated generic art. Recognized terms retain colored illustrations; answer cards respond to hover and keyboard focus with reduced-motion support.
- Existing labeled question diagrams support selecting their already-visible labels. No new hint is revealed.
- Server and faculty simulations deduplicate exact normalized clues. Full Quest Mix keeps two tasks per mode and distinct learning targets. Single-mode games require 10 distinct verified clues.

## Shared database, authorized by user
- Applied distinct_quiz_sessions_and_module_picture_choices.
- All 4,683 Picture Hunt questions now have four choices. Ten questions were initially deferred for active sessions; inspection confirmed those sessions belonged only to the supplied Grade 7 demo account, so their choice data was also completed. No other students’ active games were changed.
- Correct answer/source preservation checked in a rolled-back trial: zero changed answers or references.
- All 4,683 Picture Hunt rows retain a valid correct choice and unique choice labels.
- 180 rollback-only session starts passed across six modes and three difficulties for Grade 7 Q1 Module 1: 10 items, distinct clues, and no repeated learning target in Full Quest Mix. No test sessions/rewards retained.
- Direct authenticated execution of quest_start remains denied; existing authenticated Edge Function and lesson-completion trigger remain in place.

## Source gaps
There are 231 single-mode/difficulty pools across 23 modules with fewer than ten distinct clues. Picture Hunt accounts for 42 pools. See insufficient-question-pools.csv. Those single-mode games now report source review instead of silently repeating questions; mixed mode can still play when each mode supplies its required two distinct items. This update does not fabricate more questions or claim a full pedagogical review of every source excerpt.

## Preserved
10 questions per session, game names, existing answer submission, timers, difficulty-specific clues, server grading, coins, XP, badges, accounts, saved progress, and bridge rules. Existing accepted answer terms unchanged. Choices are reviewed-source module terms; no outside educational examples added.

## Validation
TypeScript and build pass. Five automated regression checks cover all 106 module banks, unique supported choices, distractor variety, truthful unmapped graphics, and inspection accessibility. Browser verified Grade 7 student sign-in, four rendered choices, enlarged inspection, button/arrow-key navigation, timer continuity and next-question behavior. Inspector at 390px: 352px dialog, no horizontal overflow. Scored picture-selection test confirmed server feedback.

## Files
src/components/QuizConceptCard.tsx; src/components/QuizPictureInspector.tsx; src/components/LessonAndQuizView.tsx; src/data/curriculum/tieredQuestions.ts; src/utils/sourceGameSession.ts; tests/quiz-variety.test.tsx; scripts/sql/quiz-choice-variety.sql; scripts/sql/quiz-distinct-sessions.sql; this review and its CSV.


## Further content review
Some inherited completion questions target incidental prose words (for example, “correct”) rather than substantive concepts. These were not silently reauthored or presented as newly verified teaching questions. A full PDF-by-PDF question-authoring pass is still required to replace those items and fill the distinct-clue gaps.
