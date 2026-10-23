# Overflow Prevention — Anti-Overflow Layout System

> PDF is static: no scrollbars, no reflow, no viewport adaptation. Every element must fit within its container BEFORE rendering. This document defines the architectural approach to guarantee zero overflow in any generated PDF.  
>  
> **This is the "too much content" side.** For the mirror problem ("too little content" / empty pages), see `typesetting/fill-engine.md` — the anti-void adaptive engine.  
>  
> Related:  
> - `fill-engine.md` — Anti-void engine (font floor, fill ratio, paragraph inflation, Y-axis anchoring)  
> - `pagination.md` — Pagination & cross-page integrity

---

## Core Philosophy

**"Measure first, draw second."**

Never use `draw_text(x, y)` or `draw_image(x, y)` directly. All content must pass through a constraint system that pre-calculates sizes and enforces boundaries. Think CSS Box Model, but for a fixed canvas.

---

## 1. Bounding Box System (Horizontal Overflow Prevention)

Every element entering a page is a **Block** with a maximum available width (`Max_Width`).

### Calculating Max_Width

```python
# Single-column layout
max_width = page_width - left_margin - right_margin

# Dual-column layout
col_gap = 12  # points
max_width = (page_width - left_margin - right_margin - col_gap) / 2

# Nested containers (e.g., table cell)
cell_max_width = col_width - cell_padding_left - cell_padding_right
```

### Absolute Rule

> **No Block's rendered width may exceed its parent's `Max_Width`. Period.**

If a Block's calculated width > Max_Width, apply fallback strategies (see §5).

---

## 1.5 🔴 Page Content Centering (Horizontal Centering Iron Rule)

> **Symptom:** Cover or body content is shifted left on the page, with noticeably more whitespace on the right than left.

**Root cause:** Asymmetric left/right margins, or cover uses single-side anchors without considering right-side balance.

**Iron rule:**

1. **Left/right margins must be symmetric:** `left_margin == right_margin`. No asymmetric margins allowed.
2. **Cover:** For left-aligned templates (e.g., Template 01/02/03/05/07), the text starting point should be within `0.10*W ~ 0.15*W`, and the right margin should be between `0.05*W ~ 0.15*W`. Center-aligned templates (Template 04/06) must be absolutely centered.
3. **Body:** ReportLab's `Frame` / `SimpleDocTemplate` must have `leftMargin == rightMargin`. LaTeX's `\geometry{left=X, right=X}` must be symmetric. HTML must use `margin: 0 auto` or `padding-left == padding-right`.

```python
# ReportLab: Force symmetric margins
from reportlab.lib.units import inch
MARGIN = 1 * inch  # Left and right must use same variable
doc = SimpleDocTemplate(
    "output.pdf",
    leftMargin=MARGIN,
    rightMargin=MARGIN,  # ← Must match leftMargin
    topMargin=MARGIN,
    bottomMargin=MARGIN,
)

# ❌ WRONG: leftMargin=72, rightMargin=36  → Content shifts left
```

```latex
% LaTeX: Force symmetric margins
\usepackage[left=2.5cm, right=2.5cm, top=2.5cm, bottom=2.5cm]{geometry}
% ❌ WRONG: left=3cm, right=1.5cm
```

---

## 2. Text Overflow: Font Metrics Pre-Calculation

### The Wrong Way
```python
# ❌ NEVER estimate by character count
if len(text) > 20:
    wrap()  # Wrong — 20 CJK chars ≠ 20 Latin chars ≠ 20 mixed chars
```

### The Right Way — ReportLab
```python
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

# Measure actual rendered width
text_width = stringWidth("Your text here", "Microsoft YaHei", 10)

if text_width > max_width:
    # Use Paragraph for automatic wrapping — NEVER plain strings in tables
    style = ParagraphStyle(
        'CellText',
        fontName='Microsoft YaHei',
        fontSize=10,
        leading=14,
        wordWrap='CJK',  # Enables CJK-aware line breaking
    )
    element = Paragraph(text, style)
else:
    element = text  # Plain string is fine if it fits
```

