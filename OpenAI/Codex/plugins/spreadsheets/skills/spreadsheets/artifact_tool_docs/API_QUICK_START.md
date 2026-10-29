# Using artifact_tool APIs (JavaScript)

Library version: 2.8.58+

## Required imports, setup and exports
```js
import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

// To import existing workbook
const input = await FileBlob.load("path/to/input.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);

// To create a new workbook and add a sheet to it
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Inputs");

// To export
await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/output.xlsx`);
```

Import CSV text directly when the source or intermediate data is CSV:
```js
const csvText = await fs.readFile("path/to/input.csv", "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "Sheet1" });
```
Prefer `Workbook.fromCSV(...)` over hand-parsing CSV rows; clean or analyze CSV with Python/Node first only when needed.  
CSV fields import as strings. Convert intended numeric/date columns before calculations; number formatting alone does not convert text to numbers.


## Build Patterns
- Prefer block writes (`range.values`, `range.formulas`) over per-cell loops. Normally match the matrix shape to the target range (e.g. "D4:M4" → 1×10). To intentionally expand a larger matrix from an anchor, target a single cell or use range.write(matrix).
- `range.values = [[value]]` repeats that value across the range; range.formulas does not broadcast a single formula. For merged ranges, write to the top-left cell or `mergedRange.values = [[value]]` where `mergedRange` is a single merged range.
- Seed scalar formulas once, then `fillDown()` / `fillRight()`. For dynamic-array formulas (like `SEQUENCE`, `UNIQUE`, `FILTER`, `SORT`, `VSTACK`, `HSTACK`), write only the anchor cell and let the result spill after.
- Use `range.displayFormulas` plus `range.formulaInfos` when you need to understand a spill child or a data-table output cell.
- Setting cell values or formulas automatically recalculates dependent formulas; no manual recalculation is needed after ordinary edits, including batches (exception: creating data tables). Call `workbook.recalculate()` once after all edits, before final verification and export. If you make further edits, recalculate again before rechecking and exporting.
- Prefer real `Date` objects for sortable/charted/formula date columns.
- Number and date formats must be applied explicitly (for example `yyyy-mm-dd`).
- Use JSON-serializable values for non-Date cells: `string | number | boolean | null`.
- If a cell is intended to display literal text that begins with `=`, write it as a value prefixed with a single quote (for example `'=B2*C2`). This includes formula descriptions, validation examples, and labels; do not write these cells through `range.formulas`.
- Create every worksheet referenced by formulas before writing any cross-sheet formulas.
- Verify with `await workbook.inspect(...)`; use `workbook.help(...)` only when the quick surface below is insufficient.
- `render` can be used to examine an existing workbook visually and for visual verifications.

## Conventions
- Use camelCase API names and option keys.
- Cell/range addressing: A1 notation (`sheet.getRange("A1:C10")`).
- Drawing anchors (`sheet.charts`, `sheet.shapes`, `sheet.images`): 0-based `{ row, col }`.
- Drawing offsets/extents use pixels (`rowOffsetPx`, `colOffsetPx`, `widthPx`, `heightPx`).

## API Discovery Policy (Strict)
- Use this quick API surface first.
- Use `workbook.help(...)` only when the supplied public documentation leaves a required operation unclear. Start with one bounded exact feature/path lookup, such as `range.dataValidation` or `chart.series.add`.
- If that lookup returns no useful match, one bounded reformulation is allowed. Stop after those two attempts; do not repeat similar queries, inspect package internals/prototypes/nearby tests, or invent enum values and setters. Use a documented equivalent that preserves the task.

## Supported Formulas
- Look up formula syntax with `fx.<formula>`, e.g. `workbook.help("fx.PMT", { include: "index,examples,notes", maxChars: 3000 })`. A help entry does not guarantee working calculation or Excel export.
- To browse a family of formulas, use `fx.*` with a category regex. Useful categories: `financial`, `math-trig`, `statistical`, `lookup-reference`, `logical`, `text`, `date-time`, `information`, `engineering`, `database`.
- For intent-based lookup, use a short natural query plus a narrow `search` regex of likely functions.
- Keep `maxChars` bounded; if results are noisy, narrow `search` rather than issuing many similar queries.

```
console.log(workbook.help("fx.PMT", { include: "index,examples,notes" }).ndjson);
console.log(workbook.help("fx.*", { search: "financial", include: "index,examples", maxChars: 4000 }).ndjson);
console.log(workbook.help("lookup with fallback", { search: "XLOOKUP|INDEX|MATCH|IFERROR", include: "index,examples,notes", maxChars: 4000 }).ndjson);
```

### Known formula/export limitations (not exhaustive)
If a formula fails, use a verified equivalent that preserves the intended result.

Known issues:
- Avoid `MAP`, `REDUCE`, `SCAN`, `MAKEARRAY`, `GROUPBY`, `PIVOTBY`. Use helper cells and supported scalar formulas;
- Prefix `XLOOKUP`, `TEXTJOIN`, `MINIFS`, `MAXIFS`, `IFS`, and `RANK.EQ` with `_xlfn.`, including nested calls: e.g. `'=_xlfn.TEXTJOIN(", ",TRUE,B2:C2)'`.
- If using `LET`, `LAMBDA`, `BYROW`, and `BYCOL`, prefix function names with `_xlfn.` and every LET/LAMBDA local-variable declaration and reference with `_xlpm.`. This is compatibility syntax, not guidance to introduce those formulas.
- PivotTable APIs exist, but XLSX export is unreliable.
- `COUNTIF` / `COUNTIFS` with an empty-string criterion can miss blank cells, even in bounded ranges. For unconditional blank counts, use `COUNTBLANK(range)`.


## Reading existing/imported workbooks
- On existing/imported workbooks, get a compact summary via `inspect` to understand what already exists and where.
- Prefer `inspect(...)` for workbook understanding and discovery across broad areas.
- Prefer direct getters like `range.formulas` when you already know the target range and need the exact rectangular formula matrix.
- If formula locations are unknown, prefer `inspect({ kind: "formula", ... })` over reading `range.formulas` across a very large area.
- Prefer to set `maxChars`, `tableMaxRows`, `tableMaxCols`, and/or `maxResults` to prevent large dumps of data.
- For suspicious or high-impact outputs, use `workbook.trace("Sheet!A1")` to audit the dependency tree from final output/check cell back to source cells. Trace output can be large, so summarize by depth/node count before logging.

### Inspect for workbook understanding
- Compact summary:
```js
await wb.inspect({
  kind: "workbook,sheet,table",
  maxChars: 6000,
  tableMaxRows: 6,
  tableMaxCols: 6,
  tableMaxCellChars: 80,
});
```
- Quick overview of sheet ids and names: `await wb.inspect({ kind: "sheet", include: "id,name" })`
- Formula discovery in a targeted area: `await wb.inspect({ kind: "formula", sheetId: firstSheetName, range: "A1:Z30", maxChars: 2500, options: {maxResults:50} })`
- Checking existing styles in a targeted area: `await wb.inspect({ kind: "computedStyle", sheetId: firstSheetName, range: "A1:E10", maxChars: 2500 })`
- Common `kind` tokens: `workbook`, `sheet`, `table`, `region`, `match`, `formula`, `thread`, `computedStyle`, `definedName`, `drawing`
- Inspects can also be used to zoom in on specific areas, especially for target edits:
```js
await wb.inspect({
  kind: "region",
  sheetId: firstSheetName,
  range: "A1:Z30",
  maxChars: 2500,
});
```
- Inspect output may include JSON records with `"id"` values (for example `"ws/r5qsk5"`), which you can resolve back to workbook objects with `wb.resolve(...)`:
- `wb.resolve("ws/...")` -> worksheet
- `wb.resolve("th/...")` -> comment thread

## Known Gotchas (Do not repeat)
- Do not set undocumented attributes on remote objects.
- `Workbook.create()` starts with no sheets; add one before calling `getActiveWorksheet()`.
- Create every worksheet referenced by formulas before writing cross-sheet formulas.
- Prefer bounded formula ranges, e.g. `$A$6:$A$205`. Full-column references can be truncated to each column's populated extent: unequal extents can make `COUNTIFS` / `SUMIFS` return `#VALUE!`, and `ROWS` / `INDEX` can differ from Excel.
- If export fails, isolate the cause by checkpoint-export after major blocks to isolate the cause: base sheets, values/formulas, formatting, conditional formatting, tables, charts/rendering. For charts, first simplify optional styling first: nested border configs, custom chart axis/series mutations, broad autofit/formatting, then nonessential drawings.

## Quick API Surface (High-Value + Common)

### Core workbook/file APIs
- `import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool"`
- `const workbook = Workbook.create()` to create an empty workbook
- `const sheet = workbook.worksheets.add("Sheet1")` to add a sheet
- `const workbook = await SpreadsheetFile.importXlsx(arrayBufferOrFileBlob)`
- `const xlsx = await SpreadsheetFile.exportXlsx(workbook); await xlsx.save("output.xlsx")`
- `const inspect = await workbook.inspect({ kind: "sheet", include: "id,name", sheetId, range: "A1:C10" })`
- `const help = workbook.help("worksheet.getRange", { include: "index,examples" })`
- Preferred: `const preview = await workbook.render({ sheetName: "Sheet1", autoCrop: "all", scale: 1, format: "png" })`
- To get the bytes and/or save the blob to file:
```js
const previewBytes = new Uint8Array(await preview.arrayBuffer());
await fs.writeFile(`${outputDir}/preview.png`, previewBytes);
```
- `const workbook = await Workbook.fromCSV(csvText, { sheetName: "Sheet1" })`
- `await workbook.fromCSV(csvText, { sheetName: "ImportedData" })` requires an empty workbook; it does not append CSV to a populated workbook. Prefer static `Workbook.fromCSV(...)`.

### Worksheet selection/creation
- `workbook.worksheets.add(name)`
- `workbook.worksheets.getItem(name)`
- `workbook.worksheets.getItemAt(index)`
- `workbook.worksheets.getActiveWorksheet()` (only after at least one sheet exists)

### Worksheet operations
- `sheet.getRange("A1:C10")`, `sheet.getRangeByIndexes(startRow, startCol, rowCount, colCount)`, `sheet.getCell(row, col)`
- `sheet.getUsedRange(valuesOnly?)`
- `sheet.freezePanes.freezeRows(rowCount)`, `sheet.freezePanes.freezeColumns(columnCount)`, `sheet.freezePanes.unfreeze()`
- `sheet.tabColor = "#1F4E78"` sets the worksheet tab color; the getter returns a `Color` object.
- `sheet.tables`, `sheet.charts`, `sheet.sparklineGroups` (`sheet.sparklines` alias), `sheet.shapes`, `sheet.images`
- `sheet.showGridLines = false`
- `sheet.dataTables`, `sheet.conditionalFormattings`, `sheet.dataValidations`
- `sheet.deleteAllDrawings()` removes all drawings, including charts, shapes, and images.

### Range values/formulas
- `const range = sheet.getRange("A1:C10")`
- `range.values = [[...], ...]` (2D matrix of values).
- `range.formulas = [["=..."], ...]`
- `range.formulasR1C1 = [["=RC[-1]*2"]]`
- To read: `range.values` / `range.formulas` / `range.displayFormulas` / `range.formulaInfos` (for spill/array formulas)
- `range.write(matrixOrPayload)` (auto-sizes/spills from anchor as needed)
- `range.writeValues(matrixOrRows)`
- `range.fillDown()`, `range.fillRight()`
  - `sheet.getRange("D2").formulas = [["=..."]]`
  - `sheet.getRange("D2:D200").fillDown()`
- `range.clear({ applyTo: "contents" | "formats" | "all" })` clears cell contents, formatting, or both; drawings remain.
- `range.copyFrom(sourceRange, "values" | "formulas" | "all")`. Prefer matching shapes; a single-cell value source can broadcast across a larger destination.
- `range.copyTo(destRange, "values" | "formulas" | "all")`
- `range.offset(rowOffset, colOffset)`, `range.resize(rowCount, columnCount)`, `range.getCurrentRegion()`, `range.getRow(i)`, `range.getColumn(j)`
- `range.getRangeByIndexes(startRow, startCol, rowCount, colCount)`, `range.getCell(row, col)` (relative to the range)

### Formatting
- `range.format` supports `fill`, `font`, `numberFormat`, `borders`, alignments, `wrapText`
- `range.format.verticalAlignment = "center"` maps to Excel Middle Align
- `range.format.autofitColumns()`, `range.format.autofitRows()`
- Excel unit sizing:  `range.format.columnWidth = 18`, `range.format.rowHeight = 24`
- Pixel sizing: `range.format.columnWidthPx = 120`, `range.format.rowHeightPx = 24`
- `range.setNumberFormat("yyyy-mm-dd")`
- `range.format.numberFormat = [["0"], ["0.00"], ["@"]]`
- Borders: There are two ways to set borders on a range (1) simple form (2) per edge form. Example:
```js
// (1) Preferred simple form
// `preset` can be "none" | "outside" | "inside" | "all" | "doubleBottom"
// "outside" will just set borders on the outside edges of the range.
// `style` are Excel/OpenXML-style names such as "thin", "medium", "thick", "dashed", and "dotted".
range.format.borders = { preset: "all", style: "thin", color: "#D9D9D9" };

// (2) Per-edge form. Use top/bottom/left/right, not edgeTop/edgeBottom/etc.
// Format: {style?: string; color?: ColorConfig; weight?: number;}
// Prefer setting `style` over `weight` unless you want granular control.
range.format.borders = {
  insideHorizontal: { style: "thin", color: "#D9D9D9" },
  insideVertical: { style: "medium", color: "#D9D9D9" },
  top: { style: "thick", color: "#D9D9D9" },
  bottom: { style: "dashed", color: "#D9D9D9" },
  left: { style: "dotted", color: "#D9D9D9" },
  right: { style: "thin", color: "#D9D9D9" },
};
```

### Data Validation
- `range.dataValidation = { rule: { type: "list", formula1: "Categories!$A$2:$A$4" } }`
- `range.dataValidation = { rule: { type: "list", values: ["Not Started", "In Progress"] } }`
- `sheet.dataValidations.add({ range: "B2:B100", rule: { type: "whole", operator: "between", formula1: 1, formula2: 10 } })`

### Conditional formatting
- Use `range.conditionalFormats.add(ruleType, ConditionalFormatConfig);`.
- Use `range.conditionalFormats.add(ruleType, {operator, formula, format});`. Choose ruleType, operator, color, and style strings from the inline types below.
```
type ConditionalFormatRuleType =
  | "cellIs" | "CellValue" | "Custom" | "expression"
  | "colorScale" | "dataBar" | "iconSet"
  | "containsText" | "notContainsText" | "beginsWith" | "endsWith"
  | "containsBlanks" | "notContainsBlanks" | "containsErrors" | "notContainsErrors"
  | "duplicateValues" | "uniqueValues" | "timePeriod" | "top10" | "aboveAverage";

type CellIsOperator =
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "equal"
  | "notEqual"
  | "between"
  | "notBetween";

type ConditionalFormatConfig =
  | { operator: CellIsOperator; formula: string | number | Array<string | number>; format?: DifferentialFormatConfig }
  | { formula: string | number; format?: DifferentialFormatConfig }
  | { colors?: ColorConfig[]; thresholds?: CfvoInput[] }
  | { color?: ColorConfig; thresholds?: CfvoInput[]; gradient?: boolean }
  | { iconSet: string; showValue?: boolean; reverse?: boolean; thresholds?: CfvoInput[] }
  | { text: string; format?: DifferentialFormatConfig }
  | { timePeriod: "yesterday" | "today" | "tomorrow" | "last7Days" | "lastWeek" | "thisWeek" | "nextWeek" | "lastMonth" | "thisMonth" | "nextMonth"; format?: DifferentialFormatConfig }
  | { rank?: number; percent?: boolean; bottom?: boolean; format?: DifferentialFormatConfig }
  | { aboveAverage?: boolean; equalAverage?: boolean; stdDev?: number; format?: DifferentialFormatConfig };

type DifferentialFormatConfig = {
  fill?: FillConfig;
  font?: { bold?: boolean; italic?: boolean; color?: ColorConfig };
  border?: RangeBordersConfig; // Per-edge top/bottom/left/right only; presets are ignored here.
  numberFormat?: string;
};

type CfvoInput =
  | "min"
  | "max"
  | number
  | `${number}%`
  | { type: "min" | "max" | "num" | "percent" | "percentile"; value?: string | number };
```
- Rule types (`ConditionalFormatRuleType`): "cellIs" | "CellValue" | "Custom" | "expression"  
  | "colorScale" | "dataBar" | "iconSet"  
  | "containsText" | "notContainsText" | "beginsWith" | "endsWith"  
  | "containsBlanks" | "notContainsBlanks" | "containsErrors" | "notContainsErrors"  
  | "duplicateValues" | "uniqueValues" | "timePeriod" | "top10" | "aboveAverage";
- XLSX `iconSet` names: `3Arrows`, `4Arrows`, `5Arrows`, `3ArrowsGray`, `4ArrowsGray`, `5ArrowsGray`, `3TrafficLights1`, `3Signs`, `4RedToBlack`, `3TrafficLights2`, `4TrafficLights`, `3Symbols`, `3Flags`, `3Symbols2`, `5Quarters`, `4Rating`, `5Rating`. Avoid `3Stars`, `3Triangles`, and `5Boxes`: their current XLSX serialization is not reliable.
- Custom conditional formatting: `range.conditionalFormats.addCustom(expression, {fill, font, border});`
- `range.conditionalFormats.deleteAll()` / `range.conditionalFormats.clear()`

```js
const grid = sheet.getRange("B2:J10");
grid.conditionalFormats.add("colorScale", {
  colors: ["#2563EB", "#FDE047", "#DC2626"],
  thresholds: ["min", { type: "percentile", value: 50 }, "max"]
});
```

### Tables
- When adding new tables, set explicit unique names (`TasksTable`, `SummaryTable`).
- Do not overlap tables; the API does not reject overlaps. Check existing table ranges in the initial compact `inspect` summary before adding one.
- `const table = sheet.tables.add("A1:H200", true, "TasksTable")`
- `table.rows.add(null, [[...], ...])`, `table.getDataRows()`, `table.getHeaderRowRange()`
- Read tables: `sheet.tables.items` -> `Table[]`
- Set + Getters: `table.name`, `table.style`, `table.showHeaders`
- Toggles for table utilities (set/get): `table.showTotals`, `table.showBandedColumns = true`, `table.showFilterButton`
- `table.delete()`

### Images
- `sheet.images.add({dataUrl: "data:image/png;base64,...", anchor: {from: { row: 1, col: 2 }, extent: { widthPx: 160, heightPx: 120 }}})`

### Threaded Comments
This creates Excel Comments (threads with replies), which require a user-visible author.
- Required: Before adding a comment, create its visible author with `workbook.comments.setSelf({"displayName": <user_display_string>})`, where `<user_display_string>` is a string such as "User"
- Create a new thread with a single comment: `const thread = workbook.comments.addThread({"cell": sheet.getRange("E2")}, "Source: <website>")`
- To reply to a threaded comment: `thread.addReply("This is a reply to the comment")`
- To resolve/re-open a thread: `thread.resolve()`, `thread.reopen()`


### Notes
Excel Notes are single-cell annotations without replies; threaded Comments are conversations with replies. Both survive XLSX export/import, but PNG renders omit their indicators and text.

```js
const authorId = ""; // Or workbook.comments.setSelf({ displayName: "User" }).id
workbook.notes.add({
  id: `${sheet.name}:B4`,
  target: { cell: { sheetName: sheet.name, sheetId: sheet.sheetId, address: "B4" } },
  authorId,
  createdAt: "",
  body: { plainText: "Source: <website>" },
});
```

### Charts
- Place charts in reserved blank areas with gutter rows/columns; do not cover data.
- Prefer range-backed charts so source edits update the chart. Headers are detected when the first row contains text and no numeric cells.


#### Fast-chart path
- For contiguous data: pass categories first, then one column per series:
  ```js
  sheet.getRange("F4:H6").values = [
    ["Month", "Revenue", "EBITDA"],
    ["Jan", 100, 10],
    ["Feb", 120, 18],
  ];
  const chart = sheet.charts.add("line", sheet.getRange("F4:H6"));
  ```
- For nonadjacent columns: pass equal-height, single-column ranges with categories first:
  ```js
  const chart = sheet.charts.add("bar", [
    sheet.getRange("A1:A10"),
    sheet.getRange("D1:D10"),
    sheet.getRange("G1:G10"),
  ]);
  chart.series.items[0].fill = "#F472B6";
  ```
- Both paths create source-cell references and show a bottom legend. Apply requested formatting once after creation:
```js
chart.setPosition("J4", "Q20"); // always set
const fontFamily = "Arial";

chart.title = "Revenue and EBITDA Trend";
// Set titleTextStyle properties individually, not to an object
chart.titleTextStyle.fontSize = 12;
chart.titleTextStyle.typeface = fontFamily;

chart.legend = { position: "top", textStyle: { typeface: fontFamily } };
chart.xAxis = { axisType: "textAxis", textStyle: { typeface: fontFamily, fontSize: 10 } };
// Number formatting on chart axis must be set separately even if the source range is already formatted.
chart.yAxis = { numberFormatCode: "$#,##0", numberFormatSourceLinked: false, textStyle: { typeface: fontFamily }, tickLabelInterval: 2 };
chart.xAxis.title.text = "Month";
chart.yAxis.title.text = "Revenue and EBITDA";
```
- Chart `textStyle.fontSize` uses pixels; `typeface` sets the family. Style axes, legend, and titles separately (`xAxis.textStyle`, `yAxis.textStyle`, `legend.textStyle`, `titleTextStyle`); cell fonts do not configure chart fonts.
- Only set/style intended titles; styling an absent title can create a placeholder.
- For custom axis formats, set `numberFormatSourceLinked: false`. For $M labels, use `$0.0,,"M"` for dollars, `$0.0,"M"` for thousands, or `$0.0"M"` for millions. Fix formatting without changing source data.
- `chart.setData(range)` replaces categories/series but preserves title, legend, and axes. Apply series styling after binding data.
- For month/date labels, use helper cells containing strings such as `Jan 2025`; date-axis formats may show serial numbers in previews.
- Inspect series through `chart.series.items`; source bindings are `series.formula` and `series.categoryFormula`.
- Additional chart getters: `chart.type`, `chart.title.text`, `chart.categories` (may be empty for range-backed charts; inspect series references).
- Collection methods: `sheet.charts.getItemOrNullObject("Chart 1")`, `sheet.charts.deleteAll()`.
- XLSX chart types: `"bar" | "line" | "area" | "pie" | "doughnut" | "scatter" | "bubble" | "radar" | "stock"`.
- `"treemap"`, `"sunburst"`, `"histogram"`, `"boxWhisker"`, `"waterfall"`, `"funnel"`, and `"map"` are accepted by the API but omitted from XLSX exports in this runtime. Do not use them for Excel deliverables.

### Merging cells
- `sheet.mergeCells("A1:C1")`, `sheet.unmergeCells("A1:C1")`
- `range.merge()` merges the target range into one cell; `range.merge(true)` merges across each row in the target range.
- `range.unmerge()` reverses a merge.

For example:
```js
const range = sheet.getRange("I23:N24");
range.merge();
range.values = [["Quarterly revenue"]];
```

### Help / Grep
Use `workbook.help(...)` primarily for obscure/advanced surfaces (for example deep chart axis settings, unusual drawing configs, pivot APIs, or uncommon option schemas).
- `workbook.help("enum.ShapeGeometry", { include: "index,notes" }).ndjson`
- `workbook.help("enum.*", { search: "ShapeGeometry|LineStyle", include: "index" }).ndjson`
- `workbook.help("shape.add", { include: "examples,notes" }).ndjson`
- `workbook.help("fx.RATE", { include: "index,examples,notes" }).ndjson`
- `workbook.help("cash flow return rate", { search: "IRR|XIRR|NPV|XNPV", include: "index,examples,notes", maxChars: 4000 }).ndjson`
- `workbook.help("*", { search: "fill|borders|autofit", include: "index,examples,notes", maxChars: 6000 }).ndjson`

### Trace
For tracing the full tree of how a formula is calculated, `workbook.trace("Sheet!A1")` is available. For complex formulas, the full tree can be extremely large, so output should be capped or outputted to a separate temp file (never dump raw traces). It takes only a cell reference.

## Additional Resources

- For sensitivity data tables, read `artifact_tool_docs/DATA_TABLES.md`.
- For sparklines, read `artifact_tool_docs/SPARKLINES.md`.

## JavaScript example snippet (runnable)

```js
import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const fontFamily = "Arial"; // Example font used by the cell and chart API calls below.

const outputDir = "output";
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Summary");

sheet.getRange("A1:C4").values = [
  ["Month", "Revenue", "EBITDA"],
  ["Jan", 100, 10],
  ["Feb", 120, 18],
  ["Mar", 130, 22],
];
sheet.getRange("D1").values = [["Margin"]];
sheet.getRange("D2").formulas = [["=C2/B2"]];
sheet.getRange("D2:D4").fillDown();

sheet.getRange("A1:G4").format.font = { name: fontFamily, size: 11 };
sheet.getRange("A1:D1").format = {
  fill: "#0F766E",
  font: { name: fontFamily, bold: true, color: "#FFFFFF" },
};
sheet.getRange("B2:C4").format.numberFormat = "$#,##0";
sheet.getRange("D2:D4").format.numberFormat = "0.0%";

// Helper range links to source cells so edits update the chart.
sheet.getRange("F1:G1").values = [["Month", "Revenue"]];
sheet.getRange("F2:G2").formulas = [["=A2", "=B2"]];
sheet.getRange("F2:G4").fillDown();
const chart = sheet.charts.add("line", sheet.getRange("F1:G4"));
chart.title = "Revenue Trend";
chart.titleTextStyle.typeface = fontFamily;
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis", textStyle: { typeface: fontFamily } };
chart.yAxis = { numberFormatCode: "$#,##0", numberFormatSourceLinked: false, textStyle: { typeface: fontFamily } };
chart.setPosition("I1", "P15");

// Final calculation before visual verification, inspect and export.
workbook.recalculate();
const preview = await workbook.render({
  sheetName: "Summary",
  autoCrop: "all",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/summary.png`, new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(`${outputDir}/summary.xlsx`);
```
