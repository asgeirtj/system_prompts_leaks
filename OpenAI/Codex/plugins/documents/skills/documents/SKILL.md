---
name: documents
description: Create, edit, redline, and comment on `.docx`, Word, and Google Docs-targeted document artifacts inside the container, with a strict render-and-verify workflow. Use `render_docx.py` to generate page PNGs (and optional PDF) for visual QA, then iterate until layout is flawless before delivering the final document.
---

# DOCX Skill (Read • Create • Edit • Redline • Comment)

## Titles + Intro to doc

**Title clarity is an absolute requirement.** State the specific subject and purpose so the reader understands what the document is for before reading the body. Use plain descriptive language with no slogans and no punctuation. Apply this to document titles, subtitles, and section titles, using only words, numbers, and spaces. Use Word's `Title` paragraph style for document titles. Keep it black with no underlining, paragraph borders, or decorative lines beneath it. Remove any direct formatting or separately added lines that conflict.

**The opening content is essential to the reader's understanding of the whole document.** Establish what the document covers, why it matters to this reader, and the main conclusion, decision, or task. Give enough context and scope to make the sections that follow easy to understand and show what the reader should learn or do.

## Writing quality

- Write for the intended reader. Identify the author, recipient, and what the reader needs to understand or do. Follow user instructions first, choose the requested document format, and preserve the style of an existing document or supplied reference.
- Write directly in the author's voice, using "I" or "we" when appropriate. Present the update, recommendation, or request to the recipient. Match the author's tone and relationship to that audience; do not invent experience, authority, commitments, or facts from style examples.
- Lead with the conclusion, decision, or request. Use concrete subjects, strong verbs, and natural sentences. State what changed, why it matters, and what evidence or constraint supports the claim. Keep necessary qualifications and distinguish facts, interpretation, recommendations, and uncertainty.
- Remove stock formulas, slogans, inflated significance, vague abstractions, unsupported authorities, canned empathy, and ornamental transitions. Avoid conspicuous rhetorical triads, forced contrasts, repetitive cadence, and punctuation used only for emphasis. Judge these patterns in context; an isolated phrase, accurate technical term, or useful contrast is not automatically a defect.
- Review both the writing and the rendered document. Check that claims are supported, the author's voice is consistent, and every page is readable and free of layout defects. Do not mention this editorial framework in the delivered document unless asked.

Before formatting, read the title and section headings as an outline. Write connected paragraphs that explain relationships, and replace compressed labels or unnecessary compounds with natural wording. Preserve the source's meaning, including uncertainty, conditions, time periods, and comparisons. Use punctuation and passive voice in body text when they improve precision.

