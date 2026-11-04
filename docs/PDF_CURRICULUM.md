# Source-only digital curriculum

All 106 available PDFs (2,430 pages, Grades 7–10 / Quarters 1–4) map individually in `curriculum-source-manifest.json`. Original Drive folder: https://drive.google.com/drive/folders/1UMGtBELCQ8rT6Q0LJB2Eitt9oLshvgkk

Teaching text is extractive and page-cited. Discussion pages are editorially selected per PDF in `import-pdf-curriculum.py`; no single-heading heuristic or external curriculum is used. Native PDF blocks become selectable HTML paragraphs, headings and tables. Localized native vector diagrams become responsive SVG paths with keyboard-selectable labels. Relevant embedded images are extracted individually and optimized as WebP. No full-page PDF images remain in the lesson assets or renderer.

The six lesson sections use source discussions, definitions, examples, activities, objectives, assessment and printed checking guides. Empty sections remain empty. Curated vocabulary allowlists remove incidental sentence prefixes from the glossary; definitions remain literal source quotations. Study cards quote the source overview and definitions. Images with uncorroborated text are preserved visually but their uncertain OCR is quarantined, never used for scored answers. `source-figure-text-review.json` lists 480 figure occurrences needing transcription review; 158 occurrences have native-text-corroborated selectable labels.

## Mapping exceptions

Grade 7 Q2 has source modules 1,2,3,4,7. Grade 9 Q4 has no module 10. Grade 9 Q3 Weeks 4–5 share one PDF. Grade 10 Q3 modules 2A and 2B remain separate. Website `moduleNumber` is sequential progression; `sourceLabel` identifies the actual PDF module/week. At the owner's direction, Grade 9 Q3 Week 7 retains folder placement with its contradictory “Second Quarter – Week 4” cover disclosed. Grade 7 Q4 Module 3 also discloses the inconsistent Module 2 running footer.

## Games and progression

All five existing modes remain: Analogy Master, Missing Piece, Crossword, Picture Hunt, Word Hunter. Easy/Medium/Hard use the existing 45/30/20-second and scoring behavior. A session contains exactly five distinct source items; mixed sessions contain one distinct item from each mode. No filler, repeated source items, cross-module substitution or synthetic answer generation is permitted. Source definitions support term recall; complete printed analogies and reviewed figures/answer keys support other games. Every question carries source file ID, page, exact quotation, answer evidence and stable source-item ID. Feedback quotes the source.

`source-game-review.json` lists each module/mode's reviewed bank. A deficient bank is explicitly marked for source review and cannot launch. This does not assert that its PDF lacks all possible assessment material: additional original assessments/keys may need manual review. 41 mode/mixed banks currently support play, covering 123 difficulty combinations. The remaining 1,785 combinations are safely blocked. Original lesson + passing-quiz progression and scoring/XP handlers remain in use; reading alone does not fabricate a passing score. Accounts and historical attempts are not changed.

## Rebuild

Original PDFs, extraction JSON, OCR evidence and expiring download references live in ignored `.curriculum-sources/`. Never commit that folder. With those originals available, run:

1. `python3 scripts/import-pdf-curriculum.py`
2. `../pdf-tools/bin/python scripts/digitize-pdf-curriculum.py`
3. `python3 scripts/curate-source-vocabulary.py`
4. `python3 scripts/build-source-games.py`
5. `python3 scripts/add-reviewed-verbal-game.py`
6. `../pdf-tools/bin/python scripts/add-reviewed-visual-game.py`
7. `../pdf-tools/bin/python scripts/add-reviewed-picture-analogies.py`
8. `../pdf-tools/bin/python scripts/transcribe-source-figures.py`
9. `python3 scripts/pack-source-figures.py`

Small original crops are stored once per module's lazy-loaded asset dictionary; large optimized images remain external. The loader verifies the source hash and resolves local assets. Unrelated source content is not loaded as a quiz fallback.

## Checks

- `python3 scripts/verify-pdf-curriculum.py`: original SHA, grade/quarter mapping, numbering exceptions, 3,084 source excerpt matches.
- `../pdf-tools/bin/python scripts/verify-digital-content.py`: native block/figure and question evidence checks.
- `npm run check:curriculum`: 106 lesson renders, grade/progression restrictions, 1,908 mode/difficulty combinations; exactly five unique source items in playable sessions and rejection of insufficient/foreign banks.
- `npm run lint` and `npm run build`.

The standalone `/curriculum-preview.html` uses the same lesson and game components with preview-only no-op account writes. Main authentication, database, environment variables and deployment configuration are outside this revision.
