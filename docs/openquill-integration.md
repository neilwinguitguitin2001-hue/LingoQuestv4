# OpenQuill Writing Lab integration

Adapted from https://github.com/Dineshv0311/openquill at f6af3f238073c1d6d72aa4b5732c5114f26e3a24, app/api/grammar/route.ts. MIT license retained in THIRD_PARTY_NOTICES/OpenQuill-LICENSE.txt.

The upstream checker is a rule-based spelling/grammar engine, not a neural AI model. Its pure checking code now runs inside the existing Vite/React Writing Lab. No OpenQuill server, API key, model download or paid endpoint is required. Checking makes no network request. Existing saved submissions continue through LingoQuest's existing account/progress flow.

The original editor, motif, feedback cards, copy action, history, navigation, XP callback and authentication remain. The previously requested prompt-card removal is included. The optional Transformers prototype and its download controls are absent; no dependencies were added to main.

## Deliberate upstream fixes

- Removed general edit-distance spelling guesses that changed valid words such as food/book.
- Removed the ambiguous 'your right' replacement; skip legitimate repeated had/that.
- Bound input to 5,000 characters and expensive repeated-character lookup to 64-character words.
- Fixed repeated grammar matching so global regex replacement cannot reset the iteration cursor indefinitely.
- Prefer longest overlapping correction and preserve first-letter capitalization/whitespace.
- Suggested revisions never overwrite the student's draft. No generated grade or claim of comprehensive review.

## Verification

Run `node --import tsx --test tests/openquill.test.ts`: six regression cases cover spelling, replacement offsets, multiple grammar matches, overlap, duplicates, valid-word preservation, capitalization, bounds and honest no-match feedback.

`npm run build` passes. `npm run lint` retains the three existing main-branch errors in PictureHuntIllustration.tsx and AuthContext.tsx; no new errors in modified code. Build still reports existing chunk-size/Vite-config warnings.

## Limits

This small English rule set misses many grammar errors and can produce false positives. It does not evaluate meaning, grade writing, or replace a teacher. No-match feedback explicitly states this. This is a preview-only branch; approval is required before merge.
