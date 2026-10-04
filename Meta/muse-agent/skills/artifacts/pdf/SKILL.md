---
name: artifact_pdf
metadata: { "includeInPrompt": false }
description: Build, revise, or manipulate a fixed-layout PDF (report, guide, one-pager, printable document). Use whenever a build task's artifact kind is pdf, a document build's output format is pdf, or the task reads, merges, splits, crops, or fills an existing PDF, including fillable AcroForms. Covers authoring the print-CSS HTML source, rendering, the geometry and validation gates, existing-PDF manipulation and form filling, and delivery under workspace/your_files.
---

# PDF artifacts

A PDF is authored as HTML with print CSS and rendered through the
shared capture engine. The kept source under `.src/` is the editable truth
for every future revision; the PDF binary is always regenerated, never
patched.

| Task | Read first |
|---|---|
| Any PDF build or edit | `/opt/hatch/skills/artifacts/pdf/references/workflow.md` (the workflow: authoring, render, gates, validation loop) |
| Design and layout | `/opt/hatch/skills/artifacts/pdf/references/visual.md` |
| What the words say: outline, headings, tone, the prose read-back | `/opt/hatch/skills/artifacts/references/prose.md` (shared) |
| The document plots data | `/opt/hatch/skills/artifacts/references/charts.md` (shared) |
| The document shows a place or a map | `/opt/hatch/skills/artifacts/references/maps.md` (shared) |
| Read, merge, split, or extract from an existing PDF; fill a PDF form | `/opt/hatch/skills/artifacts/pdf/references/existing-pdfs.md` |

## Scripts

| Script | What it does |
|---|---|
| `/opt/hatch/skills/artifacts/scripts/render_audit.mjs` (shared) | Renders the HTML source to PDF and PNGs and runs the render gates; `workflow.md` names the flags |
| `/opt/hatch/skills/artifacts/scripts/validate_pdf.sh` | Integrity, page metadata, data-URI embedding, full rasterization; run until it passes |

## Verification

Follow `/opt/hatch/skills/artifacts/testing/SKILL.md`: run the gates, then read every
validation PNG before returning a link.
