# XLSX Design System

**The single authoritative style reference. All table styles must be derived from this file — custom color values are prohibited.**

---

## 1. Design Philosophy

### Borderless-first

Visual elements exist only where data exists; blank areas remain **completely clean** — no borders, no fills, no visual noise.

- **Has content → has style**: Data regions use alternating row fills to distinguish rows
- **No content → no trace**: Cells outside the data range receive no formatting whatsoever
- **Minimal borders**: Only a single line at the header bottom and totals top; everything else relies on whitespace and alternating fills

### Typography First

Establish hierarchy through **font size, font weight, and color value**, not lines and frames.

### Three-Color Discipline

The entire table uses **at most 3 color roles**: primary, secondary, and accent. Everything else is black/white/gray warm tones.

---

## 2. Color System (Three-Color Rule)

### 2.1 Color Role Definitions

Each table allows only 3 color roles + neutral base:

| Role | Token | Responsibility | Area Ratio |
|------|-------|----------------|------------|
| **Primary** | `primary` | Header background, title text | ~5-8% |
| **Secondary** | `secondary` | Section title background, totals row | ~2-3% |
| **Accent** | `accent` | Status indicators (positive/negative/warning) | ≤2% |
| **Neutral** | `neutral-*` | Body text, background, alternating rows | ~90% |

### 2.2 Default Palette

```python
# === Primary (deep blue family) ===
PRIMARY = "1B2A4A"              # Header background, title text color
PRIMARY_LIGHT = "D6E4F0"        # Light variant of primary → secondary (section titles, totals row)

# === Secondary (derived from primary) ===
SECONDARY = PRIMARY_LIGHT       # Secondary = light version of primary

# === Accent (semantic, used on demand) ===
ACCENT_POSITIVE = "1B7D46"      # Positive: growth, completed, on-target (deep green)
ACCENT_NEGATIVE = "C0392B"      # Negative: decline, overdue, off-target (deep red)
ACCENT_WARNING = "D4820A"       # Warning: approaching, needs attention (deep amber)

# === Neutral palette (warm gray) ===
NEUTRAL_900 = "37352F"          # Body text
NEUTRAL_600 = "8C8A84"          # Secondary text, annotations
NEUTRAL_200 = "E9E9E8"          # Divider lines, header bottom line
NEUTRAL_100 = "F7F7F5"          # Alternating row fill (odd rows)
NEUTRAL_50 = "FAFAF9"           # Very light base color (optional)
NEUTRAL_0 = "FFFFFF"            # White (even rows)
```

### 2.3 Style Palette System (Style-First Palette Engine)

Palettes are implemented via `templates/palettes.py`, **purely style-driven, not bound to domains**.

Domains (finance/education/sales…) only affect data formats and header conventions, not colors.

**12 style palettes:**

All theme headers use PRIMARY background + white text.

| # | Style | Keyword Triggers | PRIMARY | Positioning |
|---|------|-----------|---------|------|
| 01 | **professional** | 正式/商务/汇报/默认 | `1B2A4A` deep blue | Universal default |
| 02 | **warm** | 温暖/活力/热情 | `B85C1E` warm orange | Vibrant and impactful |
| 03 | **elegant** | 极简/简约 | `2C2C2C` charcoal | High-end minimalist |
| 04 | **creative** | 文艺/莫兰迪/设计感 | `6C5B7B` purple-gray | Artistic distinction |
| 05 | **muji** | 无印/呼吸感/素净 | `2C2C2C` warm black | MUJI pencil-on-paper |
| 06 | **aesop** | 沙岩/大地色/护肤 | `3D3229` earth brown | Premium skincare packaging |
| 07 | **kinfolk** | 奶油/刊物/杂志/拿铁 | `5C524C` cocoa | Independent magazine aesthetic |
| 08 | **celine** | 黑白/时装/冷冽/mono | `000000` pure black | Fashion house coldness |
| 09 | **bottega** | 墨绿/深绿/森林/贵气 | `2D4A3E` dark green | Italian luxury restraint |
| 10 | **chanel** | 米金/香奈儿/奶茶/高级 | `1C1917` ink | Champagne gold elegance |
| 11 | **bloomberg** | 终端/深蓝/金融终端/工业/包豪斯 | `0D1B2A` deep space | Financial data aesthetic |
| 12 | **original_blue** | 原始/经典蓝/传统蓝 | `1B2A4A` classic blue | Original blue-black scheme |

