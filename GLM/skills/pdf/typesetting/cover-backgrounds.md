# Cover Background — Advanced Cover Background Construction Rules

> Background is the canvas behind the canvas. It should be felt, not seen.

> **⚠️ V4.0 Note:** Report/Academic covers are now rendered with **ReportLab** (`scripts/cover_render.py`) — so the ReportLab Python examples below are **directly applicable** (coordinates, ratios, opacity values, `canvas` calls). For the **Creative** route (HTML), translate them to equivalent CSS `background`, `linear-gradient`, `radial-gradient`, `transform`, `clip-path`. The design intent and constraints (opacity limits, layer order, WCAG contrast) apply regardless of rendering engine. Background decoration is **optional** — templates 01–09 already define their own Layer-1 backgrounds.

---

## 🔴 Global Constraints

Before executing any specific background algorithm, these three iron rules must be obeyed — they are the baseline to ensure backgrounds remain subtle and never overwhelm:

### 1. Ultra-Low Contrast Rule (Opacity/Alpha Control)

All background element colors are calculated based on the underlying canvas base color:

| Base Color Type | Background Element Color | Opacity Range |
|---------|-------------|-----------|
| Light/white base | `#000000` | **2% – 5%** |
| Dark base | `#FFFFFF` | **3% – 6%** |

**Absolutely forbidden** to exceed the above opacity ranges. Background elements must be at the "barely perceptible" threshold.

### 2. Absolute Z-Axis Bottom Layer

All background drawing commands must be executed after the base solid color fill and before any text/layout content rendering.

Rendering order (bottom to top):
```
1. Page base color fill (solid rect)
2. ▶ Background element layer (all content defined in this file)
3. Foreground layout content (text, borders, geometric anchors, etc.)
```

### 3. Anti-Overflow Clipping (Clip Path)

Canvas Clip must be enabled to ensure any oversized shapes exceeding the page `(0, 0, W, H)` coordinate system do not cause abnormal PDF physical dimensions or rendering errors.

**Core principle: All calculations must be based on dynamic page dimensions (`W` = page width, `H` = page height). Hard-coding absolute pixel values is forbidden.**

---

## Module 1: Supergraphics

**Goal:** Use minimal curves or diagonal lines to break the rigidity of the rectangular frame.

### Option 1.1: Arc (The Bleeding Circle)

**Shape type**: Solid-filled circle

**Calculation logic**:
- `Radius` = `W × 1.2` to `W × 1.5` (must be larger than page width to ensure arc curvature is gentle enough)
- `Center_X` = `W × 1.0` (center placed at the rightmost page edge, or even outside the right side)
- `Center_Y` = `H × 0.8` (center biased lower)

**Visual effect**: An extremely elegant, grand arc sweeps across the lower-left corner of the page, with most of the circle body outside the page.

**ReportLab implementation notes**:
```python
c.saveState()
c.clipRect(0, 0, W, H)  # Rule 3: anti-overflow
c.setFillColorRGB(0, 0, 0, 0.03)  # Rule 1: ultra-low opacity
radius = W * 1.3
cx, cy = W * 1.0, H * 0.2  # ReportLab coordinate Y starts from bottom
c.circle(cx, cy, radius, fill=1, stroke=0)
c.restoreState()
```

**Playwright/HTML implementation notes**:
```html
<!-- Option 2.1: Side giant spine -->
<!-- Note: Must use JS to measure text width, dynamically adjust font-size to ensure full display -->
<div style="position:absolute; inset:0; overflow:hidden; z-index:0;">
  <div id="spine-watermark" style="
    position: absolute;
    left: 3%;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
    transform-origin: center center;
    font-size: min(calc(var(--W) * 0.45), 45vw);
    font-family: 'Helvetica', 'Arial Black', sans-serif;
    font-weight: 900;
    color: rgba(0,0,0,0.04);
    white-space: nowrap;
    line-height: 1;
  ">2026</div>
</div>
<script>
// Adaptive: ensure rotated text does not exceed 85% of page height
const el = document.getElementById('spine-watermark');
const maxH = window.innerHeight * 0.85;
if (el.offsetWidth > maxH) {
  const scale = maxH / el.offsetWidth;
  el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * scale) + 'px';
}
</script>
```

---

### Option 1.2: Sharp Angle Cut (The Angle Slash)

