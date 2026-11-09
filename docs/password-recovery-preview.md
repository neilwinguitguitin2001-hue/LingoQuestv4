# Secure email recovery preview

Replaced browser-generated recovery codes, account-directory matching and false sent/password-saved claims with Supabase recovery links. The standalone /auth/reset-password page waits for an authenticated Supabase user and updates that user's auth password. No profile password copies are written. Legacy profile recovery fails closed. Students, teachers and admins can request recovery with their registered email. Neutral request responses do not reveal account existence or claim inbox delivery. Provider failures are surfaced without exposing raw details. Password minimum eight characters and confirmation enforced; Supabase remains authoritative for password policy and token validation.

Shared Supabase site URL corrected to https://www.lingoquest.space. Exact trusted reset URLs added, preserving existing v0 URLs. Domain ownership verified in LingoQuest_space / lingo-questv4. Resend mail.lingoquest.space verification DNS prepared. SMTP verification/configuration status must be checked before claiming delivery works.

Validation: production build passed. Mocked Supabase request tests pass normalized email, exact callback and provider failure handling. Baseline lint retains three unrelated errors. Local browser failure test shows an error and no simulated codes. No real user passwords reset. Inbox receipt and one-time-link full cycle require a consenting test recipient and must not be claimed until completed. No main merge.

## SMTP setup completed (10 November 2026)

Resend sender domain verified. A replacement sending-only key scoped to mail.lingoquest.space was saved directly in Supabase SMTP, not in source code or frontend variables. SMTP enabled with smtp.resend.com, TLS port 465, user resend, and sender notifications@mail.lingoquest.space (LingoQuest). Reloaded dashboard confirms enabled settings and stored hidden password. Existing unused interrupted key was not deleted.

Production branch preview recovery dialog verified. A fresh expired-link test rejects with no password form. Inbox delivery and a successful password change/sign-in cycle are not yet verified; awaiting the owner's registered test email. Browser policy requires the user to enter and submit their new password themselves. Shared live Auth settings changed; main code remains unmerged.

Delivery verification: owner authorized a registered recipient. Initial test failed with SMTP 535; replaced the same-scope sending credential after explicitly revealing the one-time Resend value for secure transfer. Subsequent Supabase request succeeded and Resend reported delivered for Reset your password. No password was entered by the agent. Password submission and subsequent sign-in remain a user handoff. Main not merged.