### Key Rules
- **Always use `Paragraph()` for table cell content** — plain strings don't wrap and will overflow
- **CJK text is wider**: Budget ~12pt per character at 10pt font size (vs ~6pt for Latin)
- **URLs and long strings**: If a single "word" exceeds column width, enable `wordWrap='CJK'` or split manually
- **Hyphenation**: For English text, consider `pyphen` for proper hyphenation of long words

### The Right Way — LaTeX
```latex
% Use tabularx for auto-wrapping columns
\usepackage{tabularx}
\begin{tabularx}{\columnwidth}{lXX}  % X columns auto-wrap
  Header 1 & This long text will wrap & Another wrapping column \\
\end{tabularx}

% For URLs
\usepackage{url}
\url{https://very-long-url-that-would-overflow.example.com/path/to/resource}
```

### The Right Way — Playwright/HTML
```css
/* Global text overflow prevention */
p, td, li, .content {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

/* Strict CJK line-break rules */
body {
  line-break: strict;
  word-break: normal;
}

/* Table cells must constrain content */
/* ⚠️ overflow:hidden + ellipsis only for single-line short text cells.
   Multi-line td should use overflow-wrap: break-word, not overflow: hidden,
   otherwise text gets truncated. Especially important in Playwright PDFs. */
td {
  max-width: 0;          /* Forces column to respect assigned width */
  overflow: hidden;
  text-overflow: ellipsis; /* Only for single-line cells */
}
```

---

## 3. Image & Chart Overflow: Proportional Scaling

### Absolute Rule

> **Never insert an image or chart at its original dimensions. Always compute fit-to-container scaling.**

### ReportLab Pattern
```python
from reportlab.platypus import Image
from reportlab.lib.units import mm

def fit_image(img_path, max_w, max_h):
    """Scale image to fit within max_w × max_h, preserving aspect ratio."""
    img = Image(img_path)
    orig_w, orig_h = img.drawWidth, img.drawHeight

    ratio_w = max_w / orig_w if orig_w > max_w else 1.0
    ratio_h = max_h / orig_h if orig_h > max_h else 1.0
    ratio = min(ratio_w, ratio_h)

    img.drawWidth = orig_w * ratio
    img.drawHeight = orig_h * ratio
    return img

# Usage
available_width = page_width - left_margin - right_margin
max_img_height = A4[1] * 0.35  # ~294pt ≈ 10cm — prevents image from eating page + leaves room for caption
img = fit_image("chart.png", available_width, max_img_height)
story.append(img)
```

### LaTeX Pattern
```latex
\usepackage{adjustbox}

% Always constrain to column width
\includegraphics[max width=\columnwidth]{chart.png}

% Or with adjustbox for both dimensions
\begin{adjustbox}{max width=\columnwidth, max height=0.4\textheight}
  \includegraphics{chart.png}
\end{adjustbox}
```

### Playwright/HTML Pattern
```css
img, svg, .chart-container {
  max-width: 100%;
  max-height: 45vh;    /* Prevent one image from eating an entire page */
  height: auto;
  object-fit: contain;  /* Preserve aspect ratio */
}
```

> **Why `max-height: 45vh`?** Without a height cap, a tall image combined with `break-inside: avoid` (from pagination.md) gets pushed to the next page — leaving the current page mostly empty and the image occupying an entire page alone. 45vh ensures any image fits within half a page, leaving room for surrounding text on the same page.

---

## 3.5 Horizontal Flex/Inline Layout Overflow (Flow Bars, Step Lists, Tag Rows)

