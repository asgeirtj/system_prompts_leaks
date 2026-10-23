# Analyze Recipes — Code Patterns for Data Analysis

> This file is part of the analyze scene. **Read it whenever you are working on an analysis task** — it contains tested code patterns for aggregation, time series, comparison, cleaning, and bridge patterns.

---

## Load & Explore

```python
import pandas as pd

df = pd.read_excel('input.xlsx')  # or read_csv, read_json
# Multi-sheet: pd.read_excel('input.xlsx', sheet_name=None) → dict

print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(f"Dtypes:\n{df.dtypes}")
print(f"Nulls:\n{df.isnull().sum()}")
print(f"Duplicates: {df.duplicated().sum()}")
print(f"\nDescribe:\n{df.describe()}")
```

---

## Aggregation & Grouping

```python
summary = df.groupby('Category').agg(
    total=('Revenue', 'sum'),
    avg=('Revenue', 'mean'),
    count=('Revenue', 'count'),
    max_val=('Revenue', 'max')
).round(2)

pivot = df.pivot_table(
    values='Amount', index='Category', columns='Quarter',
    aggfunc='sum', margins=True
)
```

---

## Time Series

```python
df['date'] = pd.to_datetime(df['date'])
monthly = df.resample('M', on='date').agg({'revenue': 'sum', 'orders': 'count'})
monthly['growth'] = monthly['revenue'].pct_change()
monthly['rolling_3m'] = monthly['revenue'].rolling(3).mean()
```

---

## Comparison / Diff

```python
df1 = pd.read_excel('this_month.xlsx')
df2 = pd.read_excel('last_month.xlsx')
merged = df1.merge(df2, on='ID', suffixes=('_new', '_old'))
merged['change'] = merged['value_new'] - merged['value_old']
merged['change_pct'] = (merged['change'] / merged['value_old'] * 100).round(1)
```

---

## Statistical Analysis

```python
stats = df.describe().T
stats['median'] = df.median()
stats['skew'] = df.skew()
corr = df.select_dtypes(include='number').corr().round(3)
top_10 = df.nlargest(10, 'Revenue')
bottom_10 = df.nsmallest(10, 'Revenue')
```

---

## Data Cleaning

```python
df = df.drop_duplicates()
df['amount'] = df['amount'].fillna(0)
df['name'] = df['name'].fillna('Unknown')
df['date'] = pd.to_datetime(df['date'], errors='coerce')
df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

# Remove outliers (IQR)
Q1, Q3 = df['value'].quantile([0.25, 0.75])
IQR = Q3 - Q1
df = df[(df['value'] >= Q1 - 1.5*IQR) & (df['value'] <= Q3 + 1.5*IQR)]
```

---

## Bridge Pattern: pandas → openpyxl

```python
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows

wb = Workbook()
ws = wb.active
ws.title = "Analysis"

for r_idx, row in enumerate(dataframe_to_rows(summary, index=True, header=True), 1):
    for c_idx, value in enumerate(row, 1):
        ws.cell(row=r_idx + 3, column=c_idx + 1, value=value)
```

---

## KPI Summary Card

```python
kpis = [
    ('Total Revenue', total_revenue, '$#,##0'),
    ('Avg Order Value', avg_order, '$#,##0.00'),
    ('Growth Rate', growth_rate, '0.0%'),
    ('Total Orders', total_orders, '#,##0'),
]
col = 2
for label, value, fmt in kpis:
    ws.cell(row=3, column=col, value=label)
    ws.cell(row=4, column=col, value=value)
    ws.cell(row=4, column=col).number_format = fmt
    col += 3
```

---

## Cross-Validation Review Sheet

