# PDF content on the original main UI

Branch: `codex/pdf-content-original-ui`. Baseline main: `26238ba2148e0ac97a708984a56dfc69ff139320`. This branch starts from main; it does not inherit the previous branch's lesson page, styles, mascot, preview application or UI code.

All 106 available PDFs across Grades 7–10 / Quarters 1–4 reuse the verified data from commit `17af3a5eff0fe38da09b665b729c52d26aba3dd5`. Teaching text, file IDs, PDF hashes and source geometry are reused. The definition review additionally quarantines 94 misclassified or insufficiently reviewed candidates; their original wording remains in source activities/discussions. Unanswered assessment prompts, context-specific examples and garbled table fragments are not treated as definitions or scored answers. Asset URLs move under the existing `/assets` route so `vercel.json`, `vite.config.ts`, environment variables and build settings remain untouched.

The original LessonAndQuizView receives PDF content through the existing lesson fields and visual configuration. Its original header, borders, colors, motifs, game components and reward callbacks remain. The later owner-requested source-tab and illustration revision is described below. SourceContent renders native paragraphs, tables, SVG drawings, individual original image crops and source citations inside those existing cards; there is no replacement lesson page or PDF screenshot renderer. Original quiz art containers receive relevant PDF illustrations where the question calls for them.

Generated localized lessons, quizzes, visual configurations, narration and obsolete speech caches are removed at their data sources. Cached/database curriculum entries cannot overwrite the reviewed PDF curriculum. Authentication, account records, database schema and API/session behavior are not changed. Existing school metadata, navigation geography, badge names and branding remain intact. The analytics screen's obsolete hardcoded topic diagnoses are replaced with source review references without changing its charts or layout.

Source numbering remains distinct from internal sequential progression. Grade 7 Q2 contains modules 1,2,3,4,7; Grade 9 Q4 has no module 10; Grade 9 Q3 includes Weeks 4–5; Grade 10 Q3 keeps 2A/2B separate. Grade 9 Q3 Week 7 retains the owner-approved folder placement and discloses its contradictory cover label. Grade 7 Q4 Module 3 also discloses its inconsistent footer.

Every playable game contains exactly five distinct current-PDF source items. The existing difficulty timers, score formulas, XP, badges, lesson completion and progression remain. Source banks are never padded or substituted. The owner subsequently requested removal of the embedded sorting game and concept bridge panels; their empty review panels are no longer rendered. No fabricated mistakes, translations or cultural hotspots are created.

407 source-backed question records support 78 module/mode/difficulty combinations; 1,830 combinations are blocked for source review. This does not assert that the original PDFs contain no additional usable assessment material: those printed activities/keys may need further manual review. The detailed game report and 480 image-text review occurrences remain in this directory. No uncertain OCR is published as educational text or scored answers.

Run `python3 scripts/review-source-definitions.py` after importing/reusing source data to apply the conservative definition review.

Validation runs in 16 small grade/quarter batches: `node --import tsx scripts/check-pdf-bindings.tsx`. It checks 106 original lesson renders, 2,701 native source selections, source file/hash bindings, 1,908 session combinations and five-item gating for embedded games. `main-ui-preservation.json` records 44 unchanged main UI/authentication/configuration files by Git blob SHA. The original lesson and quiz XP/scoring handlers were also compared against main; subsequent scoped lesson styling follows the owner's requested revision.

`npm run build` succeeds. `npm run lint` still reports two existing errors in the unchanged `src/context/AuthContext.tsx` (lines 385 and 447). This content-only branch deliberately does not modify authentication to resolve those pre-existing errors. Existing bundle-size warnings remain.

No merge or production promotion is authorized. Review the new PR and its Vercel preview first.

## Source-section tabs and illustrated examples revision

At the owner's request, remove the Interactive Concept Bridge and Mini Sorting Game panels and retire the Davao Oriental Context, Vocabulary Bank and Self-Check lesson tabs. The replacement bar lists sections actually present in each PDF (for example What I Need to Know, What's New, What's More, Assessment, Expectations, Remember, Pre-Test and Answer Key), alongside Concepts & Rules for instructional discussion.

`scripts/build-source-sections.py` reads every original PDF and splits mixed pages at native text/heading geometry. Image-based headings are matched to an exact heading whitelist using high-confidence OCR from original embedded heading images; this OCR is never used for teaching text or scored answers. Assessment directives inside discussion are moved to Activities & Assessment. Discussion excerpts are rebuilt at the data source, not merely filtered in the UI. `source.discussionPages` now records the refined discussion pages; `verifiedRecallPages` retains the earlier question-review provenance. Source numbering and all quiz banks are unchanged.

`SourceLessonSections.tsx` renders the source bar, discussion/activities and separate illustration column using the existing blue-and-green palette, linocut cards and Inabel motif strips. Native diagrams recolour neutral ink only; existing meaningful source colours remain. Monochrome source artwork is recreated as coloured SVG ink using its original image geometry as a luminance mask, preserving shapes, labels and proportions. Play/pause reveals and printed-source example animations respect reduced motion and Data Saver. No AI-generated educational content, invented diagrams, video claims or PDF-page screenshots are introduced.

Global website branding, account/authentication code, database, navigation and quiz scoring/XP/badges/progression remain unchanged. Previously earned visual XP is not reset. Removed lesson mini-games no longer award new visual-activity XP; the existing game sessions and lesson completion handlers continue unchanged. Scoped PDF presentation CSS is appended to index.css; prior site style rules remain intact.

Rebuild with the downloaded originals available: `../pdf-tools/bin/python scripts/read-source-heading-images.py`, `../pdf-tools/bin/python scripts/build-source-sections.py`, then `python3 scripts/optimize-source-payloads.py`. Validate with `node --import tsx scripts/check-pdf-bindings.tsx` and `npm run build`. Review `source-section-review.json` for all 106 source maps. No merge or production promotion is authorized.