**Three-step matching logic (priority from high to low):**

1. **Explicit style keywords** → direct match ("make a warm table" → warm)
2. **Scene keyword inference** → indirect match ("sales monthly report" → warm, "student grades" → muji)
3. **No match** → professional (safe default, no guessing)

**Usage:**

```python
import base
base.use_palette("help me make a warm sales monthly report")  # → warm
base.use_palette_explicit("warm")                # → warm
base.get_active_style()                          # → 'warm'
```

Each palette is a complete color set (PRIMARY + SECONDARY + ACCENT × 3 + NEUTRAL × 6 + HEADER_TEXT + CHART_COLORS + CF backgrounds).  
When `use_palette` is not called, the default behavior is identical to before (professional = deep blue).

### 2.4 Special Color Rules for Finance Scenarios

Only when the scene is Finance, add the following text color encoding (IB industry convention, overrides default NEUTRAL_900):

| Text Color | Hex | Meaning |
|------------|-----|--------|
| Blue `0000FF` | Manual input values (user-modifiable) |
| Black `000000` | Formula/calculated values |
| Green `008000` | Cross-sheet references |
| Red `FF0000` | External file references |

### 2.5 Color Prohibitions

- ❌ Do not introduce any new hues outside of `ACCENT_*`
- ❌ Do not use color for decoration (primary color is sufficient for colored headers)
- ❌ No gradient fills
- ❌ Do not mix two different PRIMARY colors in the same table

---

## 3. Font System

### 3.1 Font Hierarchy

| Token | Size | Weight | Color | Usage |
|-------|------|--------|-------|-------|
| `font-title` | 16pt | `HEADER_BOLD`* | `PRIMARY` | Table title (B2) |
| `font-header` | 11pt | `HEADER_BOLD`* | `#FFFFFF` | Column headers (white text on primary background) |
| `font-subheader` | 11pt/12pt | `HEADER_BOLD`* | `PRIMARY` | Section titles, totals row |
| `font-body` | 11pt | Normal | `NEUTRAL_900` | Body data |
| `font-caption` | 9pt | Normal | `NEUTRAL_600` | Annotations, sources, footnotes |
| `font-kpi` | 22pt | `HEADER_BOLD`* | `PRIMARY` | KPI large numbers (analysis scenes only) |
| `font-kpi-label` | 9pt | Normal | `NEUTRAL_600` | KPI labels |

> \* `HEADER_BOLD` is determined at runtime by §3.3. Heavy-stroke fonts (Noto Sans SC/Noto Sans CJK SC, etc.) → False, thin-stroke fonts → True.

### 3.2 Font Selection (Cross-Platform Fallback Chain)

openpyxl's `Font(name=...)` can only specify a single font name and does not support CSS-style fallback chains.  
Therefore, **runtime platform detection** is needed to select the first available font from the fallback sequence:

```python
import platform, os
from openpyxl.styles import Font

def _resolve_font(candidates: list[str]) -> str:
    """Return the first font name likely available on this OS."""
    system = platform.system()
    # Quick lookup: match common fonts by platform
    _platform_hints = {
        "Darwin":  {"Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC"},
        "Windows": {"Noto Sans SC", "Noto Sans SC", "Noto Serif SC"},
        "Linux":   {"Noto Sans CJK SC", "WenQuanYi Micro Hei", "Source Han Sans SC"},
    }
    available_hints = _platform_hints.get(system, set())
    for name in candidates:
        if name in available_hints:
            return name
    # Fallback: return the first in sequence (Excel will fallback on its own when opened)
    return candidates[0]

# === Font fallback sequences ===
# CJK body text (CJK Sans): prefer platform-native sans-serif fonts
CJK_BODY_CHAIN = [
    "Noto Sans SC",        # Free (OFL), bundled, cross-platform
    "Noto Sans CJK SC",    # Linux / Android universal
    "Source Han Sans SC",  # Adobe Source Han Sans (OFL), cross-platform
    "WenQuanYi Micro Hei", # Linux fallback (GPL)
]

# Latin/numbers: serif (for formal reports)
LATIN_BODY_CHAIN = [
    "FreeSerif",     # Classic serif, available on virtually all platforms
    "serif",
]

# Runtime resolution
FONT_CJK  = _resolve_font(CJK_BODY_CHAIN)
FONT_LATIN = _resolve_font(LATIN_BODY_CHAIN)

# openpyxl can only set one name; use the CJK font for Chinese tables (it also covers ASCII characters)
FONT_NAME = FONT_CJK
```

