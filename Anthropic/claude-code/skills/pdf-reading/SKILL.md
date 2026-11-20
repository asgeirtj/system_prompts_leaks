---
name: pdf-reading
description: "Use this skill when you need to read, inspect, or extract content from PDF files — especially when file content is NOT in your context and you need to read it from disk. Covers content inventory, text extraction, page rasterization for visual inspection, embedded image/attachment/table/form-field extraction, and choosing the right reading strategy for different document types (text-heavy, scanned, slide-decks, forms, data-heavy). Do NOT use this skill for PDF creation, form filling, merging, splitting, watermarking, or encryption — use the pdf skill instead."
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing Guide

## Overview

This guide covers essential PDF reading operations using Python libraries and command-line tools. For advanced features (pypdfium2 rendering, pdfplumber table settings, OCR fallback, encrypted/corrupted PDF handling), see REFERENCE.md.

## Reading & Inspecting PDFs

Before doing anything with a PDF, understand what you're working with.

### Content inventory

Run a quick diagnostic first. For simple tasks ("summarize this
document"), `pdfinfo` + `pdffonts` + a text sample may suffice. For
anything involving figures, attachments, or extraction issues, run the
full set:

```bash
# Always: page count, file size, PDF version, metadata
pdfinfo document.pdf

# Always: does a text layer exist? No fonts → scanned/raster → see "Scanned documents"
pdffonts document.pdf

# If fonts are present: sample the text layer
pdftotext -f 1 -l 1 document.pdf - | head -20

# If figures/charts may matter:
pdfimages -list document.pdf

# If the PDF might contain embedded files (reports, portfolios):
pdfdetach -list document.pdf
```

This tells you:
- **Page count and size** — how big is the job?
- **Font status** — are any fonts present? An empty `pdffonts` table
  means the PDF is scanned or raster-only: `pdftotext` will return
  nothing, so skip straight to "Scanned documents" below. Fonts shown
  as not embedded ("emb: no") with custom encodings may produce wrong
  characters on extraction.
- **Text extractability** — when fonts exist, does `pdftotext` return
  clean text, or is it garbled (broken encoding)?
- **Embedded raster images** — are there photos or raster figures?
  (Note: vector-drawn charts from matplotlib/Excel won't appear — see
  "Extracting embedded images" below)
- **Attachments** — are there embedded spreadsheets, data files, etc.?

### Text extraction

**pypdf** for basic text:
```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = ""
for page in reader.pages:
    text += page.extract_text()
```

**pdftotext** preserving layout (better for multi-column docs):
```bash
# Layout mode preserves spatial positioning
pdftotext -layout document.pdf output.txt

# Specific page range
pdftotext -f 1 -l 5 document.pdf output.txt
```

**pdfplumber** for layout-aware extraction with positioning data:
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

### Visual inspection (rasterize pages)

Text extraction is **blind** to charts, diagrams, figures, equations,
multi-column layout, and form structures. When any of these matter,
rasterize the relevant page and Read the image:

```bash
# Rasterize a single page (page 3 here) at 150 DPI
pdftoppm -jpeg -r 150 -f 3 -l 3 document.pdf /tmp/page

# pdftoppm zero-pads the output filename based on TOTAL page count
# (e.g., page-03.jpg for a 50-page PDF, page-003.jpg for 200+ pages)
# Don't guess the filename — find it:
ls /tmp/page-*.jpg
```

Then Read the resulting image file. This gives you full visual
understanding of that page — layout, charts, equations, everything.

**When to rasterize vs. text-extract:**
- **Content/data questions → text extraction** (cheaper, searchable)
- **Figures, charts, visual layout → rasterize the page**
- **Tables → try text extraction first, rasterize if garbled**
- **Precision matters → do both** (extract text AND rasterize; use text
  for data, image for context — this is what Claude's API does natively
  with PDF uploads)

**Token cost awareness:**
- Text extraction: ~200–400 tokens per page
- Rasterized image: ~1,600 tokens per page (at 150 DPI)
- Both together: ~2,000–2,400 tokens per page

For a 100-page PDF, rasterizing everything would consume ~160K tokens.
Only rasterize pages that matter for the question at hand.

### Choosing your reading strategy

**Text-heavy documents** (reports, articles, books):  
→ Text extraction is primary. Rasterize only for specific figures or  
  pages where layout matters.

**Scanned documents** (`pdffonts` shows no fonts):  
→ `pdftotext` will return nothing — don't run it. Rasterize pages at  
  150 DPI and Read them visually. For bulk text extraction, use OCR  
  (pytesseract after converting pages to images — see REFERENCE.md for  
  a complete example).

**Slide-deck PDFs** (exported presentations):  
→ Every page is primarily visual. Rasterize individual pages on demand.  
  Text extraction gives you bullet-point text but loses all layout.

**Form-heavy documents**:  
→ Extract form field values programmatically first (see below). Rasterize  
  the form page for visual context if needed.

**Data-heavy documents** (tables, charts, figures):  
→ Use pdfplumber for tables. Rasterize pages with charts/figures.  
  Extract text for surrounding narrative. Consider both text AND image  
  for the same page when precision matters.

### Extracting embedded images

```bash
# List all embedded images with metadata (size, color, compression)
pdfimages -list document.pdf

# Extract all images as PNG
pdfimages -png document.pdf /tmp/img

# Extract from specific pages only (pages 3-5)
pdfimages -png -f 3 -l 5 document.pdf /tmp/img

# Extract in original format (JPEG stays JPEG, etc.)
pdfimages -all document.pdf /tmp/img
```

Then Read `/tmp/img-000.png` (etc.) to see each extracted image.

**Gotcha — vector graphics:** `pdfimages` extracts only raster image
data. Charts and diagrams drawn as vector graphics (common in
matplotlib, Excel, and R exports) will NOT appear — they are page
content operators, not image objects. For these, rasterize the whole
page with `pdftoppm` instead.

**Gotcha — empty images:** `pdfimages` sometimes produces many tiny or
empty image files — these are typically background masks, transparency
layers, or decorative elements. Filter by file size to find the real
content images.

Programmatic extraction with position data:
```python
import fitz  # PyMuPDF

doc = fitz.open("document.pdf")
for page in doc:
    for img in page.get_images():
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        if pix.n - pix.alpha > 3:  # CMYK or other non-RGB
            pix = fitz.Pixmap(fitz.csRGB, pix)
        pix.save(f"/tmp/img_{xref}.png")
```

### Extracting file attachments

PDFs can contain embedded files — spreadsheets, data files, other
documents. Common in business reports, PDF portfolios, and PDF/A-3
compliance documents.

```bash
# List all attachments
pdfdetach -list document.pdf

# Extract all attachments to a directory
mkdir -p /tmp/attachments
pdfdetach -saveall -o /tmp/attachments/ document.pdf

# Extract a specific attachment by number (1-based index from -list output)
pdfdetach -save 1 -o /tmp/attachment.pdf document.pdf
```

In Python:
```python
import os
from pypdf import PdfReader

reader = PdfReader("document.pdf")
for name, content_list in reader.attachments.items():
    safe_name = os.path.basename(name)  # sanitize — name comes from the PDF
    for content in content_list:
        with open(f"/tmp/{safe_name}", "wb") as f:
            f.write(content)
```

**Two attachment mechanisms exist in PDFs:** page-level file annotation
attachments (shown as paperclip icons in viewers) and document-level
embedded files (in the EmbeddedFiles name tree). Both `pdfdetach` and
pypdf handle the common cases. Rich media assets (3D, video) embedded
as annotations may not appear in the attachment list — use PyMuPDF to
iterate page annotations for those.

### Extracting form field data

PDFs with interactive forms (government forms, applications, contracts)
have fillable fields whose values can be read programmatically:

```python
from pypdf import PdfReader

reader = PdfReader("form.pdf")

# Text input fields only:
fields = reader.get_form_text_fields()
for name, value in fields.items():
    print(f"{name}: {value}")

# All field types (checkboxes, radio buttons, dropdowns too):
all_fields = reader.get_fields() or {}
for name, field in all_fields.items():
    print(f"{name}: {field.get('/V', '')} (type: {field.get('/FT', '')})")
```

`get_form_text_fields()` returns only text input fields. For
government forms and contracts that use checkboxes, radio buttons,
and dropdowns, use `get_fields()` instead to see all field types.

For comprehensive field info (types, options, defaults):
```bash
pdftk form.pdf dump_data_fields
```

For anything beyond reading form data — filling forms, creating forms —
use the `pdf` skill — invoke it by name if you have a Skill tool, or
Read its SKILL.md (listed in your available skills, or in the same
skills directory as this file).

### Audio, video, and other rare embedded content

PDFs can occasionally embed audio, video, or 3D models. Check
`pdfdetach -list` first — if the media appears as an attachment,
extract with `pdfdetach -saveall`. If not, it may be a Rich Media
annotation (harder to extract; requires PyMuPDF to iterate page
annotations). This is very rare in practice. Most PDF viewers outside
Adobe Acrobat do not support media playback.

### Font diagnostics

If text extraction produces garbled output (wrong characters, missing
text, mojibake), look back at the `pdffonts` output from the Content
inventory. Check the "emb" column — fonts showing "no" (not embedded)
with custom encodings mean the PDF's character mapping may be broken
for text extraction. In that case, rasterize the page and use vision
instead.

Also check encoding: fonts with "Custom" or "Identity-H" encoding
without embedded CIDToGID maps can cause character substitution issues
even when the font is technically embedded.

---

## Quick Reference

| Task | Best Tool | Command/Code |
|------|-----------|--------------|
| Inspect PDF | poppler-utils | `pdfinfo`, `pdfimages -list`, `pdfdetach -list`, `pdffonts` |
| Extract text | pdfplumber | `page.extract_text()` |
| Extract text (CLI) | pdftotext | `pdftotext -layout input.pdf output.txt` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| See page visually | pdftoppm | `pdftoppm -jpeg -r 150 -f N -l N` |
| Extract images | pdfimages | `pdfimages -png input.pdf prefix` |
| Extract attachments | pdfdetach | `pdfdetach -saveall -o /tmp/` |
| Read form fields | pypdf | `reader.get_fields()` |
| OCR scanned PDFs | pytesseract | Convert to image first |

## PDF Form Filling, Creation, Merging, Splitting, and Other Operations

This skill covers **reading and inspection** only. For filling forms,
creating, merging, splitting, rotating, watermarking, encrypting, or
other PDF manipulation tasks, use the `pdf` skill (find its SKILL.md
location in your available skills).
