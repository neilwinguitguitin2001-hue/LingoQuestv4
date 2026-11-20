# Monthly report exports

Teacher: Class Analytics → Monthly reports. Administrator: aggregate overview → Monthly reports.

Select month, completed games or activity completions, grade and optional exact section. Generate first, review the table, then use Print / Save PDF or Export CSV. PDF opens a dedicated report window and the browser's print dialog; choose Save as PDF. It contains real selectable text and tables, not a dashboard screenshot. CSV opens in Excel or can be imported to Sheets; there is no automatic upload to a Google account.

Both exports use the same generated data snapshot, period, columns, filters, generation timestamp and notes. Changing a filter clears the old report. Philippine-time calendar boundaries are enforced by Postgres, with the next month's start excluded. Preview shows the first 20 rows; exports contain all returned rows. Over 1,000 detail records requires narrower filters; partial exports are disabled.

## Scope and limitations
- Teachers: currently approved assigned learners only, enforced by trusted assignments and existing performance authorization. No student IDs, LRNs, emails or raw answers are exported.
- Admins/sub-admins: aggregate summaries only; grade cohorts below five learners have activity counts withheld. School scope is required unless a trusted staff_roles entry grants division_admin/main_admin/coordinator scope. This does not create such a grant or give new individual access.
- Reports describe activity during the month using current permissions/rosters; they are not historical enrollment snapshots or lifetime progress reports.
- Completed games use quest_sessions with finished_at and next_index=10. Legacy quiz_results are excluded to avoid double counting; unfinished games excluded.
- Activity completions use timestamped lq_private.activity_completions. Undated progress, lifetime badges and writing drafts cannot be reliably assigned to a month and are excluded.
- Existing lifetime analytics print remains separately labeled.
- CSV fields are quoted and spreadsheet formula injection is neutralized. PDF HTML escapes record values.

## Validation
TypeScript and production build pass. Four unit tests cover API input scope/validation, CSV formula safety/quoting, actual escaped report text/table HTML and Philippine dates. Six rollback-only database checks passed: start/end boundaries included, outside-month excluded, unassigned teacher denied Grade 7 details, student direct call rejected, admin individual fields absent, small-group suppression. Test activity records were rolled back.

No existing records or access rules changed. Additive privacy_monthly_report RPC is authenticated-only with explicit staff checks and current assignment/school enforcement.