**Rules**:
- Use `FONT_NAME` uniformly across the entire table — do not mix fonts
- All `Font(name=...)` in code must use the `FONT_NAME` variable — **hardcoding font names is prohibited**
- If the user explicitly specifies a font, respect the user's choice

### 3.3 Header Bold Strategy

Not all fonts are suitable for bold. Heavy-stroke fonts (like Noto Sans SC) become blurry when bolded —
hierarchy should be established through **font size differences or color contrast**, not font weight:

```python
# Determine whether the font is suitable for bold based on font name
_HEAVY_FONTS = {
    "Noto Sans SC", "Noto Sans CJK SC",
    "Source Han Sans SC", "WenQuanYi Micro Hei",
}

HEADER_BOLD = FONT_NAME not in _HEAVY_FONTS
# → Heavy fonts (Noto Sans SC/Noto Sans CJK SC, etc.): headers not bolded, rely on background color + white text
# → Thin fonts (Noto Serif SC/FreeSerif, etc.): headers bolded
```

**Hierarchy alternatives when `HEADER_BOLD = False`**:
- Headers: no bold, rely on **primary background + white text** for distinction
- Titles: no bold, use **larger font size (16pt vs 11pt)** for hierarchy
- Totals row: no bold, use **secondary background + primary text** for distinction
- Section titles: no bold, use **primary text + slightly larger size (12pt)** for distinction

### 3.4 Alignment Rules

| Data Type | Horizontal Alignment | Notes |
|-----------|---------------------|-------|
| Numbers/amounts/percentages | Right-aligned | Ensures decimal point alignment |
| Dates | Center-aligned | |
| Text | Left-aligned | |
| Headers | Center-aligned | |
| Titles | Left-aligned | ❌ Not centered |

---

## 4. Layout System

### 4.1 Starting Position and Margins

```
     A        B        C        D        E    ...
1  [blank]  [blank]  [blank]  [blank]  [blank]    ← Top margin
2  [blank]  Title    ─────────────────────────     ← Title row (starts at B2, merged to data width)
3  [blank]  [blank]  [blank]  [blank]  [blank]    ← Spacing row (optional: subtitle/date)
4  [blank]  Header1  Header2  Header3  Header4    ← Header row
5  [blank]  Data     Data     Data     Data       ← Data area start
```

- **Canvas Origin**: `B2` (left margin Column A + top margin Row 1)
- **Column A width**: 3 (pure whitespace for visual breathing room)
- **Row 1 height**: 15pt (top margin)

### 4.2 Row Height Standards

| Row Type | Height | Notes |
|----------|--------|-------|
| Title row (Row 2) | 32pt | 16pt font + top/bottom breathing room |
| Spacing row (Row 3) | 8pt | Gap between title and header |
| Header row (Row 4) | 28pt+ | 11pt font + wrap_text space; auto-grows if header wraps |
| Data rows | 22pt+ | 11pt font + comfortable reading; **auto-grows via `auto_fit_row_heights()`** |
| Totals row | 26pt | Slightly taller than data rows for emphasis |

### 4.3 Column Width Guidelines

