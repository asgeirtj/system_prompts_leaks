# Chart Templates — matplotlib Template Library

## Design Philosophy

GLM uses **matplotlib as the primary chart engine**. Advantages:
- High chart quality, print-ready
- Full style control, consistent with document palette
- Supports complex chart types (heatmap, radar, box plot, etc.)
- Reliable CJK rendering (with SimHei font configured)

**When to use native Word charts?**  
Only when the user explicitly requests "editable charts." Default is always matplotlib PNG embedding.

## Base Configuration

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.font_manager import FontProperties

# ── CJK Font ──
_FONT_PATHS = [
    "/System/Library/Fonts/Supplemental/SimHei.ttf",       # macOS
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",       # Linux
    "/usr/share/fonts/truetype/chinese/SimHei.ttf",        # custom install
    "./SimHei.ttf",                                         # current dir
]
ZH_FONT = None
for _fp in _FONT_PATHS:
    try:
        ZH_FONT = FontProperties(fname=_fp)
        break
    except:
        continue

plt.rcParams["axes.unicode_minus"] = False

# ── Palette Adapter ──
def make_chart_palette(accent: str, surface: str = "#F2F4F6") -> dict:
    """Generate chart palette from document palette.accent"""
    return {
        "primary": accent,
        "series": _generate_series_colors(accent, 6),
        "grid": "#E0E0E0",
        "bg": "white",
        "text": "#333333",
        "surface": surface,
    }

def _generate_series_colors(base_hex: str, count: int) -> list:
    """Generate series colors via hue rotation from base color"""
    import colorsys
    base = tuple(int(base_hex.lstrip("#")[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    h, s, v = colorsys.rgb_to_hsv(*base)
    colors = []
    for i in range(count):
        hi = (h + i * (1.0 / count)) % 1.0
        r, g, b = colorsys.hsv_to_rgb(hi, min(s * 0.9, 1.0), min(v * 1.05, 1.0))
        colors.append(f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}")
    return colors

# ── Universal Export ──
def save_chart(fig, path: str, dpi: int = 200):
    """Save chart with uniform DPI. Square charts (pie/radar) use fixed padding to preserve 1:1 ratio."""
    w, h = fig.get_size_inches()
    if abs(w - h) < 0.1:
        fig.savefig(path, dpi=dpi, bbox_inches="tight", pad_inches=0.3,
                    facecolor="white", edgecolor="none")
    else:
        fig.savefig(path, dpi=dpi, bbox_inches="tight", pad_inches=0.1,
                    facecolor="white", edgecolor="none")
    plt.close(fig)
    return path
```

## Template 1: Bar Chart

```python
def bar_chart(categories: list, values: list, title: str = "",
              ylabel: str = "", palette: dict = None, output: str = "bar.png"):
    """
    Basic bar chart.
    categories: ["Q1", "Q2", "Q3", "Q4"]
    values: [120, 150, 180, 200]
    """
    p = palette or make_chart_palette("#5B8DB8")
    fig, ax = plt.subplots(figsize=(10, 6))

    bars = ax.bar(categories, values, color=p["primary"], width=0.6, edgecolor="white")

    # Data labels
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + max(values) * 0.02,
                str(val), ha="center", va="bottom", fontsize=10,
                fontproperties=ZH_FONT, color=p["text"])

    if title:
        ax.set_title(title, fontproperties=ZH_FONT, fontsize=14, pad=15, color=p["text"])
    if ylabel:
        ax.set_ylabel(ylabel, fontproperties=ZH_FONT, fontsize=11, color=p["text"])

    ax.set_xticklabels(categories, fontproperties=ZH_FONT, fontsize=10)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.3, color=p["grid"])

    if len(categories) > 6:
        plt.xticks(rotation=45, ha="right")

    return save_chart(fig, output)
```

### Grouped Bar Chart

```python
def grouped_bar(categories: list, groups: dict, title: str = "",
                ylabel: str = "", palette: dict = None, output: str = "grouped_bar.png"):
    """
    groups: {"Product A": [10, 20, 30], "Product B": [15, 25, 35]}
    """
    p = palette or make_chart_palette("#5B8DB8")
    fig, ax = plt.subplots(figsize=(10, 6))

    x = np.arange(len(categories))
    n = len(groups)
    width = 0.8 / n

    for i, (name, vals) in enumerate(groups.items()):
        offset = (i - n / 2 + 0.5) * width
        bars = ax.bar(x + offset, vals, width, label=name, color=p["series"][i % len(p["series"])])

    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontproperties=ZH_FONT, fontsize=10)
    ax.legend(prop=ZH_FONT, frameon=False)
    if title:
        ax.set_title(title, fontproperties=ZH_FONT, fontsize=14, pad=15)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.3)

    return save_chart(fig, output)
