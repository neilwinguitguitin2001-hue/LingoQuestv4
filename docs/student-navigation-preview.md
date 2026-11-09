# Student navigation consolidation — preview only

## Final hierarchy

Five primary student destinations: Home, Island Quests, Writing Lab, My Progress, Quest Market. Desktop and compact navigation use one shared configuration. Badges and Learning Progress are secondary pages within My Progress; the optional Grade Activity Board is a secondary link in the same context. My Progress stays active while either secondary page is open.

Home is a new compact learning summary: next unlocked/incomplete module using existing progression rules, completed-module/badge counts, recent timestamped own activity and a Writing Lab shortcut. Full score tables, badge cabinet and credentials are not repeated on Home.

Account Settings uses the existing credential/photo editor, reached through the avatar menu. Its old overview and badge tabs are not rendered in account-only mode. Existing save handlers and access rules remain unchanged; no claim is made that the earlier branch's fail-closed legacy profile-administration limitations were repaired here. The avatar menu includes privacy help and sign-out, supports Escape and outside-click dismissal, and closes when navigating/account-switching.

The existing badge cabinet is reused in badges-only mode, preserving badge details while omitting duplicate profile/registration panels. Lesson Home labels and return targets are updated; teacher/admin return targets remain role-appropriate. Student sign-in opens Home, and restored staff sessions do not land on a student-only screen.

## Verification

Production build passes; type check retains the same three pre-existing errors in PictureHuntIllustration.tsx and AuthContext.tsx, with no new errors. Synthetic local browser review confirmed exactly five primary labels, Home on sign-in, next-module routing to Grade 7 Analogy and lesson Home return, My Progress/Badges/optional board placement, unchanged hidden-by-default board controls, avatar Account Settings, cancellation/back-to-Home, menu Escape, and five-destination mobile navigation at 390px without horizontal overflow (390/390).

No live account settings were saved, quiz rewards changed, accounts migrated or database/environment settings edited. Privacy boundaries and optional board consent remain unchanged. Existing research records are retained. The optional leaderboard remains part of the intervention and subject to the previously documented ethics review.

Source stays on codex/private-grade-leaderboard-preview / draft PR #13. Do not merge into main without explicit approval. Local proof: .taste-skill/after/student-home.png.