**Problem:** LLMs commonly generate horizontal `display: flex` layouts (process flow bars, step indicators, tag rows, icon grids) without any width constraint or wrap control. When content is longer than expected (e.g. "Theory Framework (ASPICE / V-Model)" as a step label), the total width exceeds the container, pushing content beyond the right page boundary.

**Playwright PDF consequence:** When any element causes `scrollWidth > clientWidth`, Playwright shrinks the **entire page** to fit, causing all content to appear left-shifted with blank space on the right. This affects ALL pages, not just the one with the overflow.

### Iron Rules (Direct HTML Flow)

**Rule 3.5.1 — Mandatory `flex-wrap` for ≥3 inline items:**
```css
/* Any horizontal row with 3+ children MUST have flex-wrap */
.flow-bar, .step-row, .tag-row, .icon-grid {
  display: flex;
  flex-wrap: wrap;          /* MANDATORY for 3+ items */
  gap: 12px;                /* Consistent spacing */
  max-width: 100%;          /* Never exceed container */
}
```

**Rule 3.5.2 — Flex children must have `min-width` + `flex-shrink`:**
```css
.flow-step, .tag-item {
  flex: 1 1 auto;           /* Grow, shrink, auto basis */
  min-width: 80px;          /* Prevent crushing to 0 */
  max-width: 100%;          /* Never exceed container alone */
  overflow-wrap: break-word; /* Break long words */
  word-break: break-all;    /* CJK fallback */
}
```

**Rule 3.5.3 — Arrow/connector separators must not be rigid:**
```css
/* ❌ WRONG — rigid arrow div between flex items */
<div class="step">Step 1</div>
<div class="arrow">→</div>  /* Fixed-width, prevents shrinking */
<div class="step">Step 2</div>

/* ✅ RIGHT — arrow as pseudo-element, doesn't affect flex layout */
.flow-step + .flow-step::before {
  content: '→';
  margin: 0 8px;
  color: #999;
  flex-shrink: 0;
}
```

**Rule 3.5.4 — Threshold-based layout switching:**

| Item count | Recommended layout | Notes |
|------------|-------------------|-------|
| 1-3 items | Horizontal flex (no wrap needed if items are short) | Still add `max-width: 100%` on container |
| 4-6 items | Horizontal flex + `flex-wrap: wrap` | Items may wrap to 2 rows |
| 7+ items | Vertical stack or CSS Grid 2×N | Horizontal becomes unreadable |
| Items with long text (>15 CJK chars / >25 Latin chars) | Vertical stack regardless of count | Long labels don't fit side-by-side |

### Quick Self-Check

Before generating any horizontal flex layout, verify:
```
□ Container has max-width: 100% (or explicit width ≤ page width)?
□ flex-wrap: wrap is set (if ≥3 items)?
□ Each child has min-width + max-width constraints?
□ Separators (arrows, dots, lines) are pseudo-elements, not rigid divs?
□ Long text items have overflow-wrap: break-word?
```

---

## 4. Table Overflow: Dynamic Column Width Allocation

Tables are the #1 source of horizontal overflow.

### Strategy: Weight-Based Column Width

