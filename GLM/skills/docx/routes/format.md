# Route: Format / Layout

## Workflow

```
1. Read current document (pandoc for content, unpack for structure)
2. Identify format requirements from user
3. OUTPUT → By default save to a NEW sibling file (`<stem>_updated.docx`),
            never touch the input; overwrite in place ONLY if the user explicitly
            asks to edit their own file — then first copy it to `<stem>_backup.docx`
            next to it (never /tmp)
4. Use unit conversion table (see SKILL.md)
5. Apply formatting via OOXML manipulation or python-docx
6. Pack and verify
```

## Quick Formatting via python-docx

For simple formatting tasks, python-docx is often faster than raw XML:

```python
from docx import Document as PythonDocument
from docx.shared import Pt, Cm, Twips
from docx.enum.text import WD_ALIGN_PARAGRAPH

IN, OUT = "input.docx", "input_updated.docx"   # OUT must never equal IN
doc = PythonDocument(IN)

# Change all body paragraph formatting
for para in doc.paragraphs:
    if para.style.name.startswith("Heading"):
        continue
    para.paragraph_format.first_line_indent = Twips(420)
    para.paragraph_format.line_spacing = 1.5
    para.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    for run in para.runs:
        run.font.name = "宋体"
        run.font.size = Pt(12)  # Xiao Si 小四

doc.save(OUT)   # NEVER doc.save(IN) — that destroys the user's original
```

## Common Format Request Patterns

### University Thesis Formatting

Typical Chinese university thesis requirements:

```python
from docx.shared import Cm, Pt, Twips

# Margins
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3.0)
    section.right_margin = Cm(2.5)

# Fonts
# Body: SimSun 宋体 Xiao Si 小四 (12pt)
# H1: SimHei 黑体 San Hao 三号 (16pt) centered
# H2: SimHei 黑体 Si Hao 四号 (14pt)
# H3: SimHei 黑体 Xiao Si 小四 (12pt)
# English: Times New Roman, same sizes
```

### Page Numbers Starting from Specific Page

Use multi-section approach:
```python
# Section 1: Front matter (Roman numerals)
# Section 2: Main content (Arabic, starting from 1)
# This requires OOXML manipulation — see routes/edit.md for unpack/pack workflow
```

In raw XML (`word/document.xml`):
```xml
<w:sectPr>
  <w:pgNumType w:fmt="upperRoman" w:start="1"/>
</w:sectPr>
<!-- New section -->
<w:sectPr>
  <w:pgNumType w:fmt="decimal" w:start="1"/>
</w:sectPr>
```

### Different Headers Per Section

Each section in a .docx can have its own header/footer. See `references/docx-js-advanced.md` for the multi-section approach.

For existing documents, modify `word/document.xml` to split `<w:sectPr>` and create separate `headerN.xml` files.

### Font Size Conversion

When user requests a Chinese font size name:

| Request | Action |
|---------|--------|
| "Change to Wu Hao (5th) size" | `font.size = Pt(10.5)` or `size: 21` in docx-js |
| "Title in San Hao SimHei" | `font.size = Pt(16)`, `font.name = "SimHei"` |
| "Body in Xiao Si SimSun" | `font.size = Pt(12)`, `font.name = "SimSun"` |

### Line Spacing Adjustment

```python
from docx.shared import Twips

# 1.0x spacing
para.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
para.paragraph_format.line_spacing = 1.0

# 1.3x spacing (our default)
para.paragraph_format.line_spacing = 1.5

# Fixed spacing (e.g., 28pt)
para.paragraph_format.line_spacing_rule = WD_LINE_SPACING.EXACTLY
para.paragraph_format.line_spacing = Pt(28)
```

## Verification

After formatting changes:
1. Open in LibreOffice or convert to PDF for visual check
2. Extract text with pandoc to ensure content unchanged
3. Compare file sizes (formatting-only changes shouldn't dramatically change size)

> 🔴 **If LibreOffice is not installed, you MUST install it — do not verify with whatever Office suite  
> the user happens to have.** That substitution is forbidden, and a large download is **not** a reason  
> to skip the install. Required: explain the necessity (faithful rendering of styles and pagination),  
> say the package is large, then install it **from the Tsinghua TUNA mirror** (`https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/26.8.0/`, or the newest version under `.../libreoffice/stable/`; package-manager commands are the fallback). Only after an install attempt has **failed** may you  
> verify with Word/WPS, and you must say so. **No install attempt = no substitute program.**  
> After installing, **register `soffice` on `PATH` and re-verify `soffice --version`** (per-OS  
> commands: `env_setup/setup.md` → *"Register the binary on PATH"*) — an install left off the search  
> path reads as "not installed" next time and gets reinstalled needlessly.  
> See `SKILL.md`.
