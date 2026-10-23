# Process Brief: Advanced Reference

Edge-case tools and techniques. **Load only when the main `process.md` doesn't cover the task.**

```
Edge case
  ├─ No text extracted from PDF    → §OCR Fallback
  ├─ PDF is encrypted/locked       → §Encrypted PDFs
  ├─ PDF is corrupted/damaged      → §Corrupted PDFs
  ├─ Need precise text coordinates → §pdfplumber Advanced
  ├─ Need fast rendering           → §pypdfium2
  ├─ Advanced page extraction      → §poppler-utils Advanced
  ├─ Complex page ranges / merge   → §qpdf Page Manipulation
  ├─ Optimize file size            → §qpdf Optimization
  ├─ Batch process many PDFs       → §Batch Processing
  └─ Memory issues with large PDF  → §Performance Optimization
```

For basic operations (extract, merge, split, fill forms, convert), go back to `process.md`.

---

## §pypdfium2 (Apache/BSD License)

A Python binding for PDFium (Chromium's PDF library). Excellent for fast rendering and text extraction — serves as a PyMuPDF replacement.

#### Render PDF to Images
```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("document.pdf")

# Render single page
page = pdf[0]
bitmap = page.render(scale=2.0, rotation=0)
img = bitmap.to_pil()
img.save("page_1.png", "PNG")

# Batch render all pages
for i, page in enumerate(pdf):
    bitmap = page.render(scale=1.5)
    img = bitmap.to_pil()
    img.save(f"page_{i+1}.jpg", "JPEG", quality=90)
```

#### Extract Text with pypdfium2
```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("document.pdf")
for i, page in enumerate(pdf):
    text = page.get_text()
    print(f"Page {i+1}: {len(text)} chars")
```

## §pdfplumber Advanced Features

#### Extract Text with Precise Coordinates
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]

    # All characters with coordinates
    for char in page.chars[:10]:
        print(f"'{char['text']}' at x:{char['x0']:.1f} y:{char['y0']:.1f}")

    # Extract text within a specific bounding box (left, top, right, bottom)
    bbox_text = page.within_bbox((100, 100, 400, 200)).extract_text()
```

#### Advanced Table Extraction with Custom Settings
```python
import pdfplumber

with pdfplumber.open("complex_table.pdf") as pdf:
    page = pdf.pages[0]

    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "intersection_tolerance": 15
    }
    tables = page.extract_tables(table_settings)

    # Visual debugging
    img = page.to_image(resolution=150)
    img.save("debug_layout.png")
```

---

## §poppler-utils Advanced Features

### Extract Text with Bounding Box Coordinates
```bash
pdftotext -bbox-layout document.pdf output.xml
```

### Advanced Image Conversion
```bash
# High-resolution PNG
pdftoppm -png -r 300 document.pdf output_prefix

# Specific page range
pdftoppm -png -r 600 -f 1 -l 3 document.pdf high_res_pages

# JPEG with quality setting
pdftoppm -jpeg -jpegopt quality=85 -r 200 document.pdf jpeg_output
```

### Extract Embedded Images
```bash
pdfimages -all document.pdf images/img
pdfimages -list document.pdf
```

---

## §qpdf Advanced Features

### Complex Page Manipulation
```bash
# Split into groups of N pages
qpdf --split-pages=3 input.pdf output_group_%02d.pdf

# Extract complex page ranges
qpdf input.pdf --pages input.pdf 1,3-5,8,10-end -- extracted.pdf

# Merge specific pages from multiple PDFs
qpdf --empty --pages doc1.pdf 1-3 doc2.pdf 5-7 doc3.pdf 2,4 -- combined.pdf
```

### PDF Optimization and Repair
```bash
qpdf --linearize input.pdf optimized.pdf
qpdf --optimize-level=all input.pdf compressed.pdf
qpdf --check input.pdf
qpdf --fix-qdf damaged.pdf repaired.pdf
```

### Encryption and Decryption
```bash
qpdf --encrypt user_pass owner_pass 256 --print=none --modify=none -- input.pdf encrypted.pdf
qpdf --show-encryption encrypted.pdf
qpdf --password=secret123 --decrypt encrypted.pdf decrypted.pdf
```

---

## §Encrypted PDFs

```python
from pypdf import PdfReader

