# Discussion-only PDF modules

Latest owner instruction supersedes the earlier multi-section lesson bar: all 106 modules display only Concepts & Rules discussion and its relevant colored/animated illustrations. Activities, assessments, objectives, review exercises, Additional Activities and Answer Key are excluded from the delivered lesson sections and blocks. Embedded exercises on mixed discussion pages are removed at the publication data source. The separate five-question quiz engine, scoring, XP, progress, authentication and deployment configuration remain unchanged.

All clickable PDF source links and the source-reference sidebar are removed, including original-image links and source URLs in copied notes. Maintainer provenance retains PDF IDs, hashes, page mappings and label discrepancy records without rendering external links.

The bibliography of each PDF is inventoried in reference-research-review.json. Three accessible references actually printed in their corresponding PDFs provide short paraphrased clarifications: Scribbr on paraphrasing, British Council on fluency, and Capella University on informative versus persuasive writing. Inaccessible, incomplete, unrelated and image-credit references are not used for extra educational claims. No external research is used to generate scored questions.

Validation: 106 discussion-only lesson renders, 358 discussion source selections, no external source anchors, and 1,908 mode/difficulty combinations. The latest owner-authorized quiz revision provides 7,950 task variants based on 530 PDF target expressions, with 1,908 playable mode/difficulty combinations. See QUIZ_TECHNICAL_BRIEF.md. Build passes; two existing type errors in unchanged AuthContext.tsx remain outside this task.

Rebuild from original PDFs: read-source-heading-images.py, build-source-sections.py, publish-discussion-only.py, optimize-source-payloads.py, then node --import tsx scripts/check-pdf-bindings.tsx and npm run build. Discussion publication is an explicit final stage; never deploy the intermediate full-section extraction.

This feature branch remains a preview. Do not merge or promote without owner approval.
