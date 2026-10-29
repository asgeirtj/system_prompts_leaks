# Task: Heading hierarchy + multilevel numbering (H1/H2/H3)

## Goal
Produce structured documents that are consistent, readable, and TOC-friendly.

## Rules of thumb
1. **Use paragraph styles**, not direct formatting.
   - Good: `p.style = doc.styles["Heading 1"]`
   - Bad: make text 16pt bold in a Normal paragraph and hope it behaves like a heading.
2. Keep heading hierarchy consistent: don't jump from Heading 1 → Heading 3 unless the document truly skips a level.
3. Numbered headings are *not* the same thing as bullet lists. If you need Word's multilevel numbering, use a template where the numbering definitions already exist (DOTX), or accept that it's brittle to generate from scratch.

## Minimal python-docx patterns

### Set heading styles
```python
from docx import Document

doc = Document()
doc.add_paragraph("Executive Summary", style="Heading 1")
doc.add_paragraph("Background", style="Heading 2")
doc.add_paragraph("Prior Work", style="Heading 3")
doc.save("out.docx")
```

### Avoid direct formatting
If you must adjust typography, do it by editing the style definitions (template) rather than changing every paragraph.

## Validate structure quickly
```bash
python scripts/heading_audit.py /mnt/data/input.docx
```

## Render → PNG review checklist (headings)
- Heading sizes/weights are consistent across the document
- Spacing before/after headings is consistent
- Indentation is consistent (especially for numbered headings)
- No "fake headings" (big bold Normal text) are used for actual sections
- TOC (if present) reflects heading hierarchy correctly

## Common pitfalls
- Mixing manual numbering ("1. " typed in text) with TOC-generated numbering
- Using Normal paragraphs with bold/size changes instead of Heading styles
- Having different documents disagree on what Heading 1/2/3 look like (solve with templates)
