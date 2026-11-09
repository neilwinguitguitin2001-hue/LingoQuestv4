# Home illustration consistency

Home now reuses the InteractiveIslandMap artwork: original island paths, palms, forest, reef, shoreline, sky and sea gradients, and colored outrigger sailboat. The original interactive map is unchanged. The decorative scene has unique SVG IDs and retains the existing boat entrance and reduced-motion styling.

Only Home illustration and its binding changed. No curriculum, navigation, authentication, rewards, database, or environment settings changed.

Validation: production build passed; server-rendered SVG references resolve; original sail colors retained; desktop visual inspection passed; mobile 390px document width equals scroll width. Lint retains three pre-existing errors in PictureHuntIllustration and AuthContext, with none introduced in these components.

Preview branch only; do not merge without approval.

## Quarter-aware artwork and water

Home follows the next unlocked module's quarter; after all modules are complete it retains the last completed quarter. Q1 uses San Victor, Q2 Oak, Q3 Waniban and Q4 Pujada, each copied from the existing selector's original paths. Gentle caustic shimmer and wave swell match the selector's motion pattern. Pause/play controls stop both water layers, and reduced-motion disables them.

Validation: four server-rendered quarter cases pass distinct-artwork, label and SVG-reference checks. All four scenes visually inspected. Live Home CSS confirmed running → paused → running through its button. Production build passed; lint retains the three baseline errors. No changes to progression or the full selector.
