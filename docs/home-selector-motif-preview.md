# Home illustration consistency

Home now reuses the InteractiveIslandMap artwork: original island paths, palms, forest, reef, shoreline, sky and sea gradients, and colored outrigger sailboat. The original interactive map is unchanged. The decorative scene has unique SVG IDs and retains the existing boat entrance and reduced-motion styling.

Only Home illustration and its binding changed. No curriculum, navigation, authentication, rewards, database, or environment settings changed.

Validation: production build passed; server-rendered SVG references resolve; original sail colors retained; desktop visual inspection passed; mobile 390px document width equals scroll width. Lint retains three pre-existing errors in PictureHuntIllustration and AuthContext, with none introduced in these components.

Preview branch only; do not merge without approval.