**Shape type**: Polygon/right trapezoid

**Calculation logic (define four vertices)**:
- `Point 1` = `(0, H × 0.7)`
- `Point 2` = `(W, H × 0.4)`
- `Point 3` = `(W, H)`
- `Point 4` = `(0, H)`

**Visual effect**: Forms a tilted geometric color block at the bottom of the page. This sharp linear cut has a strong IT/consulting/engineering industry feel.

**ReportLab implementation notes**:
```python
c.saveState()
c.clipRect(0, 0, W, H)
c.setFillColorRGB(0, 0, 0, 0.04)  # Rule 1
path = c.beginPath()
# ReportLab Y starts from bottom, needs flipping
path.moveTo(0, H * 0.3)       # Corresponds to doc P1: (0, H*0.7) → flipped
path.lineTo(W, H * 0.6)       # Corresponds to doc P2: (W, H*0.4) → flipped
path.lineTo(W, 0)             # Corresponds to doc P3: (W, H) → flipped
path.lineTo(0, 0)             # Corresponds to doc P4: (0, H) → flipped
path.close()
c.drawPath(path, fill=1, stroke=0)
c.restoreState()
```

---

## Module 2: Typographic Watermarks

**Goal:** Extract very short metadata text and transform it into an architectural watermark space.

### Technical Requirements (Mandatory)

| Constraint | Rule |
|-------|------|
| **Font** | Must use sans-serif, weight must be extra-bold (Black / Heavy / Bold). Recommended: Helvetica Black, Arial Black, Noto Sans SC Heavy |
| **Font prohibition** | **Absolutely forbidden** to use thin or serif fonts for this type of watermark |
| **Character count** | Extracted string length `1–5` characters (e.g. year "2026", abbreviation "AI", "B2B") |
| **Opacity** | Follow global Rule 1 (light bg 2-5%, dark bg 3-6%) |

### Option 2.1: Side Giant Spine (Vertical Spine)

**Calculation logic**:
- `Text` = Extract year (e.g. "2026")
- **🔴 Font Size Adaptive Algorithm (Full Text Display Iron Rule):**
  1. `Max_Font_Size` = `W × 0.45` (ideal maximum)
  2. Measure total text height after rotation: `Text_Width = measure(Text, Max_Font_Size)` (after 90° rotation, original width becomes vertical height)
  3. Available vertical space = `H × 0.85` (leaving `H × 0.075` safety margin top and bottom)
  4. If `Text_Width > available vertical space`, scale down proportionally: `Font_Size = Max_Font_Size × (available_vertical_space / Text_Width)`
  5. Final `Font_Size = min(Max_Font_Size, scaled_font_size)`
- `Rotation` = Counterclockwise 90° (`-90deg`)
- `Anchor_X` = `W × 0.03` (text fully within page, flush to left but not exceeding)
- `Anchor_Y` = Vertically centered = `(H - Text_Width) / 2` (text centered after rotation)

**⚠️ Full Display Iron Rule: Background watermark text must be 100% within the visible page area. Any clipping is strictly forbidden. Reduce font size rather than truncate.**

**Visual effect**: A complete bold number watermark appears on the left side, vertically centered, becoming the visual supporting pillar. Text is fully readable.

**ReportLab implementation notes**:
```python
c.saveState()
c.clipRect(0, 0, W, H)
c.setFillColorRGB(0, 0, 0, 0.04)

# Adaptive font size: ensure full text display
max_font_size = W * 0.45
text = "2026"
text_width = c.stringWidth(text, "Helvetica-Bold", max_font_size)
available_height = H * 0.85
if text_width > available_height:
    font_size = max_font_size * (available_height / text_width)
else:
    font_size = max_font_size

# Recalculate actual width for centering
actual_text_width = c.stringWidth(text, "Helvetica-Bold", font_size)

c.setFont("Helvetica-Bold", font_size)
# Vertically centered, fully within page
center_y = (H - actual_text_width) / 2
c.translate(W * 0.03, center_y)
c.rotate(90)  # ReportLab counter-clockwise is positive
c.drawString(0, 0, text)
c.restoreState()
```

---

### Option 2.2: Bottom Full Text

