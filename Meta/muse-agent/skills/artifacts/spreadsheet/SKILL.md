---
name: artifact_spreadsheet
metadata: { "includeInPrompt": false }
description: Create, read, edit, fix, or clean spreadsheet files (.xlsx, .xlsm, .csv, .tsv). Use whenever a build task's artifact kind is spreadsheet, or the task names a spreadsheet file and wants something done to it or produced from it, including restructuring messy tabular data into a proper workbook. Covers openpyxl generation, formulas and recalculation, editing existing workbooks, and the validation gates. Not for tasks whose deliverable is a document, report, or web page that merely contains a table.
---

# Spreadsheet artifacts

An xlsx is generated with the preinstalled `openpyxl` library from a
generator script. Keep the generator under `.src/`: it is the editable
source for future revisions, and the binary is always regenerated from it.

| Task | Path |
|---|---|
| Create, or edit with formulas and formatting | `openpyxl` |
| Quick look at an existing sheet | `muse.read` (converted to markdown, paged); it carries no cell coordinates, so never plan edits from it |
| Read a workbook's model (formulas AND their values) | two `load_workbook` passes; see `/opt/hatch/skills/artifacts/spreadsheet/references/formulas.md` |
| Bulk or messy tabular data in or out | Python `csv` from the standard library; `pip install --break-system-packages pandas` when a task genuinely needs it |
| Design, structure, number formats, model conventions | `/opt/hatch/skills/artifacts/spreadsheet/references/visual.md` |
| Formulas, recalculation, editing existing workbooks | `/opt/hatch/skills/artifacts/spreadsheet/references/formulas.md` |

Requirements on every delivered workbook:

- Set a non-empty `workbook.properties.title` and a human-readable
  filename. Data enters the workbook from the build's gathered content
  only; a value you do not have is a blank cell or a question, never an
  invented number.
- Write formulas, never precomputed results: `sheet["B10"] = "=SUM(B2:B9)"`,
  not the Python-computed total. The sheet must recalculate when its
  inputs change.
- Follow the user's spec literally: their exact tab names, exact column
  headers, and the formula they spelled out. A redesign that computes
  something else fails, however elegant.
- Zero formula errors at delivery: run the recalculation gate below and
  fix what it names.
- Document assumptions and hardcoded numbers where the reader will see
  them (a cell comment or an adjacent labeled cell), citing the real
  source when one exists and saying plainly when the number came from the
  user.
- A workbook created for someone to fill in gets a short legend naming
  the cells to edit and one example row of realistic values; never add an
  example row to a file you were asked to edit.

## Scripts

| Script | What it does |
|---|---|
| `/opt/hatch/skills/artifacts/scripts/recalc_xlsx.py` | Recalculates the workbook in place through headless LibreOffice and reports every formula-error cell as JSON; mandatory whenever the file contains formulas. `errors_found` exits 0: read the JSON, not the exit code |
| `/opt/hatch/skills/artifacts/scripts/validate_xlsx.py` | Opens the workbook read-back: zip integrity, sheet parts, populated-cell counts; do not deliver a link while it fails. A csv output gets no reader check |

## Verification

Run `recalc_xlsx.py` (when formulas exist), then `validate_xlsx.py`, then
follow `/opt/hatch/skills/artifacts/testing/SKILL.md`. A clean recalculation proves
the formulas evaluate, not that they are right: spot-check two or three
formulas pull the values you expect before building out a grid.
