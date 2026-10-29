# Task: Internal navigation links (Top/Bottom/TOC + jump links)

## Goal
Create deterministic **internal hyperlinks** inside a DOCX so readers can quickly jump:
- TOC entry → section
- section header → back to TOC
- quick links → Top / Bottom
- quick links → Figure/Table caption numbers (when bookmarks exist)

This is especially useful for long reports, specs, or demo/QA artifacts.

## Key idea
Word internal links are `w:hyperlink w:anchor="<bookmarkName>"`.

This bundle provides `scripts/internal_nav.py` to add:
- `TOC` bookmark + a **static** TOC section (no Word field required)
- `Top` / `Bottom` bookmarks
- bookmarks on headings (either `Heading 1/2/3` styles **or** `w:outlineLvl`)
- "Back to TOC" links on each heading
- a quick-links bar (Top/Bottom/TOC + figN/tblN if present)

## Workflow

### Option A: Deterministic (headless-safe) static TOC + links

1) Ensure your document has "headings".

Prefer real heading styles (`Heading 1/2/3`). If the document doesn't use heading styles, a practical alternative is setting `w:outlineLvl` on the heading paragraphs (outline level 0 == top-level). This can be done via OOXML patching.

2) (Optional) Add figure/table caption bookmarks first

If you want jump links for figures/tables, run:

```bash
python scripts/captions_and_crossrefs.py /mnt/data/in.docx /mnt/data/with_caps.docx --figures --tables --bookmarks
```

3) Add navigation

```bash
python scripts/internal_nav.py /mnt/data/with_caps.docx --out /mnt/data/with_nav.docx
```

4) Render and verify

```bash
python render_docx.py /mnt/data/with_nav.docx --output_dir /mnt/data/out_nav
```

Verify:
- TOC entries jump to the intended headings
- each heading has a working "Back to TOC" link
- Top/Bottom work
- figN/tblN links appear if bookmarks exist

### Option B: Word-native TOC field (requires a field update)

If you need a true Word TOC with page numbers, use `tasks/toc_workflow.md`.

## Deliverables
- Internal navigation is part of the final DOCX.
- Rendered PNGs (and optional PDFs) are **internal QA only** unless the user explicitly asks for them.
