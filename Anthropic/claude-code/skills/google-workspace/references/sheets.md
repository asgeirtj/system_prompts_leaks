# Google Sheets reference

As a first step, before you create a sheet or change one, you must read the spreadsheet design rules below in full. After them, this file covers the Sheets connector (`get_spreadsheet`, `get_values`, `update_values`, `update_formulas`, `insert_dimension`, and `update_spreadsheet`) and how to carry out the design rules with it. Most of the connector behavior here was tested against Google's Sheets API; the rest was seen through the connector, and a few rules have not been checked yet.

# Spreadsheet design

When the user asks for something specific, such as tab names, column headers, a formula or a number format, do exactly that, and don't replace it with a design of your own; these rules decide what the user left open. When you edit an existing workbook, its conventions come first (see "Editing an existing workbook"). The rules for wording sheet names, headers, labels and notes are under "Writing in the workbook".

A reader judges a spreadsheet by whether its numbers are right and whether they can check them. Build it so that clicking any number shows either a formula they can trace or a labeled input they can change.

## Formulas, not typed results

- **Every derived number is a formula** that references the cells it comes from: totals, averages, ratios, growth rates, lookups. Write `=SUM(B2:B9)`, not a total you worked out yourself.
- **This holds when you work in code.** Use code to read, explore and reshape data, but the results you put in the sheet are formulas over the source cells. If the task is "summarize this 5,000-row tab", the summary cells hold `=AVERAGE(Data!B2:B5001)` and `=SUMIFS(...)`, not numbers computed in pandas.
- **Typed values are for data brought in from outside**, such as rows from a file, a query or a web page (sorting, filtering or removing duplicates first is fine), and for the inputs listed under "Inputs and hardcoded values". A sum, average or ratio computed in code and pasted in is a hardcoded result.
- **Put statistics and findings in labeled cells.** `=CORREL(B2:B100, C2:C100)` goes in a cell labeled "Correlation, price vs. volume". Any figure you report should be one the reader can find in the file.
- **Reference data that is already in the workbook.** Don't rebuild it elsewhere as a pasted "clean" copy; point formulas at the source.
- **Chart data is formulas or references** to the source, not a pasted block of numbers.
- **Formulas cover most analysis:** aggregation (`SUM`, `SUMPRODUCT`), conditions (`SUMIFS`, `COUNTIFS`), lookups (`INDEX`/`MATCH`) and statistics (`CORREL`, `STDEV`, `SLOPE`). Which newer functions Sheets supports is under "Function support" below.
- **Syntax basics:** start every formula with `=`. Put text in double quotes (`=IF(A1="Yes",1,0)`); a bare word gives `#NAME?`. Arithmetic on a cell that holds text gives `#VALUE!`.

Before you finish, check that a reader can click any number in the analysis and see how it was derived. Replace any bare value that should be a formula.

## Inputs and hardcoded values

- **Every business assumption lives in its own labeled cell**, and formulas reference it: `=B5*(1+$B$6)` where B6 is labeled "Revenue growth %", never `=B5*1.05`. This covers growth rates, margins, tax rates, multiples and thresholds. A comment explaining a number inside a formula does not fix it; the number still belongs in its own cell.
- **Don't:**
  - repeat a number that is already in the workbook: `=A1*1.05` when 5% is in an assumptions cell, or `=500000+B2` when 500,000 is in another cell
  - type a value you calculated, such as 1,050,000 after working out 1,000,000 × 1.05
  - copy a number from another sheet into a formula instead of referencing it (`=Inputs!A5`)
  - overwrite a formula with a typed value to force a result; fix the input or the logic that feeds it
- **These hardcoded values are fine:**
  1. Designated inputs: values in a labeled inputs or assumptions section that formulas reference.
  2. True constants in formulas: 12 months a year, 7 days a week, 100 to convert a percentage. No label needed.
  3. The first value of a calculated series when there is nothing earlier to reference, such as Year 1 revenue, placed in a labeled section.
  4. Structural values: row counts in `OFFSET`, sheet index numbers and other values that describe the spreadsheet rather than the business.
  5. Small lookup tables: static reference data in a labeled range, such as tax brackets, that formulas elsewhere reference.
- **Say where every hardcoded input came from,** in a cell note or an adjacent cell: `Source: [system or document], [date], [specific reference], [URL if there is one]`, leaving out any part you don't have, for example `Source: Company 10-K, FY2024, page 45, revenue note, [SEC EDGAR URL]`. When the number came from the user, say so: `Source: user-provided assumption`. "Sources and citations" covers data brought in from outside.
- **Mark the inputs.** In a model you build, or a workbook you create for someone to fill in, put a short legend near the top that says which cells are inputs and how they are marked. A workbook for someone to fill in also gets one example row of realistic values that shows the expected format. Never add an example row to a file you were asked to edit.

