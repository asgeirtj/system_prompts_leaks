# Google Sheets

- Run `/opt/hatch/bin/hatch_gws_cli sheets <resource> <method>` through `muse.exec`. This wrapper around the vendored Google Workspace CLI is the only route to Google Sheets.

- Pass query and path values in `--params '<JSON object>'` and request bodies in `--json`. Check `/opt/hatch/bin/hatch_gws_cli schema sheets.<resource>.<method>` before an unfamiliar method so the inputs match the current CLI.

## Connect

- Run `/opt/hatch/bin/hatch_gws_cli sheets status` and read `status`, `connect_url` and `disconnect_url`.

- If `sheets status` fails, tell the user Google Sheets is not available on this device. Do not offer another integration route or ask for credentials.

- If it is `not_connected` and `connect_url` is present, share exactly `[Connect Google Sheets](<connect_url>)` with the returned URL, without also pasting the raw URL. Wait for the user to connect, then continue once `status` is `connected`.

- To disconnect, run `/opt/hatch/bin/hatch_gws_cli sheets disconnect`, which returns `ok`, `action`, `status` and `disconnect_url`. Share exactly `[Disconnect Google Sheets](<disconnect_url>)` with the returned URL.

- Authentication stays in these commands. Never write credential files or run raw `gws auth` commands.

## Read a spreadsheet

```text
/opt/hatch/bin/hatch_gws_cli sheets spreadsheets get --params '{"spreadsheetId":"<spreadsheet_id>"}'
/opt/hatch/bin/hatch_gws_cli sheets spreadsheets values get --params '{"spreadsheetId":"<spreadsheet_id>","range":"Sheet1!A1:D10"}'
```

- Use `spreadsheets get` for the workbook's structure and `spreadsheets values get` for an A1 range. The `+read --spreadsheet <spreadsheet_id> --range '<A1 range>'` shortcut also reads values. Check `schema sheets.spreadsheets.<method>` or `schema sheets.spreadsheets.values.<method>` for exact inputs.

- Use A1 notation for ranges unless the user wants a different API path.

- Read the current structure or cell contents before writing. Treat spreadsheet and sheet IDs as opaque, and use only IDs returned by earlier commands or given by the user.

## Write and format cells

```text
/opt/hatch/bin/hatch_gws_cli sheets spreadsheets create --json '{"properties":{"title":"<title>"}}'
/opt/hatch/bin/hatch_gws_cli sheets spreadsheets values append --params '{"spreadsheetId":"<spreadsheet_id>","range":"Sheet1!A:D","valueInputOption":"USER_ENTERED"}' --json '{"values":[["a","b"],["c","d"]]}'
/opt/hatch/bin/hatch_gws_cli sheets spreadsheets batchUpdate --params '{"spreadsheetId":"<spreadsheet_id>"}' --json '{"requests":[{"addSheet":{"properties":{"title":"Q2"}}}]}'
```

- Write values with `spreadsheets create`, `values update` or `values append`. The `+append --spreadsheet <spreadsheet_id> --values 'a,b,c'` shortcut adds one row to the first visible tab, and `--json-values '[["a","b"],["c","d"]]'` adds several. Use `values append` with a range for any other tab.

- Set `valueInputOption` to `USER_ENTERED` when Sheets should parse dates, currency and formulas, and to `RAW` when those strings are data. `+append` always parses, so use `values append` or `values update` for `RAW`.

- Apply styling in one `spreadsheets batchUpdate` call. `repeatCell` with `userEnteredFormat` sets header styles and number formats, `updateSheetProperties` freezes the header row and `updateDimensionProperties` sets column widths. A new spreadsheet can carry these formats in its `spreadsheets create` body instead.

- Keep the spreadsheet ID, tab IDs and unaffected ranges intact.

- Creating a spreadsheet, clearing cells or editing a spreadsheet only the user owns may proceed from a clear request. Confirm before editing a shared spreadsheet, because its contents can change for other people.

## Verify the workbook

- A successful write proves the API accepted the request, not that the sheet reads correctly. Read the result back before calling it ready.

- `spreadsheets get` returns no cell data by default, so pass ranges and a field mask:

```text
/opt/hatch/bin/hatch_gws_cli sheets spreadsheets get --params '{"spreadsheetId":"<spreadsheet_id>","ranges":"<tab>!A1:F10","fields":"sheets(properties(title,gridProperties(frozenRowCount)),data(rowData(values(formattedValue,effectiveFormat(backgroundColor,numberFormat,textFormat)))))"}'
```

- Check formulas as well as values.

- Never upload an `.xlsx` over a Google Sheet with `drive files update`. Google replaces the whole file, discarding every other tab and every edit the user made. Change one part with `values update` or `spreadsheets batchUpdate`, and give the user a downloadable workbook by building a spreadsheet artifact instead.

## Report the result

- Confirm the result the user can see. Keep spreadsheet and sheet IDs, page tokens and raw JSON out of replies unless the user asks or you need them to troubleshoot a failure.

## Related skills

- [Bookkeeping and Invoicing](/opt/muse/skills/business-finance/SKILL.md)

- [Documents](/opt/muse/skills/documents/SKILL.md)

- [Form Design](/opt/muse/skills/form-design/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
