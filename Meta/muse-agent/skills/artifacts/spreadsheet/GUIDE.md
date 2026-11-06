# Spreadsheets

- A workbook (`.xlsx`) is generated with the preinstalled `openpyxl` library from a generator script. Change the generator and regenerate the file, never the binary directly.

## Pick the route for the task

- Create a workbook, or edit one with formulas and formatting, through `openpyxl`.

- Take a quick look at an existing sheet with `muse.read`, which shows it as paged Markdown. That view carries no cell coordinates, so never plan edits from it.

- Read a workbook's model, formulas and their values, with two `load_workbook` passes as the [formula guide](/opt/muse/skills/documents/spreadsheet/references/formulas.md) explains.

- Move bulk or messy tabular data in or out with Python's standard `csv` module. Install pandas with `pip install --break-system-packages pandas` only when a task genuinely needs it.

- Read the [workbook design guide](/opt/muse/skills/documents/spreadsheet/references/visual.md) for structure, number formats and model conventions, and the [formula guide](/opt/muse/skills/documents/spreadsheet/references/formulas.md) for formulas, recalculation and editing an existing workbook.

- Read the shared [chart guide](/opt/muse/assets/artifacts/references/charts.md) when the workbook plots data.

## Meet these requirements

- Set a non-empty `workbook.properties.title`.

- Fill the workbook only from the build's gathered content. A value you do not have stays a blank cell or becomes a question, never an invented number.

- Write formulas, never precomputed results: `sheet["B10"] = "=SUM(B2:B9)"`, not a total computed in Python. The sheet must recalculate when its inputs change.

- Follow the user's spec literally: their exact tab names, exact column headers and the formula they spelled out. A redesign that computes something else fails, however elegant.

- Document assumptions and hardcoded numbers where the reader will see them, in a cell comment or an adjacent labeled cell. Cite the real source when one exists and say plainly when a number came from the user.

- Give a workbook made for someone to fill in a short legend naming the cells to edit and one example row of realistic values. Never add an example row to a file you were asked to edit.

## Run the scripts

- `/opt/muse/assets/artifacts/scripts/recalc_xlsx.py` recalculates the workbook in place through headless LibreOffice and reports every formula error as JSON. Run it whenever the file contains formulas. It exits 0 even when it reports `errors_found`, so read the JSON, not the exit code.

- `/opt/muse/assets/artifacts/scripts/validate_xlsx.py` reads the workbook back and checks archive integrity, sheet parts and populated-cell counts. Do not deliver a link while it fails. A CSV output gets no reader check.

## Verify before delivery

- Run `recalc_xlsx.py` when formulas exist, then `validate_xlsx.py`, then inspect the important sheets and print layout using the [artifact verification guide](/opt/muse/assets/artifacts/references/verification.md). Deliver with zero formula errors.

- A clean recalculation proves the formulas evaluate, not that they are right. Spot-check two or three formulas against the values you expect before building out a grid.
