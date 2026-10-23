# Chart Templates — Implementation Code

> This file contains chart implementation code. **Read it together with `engines/chart.md`** whenever the task involves charts.

---

## Native Excel Charts (openpyxl.chart)

### Bar Chart
```python
from openpyxl.chart import BarChart, Reference
from templates.base import make_chart_title

chart = BarChart()
chart.type = "col"
chart.title = make_chart_title("Revenue by Product", 14)
chart.y_axis.title = make_chart_title("Revenue ($)", 10, bold=False, axis=True)
chart.x_axis.title = make_chart_title("Product", 10, bold=False)

data = Reference(ws, min_col=3, min_row=4, max_col=3, max_row=last_row)
cats = Reference(ws, min_col=2, min_row=5, max_row=last_row)

chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
chart.shape = 4
chart.width = 18
chart.height = 10

ws.add_chart(chart, "J4")
```

### Line Chart
```python
from openpyxl.chart import LineChart, Reference
from templates.base import make_chart_title

chart = LineChart()
chart.title = make_chart_title("Monthly Trend", 14)
chart.y_axis.title = make_chart_title("Amount", 10, bold=False, axis=True)
chart.style = 10

data = Reference(ws, min_col=3, max_col=5, min_row=4, max_row=last_row)
cats = Reference(ws, min_col=2, min_row=5, max_row=last_row)

chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
for series in chart.series:
    series.smooth = True

ws.add_chart(chart, "J4")
```

### Pie Chart
```python
from openpyxl.chart import PieChart, Reference
from openpyxl.chart.label import DataLabelList
from templates.base import make_chart_title

chart = PieChart()
chart.title = make_chart_title("Market Share", 14)

data = Reference(ws, min_col=3, min_row=4, max_row=last_row)
cats = Reference(ws, min_col=2, min_row=5, max_row=last_row)

chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)

chart.dataLabels = DataLabelList()
chart.dataLabels.dLblPos = 'bestFit'
chart.dataLabels.showLeaderLines = True
chart.dataLabels.showCatName = True
chart.dataLabels.showPercent = True
chart.dataLabels.showVal = False

ws.add_chart(chart, "J4")
```

### Combo Chart (Bar + Line, dual axis)
```python
from openpyxl.chart import BarChart, LineChart, Reference
from templates.base import make_chart_title

bar = BarChart()
bar.add_data(Reference(ws, min_col=2, max_col=2, min_row=1, max_row=10), titles_from_data=True)
bar.title = make_chart_title("Revenue vs Growth", 14)
bar.y_axis.title = make_chart_title("Revenue ($)", 10, bold=False, axis=True)

line = LineChart()
line.add_data(Reference(ws, min_col=3, max_col=3, min_row=1, max_row=10), titles_from_data=True)
line.y_axis.title = make_chart_title("Growth %", 10, bold=False, axis=True)
line.y_axis.axId = 200

bar += line
ws.add_chart(bar, "E2")
```

---

## Matplotlib Charts (embedded as images)

### Chinese Font Setup
```python
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

fm.fontManager.addfont('/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf')
fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
# Noto Sans SC for Chinese, DejaVu Sans catches symbols Noto Sans SC lacks (²³♠ etc.)
plt.rcParams['font.sans-serif'] = ['Noto Sans SC', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False
```

### Standard Template
```python
fig, ax = plt.subplots(figsize=(10, 6))
ax.bar(categories, values, color='#4A90D9')
ax.set_title('Chart Title', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('X Label', fontsize=11)
ax.set_ylabel('Y Label', fontsize=11)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.tick_params(axis='x', rotation=45)
fig.tight_layout(pad=2.0)
plt.legend(loc='best', fontsize='small')
fig.savefig('chart.png', dpi=150, bbox_inches='tight', facecolor='white')
plt.close()
```

### Embed in Excel (preserving aspect ratio)
```python
from openpyxl.drawing.image import Image as XlImage
from PIL import Image as PILImage

pil_img = PILImage.open('chart.png')
orig_w, orig_h = pil_img.size
target_w = 600
scale = target_w / orig_w

xl_img = XlImage('chart.png')
xl_img.width = target_w
xl_img.height = int(orig_h * scale)

ws.add_image(xl_img, 'B20')
```

### Smart Chart Recommend Function
```python
def recommend_chart(df, x_col, y_cols):
    if pd.api.types.is_datetime64_any_dtype(df[x_col]):
        return "line"
    n_categories = df[x_col].nunique()
    n_series = len(y_cols)
    if n_series == 1:
        vals = df[y_cols[0]]
        if vals.sum() > 95 and vals.sum() < 105:
            return "pie" if n_categories <= 5 else "bar_horizontal"
    if n_categories <= 6:
        return "bar_grouped" if n_series > 1 else "bar"
    elif n_categories <= 15:
        return "bar_horizontal"
    else:
        return "bar_top10"
```