```python
COLUMN_WIDTHS = {
    'margin': 3,          # Column A whitespace
    'id_short': 8,        # Serial number, ID
    'name_cn': 16,        # Chinese name (2-4 chars)
    'name_en': 22,        # English name
    'description': 32,    # Long text
    'number': 14,         # Amounts, quantities
    'percentage': 12,     # Percentages
    'date': 14,           # Dates
    'status': 12,         # Status labels
}
# CJK character ≈ 2.5 units, Latin ≈ 1.2 units
# Minimum 8, maximum 40
```

### 4.4 Auto-Fit Column Widths (Recommended)

After populating data, call `auto_fit_columns(ws)` from `templates/base.py` to automatically size columns based on **data content** (not headers). Headers that exceed the computed width get `wrap_text=True` instead of stretching the column.

```python
from templates.base import auto_fit_columns, auto_fit_row_heights

# After all data is written:
auto_fit_columns(ws, min_width=8, max_width=28, header_row=4, data_start_row=5)
# MUST call after auto_fit_columns to adjust row heights for wrapped text:
auto_fit_row_heights(ws, header_row=4, data_start_row=5)
```

**Rules**:
- Column width is determined by the widest **data cell**, not the header
- CJK characters are counted as 1.7x width (via `unicodedata.east_asian_width`)
- Headers wider than the column automatically get `wrap_text=True`
- This prevents the common problem of headers being wider than data content

### 4.5 Auto-Fit Row Heights (MANDATORY — Prevent Text Clipping)

**CRITICAL**: Always call `auto_fit_row_heights(ws)` after `auto_fit_columns(ws)`. This prevents text from being hidden/clipped when cells wrap to multiple lines.

```python
from templates.base import auto_fit_row_heights

# Call AFTER auto_fit_columns (needs final column widths to calculate wrapping):
auto_fit_row_heights(ws, header_row=4, data_start_row=5)
```

**What it does**:
- Scans each cell for `wrap_text=True` or explicit `\n` line breaks
- Estimates how many lines the content needs given the column width
- Increases row height accordingly (base 22pt + 16pt per extra line)
- Never shrinks below 22pt minimum

**When text gets clipped**: If you see text being hidden in cells, it means `auto_fit_row_heights` was not called, or was called before `auto_fit_columns` (so column widths were not yet finalized).

---

## 5. Border System (Borderless-first)

### 5.1 Allowed Borders

| Position | Style | Color | Purpose |
|------|------|------|------|
| Header bottom | `thin` | `NEUTRAL_200` | Separate header from data |
| Totals top | `medium` | `NEUTRAL_200` | Mark summary row |

### 5.2 Prohibited Borders

- ❌ Full grid (all-sides thin border)
- ❌ Colored borders
- ❌ Double-line borders
- ❌ Thick borders (medium/thick) for decoration

### 5.3 Row Separation Alternative

Use **alternating row fills** instead of grid lines:
- Even rows: `NEUTRAL_0` (white)
- Odd rows: `NEUTRAL_100` (warm white `#F7F7F5`)

### 5.4 Finance Scene Exception

Finance scene retains section dividers (`PRIMARY` color), following IB industry convention.

---

## 6. Title Row Design

### 6.1 Title Style

```python
# Title: plain text, no background fill
title_font = Font(name=FONT_NAME, size=16, bold=HEADER_BOLD, color=PRIMARY)
title_align = Alignment(horizontal='left', vertical='center')

# Position: B2, merged to the last data column
ws.merge_cells(start_row=2, start_column=2, end_row=2, end_column=last_col)
ws['B2'].font = title_font
ws['B2'].alignment = title_align
ws.row_dimensions[2].height = 32
```

### 6.2 Header Style

```python
# Header: primary color background + white text
header_fill = PatternFill('solid', fgColor=PRIMARY)
header_font = Font(name=FONT_NAME, size=11, bold=HEADER_BOLD, color="FFFFFF")
header_align = Alignment(horizontal='center', vertical='center', wrap_text=True)
header_border = Border(bottom=Side(style='thin', color=NEUTRAL_200))

for cell in header_row:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = header_align
    cell.border = header_border

ws.row_dimensions[header_row_num].height = 28
```

### 6.3 Totals Row