Before you write a value, ask: Is it a business assumption? Put it in a labeled cell. Is it derived? Write the formula. Is it an input with no source in the workbook? Label it and say where it came from.

## Formulas a reader can follow

- **Keep each formula short enough to read at a glance.** Split logic with several conditions or lookups into labeled helper cells or columns, so each step can be checked.
  - Good: the tax rate in a labeled helper cell B6, then `=B5*(1-B6)`.
  - Bad: `=B5*(1-IF(AND(B3>100000,B4="US"),0.21,IF(B4="UK",0.25,0.15)))`
  - Bad: `=SUMPRODUCT((A2:A100="East")*(B2:B100>50)*(C2:C100))/SUMPRODUCT((A2:A100="East")*(B2:B100>50))`
- **Write formulas that can be copied.** `$` locks what must not change when a formula is copied: `$A$1` locks both, `$A1` keeps column A when copied across, `A$1` keeps row 1 when copied down, and `A1` changes both.
- **Put dimension labels in a header, with one formula that references it.** When you summarize across months, quarters, regions or products, write the labels in a header row or column and one formula that refers to them.
  - Bad: E2 is `=SUMIFS($D:$D,$B:$B,"Jan")`, F2 is `=SUMIFS($D:$D,$B:$B,"Feb")`, and so on, one hand-edited formula per month.
  - Good: E1:P1 hold "Jan" to "Dec"; E2 is `=SUMIFS($D:$D,$B:$B,E$1)`, copied to F2:P2.
  - If the source has only dates, add a helper column first (`=TEXT(A2,"mmm")`) and reference it, rather than working out the period inside the `SUMIFS` criteria.
  - If you can't copy a formula along its row without editing it, the literal in it belongs in a header cell.
- **Use the same formula in every period of a row.** One edited cell in the middle of a row is the most common error that produces no error value.
- **Guard a division whose denominator can be zero:** `=IF(C5=0,0,B5/C5)`, which the zero format in "Financial models" shows as a dash. Use `IF` here rather than `IFERROR`, which also hides a broken reference.
- **Cross-sheet references use `!`:** `=Assumptions!B5`. Quote a sheet name that contains spaces or symbols, and double any apostrophe in it: `='Q3 Forecast'!B7`, `='Owner''s tab'!A1`. `=Assumptions.B5` (LibreOffice's notation), `=@Assumptions!B5` and `[Book2]Sheet1!A1` (Excel's reference to another file) are not valid in Sheets.

## Data that grows

- **Formulas over a log that users will add rows to must include the new rows.** This applies to transaction lists, timesheets and any append-only records. A fixed range that covers today's rows, such as `=SUM(B2:B128)`, or `J2:J1001` for a 1,000-row table, leaves out the next row added. Decide first whether the data is a growing log or a fixed snapshot; a snapshot can use fixed ranges.
- **Use open-ended ranges** such as `=SUM(B2:B)`. A Sheets table (Format > Convert to table) also accepts `=SUM(Sales[Amount])`, but `[@Amount]`, `[[#Totals],[Amount]]` and the `@` operator are syntax errors in Sheets. For a row-by-row calculation, anchor the columns and fill the formula down (`=$B2*$C2`). A named range does not grow, so don't use one for growing data. `ARRAYFORMULA` can calculate a whole growing column in one formula; guard it against blank rows, as in `=ARRAYFORMULA(IF(LEN(B2:B), B2:B*C2:C, ))`, where the empty last argument leaves unused rows blank (`""` would be counted by `COUNTA`). `ARRAYFORMULA` exists only in Sheets, so if the file may go to Excel, fill a plain formula down instead.
- **Band rows with something that extends to new rows:** alternating colors (Format > Alternating colors) over a range that runs past the last row, or a conditional format such as `=MOD(ROW(),2)=0` over the columns, reaching past the last row. Colors filled onto alternate rows by hand don't extend to new rows.

## Layout

