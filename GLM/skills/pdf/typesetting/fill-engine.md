# Fill Engine — Adaptive Anti-Void Layout Engine V2.0

> Solves the **"text too small to read"** and **"large page voids"** problems caused by varying input content length in automated PDF generation.  
> Before rendering any page, it must pass through the following **four elastic filtering calculations**.  
>  
> **Positioning**: This is the mirror counterpart of `overflow.md` (anti-overflow) — overflow handles "too much content", fill-engine handles "too little content".  
>  
> Related:  
> - `overflow.md` — Anti-overflow layout system (degradation strategy for excessive content)  
> - `pagination.md` — Pagination & cross-page integrity control  
> - `cover.md` — Cover layout engine (covers not affected by Fill Engine; they have their own layout system)

---

## ⚠️ Scope of Application

- ✅ **Body pages** (body pages of Report / Academic / Creative routes)
- ✅ **All three rendering routes** (ReportLab / LaTeX / Playwright-HTML)
- ❌ **Not applicable to covers** (covers are independently controlled by `cover.md`)
- ❌ **Not applicable to TOC pages** (TOC has a fixed format)

---

## Safety Net 1: Readability Red Line (Font Size Hard Floor)

**Principle: Never rely on shrinking font size to fit the layout. Font sizes have hard-coded minimums that cannot be breached.**

### Absolute Font Size Floor

| Element | Single-column | Double-column | Notes |
|------|---------|---------|------|
| **Body Text** | **≥ 14pt** | **≥ 12pt** | Below this → considered unreadable, must trigger page break |
| **Default base size** | 15pt (CJK) / 14pt (Latin) | 13pt (CJK) / 12pt (Latin) | Starting value, not ceiling |

### Heading Scale Hard Floor

| Level | Min Size | Recommended |
|------|---------|---------|
| **H1** (primary heading / page title) | **≥ 32pt** | 36–42pt |
| **H2** (secondary heading) | **≥ 24pt** | 26–30pt |
| **H3** (tertiary heading) | **≥ 18pt** | 20–22pt |

### Coordination with overflow.md

`overflow.md` §5's font-size degradation staircase (`fit_text_with_degradation`) **must not breach the above floor**:

```python
# overflow.md §5's min_size parameter must be >= Fill Engine red line
def fit_text_with_degradation(text, font_name, base_size, max_width,
                               min_size=14):  # ← Single-column floor 14pt, not 7pt
    """When overflow needs to shrink font size, it cannot go below the readability red line."""
    for size in range(base_size, min_size - 1, -1):
        if stringWidth(text, font_name, size) <= max_width:
            return size
    return min_size  # Hit the floor → trigger page break, stop shrinking
```

> **Core idea: If content doesn't fit → page break, not shrinking text to ant-size.**

---

## Safety Net 2: Page Fill Ratio & Paragraph Inflation (Fill Ratio Engine)

### Virtual Rendering

Before actually rendering each page, the system **must first calculate** how much height the content would occupy under default font sizes and spacing.

```python
def calculate_fill_ratio(content_blocks, available_height, default_styles):
    """
    Virtual rendering: calculate total height of current page content under default styles.
    Returns fill ratio = total content height / available page height.
    """
    total_height = 0
    for block in content_blocks:
        block_height = measure_block_height(block, default_styles)
        total_height += block_height

    fill_ratio = total_height / available_height
    return fill_ratio
```

### Elastic Inflation Trigger Conditions

| Fill Ratio | Status | Action |
|--------|------|------|
| **≥ 80%** | ✅ Full | No adjustment, render normally |
| **65%–80%** | ⚠️ Slightly empty | Light inflation (line-height + paragraph spacing only) |
| **40%–65%** | 🔶 Noticeably empty | Full inflation (line-height + spacing + slight font increase + component inflation) |
| **< 40%** | 🔴 Extremely empty | Full inflation + Y-axis golden ratio anchoring (Safety Net 4) |

### Inflation Parameters (Triggered when fill ratio < 65%)

#### 2a. Line-Height Inflation

```python
def inflate_line_height(base_line_height, fill_ratio):
    """
    Lower fill ratio means more line-height stretch.
    base_line_height: default line-height (e.g. 1.4)
    Returns inflated line-height, capped at 2.2.
    """
    if fill_ratio >= 0.65:
        return base_line_height  # No inflation

    # Linear interpolation: as fill_ratio goes from 0.65→0.30, line-height goes from base→2.2
    inflation = (0.65 - fill_ratio) / (0.65 - 0.30)  # 0.0 ~ 1.0
    inflation = min(inflation, 1.0)

    target = base_line_height + (2.2 - base_line_height) * inflation
    return round(target, 2)
```

