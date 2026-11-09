# Main release verification — 10 November 2026

Owner explicitly approved merging preview PR #13 into main.

Included: private student records and grade/group alias boards, transparency notices, focused navigation and Home, woven card/header styling, quarter-aware animated island artwork, and Supabase email-link password recovery. Shared Supabase privacy rules and SMTP settings were configured previously with owner authorization. No new schema or environment changes in this release.

Pre-merge checks: npm run lint passed; npm run build passed; 28 privacy/notice/grammar tests passed; password recovery transport assertions passed. Three baseline TypeScript errors corrected with concrete fallback school strings, a missing-profile guard and removal of an unreachable illustration branch. No auth role/approval rules changed by those corrections.

Known limits: Vite emits existing native-config and large-bundle warnings. Recovery email delivered to the owner-authorized registered account; user password entry and subsequent sign-in remain unverified. Institutional policy contacts and retention decisions remain pending confirmation; release does not constitute ethics approval. Existing privacy fail-closed restrictions on legacy profile editing remain documented in docs/privacy.
