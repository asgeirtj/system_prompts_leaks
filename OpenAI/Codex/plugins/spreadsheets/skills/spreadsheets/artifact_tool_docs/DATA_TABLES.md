# Data tables (two-variable sensitivity)

Use `sheet.dataTables.add(fullRange, { rowInput, columnInput })` to calculate a formula for each combination of two scenario inputs. The method returns `void`.  
Prefer an unused area on the existing model worksheet, reusing its input cells and output formula.

- `fullRange` includes the top-left formula cell, scenario values across the top row and down the left column, and the output body.
- `rowInput` is the model input cell replaced by values across the top row; `columnInput` is the model input cell replaced by values down the left column. Both must be single-cell A1 references on the table's worksheet. The formula may reference calculations on other sheets.
- These must be the actual cells driving the output formula. A local copy of an input from another sheet does not work if the model still reads the original cell.
- New data tables do not auto-calculate. Call `workbook.recalculate()` after creating them, before reading results or exporting.
- Do not use one-variable data tables. This is currently not supported.

Example assumes existing `workbook` and `sheet`, with revenue growth in `B2`, gross margin in `B3`, and the EBITDA formula (in dollars) in `B5`. Leave column C blank for spacing and reserve `D1:H7` for the sensitivity block. The 3×3 result grid uses a 4×4 `fullRange` (`E4:H7`), with the base case at `G6`.

The optional formatting illustrates a title band, labeled axes, thin rules and a shaded base case. Adapt placement, sizing, scenario steps, labels, colors and number formats to the model and the skill's formatting guidance.

```js
sheet.getRange("E4").formulas = [["=B5"]];
sheet.getRange("F4:H4").formulas = [["=$B$2-2.5%", "=$B$2", "=$B$2+2.5%"]];
sheet.getRange("E5:E7").formulas = [["=$B$3-5%"], ["=$B$3"], ["=$B$3+5%"]];
sheet.dataTables.add("E4:H7", {
  rowInput: "B2",
  columnInput: "B3",
});

// Formula links do not inherit number formats. Adapt these example formats
// to each model input and the output's units/precision.
for (const [address, format] of [
  ["F4:H4", "0.0%"], ["E5:E7", "0%"],
  ["F5:H7", '$#,##0,,"M";$(#,##0,,"M");"-"'],
]) sheet.getRange(address).setNumberFormat(format);

// Optional presentation formatting, adapted to the existing worksheet.
const ink = "#23364D", rule = { style: "thin", color: ink };
sheet.getRange("D1:H7").format = {
  fill: "#FFFFFF", font: { color: ink }, verticalAlignment: "center",
};
for (const [address, label] of [
  ["D1:H1", "EBITDA sensitivity"],
  ["F3:H3", "Revenue Growth"],
]) {
  const range = sheet.getRange(address);
  range.getCell(0, 0).values = [[label]]; // Other cells in the span stay empty.
  range.format.horizontalAlignment = "left";
}
sheet.getRange("D1:H1").format = {
  fill: ink, font: { bold: true, color: "#FFFFFF" },
};
sheet.getRange("D6").values = [["Gross Margin"]];
sheet.getRange("D6").format = { wrapText: true, horizontalAlignment: "center" };
for (const address of ["F3:H3", "D6"])
  sheet.getRange(address).format.font.italic = true;
for (const address of ["F4:H4", "E5:E7"])
  sheet.getRange(address).format = {
    font: { bold: true }, horizontalAlignment: "center",
  };
sheet.getRange("F5:H7").format.horizontalAlignment = "right";
sheet.getRange("E4").setNumberFormat(";;;"); // Hide the display; retain the formula.
sheet.getRange("F4:H4").format.borders = { top: rule, bottom: rule };
for (const address of ["E5:E7", "F5:H7"])
  sheet.getRange(address).format.borders = { left: rule };
sheet.getRange("G6").format.fill = "#F2F2F2"; // Optional base-case highlight.
workbook.recalculate();
```
