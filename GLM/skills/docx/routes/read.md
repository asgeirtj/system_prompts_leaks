# Route: Read / Analyze / Extract

## Method 1: Text Extraction via pandoc (Fastest)

```bash
# Plain text
pandoc input.docx -t plain -o output.txt

# Markdown (preserves structure)
pandoc input.docx -t markdown -o output.md

# Extract with metadata
pandoc input.docx -t markdown --standalone -o output.md
```

**Best for**: Quick content reading, text analysis, word count, searching.

## Method 2: Raw XML Access (Detailed)

```bash
mkdir work && cd work && unzip ../input.docx

# Read main content
cat word/document.xml

# Read styles
cat word/styles.xml

# List embedded media
ls word/media/

# Read headers/footers
cat word/header1.xml
cat word/footer1.xml
```

**Best for**: Analyzing formatting, extracting styles, inspecting document structure, debugging layout issues.

### Quick XML Parsing

```python
import defusedxml.ElementTree as ET

tree = ET.parse("word/document.xml")
ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

# Extract all text
texts = []
for t in tree.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"):
    if t.text:
        texts.append(t.text)
full_text = "".join(texts)

# Count paragraphs
paras = tree.findall(".//w:p", ns)
print(f"Paragraphs: {len(paras)}")

# Find headings
for para in paras:
    pPr = para.find("w:pPr", ns)
    if pPr is not None:
        pStyle = pPr.find("w:pStyle", ns)
        if pStyle is not None and "Heading" in pStyle.get(f"{{{ns['w']}}}val", ""):
            text = "".join(t.text for t in para.iter(f"{{{ns['w']}}}t") if t.text)
            print(f"  {pStyle.get(f'{{{ns[\"w\"]}}}val')}: {text}")
```

## Method 3: Convert to Images (Visual Analysis)

```bash
# Convert to PDF first
libreoffice --headless --convert-to pdf input.docx

# Then to images
pdftoppm -png -r 200 input.pdf page

# Generates page-1.png, page-2.png, etc.
```

**Best for**: Visual layout analysis, comparing formatting, generating previews, when user asks "what does it look like".

> 🔴 **This route needs LibreOffice — if it is missing you MUST install it, not substitute it.**  
> Using Word/WPS/Pages to make the preview *instead of* installing is forbidden, and a large download  
> is **not** a reason to skip. Required: explain the necessity (it renders the document exactly as  
> laid out, which is the whole point of a visual check), say the package is large, then install it **from the Tsinghua TUNA mirror** (`https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/26.8.0/`, or the newest version under `.../libreoffice/stable/`; package-manager commands are the fallback). Only  
> after an install attempt has **failed** may you use another program, and you must say so.  
> **No install attempt = no substitute program.** After installing, **register `soffice` on `PATH`  
> and re-verify `soffice --version`** (per-OS commands: `env_setup/setup.md` → *"Register the binary  
> on PATH"*) — an install left off the search path reads as "not installed" next time and gets  
> reinstalled needlessly. See `SKILL.md`.

## Method 4: python-docx Reading

```python
from docx import Document

doc = Document("input.docx")

# Read paragraphs
for para in doc.paragraphs:
    print(f"[{para.style.name}] {para.text}")

# Read tables
for table in doc.tables:
    for row in table.rows:
        print([cell.text for cell in row.cells])

# Document properties
print(f"Sections: {len(doc.sections)}")
print(f"Paragraphs: {len(doc.paragraphs)}")
print(f"Tables: {len(doc.tables)}")
```

## Choosing the Right Method

| Need | Method |
|------|--------|
| Quick text content | pandoc |
| Document structure/outline | pandoc → markdown |
| Formatting details | Raw XML |
| Table data extraction | python-docx |
| Visual appearance | Convert to images |
| Style analysis | Raw XML (styles.xml) |
| Word/character count | pandoc → plain → wc |
