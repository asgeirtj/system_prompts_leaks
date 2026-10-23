# Edit Patterns — Reusable Code for Complex Edit Operations

> This file is part of the edit scene. **Read it whenever you are working on an edit task** — it contains tested code patterns for grouping, sorting, block detection, merging, and other complex operations.

---

## Pattern: Block Detection

Data is often split into independent blocks separated by blank rows or keyword rows (e.g., TOTAL, Subtotal).

```python
def detect_blocks(ws, col=1, start_row=1, end_row=None,
                  separator='blank', keyword='TOTAL'):
    """
    Detect data block boundaries.
    separator: 'blank' (empty row) or 'keyword' (row containing keyword)
    Returns: list of (start_row, end_row) tuples
    """
    if end_row is None:
        end_row = ws.max_row
    blocks, block_start = [], None
    for row in range(start_row, end_row + 1):
        val = ws.cell(row=row, column=col).value
        is_blank = val is None or (isinstance(val, str) and val.strip() == '')
        is_kw = (separator == 'keyword' and
                 isinstance(val, str) and keyword in str(val).upper())
        if separator == 'blank':
            if not is_blank and block_start is None:
                block_start = row
            elif is_blank and block_start is not None:
                blocks.append((block_start, row - 1))
                block_start = None
        elif separator == 'keyword':
            if is_kw:
                if block_start:
                    blocks.append((block_start, row))
                    block_start = None
            elif not is_blank and block_start is None:
                block_start = row
    if block_start:
        blocks.append((block_start, end_row))
    return blocks
```

---

## Pattern: Pre-filter Null Rows

Before any groupby/aggregation, filter out rows where key columns are empty.

```python
def pre_filter_rows(ws, key_cols, start_row, end_row):
    """Return row numbers where ALL key columns are non-null."""
    return [row for row in range(start_row, end_row + 1)
            if all(normalize_cell_value(ws.cell(row=row, column=c).value) is not None
                   for c in key_cols)]
```

---

## Pattern: Sort with Formula Rewrite

When sorting rows by swapping data (not using `insert_rows`), formulas must be regenerated with new row numbers.

```python
def sort_block_with_formulas(ws, block_rows, sort_col, formula_templates,
                             descending=True):
    """
    Sort rows within a block, regenerating formulas.
    formula_templates: dict {col_index: '=B{row}+C{row}'}
    """
    # 1. Read all row data + compute sort key
    rows_data = []
    for r in block_rows:
        vals = {c: ws.cell(row=r, column=c).value for c in range(1, ws.max_column + 1)}
        rows_data.append(vals)
    rows_data.sort(key=lambda x: (x.get(sort_col) or 0), reverse=descending)

    # 2. Write back with new row numbers
    for i, rd in enumerate(rows_data):
        target = block_rows[i]
        for col, val in rd.items():
            if col in formula_templates:
                ws.cell(row=target, column=col).value = formula_templates[col].format(row=target)
            else:
                ws.cell(row=target, column=col).value = val
```

---

## Pattern: Group-Merge (Aggregate by Key)

Group rows by a key column. Take first-row values for some columns, sum for others.

```python
from collections import OrderedDict

def group_merge_rows(ws, key_col, start_row, end_row, first_cols, sum_cols):
    """
    Group by key_col, merge rows.
    first_cols: take value from first row in group
    sum_cols: sum values across group
    """
    groups = OrderedDict()
    for row in range(start_row, end_row + 1):
        key = normalize_cell_value(ws.cell(row=row, column=key_col).value)
        if key is None:
            continue
        if key not in groups:
            groups[key] = {
                'first': {c: ws.cell(row=row, column=c).value for c in first_cols},
                'sums': {c: 0.0 for c in sum_cols},
            }
        for c in sum_cols:
            v = normalize_cell_value(ws.cell(row=row, column=c).value)
            if v is not None:
                try:
                    groups[key]['sums'][c] += float(v)
                except (ValueError, TypeError):
                    pass
    return groups
```

---

## Pattern: Group-Max-Keep-Ties

Group by key, find max value per group, keep ALL rows that match the max (not just the first).

```python
from collections import defaultdict

def group_max_keep_ties(rows, key_func, value_func, filter_null=True):
    """
    Keep all rows with the maximum value per group (ties preserved).
    rows: list of row dicts or tuples
    key_func: row → group key
    value_func: row → comparable value (e.g., date)
    """
    groups = defaultdict(list)
    for row in rows:
        val = value_func(row)
        if filter_null and val is None:
            continue
        groups[key_func(row)].append(row)

    kept = []
    for key, group in groups.items():
        max_val = max(value_func(r) for r in group)
        kept.extend(r for r in group if value_func(r) == max_val)
    return kept
```

---

## Pattern: Sequence Fill (Smart Numbering)

Fill blank rows with "parent number + letter suffix" (e.g., 5 → 5a, 5b, ..., 5z, 5aa).

```python
import re

def get_letter_suffix(n):
    """0=a, 25=z, 26=aa, 27=ab..."""
    if n < 26:
        return chr(ord('a') + n)
    return chr(ord('a') + (n // 26) - 1) + chr(ord('a') + (n % 26))

def fill_sequential_labels(ws, col, start_row, end_row):
    last_base, blank_count = None, 0
    for row in range(start_row, end_row + 1):
        val = ws.cell(row=row, column=col).value
        if val is not None:
            m = re.match(r'^(\d+)', str(val))
            if m:
                last_base = m.group(1)
            blank_count = 0
        else:
            if last_base is not None:
                ws.cell(row=row, column=col).value = f"{last_base}{get_letter_suffix(blank_count)}"
                blank_count += 1
```

---

## Pattern: Zero-as-Blank Output

When merged/aggregated values of 0 should display as empty:

```python
# Method 1: Write None (best for programmatic verification)
cell.value = computed_value if computed_value != 0 else None

# Method 2: Number format (best for Excel viewing)
cell.value = computed_value
cell.number_format = '0.00;-0.00;""'  # positive;negative;zero(blank)
```

---

## Pattern: Side-by-Side Table Detection

Some sheets contain multiple independent tables arranged horizontally (separated by empty columns).

```python
def detect_side_by_side_tables(ws):
    """Find column groups separated by all-null columns."""
    tables = []
    current_start = None
    for col in range(1, ws.max_column + 1):
        has_data = any(ws.cell(row=r, column=col).value is not None
                       for r in range(1, ws.max_row + 1))
        if has_data and current_start is None:
            current_start = col
        elif not has_data and current_start is not None:
            tables.append((current_start, col - 1))
            current_start = None
    if current_start:
        tables.append((current_start, ws.max_column))
    return tables  # [(start_col, end_col), ...]
```
