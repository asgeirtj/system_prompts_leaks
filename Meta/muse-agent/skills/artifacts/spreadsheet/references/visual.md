---
description: Visual rules for spreadsheets. Titles, hierarchy, alignment, number formats, deterministic charts, and the workbook validation a sheet must pass before delivery.
---

# Spreadsheet visual guidance

- Follow the visual direction in `verbatim_request` and the parent conversation. It overrides every default below.

- Make each visual choice because it fits this workbook, not because it is the easiest template. Watch for the generic defaults: one accent color everywhere, a single font doing all the work, no difference between title and body, and emoji used as icons.

- Do not apply a saved PDF theme unless the user asked for that styling.

- Use a visible title, a clear hierarchy, consistent spacing and restrained color. Give tables readable headers, stable alignment and number formats that suit their data.

- Generate charts, plots and other factual graphics deterministically from their source data.

## Validate the workbook

- Read the workbook back before returning its link:

```sh
# Your build task names `project_dir`. Use it, not a hardcoded `your_files`
# path: an artifact built under a goal lives in that goal's `files/` directory.
# Write the leading `~/` of `project_dir` as `$JARVIS_HOME/`: the shell leaves
# a tilde literal inside quotes, so `"~/workspace/..."` builds into a directory
# literally named `~`.
DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
python3 "/opt/muse/assets/artifacts/scripts/validate_xlsx.py" \
  "$DIR/<file_name>.xlsx" --json-out "$DIR/.src/validate/xlsx.json"
```

- It exits non-zero on a file that is not a real workbook, a corrupt archive or a workbook whose sheets are all empty. Fix the file and run it again, and do not deliver a link while it fails.

- Pass `--allow-empty` when the request is a blank template.

- Quote its sheet, cell and formula counts in your summary. A CSV output gets no reader check.

## Follow financial-model conventions

- Use these defaults for models and calculators unless the user says otherwise or an existing file already does something else:
  - Color code by role: blue text for hardcoded inputs and scenario levers, black for formulas, green for links to another sheet, red for links to another file, and yellow fill for key assumptions and the cells the user should fill in.
  - Format currency as `$#,##0` and name the unit in the header, as in `Revenue ($mm)`. Show negatives in parentheses and zeros as a dash with `$#,##0;($#,##0);-`.
  - Format percentages as `0.0%` and store them as fractions. `0.15` renders 15.0%, while storing `15` renders 1500.0%.
  - Format valuation multiples as `0.0x`, and store years as text so `2024` never renders as `2,024`.
  - Put every assumption in its own labeled cell and reference it from the formulas that use it: `=B5*(1+$B$6)`, never `=B5*1.05`.
  - Keep formulas consistent across every projection period. A lone hand-edited cell mid-row is the most common silent error.
  - Guard every denominator that can be zero.
  - Use one professional font throughout. The environment ships Liberation Sans and Liberation Serif as the Arial and Times stand-ins.
