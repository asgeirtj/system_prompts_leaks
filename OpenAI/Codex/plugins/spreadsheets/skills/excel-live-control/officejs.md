# Excel Office.js For Live Workbook Control

Use this guidance only after this skill has selected a connected session and fetched that session's `run_officejs` schema.

Office.js is a live-control implementation detail, not a separate workbook-design mode. Continue following this skill's live workbook quality checklist and any local style, chart, or domain guidance already loaded for the task.

Default to the direct live workbook tools identified in `SKILL.md` when the selected session advertises them.

Use `run_officejs` only for compact workbook scans, coherent batch operations, or Office.js-only APIs that direct tools cannot express. Do not use it for ordinary sparse writes, chart/table/pivot/resize tasks covered by direct tools, full workbook builds, or optional cleanup.

Sections: Decision Order; Harness Contract; Staged Workbook Pattern; Large Source Ranges; Range Shape Rules; Layout And View Safety; Load, Sync, And Proxy Rules; Charts; Recovery Rules.

## Decision Order

Before writing Office.js code:
1. Use direct live workbook tools if they can express the operation.
2. Use `run_officejs` only for a compact scan, coherent batch operation, or Office.js-only API.
3. Keep each script to one operation class when possible.
4. After any failure, inspect what changed before retrying because `run_officejs` is non-transactional.

## Harness Contract

Provide function-body statements for the wrapper. Use the provided `ctx`; do not call `Excel.run()`. Use `Excel` only for enums/constants.

Return only JSON-serializable values, never Office proxy objects. Use explicit worksheet names and A1 ranges; do not rely on active sheet, active range, UI focus, or selection for workbook correctness.

Make create-or-recreate logic idempotent, and inspect state first with direct tools such as `read_sheets_metadata` or `list_items`.

## Staged Workbook Pattern

For generated or multi-sheet workbooks, do not attempt create, clear, write, formula, format, validation, chart, view, and cleanup work in one script. `run_officejs` is non-transactional, so partial changes can remain after an error.

After each mutation phase, verify its bounded output before starting a dependent phase.

Use this sequence:

1. Inspect workbook state with `read_sheets_metadata`.
2. Create or rename only missing target sheets in a small script.
3. Re-inspect sheet metadata before using sheet IDs or cached names.
4. Clear only known target ranges or sheets. Do not rely on range clearing to remove charts, tables, pivots, shapes, or names.
5. Write raw values and formulas in small chunks.
6. Verify with `read_ranges`.
7. Inspect derived formulas and visible results; fix formula errors, broken references, blank outputs, or obvious mismatches with the requested logic before formatting.
8. Apply formatting and validation in separate scoped calls.
9. Use direct `chart`, `table`, and `pivot_table` tools for those objects after the source ranges are verified.
10. Apply freeze panes, activation, selection, or other view polish last, and skip it if it is flaky.
11. Capture a final `read_range_image` for visual verification when layout matters.

For model, tracker, dashboard, or report workbooks, prefer helper ranges and linked formulas over static pasted summaries. Use `run_officejs` to place or inspect content efficiently, but keep formulas, assumptions, source sections, and outputs auditable in the workbook itself.

Split scripts when they mix operation classes, span multiple worksheets or independent sections, or are large enough to risk request-size, queued-operation, or timeout limits. Prefer direct-tool writes for large regular blocks.

## Large Source Ranges

Do not load a large source table into model context merely to inspect or summarize it. Read the header and bounded representative samples, then use `search_workbook` or a compact `run_officejs` aggregate/profile scan for counts, bounds, distinct values, and missingness. Formulas may reference the source range directly without copying its contents into context. When the task truly requires all values, read in chunks sized to the advertised tool limits.

## Range Shape Rules

Office.js writes must be rectangular two-dimensional arrays with exact shape.

```ts
sheet.getRange("C3").values = [[5]];
sheet.getRange("E3").formulas = [["=C3*D3"]];
sheet.getRange("B8:G8").values = [["A", "B", "C", "D", "E", "F"]];
```

