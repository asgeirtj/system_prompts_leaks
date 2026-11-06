# PDFs

- A PDF is authored as HTML with print CSS and rendered through the shared capture engine. The kept source under `.src/` is the editable truth for every revision. Regenerate the PDF from it after each change, never patch the PDF itself.

## Read what the task needs

- Read the [PDF workflow](/opt/muse/skills/documents/pdf/references/workflow.md) for every build or edit. It covers authoring, rendering, the render gates and the validation loop.

- Read the [visual guide](/opt/muse/skills/documents/pdf/references/visual.md) for design and layout, and the shared [prose guide](/opt/muse/assets/artifacts/references/prose.md) for what the words say.

- Read the shared [chart guide](/opt/muse/assets/artifacts/references/charts.md) when the document plots data, and the shared [map guide](/opt/muse/assets/artifacts/references/maps.md) when it shows a place or a map.

- Read [working with existing PDFs](/opt/muse/skills/documents/pdf/references/existing-pdfs.md) to read, merge, split or extract from a PDF the user supplied, or to fill a PDF form.

- For a form fill, overlay stamp, crop, or decrypt, install `pypdf`: `pip install --break-system-packages pypdf`.

## Use the bundled scripts

- `/opt/muse/assets/artifacts/scripts/render_audit.mjs` renders the HTML source to a PDF and page images and runs the render gates. The workflow names its flags.

- `/opt/muse/assets/artifacts/scripts/validate_pdf.sh` checks integrity, page metadata and data-URI embedding, then rasterizes every page. Run it until it passes.

## Verify before delivery

- Run both gates, then read every validation page image as the workflow describes before returning a link.

- Preserve the requested page size, reading order and structure. If extraction misses content from a source, inspect the source rather than inventing what belongs there.
