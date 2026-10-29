---
name: google-sheets
description: Analyze and edit connected Google Sheets with range precision. Use when the user wants to create Google Sheets, find a spreadsheet, inspect tabs or ranges, search rows, plan formulas, create or repair charts, clean or restructure tables, write concise summaries, or make explicit cell-range updates.
---

# Google Sheets

Use this skill to keep spreadsheet work grounded in the exact spreadsheet, sheet, range, headers, and formulas that matter.

## Purpose Of This File

This file covers:

1. routing to the right spreadsheet workflow
2. stateful operation and mandatory routing to reference files
3. live-read/search safety for direct connector calls
4. final-response citations and delivery

Detailed editing, formula, chart, upload, live-read/search, and batch-update rules live in `references/`.  
Latency is not a constraint for this skill, so always read the relevant reference files before performing the task.  
If the user has not provided explicit style direction, read `references/style-profiles.md` and apply the appropriate Google Sheets destination default before authoring workbook formatting.

## Default Routing

1. New Google Sheet from a native Google Sheets reference or template URL: copy the entire source workbook with the Drive file-copy action, then trim or repair the copy. Treat a deep-linked `gid` as the initial view, not copy scope. Duplicate one source sheet only when the user explicitly requests a single-sheet extraction. Do not rebuild through `.xlsx` when chips, validation, formulas, rich links, or formatting matter.
2. Other new Google Sheets creation: Inspect the available skills and plugins for the registered `Spreadsheets` capability. It may be exposed as the `$Spreadsheets` skill, the `@Spreadsheets` plugin, or the plugin URI `plugin://spreadsheets@openai-primary-runtime`. If found, load and follow its instructions.
   - If a system spreadsheet plugin or skill is installed, YOU MUST use it to create a local `.xlsx`. Then import the `.xlsx` into Drive as a native Google Sheets spreadsheet. For table-like option/list/dropdown columns, seed a valid row and add native table `DROPDOWN` columns post-import.
   - If neither skill is installed, create the spreadsheet directly with Google Sheets MCP.
3. Existing Google Sheets edits: use Google Sheets MCP directly.

Deliver the verified native Google Sheet. Never include the local `.xlsx` unless explicitly asked for by the user.

## File Safety

Treat a provided Google Sheet as read-only unless the user explicitly asks to edit that file. When a task uses the Sheet as a reference, template, similar structure, or data source, copy it or create a separate Sheet, then verify the output spreadsheet ID differs before writing.

## Canonical Workflow Bias

Prefer one simple proven workflow over a large tree of recovery branches.  
When a task matches a known successful pattern, follow that pattern directly instead of re-evaluating every possible fallback path.  
Do not let accumulated edge-case guardrails turn a straightforward Sheets task into a long blocker-analysis exercise.

For sheet creation and editing tasks, prefer this sequence when viable:

1. Gather the required source material.
2. Pick the correct default routing.
3. Establish the sheet checklist or sheet plan.
4. Build or edit the sheet.
5. Verify the sheet is clean, complete, native, and scannable per `references/reference-visual-quality.md`.
6. Stop once the verified workflow has succeeded.

If a simple verified workflow is viable, use it. Do not drift into speculative alternate paths.

## Required Read Order (No Skips)

For every route that creates, imports, or edits a Google Sheet, read `references/reference-visual-quality.md` before final verification.

If Default Routing uses native Google Sheets reference-follow creation:
1. Read `references/reference-edit-workflow.md`
2. Read `references/reference-live-read-search-safety.md`
3. Read `references/reference-native-cell-structure.md`
4. Read `references/reference-batch-update-recipes.md`

If Default Routing uses the system spreadsheet plugin or skill like `[@spreadsheets](plugin://spreadsheets@openai-primary-runtime)` or `$Spreadsheets`:
1. Read the plugin/skill, e.g. `[@spreadsheets](plugin://spreadsheets@openai-primary-runtime)`
2. Read `references/reference-import-spreadsheet-to-native-sheets.md`
3. If the new Sheet has explicit or reference-derived option/list/dropdown columns, read `references/reference-batch-update-recipes.md` before the post-import table batch update.

If Default Routing uses connector edit workflow:

