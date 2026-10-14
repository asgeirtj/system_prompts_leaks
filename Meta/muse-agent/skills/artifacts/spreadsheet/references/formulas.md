# Formulas, recalculation, and editing existing workbooks

## Why recalculation is mandatory

openpyxl writes a formula as a bare string with no cached value. Until a
real engine recalculates the file, every formula cell reads back as empty
to previewers, pandas, and `load_workbook(data_only=True)`: an
un-recalculated deliverable looks blank to the user. Run  
`python3 "/opt/hatch/skills/artifacts/scripts/recalc_xlsx.py" output.xlsx`  
after every save that touches formulas; it rewrites the file in place and returns JSON with
`status` (`success` or `errors_found`), `total_formulas`, `total_errors`,
and an `error_summary` naming error cells (locations cap at 100 per error
type with a `locations_truncated` count, so trust `total_errors`, not the
list length). `errors_found` exits 0; an `error` key instead of a `status`
means nothing was recalculated. Never deliver while it reports errors, and
never blame a pre-existing error without proving it: load the original
with `data_only=True` and look at that cell first.

A workbook that links to another FILE is a special case: the linked file
is not on this machine, so its cells' cached values are the only data
present, and an openpyxl re-save strips them; recalculation then turns
each into an error. The recalc script refuses such files without
`--force`. Copy the linked cells' values out before saving over them.

## Choosing formulas that survive

The engine that recalculates here is LibreOffice, which implements fewer
functions than Excel; a function it cannot evaluate ships as a literal  
`#NAME?`.

- Prefer the classic set: `SUM`, `SUMIFS`, `INDEX`, `MATCH`, `IFERROR`,
  `SUMPRODUCT`, and their generation.
- Post-2007 names are stored prefixed in the XML, and openpyxl writes your
  string verbatim, so write `_xlfn.TEXTJOIN`, `_xlfn.CONCAT`, `_xlfn.IFS`,
  `_xlfn.SWITCH`, `_xlfn.MAXIFS`, `_xlfn.MINIFS`; written bare each one
  yields `#NAME?`.
- Never use the spilling array functions: `XLOOKUP`, `XMATCH`, `SORT`,
  `FILTER`, `UNIQUE`, `SEQUENCE`. Even where an engine evaluates them, an
  openpyxl-written file carries no spill metadata, so only the top-left
  cell gets a value and the recalculation gate reads the truncated result
  as zero errors. Use `INDEX`/`MATCH` for lookups, and sort, filter, and
  de-duplicate in Python before writing cells.
- Quote a sheet name containing a space in cross-sheet references:  
  `='Assumptions Inputs'!$B$5`; unquoted it evaluates to an error.

## openpyxl gotchas

- Reading a model takes two loads: `data_only=True` gives cached values
  with the formulas gone; the default gives formula strings with no
  values. One pass cannot give both.
- `data_only=True` is destructive if you save: that in-memory workbook has
  no formulas left, so saving replaces every one with a literal.
- `data_only=True` on a file openpyxl just wrote returns `None`
  everywhere; recalculate first. A formula whose result is an empty string
  also reads back as `None`, so `None` alone proves nothing.
- Merged ranges: write the top-left anchor only; every other cell in the
  range is read-only.
- An `.xlsm` loses its macros unless loaded with `keep_vba=True`.

## Editing an existing workbook

The file's own conventions override every guideline here. Find its
designated input cells first (a distinct font color, fill, or shading
marks them), write only there, and leave every existing formula untouched.
Match the existing number formats and fonts rather than restyling.
