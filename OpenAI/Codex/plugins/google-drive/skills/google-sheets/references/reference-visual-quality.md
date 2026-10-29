# Spreadsheet Visual Quality

When to read: before finalizing any Google Sheet created, imported, or edited.

## Scope

- Edit: changed cells/objects plus visible neighbors or dependents.
- New, imported, or reference/template-based Sheet: every populated visible sheet and important output/chart; compare equivalent reference views.

For a new Sheet, size/style the authored area as a whole, never the unused grid.

## Final Check

1. Verify values/formulas and native structure, then inspect the Google-rendered Sheet at normal zoom.
2. Fix clipping, awkward wrapping, overlap, unreadable controls, or damaged layout with the smallest change. For an inserted or substantially changed populated column, use Resize a Column in `./reference-batch-update-recipes.md`.
3. Validate formatting is applied properly and consistently (e.g. when styling a table, prefer rules based conditional formatting over manual per-row formatting).
4. Re-read and re-render. Confirm the fix and no unrelated data, structure, dimension, or layout changes.

Never sheet-wide autofit or restyle an edit, import, reference, or template without authorization. Preserve intentional fixed dimensions and report unavoidable clipping.

## Google Sheets Evidence - Visual Verification

If CUA is authenticated and enabled, use it for visual verification of each sheet. If CUA is unavilable, export the Google Sheet to `.xlsx` and import, render and inspect via artifact_tool_v2. Note that Gsheet specific structures may not fully port to local .xlsx and there are known compatability differences between Gsheet and Excel. Do not verify via exported PDF as it may look very different. If none of these available, do a best effort visual validation pass by reading the formatting and style details directly from GoogleSheet API.