```python
review_ws = wb.create_sheet("Review")
review_ws.sheet_properties.tabColor = "FFC000"

checks = [
    ["Check", "Expected", "Actual", "Status"],
    ["Total Revenue", "=SUM(Data!B2:B100)", "=Summary!B10", '=IF(B2=C2,"✓ PASS","✗ FAIL")'],
    ["Row Count", "=COUNTA(Data!A:A)-1", "=Summary!B3", '=IF(B3=C3,"✓ PASS","✗ FAIL")'],
]
for i, row in enumerate(checks, 1):
    for j, val in enumerate(row, 1):
        review_ws.cell(row=i, column=j, value=val)
```

---

## xlsx.py Pivot Workflow

```bash
python3 "$XLSX_SKILL_DIR/xlsx.py" inspect data.xlsx --pretty
python3 "$XLSX_SKILL_DIR/xlsx.py" pivot data.xlsx output.xlsx \
    --source "Data!A1:F500" \
    --rows "Product,Region" \
    --values "Revenue:sum,Units:count" \
    --location "Summary!A3" \
    --style "finance" \
    --chart "bar"
python3 "$XLSX_SKILL_DIR/xlsx.py" validate output.xlsx
```

### PivotTable Best Practices
- Source data: first row must have unique, non-blank headers
- No merged cells or blank rows in source range
- Place pivot on a dedicated sheet, position at A3 or B2
- Row axis: primary grouping; Column axis: ≤10 distinct values
- Values: numeric measures only

### PivotTable Troubleshooting
| Symptom | Remedy |
|---------|--------|
| "Field not found" | Check header spelling via `inspect` |
| PivotTable empty | Ensure `--source` covers all data rows |
| `validate` reports pivot errors | Critical — must fix |
| `validate` reports `pass_with_warnings` | Safe to deliver |

---

## Alternating Column Structure (Key-Value Pairs)

When odd columns contain identifiers and even columns contain corresponding values (e.g., O=PartNo, P=Qty, Q=PartNo, R=Qty, ...):

**Detection heuristic**:
- Odd columns have repeated values or category codes
- Even columns are numeric
- Headers alternate between descriptive and quantitative names

**Solution**: Use SUMIF across the combined key/value ranges:

```python
# Excel formula: =SUMIF(O2:W2, A2, P2:X2)
# SUMIF matches position-by-position across multi-column ranges
formula = f'=SUMIF(O{row}:W{row},A{row},P{row}:X{row})'
```

---

## FIFO Allocation Formula (Cumulative Deduction)

Scenario: Allocate limited inventory to order lines in sequence — each row gets what's left after previous rows consumed their share.

**Formula template** (row N):
```
=MAX(0, MIN(OrderQty_N,
    TotalInventory_for_key - SUM_of_already_allocated_above))
```

**Example** (H column = allocated qty):
```python
# Row 2 (first row): allocate up to available inventory
f'=MIN(G2, SUMIFS(Sheet2!D:D, Sheet2!A:A, A2, Sheet2!B:B, D2))'

# Row 3+ (subsequent): subtract already-allocated from rows above
f'=MAX(0, MIN(G{r}, SUMIFS(Sheet2!D:D, Sheet2!A:A, A{r}, Sheet2!B:B, D{r})'
f'  - SUMIFS(H$1:H{r-1}, A$1:A{r-1}, A{r}, D$1:D{r-1}, D{r})))'
```

**Key**: `SUMIFS(H$1:H{r-1}, ...)` creates a running total of already-allocated amounts, achieving row-by-row deduction.

⚠️ This is a self-referencing formula pattern — openpyxl cannot verify it. Must open in Excel to confirm calculation.

### Data Provenance Implementation

```python
src_ws = wb.create_sheet("Sources")
src_ws.sheet_properties.tabColor = PRIMARY
headers = ["Data Description", "Source Name", "Source URL", "Access Date"]
for col, h in enumerate(headers, 1):
    cell = src_ws.cell(row=1, column=col, value=h)
    cell.font = Font(name=FONT_NAME, bold=HEADER_BOLD, color="FFFFFF")
    cell.fill = PatternFill(start_color=PRIMARY, end_color=PRIMARY, fill_type="solid")
```