- **Decide one style for a multi-sheet build** before you start: header fill, fonts, column widths and table style. Apply it the same way on every sheet, and check every sheet against it before you finish. Styling each sheet separately produces sheets that don't match each other.
- **Use one professional font throughout,** such as Arial or Times New Roman, unless the user asks for another.
- **Write cell text in the user's language and regional spelling:** headers, labels, notes and chart titles. If the workbook already follows a different variety, match the workbook. Never mix varieties in one workbook.
- **Column widths:** size the row-label columns so labels are not cut off. Merge and center a header that sits over a group of columns rather than widening a column to fit it. In financial models, keep the number columns one uniform width, and indent with an extra narrow column rather than by varying widths.
- **Group rows and columns instead of hiding them.** Don't hide rows or columns unless the user asks. A group shows a +/- control that tells the reader something is there; hidden rows are easy to miss and lead to mistakes. Before you collapse a group, check for charts placed over those rows or built from them: collapsing the rows hides the chart too. Keep a chart's data where collapsing detail rows won't affect it, such as a separate area or sheet.

## Writing in the workbook

Text you write in the workbook (sheet names, headers, labels, notes, comments, text cells, chart titles) should read as though a person wrote it. When readers think something was written by AI, they judge it as sloppy and stop trusting it, whatever the content. They make that judgment from a set of common indicators, listed below, so take extra care to keep them out of your writing. These rules are for text you write, and a style the user or their style guide asks for takes priority. Do not rewrite the user's existing text to follow them unless the user asks you to.

- Say what is true without first denying something else. "Revenue grew 12%, three times the US rate," not "This isn't a growth story, it's a market-share story." Do not open a note with "Here's the thing" or "The real story is".
- Match the number of bullets, examples, and adjectives to the content, not to a default of three. Two drivers get two bullets; five get five. A list of exactly three ("fast, reliable, and scalable") usually means the third item was added for rhythm, not because there were three things to say, and readers read it as filler.
- Do not use a metaphor where a literal word will do. If a plain description exists ("the same construction," "the same pattern," "slowed," "fell"), use it. Metaphors are for when the literal version would be longer or less precise, which is rare in analytical writing. Test: if the metaphor can be replaced by a plain word without losing meaning, replace it. A metaphor makes the reader translate it back into the plain claim and carries meaning you did not choose. The ones that appear most are "north star", "move the needle", "double-click" (meaning look closer), "unpack", "journey", and "landscape" (meaning a market). Common ones in business writing: "moat", "headwind", "drag" (meaning a cost on results), "safety net", "clears the bar", and "land" meaning finish or total ("lands $4.4k under budget"). Examples:
  - Bad: "The ones it has are the same species." Good: "The ones it has follow the same pattern."
  - Bad: "A coordinated digestion pause would be visible immediately." Good: "If several large customers cut capex in the same quarter, it would show up in the next guide."
  - Bad: "Architecture transitions compressed margin on the way in and expanded it on the way out." Good: "Gross margin fell during the Hopper-to-Blackwell ramp and recovered once Blackwell shipped at volume."
  - Bad: "The lever that unlocks growth." Good: "The pricing change is what makes the target reachable."
- Cut words that claim importance without giving evidence: "genuinely", "truly", "actually", "clearly", "significantly", "robust", "leverage", "delve", "actionable insights", "learnings". Where one of them stood in for a fact, put the fact there ("margins fell 4 points", not "margins fell significantly"); otherwise delete it. When "leverage" or "significant" carries its financial or statistical meaning ("net leverage", "statistically significant"), it is a literal term; keep it.
- Use full stops and commas, and a colon before a list. No emoji in the workbook.
- Use em dashes sparingly: at most one in a paragraph, and none in a heading, a title, or between a bold label and the text after it. Several em dashes in one paragraph is one of the first things readers use to spot machine writing. In place of one, use a comma, a colon, parentheses, or a new sentence, not an en dash or a spaced hyphen.
- Sheet names and headers name the contents ("Revenue ($mm)", "Assumptions"), not how you made them ("New calc", "Fixed"). A line of text that sums up an analysis, such as the headline on a summary sheet, states the finding ("Europe missed plan", not "Analysis results").
- Keep the conversation out of the workbook: do not name a tab "Summary (Revised)" or write "Updated per your feedback" in a cell. If two versions stay, name each for what it holds. Whoever opens the workbook next did not see the request, so those lines mean nothing to them. Say what changed in your reply, not in the workbook. Source notes and the Data Sources tab record where data came from; they are not conversation, so keep writing them where "Sources and citations" asks for them.

## Financial models

Use these unless the user or the existing file does something else.

**Text colors:**
- Blue (`#0000FF`): hardcoded inputs, and numbers users will change for scenarios.
- Black (`#000000`): all formulas and calculations.
- Green (`#008000`): links to other sheets in the same workbook.
- Red (`#FF0000`): links to other files.
- Yellow fill (`#FFFF00`): key assumptions that need attention, and cells the user should fill in or update.