1. Read `references/reference-edit-workflow.md`.
2. Before any direct live range read, cell read, or `search_spreadsheet_rows`, read `references/reference-live-read-search-safety.md`.
3. Read every task-specific file from the matrix below.
4. If the task spans multiple categories, read all matching files.
5. If uncertain, read every file in `references/`.

## Final Answer Requirement

Unless Default Routing selected native Google Sheets reference-follow creation, if the registered `Spreadsheets` capability like the `[@spreadsheets](plugin://spreadsheets@openai-primary-runtime)` plugin is available, you MUST use one of them to create a local `.xlsx` and import it to Google Drive with `upload_mode: "native_google_sheets"`.

### Final Response Citations

- **Create/edit:** for created or edited spreadsheets, cite each final deliverable exactly once with `purpose="output"`, in its own paragraph. Briefly describe the result without repeating its filename, path, or link. Never put output directives inside prose or list items.
- **Q&A and summaries:** Every file whose contents you summarize or use to support an answer MUST receive a `:codex-file-citation{...}` with `purpose="source"` in the final response. Use the source citation in place of the filename, wherever the filename would appear. Do not write the filename separately and append its citation at the end. Files merely inspected but not used in the answer need no citation. Do not emit output citations for unchanged files or read-only answers.

- Emit `:codex-file-citation{...}` directly, without backticks, code fences, or a Markdown-link wrapper. Use verified targets only. No need to cite or reference intermediate work.

Deliver a native Google Sheets file even when another authoring workflow was used to build it, unless the user explicitly requests preservation of the source file type or no conversion. Set `path` to its verified native URL returned by the connector and omit `mode`. Citation directives are exempt from "Return web URLs as Markdown links."

Some illustrative examples, real responses use verified targets outside code fences.

```text
:codex-file-citation{path="https://docs.google.com/spreadsheets/d/<verified-file-id>" purpose="output"}
```

```text
The review of :codex-file-citation{path="https://docs.google.com/spreadsheets/d/<verified-file-id>" purpose="source"} is due Friday.
```

### Spreadsheets location

Use/create `ChatGPT` at My Drive root. Place new spreadsheets created from scratch or from a template there.  
Edit existing spreadsheets in place.

Respect user-specified locations.

## Connector Load Checklist

1. Confirm the exact target Google Sheet URL or spreadsheet id before editing an existing spreadsheet.
2. If the user only gives a title or title keywords, use the connector/app search path to identify candidate spreadsheets before asking for a URL.
3. Resolve and record the spreadsheet id, target sheet names, and `sheetId` values.
4. Read spreadsheet metadata before deeper reads or writes.
5. For direct live range reads, cell reads, or `search_spreadsheet_rows`, use exact visible tab names from metadata, bounded ranges, and the recovery rules in `references/reference-live-read-search-safety.md`. Do not guess `Sheet1`, scan whole grids, or retry oversized row searches.
6. Before each edit pass, identify the exact sheet, range, headers, formulas, and validation constraints being edited through connector reads.
7. Re-read target cells before writing when live values, formulas, formatting, or validation could affect the write.

## Task To Reference Map

| Task area | Required reference file |
| --- | --- |
| Existing spreadsheet edit workflow, grounding, validation-backed cells, output conventions, and write planning | `references/reference-edit-workflow.md` |
| Direct live range reads, cell reads, row searches, tab/range recovery, and oversized search avoidance | `references/reference-live-read-search-safety.md` |
| Adding or inserting rows or columns beside populated data while preserving validation, chips, formulas, and formatting | `references/reference-native-cell-structure.md` |
| Reference/template following from a provided Google Sheet | `references/reference-native-cell-structure.md` |
| Raw Sheets write shapes and example `batch_update` bodies | `references/reference-batch-update-recipes.md` |
| Importing a local spreadsheet and upgrading intended tables to native Sheets tables | `references/reference-import-spreadsheet-to-native-sheets.md` |
| Formula design, repair, rollout, or syntax refresh | `references/reference-formula-patterns.md` |
| Chart creation, repair, chart-spec recall, or repositioning | `references/reference-chart-recipes.md` |
| Unspecified styling for native Google Sheets destinations | `references/style-profiles.md` |
