# Chart Design — Chart Typesetting & Anti-Stacking Rules

> Core principle: **Data-Ink Ratio** — delete every line that doesn't represent data. Then delete some more.

---

## Part 1: Anti-Stacking (Collision Prevention)

Text stacking is fundamentally "information density exceeding available physical space." Apply these dynamic degradation strategies.

### 0. Universal Anti-Overlap Pre-Check (MANDATORY)

**Before rendering ANY chart, run this pre-flight check:**

```python
# Step 1: Reserve space for labels FIRST, then draw chart
# WRONG: draw chart → add labels → discover overlap → cry
# RIGHT: measure labels → reserve space → draw chart in remaining area

# Step 2: Chart-to-text separation
CHART_TEXT_MIN_GAP = 12  # pt — minimum gap between chart edge and adjacent text
CHART_LABEL_MIN_GAP = 6  # pt — minimum gap between chart labels and chart elements

# Step 3: Label-to-label collision check
def labels_overlap(label_a, label_b):
    """Check if two label bounding boxes overlap."""
    return not (label_a.right < label_b.left or
                label_a.left > label_b.right or
                label_a.bottom < label_b.top or
                label_a.top > label_b.bottom)

# Step 4: Resolution cascade
# 1. Reposition (nudge conflicting label)
# 2. Reduce font size (min 8pt)
# 3. Remove label (replace with legend entry)
# 4. Merge small items ("Others" grouping)
```

**Matplotlib-specific anti-overlap:**
```python
# MANDATORY for all matplotlib charts
import matplotlib.pyplot as plt
from adjustText import adjust_text  # pip install adjustText

# After adding text annotations:
# adjust_text(texts, arrowprops=dict(arrowstyle='-', color='gray', lw=0.5))

# For bar value labels:
fig.tight_layout(pad=2.0)  # Always use generous padding
plt.subplots_adjust(bottom=0.15)  # Reserve space for rotated labels

# For pie/donut:
# autopct labels: check angular distance between adjacent slices
# If angle < 15°, use external labels with leader lines
```

**Chart-to-body-text separation (ReportLab):**
```python
# MANDATORY spacers around chart flowables
story.append(Spacer(1, 24))       # 24pt gap before chart
story.append(chart_image)          # Chart
story.append(Spacer(1, 8))        # 8pt gap
story.append(chart_caption)        # Caption
story.append(Spacer(1, 24))       # 24pt gap after chart
# NEVER place chart without Spacer guards
```

### 1. Pie / Donut Chart — Label Collision Prevention

When slices are too small, labels MUST NOT be placed inside the arc.

#### Strategy A: Leader Lines + Y-Axis Collision Avoidance

When slice angle `< 15°` (or area share `< 5%`), force external labels:
- Draw a polyline (leader line) from the arc's outer edge to the label text
- **Y-axis anti-collision logic**: Calculate adjacent label Y-coordinates. If `Y2 - Y1 < font_height + padding`, push `Y2` downward (or pull `Y1` upward). Extend/shorten the horizontal segment of the leader line accordingly.
- Leader lines: 1pt, same color as slice at 60% opacity

#### Strategy B: "Others" Grouping (Long-Tail Merge)

Before data reaches the renderer, intercept and merge:
- Threshold: slices `< 3%` → merge into a single "其他 (Others)" slice
- If detail is needed, add a minimal table beside the chart showing the breakdown
- This prevents 5+ tiny slivers from cluttering the chart

#### Strategy C: Strip Labels, Use Rich Legend

The most premium approach — **zero text on the chart itself**:
- Pie/donut body shows only pure shapes + colors
- All names, percentages, and values are laid out in a grid-aligned legend to the right or below
- This NEVER stacks, and looks the most professional

**Priority order**: C (best) → A (good) → B (acceptable fallback)

---

### 2. Bar Chart — Label Collision Prevention

#### Strategy A: Auto-Rotate to Horizontal Bar

**Hard rule**: When X-axis label average length exceeds **5 Chinese characters** (or 10 Latin characters), automatically convert to a horizontal bar chart.
- Y-axis has unlimited downward space for labels — stacking is impossible
- This is the single most effective anti-collision measure for bar charts

