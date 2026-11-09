# LingoQuest privacy leaderboard — local review

Status: candidate prepared from main `accb2a6f448633e7cd0fad9ac3641a7b0b46a12f`. The user authorized a GitHub feature branch, Vercel preview, and shared Supabase privacy migration on 2026-11-09. **Do not merge into main.** No historical database records were deleted. The proposed intervention still needs ethics-board review; this work does not establish ethics approval or guarantee anonymity/security.

## Review the local version

From this directory's project root:

```
npm ci
node --import tsx tests/privacy/local-preview.ts
```

Open http://127.0.0.1:5642/. This harness uses **synthetic accounts**, a local PGlite/PostgreSQL database and a local Supabase-compatible authentication fixture; it does not connect to production.

Local-only credentials: `fixture1` / `LocalReview!2026` (Grade 7), `fixture4` (Grade 8), `fixture5` (Grade 9), `fixture6` (Grade 10). `fixture7` is an assigned teacher; `fixture8` is unassigned; `fixture9` is an aggregate-only administrator. Choose the matching role on sign-in. Never use these credentials in a real deployment.

The local harness and its authentication fixture are tests, **not a replacement Supabase service**. Production code calls Supabase Auth and the checked database RPCs. Only the dev harness emulates HTTP authentication, so staging Supabase-provider validation remains necessary before release.

## What changed

- Replaced the identifiable division-wide leaderboard with a Grade Activity Board in the existing layout/motif. No all-grade filter, student search, names, photos, school/section identifiers, learner numbers, academic averages, numeric rank, bottom-place labels or profile links.
- Each approved participant belongs to one trusted participating group and official grade. Database membership is provisioned by authorized staff; students cannot select a different group or grade by changing requests.
- System-generated random aliases; participation hidden by default. Showing an entry requires a confirmation explaining exposure. Withdrawal changes only visibility. Group/grade changes reset visibility and rotate the alias; profile-grade/status changes also reset visibility.
- Each first completed **module + game mode** activity earns 10 board points, regardless of quiz accuracy or difficulty. Repeated sessions of the same activity do not add points. This is separate from XP and Quest Coins. The existing server-validated completion event is the source; browser-supplied XP, scores or completion claims never create board credit. Historical XP and test results are not converted or backfilled.
- The API and report/export RPCs derive identity from Supabase Auth. Students receive only their own individual records. Teachers receive records only for explicit assignments. Administrators default to aggregate summaries; individual access requires a purpose-specific, expiring grant. Researchers likewise require explicit individual grants; no researcher-wide directory or automatic aggregate permission is added.
- Legacy leaderboard rows remain stored but are blocked from client table queries. Restrictions also cover direct table queries and children of private quiz sessions. Legacy JSON archives cannot be selected by browser clients; checked reports return an explicit field list.
- Retired the unauthenticated whole-user bootstrap, arbitrary-user endpoints and locally minted sessions. Removed embedded sample account/credential/performance arrays from the shipped client; stopped loading shared multi-user browser caches. Browser state is hydrated only from a verified, scoped response and cleared on sign-out/account switch.
- Removed numeric ranks and medal-style rank emphasis from the teacher-only diagnostic roster; assigned student diagnostics remain private.
- A failed Supabase profile lookup now returns no profile instead of querying legacy Firebase with the Supabase account ID.
- Kept personal My Progress and badges. Added visibility/access explanations and supportive wording. Fixed a mobile header overflow; aliases/points wrap without horizontal scrolling.
- Added an aggregate-only admin panel. Individual administrative views receive only records covered by a current grant. Legacy bulk account/profile mutations fail closed rather than exposing old all-user endpoints; review their secure replacement as part of rollout.

## Inspected before changes

Read the current main source, Vercel project identity, live Supabase table metadata, RLS policies, function permissions, public/storage views, storage buckets and security advisors without changing production. No public/storage views or storage buckets were present. Active target: **LingoQuest_space / lingo-questv4**, Supabase `hxkeomhutnkvtulqjbss`.

Findings: legacy `leaderboard_read` allowed every authenticated user to read rows; the old client combined identifiable local/Firestore records with XP and quiz averages; source account arrays and browser caches delivered whole-user records; the legacy Node bootstrap minted a session from request-supplied identity and returned whole user lists. The privacy implementation closes these paths in the candidate source and database changes.

The live security advisor also reported leaked-password protection disabled. That unrelated Auth setting was not changed. Audit logs and question-bank tables had RLS with no client policies (default deny), not public access.

## Verification