For data-sized blocks, derive the target range from the array dimensions instead of hand-counting the final A1 address.

```ts
function assertRectangular(rows) {
  if (rows.length === 0 || rows[0].length === 0) {
    throw new Error("Cannot write an empty block");
  }
  const width = rows[0].length;
  if (!rows.every((row) => row.length === width)) {
    throw new Error("All rows must have the same width");
  }
}

function writeValues(sheet, topLeft, rows) {
  assertRectangular(rows);
  sheet
    .getRange(topLeft)
    .getResizedRange(rows.length - 1, rows[0].length - 1).values = rows;
}

function matrix(rows, cols, value) {
  return Array.from({ length: rows }, () => Array(cols).fill(value));
}
```

Use the same shape rule for `formulas`, `formulasR1C1`, and `numberFormat`. A one-column number-format matrix cannot be assigned to a multi-column range.

Prefer Excel formulas such as `=DATE(2026,6,8)` when preserving date semantics matters. If writing text like `8-12`, set the target `numberFormat` to `@` before writing or write through a direct tool that preserves text.

## Layout And View Safety

Do not use page-layout, print-area, fit-to-page, paper-size, orientation, margin, or print-scaling APIs as a visual-quality repair. Use them only when the user explicitly requests print-ready output and the advertised schema or supported Office.js API can express the operation.

Avoid whole-sheet autofit and mixed-block autofit on presentation sheets. Set bounded widths for coherent columns, wrap long text, and stack sections when side-by-side layout becomes too wide. Keep chart sources and helper calculations on a helper/analysis sheet rather than far to the right or below the user-facing layout, then use `read_range_image` to verify important presentation regions.

## Load, Sync, And Proxy Rules

Property reads usually require `load(...)` followed by `await ctx.sync()`.

```ts
const range = sheet.getRange("B2:E6");
range.load("values, formulas, text");
await ctx.sync();
return {
  values: range.values,
  formulas: range.formulas,
  text: range.text,
};
```

For null-object checks:

```ts
const maybeSheet = ctx.workbook.worksheets.getItemOrNullObject("Scratch");
maybeSheet.load("isNullObject");
await ctx.sync();
if (!maybeSheet.isNullObject) {
  maybeSheet.delete();
  await ctx.sync();
}
```

Use null-object checks for small, explicit targets only. For generated workbook setup, prefer `read_sheets_metadata` first and then add only the missing sheets by name; avoid helper functions that repeatedly call `getItemOrNullObject` and `ctx.sync()` across many objects unless a direct metadata tool cannot provide the state.

Avoid broad workbook collection enumeration inside `run_officejs` when direct metadata tools can answer the question. Collection proxy iteration and cleanup loops are more fragile than explicit object access; if you need workbook objects, prefer `list_items`, `read_sheets_metadata`, or known `getItem(...)` lookups.

## Charts

Prefer the direct `chart` tool and follow `features/charts.md` for chart-source, orientation, and visual verification. For live Excel, confirm chart objects with `list_items` and inspect the output with `read_range_image` when layout matters.

If a chart appears blank, inspect the source cells first, then update the chart source with the direct `chart` tool.

## Recovery Rules

On `run_officejs` failure, assume partial execution may have occurred. Inspect touched ranges with `read_ranges`, sheets with `read_sheets_metadata`, and workbook objects with `list_items` before retrying.

Do not respond to a failed non-transactional call with a broader recovery script. Retry only the failed phase with smaller scope, preferably with direct tools when they fit. If Excel reports duplicate names or identifiers, inspect first, then reuse or delete the specific existing object before retrying.

If Excel reports an internal error after a large script, verify what landed before repairing. The workbook may already be usable.

If Excel recovers, reloads, or commands start failing after workbook or session changes, repeat the workbook-registration discovery rules in `SKILL.md` and use the new `executor_session_id`.

Do not loop on timeouts. Reduce the scope, change tool choice, or stop after the core workbook content is verified.
