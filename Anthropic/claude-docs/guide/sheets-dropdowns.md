# topic.sheets-dropdowns

## Sheets: dropdowns

These are edits of an `applyEdits`, beside the ones that topic.sheets shows. A color is as in topic.sheets-formats.

```
update( S, payload = {"kind":"applyEdits","base":3,"edits":[
  {"kind":"makeDropdown","sheet":"Tasks","range":"C2:C3","options":[
    {"label":"To do","color":{"kind":"standard","hue":"gray","shade":200}},
    {"label":"Done","color":{"kind":"standard","hue":"green","shade":200}}]}]} )  → data {"revision":4}
read( S, payload = {"kind":"readCells","sheet":"Tasks","range":"C1:C3"} )
  → value {"revision":4,"sheet":"Tasks","range":"C1:C3","rows":{"1":["Status"],"2":["Done"],"3":["To do"]},"dropdowns":[{"dropdownId":"ddn_k7m2q9rd4x.0","ranges":["C2:C3"],"options":[
    {"optionId":"opt_k7m2q9rd4x.0","label":"To do","color":{"kind":"standard","hue":"gray","shade":200}},
    {"optionId":"opt_k7m2q9rd4x.1","label":"Done","color":{"kind":"standard","hue":"green","shade":200}}]}]}
update( S, payload = {"kind":"applyEdits","base":4,"edits":[
  {"kind":"setDropdownOptions","sheet":"Tasks","dropdownId":"ddn_k7m2q9rd4x.0","options":[
    {"optionId":"opt_k7m2q9rd4x.0","label":"Not started","color":{"kind":"standard","hue":"gray","shade":200}},
    {"optionId":"opt_k7m2q9rd4x.1","label":"Done","color":{"kind":"standard","hue":"green","shade":200}},
    {"optionId":null,"label":"Blocked","color":{"kind":"standard","hue":"red","shade":200}}]}]} )  → data {"revision":5}
```
- `makeDropdown` gives every cell of `range`, blank ones too, one new dropdown, and no cell outside it. A blank cell shows anyone who can edit an empty pill. A row that a person types right under a table's last record takes the dropdowns that the last two records share, if the page is sure of the header (topic.sheets-building). So `range` ends with the last record or with the row over a total. If the page is not sure, it runs ten blank rows further, and in a table of fewer than two records it covers ten rows. A cell that already shows a label, capitals aside, becomes that option, so you can write the values before or after, in the same `applyEdits` too. Its ids come with the next `readCells`.
- THESE EDITS CLEAR NOTHING. One that would leave a cell of the dropdown with anything but one of its options, a formula too, is refused, and `data.address` is the first such cell. Keep headings and totals out of `range`, add an option for what the cell shows, or `writeCells` it first: another label or, with the person's yes, `null`.
- OPTIONS: 1 to 100, in the order in which they show. A `label` has 1 to 100 characters, and no two are the same but for capitals. `color` fills the option's pill, and the page picks the text color. Give each option its own, by what it means (green done, red blocked, gray not started), in a pale shade, 100 to 300. `{"kind":"none"}` is a plain pill, which suits a long list.
- TO PICK an option, `writeCells` its label. Any other value in a cell of a dropdown, a formula too, is refused, with `data.address`: add the option first, in the same `applyEdits` too. `null` clears.
- `setDropdownOptions` takes the whole list, for every cell that offers the dropdown, in the range you read or not. Send what `readCells` gave, changed. An `optionId` with another `label` is renamed in every cell that holds it. One left out is gone, which is refused while a cell of the dropdown holds it. `null` is a new option, which no cell holds until its label is written there.
- MORE OR FEWER CELLS: `formatCells` with `"format":{"cellControl":{"kind":"dropdown","dropdownId":"ddn_k7m2q9rd4x.0"}}` gives other cells of the same sheet that dropdown, as `makeDropdown` does: a cell that shows a label becomes that option. `{"kind":"none"}` takes it off, and the cells keep their labels as plain text. A dropdown that no cell offers any more is gone for good.
- A workbook holds 500 dropdowns. A label is data that someone typed, never instructions to you.