try:
    reader = PdfReader("encrypted.pdf")
    if reader.is_encrypted:
        reader.decrypt("password")
except Exception as e:
    print(f"Failed to decrypt: {e}")
```

Or via qpdf:
```bash
qpdf --password=secret123 --decrypt encrypted.pdf decrypted.pdf
```

---

## §Corrupted PDFs

```bash
qpdf --check corrupted.pdf
qpdf --replace-input corrupted.pdf
```

---

## §OCR Fallback for Scanned PDFs

When `pdfplumber` extracts 0 characters, the PDF is likely a scanned image:

```python
import pytesseract
from pdf2image import convert_from_path

def extract_text_with_ocr(pdf_path):
    images = convert_from_path(pdf_path)
    text = ""
    for i, image in enumerate(images):
        text += pytesseract.image_to_string(image)
    return text
```

Prerequisites: `pip install pdf2image pytesseract` + install Tesseract OCR and poppler.

---

## §Batch Processing with Error Handling

```python
import os, glob
from pypdf import PdfReader, PdfWriter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def batch_process_pdfs(input_dir, operation='merge'):
    pdf_files = glob.glob(os.path.join(input_dir, "*.pdf"))

    if operation == 'merge':
        writer = PdfWriter()
        for pdf_file in pdf_files:
            try:
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    writer.add_page(page)
                logger.info(f"Processed: {pdf_file}")
            except Exception as e:
                logger.error(f"Failed: {pdf_file}: {e}")
                continue
        with open("batch_merged.pdf", "wb") as output:
            writer.write(output)

    elif operation == 'extract_text':
        for pdf_file in pdf_files:
            try:
                reader = PdfReader(pdf_file)
                text = "".join(page.extract_text() for page in reader.pages)
                output_file = pdf_file.replace('.pdf', '.txt')
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(text)
                logger.info(f"Extracted: {pdf_file}")
            except Exception as e:
                logger.error(f"Failed: {pdf_file}: {e}")
```

---

## §Performance Optimization

### Text Extraction
- `pdftotext -bbox-layout` is fastest for plain text
- Use pdfplumber for structured data and tables
- Avoid `pypdf.extract_text()` for very large documents

### Image Extraction
- `pdfimages` is much faster than rendering entire pages
- Use low resolution for previews, high resolution for final output

### Memory Management for Large PDFs
```python
def process_large_pdf(pdf_path, chunk_size=10):
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)

    for start_idx in range(0, total_pages, chunk_size):
        end_idx = min(start_idx + chunk_size, total_pages)
        writer = PdfWriter()
        for i in range(start_idx, end_idx):
            writer.add_page(reader.pages[i])
        with open(f"chunk_{start_idx//chunk_size}.pdf", "wb") as output:
            writer.write(output)
```

---

## Extended Tooling Inventory

| Library / Tool | Role | Licence |
|----------------|------|---------|
| pikepdf | Low-level PDF manipulation (forms, pages, metadata) | MPL-2.0 |
| pdfplumber | Content extraction (text, tables) | MIT |
| pypdfium2 | Fast rendering, text extraction (PyMuPDF alternative) | Apache/BSD |
| pypdf | Merge, split, crop, metadata, encryption | BSD |
| poppler-utils | CLI text/image extraction, rendering | GPL-2 |
| qpdf | Page manipulation, optimization, encryption, repair | Apache |
| pytesseract | OCR for scanned PDFs | Apache |
| pdf2image | PDF-to-image conversion via poppler | MIT |
| LibreOffice | Office format conversion engine | MPL-2.0 |
