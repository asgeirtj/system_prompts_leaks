# Task: Section breaks + mixed page layout (portrait/landscape, margins, page size)

## Goal
Safely handle documents with mixed layouts without breaking headers/footers.

## Key concept: sections
In DOCX, page layout is controlled by **sections**. A section defines:
- page size
- orientation (portrait/landscape)
- margins
- header/footer settings and linkage

If anything looks wrong after an edit (suddenly landscape pages, header disappears, etc.), suspect sections.

## How to audit
```bash
python scripts/section_audit.py /mnt/data/input.docx
```

Look for:
- multiple sections
- orientation changes
- headers/footers linked to previous when you expected them not to be

## Creating a landscape section with python-docx (pattern)
```python
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_ORIENT

doc = Document()
doc.add_paragraph("Portrait page")

sec2 = doc.add_section(WD_SECTION.NEW_PAGE)
sec2.orientation = WD_ORIENT.LANDSCAPE
sec2.page_width, sec2.page_height = sec2.page_height, sec2.page_width
doc.add_paragraph("Landscape page")

doc.save("out.docx")
```

## Header/footer linkage gotcha
Each new section can inherit header/footer via **Link to Previous**.  
If you need a different header/footer, you must break the linkage.  
In Word UI: Header/Footer tools → toggle "Link to Previous".

python-docx exposes `section.header.is_linked_to_previous` and `section.footer.is_linked_to_previous`.

## Render → PNG review checklist (sections)
- Landscape pages are actually landscape (and only the intended ones)
- Margins look consistent with expectations
- Header/footer appears on all pages where expected
- "Different first page" behaves as intended
- Odd/even headers are correct (if enabled)

## Common pitfalls
- Forgetting to swap width/height after setting landscape
- Editing only the first section's header/footer and assuming it applies to later sections
- A continuous section break changing margins unexpectedly

**Renderer note:** when a document mixes page sizes/orientations, `render_docx.py` computes DPI from the first section. If you care about exact pixel sizes, pass an explicit `--dpi`.
