# Import Spreadsheet To Native Google Sheets

When to read: after creating or locating a local spreadsheet file that should become a Google Sheets spreadsheet.

For new Google Sheets creation, prefer creating the local workbook with the `[@spreadsheets](plugin://spreadsheets@openai-primary-runtime)` plugin or `$Excel` skill before following this import path.

## Default Rule

Use native Google Sheets conversion by default.

For `.xlsx`, `.xls`, `.ods`, `.csv`, and `.tsv` inputs, the blessed path is the connector's spreadsheet import tool with `upload_mode: "native_google_sheets"`. Do not preserve the source file type unless the user explicitly asks to keep an Excel/OpenDocument/text spreadsheet file in Drive without converting it.

## Workflow

1. Confirm the local source path is an absolute path to a supported spreadsheet file: `.xlsx`, `.xls`, `.ods`, `.csv`, or `.tsv`.
2. Record each native Excel table and each range the user explicitly asked to create, add, or upgrade as a table: source sheet, header row, bounds, unique table name, and finite list-validation columns/options. Visual table-like structure alone is insufficient.
3. Import the file with the Google Drive connector spreadsheet import tool:
   ```json
   {
     "source_file": "/absolute/path/to/workbook.xlsx",
     "title": "Workbook name",
     "upload_mode": "native_google_sheets"
   }
   ```
4. Use the connector function exposed in the current runtime, for example `mcp__codex_apps__google_drive._import_spreadsheet(...)` or the equivalent Google Drive spreadsheet import tool.
5. Verify the import response reports native conversion, typically with `converted: true`, `mimeType: "application/vnd.google-apps.spreadsheet"`, and a `spreadsheetId` or spreadsheet URL.
6. Read spreadsheet metadata and confirm the title, URL, and sheet tabs.
7. Upgrade recorded table ranges using the workflow below.
8. Run `./reference-visual-quality.md` on the native destination after import and upgrades; local verification does not prove conversion preserved layout.
9. Deliver the verified native Google Sheet using the final-response citation contract in `SKILL.md`. Keep the local source file out of delivery unless explicitly asked for by the user.

## Upgrade Intended Tables

Spreadsheet conversion can preserve cells without creating native Sheets table metadata. For each recorded table:

1. Resolve the imported `sheetId` and map each recorded source range to the imported sheet. Require one nonblank header row and at least one data row.
2. Read `./reference-batch-update-recipes.md`. If metadata omits imported banding, use its title-preserving metadata request. Atomically replace only banding that exactly matches the intended table range; otherwise send `addTable` alone. Carry recorded finite list-validation columns as table `DROPDOWN` columns with the same options. Never rebuild or rewrite the sheet to remove banding. Use Sheets' default table styling. Set `table.rowsProperties` only when the user explicitly asks to carry imported header or band colors. Omit `tableId`; Sheets assigns it.
3. Set `include_spreadsheet_in_response: true` on the connector call.
4. Verify `replies[].addTable.table.tableId` and a matching name and range in `updatedSpreadsheet.sheets[].tables`. Formatting or a basic filter alone does not prove a native table exists.

Do not create native tables for matrices, calculation grids, financial models, report layouts, dashboards, or chart-source ranges unless the source used a native Excel table or the user asked for table semantics. A simple multiplication grid remains a normal range.

## Escape Hatch

Only use a non-native upload mode when the user explicitly asks to preserve the source file type, keep the file as Excel/OpenDocument/text, or avoid conversion.

For that explicit preservation request, use the connector's spreadsheet import tool with:
```json
{
  "source_file": "/absolute/path/to/workbook.xlsx",
  "title": "Workbook name",
  "upload_mode": "keep_source_file_type"
}
```

Use generic Drive `_upload_file(...)` only for generic file upload requests that are not asking for a Google Sheets spreadsheet outcome.

## Rules

- `native_google_sheets` is the default for spreadsheet imports.
- `keep_source_file_type` is opt-in and requires explicit user intent.
- Do not use generic `_upload_file(...)` for "import into Google Sheets"; it preserves the uploaded file instead of creating a native Sheet.
- Keep the local source file out of delivery after a successful native import unless explicitly asked for by the user.