```python
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle

def calculate_col_widths(data, font_name, font_size, available_width, min_col=30):
    """Calculate column widths based on content weight.

    Each column's width is proportional to its widest content,
    with a minimum width and total constrained to available_width.
    """
    n_cols = len(data[0])

    # Measure max content width per column
    max_widths = [0] * n_cols
    for row in data:
        for i, cell in enumerate(row):
            text = str(cell) if not isinstance(cell, Paragraph) else cell.text
            w = stringWidth(text, font_name, font_size) + 8  # +8pt padding
            max_widths[i] = max(max_widths[i], w)

    total_natural = sum(max_widths)

    if total_natural <= available_width:
        # Everything fits — distribute remaining space proportionally
        extra = available_width - total_natural
        return [w + extra * (w / total_natural) for w in max_widths]
    else:
        # Must compress — allocate proportionally with minimum
        col_widths = []
        for w in max_widths:
            allocated = max(min_col, available_width * (w / total_natural))
            col_widths.append(allocated)

        # Normalize to exactly fit available_width
        scale = available_width / sum(col_widths)
        return [w * scale for w in col_widths]


def build_safe_table(data, available_width, font_name='Microsoft YaHei', font_size=9):
    """Build a table guaranteed not to overflow horizontally.

    All text cells are wrapped in Paragraph() for automatic line-breaking.
    """
    wrap_style = ParagraphStyle(
        'TableCell',
        fontName=font_name,
        fontSize=font_size,
        leading=font_size + 3,
        wordWrap='CJK',
    )

    # Wrap all cells in Paragraph
    wrapped_data = []
    for row in data:
        wrapped_row = [Paragraph(str(cell), wrap_style) for cell in row]
        wrapped_data.append(wrapped_row)

    col_widths = calculate_col_widths(data, font_name, font_size, available_width)

    # Verify total width
    assert sum(col_widths) <= available_width + 0.5, \
        f"Table width {sum(col_widths):.1f} exceeds available {available_width:.1f}"

    table = Table(wrapped_data, colWidths=col_widths, repeatRows=1)
    return table
```

### LaTeX Table Width Management
```latex
% For tables that MUST fit single column
\begin{tabularx}{\columnwidth}{l X X r}  % X = flexible width columns
  ...
\end{tabularx}

% For wide tables in twocolumn mode → span full page
\begin{table*}[t]
  \begin{tabularx}{\textwidth}{l X X X X r}
    ...
  \end{tabularx}
\end{table*}

% Last resort: shrink to fit (verify ≥ 6pt after scaling)
\resizebox{\columnwidth}{!}{%
  \begin{tabular}{lllllll}
    ...
  \end{tabular}
}
```

### LaTeX Equation Width Management (Dual-Column)

Equations are the **#2 overflow source** after tables in two-column papers (ACM `sigconf` column ~241pt, IEEE ~252pt).

```latex
% ❌ WRONG — two full equations on one line
\begin{equation}
  \mathbf{e}_u = \sum \frac{1}{\sqrt{...}} \mathbf{e}_i, \quad
  \mathbf{e}_i = \sum \frac{1}{\sqrt{...}} \mathbf{e}_u
\end{equation}

% ✅ CORRECT — one equation per line
\begin{align}
  \mathbf{e}_u &= \sum \frac{1}{\sqrt{...}} \mathbf{e}_i, \\
  \mathbf{e}_i &= \sum \frac{1}{\sqrt{...}} \mathbf{e}_u.
\end{align}

% ✅ For wide fractions (softmax, attention)
% Factor out sub-expressions into separate definitions
\begin{equation}
  \alpha_{uv} = \frac{\exp(f(u,v))}{\sum_k \exp(f(u,k))},
  \quad \text{where } f(u,v) = \text{LeakyReLU}(\ldots)
\end{equation}

% ✅ For contrastive losses: use multline
\begin{multline}
  \mathcal{L}_{\text{SSL}}^u =
    -\log \frac{\exp(\text{sim}(z_u', z_u'')/\tau)}
    {\sum_{v \neq u} \exp(\text{sim}(z_u', z_v'')/\tau)}.
\end{multline}
```

**Quick heuristic:** if `equation` body > 60 raw characters (excluding `\label`), it probably overflows dual-column. Use `align`, `split`, `multline`, or factor out sub-expressions.

See `academic.md` Rules M1–M4 for full patterns.

### LaTeX Algorithm Width Management (Dual-Column)

```latex
\SetAlFnt{\small}           % ❗ MANDATORY in dual-column
\SetAlCapFnt{\small}

% Break long Input/Output across lines:
\KwInput{Graph $\mathcal{G}_R$, $\mathcal{G}_S$\\
  \quad dim $d$, layers $L$, lr $\eta$, reg $\lambda$}

% Or use algorithm* to span full width
\begin{algorithm*}[t] ... \end{algorithm*}
```