**Calculation logic**:
- `Text` = Document type English initials (e.g. "REPORT")
- **🔴 Font Size Adaptive Algorithm (Full Text Display Iron Rule):**
  1. `Max_Font_Size` = `W × 0.3` (ideal maximum)
  2. Measure text rendering width: `Text_Width = measure(Text, Max_Font_Size)`
  3. Available horizontal space = `W × 0.90` (leaving `W × 0.05` safety margin left and right)
  4. If `Text_Width > available horizontal space`, scale down proportionally: `Font_Size = Max_Font_Size × (available_horizontal_space / Text_Width)`
  5. Final `Font_Size = min(Max_Font_Size, scaled_font_size)`
- `Rotation` = 0° (horizontal tiling)
- `Anchor_X` = `W × 0.05`
- `Anchor_Y` = Text baseline within the bottom safe zone of the page: `H × 0.92` (text fully displayed at page bottom, not truncated)

**⚠️ Full Display Iron Rule: Background watermark text must be 100% within the visible page area. Any clipping is strictly forbidden. Reduce font size rather than truncate.**

**Visual effect**: Text sits solidly at the bottom like a foundation, fully readable, extremely dignified. No more half-truncated text.

**ReportLab implementation notes**:
```python
c.saveState()
c.clipRect(0, 0, W, H)
c.setFillColorRGB(0, 0, 0, 0.04)

# Adaptive font size: ensure full text display
max_font_size = W * 0.3
text = "REPORT"
text_width = c.stringWidth(text, "Helvetica-Bold", max_font_size)
available_width = W * 0.90
if text_width > available_width:
    font_size = max_font_size * (available_width / text_width)
else:
    font_size = max_font_size

c.setFont("Helvetica-Bold", font_size)
# Text fully within page, baseline placed in bottom safe zone
# ascent ≈ font_size * 0.75, ensure letter tops don't exceed page
c.drawString(W * 0.05, font_size * 0.3, text)  # baseline slightly above bottom edge
c.restoreState()
```

---

## Module 3: Blueprint Hairlines

**Goal:** Use ultra-thin interlacing lines to enhance the "anchoring feel" and logical rigor of foreground text.

### Technical Requirements

| Constraint | Rule |
|-------|------|
| **Line width** | `Stroke_Width = 0.5pt` (**must never exceed 1pt**) |
| **Line type** | Solid, or very closely spaced dotted line (Dotted, dash: `[1, 3]`) |
| **Opacity** | Follow global Rule 1 |

### Option 3.1: Coordinate Cross

**Calculation logic (height bound to foreground layout anchor)**:
- **Vertical line (Y-axis)**: Read the left-alignment safe boundary of foreground layout (e.g. `X = W × 0.15`). Draw a vertical line from `Y = 0` to `Y = H`
- **Horizontal line (X-axis)**: Read the baseline or top boundary of the foreground main title (e.g. `Y = H × 0.32`). Draw a horizontal line from `X = 0` to `X = W`

**Visual effect**: The entire page is divided by implicit golden ratio lines, foreground text appears to grow precisely on these coordinate axes, extremely rigorous.

**ReportLab implementation notes**:
```python
c.saveState()
c.setStrokeColorRGB(0, 0, 0, 0.04)
c.setLineWidth(0.5)
# Vertical line — align to foreground text left boundary
axis_x = W * 0.15
c.line(axis_x, 0, axis_x, H)
# Horizontal line — align to main title baseline
axis_y = H * 0.68  # ReportLab Y-flip: document H*0.32 → RL H*0.68
c.line(0, axis_y, W, axis_y)
c.restoreState()
```

**Playwright/HTML implementation notes**:
```html
<div style="position:absolute; inset:0; z-index:0; pointer-events:none;">
  <!-- Vertical line -->
  <div style="
    position:absolute;
    left: 15%;
    top: 0;
    width: 0.5px;
    height: 100%;
    background: rgba(0,0,0,0.04);
  "></div>
  <!-- Horizontal line -->
  <div style="
    position:absolute;
    left: 0;
    top: 32%;
    width: 100%;
    height: 0.5px;
    background: rgba(0,0,0,0.04);
  "></div>
</div>
```

---

## 🛠️ Combination & Circuit Breaker (The Combination Matrix)

To ensure diversity in auto-generated backgrounds while preventing visual chaos, the system must implement a **"background combination state machine"**.

