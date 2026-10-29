# Google Sheets Style Profiles

When to read: before creating or editing a Google Sheet when the user has not provided explicit style direction.

## Precedence

1. User style instructions, attached templates, or explicit examples win.
2. Existing spreadsheet style wins when editing an existing Sheet unless the user asks to restyle it.
3. Task-specific needs can upgrade the style, for example dashboards, executive reports, or financial models.
4. If none of the above applies, use the destination default profile below.

## native_google_sheets_default

Use this profile when styling is unspecified and the final artifact is a native Google Sheet.

Defaults:
- keep the sheet close to native Google Sheets defaults
- white grid with black text
- light gray header rows
- subtle borders only where they aid scanning
- filters and freeze panes for scrolling tabular data; skip for small static ranges, matrices, and calculation grids unless requested otherwise
- plain source URL columns
- apply the same default style profile consistently across every sheet after native conversion or live writeback, including imported object-level styling such as table/banding styles or conditional formats

Avoid unless requested:
- dark title bands
- colored banded tables
- per-sheet or imported styles that make one tab visually inconsistent with the rest of the workbook
- heavy theme accents
- dashboard cards or report-style panels
