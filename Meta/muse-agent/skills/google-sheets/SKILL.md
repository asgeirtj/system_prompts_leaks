---
name: "google_sheets"
description: "Read, write, and manage the user's Google Sheets."
icon: "google_sheets"
metadata: { "includeInPrompt": false }
---

# Google Sheets

## Purpose
Manage Google Sheets through `hatch_gws_cli`; the vendored Google Workspace CLI is the only implementation path.

## Tooling
Use `exec` to run:

```sh
hatch_gws_cli sheets <resource> <method> [flags]
```

### Connection management

```sh
hatch_gws_cli sheets status
hatch_gws_cli sheets disconnect
```

### Sheets operations

Core patterns:
- `hatch_gws_cli sheets status`
- `hatch_gws_cli sheets disconnect`
- `hatch_gws_cli schema sheets.spreadsheets.get`
- `hatch_gws_cli schema sheets.spreadsheets.create`
- `hatch_gws_cli schema sheets.spreadsheets.values.get`
- `hatch_gws_cli schema sheets.spreadsheets.values.append`
- `hatch_gws_cli schema sheets.spreadsheets.batchUpdate`

Common raw API calls:
- `hatch_gws_cli sheets spreadsheets get --params '{"spreadsheetId":"<spreadsheet_id>"}'`
- `hatch_gws_cli sheets spreadsheets create --json '{"properties":{"title":"My Spreadsheet"}}'`
- `hatch_gws_cli sheets spreadsheets values get --params '{"spreadsheetId":"<spreadsheet_id>","range":"Sheet1!A1:D10"}'`
- `hatch_gws_cli sheets spreadsheets values append --params '{"spreadsheetId":"<spreadsheet_id>","range":"Sheet1!A:D","valueInputOption":"USER_ENTERED"}' --json '{"values":[["a","b"],["c","d"]]}'`
- `hatch_gws_cli sheets spreadsheets batchUpdate --params '{"spreadsheetId":"<spreadsheet_id>"}' --json '{"requests":[{"addSheet":{"properties":{"title":"Q2"}}}]}'`

Vendored helpers are also available:
- `hatch_gws_cli sheets +read ...`
- `hatch_gws_cli sheets +append ...`

JSON output contract:
- `status`: parse `status`, `connect_url`, and `disconnect_url`
- `disconnect`: parse `ok`, `action`, `status`, and `disconnect_url`

## Formatting spreadsheet content

Write and format the spreadsheet through the Sheets API. Do not upload a file over it.

1. Write the values with `spreadsheets.create`, `values.update`, or `values.append`. Set `valueInputOption` to `USER_ENTERED` so Sheets parses dates, currency, and formulas.
2. Set the styling in one `spreadsheets.batchUpdate` call. `repeatCell` with `userEnteredFormat` sets the header style and the number formats. `updateSheetProperties` freezes the header row. `updateDimensionProperties` sets column widths. A new spreadsheet can carry these formats in the `spreadsheets.create` body instead.
3. Read the result back before you call it ready. A successful write proves the API accepted the request, not that the sheet reads correctly. `spreadsheets.get` returns no cell data by default, so pass a field mask: `hatch_gws_cli sheets spreadsheets get --params '{"spreadsheetId":"<spreadsheet_id>","ranges":"<tab>!A1:F10","fields":"sheets(properties(title,gridProperties(frozenRowCount)),data(rowData(values(formattedValue,effectiveFormat(backgroundColor,numberFormat,textFormat)))))"}'`
4. Never publish a `.xlsx` file over a spreadsheet with `drive files update`. Google replaces the full contents of the file, so that upload discards every other tab and every edit the user made. To change one part of a spreadsheet, use `values.update` or `spreadsheets.batchUpdate`. To give the user a workbook to download, build a spreadsheet artifact and attach the file.

## Auth
Authentication is handled by the wrapper's `status` and `disconnect` subcommands. Do not hand-write credential files or run raw `gws auth ...`.

## First-use setup flow
1. Run `hatch_gws_cli sheets status`.
2. If `status` is `unavailable`, tell the user that Google Sheets is not available on this device. Do not offer alternative integration approaches or ask the user for credentials.
3. If `status` is `not_connected` and `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Google Sheets](<connect_url>)`; do not paste the raw URL separately. Wait for the user to reconnect.
4. Once `status` is `connected`, proceed with Sheets operations.

## Operating Rules
1. Use `schema` before unfamiliar Sheets methods so `--params` and `--json` match the current vendored CLI contract.
2. Use A1 notation for ranges unless the user explicitly wants a different API path.
3. Creating a spreadsheet, clearing cells, and editing a spreadsheet owned only by the user may proceed from a clear request. Confirm before editing a shared spreadsheet because its contents can be exposed to or changed for other people.
4. Treat spreadsheet IDs and sheet IDs as opaque strings and only use IDs returned by prior commands or explicit user input.
5. Run `hatch_gws_cli sheets disconnect`. After running it, when `disconnect_url` is present, replace `<disconnect_url>` with the returned URL and share exactly this Markdown link: `[Disconnect Google Sheets](<disconnect_url>)`; do not paste the raw URL separately.
6. Prefer `spreadsheets.get` or `sheets +read` before writing when you need to inspect current sheet structure or cell contents. To write or style a sheet, follow "Formatting spreadsheet content" above.
7. After a read or write action, confirm the user-visible result only. Do not surface raw API identifiers (spreadsheet and sheet IDs) or other internal response fields (page tokens/cursors, raw JSON) in text shown to the user unless the user asks for them or you need them to troubleshoot a failure; keep using them internally to chain follow-up commands.
