# Edit Workflow

When to read: before existing Google Sheets inspection that may lead to an edit, and before any existing spreadsheet content write or edit operation.

## Workflow

Read `./reference-live-read-search-safety.md` before connector reads or row search, and `./reference-native-cell-structure.md` before extending populated rows or columns.

1. If the spreadsheet or tab is not already grounded, identify it first and read metadata before deeper reads or writes.
2. Prefer narrow reads and row search over dumping large tabs into context.
3. Ground the task in exact sheet, range, header, and formula context before proposing changes.
4. When a read could influence a write, default to `get_cells`. Treat `get_range` as the exception and use it only when plain displayed values are truly sufficient.
5. If the task involves filling in, editing, or normalizing existing cells, do not rely on `get_range` alone. Inspect the target cells with `get_cells` first so value choices come from the live cell metadata.
6. When validation-backed cells may matter, prefer a `get_cells` read that includes the live constraint data you need, for example `dataValidation,formattedValue,effectiveValue,userEnteredValue`.
7. When preparing to write into existing cells, check whether the target range is constrained by dropdowns or other data validation before choosing values.
8. Do not infer allowed values from plain neighboring text alone when validation may exist.
9. If validation is present, restate the allowed values or rule before drafting or applying the write.
10. Before the first write-heavy `batch_update`, read `./reference-batch-update-recipes.md` for request-shape recall.
11. Cluster logically related edits into one `batch_update` so the batch is coherent and atomic.
12. Avoid both mega-batches and one-request micro-batches.
13. If the user asks to clean, normalize, or restructure data, summarize the intended table shape before writing.
14. For exact-row, fixed-count, or report-style tasks, keep the findings narrowly scoped to the requested conclusions only.
15. Do not add extra metrics, adjacent commentary, or bonus rows unless the user asked for them.
16. After writing, run `./reference-visual-quality.md` before the final answer.

Preserve existing values, formulas, validation, chips, and formatting outside the requested change. For content-only edits, retain the target cell's formatting unless the user asks to change it.

## Output Conventions

- Always reference the spreadsheet, sheet name, and range when describing findings or planned edits.
- For `batch_update` work, use a compact table or list with the request type, target range or sheet, proposed change, and reason.
