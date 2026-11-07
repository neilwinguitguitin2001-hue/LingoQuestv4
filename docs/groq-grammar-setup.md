# Groq grammar checker preview

Writing Lab uses a server-side Groq check with an OpenQuill local fallback. This follows Grammar-Master's AI-checking approach without importing its Next.js application, MongoDB accounts, editor or UI. The Groq integration and edit validation are original LingoQuest code. Reference: https://github.com/daivikawasthi01/Grammar-Master (README describes Groq and local checks).

## Activate AI

1. Create a key in https://console.groq.com/keys using a Groq **Free plan** organization. Do not enable paid billing for this free-only setup.
2. In Vercel project `lingoquest-v4`, add `GROQ_API_KEY` as a server-side secret for **Preview**, branch `codex/groq-grammar-preview`.
3. Redeploy that preview. Do not prefix the key with VITE_ or NEXT_PUBLIC_. Do not put it in the repository or chat.
4. Sign in, open Writing Lab and check a draft. The result must say `Checked by: Groq AI`. If it says `OpenQuill local fallback`, AI did not complete.

The existing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are used server-side to verify the user's bearer token with Supabase Auth. No service-role key, schema change, new account system or database migration is required.

## Flow and privacy

Only clicking Check grammar sends the current draft to `/api/grammar-check` and then Groq. Typing does not trigger background AI calls. The UI explains this before the button. Avoid personal information in drafts. The API does not log drafts, credentials or provider output; responses are no-store. Existing submission/history/XP callbacks are preserved. Original drafts are never overwritten.

AI returns minimal edits through Groq structured outputs using `openai/gpt-oss-20b`. Both server and browser validate types, lengths, exact source substrings, occurrence indexes and non-overlap before applying edits back-to-front. AI can still make incorrect suggestions; there is no accuracy guarantee or generated grade.

Missing keys, sign-in problems, provider quota errors, malformed AI output and timeouts use the limited OpenQuill fallback and explicitly label it. There is no paid-provider fallback. The app cannot inspect whether a supplied Groq key belongs to a Free or paid organization; the account owner controls that plan.

## Limits

10–5,000 characters per check, maximum 30 AI edits, 15-second provider timeout and five AI attempts per minute per authenticated user per running function instance. This in-memory burst limiter is **not a distributed daily quota** and resets on cold starts. Groq Free's organization-wide quotas are the shared limit. Do not use a paid key expecting this limiter to be a billing cap. A shared database/Redis quota is required before enabling a paid plan.

## Verification

`node --import tsx --test tests/*.test.ts`: 11 tests pass (authentication rejection, missing key, input limits, mocked valid/invalid provider responses, rate limiting, anchored edits, fallback, OpenQuill regressions).

`npm run build`: passes. `npm run lint`: the same three existing errors in PictureHuntIllustration.tsx and AuthContext.tsx; no new errors.

Live Groq quality and connectivity cannot be verified until GROQ_API_KEY is entered. No student text was sent to Groq during development. Preview only: do not merge without approval.
