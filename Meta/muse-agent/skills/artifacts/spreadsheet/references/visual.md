---
description: Visual rules for spreadsheets. Titles, hierarchy, alignment, number formats, deterministic charts, and the workbook validation a sheet must pass before delivery.
---

# Spreadsheet Visual Guidance

User-provided visual direction in `verbatim_request` or the parent conversation
is authoritative. Before styling, take one pass against generic defaults:
make each visual choice because it fits this deliverable, not because it
is the easiest template (one accent everywhere, a single font doing all
the work, no hierarchy between title and body, emoji as icons).

- Do not apply a saved PDF theme unless the user asked for styling.
- Use a visible title, clear hierarchy, consistent spacing, and restrained
  color. Tables need readable headers, stable alignment, and number formats
  appropriate to their data.
- Charts, plots, and other factual graphics are generated
  deterministically from their source data.

## Validation

Read the workbook back before returning its link:

```sh
# Your build task names `project_dir`. Use it, not a hardcoded `your_files`
# path: an artifact built under a goal lives in that goal's `files/` directory.
# `project_dir` comes from your build task. Write its leading `~/` as
# `$JARVIS_HOME/`: the shell leaves a tilde literal inside quotes, so
# `"~/workspace/..."` builds into a directory literally named `~`.
DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
python3 "/opt/hatch/skills/artifacts/scripts/validate_xlsx.py" \
  "$DIR/<file_name>.xlsx" --json-out "$DIR/.src/validate/xlsx.json"
```

- It exits non-zero on a file that is not a real workbook, a corrupt archive,
  or one whose sheets are all empty. Fix and rerun; do not deliver a link while
  it fails. Pass `--allow-empty` when a blank template is the request.
- Quote its sheet, cell, and formula counts in your summary. A `csv` output
  gets no reader check.

## Financial-model conventions

Defaults for models and calculators, unless the user says otherwise or an
existing file already does something else:

- Color code by role: blue text for hardcoded inputs and scenario levers,
  black for formulas, green for links to another sheet, red for links to
  another file, yellow fill for key assumptions and the cells the user
  should fill in.
- Number formats: currency `$#,##0` with the unit named in the header
  (`Revenue ($mm)`); negatives in parentheses and zeros rendered as a dash
  (`$#,##0;($#,##0);-`); percentages `0.0%` stored as fractions (`0.15`
  renders 15.0%, storing `15` renders 1500.0%); valuation multiples
  `0.0x`; years as text so `2024` never renders `2,024`.
- Structure: every assumption in its own labeled cell, referenced by the
  formulas that use it (`=B5*(1+$B$6)`, never `=B5*1.05`); formulas
  consistent across every projection period, since a lone hand-edited cell
  mid-row is the commonest silent error; guard denominators that can be
  zero.
- A professional default font throughout (the cell ships Liberation Sans
  and Liberation Serif as the Arial and Times stand-ins).