| Fill Ratio | Base line-height 1.4 → After inflation |
|--------|---------------------|
| 65% | 1.40 (unchanged) |
| 55% | 1.63 |
| 45% | 1.86 |
| 35% | 2.09 |
| ≤30% | 2.20 (cap) |

#### 2b. Paragraph Spacing Compensation (Margin-Bottom Injection)

```python
def inject_paragraph_spacing(remaining_height, paragraph_count, heading_count):
    """
    Distribute 30%-50% of remaining whitespace evenly between paragraphs.
    remaining_height: Available_H - content height after inflation
    """
    if remaining_height <= 0:
        return 0

    injection_pool = remaining_height * 0.4  # Take 40%
    gap_count = paragraph_count + heading_count - 1  # Number of gaps

    if gap_count <= 0:
        return 0

    per_gap = injection_pool / gap_count
    return round(per_gap, 1)
```

**Injection positions (by priority):**
1. Between headings and body text (below H1/H2/H3)
2. Between natural paragraphs
3. Between body text and charts/tables

#### 2c. Font Scaling

```python
def scale_font_size(base_size, fill_ratio):
    """
    When fill ratio < 65%, allow font size to float up by 1-2pt.
    Never exceed +2pt, otherwise loses professional feel.
    """
    if fill_ratio >= 0.65:
        return base_size
    if fill_ratio >= 0.50:
        return base_size + 1
    return base_size + 2  # Max +2pt
```

> **Constraint: Inflated font size ≤ base_size + 2pt. 15pt body can become at most 17pt, no larger.**

---

## Safety Net 3: Component-Level Elastic Fill (Component Inflation)

**Trigger: Same as Safety Net 2, active when fill ratio < 65%.**

### 3a. Table Auto-Height Expansion (Table Padding Inflation)

```python
def inflate_table_padding(base_padding, fill_ratio):
    """
    Lower fill ratio means larger table cell padding.
    base_padding: default cell padding (e.g. 6pt)
    """
    if fill_ratio >= 0.65:
        return base_padding

    # Add 10-20pt
    extra = int((0.65 - fill_ratio) / 0.25 * 20)
    extra = max(10, min(extra, 20))
    return base_padding + extra
```

**Effect:** Originally flat compact data table → tall spacious data display board.

### 3b. Blockquote Exaggeration (Blockquote Scaling)

When encountering a blockquote and the page has voids:

```python
def scale_blockquote(base_font_size, fill_ratio):
    """
    Blockquote font enlarged, italicized, massive whitespace above and below.
    """
    if fill_ratio >= 0.65:
        return {
            "font_size": base_font_size,
            "font_style": "normal",
            "margin_top": 12,
            "margin_bottom": 12,
            "border_left_width": 3,
        }
    return {
        "font_size": int(base_font_size * 1.5),  # Scale up 1.5x
        "font_style": "italic",
        "margin_top": 40,    # Large whitespace above
        "margin_bottom": 40, # Large whitespace below
        "border_left_width": 6,  # Thicken blockquote left border
    }
```

### 3c. List Item Spacing Expansion

```python
def inflate_list_spacing(base_spacing, fill_ratio):
    """
    List item spacing expanded to 1.5x normal paragraph spacing.
    """
    if fill_ratio >= 0.65:
        return base_spacing
    return int(base_spacing * 1.5)
```

---

## Safety Net 4: Y-Axis Golden Ratio Anchoring (Ultimate Measure for Extreme Voids)

**Trigger: After Safety Net 2 + 3 inflation, fill ratio still < 40%.**

**Core principle: Absolutely forbidden to pin content to the very top, leaving the bottom half as dead whitespace.**

### Execution Logic

```python
def anchor_content_vertically(content_bbox_height, available_height, fill_ratio):
    """
    Pack all current page content as a BBox, re-align vertically within available height.

    Returns content_top_y: Y coordinate offset for content top.
    """
    if fill_ratio >= 0.40:
        return 0  # No anchoring needed, normal flow from page top

    remaining = available_height - content_bbox_height

    # Option A: Golden ratio offset-up (recommended)
    golden_offset = remaining * 0.382  # Top 38.2%, bottom 61.8%

    # Option B: Absolute vertical center (alternative)
    # center_offset = remaining / 2

    return golden_offset
```

### Option Selection

| Option | Formula | Visual Effect | Applicable Scenario |
|------|------|---------|---------|
| **A. Golden ratio offset-up** (default) | `offset = remaining * 0.382` | Slightly less whitespace above, more below, visually stable | Most scenarios |
| **B. Absolute center** | `offset = remaining / 2` | Perfectly symmetrical | Minimal pages with single element |

