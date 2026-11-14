# topic.sheets-building

## Sheets: building a table

What you cannot know or see while you build: the order that the calls have to go in, how a sheet is drawn, and what the person sees meanwhile.  
The example uses the calls that most tables need, so a plain table takes no other topic. S, `base` and what a cell holds are as in topic.sheets.

### The order of a build

```
update( S, payload = {"kind":"applyEdits","base":1,"edits":[
  {"kind":"renameSheet","sheet":"Sheet1","name":"Tasks"},
  {"kind":"writeCells","sheet":"Tasks","topLeft":"A1","rows":[["Task","Owner","Due","Status","Done","Hours","Notes"]]},
  {"kind":"formatCells","sheet":"Tasks","ranges":["A1:G1"],"format":{"fillColor":{"kind":"rgb","hex":"#f3f3f3"}}},
  {"kind":"setCellTable","sheet":"Tasks","cellTable":{"columns":"A:G","headerRows":"1","footerRows":null}}]} )  → data {"revision":2}
update( S, payload = {"kind":"applyEdits","base":2,"edits":[
  {"kind":"writeCells","sheet":"Tasks","topLeft":"A2","rows":[
    ["Draft the brief","Ana","2026-03-02","Done",true,3,"Sent to legal on Friday. They asked for the vendor list and the renewal dates."],
    ["Book the venue","Raj","2026-03-09","In progress",false,1.5,null],
    ["Send invitations","Ana","2026-03-16","To do",false,2,null]]},
  {"kind":"writeCells","sheet":"Tasks","topLeft":"I1","rows":[["Hours left","=SUMIFS(F2:F,E2:E,FALSE)"]]},
  {"kind":"makeDropdown","sheet":"Tasks","range":"D2:D4","options":[
    {"label":"To do","color":{"kind":"standard","hue":"gray","shade":200}},
    {"label":"In progress","color":{"kind":"standard","hue":"blue","shade":200}},
    {"label":"Done","color":{"kind":"standard","hue":"green","shade":200}}]},
  {"kind":"formatCells","sheet":"Tasks","ranges":["E2:E4"],"format":{"cellControl":{"kind":"checkbox"}}},
  {"kind":"formatCells","sheet":"Tasks","ranges":["F2:F200"],"format":{"numberFormat":{"pattern":"0.0"}}},
  {"kind":"formatCells","sheet":"Tasks","ranges":["G2:G200"],"format":{"alignment":{"wrap":true}}},
  {"kind":"formatCells","sheet":"Tasks","ranges":["I1"],"format":{"font":{"bold":true}}},
  {"kind":"setColumnWidths","sheet":"Tasks","columns":"G","widthInPixels":320},
  {"kind":"fitColumns","sheet":"Tasks","columns":"A:F"},
  {"kind":"fitColumns","sheet":"Tasks","columns":"I:J"}]} )  → data {"revision":3}
read( S, payload = {"kind":"readCells","sheet":"Tasks","range":"I1:J1"} )
  → value {"revision":3,"sheet":"Tasks","range":"I1:J1","rows":{"1":["Hours left",{"formula":"=SUMIFS(F2:F,E2:E,FALSE)","value":3.5}]}}
```
1. THE NAME AND THE HEADERS GO FIRST, in an update of their own, for a table of more than a few rows. The person sees each update land, so they see what is coming while the rows are still on the way, and can steer. There is no need to wait for them. In a new Sheet, `setTimeZone` then `setLocale` lead if you know where they are. A table of more than 500 cells can go in as a file instead, which is recommended (topic.sheets-import).
2. THEN THE ROWS AND ALL THAT GOES WITH THEM, in one update: cells, formulas, dropdowns, checkboxes, number formats, wrapping, borders. Past what one update holds (topic.sheets), the rows go in parts, from the top.
3. A FIT COMES LAST, once the columns hold what they will show. A fit that runs out of time takes its whole update with it, so after a very large table, or one with many formulas, it goes alone.
4. A READ OF THE FORMULAS shows what they come to.
5. SOME THINGS TAKE A CALL OF THEIR OWN, each as its topic says: a conditional format starts from a read, and a chart is a `batch`.
- DECLARE THE TABLE WITH ITS HEADERS. `setCellTable` says what no cell can: which rows name the columns, which columns are the table's, and which rows at its foot are totals, as `"footerRows":"9"` (`null` for none). It changes no cell and no look, so the header still needs its fill. A person's filter then goes by that and by no guess. The records are not declared: they run from under the header to the footer, or with no footer to the first blank row, and past it if the list seems to go on. So a total under a blank row needs `footerRows`, a row inserted over the footer is a record at once, and a heading written right of the last one adds a column. A sheet declares one table at most: sent again, the call says all three anew, `"cellTable":null` leaves the sheet with none, and `readSheets` gives it as it lies now. Its other tables are filtered by a guess.
- A FORMULA THAT NAMES A CELL PAST THE SHEET'S LAST ROW OR COLUMN, OR A SHEET THAT IS NOT THERE YET, IS AN ERROR, and stays one once the room or the sheet is there, until it is written again. `readSheets` gives the sheet's size. A `null` written at the far corner in an earlier edit makes the room.
- `{"kind":"setSheetSettings","sheet":"Tasks","settings":{"lastFrozenRow":1}}` keeps the rows down to that one in view however far anyone scrolls, for everyone, and `"lastFrozenColumn":"A"` does that for columns. `null` unfreezes, and a key that is left out is left alone.

