# Scene: Create New Spreadsheet

## When This Applies
User wants to create a new Excel file from scratch — a table, template, schedule, report, or any structured data output.

For financial models, also load `scenes/finance.md`.

## Workflow

```
1. PLAN     → Identify all sheets, their structure, formulas, cross-references
2. STYLE    → Load engines/design.md, apply default palette
3. BUILD    → Create workbook, write data/formulas/formatting per sheet
4. QA       → recalc → audit → scan → chart-verify (if charts)
5. PIVOT    → If needed, run pivot command LAST
6. VALIDATE → validate → exit 0 = deliver
```

## Layout & Styling

All layout rules (Canvas Origin B2, column widths, row heights, margins) and styling (title/header/data/totals) are defined in **`engines/design.md`** — the single source of truth. Do not duplicate here.

Quick reference for sheet structure:
```
Row 1:  [top margin]
Row 2:  Title (B2)
Row 3:  [spacer]
Row 4:  Column headers
Row 5+: Data rows
Last+1: Totals row
Last+3: Notes/sources
```

## Multi-Sheet Workbooks

### Cross-Sheet References
```python
# Reference another sheet
sheet['C5'] = "=Data!B10"

# Sheet names with spaces need quotes
sheet['C5'] = "='Sales Data'!B10"

# Green font for cross-sheet links (Finance theme)
sheet['C5'].font = Font(color="008000")
```

### Common Multi-Sheet Patterns
- **Data + Summary**: Raw data on Sheet1, formulas/charts on Summary
- **Monthly tabs**: Jan, Feb, Mar... + Annual Summary
- **Input + Output**: Assumptions sheet + Calculations sheet + Dashboard

## Template Patterns

### Simple Data Table
```python
wb = Workbook()
ws = wb.active
ws.title = "Data"

# Title + Headers + Data + Totals styling → see engines/design.md §11 Code Templates
# Only show formula logic here:

# Headers at B4
headers = ['Product', 'Q1', 'Q2', 'Q3', 'Q4', 'Total']
for col, h in enumerate(headers, 2):
    cell = ws.cell(row=4, column=col, value=h)

# Data rows starting at row 5
# ...

# Totals row
total_row = last_data_row + 1
ws.cell(row=total_row, column=2, value='Total')
for col in range(3, 7):  # Q1-Q4
    letter = get_column_letter(col)
    ws.cell(row=total_row, column=col).value = f'=SUM({letter}5:{letter}{last_data_row})'

# Grand total
ws.cell(row=total_row, column=7).value = f'=SUM(C{total_row}:F{total_row})'
```

### Schedule / Calendar
- Use merged cells for day headers
- Conditional formatting for weekends (light gray fill)
- Freeze panes: `ws.freeze_panes = 'C5'` (freeze header + left labels)

### Checklist / Tracker
- Checkbox column using data validation (`TRUE`/`FALSE`)
- Status column with conditional formatting (green/amber/red)
- Progress bar using data bar conditional formatting

## Freeze Panes & Print

```python
# Freeze headers (row 4) and label column (col B)
ws.freeze_panes = 'C5'  # Rows 1-4 and cols A-B stay visible

# Print setup
ws.page_setup.orientation = 'landscape'
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0
ws.print_area = 'B2:H50'
ws.print_title_rows = '4:4'  # Repeat header on each page
```
