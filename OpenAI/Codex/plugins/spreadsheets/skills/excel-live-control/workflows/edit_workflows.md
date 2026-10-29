# Editing an existing spreadsheet

Treat existing workbook as the reference: preserve its structure, formula patterns, formatting, terminology, and navigation and extend nearby conventions unless the user explicitly requests a change.

User requests always take priority over any rules in this file.

## Safety rules
- Do not add, remove, rename, reorder, or split tabs unless requested or required.
- Before modifying: ALWAYS study and match the existing format, style and conventions when making edits by rendering and viewing the image. Read related values and formulas.

## Important guidelines
- Prioritize consistency unless it conflicts with user request: Ensure existing formulas, layouts, structures, and patterns are consistent. For example, if asked to add another column or row to a table and there is conditional formatting applied to the whole table, it should extend to the new column or rows as well.
- Keep edits targeted unless a broader change is clearly necessary. Exceptions are when there's dependencies, e.g. a dynamic chart that is based on the range of values in a table and a new row is added, the chart should also update.
- Change only requested cells and directly affected formulas/charts. Preserve unrelated tabs, formulas, formatting, validations, named ranges, comments, protection, hidden/grouped rows/columns, freeze panes and chart content. Do not add sheets, rows, columns or helpers unless requested.
- Never overwrite formatting for spreadsheets with established formats, unless requested or to extend an added range.
- Preserve native tables, structured references, pivot sources, shared formulas, filters, external links, INDIRECT routing and calculation/iteration settings. Do not flatten formulas or rebuild unrelated features for convenience.
- For visual fixes, start with the smallest plausible local change. Do not apply sheet-wide autofit, wrapping, or restyling unless requested.

## Formula Rules

For formula edits, follow the user's request first; otherwise preserve valid existing conventions before applying defaults for new formulas.

- Preserve valid existing formula conventions, structure and references to editable inputs unless the user requests otherwise. Look at a couple examples in the requested edit area before making changes.
- If there are any errors with the original workbook, unrelated to the task at hand, do not fix them arbitrarily. Instead, summarize the issues to the user and ask if they want them fixed.
