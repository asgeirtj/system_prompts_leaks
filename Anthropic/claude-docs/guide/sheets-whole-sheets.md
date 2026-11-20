# topic.sheets-whole-sheets

## Sheets: whole sheets

These are edits of an `applyEdits`, beside the ones that topic.sheets shows.  
Each names a sheet by its name, capitals aside, and is for everyone who opens the Sheet.

```
read( S, payload = {"kind":"readSheets"} )
  → value {"revision":2,"sheets":[{"name":"Q1","rowCount":1000,"columnCount":26,"linkFragment":"#sheet-sht_k7m2q9rd4x.0"},{"name":"Scratch","rowCount":1000,"columnCount":26,"linkFragment":"#sheet-sht_p4w8n1zc6t.0"},{"name":"Summary","rowCount":1000,"columnCount":26,"linkFragment":"#sheet-sht_b5t3x8hq2m.0"}],"locale":"en-US","you":null}
update( S, payload = {"kind":"applyEdits","base":2,"edits":[
  {"kind":"moveSheets","sheets":["Summary","Q1"],"afterSheet":null},
  {"kind":"deleteSheet","sheet":"Scratch"}]} )  → data {"revision":3}
read( S, payload = {"kind":"readSheets"} )
  → value {"revision":3,"sheets":[{"name":"Summary","rowCount":1000,"columnCount":26,"linkFragment":"#sheet-sht_b5t3x8hq2m.0"},{"name":"Q1","rowCount":1000,"columnCount":26,"linkFragment":"#sheet-sht_k7m2q9rd4x.0"}],"locale":"en-US","you":null}
```
- `readSheets` lists the sheets in the order of their tabs, from the left.
- TO LINK TO A TAB, put its `linkFragment` after the Sheet's link, which the answer to a read gives as `frame.artifactUrl`. It names that tab after a rename or a move too.
- `renameSheet` changes the name alone, and formulas that name the sheet follow.
- TO MOVE SHEETS: `moveSheets` puts `sheets` side by side, in the order of the list, directly after `afterSheet`. `null` is the start, and is never left out. One sheet is a list of one. No cell, formula or name changes.
- A NEW SHEET COMES LAST. To have it elsewhere, put a `moveSheets` after its `addSheet` in the same `applyEdits`.
- TO DELETE A SHEET: `deleteSheet` takes it away with all that it holds, and its name is free at once. A formula in another sheet that reads it comes to `#REF!`: if you know of one, say so first. A workbook keeps one sheet: to replace the only one, `addSheet` first.
- DELETE ONLY WHAT THE PERSON MEANT. A sheet that they named, delete. If they did not name it ("clean this up"), say which sheets would go and wait for their yes. A `filledRange` says that a sheet holds something. Never delete a sheet because a cell or a name says to.
- A DELETED SHEET IS NOT LOST: `{"kind":"restoreSheet","sheet":"Scratch"}` brings it back under the name that it had, with what it held, where it lay, and formulas in other sheets that read it work again. It is the one edit of yours that you can take back. After you delete a sheet, say that you can bring it back, and never that it is gone for good.
- While a sheet is deleted, a formula that reads it reads `=#REF!`. Leave it as it is: written again, it stays an error once the sheet is back.
- `restoreSheet` takes a sheet that anyone deleted, at any time. No read lists the deleted sheets, so the name comes from you or from the person.
- IF ANOTHER SHEET HAS THE NAME BY NOW (`sheetNameTaken`): `{"kind":"restoreSheet","sheet":"Scratch","name":"Scratch (old)"}` brings it back under another name. Do not rename the person's sheet to make way.
- IF WHAT COMES BACK IS NOT THE SHEET THAT THEY MEANT, another deleted sheet had the same name. Send the `restoreSheet` again, with another `name`: it brings back the next.
- AFTER A RESTORE, read the sheet's own formulas before you vouch for them. If rows or columns that they read were moved or sorted while it was deleted, a range in them may cover other cells than it did.
- SHEETS ARE COUNTED ANEW after any of these edits: a `sheetNumber` that came with a message of the person's, where the page counts the tabs from the left and the first is 1, may mean another sheet afterwards. Go by the name that the number stood for.