**Number formats:**
- Years are text: "2024", not 2,024.
- Currency is `$#,##0;($#,##0);"-"`, with the unit in the header: "Revenue ($mm)".
- Negative numbers go in parentheses: (123), not -123.
- Zeros show as a dash, percentages included (`0.0%;(0.0%);"-"`).
- Percentages use one decimal place (`0.0%`) and are stored as fractions: 0.15 shows as 15.0%, while 15 would show as 1500.0%.
- Valuation multiples such as EV/EBITDA and P/E use `0.0"x"`, which shows 12.5x.

**Sensitivity tables:**
- Give the grid an odd number of rows and columns, such as 5×5 or 7×7, so the base case lands in the center cell, and highlight that cell (a yellow fill, for example). A WACC against terminal growth table should put the current WACC in the middle row and the current growth rate in the middle column.
- Build every cell of the grid as a formula that recalculates the output from its row's and its column's input values. For a DCF, each cell discounts the same cash flows at its row's rate and adds a terminal value at its column's growth rate.

## Charts

- **Lay chart data out as one block.** Headers in the first row become series names, and categories in the first column become the axis labels:

  |       | Q1  | Q2  | Q3  | Q4  |
  |-------|-----|-----|-----|-----|
  | North | 100 | 120 | 110 | 130 |
  | South | 90  | 95  | 100 | 105 |

- **Some chart types need a particular layout.** A pie or doughnut chart takes one column of values with labels. A scatter chart takes X values in the first column and Y values in the others. A candlestick chart takes Low, Open, Close, High.
- **Summarize before you chart.** To chart raw rows that need aggregating, build a summary first, either a pivot table or a table of `SUMIFS` formulas, and chart the summary range. A chart built on a pivot table follows the pivot table, so change the pivot table rather than the chart.
- **Group dates into periods with a helper column.** When the user wants totals by month, quarter or year and the data has daily dates, add a column that turns each date into its period, such as `=EOMONTH(A2,-1)+1` for the first day of the month (format the column as a date, or it shows a serial number such as 45413) or `=YEAR(A2)&"-Q"&ROUNDUP(MONTH(A2)/3,0)` for the quarter. Give it a header, fill it for every row, and group by it instead of by the raw dates.

## Sources and citations

Every value that comes into the workbook from outside it should be traceable without asking you: where it came from, how it reached you, and when it was pulled.

- **These need no source note:** data rows the user types or dictates with no system behind them, and the existing contents of a workbook the user gave you to edit. An assumption the user gave you still gets its note, as "Inputs and hardcoded values" says.
- **A figure you looked up on its own** (on a web page, or in a document or dashboard) and placed in your own layout gets a note on the value cell itself, not on its row label or header. If A8 is "Cash and cash equivalents" and B8 is $179,172, the note goes on B8. Use the source format from "Inputs and hardcoded values", with the URL of the page you actually read the figure from, not the index page you started at: `Source: Apple Investor Relations, https://investor.apple.com/sec-filings/annual-reports/2024`. This includes figures you found earlier in the conversation.
- **A table you bring in whole** gets exactly one note, on its top-left header cell (C4 for a table at C4:F20), and no notes on the value cells or the other headers. This covers the rows of an uploaded file, a query result, query results the user pasted, and a table you transcribe from a document, such as a financial statement from a PDF.
  - For an uploaded file or document: `Source: [file name], [page or table, if it applies], uploaded [date]`.
  - For a query result: `Source: [system] ([object]), [N] rows, run [date, time and time zone]. [How obtained]. Full query on the Data Sources tab.` N counts data rows, not the header. "How obtained" is "Run by Claude" when you ran the query, or "Pasted into chat by user; not run by Claude" when the user supplied the results. Never word a note as if you ran a query whose results were given to you.
