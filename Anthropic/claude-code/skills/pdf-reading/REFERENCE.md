# PDF Processing Advanced Reference

This document contains advanced PDF processing features, detailed examples, and additional libraries not covered in the main skill instructions.

## pypdfium2 Library (Apache/BSD License)

### Overview
pypdfium2 is a Python binding for PDFium (Chromium's PDF library). It's excellent for fast PDF rendering, image generation, and serves as a PyMuPDF replacement.

### Render PDF to Images
```python
import pypdfium2 as pdfium
from PIL import Image

# Load PDF
pdf = pdfium.PdfDocument("document.pdf")

# Render page to image
page = pdf[0]  # First page
bitmap = page.render(
    scale=2.0,  # Higher resolution
    rotation=0  # No rotation
)

# Convert to PIL Image
img = bitmap.to_pil()
img.save("page_1.png", "PNG")

# Process multiple pages
for i, page in enumerate(pdf):
    bitmap = page.render(scale=1.5)
    img = bitmap.to_pil()
    img.save(f"page_{i+1}.jpg", "JPEG", quality=90)
```

### Extract Text with pypdfium2
```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("document.pdf")
for i, page in enumerate(pdf):
    textpage = page.get_textpage()
    text = textpage.get_text_range()
    print(f"Page {i+1} text length: {len(text)} chars")
```

## Advanced Command-Line Operations

### poppler-utils Advanced Features

#### Extract Text with Bounding Box Coordinates
```bash
# Extract text with bounding box coordinates (essential for structured data)
pdftotext -bbox-layout document.pdf output.xml

# The XML output contains precise coordinates for each text element
```

#### Advanced Image Conversion
```bash
# Convert to PNG images with specific resolution
pdftoppm -png -r 300 document.pdf output_prefix

# Convert specific page range with high resolution
pdftoppm -png -r 600 -f 1 -l 3 document.pdf high_res_pages

# Convert to JPEG with quality setting
pdftoppm -jpeg -jpegopt quality=85 -r 200 document.pdf jpeg_output
```

#### Extract Embedded Images
```bash
# Extract all embedded images with metadata
pdfimages -j -p document.pdf page_images

# List image info without extracting
pdfimages -list document.pdf

# Extract images in their original format
pdfimages -all document.pdf images/img
```

### qpdf Advanced Features

For qpdf page manipulation, optimization, encryption, and repair,
see the `pdf` skill — invoke it by name if you have a Skill tool, or
Read its SKILL.md (listed in your available skills, or in the same
skills directory as this file).

Useful qpdf reading/inspection commands:
```bash
# Check PDF structure for errors
qpdf --check input.pdf

# Show detailed PDF structure for debugging
qpdf --show-pages input.pdf > structure.txt

# Check encryption status
qpdf --show-encryption encrypted.pdf

# Remove password protection (requires password) for reading
qpdf --password=secret123 --decrypt encrypted.pdf decrypted.pdf
```

## Advanced Python Techniques

### pdfplumber Advanced Features

#### Extract Text with Precise Coordinates
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]

    # Extract all text with coordinates
    chars = page.chars
    for char in chars[:10]:  # First 10 characters
        print(f"Char: '{char['text']}' at x:{char['x0']:.1f} y:{char['y0']:.1f}")

    # Extract text by bounding box (left, top, right, bottom)
    bbox_text = page.within_bbox((100, 100, 400, 200)).extract_text()
```

#### Advanced Table Extraction with Custom Settings
```python
import pdfplumber
import pandas as pd

with pdfplumber.open("complex_table.pdf") as pdf:
    page = pdf.pages[0]

    # Extract tables with custom settings for complex layouts
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "intersection_tolerance": 15
    }
    tables = page.extract_tables(table_settings)

    # Visual debugging for table extraction
    img = page.to_image(resolution=150)
    img.save("debug_layout.png")
```

## Performance Optimization Tips

- `pdftotext` (CLI) is fastest for plain text extraction (`-layout` for spatial positioning)
- Use pdfplumber for structured data and tables; avoid `pypdf.extract_text()` on very large documents
- `pdfimages` is much faster than rendering pages for image extraction
- For large PDFs, process pages individually rather than loading everything into memory

## Troubleshooting Common Issues

### Encrypted PDFs
```python
# Handle password-protected PDFs
from pypdf import PdfReader

try:
    reader = PdfReader("encrypted.pdf")
    if reader.is_encrypted:
        reader.decrypt("password")
except Exception as e:
    print(f"Failed to decrypt: {e}")
```

### Corrupted PDFs
```bash
# Use qpdf to repair
qpdf --check corrupted.pdf
qpdf --replace-input corrupted.pdf
```

### Text Extraction Issues
```python
# Fallback to OCR for scanned PDFs
import pytesseract
from pdf2image import convert_from_path

def extract_text_with_ocr(pdf_path):
    images = convert_from_path(pdf_path)
    text = ""
    for i, image in enumerate(images):
        text += pytesseract.image_to_string(image)
    return text
```

## License Information

- **pypdf**: BSD License
- **pdfplumber**: MIT License
- **pypdfium2**: Apache/BSD License
- **PyMuPDF (fitz)**: AGPL-3.0 License — copyleft; commercial licenses available from Artifex
- **poppler-utils**: GPL-2 License
- **qpdf**: Apache License
- **pytesseract**: Apache License (Tesseract engine: Apache License)