```

## Template 2: Line Chart

```python
def line_chart(x_data: list, series: dict, title: str = "",
               xlabel: str = "", ylabel: str = "", palette: dict = None,
               output: str = "line.png"):
    """
    series: {"Revenue": [100, 120, 150, 180], "Cost": [80, 90, 100, 110]}
    """
    p = palette or make_chart_palette("#5B8DB8")
    fig, ax = plt.subplots(figsize=(10, 6))

    for i, (name, values) in enumerate(series.items()):
        color = p["series"][i % len(p["series"])]
        ax.plot(x_data, values, marker="o", markersize=5, linewidth=2,
                label=name, color=color)

    if title:
        ax.set_title(title, fontproperties=ZH_FONT, fontsize=14, pad=15)
    if xlabel:
        ax.set_xlabel(xlabel, fontproperties=ZH_FONT, fontsize=11)
    if ylabel:
        ax.set_ylabel(ylabel, fontproperties=ZH_FONT, fontsize=11)

    ax.legend(prop=ZH_FONT, frameon=False, loc="best")
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(True, alpha=0.3)

    if len(x_data) > 6:
        plt.xticks(rotation=45, ha="right")

    return save_chart(fig, output)
```

## Template 3: Pie Chart

```python
def pie_chart(labels: list, values: list, title: str = "",
              palette: dict = None, output: str = "pie.png"):
    """Pie chart — auto-merges slices below 3% into 'Other'"""
    p = palette or make_chart_palette("#5B8DB8")
    fig, ax = plt.subplots(figsize=(8, 8))

    # Merge slices below 3% into "Other"
    total = sum(values)
    merged_labels, merged_values = [], []
    other = 0
    for lbl, val in zip(labels, values):
        if val / total < 0.03:
            other += val
        else:
            merged_labels.append(lbl)
            merged_values.append(val)
    if other > 0:
        merged_labels.append("Other")
        merged_values.append(other)

    colors = p["series"][:len(merged_labels)]
    wedges, texts, autotexts = ax.pie(
        merged_values, labels=merged_labels, colors=colors,
        autopct="%1.1f%%", startangle=90, pctdistance=0.75,
        textprops={"fontproperties": ZH_FONT, "fontsize": 11}
    )

    for t in autotexts:
        t.set_fontsize(10)
        t.set_color("white")

    if title:
        ax.set_title(title, fontproperties=ZH_FONT, fontsize=14, pad=20)

    return save_chart(fig, output)
```

## Template 4: Box Plot

```python
def box_plot(data: dict, title: str = "", ylabel: str = "",
             palette: dict = None, output: str = "box.png"):
    """
    data: {"Class A": [78, 82, 91, ...], "Class B": [65, 70, 88, ...]}
    """
    p = palette or make_chart_palette("#5B8DB8")
    fig, ax = plt.subplots(figsize=(10, 6))

    labels = list(data.keys())
    values = list(data.values())

    bp = ax.boxplot(values, labels=labels, patch_artist=True, notch=False,
                    medianprops={"color": "white", "linewidth": 2})

    for i, patch in enumerate(bp["boxes"]):
        patch.set_facecolor(p["series"][i % len(p["series"])])
        patch.set_alpha(0.8)

    ax.set_xticklabels(labels, fontproperties=ZH_FONT, fontsize=11)
    if title:
        ax.set_title(title, fontproperties=ZH_FONT, fontsize=14, pad=15)
    if ylabel:
        ax.set_ylabel(ylabel, fontproperties=ZH_FONT, fontsize=11)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.3)

    return save_chart(fig, output)
```

## Template 5: Radar Chart

```python
def radar_chart(categories: list, series: dict, title: str = "",
                palette: dict = None, output: str = "radar.png"):
    """
    categories: ["Chinese", "Math", "English", "Physics", "Chemistry"]
    series: {"Student A": [85, 92, 78, 90, 88], "Student B": [75, 88, 92, 70, 85]}
    """
    p = palette or make_chart_palette("#5B8DB8")
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

    n = len(categories)
    angles = np.linspace(0, 2 * np.pi, n, endpoint=False).tolist()
    angles += angles[:1]  # close the polygon

    for i, (name, values) in enumerate(series.items()):
        vals = values + values[:1]  # close the polygon
        color = p["series"][i % len(p["series"])]
        ax.plot(angles, vals, linewidth=2, label=name, color=color)
        ax.fill(angles, vals, alpha=0.15, color=color)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontproperties=ZH_FONT, fontsize=11)
    ax.legend(prop=ZH_FONT, loc="upper right", bbox_to_anchor=(1.2, 1.1), frameon=False)

    if title:
        ax.set_title(title, fontproperties=ZH_FONT, fontsize=14, pad=25)

    return save_chart(fig, output)
