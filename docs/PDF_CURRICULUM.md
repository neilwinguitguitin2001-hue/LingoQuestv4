# PDF curriculum

The approved source is the project owner's Drive folder:
https://drive.google.com/drive/folders/1UMGtBELCQ8rT6Q0LJB2Eitt9oLshvgkk

Every lesson follows PDF → structured data → reader. All 106 available PDFs across
16 grade/quarter folders are mapped individually in `curriculum-source-manifest.json`.
The original PDFs comprise 2,430 pages. Each published excerpt cites its own PDF page;
source hashes identify the exact originals used for this update.

## Authoring policy

- Teaching text is extractive. Do not add examples, translations, localization,
  tips, glossary definitions, distractors, answers, or general topic templates.
- The overview comes from the instructional discussion. Editorial discussion-page
  selections are in `scripts/import-pdf-curriculum.py`, including material before
  “What Is It” and additional lessons within a PDF.
- The six requested sections use source discussions, definitions, activities,
  objectives, reviews, and assessment pages. Empty sections remain empty.
- The study cheatsheet selects source definition sentences; it does not generate claims.
- Original discussion-page images preserve tables, columns and diagrams in the lesson reader, with accessible text transcripts. Source activities remain open-response where applicable. The source key/rubric is
  available separately; no synthetic multiple-choice games or automatic scores are added.
- The Grade 7 Q3 Module 5 diagram on PDF page 11 includes image-based text. Its
  transcription was checked against the rendered original; the original diagram is
  preserved alongside the text.
- Open the source PDF for full graphic layouts, tables, illustrations and rubrics.

## Numbering and exceptions

Source identifiers never come from an array index. Grade 7 Q2 contains modules
1, 2, 3, 4 and 7. Grade 9 Q4 contains no module 10. Grade 9 Q3 includes the combined
Weeks 4–5 PDF. Grade 10 Q3 keeps modules 2A and 2B separate. `moduleNumber` is only
the website's sequential navigation order; `sourceLabel` identifies the real module/week.

At the owner's explicit direction, Grade 9 Q3 Week 7 retains its Drive placement
while visibly disclosing the PDF cover's “Second Quarter – Week 4” label.
Grade 7 Q4 Module 3 follows its file name and cover; the source's running footer
incorrectly says Module 2. This discrepancy is also disclosed in the reader.

## Runtime behavior

Student lessons, teacher/admin inspections and the standalone curriculum preview
use the same source data. Cached custom modules and database module overrides cannot
replace the approved PDF curriculum. Source-managed curriculum editing is performed
through reviewed repository data changes; the module API rejects ad-hoc modifications.
Legacy generated curriculum files, quiz expansion and regional visual generators
have been removed. Navigation geography and school/account metadata are separate
from curriculum and are retained.

Reading completion unlocks the next PDF module without inventing a quiz result.
Self-check performances and open responses use source rubrics and teacher review.
Existing account data and historical attempts are not deleted.

## Rebuild and verification

Downloaded originals, page extraction files and expiring download references belong
in `.curriculum-sources/`, which is excluded from Git. The input inventory contains
the source grade/quarter, Drive ID and filename. Each `<Drive ID>.json` contains the
PDF's SHA256, page count and 1-based page text.

```sh
python3 scripts/import-pdf-curriculum.py
python3 scripts/render-pdf-discussion-pages.py
python3 scripts/verify-pdf-curriculum.py
npx tsx scripts/check-curriculum.tsx
npm run lint
npm run build
```

The page renderer requires PyMuPDF and Pillow in the authoring Python environment.

The source verification checks all published excerpts against their own originals,
all 106 mappings, numbering gaps, split modules and disclosed label discrepancies.
The renderer check covers all lessons and self-check views and verifies progression.

`/curriculum-preview.html` provides a read-only curriculum review without signing in;
it uses no account data or authentication backend.
