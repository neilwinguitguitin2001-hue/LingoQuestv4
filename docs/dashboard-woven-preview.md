# Shared woven dashboard cards — preview only

Extends the landing page's blue/green geometric accent across main dashboard cards without changing routes, form payloads, account access, curriculum, XP, purchases or database rules.

## Changes

- Shared InabelStrip uses navy label bars and blue framing. Compact-height patterns scale their full diamond/chevron motif instead of clipping it. Green variants keep a blue-leading motif with green accents.
- Explicit card classes add static decorative strips to 60 previously unaccented main panels/cards: student dashboard 2, teacher 24, administrator 29, personal progress 4, market item template 1 (repeated for the six shop items). Existing woven panels receive no second strip.
- Shared navy/blue card outlines and restrained offset framing replace black framing for these card components. Text, controls, table scrolling and existing animations remain intact. CSS strips are decorative and pointer-inert; padding reserves their height.
- Corrected two TypeScript annotations in the previously-added notice test; no notice behavior changed.

## Verification

Production build passes. Type check reports only the three pre-existing errors in PictureHuntIllustration.tsx and AuthContext.tsx. Notice receipt test passes.

Browser review used compiled source with synthetic accounts and the existing isolated local Auth/database harness (no live student data). Student My Progress shows four new stat-card strips; teacher overview shared strips and analytics with ten new strips render; aggregate-only administrator overview renders. All three mobile views at 390x844 had document clientWidth/scrollWidth 390/390. Before/after proof is local under .taste-skill/after/cards-student.png and cards-admin.png.

The source deployment uses Vercel's existing environment. The local compiled test artifacts and synthetic credentials are not published as the backend. No Supabase/environment change or main merge is part of this visual update. Existing unrelated baseline type/build-size warnings remain. This is a scoped restyle using the existing React/Tailwind system, not the previously unapproved full redesign; no full taste-skill gate certification is claimed.
