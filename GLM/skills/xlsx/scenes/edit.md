# Scene: Edit Existing Spreadsheet

## When This Applies
User provides an existing .xlsx/.xlsm file and wants to modify it — fill data, fix formulas, beautify layout, add sheets, restructure.

## Core Principle: Preserve First

**Study the existing file before making ANY changes.** The original format, style, and conventions take absolute priority over default guidelines.

### VBA Preservation Rule
When opening `.xlsm` files, **always** use `keep_vba=True`:
```python
wb = load_workbook('file.xlsm', keep_vba=True)
# Edit data/formatting as usual
wb.save('output.xlsm')  # VBA modules preserved
```
**Never** save a `.xlsm` as `.xlsx` unless the user explicitly requests macro removal. This silently destroys all VBA code.

## Workflow

```
1. INSPECT   → Read the file, understand structure
2. PLAN      → Identify what to change vs what to preserve
3. OUTPUT    → By default save edits to a NEW sibling file (`<stem>_updated.xlsx`),
               never touch the input; overwrite in place ONLY if the user explicitly
               asks to edit their own file — then first copy it to `<stem>_backup.xlsx`
               next to it (never /tmp)
4. MODIFY    → Make targeted changes
5. QA        → recalc → audit → scan
6. VALIDATE  → validate → deliver
```

## Step 1: Inspect the File

### 1a. Structure Survey

```python
from openpyxl import load_workbook

# Read with formulas preserved
wb = load_workbook('input.xlsx')

# Survey structure
for name in wb.sheetnames:
    ws = wb[name]
    print(f"Sheet: {name}, Dimensions: {ws.dimensions}, "
          f"Rows: {ws.max_row}, Cols: {ws.max_column}")

# Check for existing styles
sample = ws['B4']
print(f"Font: {sample.font.name}, Size: {sample.font.size}, "
      f"Bold: {sample.font.bold}, Fill: {sample.fill.fgColor}")
```

Also run `python3 "$XLSX_SKILL_DIR/xlsx.py" inspect input.xlsx --pretty` for structured overview.

### 1b. Semantic Data Sampling (MANDATORY for merge/copy/aggregate operations)

**Don't just print headers — print actual data rows to understand column semantics:**

```python
# Sample first 5 data rows from each sheet
for name in wb.sheetnames:
    ws = wb[name]
    print(f"\n=== {name} ===")
    for row in range(1, min(6, ws.max_row + 1)):
        vals = []
        for col in range(1, ws.max_column + 1):
            v = ws.cell(row=row, column=col).value
            if v is not None:
                vals.append(f"{get_column_letter(col)}={v}")
        if vals:
            print(f"  Row {row}: {vals}")
```

### 1c. Cross-Sheet Column Semantic Mapping (MANDATORY before any merge/copy)

**⚠️ NEVER copy columns by position index alone when merging sheets.**

When two sheets have similar headers (e.g., both have columns A-V), the same column position may hold completely different data. Always:

1. Print sample data (not just headers) from both source and target sheets
2. For each column, identify the data type and value domain
3. Create an explicit column mapping dict before writing any data

```python
# Example: source sheet E column = amount, target sheet E column = type code
# → Do NOT copy source.E → target.E. Build semantic mapping first.
column_mapping = {
    'src_I': 'dst_E',   # amount → amount (different positions!)
    'src_E': 'dst_I',   # type → type
}
```

### 1d. Cell Value Normalization

Canonical implementation lives in **`templates/base.py → normalize_cell_value()`**.  
Referenced by `edit-patterns.md` and `quality/pipeline.md`.

```python
from base import normalize_cell_value
# normalize_cell_value(value) → None for blank/NBSP/ZWSP, otherwise original value
```

**Always use this when checking for empty cells** — `\xa0` (NBSP) looks blank but fails `is None`.

## Step 2: Match Existing Styles

When adding new cells/rows to a styled file, use **`copy_style()` from `templates/base.py`**:

```python
from base import copy_style

# copy_style(source_cell, target_cell)
# → copies font, fill, border, alignment, number_format
```

## Common Edit Operations

### Fill / Complete Data
```python
# Add data to empty cells while preserving existing formatting
for row in range(start, end + 1):
    cell = ws.cell(row=row, column=col)
    if cell.value is None:
        cell.value = new_value
        # Copy style from the cell above
        copy_style(ws.cell(row=row-1, column=col), cell)
```

### Insert Rows / Columns
```python
# Insert 3 rows at position 10
ws.insert_rows(10, amount=3)
# Note: formulas referencing rows below 10 will auto-adjust

# Insert column at position D
ws.insert_cols(4)
```

**Warning**: Inserting/deleting rows can break chart references and named ranges. Verify after insertion.

### Restructure Data
```python
# Move data from one layout to another
# Read all data first, then rewrite
data = []
for row in ws.iter_rows(min_row=2, values_only=True):
    data.append(row)

# Clear and rewrite in new structure
# ...
```

### Fix Formulas
```python
# Find cells with errors (after recalc)
wb_data = load_workbook('input.xlsx', data_only=True)
ws_data = wb_data.active

wb_formula = load_workbook('input.xlsx')
ws_formula = wb_formula.active

for row in ws_data.iter_rows():
    for cell in row:
        if isinstance(cell.value, str) and cell.value.startswith('#'):
            formula_cell = ws_formula[cell.coordinate]
            print(f"Error at {cell.coordinate}: {cell.value}, Formula: {formula_cell.value}")
```

## Format Beautification

When the user asks to "make it look better" or "format nicely":

→ **Load `engines/design.md`** and apply its complete styling system (tokens, fonts, layout, colors).

**But**: if the file already has a consistent style, enhance it rather than replacing it. Add what's missing (alignment, column widths, alternating fills) without changing existing colors or fonts. Use `copy_style()` (above) to match adjacent cells.

## ⚠️ Dangerous Operations

| Operation | Risk | Mitigation |
|-----------|------|-----------|
| `load_workbook(data_only=True)` then save | Formulas permanently lost | Never save after data_only read |
| Delete rows/cols with formula dependencies | #REF! errors | Run audit after deletion |
| Modify pivot table output with openpyxl | Corrupt pivotCache | Never — regenerate via xlsx.py pivot |
| Overwrite merged cells | Layout breaks | Check `ws.merged_cells.ranges` first |
| Manual row sort (swap row data) | Formulas still reference old row numbers | **Regenerate formula strings with target row number** (see Common Patterns → Sort with Formula Rewrite) |
| Write SUM formula → verify with data_only | Get `None` — formula not evaluated | Compute value in Python for verification; write computed value or use recalc |

---

## Common Patterns

For complex edit operations (grouping, sorting, block detection, merging, sequence fill, etc.):

→ **Always read `scenes/edit-patterns.md`** when working on edit tasks — it contains reusable code for grouping, sorting, block detection, merging, etc.

Available patterns: Block Detection, Pre-filter Null, Sort with Formula Rewrite, Group-Merge, Group-Max-Keep-Ties, Sequence Fill, Zero-as-Blank, Side-by-Side Table Detection.
