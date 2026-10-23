# Scene: Format Conversion

## When This Applies
User wants to convert between tabular file formats: CSV↔XLSX, JSON→XLSX, TSV→XLSX, PDF table→XLSX, or XLSX→CSV/JSON.

## Conversion Matrix

| From | To | Method |
|------|-----|--------|
| CSV/TSV → XLSX | pandas read → openpyxl write with formatting | Most common |
| JSON → XLSX | pandas json_normalize → openpyxl | Flatten nested structures |
| XLSX → CSV | pandas read_excel → to_csv | Simple export |
| XLSX → JSON | pandas read_excel → to_json | With orient parameter |
| PDF table → XLSX | pdfplumber/tabula extract → openpyxl | Needs table detection |
| Image table → XLSX | OCR → pandas → openpyxl | Last resort, error-prone |

## CSV/TSV → XLSX

```python
import pandas as pd
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows

# Read with encoding detection
df = pd.read_csv('input.csv', encoding='utf-8')
# Common encodings: utf-8, gbk, gb2312, latin-1, shift_jis

# Handle messy CSVs
df = pd.read_csv('input.csv',
    encoding='utf-8',
    sep=',',              # or '\t', ';', '|'
    skiprows=2,           # skip junk header rows
    na_values=['N/A', '-', ''],
    dtype=str,            # read everything as string first, convert later
    on_bad_lines='skip'   # skip malformed rows
)

# Convert types after reading
df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
df['date'] = pd.to_datetime(df['date'], errors='coerce')

# Write to Excel with formatting
wb = Workbook()
ws = wb.active

# Write data starting at B4 (with theme formatting)
for r_idx, row in enumerate(dataframe_to_rows(df, index=False, header=True), 4):
    for c_idx, value in enumerate(row, 2):
        ws.cell(row=r_idx, column=c_idx, value=value)

# Apply design tokens from engines/design.md
# ...

wb.save('output.xlsx')
```

## JSON → XLSX

```python
import pandas as pd
import json

# Flat JSON
df = pd.read_json('input.json')

# Nested JSON — flatten
with open('input.json') as f:
    data = json.load(f)

# If it's a list of objects
df = pd.json_normalize(data, max_level=2)

# If nested with specific record path
df = pd.json_normalize(data, record_path='items', meta=['id', 'name'])

# Write to Excel...
```

## XLSX → CSV/JSON

```python
# To CSV
df = pd.read_excel('input.xlsx', sheet_name='Data')
df.to_csv('output.csv', index=False, encoding='utf-8-sig')  # utf-8-sig for Excel compatibility

# To JSON
df.to_json('output.json', orient='records', force_ascii=False, indent=2)

# Multiple sheets → multiple CSVs
sheets = pd.read_excel('input.xlsx', sheet_name=None)
for name, df in sheets.items():
    df.to_csv(f'output_{name}.csv', index=False, encoding='utf-8-sig')
```

## PDF Table → XLSX

```python
# Method 1: pdfplumber (preferred for most PDFs)
import pdfplumber

tables = []
with pdfplumber.open('input.pdf') as pdf:
    for page in pdf.pages:
        page_tables = page.extract_tables()
        for table in page_tables:
            tables.extend(table)

# Clean and convert to DataFrame
df = pd.DataFrame(tables[1:], columns=tables[0])

# Method 2: tabula-py (Java-based, good for complex tables)
# import tabula
# dfs = tabula.read_pdf('input.pdf', pages='all', multiple_tables=True)
```

## Encoding Gotchas

| Scenario | Encoding | Tip |
|----------|----------|-----|
| Chinese data from Windows | `gbk` or `gb2312` | Try gbk first |
| Japanese data | `shift_jis` or `cp932` | |
| European data | `latin-1` or `cp1252` | |
| Excel-generated CSV | `utf-8-sig` (has BOM) | pandas handles automatically |
| Output CSV for Excel | Write with `utf-8-sig` | Prevents garbled Chinese in Excel |

## Quality Checks After Conversion

- [ ] Row count matches source
- [ ] No garbled characters (encoding correct)
- [ ] Numeric columns are numbers, not strings
- [ ] Dates are date objects, not text
- [ ] No blank rows/columns from source artifacts
- [ ] Headers are in the correct row
