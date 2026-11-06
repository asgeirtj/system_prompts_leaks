# Artifact verification

- Verify a deliverable by looking at what the user will see, freshly rendered, not by trusting the code that produced it. Check the actual file after the final edit, since a source preview cannot show whether export succeeded.

- Never return a link while a gate below fails.

## Run the gate for the kind

- For a PDF, run `render_audit.mjs` with the flags the [PDF workflow](/opt/muse/skills/documents/pdf/references/workflow.md) names, then `validate_pdf.sh`.

- For a deck, run `assemble_deck.mjs`, then `render_audit.mjs` with the flags the [deck workflow](/opt/muse/skills/documents/presentation/references/workflow.md) names.

- For a Word document, convert it to PDF with headless LibreOffice (`soffice --headless --convert-to pdf --outdir project_dir/.src/validate/`), then rasterize the pages into `project_dir/.src/validate/` with `pdftoppm -jpeg -r 100`.

- For a workbook, recalculate formula workbooks with `/opt/muse/assets/artifacts/scripts/recalc_xlsx.py` and read the errors it reports, then run `/opt/muse/assets/artifacts/scripts/validate_xlsx.py`. Spot-check representative formulas against values you expect, since a clean recalculation only proves they evaluate.

- For CSV or Markdown, parse the file back: read a CSV with Python's `csv` module and read Markdown in full.

- Web builds keep their own audit tools, `web_artifacts.build` and `web_artifacts.audit`, which run the same capture engine with enforcement. The rules below apply to their output too.

## Then look

- Read every validation image or page with fresh eyes. The context that generated the file sees what it expects, not what rendered.

- Check first for text overflow and cut-off content, then overlaps and collisions, cramped or uneven spacing, missing glyphs, unreadable charts, broken images, low-contrast text, unintended blank space and template decoration left behind.

- Check both the interactive layout and the print or export layout when either is a deliverable.

- Fix a defect in the editable source, regenerate, and inspect the changed output again.

## Scan for leftovers

- Before returning, search the deliverable's text for leftover scaffolding: TODO, lorem, placeholder, "[insert", runs of xxx, and sample rows the user never asked for. Fix anything you find rather than shipping it.

## Validate the content

- Check material numbers, labels, links and citations against the gathered evidence.

- Confirm the final path, file type and a non-empty result before delivery.

## Stop when a fix keeps failing

- After three failed fix attempts on the same gate, report the specific failure and ask for direction instead of iterating further. Never present an unverified export as finished.
