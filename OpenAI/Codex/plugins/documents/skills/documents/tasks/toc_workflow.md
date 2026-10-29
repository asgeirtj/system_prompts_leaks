# Task: Insert + update a Table of Contents (TOC)

## Goal
Create a TOC that **actually populates and stays correct** after edits.

## Key reality
A TOC is a **field**. It will not update unless fields are refreshed.

## Headless-safe alternative (no Word field update)
If you need a deterministic TOC in a fully automated / headless flow, prefer the **static TOC** workflow:

```bash
python scripts/internal_nav.py /mnt/data/input.docx --out /mnt/data/with_static_toc.docx
```

This builds a static TOC + internal links (TOC -> headings, headings -> Back to TOC) without relying on Word field updates.  
See: `tasks/navigation_internal_links.md`.

## Requirements for a working TOC
1. **Use Heading styles** (`Heading 1/2/3`) for headings. Do not fake headings with bold + bigger font.
2. Keep heading text in the paragraph (avoid leading manual numbers as plain text).
3. After edits, **update fields** before final export.

## Insert a TOC at a placeholder
1) Add a single paragraph containing the placeholder token:

```
[[TOC]]
```

2) Run the inserter:

```bash
python scripts/insert_toc.py /mnt/data/input.docx --out /mnt/data/with_toc.docx
```

Defaults: include Heading 1–3.

3) Open in Word and update fields:
- `Ctrl+A` → `F9` (Update Fields)
- Save

4) Render and visually verify:

```bash
python render_docx.py /mnt/data/with_toc.docx --output_dir /mnt/data/out
```

## Render → PNG review checklist (TOC)
- TOC is present (not blank)
- Indentation reflects heading levels
- Page numbers in TOC match the actual headings' pages
- Headings that should appear do appear (and vice versa)
- No placeholder text remains (e.g., "TOC will populate…")

## Common pitfalls
- **Headings not styled** → TOC is empty.
- **Manual numbering/direct formatting** → TOC levels/indentation drift.
- **Fields not updated** → TOC and page numbers stale after edits.

Tip: run `scripts/heading_audit.py` if you suspect heading-style issues.
