# Live Read And Search Safety

When to read: before direct connector range reads, cell reads, or `search_spreadsheet_rows` calls against an existing Google Sheet.

## Rules

- Read spreadsheet metadata before direct live reads or searches. Record visible sheet titles, `sheetId` values, grid row/column counts, frozen/header rows if exposed, and any relevant named ranges.
- Use exact visible sheet titles from metadata. Do not assume `Sheet1`, `Sheet2`, localized default names, or title-derived tab names.
- If a spreadsheet has exactly one visible sheet, you may infer that sheet for read-only inspection after metadata confirms it. For writes, still name the resolved sheet explicitly.
- Keep `sheet_name` and cell-only `range` separate when the connector has separate arguments. Use a full A1 string with quoted sheet names only for tools that require a single A1 range argument.
- Quote sheet names in full A1 notation when they contain spaces, punctuation, apostrophes, or non-ASCII characters.
- Bound `search_spreadsheet_rows` calls to the smallest plausible rectangle. Avoid whole-grid or whole-column searches unless the computed scan is safely below the tool cap.
- Keep row-search scans under 50,000 cells. Compute `(end_row - start_row + 1) * scanned_column_count` before the call, and chunk by rows or columns when the first useful range would exceed the cap.
- Do not call row search with an empty query, a query that only repeats a sheet title, or `return_columns` outside the searched rectangle.
- If a range or tab read fails, do not retry the same guessed range. Re-read metadata, list exact tab names in your working notes, then retry with a metadata-derived sheet and a smaller range.
- Prefer targeted sentinel reads such as header rows, known id columns, or bounded data rectangles before escalating to broader scans.

## Recovery Patterns

- Tab not found: re-read metadata, compare against exact visible titles, then use the single visible sheet only if metadata proves there is one.
- Range parse error: separate `sheet_name` from cell-only `range` when possible, or quote the sheet name in full A1 notation.
- Range too large: shrink to header plus likely data columns, then page through bounded chunks. Do not repeat the oversized call.
- No rows found: confirm the query value exists in a small displayed-value read before broadening the search.