### How a sheet is drawn

No read gives you a picture of the cells, so this is what the page does with them.
- A COLUMN STARTS 104 PIXELS WIDE, which holds about 14 letters or 11 digits of the font that cells start with (size 10). A row of plain text is 28 pixels tall, or 23 for a person who has set the page to tighter rows, which only they see.
- TEXT THAT IS TOO LONG for its column runs on over the blank cells beside it, and is cut where the next cell holds something, or at a table's side. So in a table, long text is cut. Wrapped, it breaks at the column's width and the row grows by 16 pixels a line, with no height from you. Notes and descriptions read well wrapped in a column of 240 to 400 pixels.
- A NUMBER NEVER RUNS ON OVER THE NEXT CELL. In a column that is too narrow, one with no number format is rounded to the digits that fit, and a date or a number under a format is cut at the cell's edge, so either can read as another value. A `readCells` lists such columns. `fitColumns` gives each column what it needs, and counts a text on one line for at most 360 pixels. Wrapped text does not widen its column.
- Text is drawn at the left, numbers, dates and times at the right, and `TRUE`, `FALSE` and errors in the middle, unless `horizontal` says otherwise. A checkbox is in the middle whatever it says. All are drawn at the top of their row, which shows once a neighbor wraps.
- PEOPLE OFTEN HAVE THE SHEET IN A PANE BESIDE THE CHAT, or on a phone, where only the first few columns are in view. Frozen rows and columns stay in view, and take that room from the rest.
- PEOPLE LAND ON THE FIRST TAB. A Sheet opens there. After the build of a blank Sheet, the page takes a person who has not clicked or scrolled meanwhile to the first tab from the left that you changed.
- A TABLE'S HEADER IS DRAWN IN A HEAVIER WEIGHT, with a thin line under each of the table's rows, and stays in view while those rows scroll, all where the page is sure which row it is. Its fill tells the page that. So a filled header takes no bold and no line from you, and no freeze to stay in view. A line elsewhere, as over a total, is `{"kind":"setBorders","sheet":"Tasks","range":"A9:G9","edges":"top","border":{"kind":"line","style":"thin","color":{"kind":"none"}}}`.
- TWO TABLES SIDE BY SIDE TAKE TWO BLANK COLUMNS BETWEEN THEM, which may be narrow. Over one, the page may draw them as one table.
- THE PAGE HAS A LIGHT THEME AND A DARK ONE. A color is kept as it looks on a light sheet, and the page draws what stands for it on a dark one, so dark text on a pale fill reads in both. A standard color's `hue` is gray, red, orange, yellow, green, teal, blue, purple or magenta. Of its shades, 100 to 300 are pale enough for a fill under text, and 600 is deep enough for text. Text in 800 is hard to tell from plain text.
- A dropdown's option is drawn as a pill in its color. A checkbox is drawn only over `true` or `false`.
- A DROPDOWN SHOWS IN ITS BLANK CELLS TOO. Anyone who can edit sees each as an empty pill with an arrow, as wide as the cell, which stops long text beside it.

### What the calls count on

- `sortRows` MOVES WHOLE ROWS, so two tables side by side are sorted together, and a title, a total or a blank row among the rows that it names ends up among the records. `sortCells` sorts one range and leaves the cells beside it.
- A RANGE WITH NO END, `=SUM(F2:F)`, covers rows that are added later, from a cell outside that column. It leaves out a row inserted above its first row, and then reads `=SUM(F3:F)`. The whole column, `=SUM(F:F)`, covers that row too, with the header: fine for a sum under a header in words. A total under its column, `=SUM(B2:B9)`, covers rows that are inserted between its first row and its last, and no others.
- A ROW THAT A PERSON TYPES RIGHT UNDER A TABLE'S LAST RECORD TAKES the formats, dropdowns and checkboxes that the last two records share, but no formulas, where the page is sure of the header. One you write takes nothing. So a dropdown's range ends with the last record or with the row over a total. A table that the person asked to have empty, or with one record, has its dropdowns on ten rows. A CHECKBOX WRITES `false` in each blank cell, which formulas count, so blank rows are better left out of it.
- A sort or a move that would split a merged range is refused, and a merged range hides what a formula spills under it.