### ⚠️ `\columnwidth` vs `\textwidth` in Two-Column Layouts

| Context | `\columnwidth` | `\textwidth` |
|---------|---------------|-------------|
| Single-column doc | = page content width | = page content width (same) |
| Two-column doc (`table` float) | = **one column** (~252pt) | = **full page** (~504pt) |
| Two-column doc (`table*` float) | = one column | = full page |

**Rule:** Inside `table` (single-col float), ALWAYS use `\columnwidth`. Inside `table*` (full-width float), use `\textwidth`.

`check-tex` detects `\resizebox{\textwidth}` inside single-column floats as error `RESIZEBOX_TEXTWIDTH`.

---

## 5. Fallback & Degradation Strategies

When content doesn't fit even after wrapping and scaling, apply these strategies **in order**:

### Automatic Degradation Ladder

| Step | Strategy | Limit | Notes |
|------|----------|-------|-------|
| 1 | Wrap text into Paragraph | — | Always do this first |
| 2 | Shrink font by 1pt | **Min 14pt** (single-col) / **12pt** (dual-col) | ⚠️ Enforced by `fill-engine.md` Safety Net 1 |
| 3 | Reduce padding/spacing | Min 4pt padding | Don't go below 4pt cell padding |
| 4 | Switch to landscape | Only if user allows | Never change orientation silently |
| 5 | Split into multiple elements | — | e.g., one wide table → two tables |
| 6 | Log warning + render anyway | — | If all else fails, at least don't crash |

### ReportLab Font Degradation
```python
def fit_text_with_degradation(text, font_name, base_size, max_width, min_size=14):
    """Try progressively smaller font sizes until text fits.

    NOTE: min_size enforced by fill-engine.md Safety Net 1.
    Single-column: min_size=14. Dual-column: min_size=12.
    If text still doesn't fit at min_size → trigger page break, do NOT shrink further.
    """
    for size in range(base_size, min_size - 1, -1):
        if stringWidth(text, font_name, size) <= max_width:
            return size
    return min_size  # Absolute floor — log warning
```

### Table Column Degradation
```python
def degrade_table_if_needed(data, available_width, font_name, base_font_size=10):
    """Try fitting table, degrading font size if needed."""
    for font_size in [base_font_size, base_font_size - 1, base_font_size - 2]:
        col_widths = calculate_col_widths(data, font_name, font_size, available_width)
        if all(w >= 25 for w in col_widths):  # Minimum 25pt per column
            return font_size, col_widths

    # Still doesn't fit — consider splitting table or landscape
    return base_font_size - 2, col_widths
```

---

## 6. Vertical Overflow: Y-Cursor & Smart Pagination

Horizontal overflow → wrap/scale/shrink.  
Vertical overflow → paginate.

### Y-Cursor Architecture (ReportLab Platypus handles this, but understand it)

```
Page Start
├── Current_Y = top_margin
├── Draw Block A (height = 80pt)
│   └── Current_Y += 80 + spacing
├── Draw Block B (height = 120pt)
│   └── Current_Y += 120 + spacing
├── Check: Current_Y + Next_Block_Height > (page_height - bottom_margin)?
│   ├── YES → New page, reset Current_Y = top_margin
│   └── NO → Continue drawing
└── ...
```

### Anti-Tear Rules (Elements That Must Not Split)

```python
from reportlab.platypus import KeepTogether

# 1. Heading + first paragraph — MANDATORY
story.append(KeepTogether([
    heading,
    first_paragraph,
]))

# 2. Image/chart + caption — MANDATORY
story.append(KeepTogether([
    chart_image,
    caption_paragraph,
]))

# 3. Table title + table (short tables ≤ 15 rows)
if len(data) <= 15:
    story.append(KeepTogether([table_title, table]))

# 4. Long tables: repeat header on each page
table = Table(data, repeatRows=1)  # First row repeats on every page
```

