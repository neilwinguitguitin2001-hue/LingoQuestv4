# Header spacing — preview only

Separates the desktop header into a branding/account row and a full-width navigation row. Removes the heavy outer navigation box, keeps a subtle divider and the existing woven strip, and uses a compact consistent logo. Navigation labels stay on one line, with 44px button heights. Account controls have reserved space rather than compressing the navigation.

Below the existing desktop breakpoint, the compact menu remains available with explicit expanded state, a labelled open/close control, and larger menu targets. Brand navigation is now a keyboard-operable home button. Routes, action handlers, wallet behavior, role visibility and authentication remain unchanged.

Compiled-source review with an isolated synthetic student account: the reported 1106px desktop width and the 1024px breakpoint have no horizontal overflow; seven desktop navigation buttons are 44px high. Mobile at 390px has no overflow; menu toggling and selection-to-close work. Production build passes. Screenshot: local .taste-skill/after/header-desktop.png. No database/environment change or main merge.
