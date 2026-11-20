# Dashboard navigation review

## Changes
- Shared page navigation for Island Quests, Writing Lab, My Progress, badges, optional activity board, Quest Market and account settings. Back names the previous page; Dashboard home is always an explicit role-aware fallback.
- Browser Back/Forward tracks major in-app page transitions and restores the selected lesson module. History is isolated per sign-in session; entries from a previous account cannot restore its pages. Returning to a lesson reopens discussion rather than restarting an abandoned quiz.
- Teacher sections include Back to student roster; administrator/sub-admin sections include Back to approval queue. These local controls return to the existing default section; they do not add routes or grant permissions. Browser history tracks major pages, not every internal dashboard tab/filter.
- Existing lesson, quiz setup, results, exit menu and island map controls remain. Header links and browser Back now ask for confirmation before leaving an active quiz. Existing exit-dialog actions do not ask twice. Browser close/reload receives the native unfinished-session warning.
- Writing Lab asks before discarding nonempty editor content; empty editors navigate normally. Existing saved submissions remain unchanged. No draft is sent to a new service or stored on a shared device.
- Landing and approval screens retain their authentication controls; no unauthorized shortcut to dashboards is introduced.

## Validation
TypeScript and production build passed. Four automated checks passed: history token/index boundaries, cancellable navigation, destination labels/dashboard fallback, keyboard-accessible section buttons. Browser checks and sample-account sign-in depend on browser access; do not interpret these tests as a full end-to-end navigation audit.

## Scope preserved
No database changes, auth changes, grade/module sequence, game counts, timers, scoring, XP, badges or progress logic changes. This branch starts from main and retains the merged module video/typography. Other unmerged feature previews remain separate.