1. `node --import tsx --test tests/privacy/permissions.test.ts` — 14 PostgreSQL scenarios pass (15 Node test results including the parent). Uses real PostgreSQL RLS/roles through PGlite, against a synthetic schema reproducing the inspected tables and relevant legacy policies.
2. Start the local preview, then `node --import tsx --test tests/privacy/http.test.ts` — authenticated HTTP flow passes through the actual account-login handler, private API dispatcher and database RPCs, with synthetic Auth. Checks cross-student report/export denial, cross-grade denial, teacher assignment limits, admin aggregates, token tampering, opt-in/out and absent unauthorized fields.
3. Existing grammar regression tests: 12 pass. `npm run build` passes. `npm run lint` has the same three pre-existing errors in PictureHuntIllustration.tsx and AuthContext.tsx; changed production code introduces no additional type errors.
4. Browser review: 1280×900 desktop and 390×844 mobile viewport overrides. No horizontal overflow in the board after the header fix (document scroll width equals client width: 1265/1265 desktop; 375/375 mobile). Confirmed hidden default, explicit opt-in dialog, visible alias, successful withdrawal and mobile navigation. Screenshots: desktop.png, mobile.png.
5. No live database privacy migration or live role tests were run. Supabase branch creation was declined; no production fallback was used. Firebase rules are a reviewed candidate only; no Firebase emulator or remote rules deployment was performed.

## Consent and methodology revisions

Suggested consent/assent wording (adapt for participant age and approved study language):

> Your quiz scores, test results, badges and learning progress are not shown to other students. Your assigned teacher may view necessary records. Authorized staff may access specified individual records for a documented purpose and limited time. Administrators normally receive summaries. You may choose to show a system-assigned alias and activity-completion points on a board visible only to your participating group in your grade. You start hidden and can hide your entry again without losing points, access to lessons or your relationship with the school. Classmates may guess who an alias belongs to. Previously viewed or copied information cannot necessarily be recalled.

For the methodology/protocol amendment, specify:

- Four separate grade cohorts, participating-group boundaries and who verifies/enrolls participants. No combined rankings or unrestricted public access.
- The 10-point first-completion rule; the module/mode unit and difficulty deduplication; no accuracy-based points, test scores, XP conversion or legacy-score backfill. Confirm this rule with the research adviser/board before use.
- Hidden-by-default participation, age-appropriate assent/parental-consent handling, optional appearance and withdrawal without academic penalty. A board opt-in is **not** a substitute for research consent/assent.
- System-assigned aliases, residual re-identification/peer-pressure risk, no lowest-rank highlighting and access limited to the participating grade group.
- Explicit teacher assignments, separate expiring staff grants, audit of individual report access and aggregate-by-default administration. Researchers receive only the access actually granted—not automatic access to all student data.
- Existing research records retained privately; retention duration, disposal and backup policy still need to be documented by the study team. This update does not establish a new retention/disposal policy.
- Present the revised intervention and consent/assent forms to the ethics board for review. Do not describe the candidate or the proposed intervention as already approved.

## Rollout still requires authorization and review

1. Obtain review of the revised leaderboard intervention and any manuscript/consent amendments. Confirm the completion-point definition.
2. Back up existing research records. Reconcile existing account IDs, official grade/group membership and **verified** teacher assignments into the private enrollment tables. Do not infer authority from client-provided teacher IDs, local caches or role metadata.
3. Arrange purpose/expiry-based staff grants through a trusted administrative process. No public grant-creation endpoint is supplied.
4. Preserve/reconcile any unsynced historical browser records before a controlled cache-cleanup rollout. New code ignores those old caches but does not silently delete them; old copies on previously used devices require a separate retention/cleanup decision.
5. Apply `supabase/changes/privacy_grade_leaderboard.sql` to an authorized isolated Supabase staging project first. Run role tests against actual Supabase Auth/REST, review advisors, and verify ongoing game/progress writes and the server completion trigger. Generate the final migration through the Supabase CLI after that review; this SQL file is a pending change script, not an applied migration.
6. Validate any still-active Firebase deployment separately before applying the fail-closed candidate rules. Do not rely on untested Firebase rules as deployed protection.
7. Review secure account/profile administration replacements: legacy bulk/personal mutation routes are intentionally retired; do not re-enable the old bootstrap as a workaround. Historical records remain in the database.
8. Only after authorization, create a Vercel preview in **LingoQuest_space / lingo-questv4** tied to the isolated staging backend, run provider-level end-to-end checks, then request merge/production approval. Pushing a feature branch currently triggers Vercel automatically, so no remote branch or PR was created during this no-deploy task.

## Authorized preview rollout — 2026-11-09

The shared `hxkeomhutnkvtulqjbss` database privacy migration was explicitly authorized and applied for the preview. Existing account and performance rows are retained. These shared database rules also affect the current production site even though the UI branch is not merged. Saved approved Grade 7–10 students were enrolled into this project’s participating group, hidden by default; teacher access requires separately verified assignments. No individual administrator/researcher grants were created.

The earlier local-only status and rollout notes above describe the pre-authorization review. No isolated Supabase branch was used. The local fixtures remain test-only and are not deployed as the preview backend. The remote preview uses saved Supabase accounts, not fixture credentials.
