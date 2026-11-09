# Privacy, Terms and AI transparency preview — 9 November 2026

Extends draft PR #13; do not merge without explicit approval. Existing alias-board opt-in and hidden default remain unchanged.

## Delivered

- Public, selectable, mobile-readable Privacy Notice, AI Transparency Statement and Terms of Use, using hash links so existing application navigation/forms remain intact.
- Registration summary before fields, separate Terms acceptance and Privacy Notice acknowledgement; registration is expressly not research consent or proof of guardian consent/assent.
- First-login summary for saved accounts with Review later (no lost learning access), versioned authenticated acknowledgement history and no implicit Terms acceptance. The summary repeats when a future notice version requires review.
- Footer access for signed-out and signed-in users. Native dialog provides focus containment/Escape dismissal, readable content sections and a table of contents.
- Writing Lab local checking is selected initially; external AI requires a deliberate choice. Submission/history/XP callbacks are preserved. Local checking avoids Groq, but does not promise that account history is never saved.
- Owner-confirmed Groq ZDR disclosure: text is still transmitted/processed, usage metadata is distinct, and provider ZDR does not erase LingoQuest's saved drafts. The owner confirmed ZDR; this task did not independently inspect Groq settings.
- Dedicated Supabase private receipt table, authenticated fixed-version RPCs; no account IDs accepted from clients. Receipt reads/writes do not grant access to peer records, opt into a leaderboard or establish research consent.

## Required institutional confirmation

No invented controller/contact, lawful basis, retention duration, disposal deadline or ethics clearance. Documents are clearly marked preview. DOrSU research office and the participating school/DepEd privacy officer should confirm the responsible controller(s), official institutional privacy/research contact, purpose-specific lawful basis and fixed retention/disposal schedule (including paper forms, identifiable exports and backups). Participation duration and independent recruitment/withdrawal procedures belong in separate approved participant information documents.

The registration receipts do not verify a guardian's identity, and this update does not create a signed research-consent repository or authorize study recruitment. Existing secure-account provisioning limitations from the privacy branch remain; this is not an unrelated signup-system rewrite.

## Evidence

29 automated tests pass (privacy RLS/role/grade boundaries, real HTTP handlers with synthetic auth, versioned receipt isolation/idempotency, and grammar regressions). Production build passes. Type check retains the same three baseline errors; none introduced here. A rolled-back live Supabase authenticated-role test verified receipt persistence without fabricated Terms acceptance. No saved student was opted into research or leaderboard by this test.

Browser checks with synthetic local account: three public documents open; registration checkboxes start unchecked; mobile 390x844 privacy/terms dialog has no horizontal overflow (document 375/375; dialog 318/318); Escape closes and restores focus; first-login acknowledgement saves; local grammar corrects an example and keeps normal history/XP callback. Actual external AI was not called during this review. The new preview branch needs its own GROQ_API_KEY scope if only production/another branch currently has it; no unrelated secret settings were changed.

## References

- Ethics-board notification supplied by the project owner: minors' consent/assent, non-coercion, private performance, external AI, retention/disposal, actual risks and participation duration.
- https://privacy.gov.ph/the-right-to-be-informed/
- https://privacy.gov.ph/wp-content/uploads/2024/12/Advisory-2024.12.17-Guidelines-on-Child-Oriented-Transparency-w-SGD.pdf
- https://console.groq.com/docs/your-data

Institutional/legal and ethics review is still required; these pages do not guarantee approval.