```

## Template 6: Heatmap

```python
def heatmap(data: list, row_labels: list, col_labels: list, title: str = "",
            palette: dict = None, output: str = "heatmap.png"):
    """
    data: 2D array [[1,2,3],[4,5,6]]
    row_labels: ["Row 1", "Row 2"]
    col_labels: ["Col 1", "Col 2", "Col 3"]
    """
    fig, ax = plt.subplots(figsize=(max(8, len(col_labels) * 1.2), max(6, len(row_labels) * 0.8)))

    arr = np.array(data)
    im = ax.imshow(arr, cmap="YlOrRd", aspect="auto")

    ax.set_xticks(range(len(col_labels)))
    ax.set_yticks(range(len(row_labels)))
    ax.set_xticklabels(col_labels, fontproperties=ZH_FONT, fontsize=10)
    ax.set_yticklabels(row_labels, fontproperties=ZH_FONT, fontsize=10)

    # Value annotations
    for i in range(len(row_labels)):
        for j in range(len(col_labels)):
            val = arr[i, j]
            color = "white" if val > arr.max() * 0.7 else "black"
            ax.text(j, i, f"{val:.1f}", ha="center", va="center",
                    fontsize=10, color=color)

    fig.colorbar(im, ax=ax, shrink=0.8)
    if title:
        ax.set_title(title, fontproperties=ZH_FONT, fontsize=14, pad=15)

    return save_chart(fig, output)
```

## Embedding in Documents (MANDATORY — Preserve Aspect Ratio)

**⚠️ Core Rule: When embedding any chart image, you MUST read actual image dimensions to calculate displayHeight. NEVER hardcode both width and height.**

Pie and radar charts are square — mismatched width/height produces ellipses or diamonds.

```js
// ✅ Correct: read actual image dimensions
const chartBuffer = fs.readFileSync("bar.png");
const sizeOf = require("image-size");
const dims = sizeOf(chartBuffer);
const displayWidth = 500;
const displayHeight = Math.round(displayWidth * (dims.height / dims.width));

new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 100 },
  children: [
    new ImageRun({
      data: chartBuffer,
      transformation: { width: displayWidth, height: displayHeight },
      type: "png",
    }),
  ],
})
```

```js
// ❌ Wrong: hardcoded width and height (pie becomes ellipse, radar becomes diamond)
new ImageRun({
  data: chartBuffer,
  transformation: { width: 500, height: 350 },  // wrong ratio!
  type: "png",
})
```

```python
# ✅ Python (ReportLab) correct approach:
from PIL import Image as PILImage
from reportlab.platypus import Image
pil_img = PILImage.open('chart.png')
orig_w, orig_h = pil_img.size
target_width = 400  # pt
scale = target_width / orig_w
img = Image('chart.png', width=target_width, height=orig_h * scale)
```

## Chart Selection Guide

| Data Scenario | Recommended Chart | Template Function |
|---------------|-------------------|-------------------|
| Category comparison | Bar chart | `bar_chart()` |
| Multi-group comparison | Grouped bar | `grouped_bar()` |
| Trend over time | Line chart | `line_chart()` |
| Proportion/composition | Pie chart | `pie_chart()` |
| Distribution/spread | Box plot | `box_plot()` |
| Multi-dimensional assessment | Radar chart | `radar_chart()` |
| Matrix correlation | Heatmap | `heatmap()` |

## Quality Standards

1. **DPI**: Uniform 200 DPI (built into `save_chart`)
2. **Colors**: Derived from document palette.accent for style consistency
3. **CJK text**: Must configure SimHei font; otherwise renders as boxes
4. **Label overlap prevention**: Auto-rotate 45° when >6 x-axis labels
5. **Legend**: Move outside chart (`bbox_to_anchor`) when >4 series
6. **Grid**: Light gray dashed grid lines for readability
7. **Clean frames**: Remove top/right spines for modern minimalist look
8. **Aspect ratio (CRITICAL)**: Must use `image-size` (JS) or `PIL` (Python) to read actual image dimensions and calculate displayHeight proportionally. **Pie and radar charts are square — hardcoding non-1:1 ratio causes ellipse/diamond distortion.**
9. **Dimensions**: Default 10×6 inches, fits well within A4 page