### Effect Illustration

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  ← Content starts here        │     │                         │
│  Section Title           │     │   ← 38.2% elegant space      │
│  Body text...            │     │                         │
│                          │     │  Section Title           │
│                          │     │  Body text...            │
│                          │     │                          │
│                          │     │                          │
│  ← Huge dead whitespace!       │     │   ← 61.8% bottom space      │
│                          │     │                         │
│                          │     │                         │
└─────────────────────────┘     └─────────────────────────┘
      ❌ No anchoring                      ✅ Golden ratio anchoring
```

---

## Three-Route Implementation Guide

### ReportLab Route (Report Pipeline)

```python
from reportlab.platypus import SimpleDocTemplate, Spacer, Paragraph
from reportlab.lib.units import pt

def build_page_with_fill_engine(story_blocks, page_width, page_height, margins):
    """
    Fill Engine main entry — ReportLab route.
    Call before doc.build().
    """
    available_h = page_height - margins['top'] - margins['bottom']
    available_w = page_width - margins['left'] - margins['right']

    # --- Safety Net 1: Check font size floor ---
    enforce_font_floor(story_blocks, min_body=14, min_h1=32, min_h2=24, min_h3=18)

    # --- Safety Net 2: Virtual render + inflation ---
    fill_ratio = calculate_fill_ratio(story_blocks, available_h, default_styles)

    if fill_ratio < 0.65:
        # 2a. Line-height inflation
        new_line_height = inflate_line_height(1.4, fill_ratio)
        apply_line_height(story_blocks, new_line_height)

        # 2b. Paragraph spacing injection
        remaining = available_h - measure_total_height(story_blocks)
        extra_gap = inject_paragraph_spacing(remaining, count_paragraphs(story_blocks),
                                              count_headings(story_blocks))
        inject_spacers(story_blocks, extra_gap)

        # 2c. Font scaling
        font_bump = scale_font_size(15, fill_ratio) - 15
        if font_bump > 0:
            bump_font_sizes(story_blocks, font_bump)

    # --- Safety Net 3: Component inflation ---
    if fill_ratio < 0.65:
        inflate_tables(story_blocks, fill_ratio)
        inflate_blockquotes(story_blocks, fill_ratio)
        inflate_lists(story_blocks, fill_ratio)

    # --- Safety Net 4: Y-axis anchoring ---
    recalc_ratio = calculate_fill_ratio(story_blocks, available_h, inflated_styles)
    if recalc_ratio < 0.40:
        content_height = measure_total_height(story_blocks)
        top_offset = anchor_content_vertically(content_height, available_h, recalc_ratio)
        story_blocks.insert(0, Spacer(1, top_offset))

    return story_blocks
```

### LaTeX Route (Academic Pipeline)

```latex
% Safety Net 1: Font size floor — define in preamble
\newcommand{\bodysize}{\fontsize{14pt}{20pt}\selectfont}  % 14pt floor
\renewcommand{\Large}{\fontsize{32pt}{38pt}\selectfont}   % H1 ≥ 32pt
\renewcommand{\large}{\fontsize{24pt}{30pt}\selectfont}   % H2 ≥ 24pt

% Safety Net 4: Vertical centering (for extreme voids)
\newcommand{\goldenpage}[1]{%
  \null\vfill  % Top elastic space (less)
  #1           % Content
  \vfill\vfill % Bottom elastic space (more, ~2:1 ratio)
}

% Usage (when content is minimal):
% \goldenpage{
%   \section{Summary}
%   Short content here...
% }
```

### Playwright/HTML Route (Creative Pipeline)

```css
/* Safety Net 1: Font size red line */
:root {
  --body-min-font: 14px;
  --h1-min-font: 32px;
  --h2-min-font: 24px;
  --h3-min-font: 18px;
}

body {
  font-size: max(var(--body-font, 15px), var(--body-min-font));
}

h1 { font-size: max(var(--h1-font, 36px), var(--h1-min-font)); }
h2 { font-size: max(var(--h2-font, 28px), var(--h2-min-font)); }
h3 { font-size: max(var(--h3-font, 22px), var(--h3-min-font)); }