#### Strategy B: Tick Thinning + Stagger

When there are many bars (e.g., 30-day trend):
- **Thinning**: Show every 2nd or 5th label (skip intermediate ticks)
- **Stagger**: Alternate labels between two rows (offset vertically)
- **Tilt (last resort)**: 45° rotation works but reduces readability in premium reports. Prefer thinning or horizontal bars.

#### Strategy C: Value Label Inside/Outside Flip

- If bar is tall enough: place value label **inside** the bar near the top (use contrasting text color)
- If bar is too short for internal label: place value **above** the bar
- If value labels would overlap between adjacent bars: show values only on the tallest/shortest bars, or use tooltip-style callout boxes

---

### 3. Line Chart — Data Point Label Prevention

Dense data points with labels on every point = visual chaos.

#### Strategy A: "First, Last, Max, Min" Rule (Data Journalism Standard)

Only auto-label **4 points** on any line:
- **Start point** (first value)
- **End point** (last value)
- **Maximum** (peak)
- **Minimum** (valley)

All other points show only the curve shape — no labels. This instantly elevates professionalism.

#### Strategy B: Callout Boxes

For points that must be highlighted:
- Don't let text sit naked on the curve
- Wrap in a rounded-corner background box (white fill, very light shadow or thin border)
- Connect to the data point with a thin needle line
- Boxes have physical boundaries → easier collision detection and displacement

---

## Part 2: Visual Refinement (Eliminating "Cheap" Aesthetics)

### 1. Axis & Grid Line Treatment

**The #1 sign of amateur charts: thick black border frames and solid grid lines.**

| Element | Rule |
|---------|------|
| Top spine | **DELETE** (unconditionally) |
| Right spine | **DELETE** (unconditionally) |
| Left Y-axis spine | Optional — can delete if values are labeled on bars directly |
| Bottom X-axis | Keep as baseline reference (thin, gray) |
| Grid lines | **Dashed only** (dotted or dashed), 0.5pt, 15-20% opacity. NEVER solid. |
| Grid lines (when values shown) | **DELETE entirely** — if bar/line values are directly labeled, grid lines are redundant |

### 2. Geometric Shape Refinement

#### Pie → Donut (Mandatory Default)

- **Always use donut (ring) charts** instead of solid pies
- Inner radius = **60–70%** of outer radius
- Center space: display the total value or core metric in large text (e.g., "100%" / "¥2.4M")
- Visual weight is lighter, information hierarchy is clearer

#### Bar Styling

| Property | Value | Why |
|----------|-------|-----|
| Bar-to-gap ratio | `1.5:1` or `2:1` | Not too thin (bamboo sticks), not too fat (no breathing room) |
| Top border-radius | `2px – 4px` | Micro-rounding removes machine harshness, adds modern UI feel |
| Bottom border-radius | `0px` | Flat base anchors to the axis |

#### Line Chart Refinement

| Property | Value | Why |
|----------|-------|-----|
| Curve type | **Smooth (Bézier/spline)** | Unless showing strictly discrete data |
| Line width | `2pt – 3pt` | Stands out against weakened grid |
| Area fill | Gradient from line color at 20% opacity → 0% opacity downward | Adds volume and depth |
| Data point markers | Small circles (3-4px radius), only on labeled points | Don't mark every point |

### 3. Legend & Text Hierarchy

#### Chart Title Layout

- **Main title**: Left-aligned above the chart, bold, 14-16pt
- **Subtitle**: Below main title, regular weight, smaller (11-12pt), describes data source/period/units
- Title and chart body must have clear visual separation (≥16px gap)

#### Legend Rules

| Rule | Details |
|------|---------|
| Border | **NONE** — never put a box around the legend |
| Position | Top-left horizontal row (preferred) or directly above chart area |
| Markers | Small circles (4px) or short line segments — NOT chunky squares |
| Font size | Same as axis labels (10-12pt) |
| Spacing | Generous horizontal spacing between items (≥24px) |

---

## Part 3: Default Chart Configuration

When generating any chart (HTML/SVG for Creative pipeline, or matplotlib/ReportLab for Report pipeline), apply these defaults:

