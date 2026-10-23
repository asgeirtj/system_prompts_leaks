# Scene: Advanced Operations

## When This Applies
Batch processing multiple files, handling very large datasets, data validation, conditional formatting, sheet protection, or other power-user features.

---

## Large File Handling (>100K rows)

### Read-Only Mode
```python
from openpyxl import load_workbook

# Memory-efficient reading — does NOT load entire file
wb = load_workbook('huge.xlsx', read_only=True)
ws = wb.active

for row in ws.iter_rows(min_row=2, values_only=True):
    process(row)  # Yields rows one at a time

wb.close()  # MUST close read-only workbooks
```

### Write-Only Mode
```python
from openpyxl import Workbook

wb = Workbook(write_only=True)
ws = wb.create_sheet()

# Write rows sequentially — cannot random-access cells
for data_row in large_dataset:
    ws.append(data_row)

wb.save('output.xlsx')
```

### Chunked Processing with pandas
```python
# Read in chunks
chunks = pd.read_excel('huge.xlsx', chunksize=10000)
# Note: chunksize only works with read_csv, not read_excel

# For Excel, read specific columns/rows
df = pd.read_excel('huge.xlsx',
    usecols=['A', 'C', 'E'],     # Only needed columns
    nrows=50000,                   # Limit rows
    dtype={'id': str}              # Prevent type inference overhead
)
```

---

## Batch Processing Multiple Files

```python
import os
import glob
import pandas as pd

# Collect all Excel files
files = glob.glob('data/*.xlsx')

# Method 1: Concatenate into one DataFrame
all_data = []
for f in files:
    df = pd.read_excel(f)
    df['source_file'] = os.path.basename(f)
    all_data.append(df)

combined = pd.concat(all_data, ignore_index=True)
combined.to_excel('combined.xlsx', index=False)

# Method 2: One sheet per file
wb = Workbook()
wb.remove(wb.active)  # Remove default sheet

for f in files:
    df = pd.read_excel(f)
    ws = wb.create_sheet(title=os.path.splitext(os.path.basename(f))[0][:31])
    for r in dataframe_to_rows(df, index=False, header=True):
        ws.append(r)

wb.save('all_files.xlsx')
```

---

## Data Validation (Dropdown Lists)

```python
from openpyxl.worksheet.datavalidation import DataValidation

# Dropdown list
dv = DataValidation(
    type="list",
    formula1='"High,Medium,Low"',
    allow_blank=True,
    showErrorMessage=True,
    errorTitle="Invalid",
    error="Please select High, Medium, or Low"
)
ws.add_data_validation(dv)
dv.add('D5:D100')  # Apply to range

# Number range validation
dv_num = DataValidation(
    type="whole",
    operator="between",
    formula1=1,
    formula2=100,
    errorTitle="Out of range",
    error="Enter a number between 1 and 100"
)
ws.add_data_validation(dv_num)
dv_num.add('E5:E100')

# Date validation
dv_date = DataValidation(
    type="date",
    operator="greaterThan",
    formula1="2024-01-01"
)
ws.add_data_validation(dv_date)
dv_date.add('F5:F100')
```

---

## Conditional Formatting

For full conditional formatting rules, color usage, and code examples → see **`engines/design.md §8`**.

Quick reference for advanced-only patterns (FormulaRule for row-level highlighting):

```python
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import PatternFill

# Formula-based: highlight entire row if status = "Overdue"
ws.conditional_formatting.add('B5:H100',
    FormulaRule(formula=['$G5="Overdue"'],
               fill=PatternFill('solid', fgColor='FFEBEE')))

# Note: Icon sets are NOT supported by openpyxl — use color fills instead
```

---

## Sheet Protection

```python
# Protect sheet (allow select + sort, prevent edits)
ws.protection.sheet = True
ws.protection.password = 'mypassword'
ws.protection.sort = True
ws.protection.autoFilter = True

# Unlock specific cells for user input
from openpyxl.styles import Protection
unlocked = Protection(locked=False)
for row in range(5, 101):
    ws.cell(row=row, column=4).protection = unlocked  # Column D is editable

# Protect workbook structure (prevent adding/deleting sheets)
wb.security.workbookPassword = 'structpass'
wb.security.lockStructure = True
```

---

## Named Ranges

```python
from openpyxl.workbook.defined_name import DefinedName

# Create named range
ref = f"'Data'!$B$5:$B$100"
defn = DefinedName('SalesData', attr_text=ref)
wb.defined_names.add(defn)

# Use in formulas
ws['H5'] = '=SUM(SalesData)'
```

---

## Auto-Filter & Sort

```python
# Apply auto-filter
ws.auto_filter.ref = 'B4:H100'

# Add filter criteria (for saved state — user can change in Excel)
ws.auto_filter.add_filter_column(0, ['Active', 'Pending'])

# Sort (openpyxl can set sort state, but actual reordering
# must be done in Python before writing)
df = df.sort_values(['Category', 'Revenue'], ascending=[True, False])
```

---

## Merged Cells

```python
# Merge cells
ws.merge_cells('B2:H2')  # Title spanning full width

# Write to merged range (write to top-left cell)
ws['B2'] = 'Report Title'

# Check existing merges before editing
for merge_range in ws.merged_cells.ranges:
    print(f"Merged: {merge_range}")

# Unmerge if needed
ws.unmerge_cells('B2:H2')
```

**Warning**: Never write to cells within a merged range except the top-left cell. This causes corruption.

---

## Performance Tips

| Technique | When | Impact |
|-----------|------|--------|
| `read_only=True` | Reading files >50K rows | ~10x less memory |
| `write_only=True` | Writing files >50K rows | ~5x faster |
| `usecols` parameter | Only need specific columns | Faster read |
| Avoid `ws.cell()` in tight loops | Use `ws.append()` instead | Faster write |
| Batch style application | Apply to ranges, not cell-by-cell | Faster formatting |
| `data_only=True` for analysis | Need values not formulas | Faster read |

---

## VBA Module Inspection

When working with `.xlsm` files, you can read and list VBA modules:

```python
from openpyxl import load_workbook
import zipfile
import os

def list_vba_modules(filepath):
    """List all VBA modules in an .xlsm file."""
    if not filepath.endswith(('.xlsm', '.xlsb')):
        return {"has_vba": False, "modules": []}

    modules = []
    try:
        with zipfile.ZipFile(filepath, 'r') as zf:
            vba_files = [f for f in zf.namelist() if f.startswith('xl/vbaProject')]
            if not vba_files:
                return {"has_vba": False, "modules": []}

            # Read with keep_vba to access vba_archive
            wb = load_workbook(filepath, keep_vba=True)
            if wb.vba_archive:
                for name in wb.vba_archive.namelist():
                    modules.append(name)
            wb.close()
    except Exception as e:
        return {"has_vba": False, "error": str(e)}

    return {"has_vba": True, "modules": modules}
```

Use this to inspect before editing — know what VBA exists before you touch the file.