For each PDF generation, randomly select one of the following 3 legal Recipes, **cross-boundary combinations are strictly forbidden**:

### ✅ Recipe A: Minimal Modern

**Combination**: `Option 1.1 (deep-space arc)` — **this one only, no other elements**

**Applicable scenes**: Safest, most whitespace, suitable for all types of corporate reports.

**Pairing suggestions with cover layouts**:
- Layout 1 (diagonal tension) — arc in the blank diagonal area, extremely harmonious
- Layout 2 (vertical gravity axis) — arc provides lower-left gravity
- Layout 4 (golden ratio) — arc adds breathing space to the lower whitespace area

---

### ✅ Recipe B: Engineering/Academic

**Combination**: `Option 3.1 (coordinate cross)` **+** `Option 2.1 (side giant spine)`

**Logic**: Vertical giant text interlaces with ultra-thin coordinate lines on the left, creating extreme thick-thin contrast, perfect for investment pitches and research reports.

**Line avoidance rule**: Option 3.1's ultra-thin lines should avoid crossing directly through Option 2.1 (giant text) strokes to prevent visual interference. Adjust line coordinates to avoid text areas:
- Vertical line `X` at `W × 0.15` (foreground text left-alignment line)
- Giant spine anchor `X` at `-W × 0.05` (left of vertical line, no crossing)

**Pairing suggestions with cover layouts**:
- Layout 7 (left-aligned matrix) — perfect match, left spine + coordinate lines + matrix text three-layer overlay
- Layout 2A (left-aligned vertical) — vertical line aligns with axis, doubled structural feel
- Layout 6A (side rotation decoration) — Note: 6A already has rotated year, if using Recipe B then **skip Option 2.1**, keep only Option 3.1

---

### ✅ Recipe C: Solid/Weighty

**Combination**: `Option 1.2 (sharp angle cut)` **+** `Option 2.2 (bottom full text)`

**Logic**: Bottom angular color block overlaid with fully displayed English word at the bottom, very low center of gravity, suitable for annual summaries and white papers.

**Stacking order**: Draw Option 1.2 angular color block first, then Option 2.2 bleed text (text on top of color block, but both below foreground content).

**Pairing suggestions with cover layouts**:
- Layout 4A (top suspended) — content on top, background pressed below, extreme top-bottom contrast
- Layout 1A (diagonal tension) — bottom gravity echoes lower-right text
- Layout 5A (stepped progression) — steps extend to lower-right, converging with bottom gravity

---

## 🚫 Circuit Breaker Rules (Hard Constraints)

The following combinations are **hard-forbidden**; violations are bugs:

| Forbidden Rule | Reason |
|---------|------|
| Option 2.1 + Option 2.2 together | **No dual text**. Only one giant text watermark allowed per page |
| Option 1.1 + Option 1.2 together | **No dual geometry**. Large circle + large diagonal = visual chaos |
| Option 3.1 lines crossing Option 2.x strokes | **Line isolation**. Ultra-thin lines must not cross giant text strokes; adjust coordinates to avoid |
| All three modules enabled | **Maximum two modules**. Three layers = overwhelms foreground |
| Any background element opacity > 6% | **Rule 1 violation**. Background must be subtle and barely visible |

---

## Recipe Selection Logic

When no specific recipe is specified, auto-select based on document type:

| Document Type | Recommended Recipe | Reason |
|---------|---------|------|
| Corporate reports, general docs | **A** | Safest, zero risk |
| Technical reports, investment pitches | **B** | Engineering feel, precision |
| Annual summaries, white papers | **C** | Solid, weighty |
| Creative, design | **A** | Maximum whitespace, no conflict with creative content |
| Academic papers | **B** | Structural feel matches academic tone |
| Uncertain / default | **A** | Minimal never goes wrong |

---

## Relationship with geometry.md

This file defines **page-level macro backgrounds** (Supergraphics / Watermarks / Hairlines), applied to the entire canvas.

`geometry.md` defines **local decorative anchors** (Offset Stacking / Scale Contrast / Grid Intersection), applied to specific areas.

Both can coexist, but note:
- Background layer (this file) is at the bottom
- Geometric anchors (geometry.md) are above the background layer but below foreground text
- If both are used, geometric anchors should be placed in "blank areas" of background elements to avoid visual overlap
