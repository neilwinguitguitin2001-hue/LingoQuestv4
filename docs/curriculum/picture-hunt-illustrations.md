# Illustrated Picture Hunt

Picture Hunt now presents a colorful illustrated clue beside lettered picture choices, with a stacked layout on smaller screens. Code-native SVG scenes depict existing PDF-backed target concepts; source excerpts, question banks, answer IDs, difficulty selection, scoring, XP and progress are unchanged. Artwork is explanatory support, not a replacement for the selectable clue and answer labels.

The catalogue explicitly maps all 530 target expressions across 106 modules into 66 reusable scene families, including people speaking/listening, emotions, stories, calendars, objects, visual aids and writing. Each of the 1,590 Picture Hunt tasks and 5,300 answer cards receives artwork. Artwork uses inline SVG without external image downloads; decorative hover motion respects reduced-motion preferences. Existing branding and motif borders remain.

Validation:
- `node --import tsx scripts/check-picture-illustrations.tsx`: all targets mapped, accessible inline SVG rendered, all answer IDs valid.
- `node --import tsx scripts/check-tiered-games.ts`: 38,160 seeded sessions; five single-mode or fifteen mixed questions; no duplicate IDs or bank mutations.
- `node --import tsx scripts/check-module-recovery.tsx`: all 106 modules load without network requests; 7,950 answer reconstructions verified.
- `npm run build`: passes.
- `npm run lint`: two existing AuthContext.tsx type errors at lines 385 and 447; this change introduces no new type errors and does not modify authentication.

No generated raster images, new curriculum claims, database changes, environment changes or deployment configuration changes are included.