```python
total_fill = PatternFill('solid', fgColor=SECONDARY)  # PRIMARY_LIGHT
total_font = Font(name=FONT_NAME, size=11, bold=HEADER_BOLD, color=PRIMARY)
total_border = Border(top=Side(style='medium', color=NEUTRAL_200))

for cell in total_row:
    cell.fill = total_fill
    cell.font = total_font
    cell.border = total_border
```

---

## 7. Data Area Styles

### 7.1 Alternating Row Fill

```python
for i, row in enumerate(ws.iter_rows(min_row=data_start, max_row=data_end)):
    fill_color = NEUTRAL_0 if i % 2 == 0 else NEUTRAL_100
    for cell in row:
        cell.fill = PatternFill('solid', fgColor=fill_color)
        cell.font = Font(name=FONT_NAME, size=11, color=NEUTRAL_900)
        cell.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
        # ❌ No borders
```

**wrap_text=True is mandatory** for data cells — without it, text exceeding column width gets clipped/hidden instead of wrapping to the next line. Combined with `auto_fit_row_heights()`, this ensures all content is always visible.

### 7.2 Empty Data Area

Cells outside the data range receive **no formatting** — no fill, no borders, no font settings. Keep Excel defaults.

### 7.3 Grid Lines

```python
ws.sheet_view.showGridLines = False  # Disable Excel default grid lines
```

---

## 8. Conditional Formatting

### 8.1 When to Use

| ✅ Use | ❌ Don't Use |
|---------|----------|
| Data has comparison/ranking semantics (scores, KPIs, growth rates) | Simple entry forms, reference tables |
| Financial data with positive/negative values (profit/loss, increase/decrease) | Data rows ≤5 |
| User explicitly requests | User requests minimalist style |

### 8.2 Color Rules

Conditional formatting **uses only accent colors**:

```python
# Positive → green background + green text
POSITIVE_FILL = PatternFill(bgColor='E8F5E9')
POSITIVE_FONT = Font(color=ACCENT_POSITIVE)  # "1B7D46"

# Negative → red background + red text
NEGATIVE_FILL = PatternFill(bgColor='FDEDEC')
NEGATIVE_FONT = Font(color=ACCENT_NEGATIVE)  # "C0392B"

# Warning → amber background + amber text
WARNING_FILL = PatternFill(bgColor='FEF9E7')
WARNING_FONT = Font(color=ACCENT_WARNING)    # "D4820A"
```

### 8.3 Color Scale

```python
from openpyxl.formatting.rule import ColorScaleRule

# Red → Yellow → Green (low → mid → high)
ws.conditional_formatting.add('B5:B100',
    ColorScaleRule(
        start_type='min', start_color='F8696B',
        mid_type='percentile', mid_value=50, mid_color='FFEB84',
        end_type='max', end_color='63BE7B'))
```

### 8.4 Data Bar

```python
from openpyxl.formatting.rule import DataBarRule

ws.conditional_formatting.add('D5:D100',
    DataBarRule(start_type='min', end_type='max',
               color=PRIMARY, showValue=True))
# Data Bar color uses primary, maintaining color discipline
```

---

## 9. Chart Colors

Chart colors are **derived from the design system**, not maintained separately:

```python
CHART_COLORS = [
    PRIMARY,           # 1st data series = primary
    ACCENT_POSITIVE,   # 2nd series
    ACCENT_WARNING,    # 3rd series
    ACCENT_NEGATIVE,   # 4th series
    NEUTRAL_600,       # 5th series (gray)
]
```

- Single series chart → use only `PRIMARY`
- Two series → `PRIMARY` + `ACCENT_POSITIVE`
- Multiple series → pick colors in order from the table above
- **Never exceed 5 colors**

---

## 10. Number Formats

### 10.1 General Formats

```python
FORMATS = {
    'integer': '#,##0',
    'decimal_1': '#,##0.0',
    'decimal_2': '#,##0.00',
    'percentage': '0.0%',
    'currency_cny': '¥#,##0.00',
    'currency_usd': '$#,##0.00',
    'date': 'YYYY-MM-DD',
}
```

