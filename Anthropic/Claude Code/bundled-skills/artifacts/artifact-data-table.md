---
name: artifact-data-table
description: Create an interactive data-table artifact — a sortable, filterable table for exploring a tabular dataset. Use when the user wants to browse, sort, or filter rows of data (a CSV, a list of records, query results, a catalog) rather than see it summarized. Keywords — table, list, browse, sort, filter, catalog, records, CSV viewer. Only for CREATING a new artifact; edits to an existing artifact modify its HTML directly.
---

Interactive table layout: a filter input, a dense sortable table (click a column header to sort), and a row count. Data is embedded as a JSON array; the bundled renderer draws and re-sorts it.

## How to use

1. Read `template.html` from this skill's base directory (listed above).
2. Copy it as your starting point. Replace each `<!-- SLOT: ... -->` marker with real content — the comment inside each slot describes what goes there. Each slot also carries placeholder text after the comment (sample headings, sample rows, sample values); replace that text too — removing the comment markers alone leaves the placeholders in the published page.
3. Self-check the filled HTML before publishing: no `SLOT` markers left, no placeholder text left.
4. Publish the filled HTML with the `Artifact` tool.

**Creation only.** When editing an existing data-table artifact, work with its current HTML directly — don't re-read or re-apply this template.

## Slots

| Slot | What to fill in |
| --- | --- |
| `TITLE` | Plain-text page title, e.g. "Product catalog". Appears **twice** — the `<title>` element near the top (this is what names the browser tab and the artifact itself) and the visible `<h1>` in the header. Fill both. |
| `COLUMNS` | JSON array of column definitions: `{key, label, type}`. `type` is `"text"` or `"num"` (right-aligned, numeric sort). |
| `ROWS` | JSON array of row objects, each keyed by the column keys. Embed the full dataset — the renderer handles scrolling (size ceiling under Data rules). |
| `FOOTER_NOTE` | Data source and generation timestamp. |

The template also has a minor inline slot for header scope text — labelled in place.

## Data rules

- Values in `"num"` columns must be JSON numbers, not strings — `1234.5`, never `"1,234.50"` or `"$1,234.50"`. Strip currency symbols and thousands separators; put the unit in the column label (e.g. "Amount (USD)"). A non-numeric value (a string like `"$1,234.50"`, a boolean) in a `"num"` column is shown as-is but skips number formatting and sorts to the end.
- A missing value is `null` (or omit the key) — never `0`, `"N/A"`, or `"-"`. Empty and whitespace-only strings also count as missing. The renderer shows missing cells blank and sorts them last.
- Dates go in `"text"` columns formatted ISO-8601 (`2026-07-08`), so the alphabetical sort is also the chronological one. Human-style dates ("Jul 8, 2026") sort wrong.
- Both JSON blocks must be strict JSON: double quotes, no trailing commas, no comments, no `NaN`/`Infinity`.
- Inside JSON string values, escape `</` as `<\/` and `<!--` as `<\u0021--` (both are valid JSON and parse back to the original text). Unescaped, `</script` terminates the script block early — breaking the table and letting the rest of the value render as live HTML — and `<!--` opens an HTML comment-like state inside script data with similarly corrupting effects.
- Numbers display with up to 6 decimal places. Pre-round values to the precision worth showing — mixed precision makes right-aligned columns ragged.
- Embed the full dataset up to a few thousand rows. Beyond that, subset or aggregate to what the user will actually browse, and say what was cut in `FOOTER_NOTE`.

## Restyle on top

The template's value is its working mechanics — layout, sorting, filtering. The shipped styling is a clean default (every paint token has a dark counterpart), not a final look: when the user's request or the subject matter suggests a different feel, restyle on top of it.

- Safe to restyle: the entire `<style>` block — colors, typography, spacing, striping, radii. When changing a palette token, change it in all four scopes it is declared in — the light `:root` block, the `@media (prefers-color-scheme: dark)` block, the `:root[data-theme="dark"]` block, and the `@media print` block (print is always light; a token missed there reverts to the shipped palette on paper) — so the restyled table follows the OS dark setting, the viewer's theme toggle, and printing. A value changed only in `:root` snaps back to the shipped palette in dark mode and print.
- Keep intact: the theming structure itself (all four scopes, including the `:where()` guard on the media block, the `color-scheme` pins, and the `@media print` re-pin block), the table markup structure, the `<script>` blocks, and the ids and classes the script reads — `dt`, `dt-filter`, `dt-count`, `arrow`, `sorted`, `num`, `empty`. Renaming or removing these breaks sorting, filtering, or theming.

## Notes

- The template is a **body fragment** — no `<!DOCTYPE>`/`<html>`/`<head>`/`<body>` wrapper. The Artifact tool adds its own skeleton at publish time.
- Data goes in the two JSON `<script>` blocks, not as literal `<tr>` markup — the renderer owns row emission so sort and filter work.
- The filter input matches substrings across all text columns; numeric columns are excluded from text filtering. A filter that matches nothing shows a built-in "No rows match" message — don't add your own.
- Tune `--accent` toward the subject matter if a different hue reads better — in every scope that declares it (see Restyle on top).
