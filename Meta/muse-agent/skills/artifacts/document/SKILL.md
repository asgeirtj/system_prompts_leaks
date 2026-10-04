---
name: artifact_document
metadata: { "includeInPrompt": false }
description: Create, read, edit, or manipulate Word documents (.docx) and Word templates (.dotx). Use whenever a build task's artifact kind is document with the default docx output, or the task mentions a Word doc, .docx, or .dotx, extracts or reorganizes content from one, inserts or replaces images, does find-and-replace in one, or works with tracked changes (redlines) or comments. Covers python-docx generation, raw OOXML editing of existing files, document structure and formatting, and render verification. Not for PDFs, spreadsheets, or Google Docs.
---

# Word-document artifacts

A docx is generated with the preinstalled `python-docx` library from a
generator script. Keep the generator under `.src/`: it is the editable
source for future revisions, and the binary is always regenerated from it.

| Task | Read first |
|---|---|
| Design and structure | `/opt/hatch/skills/artifacts/document/references/visual.md` |
| What the words say: outline, headings, tone, the prose read-back | `/opt/hatch/skills/artifacts/references/prose.md` (shared) |
| Content formatting (tables, lists, emphasis) | `/opt/hatch/skills/artifacts/references/markdown.md` (shared) |
| The document shows a place or a map | `/opt/hatch/skills/artifacts/references/maps.md` (shared) |
| Edit an existing or uploaded .docx/.dotx, tracked changes, comments, extract/read content, legacy .doc | `/opt/hatch/skills/artifacts/document/references/editing.md` |

Set a non-empty `document.core_properties.title`, use a human-readable
filename and visible title, and never fake structure: real numbering for
lists (never a literal bullet character), real heading styles for anything a
table of contents must see, a paragraph bottom border for a rule (never a
one-row table), and separate paragraphs instead of newlines inside a run.

## Verification

Follow `/opt/hatch/skills/artifacts/testing/SKILL.md`: render the document to PDF with
headless LibreOffice, rasterize with pdftoppm, and read every page image
before returning a link.
