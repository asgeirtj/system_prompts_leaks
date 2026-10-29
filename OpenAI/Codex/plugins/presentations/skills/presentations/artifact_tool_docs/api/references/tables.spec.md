# Tables

`slide.tables` creates and edits PowerPoint-style tables.

## Resolved From Inspect

```ts
const table = presentation.resolve("tb/d4e5f6a7");
table.cells.set(1, 2, "$4.2M");
table.getCell(1, 2).text.style = "Body Small";
table.borders.assign({ style: "solid", fill: "slate-200", width: 1 });
```

Use `presentation.inspect({ kind: "table", search })` to find the `tb/...`
anchor id. If an imported table resolves as an image, preserve it as an image or
rebuild it as a native table intentionally.

## Add Table

```ts
const table = slide.tables.add({
  rows,
  columns,
  left,
  top,
  width,
  height,
  columnTracks: [fr(2), fr(1), fixed(120)],
  values,
});
```

Primitive matrices and structured text runs are accepted for `values`. Use `columnTracks` with `fr(...)` and `fixed(...)` when a table should fill its frame with proportional columns. Use `columnWidths` only for explicit pixel widths.

## Table Inline Types

```ts
type TableAddOptions = {
  rows: number;
  columns: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  values?: TableCellValue[][];
  columnTracks?: TableColumnTrack[];
  columnWidths?: number[];
};

type TableColumnTrack =
  | { mode: "fr"; value: number }
  | { mode: "fixed"; value: number };

type TableCellValue = string | number | string[] | StructuredTextInput | Text;
```

## Cells

```ts
const cell = table.getCell(rowIndex, columnIndex);
cell.value = cellValue;
cell.fill = fillConfig;
cell.text.style = textStyleName;

table.cells.set(rowIndex, columnIndex, textObjectOrValue);
```

## Ranges And Merges

```ts
table.merge({
  startRow,
  endRow,
  startColumn,
  endColumn,
});

const range = table.cells.block(rangeConfig);
range.fill = fillConfig;
range.textStyle.bold = isBold;
range.textStyle.color = textColor;
range.textStyle.fontSize = fontSizePx;
range.borders = borderConfig;

table.unmerge({ startRow, endRow, startColumn, endColumn });
```

## Insert And Delete Rows Or Columns

```ts
table.insertRows({ index: rowIndex, count: 2 });
table.deleteRows({ index: rowIndex, count: 1 });
table.insertColumns({ index: columnIndex });
table.deleteColumns({ index: columnIndex });
```

## Range And Merge Inline Types

```ts
type TableMergeRange = {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
};

type TableCellRangeConfig = {
  row: number;
  column: number;
  rowCount: number;
  columnCount: number;
};
```

## Style

```ts
table.style = tableStyleId;
table.styleOptions = tableStyleOptions;
table.columnTracks = [fr(2), fr(1), fixed(120)];
table.rows[0].height = headerHeightPx;
table.columns.get(columnIndex).width = columnWidthPx;
table.borders.assign(borderConfig);

table.cells.block({ row, column, rowCount, columnCount }).assign({
  fill,
  textStyle,
  borders,
  margins,
  anchor,
  horizontalOverflow,
});
```

## Style Inline Types

```ts
type TableStyleOptions = {
  headerRow?: boolean;
  totalRow?: boolean;
  firstColumn?: boolean;
  lastColumn?: boolean;
  bandedRows?: boolean;
  bandedColumns?: boolean;
};

type TableBorderLineConfig = {
  style?: "solid" | "dashed" | "dotted" | "dash-dot" | "dash-dot-dot" | string;
  width?: number;
  fill?: FillConfig;
  color?: FillConfig;
};
```

## Cookbook

```ts
// Compact KPI table.
const table = slide.tables.add({
  rows: 4,
  columns: 3,
  left: 96,
  top: 168,
  width: 680,
  height: 220,
  values: [
    ["Metric", "Current", "Delta"],
    ["Revenue", "$12.4M", "+18%"],
    ["Retention", "94%", "+3 pts"],
    ["Latency", "182 ms", "-22 ms"],
  ],
});
table.styleOptions = { headerRow: true, bandedRows: true };
table.getCell(0, 0).fill = "slate-950";
table.getCell(0, 1).fill = "slate-950";
table.getCell(0, 2).fill = "slate-950";
table.borders.assign({ style: "solid", fill: "slate-200", width: 1 });
```

```ts
// Spanning title row.
table.merge({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 });
table.getCell(0, 0).value = "Regional performance";
table.getCell(0, 0).text.style = "title";
```

```ts
// Highlight a cell range.
const riskRange = table.cells.block({
  row: 2,
  column: 2,
  rowCount: 2,
  columnCount: 1,
});
riskRange.fill = "amber-50";
riskRange.textStyle.color = "#92400e";
riskRange.textStyle.bold = true;
```