### Orphan/Widow Prevention

- If a paragraph's last line would be alone on the next page → pull at least 2 lines forward
- If a section heading lands at page bottom with no body text → push to next page
- ReportLab: `KeepTogether` handles most cases; `allowSplitting=False` for critical blocks

### LaTeX Vertical Overflow
```latex
% Prevent orphans and widows
\widowpenalty=10000
\clubpenalty=10000

% Prevent page break after heading
\usepackage{titlesec}
\titlespacing*{\section}{0pt}{12pt plus 4pt minus 2pt}{6pt plus 2pt minus 2pt}

% Keep float near text
\usepackage[section]{placeins}  % \FloatBarrier at each \section
```

---

## 7. Two-Pass Rendering (Advanced — for Complex Documents)

For critical documents where overflow would be unacceptable:

### Pass 1: Virtual Layout (Measurement)

Calculate all element sizes without rendering. Build a **Layout Tree**:

```python
layout_tree = [
    {"type": "heading", "width": 450, "height": 28, "page": 1},
    {"type": "paragraph", "width": 450, "height": 84, "page": 1},
    {"type": "table", "width": 450, "height": 220, "page": 1},
    {"type": "chart", "width": 400, "height": 300, "page": 2},
    # ...
]
```

### Collision Detection

```python
def check_overflow(layout_tree, page_width, left_margin, right_margin):
    """Verify no element overflows page boundaries."""
    max_x = page_width - right_margin
    violations = []
    for elem in layout_tree:
        right_edge = left_margin + elem["width"]
        if right_edge > max_x:
            violations.append({
                "element": elem["type"],
                "page": elem["page"],
                "overflow_by": right_edge - max_x,
            })
    return violations
```

### Pass 2: Render with Confirmed Layout

Only render after Pass 1 confirms zero violations. If violations found → apply degradation strategies from §5, then re-run Pass 1.

**In practice**: ReportLab's Platypus engine already does a form of two-pass rendering internally (`doc.multiBuild()`). Use `multiBuild` + `afterFlowable` callbacks for complex documents that need cross-referencing or dynamic layout adjustment.

---

## Quick Reference: Which Route Uses What

| Mechanism | ReportLab (Report) | LaTeX (Academic) | Playwright (Creative) |
|-----------|-------------------|-------------------|----------------------|
| Text wrapping | `Paragraph()` + `wordWrap='CJK'` | `tabularx` X columns | CSS `overflow-wrap: break-word` |
| Image scaling | `fit_image()` helper | `\includegraphics[max width=]` | CSS `max-width: 100%` |
| Table width | `calculate_col_widths()` | `tabularx` / `resizebox` | CSS `table-layout: fixed` |
| Font degradation | `fit_text_with_degradation()` | `\small` / `\footnotesize` | CSS `font-size` step-down |
| Page break | `PageBreak()` / `KeepTogether` | `\newpage` / `\FloatBarrier` | CSS `break-before: page` |
| Header repeat | `Table(repeatRows=1)` | `\endhead` in longtable | `thead { display: table-header-group }` |
| Orphan/widow | `KeepTogether` | `\widowpenalty=10000` | CSS `orphans: 2; widows: 2` |

---

## Checklist (Run Before Every PDF Build)

```
□ All table cells use Paragraph() wrapping, not plain strings?
□ sum(colWidths) ≤ available_width verified in code?
□ Images scaled to fit container (not original size)?
□ Long tables have repeatRows=1 (or thead header-group)?
□ Heading + first paragraph wrapped in KeepTogether?
□ Chart + caption wrapped in KeepTogether?
□ CJK text uses wordWrap='CJK' style?
□ URL/long-string cells have word-break handling?
□ Font degradation fallback exists for tight columns?
□ Last page content ratio ≥ 40%?
```