/* Safety Net 2-3: Dynamically injected after JS virtual render */
/* Before Playwright screenshot, run Fill Engine JS via page.evaluate() */
```

```javascript
// Playwright page.evaluate() — Fill Engine
function runFillEngine(pageElement) {
  const pageH = pageElement.clientHeight;
  const contentH = pageElement.scrollHeight;
  const fillRatio = contentH / pageH;

  if (fillRatio >= 0.65) return; // No inflation needed

  const root = pageElement.style;

  // 2a. Line-height inflation
  const inflation = Math.min((0.65 - fillRatio) / 0.35, 1.0);
  const newLH = 1.4 + (2.2 - 1.4) * inflation;
  root.setProperty('--body-line-height', newLH.toFixed(2));
  pageElement.querySelectorAll('p, li').forEach(el => {
    el.style.lineHeight = newLH.toFixed(2);
  });

  // 2c. Font scaling
  if (fillRatio < 0.50) {
    pageElement.querySelectorAll('p, li').forEach(el => {
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = Math.min(size + 2, size + 2) + 'px'; // +2pt max
    });
  } else if (fillRatio < 0.65) {
    pageElement.querySelectorAll('p, li').forEach(el => {
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = (size + 1) + 'px'; // +1pt
    });
  }

  // 3a. Table height expansion
  pageElement.querySelectorAll('td, th').forEach(cell => {
    const extra = Math.min(20, Math.round((0.65 - fillRatio) / 0.25 * 20));
    cell.style.paddingTop = (6 + extra) + 'px';
    cell.style.paddingBottom = (6 + extra) + 'px';
  });

  // 3b. Blockquote exaggeration
  pageElement.querySelectorAll('blockquote').forEach(bq => {
    const size = parseFloat(getComputedStyle(bq).fontSize);
    bq.style.fontSize = (size * 1.5) + 'px';
    bq.style.fontStyle = 'italic';
    bq.style.marginTop = '40px';
    bq.style.marginBottom = '40px';
  });

  // Safety Net 4: Y-axis anchoring
  const newContentH = pageElement.scrollHeight;
  const newRatio = newContentH / pageH;
  if (newRatio < 0.40) {
    const remaining = pageH - newContentH;
    const offset = remaining * 0.382;
    pageElement.style.paddingTop = offset + 'px';
  }
}
```

---

## Execution Order Summary

```
Input content arrives
    │
    ▼
┌─────────────────────────────────────────┐
│  Safety Net 1: Readability red line check                  │
│  → Font size ≥ floor? YES → Continue               │
│  → Font size < floor? → Force raise to floor           │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Virtual render: Calculate Fill Ratio               │
│  → ≥ 80%? → Render normally, exit               │
│  → 65%-80%? → Light inflation (2a+2b only)       │
│  → < 65%? → Enter Safety Net 2+3 full inflation       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Safety Net 2: Paragraph inflation                       │
│  2a. Line-height inflation (→ max 2.2)               │
│  2b. Paragraph spacing injection (30%-50% of remaining space)      │
│  2c. Font scaling (+1~2pt, max)              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Safety Net 3: Component inflation                       │
│  3a. Table Padding increase (+10~20pt)        │
│  3b. Blockquote scale 1.5x + 40pt whitespace above/below      │
│  3c. List spacing × 1.5                      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Recalculate Fill Ratio                     │
│  → ≥ 40%? → Render normally, exit               │
│  → < 40%? → Safety Net 4: Y-axis golden ratio anchoring    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Safety Net 4: Shift content down                    │
│  top_offset = remaining * 0.382          │
│  → Elegant space above, slightly more below                  │
│  → No longer "underfilled" but "intentional whitespace"          │
└─────────────────────────────────────────┘
                   │
                   ▼
              Actual render output
```

---

## Coordination with Other Specifications

| Specification | Relationship | Coordination Rule |
|------|------|---------|
| `overflow.md` | Complementary (overflow vs void) | overflow's font degradation must not breach Fill Engine's red line |
| `pagination.md` | Complementary (pagination vs fill) | pagination's "last page ≥ 40%" aligns with Fill Engine's Fill Ratio concept |
| `cover.md` | Independent | Covers have their own layout system, not affected by Fill Engine |
| `typography.md` | Infrastructure | Fill Engine makes elastic adjustments on top of typography-defined fonts/line-heights |

---

## Checklist (Check Before Every Body Page Render)

```
□ Body font size ≥ 14pt (single-column) / 12pt (double-column)?
□ H1 ≥ 32pt、H2 ≥ 24pt、H3 ≥ 18pt？
□ Virtual render calculated Fill Ratio?
□ Inflation triggered when Fill Ratio < 65%?
□ Line-height inflation not exceeding 2.2?
□ Font scaling not exceeding +2pt?
□ Table Padding increment within 10-20pt range?
□ Blockquote scale factor = 1.5x, top/bottom whitespace = 40pt?
□ Y-axis anchoring triggered when Fill Ratio < 40%?
□ Cover page not affected by Fill Engine?
```