- **Query results also get a row on a "Data Sources" tab,** one row per result set. Make it the last tab and keep it visible. Its columns, in order: Written to (Sheet!Range, including the header row) | Source | Object (database.schema.table, endpoint, URL or file name) | Obtained via | Query or request (the exact query, or the user's request in their own words if no query was shown; never invent one) | Parameters | Run at | Requested by (the person who asked, if you know their name) | Row count | Changes after retrieval (none, or what you did: sorted, filtered, pivoted, converted units) | Notes. If you run a query again, add a new row and write "superseded" in the old row's Notes instead of overwriting it. If you remove a table, write "removed" in its row's Notes.
- **Run at** is when the data was pulled, as the tool or the user reports it. Turn a relative day such as "yesterday" into a date, and type it as text; never use `NOW()` or `TODAY()`, which change every time the file opens.
- **Keep secrets and personal identifiers out of the audit record.** Credentials, API tokens, passwords and connection strings never go anywhere in the workbook. In the query text, the notes and the Data Sources tab, replace personal identifiers that appear as literal values with [REDACTED]: government ID numbers, full bank-account or payment-card numbers, the name or date of birth of a private individual, home addresses, and personal email addresses or phone numbers. Keep table and column names, company and product names, internal record keys and non-identifying filter values, so the query can still be read and run again. `WHERE ssn = '123-45-6789' AND region = 'EMEA'` becomes `WHERE ssn = '[REDACTED]' AND region = 'EMEA'`. The returned rows go into the sheet as the user asked; this rule is about not copying identifiers into the record a second time.

## Editing an existing workbook

- **Its conventions override these rules:** colors, number formats, fonts, layout and tab order. Find its input cells first (a distinct font color, fill or shading usually marks them), write only there unless the request needs more, and leave its existing formulas alone unless the user asks you to change them.
- **Keep its formatting.** Format a new row like the row above it, and a new column like the one beside it.
- **Match the number format of what you summarize.** A total under a currency column gets the same currency format. If the new cell is unformatted, set the format rather than leaving a bare number.
- **After inserting rows inside a summarized range,** check that the totals and averages include them. Rows inserted just below the last summed row or above the first are often left out.
- **Inserted rows and columns take their neighbors' formatting.** Rows inserted under a blue header row come out blue. Check the new cells and clear formatting that doesn't belong.

## Checking the result

- **Check what the reader will see.** Number formats and locale decide what a cell displays, so for formatting work check the displayed text, not only the stored value.
- **No error values:** no `#VALUE!`, `#REF!`, `#NAME?`, `#DIV/0!` or `#N/A`, no circular references, and no range that stops short of the data.
- **No error values does not mean correct.** Look for hardcoded numbers where a formula belongs, and for formulas that point at the wrong row but happen to give the right value today.
- **Check every sheet.** List the sheets the workbook actually has, rather than the ones you remember creating, and check that each has its content. Finish or delete any empty tab you added.
- **Check the sources.** Every figure from outside the workbook has the source note "Sources and citations" asks for.
- **Check the formatting** against the user's request and the conventions above.

# Sheets connector

## Applying the design rules

- **Colors:** a `sheets_helper.py format` rule takes the hex values from the design rules above in `fg` and `bg`, such as `{"range": "B2:B8", "fg": "#0000FF"}` for inputs.
- **Number formats:** the helper's `currency` is the `$#,##0;($#,##0);"-"` from the design rules above and its `multiple` is `0.0"x"`. Its `percent` is plain `0.0%`, which shows zero as 0.0%; in a financial model, pass the pattern `0.0%;(0.0%);"-"` instead. *Untested through the connector.*
- **Years as text:** write `'2024` with a leading apostrophe. Without it, both write tools store the number 2024.
- **Source notes:** an `updateCells` request sets a cell's note: `{"updateCells": {"rows": [{"values": [{"note": "Source: ..."}]}], "fields": "note", "start": {"sheetId": 0, "rowIndex": 3, "columnIndex": 2}}}` puts it on C4. *Untested through the connector.*
- **Grouping rows or columns:** `{"addDimensionGroup": {"range": {"sheetId": 0, "dimension": "ROWS", "startIndex": 4, "endIndex": 12}}}` groups rows 5 to 12; the indexes are 0-based with an exclusive end, like grid ranges. *Untested through the connector.*
- **Banding:** `addBanding` with a `bandedRange` whose `rowProperties` set `headerColor`, `firstBandColor` and `secondBandColor`. The banding extends to rows added inside the range, so make the range run past the last row of data. *Untested through the connector.*

## Create

- **Blank sheet, then fill it, in four calls.** Use this for models and anything with formulas.
  1. Drive `create_file` with `contentMimeType: "application/vnd.google-apps.spreadsheet"`. The first tab of a new sheet is `Sheet1` with `sheetId` `0`, so there is nothing to read yet.
  2. One `update_formulas` call writes the whole table from its top-left cell: title, headers, labels, numbers and formulas in one 2D array, with `null` for cells left empty. Both write tools parse input the same way, so don't send the numbers and the formulas in separate calls.
  3. One `update_spreadsheet` call does everything else: the tab rename (`updateSheetProperties` with `fields: "title"`), formatting, frozen rows, merges, conditional formats, and widths for text columns (the format spec's `col_widths` key, or an `autoResizeDimensions` request) so labels aren't cut off. `sheets_helper.py format spec.json --sheet-id 0` builds the formatting without a metadata read; append the other requests to its output.
  4. One `get_values` over the table to verify.
- **Upload:** upload a CSV or an .xlsx built with the `xlsx` skill, and Drive converts it. Then edit the result in place. The file's whole content goes inside the tool call, so an upload is slow and often fails: a 20 KB encoded file has taken about three minutes. Keep uploads small; for a large data set, create a blank sheet and write the data with `update_values`.

## How a sheet is addressed

There are two coordinate systems, and each tool uses one of them.

| Tools | Addresses cells by | Example |
|---|---|---|
| `get_values`, `update_values`, `update_formulas` | A1 notation with the tab name | `'P&L Model'!B4:D10` |
| `update_spreadsheet`, `insert_dimension` | Numeric `sheetId` plus 0-based indexes; end indexes are exclusive | B4:D10 on tab 1001 is `{"sheetId": 1001, "startRowIndex": 3, "endRowIndex": 10, "startColumnIndex": 1, "endColumnIndex": 4}` |

- **Quote tab names** that contain spaces or symbols, and double any apostrophe inside: `'P&L Model'!F5`, `'Owner''s tab'!A1`.
- **The `sheetId` is not the tab name or its position.** Get it from `get_spreadsheet` (see Read). To choose a new tab's ID yourself, set `sheetId` in `addSheet`; the reply confirms it.
- **Leave the math to the helper.** `sheets_helper.py range` converts A1 to a grid range, including open ranges like `C:C`, and resolves tab names:

```
python <skill>/scripts/sheets_helper.py range "'P&L Model'!B4:D10" --meta meta.json
{"sheetId": 1001, "startRowIndex": 3, "endRowIndex": 10, "startColumnIndex": 1, "endColumnIndex": 4}
```

`meta.json` is the (small) output of the metadata read below, written to a file.

## Read

- **Tabs and IDs:** `get_spreadsheet` with `fields: ["sheets.properties"]`. It returns each tab's `title`, `sheetId`, and grid size. Keep it small: never call `get_spreadsheet` without `fields`.
- **Field masks: one path per array item, no parentheses.** This connector rejects `sheets.properties(sheetId,title)` and `"spreadsheetId,properties.title"` as one item, even though the tool's own description suggests the parenthesized form. Pass separate items instead: `["spreadsheetId", "properties.title", "sheets.properties"]`.
- **Displayed values:** `get_values` returns what the UI shows, as strings (`"$125"`, `"25.0%"`, `"#DIV/0!"`). It has no option for formulas or raw values. An empty row comes back as `[]`, trailing empty cells and rows are dropped, and a fully empty range comes back with no `values` key at all.
- **Read to the end of the data with an open range.** On a small tab, `'Log'!A:F` returns the header and every filled row, and nothing past the last one, so one read gives both the layout and where the data ends. Don't guess a fixed end such as `A1:Z1000`: a range past the tab's last row can fail with "exceeds grid limits", and deleting rows makes the tab shorter. To format a column down to the end, leave `endRowIndex` out of the grid range (`sheets_helper.py range "D2:D"` does this).
- **Formulas, raw values, and errors:** read the grid instead. Use exactly this call, which is small and has everything the helper needs:

```json
{"spreadsheetId": "...", "includeGridData": true, "ranges": ["'Model'!A1:H40"],
 "fields": ["sheets.properties.title", "sheets.data.startRow", "sheets.data.startColumn",
            "sheets.data.rowData.values.userEnteredValue",
            "sheets.data.rowData.values.formattedValue",
            "sheets.data.rowData.values.effectiveValue"]}
```

Then list the cells, with each formula next to its displayed result:

```
python <skill>/scripts/sheets_helper.py cells grid.json
Sheet1!D5   '=B5*(1+C5)'   -> '$125'
Sheet1!D7   '=D5/0'        -> '#DIV/0!'  <-- ERROR DIVIDE_BY_ZERO
errors: 1
```

Add `--errors-only` to list only the error cells. Add `sheets.data.rowData.values.userEnteredFormat` to the fields when you need to read formatting, and keep the range tight: grid reads grow fast.

## Write values and formulas

- **Both write tools parse input the way the Sheets UI does.** `update_values` and `update_formulas` both turn `"=A1+B1"` into a formula, `"0.25"` into a number, `"3/14/2026"` into a date, and `"00123"` into the number 123. `"1/2"` becomes a date that still displays as 1/2, and a `SUM` over it adds the date's serial number, a five-digit number such as 46024. Period labels such as `"Jan 2027"`, `"2027-01"` or `"Jan 1"` become dates too; a bare month abbreviation such as `"Jan"` stayed text. Because both parse the same way, one `update_formulas` call can write a block's labels, numbers and formulas together.
- **Keep text as text with a leading apostrophe.** `"'00123"` stores the text `00123`, and `"'=not a formula"` stores that literal text. Use it for IDs, ZIP codes, account numbers, and any text that looks like a number, date, or formula. Cells formatted as `TEXT` beforehand also keep input as text; other number formats, such as currency, don't.
- **Send numbers as numbers**, not strings. Store percentages as fractions, such as `0.25` for 25%, and format them as percent.
- **`null` skips a cell; `""` clears it.** Booleans become `TRUE` / `FALSE`.
- **Write formulas for every calculated cell.** Do not write results you computed yourself. Formulas keep the sheet live when the user changes an input.
- **The range should fit the data.** Give the full extent (`'Model'!A4:D6` for 3 rows of 4) or just the top-left cell. Writing a 2D array into a smaller range fails with "Requested writing within range …".
- **Clearing values leaves the cells' number formats.** A cell that held a date shows the next number you write as a date. Reset the format with `repeatCell` before reusing the cells.
- **Inserting rows or columns shifts formulas for you.** `insert_dimension` (or `insertDimension` in a batch) updates references in existing formulas, so re-read before writing to rows below an insert. Set `inheritFromBefore: true` to copy the formatting of the row above. Directly under a header row, pass `false`: `true` copies the header's formatting. A row inserted between the last summed row and its total row is not added to the `SUM`, and neither is a row inserted at or above the first summed row: the range shifts down past it. Insert inside the range, or rewrite the total as a formula over the new rows; never replace it with a typed number.

## Batch updates: structure, formatting, charts

`update_spreadsheet` sends raw `spreadsheets.batchUpdate` requests. The reads in this file return no `revisionId`, so send these requests without `writeControl`, and read again right before a write that depends on positions.

- **Field masks inside requests have the same rule:** comma-separated full paths, no parentheses. `"fields": "userEnteredFormat.numberFormat,userEnteredFormat.textFormat.foregroundColor"` works; `"userEnteredFormat(numberFormat,textFormat)"` is rejected.
- **Colors are `red`, `green`, `blue` from 0 to 1**, not hex.
- **Formatting: use the helper.** Describe the formatting in a short spec and `sheets_helper.py format` builds the requests, with correct ranges, colors, and field masks:

```json
{"sheet": "Model",
 "rules": [
   {"range": "A1:F1", "bold": true, "bg": "#1F3864", "fg": "#FFFFFF", "align": "center"},
   {"range": "B2:B8", "fg": "#0000FF"},
   {"range": "C2:F20", "number": "currency"},
   {"range": "G2:G20", "number": "percent"},
   {"range": "A1:G20", "borders": "#BFBFBF"}],
 "freeze": {"rows": 1, "columns": 1},
 "col_widths": {"A": 220, "B:G": 110},
 "row_heights": {"1": 30}}
```

```
python <skill>/scripts/sheets_helper.py format spec.json --meta meta.json
```

For one tab whose `sheetId` you already know, such as `0` on a new sheet, pass `--sheet-id 0` instead of `--meta` and leave `sheet` out of the spec. The output is the full `requests` for `update_spreadsheet`. Named number formats: `currency`, `currency2`, `percent`, `multiple`, `integer`, `decimal`, `date`, `text`; any other string is used as a Sheets pattern. Rule keys: `bold`, `italic`, `size`, `font`, `fg`, `bg`, `align`, `valign`, `wrap`, `number`, `borders`.

- **One conditional-format rule can cover several columns.** `addConditionalFormatRule` takes a list of `ranges`. Write a `CUSTOM_FORMULA` for the top-left cell of the first range; Sheets shifts its relative references for every other cell, including cells in the other ranges. With ranges D5:D15, F5:F15 and H5:H15, `=D5>C5` compares each actual with the plan in the column to its left. Add `$` to fix a column: `=$J5>$I5` on K5:L15 colors both cells of a row by one comparison.
- **Labels over a group of columns:** an unmerged label such as "July" above a Plan and an Actual column sits at the left edge of its first cell, away from the right-aligned numbers under it. Merge the group's label cells with `mergeCells` and center them, or drop the group row and name each column ("Jul plan", "Jul actual").
- **Other common requests:** `addSheet` (with `properties.sheetId` and `title`), `updateSheetProperties` (rename with `fields: "title"`; freeze rows with `gridProperties.frozenRowCount`), `deleteDimension`, `mergeCells`, `setDataValidation` (dropdowns, checkboxes), `addConditionalFormatRule`, `sortRange`, `findReplace`, `autoResizeDimensions`.
- **Charts work.** `addChart` creates a native chart; the reply returns its `chartId`, which Slides can embed. A minimal column chart:

```json
{"addChart": {"chart": {
  "spec": {"title": "Revenue", "basicChart": {"chartType": "COLUMN",
    "domains": [{"domain": {"sourceRange": {"sources": [
      {"sheetId": 0, "startRowIndex": 0, "endRowIndex": 6, "startColumnIndex": 0, "endColumnIndex": 1}]}}}],
    "series": [{"series": {"sourceRange": {"sources": [
      {"sheetId": 0, "startRowIndex": 0, "endRowIndex": 6, "startColumnIndex": 1, "endColumnIndex": 2}]}},
      "targetAxis": "LEFT_AXIS"}],
    "headerCount": 1}},
  "position": {"overlayPosition": {"anchorCell": {"sheetId": 0, "rowIndex": 8, "columnIndex": 0}}}}}}
```

Use `LINE` for trends over time, `BAR` or `COLUMN` for comparisons, and set `headerCount: 1` when the first row is a label.

- **A chart that will be embedded in a Slides deck** follows the deck's existing chart style. When the deck has none: no chart title, since the slide carries the label; no legend; and a value label on every bar. For those, leave `title` out of the `spec`, set `"legendPosition": "NO_LEGEND"` on `basicChart`, and add `"dataLabel": {"type": "DATA"}` to each bar or column series. Leave `dataLabel` off a line series: a line's few point labels and its name go on the slide as text boxes. To color a single bar, use the series' `styleOverrides` (`[{"index": 3, "colorStyle": {"rgbColor": {...}}}]`). *Untested through the connector.*

## Verify

1. Read the displayed values of everything you built with `get_values`. Scan for `#REF!`, `#DIV/0!`, `#NAME?`, `#VALUE!`, `#N/A`, and `#ERROR!`, and check that totals match the numbers you expect.
2. For models, run the grid read and `sheets_helper.py cells --errors-only`, then spot-check that calculated cells hold formulas (`'=...'`), not typed numbers.
3. After an upload, confirm the tab names and sizes with the metadata read before editing.

## Function support

Sheets supports `XLOOKUP`, `FILTER`, `UNIQUE`, and `SORT`, so the `xlsx` skill's LibreOffice limits do not apply here. If the user may export the file to Excel, avoid Sheets-only functions such as `QUERY`, `ARRAYFORMULA`, `IMPORTRANGE`, and `GOOGLEFINANCE`. Formulas that fetch an outside URL (`IMAGE`, `IMPORTDATA`, `IMPORTXML`, `IMPORTHTML`, `IMPORTFEED`) show `#REF!` until someone opens the sheet in a browser and clicks Allow access, so tell the user.

## Sheets failures

| Symptom | Cause | Fix |
|---|---|---|
| `Invalid field: sheets.properties(sheetId,title)` | The connector rejects parenthesized field masks | Pass one full path per array item: `["sheets.properties"]`. |
| `Invalid field: user_entered_format(number_format` | Parentheses in a request's `fields` | Use comma-separated full paths. `sheets_helper.py format` does this for you. |
| An ID lost its leading zeros, or text became a date | Both write tools parse input like the UI | Prefix the value with `'`. |
| A formula shows up as a value you typed | A computed result was written instead of a formula | Write the formula string starting with `=`. |
| `get_values` result has no `values` key | The range is empty | Treat it as empty; it is not an error. |
| Formatting landed on the wrong rows | 1-based rows used as 0-based indexes, or an inclusive end index | Build the range with `sheets_helper.py range`. |
| Formatting landed on the wrong tab | Tab position or name used as `sheetId` | Read `sheets.properties` and use the numeric `sheetId`. |
| Formulas point at the wrong rows after an insert | Rows were written using positions from before the insert | Re-read after `insertDimension`; Sheets already shifted existing formulas. |
| `Unable to parse range: <tab>!A1` | Usually a tab name that doesn't exist, not bad A1 syntax | Read `sheets.properties` and use the exact tab title. |