```
Chart Defaults:
  axes:
    top_spine: hidden
    right_spine: hidden
    left_spine: light_gray_or_hidden
    bottom_spine: light_gray_thin
    grid: dashed, 0.5pt, 20% opacity (or hidden if values labeled)

  pie:
    type: donut
    hole_ratio: 0.65
    min_slice_for_internal_label: 5%
    small_slice_strategy: leader_lines  # or "others_merge" or "rich_legend"
    others_threshold: 3%

  bar:
    top_radius: 3px
    bar_gap_ratio: 0.5  # gap = 50% of bar width
    auto_horizontal_threshold: 5_cjk_chars  # or 10 latin chars
    value_label_position: auto  # inside if tall, outside if short

  line:
    smooth: true  # Bézier curve
    width: 2.5pt
    area_fill: gradient_20_to_0
    label_strategy: first_last_max_min
    point_markers: labeled_points_only

  legend:
    border: none
    position: top_left_horizontal
    marker_shape: circle_small  # 4px radius
    marker_size: 4px

  typography:
    chart_title: bold, 14-16pt, left-aligned
    chart_subtitle: regular, 11-12pt, left-aligned
    axis_labels: 10-12pt
    value_labels: 10-12pt
    legend_text: 10-12pt
```

---

## Part 4: Pipeline-Specific Notes

### Creative Pipeline (Playwright HTML/CSS)

Charts in the Creative pipeline are rendered as HTML/SVG within the blueprint's components. Apply chart rules through:
- Inline SVG with proper viewBox and text positioning
- CSS classes for axis hiding, grid styling, legend layout
- JavaScript-based collision detection for leader lines (if dynamic)

### Report Pipeline (ReportLab)

Charts in the Report pipeline use ReportLab Drawing objects or embedded matplotlib figures:
- Use matplotlib with `plt.rcParams` overrides matching the defaults above
- `ax.spines['top'].set_visible(False)`, `ax.spines['right'].set_visible(False)`
- `ax.grid(True, linestyle='--', alpha=0.2, linewidth=0.5)`
- For pie charts: `plt.pie(..., wedgeprops=dict(width=0.35))` for donut effect
- For bar charts: use `matplotlib.patches.FancyBboxPatch` or `bar(..., edgecolor='none')` with manual rounded rect patches

### Academic Pipeline (LaTeX/TikZ)

- Use `pgfplots` with similar axis/grid configuration
- `\pgfplotsset{every axis/.append style={...}}`
- Donut charts via `tikz` with arc drawing

---

## Part 5: Chart Spacing & Anti-Overlap Guarantees

### 5.1 Chart-to-Body-Text Separation

| Context | Minimum Gap | Notes |
|---------|-------------|-------|
| Chart above/below body text | 24pt | Both above and below the chart |
| Chart caption to chart | 8pt | Caption immediately below chart |
| Chart caption to next body text | 18pt | Clear separation |
| Two consecutive charts | 30pt | Prevent visual merging |

### 5.2 Legend-to-Chart Overlap Prevention

**Legend MUST NOT overlap chart data area.** This is a zero-tolerance rule.

```python
# matplotlib: move legend outside plot area when overlapping
leg = ax.legend(loc='upper left', bbox_to_anchor=(0, 1), frameon=False)
# If legend still overlaps, move to below chart:
# leg = ax.legend(loc='upper center', bbox_to_anchor=(0.5, -0.12),
#                 ncol=3, frameon=False)

# ALWAYS call tight_layout AFTER placing legend
fig.tight_layout()
```

### 5.3 Value Label Anti-Collision

**When value labels on adjacent bars/points overlap:**
1. **Stagger vertically** — alternate above/below the bar
2. **Rotate 45°** — angled labels take less horizontal space
3. **Show only key values** — max, min, first, last
4. **Remove all and use gridlines** — let the reader estimate from axis

### 5.4 Multi-Chart Layout in Documents

When a page contains 2+ charts:
- Each chart gets its own bounding box with explicit dimensions
- Charts must not share the same vertical space (no side-by-side unless explicitly designed)
- For side-by-side charts: use a 2-column layout with `Spacer` between columns
- Each chart's title/subtitle/legend must be fully within its own bounding box
