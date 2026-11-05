# Tiered quiz catalogue

106 modules × 5 modes × 3 difficulties × 5 tasks = 7,950 question records. Each mode has 15 tasks per module, split 5 Easy / 5 Medium / 5 Hard. Single-mode sessions play the selected level's five tasks. Full Quest Mix plays 15 tasks at the selected difficulty: three from each mode, in randomized order.

## Educational design and provenance

The catalogue uses 530 source-backed target expressions (five per module). Targets recur across modes and difficulty variants for retrieval practice. A full mix revisits each target with three different game mechanics; it contains 15 distinct question IDs. The count describes task variants, not 7,950 separate source concepts.

All 530 evidence quotations match native text on their own original PDF page. The authoring pipeline verifies the original PDF SHA-256, file ID, page and literal answer spans. Author-selected module-specific target lists constrain extraction; arbitrary global keyword mining is not used. No external facts, generated answer-key guesses, cross-module questions, incorrect assertions presented as facts, or unrelated regional examples are introduced. Distractors are alternative target expressions from the same module. Prompts explicitly ask for the source wording, avoiding ambiguous synonym grading.

Master Quiz uses reverse clue matching (given expression → source excerpt) for every topic; its legacy internal key remains analogyMaster so stored progress remains compatible. Missing Piece uses cloze reconstruction. Hunter requires typing. Crossword uses source terms in a letter grid (including multiword entries). Picture & Concept Hunt uses colorful selectable word diagrams for abstract language topics. It does not attach unrelated photographs. Any retained original source image/graphic is rendered in its existing colors; no guessed real-world recoloring is applied.

## Difficulty

| Level | Scaffolding | Time | Base XP per correct response |
|---|---|---:|---:|
| Easy | First-letter hints; two choices; supported crossword letters | 60s | 100 |
| Medium (moderate internally) | Four choices or independent typing; only first crossword letter supplied | 60s | 150 |
| Hard | Two numbered gaps for reconstruction modes; independent crossword with no given letters | 90s | 200 |

Hard two-gap answers use the ordered format `first expression / second expression`. Longer time supports the added reading/typing load. This is a scaffolding-based difficulty model; learner trials are still needed to calibrate empirical item difficulty. Source-completion tasks assess recognition and retrieval. Teacher-authored application or inference questions can be added later with separate evidence review.

## Runtime and preservation

A compact target catalogue and deterministic factory produce the full bank; the app does not embed thousands of duplicated source quotations in its JavaScript. Lesson text, tables, diagrams and inline artwork are bundled in 16 grade/quarter batches and verified by source file ID and PDF SHA-256. There is no per-module JSON request at runtime. Larger external figure files remain image assets. Quiz launch uses its own verified compiled bank and does not wait for illustration downloads. Difficulty filters use actual authored tiers and never relabel Easy questions as Hard. Fisher–Yates shuffling randomizes questions, text alternatives and concept cards without mutating stored banks. The same five targets are deliberately practiced across different modes in a mix.

Completion guards accept exactly five answers for a single mode and exactly fifteen for a mix. The existing scoring formula, capped speed bonus, passing threshold, XP/badge callbacks and progress handlers remain. Auth, accounts, database schema, environment variables, deployment settings and lesson-only content remain unchanged. The setup's old source-review placeholder is removed; genuine loading failures produce a retry message and prevent incomplete sessions.

## Verification

- 106 modules; 530 literal source quotations; 7,950 tasks.
- 1,590 single-mode/difficulty combinations and 318 mixed-mode/difficulty combinations pass.
- 38,160 seeded sessions verify counts, balanced mode coverage, no repeated question IDs, answer preservation, difficulty isolation, no bank mutation and rejection of truncated banks.
- Discussion-only lesson and no-external-PDF-link regressions still pass.
- `npm run build` passes. Type checking reports two existing errors in unchanged AuthContext.tsx, lines 385 and 447.

Rebuild: `python3 scripts/build-tiered-game-banks.py`, `node --import tsx scripts/compile-tiered-games.ts`. Validate with `node --import tsx scripts/check-pdf-bindings.tsx` and `node --import tsx scripts/check-tiered-games.ts`.

Preview branch only. No main merge or production promotion without owner approval.

## Loading and gameplay recovery revision

Reproduced Grade 9 Q1 Week 2 displaying Failed to fetch while its Vercel file returned HTTP 200 through the authenticated connector. The app made a separate content request and unnecessarily gated an already-bundled quiz bank on it. The browser rejection itself supplied no more diagnostic detail. Bundling the verified native curriculum removes this failure path without changing Vercel protection, authentication or deployment settings. It adds approximately 1.2 MB compressed to the initial JavaScript package in exchange for eliminating per-module JSON requests.

Fixed 12 Hard tasks whose secondary term was only part of a hyphenated word, leaving an expected second answer without a second visible gap. Secondary terms now use the same whole-expression boundaries as the cloze builder. Every task reconstructs its exact source wording in regression tests. Missing Piece fills numbered gaps individually, typed answers normalize ordinary spacing/case, and crossword words accept letters with or without spaces. Crossword grids provide editable letter cells, arrow/backspace/Enter navigation, protected given letters, and a complete-word input.

Timeout submission now runs outside React state updater callbacks and uses an immediate question-ID latch to prevent duplicate answer logging. The existing score, XP, pass threshold and progress callbacks remain unchanged. Genuine source identity mismatches remain blocked.

Validation: all 106 lesson packages load when fetch throws Failed to fetch; all 7,950 clozes reconstruct their original source quotations; all correct typed-answer variations pass; wrong module/hash metadata is rejected; editable crossword cells are checked at every level. Existing 38,160 seeded session checks and discussion-only regressions pass.