### 10.2 Financial Formats

→ Full financial number format definitions are in **`scenes/finance.md §Number Formatting`**, not repeated here.

Brief rules: zero values `"-"`, negatives in parentheses `($123)`, headers indicate units `"Revenue ($mm)"`.

---

## 11. Code Templates

All design tokens, font resolution, and style factory functions have been extracted into **`templates/base.py`**.

> `templates/base.py` is the single code-level implementation. This file (design.md) is the design specification document; `base.py` is the corresponding executable code.

### Usage

```python
# In all scene/engine code, import base.py directly
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'templates'))
from base import *

# Then use directly:
from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws.title = "Sheet1"

headers = ["Column1", "Column2", "Column3"]
last_col = len(headers) + 1  # Starting from B=2

# One call to set up sheet basics + title
setup_sheet(ws, title="Table Title", last_col=last_col)

# Write headers
for col_idx, header in enumerate(headers, start=2):
    ws.cell(row=4, column=col_idx, value=header)
style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

# Write data rows
for i, row_data in enumerate(data):
    row_num = 5 + i
    for col_idx, value in enumerate(row_data, start=2):
        ws.cell(row=row_num, column=col_idx, value=value)
    style_data_row(ws, row_num=row_num, col_start=2, col_end=last_col, row_index=i)

# Write totals row
total_row_num = 5 + len(data)
style_total_row(ws, row_num=total_row_num, col_start=2, col_end=last_col)

# Auto-fit column widths and row heights (MANDATORY — prevents text clipping)
auto_fit_columns(ws, min_width=8, max_width=28, header_row=4, data_start_row=5)
auto_fit_row_heights(ws, header_row=4, data_start_row=5)

wb.properties.creator = "Z.ai"
wb.save("output.xlsx")
```

### Complete API provided by base.py

| Category | Exports |
|------|------|
| **Constants** | `FONT_NAME`, `HEADER_BOLD`, `PRIMARY`, `PRIMARY_LIGHT`, `SECONDARY`, `ACCENT_*`, `NEUTRAL_*`, `CHART_COLORS`, `COLUMN_WIDTHS`, `FORMATS`, `ROW_HEIGHTS` |
| **Conditional Formatting** | `CF_POSITIVE_FILL/FONT`, `CF_NEGATIVE_FILL/FONT`, `CF_WARNING_FILL/FONT` |
| **Font Factories** | `font_title()`, `font_header()`, `font_subheader()`, `font_body()`, `font_caption()`, `font_kpi()`, `font_kpi_label()` |
| **Fill Factories** | `fill_header()`, `fill_total()`, `fill_data_row(row_index)` |
| **Border Factories** | `border_header()`, `border_total()` |
| **Alignment Factories** | `align_title()`, `align_header()`, `align_number()`, `align_text()`, `align_date()` |
| **Sheet Helpers** | `setup_sheet(ws, title, last_col)`, `style_header_row(...)`, `style_data_row(...)`, `style_total_row(...)`, `auto_fit_columns(...)`, `auto_fit_row_heights(...)` |
| **Utility Functions** | `normalize_cell_value(value)`, `copy_style(source, target)` |

---

## 12. Design Checklist

Verify each item before delivering a table:

- [ ] Colors ≤ 3 hues (primary + accents, excluding neutrals)
- [ ] No formatting outside data area
- [ ] No full-grid borders (only header bottom line + totals top line)
- [ ] Alternating row fill applied
- [ ] Title has no background fill, left-aligned
- [ ] Numbers right-aligned, text left-aligned
- [ ] Grid lines disabled (`showGridLines = False`)
- [ ] Starting position is B2, column A is margin
- [ ] Body text color is `NEUTRAL_900` (`#37352F`), not pure black
- [ ] Chart colors come from Design Tokens, no new colors introduced
- [ ] `auto_fit_columns()` called after all data written
- [ ] `auto_fit_row_heights()` called after `auto_fit_columns()` — **prevents text clipping**
- [ ] Data cells have `wrap_text=True` (automatic via `style_data_row()`)
