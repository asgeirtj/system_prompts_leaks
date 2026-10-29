# OOXML: Hyperlinks, headers/footers, and fields (page numbers)

This file covers the common "small but annoying" features that often require OOXML or low-level python-docx work.

## Hyperlinks
### Reality
`python-docx` can create external hyperlink relationships but does not provide a high-level hyperlink API. The easiest path is to build the `<w:hyperlink>` element manually.

### Pattern (external hyperlink)
1) Create a relationship to the URL (Type = `RT.HYPERLINK`)
2) Insert a `<w:hyperlink r:id="...">` containing a run with a `<w:t>`

Minimal python-docx snippet:
```python
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

p = doc.paragraphs[0]
url = "https://example.com"
r_id = p.part.relate_to(url, RT.HYPERLINK, is_external=True)

hyperlink = OxmlElement("w:hyperlink")
hyperlink.set(qn("r:id"), r_id)

r = OxmlElement("w:r")
rPr = OxmlElement("w:rPr")
# optional styling (blue + underline)
color = OxmlElement("w:color"); color.set(qn("w:val"), "0000FF"); rPr.append(color)
u = OxmlElement("w:u"); u.set(qn("w:val"), "single"); rPr.append(u)
r.append(rPr)

t = OxmlElement("w:t"); t.text = "link text"; r.append(t)
hyperlink.append(r)
p._p.append(hyperlink)
```

## Headers and footers
### Right-aligned date header
Most of the time python-docx is enough:
```python
from docx.enum.text import WD_ALIGN_PARAGRAPH
section = doc.sections[0]
hp = section.header.paragraphs[0]
hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
hp.text = "Date: 01/05/2026"
```

### Footer left/center/right zones
A common reliable trick is a 1x3 table (remember: width required in headers/footers):
```python
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
footer = doc.sections[0].footer
table = footer.add_table(rows=1, cols=3, width=Inches(6.5))
# set paragraph alignment per cell
```

## Page number field
### Reality
A PAGE field is a Word field code. Some renderers may show placeholder values in PDF unless fields are updated.

### Pattern
Insert a field with `w:fldChar` begin/separate/end and an `w:instrText` of `PAGE`.

See `scripts/docx_ooxml_patch.py` for helpers that add a centered page number field to the footer and add an external hyperlink.

### Helper limitations (intentional)
The `--hyperlink-first` helper is pragmatic: it replaces the first paragraph with a single linked run. It does not preserve per-run formatting. It does preserve leading/trailing spaces via `xml:space="preserve"` when needed.
