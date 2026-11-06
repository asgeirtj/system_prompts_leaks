# Formulas, recalculation and editing existing workbooks

## Recalculate after every save

- `openpyxl` writes a formula as a bare string with no cached value. Until a real engine recalculates the file, every formula cell reads back empty to previewers, pandas and `load_workbook(data_only=True)`, so the user sees a blank deliverable.

- After every save that touches formulas, run:

```sh
python3 "/opt/muse/assets/artifacts/scripts/recalc_xlsx.py" output.xlsx
```

- It rewrites the file in place and returns JSON with `status` (`success` or `errors_found`), `total_formulas`, `total_errors` and an `error_summary` naming the error cells.

- The summary lists at most 100 locations per error type and reports the rest in `locations_truncated`, so trust `total_errors`, not the length of the list.

- `errors_found` still exits 0. An `error` key in place of `status` means nothing was recalculated.

- Never deliver while it reports errors. Never blame a pre-existing error without proving it: load the original with `data_only=True` and look at that cell first.

- A workbook that links to another file is a special case. The linked file is not on this machine, so the cached values of the linked cells are the only data present. An `openpyxl` re-save strips them and recalculation turns each one into an error.

- The recalc script refuses such a file unless you pass `--force`. Copy the linked cells' values out before saving over them.

## Choose formulas that survive

- The engine that recalculates here is LibreOffice, which implements fewer functions than Excel. A function it cannot evaluate ships as a literal `#NAME?`.

- Prefer the classic set: `SUM`, `SUMIFS`, `INDEX`, `MATCH`, `IFERROR`, `SUMPRODUCT` and functions of their generation.

- Newer functions are stored with a prefix in the XML, and `openpyxl` writes your string verbatim. Write `_xlfn.TEXTJOIN`, `_xlfn.CONCAT`, `_xlfn.IFS`, `_xlfn.SWITCH`, `_xlfn.MAXIFS` and `_xlfn.MINIFS`. Written bare, each one yields `#NAME?`.

- Never use the spilling array functions `XLOOKUP`, `XMATCH`, `SORT`, `FILTER`, `UNIQUE` or `SEQUENCE`. An `openpyxl`-written file carries no spill metadata, so only the top-left cell gets a value and the recalculation gate reads the truncated result as zero errors.

- Use `INDEX` and `MATCH` for lookups. Sort, filter and de-duplicate in Python before writing cells.

- Quote a sheet name that contains a space in a cross-sheet reference, as in `='Assumptions Inputs'!$B$5`. Unquoted, it evaluates to an error.

## Avoid openpyxl traps

- Reading a model takes two loads. `data_only=True` gives cached values with the formulas gone, and the default gives formula strings with no values. One pass cannot give both.

- A `data_only=True` workbook has no formulas left, so saving it replaces every formula with a literal.

- `data_only=True` on a file `openpyxl` just wrote returns `None` everywhere, so recalculate first. A formula whose result is an empty string also reads back as `None`, so `None` alone proves nothing.

- In a merged range, write only the top-left cell. Every other cell in the range is read-only.

- An `.xlsm` loses its macros unless you load it with `keep_vba=True`.

## Edit an existing workbook

- The file's own conventions override every guideline here.

- Find its designated input cells first, usually marked by a distinct font color, fill or shading. Write only there and leave every existing formula untouched.

- Match the existing number formats and fonts rather than restyling.