For the review steps, examples, and more context, read [writing_quality.md](writing_quality.md#editorial-review-for-documents).


Use this skill when you need to create or modify `.docx`, Word, or Google Docs-targeted document artifacts **in this container environment** and verify them visually.

## Tools + Contract Requirements

- Use Codex workspace dependencies for docx artifact work: resolve them through the workspace dependency loader or runtime skill, then treat the returned Node/Python runtimes and package directory as authoritative. Do not use system `node`, system `python`, global npm packages, or repo-local installs.
- For document creation and deterministic OOXML edits, it is still acceptable to use the bundled Python/OOXML helper scripts in this skill package when the JS surface is incomplete.
- Run any builder or helper file from a writable workspace or temp directory, not from the managed dependency directory itself.


Immediately before the first create/edit authoring command, run `mark_artifact_operation_started.mjs` successfully exactly once using the command below. Do not run it for read-only work. For edits, replace `create` with `edit`; adjust the expected count and output format to match the requested outputs.

```bash
node container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format docx
```

## Artifact Template Selection

When creating new documents without a template, reference, or visual direction, or when the user asks to browse or upload templates, read [template selection](references/template-elicitation.md) before choosing a design or starting creation.

## Google Docs-targeted output

For a net-new Google Docs request, create and visually verify a local `.docx` with this skill first. The native Google Docs deliverable must then be produced by the Google Drive plugin's document import action, `mcp__codex_apps__google_drive_import_document`, with `upload_mode: "native_google_docs"`.

Before rendering or importing any Google Docs-targeted DOCX, run the deterministic title sanitizer:

```bash
python scripts/google_docs_title_sanitize.py input.docx --out sanitized.docx
python scripts/google_docs_title_sanitize.py sanitized.docx --check
```

Use the sanitized DOCX for render QA and native Google Docs import. This is not a style preference or prose reminder: the sanitizer removes Word `Title` paragraph-style border residue, direct title-paragraph borders, and leading title-block paragraph borders from the OOXML so Word's built-in blue title rule cannot survive into the imported Google Doc.

Do not use Computer Use, Browser Use, blank-Google-Doc creation plus Google Docs write APIs, or another direct-to-Docs construction path for net-new Google Docs unless the user explicitly asks for that alternate workflow. If they do, mention first that output quality is expected to be best when a local `.docx` is imported through the Google Drive plugin.

If the Google Drive plugin is unavailable, use the plugin-install/user-elicitation flow to ask the user to install `google-drive@openai-curated`. If the plugin is available but `_import_document` is missing, ask the user to reinstall or refresh the Google Drive plugin before continuing with the native Google Docs deliverable.

## Template Following

When an attached or retained DOCX is meant to control a new document, read
`template-distill.md` and then `template-create.md`. Keep the reference file and
the task-local `$TMP_DIR/artifact.md` together throughout authoring. In this
mode, the retained reference is the design authority: do not apply a generic
design preset, page baseline, or header pattern unless the user explicitly asks
to depart from the template. The render gate and Google Docs import contract
still apply. For a Google Docs-targeted result, record any change made by the
required title sanitizer as an intentional fidelity deviation.

## Non-negotiable: render → inspect PNGs → iterate

**You do not "know" a DOCX is satisfactory until you've rendered it and visually inspected page images.**  
DOCX text extraction (or reading XML) will miss layout defects: clipping, overlap, missing glyphs, broken tables, spacing drift, and header/footer issues.

**Shipping gate:** before delivering any DOCX, you must:
- Run `render_docx.py` to produce `page-<N>.png` images (optionally also a PDF with `--emit_pdf`)
- Open the PNGs (100% zoom) and confirm every page is clean
- If anything looks off, fix the DOCX and **re-render** (repeat until flawless)

If rendering fails, diagnose the packaged renderer using its logs before retrying.

**Deliverable discipline:** Rendered artifacts (PNGs and optional PDFs) are for internal QA only. Unless the user explicitly asks for intermediates, **return only the requested final deliverable** (e.g., when the task asks for a DOCX, deliver the DOCX — not page images or PDFs).




## Design standards for document generation

For generating new documents or major rewrite/repackages, follow the design standards below unless the user explicitly requests otherwise. The user's instructions always take precedence; otherwise, adhere to these standards.

When creating the document design, do not compromise on the content and make factual/technical errors. Do not produce something that looks polished but not actually what the user requested.

It is very important that the document is professional and aesthetically pleasing. As such, you should follow this general workflow to make your final delivered document:

1. Before you make the DOCX, please first think about the high-level design of the DOCX:
   - Before creating the document, decide what kind of document it is (for example, a memo, report, SOP, workflow, form, proposal, or manual) and design accordingly. In general, you shall create documents which are professional, visually polished, and aesthetically pleasing. However, you should also calibrate the level of styling to the document's purpose: for formal, serious, or highly utilitarian documents, visual appeal should come mainly from strong typography, spacing, hierarchy, and overall polish rather than expressive styling. The goal is for the document's visual character to feel appropriate to its real-world use case, with readability and usability always taking priority.
   - You should make documents that feel visually natural. If a human looks at your document, they should find the design natural and smooth. This is very important; please think carefully about how to achieve this.
   - Think about how you would like the first page to be organized. How about subsequent pages? What about the placement of the title? What does the heading ladder look like? Should there be a clear hierarchy? etc
   - Would you like to include visual components, such as tables, checklists, images, etc? If yes, then plan out the design for each component.
   - Think about the general spacing and layout. What will be the default body spacing? What page budget is allocated between packaging and substance? How will page breaks behave around tables and figures, since we must make sure to avoid large blank gaps, keep captions and their visuals together when possible, and keep content from becoming too wide by maintaining generous side margins so the page feels balanced and natural.
   - Think about font, type scale, consistent accent treatment, etc. Try to avoid forcing large chunks of small text into narrow areas. When space is tight, adjust font size, line breaks, alignment, or layout instead of cramming in more text.
2. Once you have a working DOCX, continue iterating until the entire document is polished and correct. After every change or edit, render the DOCX and review it carefully to evaluate the result. The plan from (1) should guide you, but it is only a flexible draft; you should update your decisions as needed throughout the revision process. Important: each time you render and reflect, you should check for both:
   1. Design aesthetics: the document should be aesthetically pleasing and easy to skim. Ask yourself: if a human were to look at my document, would they find it aesthetically nice? It should feel natural, smooth, and visually cohesive.
   2. Formatting issues that need to be fixed: e.g. text overlap, overflow, cramped spacing between adjacent elements, awkward spacing in tables/charts, awkward page breaks, etc. This is super important. Do not stop revising until all formatting issues are fixed.

While making and revising the DOCX, please adhere to and check against these quality reminders, to ensure the deliverable is visually high quality:

- Document density: Try to avoid having verbose dense walls of text, unless it's necessary. Avoid long runs of consecutive plain paragraphs or too many words before visual anchors. For some tasks this may be necessary (i.e. verbose legal documents); in those cases ignore this suggestion.
- Font: Use professional, easy-to-read font choices with appropriate size that is not too small. Usage of bold, underlines, and italics should be professional.
- Color: Set all document titles, subtitles, headings, subheadings, and page headers to black (`#000000`). Apply black to their styles and remove theme colors or direct formatting that would override it. For table header rows, use the fill and text colors specified in the table guidance below.
- Visuals: Consider using tables, diagrams, and other visual components when they improve comprehension, navigation, or usability.
- Tables:
  - Use tables intentionally and only for these purposes:
    - Comparing multiple items across the same set of attributes.
    - Presenting numeric data, metrics, specifications, pricing, dates, or other values readers need to scan across.
    - Showing a compact matrix, such as options × criteria, roles × responsibilities, or risks × mitigations.
    - Presenting repeated records with a consistent schema.
  - Keep long explanations, research findings, and proposed policy language in prose under descriptive headings. Use a compact matrix to summarize fields readers need to compare. Review consecutive table pages and replace tables that merely arrange narrative paragraphs into cells. Keep long tables only when readers need the full set of comparable records together.
  - Suggestions:
    - Set deliberate table/cell widths and heights instead of defaulting to full page width.
    - Choose column widths intentionally rather than giving every column equal width by default. Very short fields (for example: item number, checkbox, score, result, year, date, or status) should usually be kept compact, while wider columns should be reserved for longer content.
    - Avoid overly wide tables, and leave generous side margins so the layout feels natural.
    - Keep all text vertically centered and make deliberate horizontal alignment choices.
    - Ensure cell height avoids a crowded look. Leave clear vertical spacing between a table and its caption or following text.
  - Hard constraints:
    - Borders: Explicitly set outer and internal cell borders to light gray (`#D9D9D9`) so every table has visible borders.
    - Header colors: Choose light gray, dark gray, dark blue, or light blue header fills to suit the document; do not default every table to light gray. Keep related tables consistent. Use white header text on dark fills and black text on light fills.
    - Row shading: With a dark gray or dark blue header, alternate body-row backgrounds between white and a pale gray or pale blue tint. Keep the light gray borders visible.
    - To prevent clipping/overflow:
      - Never use fixed row heights that can truncate text; allow rows to expand with wrapped content.
      - Ensure cell padding and line spacing are sufficient so descenders/ascenders don't get clipped.
      - If content is tight, prefer (in order): wrap text -> adjust column widths -> reduce font slightly -> abbreviate headers/use two-line headers.
    - Padding / breathing room: Ensure text doesn't sit against cell borders or look "pinned" to the upper-left. Favor generous internal padding on all sides, and keep it consistent across the table.
    - Vertical alignment: In general, you should center your text vertically. Make sure that the content uses the available cell space naturally rather than clustering at the top.
    - Horizontal alignment: Do not default all body cells to top-left alignment. Choose horizontal alignment intentionally by column type: centered alignment often works best for short values, status fields, dates, numbers, and check indicators; left alignment is usually better for narrative or multi-line text.
    - Line height inside cells: Use line spacing that avoids a cramped feel and prevents ascenders/descenders from looking clipped. If a cell feels tight, adjust wrapping/width/padding before shrinking type.
    - Width + wrapping sanity check: Avoid default equal-width columns when the content in each column clearly has different sizes. Avoid lines that run so close to the right edge that the cell feels overfull. If this happens, prefer wrapping or column-width adjustments before reducing font size.
    - Spacing around tables: Keep clear separation between tables and surrounding text (especially the paragraph immediately above/below) so the layout doesn't feel stuck together. Captions and tables should stay visually paired, with deliberate spacing.
    - Quick visual QA pass: Look for text that appears "boundary-hugging", specifically content pressed against the top or left edge of a cell or sitting too close beneath a table. Also watch for overly narrow descriptive columns and short-value columns whose contents feel awkwardly pinned. Correct these issues through padding, alignment, wrapping, or small column-width adjustments.
- Forms / questionnaires: Design these as a usable form, not a spreadsheet.
  - Prioritize clear response options, obvious and well-sized check targets, readable scale labels, generous row height, clear section hierarchy, light visual structure. Please size fields and columns based on the content they hold rather than by equal-width table cells.
  - Use spacing, alignment, and subtle header/section styling to organize the page. Avoid dense full-grid borders, cramped layouts, and ambiguous numeric-only response areas.
- Coherence vs. fragmentation: In general, try to keep things to be one coherent representation rather than fragmented, if possible.
  - For example, don't split one logical dataset across multiple independent tables unless there's a clear, labeled reason.
  - For example, if a table must span across pages, continue to the next page with a repeated header and consistent column order
- Callouts: Do not use callout boxes, shaded note cards, accent-bar blocks, or boxed summaries and decision panels. Present this content as ordinary paragraphs, optionally with a bold lead-in. This applies whether the callout is built with a table, text box, shape, or paragraph shading/borders.
- Spacing: Please check rigorously for spacing issues. Please always use a natural amount of spacing between adjacent components. Use clear, generous vertical spacing between sections and paragraphs, and leave a bit of extra space between subheadings and the content that follows when it improves readability. Use indentation and alignment intentionally so the document's hierarchy is immediately clear. At the same time, avoid large "layout gaps" caused by a table or chart not fitting at the bottom of a page and getting pushed to the next one. If this happens, please try these suggestions:
  - moving the preceding paragraph(s) with it to the next page to keep the narrative cohesive
  - scaling the visual modestly or simplify labels without hurting readability, formatting, or aesthetics of the visual
  - Splitting the table/figure cleanly across multiple pages, but use repeated headers to make the page continuation clear.
- Text boxes: For text boxes, please follow the same breathing-room rules as the tables: make sure to use generous internal padding, intentional alignment, and sufficient line spacing so text never feels cramped, clipped, or pinned to the edges. Keep spacing around the text box clear so it remains visually distinct from surrounding content, and if the content feels tight, prefer adjusting box size, padding, or text wrapping before reducing font size.
- Layout/archetype: Remember to choose the right document archetype/template (proposal, SOP, workflow, form, handbook, etc.). Use a coherent style system. Once a style system is chosen, apply it consistently across headings, spacing, table treatments, and accent usage. If appropriate to the document type, include a cover page or front-matter elements such as title, subtitle, metadata, or branding.

### Note on page sizing

When creating a new DOCX, **always** default to the Letter size 8.5 x 11 inches, in Portrait orientation, unless the user specifies otherwise.

### Note on font sizing

Use a readable size appropriate to the text's role and typeface; ~11-12 pt is a good default for sustained prose. Use text 10 pt and below only if ideal for secondary roles or constrained tables/forms, and only when it remains comfortable at normal print or fit-width viewing. Do not shrink type merely to meet a page-count or compactness target. Follow explicit user typography instructions, but never at the expense of practical readability.

### Editing tasks (DOCX edits) — apply instead of major rewrite behavior

When the user asks to edit an existing document, preserve the original and make minimal, local changes:

- Prefer inline edits (small replacements) over rewriting whole paragraphs.
- Use clear inline annotations/comments at the point of change (margin comments or comment markers). Don't move all feedback to the end.
- Keep the original structure unless there's a strong reason; if a restructure is needed, do it surgically and explain via comments.
- Don't "cross out everything and rewrite"; avoid heavy, blanket deletions. The goal is trackable improvements, not a fresh draft unless explicitly requested.

## Equations: native Word math vs rendered fallback

When the requested document or source contains mathematical equations, choose the equation
representation deliberately. Never leave raw LaTeX in the document or approximate structured
notation with plain text.

1. **Prefer native Word equations (OMML, such as `<m:oMath>` or `<m:oMathPara>`)** when the user
   asks for native or editable equations, when an existing DOCX already uses native equations, or
   when equations need to remain searchable, accessible, copyable, inline with prose, or easy to
   revise. Use native equations only through a tested OMML authoring path, and verify that Word and
   the final LibreOffice render preserve the notation correctly.
2. **Use the rendered MathJax fallback below** when native/editable math is not required and either
   no reliable OMML authoring path is available or a complex display equation needs predictable
   visual fidelity across renderers. This path produces an image, not a native Word equation. It is
   best for stable display equations where portability matters more than editability.

Do not silently rasterize an equation when the user explicitly requires native or editable Word
math. If no tested OMML path is available, explain that limitation rather than mislabeling an image
as native. When editing an existing DOCX, preserve its equation representation unless the request or
render QA gives a clear reason to change it.

### Rendered fallback: MathJax to high-resolution PNG

The standard artifact container includes Node.js, `mathjax-full`, `sharp`, and `python-docx`. Use
MathJax to render LaTeX to SVG, then rasterize it to a high-resolution transparent PNG for reliable
insertion with `python-docx` and reliable LibreOffice rendering:

```javascript
"use strict";

const sharp = require("sharp");

let _mathjax;
let _adaptor;
let _doc;

function ensureMathJax() {
  if (_mathjax && _adaptor && _doc) return;
  const { mathjax } = require("mathjax-full/js/mathjax.js");
  const { TeX } = require("mathjax-full/js/input/tex.js");
  const { SVG } = require("mathjax-full/js/output/svg.js");
  const { liteAdaptor } = require("mathjax-full/js/adaptors/liteAdaptor.js");
  const { RegisterHTMLHandler } = require("mathjax-full/js/handlers/html.js");
  const { AllPackages } = require("mathjax-full/js/input/tex/AllPackages.js");

  _adaptor = liteAdaptor();
  RegisterHTMLHandler(_adaptor);
  const tex = new TeX({ packages: AllPackages });
  const out = new SVG({ fontCache: "local" });
  _doc = mathjax.document("", { InputJax: tex, OutputJax: out });
  _mathjax = mathjax;
}

function latexToSvgDataUri(latex, display = true) {
  ensureMathJax();
  const html = _adaptor.outerHTML(_doc.convert(latex, { display }));
  const a = html.indexOf("<svg");
  const b = html.indexOf("</svg>");
  let svg = a !== -1 && b !== -1 ? html.slice(a, b + 6) : html;
  svg = svg.replace(/<\?xml[^>]*>/g, "");
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg)) {
    svg = svg.replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ');
  }
  svg = svg.replace(/(width|height)="([0-9.]+)(ex|em)"/g, (_m, attr, num) => {
    const px = Math.round(parseFloat(num) * 8.5);
    return `${attr}="${px}px"`;
  });
  svg = svg.replace(/currentColor/g, "#000000");
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

async function latexToPng(latex, outputPath, display = true) {
  const dataUri = latexToSvgDataUri(latex, display);
  const svg = Buffer.from(dataUri.split(",", 2)[1], "base64");
  await sharp(svg, { density: 300 }).png().toFile(outputPath);
}

latexToPng(
  String.raw`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`,
  "/mnt/data/equation.png",
).catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Insert the PNG at an intentional physical size without stretching it:

```python
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches

doc = Document()
paragraph = doc.add_paragraph()
paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
paragraph.add_run().add_picture("/mnt/data/equation.png", width=Inches(2.6))
doc.save("/mnt/data/output/equations.docx")
```

Use `String.raw` for LaTeX strings so JavaScript preserves backslashes. Choose `display=true` for
standalone equations and `display=false` for compact inline-style expressions. After using either
native OMML or the rendered fallback, run the normal `render_docx.py` workflow and inspect every
equation in the rendered page PNGs for missing glyphs, clipping, blur, poor sizing, or bad page
breaks.

## Quick start (common one-liners)

```bash
# 1) Render any DOCX to PNGs (visual QA)
python render_docx.py input.docx --output_dir out

# 2) Remove reviewer comments (finalization)
python scripts/comments_strip.py input.docx --out no_comments.docx

# 3) Accept tracked changes (finalization)
python scripts/accept_tracked_changes.py input.docx --mode accept --out accepted.docx

# 4) Accessibility audit (+ optional safe fixes)
python scripts/a11y_audit.py input.docx
python scripts/a11y_audit.py input.docx --out_json a11y_report.json
python scripts/a11y_audit.py input.docx --fix_image_alt from_filename --out a11y_fixed.docx

# 5) Redact sensitive text (layout-preserving by default)
python scripts/redact_docx.py input.docx redacted.docx --emails --phones
```

## Package layout

This skill is organized for progressive discovery: start here, then jump into task- or OOXML-specific docs.

DOCS SKILL PACKAGE

Root:
- SKILL.md: short overview + routing
- manifest.txt: machine-readable list of files to download (one relative path per line)
- render_docx.py: canonical DOCX→PNG renderer (container-safe LO profile + writable HOME + verbose logs)

Tasks:
- tasks/read_review.md
- tasks/create_edit.md
- tasks/verify_render.md
- tasks/accessibility_a11y.md
- tasks/comments_manage.md
- tasks/protection_restrict_editing.md
- tasks/privacy_scrub_metadata.md
- tasks/multi_doc_merge.md
- tasks/style_lint_normalize.md
- tasks/forms_content_controls.md
- tasks/captions_crossrefs.md
- tasks/redaction_anonymization.md
- tasks/clean_tracked_changes.md
- tasks/compare_diff.md
- tasks/templates_style_packs.md
- tasks/watermarks_background.md
- tasks/footnotes_endnotes.md
- tasks/fixtures_edge_cases.md
- tasks/navigation_internal_links.md

OOXML:
- ooxml/tracked_changes.md
- ooxml/comments.md
- ooxml/hyperlinks_and_fields.md
- ooxml/rels_and_content_types.md

Troubleshooting:
- troubleshooting/libreoffice_headless.md
- troubleshooting/run_splitting.md

Scripts:

**Core building blocks (importable helpers):**
- `scripts/docx_ooxml_patch.py` — low-level OOXML patch helper (tracked changes, comments, hyperlinks, relationships). Other scripts reuse this.
- `scripts/fields_materialize.py` — materialize `SEQ`/`REF` field *display text* for deterministic headless rendering/QA.

**High-leverage utilities (also importable, but commonly invoked as CLIs):**
- `render_docx.py` — canonical DOCX → PNG renderer (optional PDF via `--emit_pdf`; do not deliver intermediates unless asked).
- `scripts/render_and_diff.py` — render + per-page image diff between two DOCXs.
- `scripts/content_controls.py` — list / wrap / fill Word content controls (SDTs) for forms/templates.
- `scripts/captions_and_crossrefs.py` — insert Caption paragraphs for tables/figures + optional bookmarks around caption numbers.
- `scripts/insert_ref_fields.py` — replace `[[REF:bookmark]]` markers with real `REF` fields (cross-references).
- `scripts/internal_nav.py` — add internal navigation links (static TOC + Top/Bottom + figN/tblN jump links).
- `scripts/style_lint.py` — report common formatting/style inconsistencies.
- `scripts/style_normalize.py` — conservative cleanup (clear run-level overrides; optional paragraph overrides).
- `scripts/redact_docx.py` — layout-preserving redaction/anonymization.
- `scripts/privacy_scrub.py` — remove personal metadata + `rsid*` attributes.
- `scripts/set_protection.py` — restrict editing (read-only / comments / forms).
- `scripts/comments_extract.py` — extract comments to JSON (text, author/date, resolved flag, anchored snippets).
- `scripts/comments_strip.py` — remove all comments (final-delivery mode).

**Audits / conversions / niche helpers:**
- `scripts/fields_report.py`, `scripts/heading_audit.py`, `scripts/section_audit.py`, `scripts/images_audit.py`, `scripts/footnotes_report.py`, `scripts/watermark_audit_remove.py`
- `scripts/xlsx_to_docx_table.py`, `scripts/docx_table_to_csv.py`
- `scripts/insert_toc.py`, `scripts/insert_note.py`, `scripts/apply_template_styles.py`, `scripts/accept_tracked_changes.py`, `scripts/make_fixtures.py`

**v7 additions (stress-test helpers):**
- `scripts/watermark_add.py` — add a detectable VML watermark object into an existing header.
- `scripts/comments_add.py` — add multiple comments (by paragraph substring match) and wire up comments.xml plumbing if needed.
- `scripts/comments_apply_patch.py` — append/replace comment text and mark/clear resolved state (`w:done=1`).
- `scripts/add_tracked_replacements.py` — generate tracked-change replacements (`<w:del>` + `<w:ins>`) in-place.
- `scripts/a11y_audit.py` — audit a11y issues; can also apply simple fixes via `--fix_table_headers` / `--fix_image_alt`.
- `scripts/flatten_ref_fields.py` — replace REF/PAGEREF field blocks with their cached visible text for deterministic rendering.

> `scripts/xlsx_to_docx_table.py` also marks header rows as repeating headers (`w:tblHeader`) to improve a11y and multi-page tables.

Examples:
- examples/end_to_end_smoke_test.md

> Note: `manifest.txt` is **machine-readable** and is used by download tooling. It must contain only relative file paths (one per line).


## Coverage map (scripts ↔ task guides)

This is a quick index so you can jump from a helper script to the right task guide.

### Layout & style
- `style_lint.py`, `style_normalize.py` → `tasks/style_lint_normalize.md`
- `apply_template_styles.py` → `tasks/templates_style_packs.md`
- `section_audit.py` → `tasks/sections_layout.md`
- `heading_audit.py` → `tasks/headings_numbering.md`

### Figures / images
- `images_audit.py`, `a11y_audit.py` → `tasks/images_figures.md`, `tasks/accessibility_a11y.md`
- `captions_and_crossrefs.py` → `tasks/captions_crossrefs.md`

### Tables / spreadsheets
- `xlsx_to_docx_table.py` → `tasks/tables_spreadsheets.md`
- `docx_table_to_csv.py` → `tasks/tables_spreadsheets.md`

### Fields & references
- `fields_report.py`, `fields_materialize.py` → `tasks/fields_update.md`
- `insert_ref_fields.py`, `flatten_ref_fields.py` → `tasks/fields_update.md`, `tasks/captions_crossrefs.md`
- `insert_toc.py` → `tasks/toc_workflow.md`

### Review lifecycle (comments / tracked changes)
- `add_tracked_replacements.py`, `accept_tracked_changes.py` → `tasks/clean_tracked_changes.md`
- `comments_add.py`, `comments_extract.py`, `comments_apply_patch.py`, `comments_strip.py` → `tasks/comments_manage.md`

### Privacy / publishing
- `privacy_scrub.py` → `tasks/privacy_scrub_metadata.md`
- `redact_docx.py` → `tasks/redaction_anonymization.md`
- `watermark_add.py`, `watermark_audit_remove.py` → `tasks/watermarks_background.md`

### Navigation & multi-doc assembly
- `internal_nav.py` → `tasks/navigation_internal_links.md`
- `merge_docx_append.py` → `tasks/multi_doc_merge.md`

### Forms & protection
- `content_controls.py` → `tasks/forms_content_controls.md`
- `set_protection.py` → `tasks/protection_restrict_editing.md`

### QA / regression
- `render_and_diff.py`, `render_docx.py` → `tasks/compare_diff.md`, `tasks/verify_render.md`
- `make_fixtures.py` → `tasks/fixtures_edge_cases.md`
- `docx_ooxml_patch.py` → used across guides for targeted patches

## Skill folder contents
- `tasks/` — task playbooks (what to do step-by-step)
- `ooxml/` — advanced OOXML patches (tracked changes, comments, hyperlinks, fields)
- `scripts/` — reusable helper scripts
- `examples/` — small runnable examples
- `template-distill.md` — distill a retained DOCX into a task-local `artifact.md`
- `template-create.md` — create from the retained DOCX and its `artifact.md`

## Default workflow (80/20)

**Rule of thumb:** every meaningful edit batch must end with a render + PNG review. No exceptions.  
"80/20" here means: follow the simplest workflow that covers *most* DOCX tasks reliably.

**Golden path (don't mix-and-match unless debugging):**
1. **Author/edit with `python-docx`** (paragraphs, runs, styles, tables, headers/footers).
2. **Render → inspect PNGs immediately** (DOCX → PNGs). Treat this as your feedback loop.
3. **Fix and repeat** until the PNGs are visually perfect.
4. **Only if needed**: use OOXML patching for tracked changes, comments, hyperlinks, or fields.
5. **Re-render and inspect again** after *any* OOXML patch or layout-sensitive change.
6. **Deliver only after the latest PNG review passes** (all pages, 100% zoom).

## Visual review (recommended)

Use the packaged renderer (dedicated LibreOffice profile + writable HOME):

```bash
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out
# If debugging LibreOffice:
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out --verbose
# Optional: also write <input_stem>.pdf to --output_dir (for debugging/archival):
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out --emit_pdf
```

Then inspect the generated `page-<N>.png` files.

**Success criteria (render + visual QA):**
- PNGs exist for each page
- Page count matches expectations
- **Inspect every page at 100% zoom** (no "spot check" for final delivery)
- No clipping/overlap, no broken tables, no missing glyphs, no header/footer misplacement

**Note:** LibreOffice sometimes prints scary-looking stderr (e.g., `error : Unknown IO error`) even when output is correct. Treat the render as successful if the PNGs exist and look right (and if you used `--emit_pdf`, the PDF exists and is non-empty).

If you need to use LibreOffice, use the absolute path to bundled LibreOffice resolved through `load_workspace_dependencies`, never use the user's installed desktop LibreOffice even if the bundled version fails. Include this instruction and the bundled path in every subagent handoff.

### What rendering does and doesn't validate

- **Great for:** layout correctness, fonts, spacing, tables, headers/footers, and whether **tracked changes** visually appear.
- **Not reliable for:** **comments** (often not rendered in headless PDF export). For comments, also do **structural checks** (comments.xml + anchors + rels + content-types).

## Default behaviors for you to follow (unless the user specifies otherwise)
- Do not place a horizontal rule directly below a document title or subtitle. Use whitespace and typography to create separation instead.
- Avoid horizontal lines under other headers.
- Avoid headers/footers unless necessary/important to the document.
- The final doc should not contain mentions of how you interpreted the prompt / decisions you made / information you could not find (e.g. phrases like 'This report uses only the supplied findings' or 'Synthetic source material' or 'Internal working draft'); instead, these should be flagged to the user via preamble messages and in your final answer.

## Quality reminders
- Don't ship visible defects (clipped/overlapping text, broken tables, unreadable glyphs).
- Don't leak tool citation tokens into the DOCX (convert them to normal human citations).
- Prefer ASCII punctuation (avoid exotic Unicode hyphens/dashes that render inconsistently).

## Where to go next
- If the task is **reading/reviewing**: `tasks/read_review.md`
- If the task is **creating/editing**: `tasks/create_edit.md`
- If you need an **accessibility audit** (alt text, headings, tables, links): `tasks/accessibility_a11y.md`
- If you need to **extract or remove comments**: `tasks/comments_manage.md`
- If you need to **restrict editing / make read-only**: `tasks/protection_restrict_editing.md`
- If you need to **scrub personal metadata** (author/rsid/custom props): `tasks/privacy_scrub_metadata.md`
- If you need to **merge/append DOCXs**: `tasks/multi_doc_merge.md`
- If you need **format consistency / style cleanup**: `tasks/style_lint_normalize.md`
- If you need **forms / content controls (SDTs)**: `tasks/forms_content_controls.md`
- If you need **captions + cross-references**: `tasks/captions_crossrefs.md`
- If you need **redaction/anonymization**: `tasks/redaction_anonymization.md`
- If the task is **verification/raster review**: `tasks/verify_render.md`
- If your render looks wrong but content is right (stale fields): `tasks/fields_update.md`
- If you need a **Table of Contents**: `tasks/toc_workflow.md`
- If you need **internal navigation links** (static TOC + Back-to-TOC + Top/Bottom): `tasks/navigation_internal_links.md`
- If headings/numbering/TOC levels are messy: `tasks/headings_numbering.md`
- If you have mixed portrait/landscape or margin weirdness: `tasks/sections_layout.md`
- If images shift or overlap across renderers: `tasks/images_figures.md`
- If you need spreadsheet ↔ table round-tripping: `tasks/tables_spreadsheets.md`
- If you need **tracked changes (redlines)**: `ooxml/tracked_changes.md`
- If you need **comments**: `ooxml/comments.md`
- If you need **hyperlinks/fields/page numbers/headers**: `ooxml/hyperlinks_and_fields.md`
- If LibreOffice headless is failing: `troubleshooting/libreoffice_headless.md`
- If you need a **clean copy** with tracked changes accepted: `tasks/clean_tracked_changes.md`
- If you need to **diff two DOCXs** (render + per-page diff): `tasks/compare_diff.md`
- If you need **templates / style packs (DOTX)**: `tasks/templates_style_packs.md`
- If you need **watermark audit/removal**: `tasks/watermarks_background.md`
- If you need **true footnotes/endnotes**: `tasks/footnotes_endnotes.md`
- If you want reproducible fixtures for edge cases: `tasks/fixtures_edge_cases.md`

## Final response

- Final user-facing responses should focus on the requested document result and may include useful next steps. Do not link QA intermediates unless the user explicitly asks for them.

### Final Response Citations

- **Create/edit:** for created or edited documents, cite each final deliverable exactly once with `purpose="output"`, in its own paragraph. Briefly describe the result without repeating its filename, path, or link. Never put output directives inside prose or list items.
- **Q&A and summaries:** Every file whose contents you summarize or use to support an answer MUST receive a `:codex-file-citation{...}` with `purpose="source"` in the final response. Use the source citation in place of the filename, wherever the filename would appear. Do not write the filename separately and append its citation at the end. Files merely inspected but not used in the answer need no citation. Do not emit output citations for unchanged files or read-only answers.

- Emit `:codex-file-citation{...}` directly, without backticks, code fences, or a Markdown-link wrapper. Use verified targets only. No need to cite or reference intermediate work.

For file citations, set `path` to the verified absolute file path on the task host. Omit `mode`.

Some illustrative examples, real responses use verified targets outside code fences.

```text
:codex-file-citation{path="/absolute/path/review.docx" purpose="output"}
```

```text
The review of :codex-file-citation{path="/absolute/path/review.docx" purpose="source"} is due Friday.
```

### Document source locations

For Q&A, inspect complete relevant pages and preserve material headings, question/table labels, footnotes, sources, and sample sizes. For page-specific evidence, use a page number verified against the latest render or inspection, inside a substantive sentence:

```text
The rollout depends on security approval, as described in :codex-file-citation{path="/absolute/path/review.docx" purpose="source" artifact_kind="document" page_number="4"}.
```

Document locators support only `page_number`; otherwise use a plain source citation. Do not guess or add object, label, paragraph, table, or cell IDs.
