# Illustrated personal Home — preview only

Adds the three requested student-facing features without changing the five-tab hierarchy, permissions, rewards, progression rules or academic content.

- Next-quest hero includes original lightweight SVG island/boat art, the student's actual next unlocked incomplete module, and the existing Continue Learning/Browse actions. The art is decorative, not a factual geographic map or curriculum illustration.
- Three-stop trail uses actual completed/current/following module data from the student's own grade. Empty states do not claim completion. Coming up is a read-only preview and never unlocks a lesson or quiz. The completion bar counts modules, not academic mastery or class rank.
- Spotlight chooses only a badge ID present in the student's own data and recognized in the existing badge definitions. Otherwise it shows an actual completed module or a welcoming empty state. No fabricated badge, reward, streak or achievement is added.
- Writing shortcut has a simple illustrated icon treatment. Existing detailed records remain in My Progress.
- Boat entrance lasts 2.6 seconds once and then rests; reduced-motion CSS disables it. SVG art is hidden from assistive technology; all meaningful module/achievement text remains selectable HTML. No new dependencies, image-generation service or student-data transmission is introduced.

Verification: production build passes. Type checking retains only the same three pre-existing errors. Server-render checks pass for empty progress, a genuinely earned defined badge, an actual completed module and an unknown badge ID fallback. Compiled browser review with a synthetic account shows the correct Grade 7 next/following modules, five primary tabs and mobile document widths 390/390 without horizontal overflow. Animation iteration count is one; the reduced-motion rule was inspected in source, not tested using an OS setting override.

Before merge, review the Vercel preview with your own saved account. No database/environment changes, account writes or merge to main are authorized by this cosmetic update. Local proof: .taste-skill/after/illustrated-home.png.
