# Word documents

- A Word document (`.docx`, or a `.dotx` template) is generated with the preinstalled `python-docx` library from a generator script. Change the generator and regenerate the file, never the binary directly.

## Read what the task needs

- Read the [visual guide](/opt/muse/skills/documents/document/references/visual.md) for design and structure, and the shared [prose guide](/opt/muse/assets/artifacts/references/prose.md) for what the words say. A Word document is mostly text, so read both.

- Read the shared [Markdown guide](/opt/muse/assets/artifacts/references/markdown.md) for tables, lists and emphasis.

- Read the [editing guide](/opt/muse/skills/documents/document/references/editing.md) before you change an existing or uploaded file, work with tracked changes or comments, extract content or convert a legacy `.doc`.

- Read the shared [chart guide](/opt/muse/assets/artifacts/references/charts.md) when the document plots data, and the shared [map guide](/opt/muse/assets/artifacts/references/maps.md) when it shows a place or a map.

## Build real structure

- Set a non-empty `document.core_properties.title`. Give the file a visible title.

- Never fake structure:
  - Use real list numbering, never a typed bullet character.
  - Use real heading styles for anything a table of contents must find.
  - Draw a horizontal rule as a paragraph bottom border, never as a one-row table.
  - Start a new paragraph instead of putting a line break inside a run.

- Put tabular information in real tables with readable headers and stable alignment.

## Check every page

- Convert the document to PDF with headless LibreOffice (`soffice --headless --convert-to pdf --outdir project_dir/.src/validate/`), rasterize the pages into `project_dir/.src/validate/` with `pdftoppm -jpeg -r 100`, and read every page image before you return a link.

- Look for broken page breaks, headers, tables, images and characters that failed to render, using the [artifact verification guide](/opt/muse/assets/artifacts/references/verification.md). Reopen the saved file to confirm its structure.
