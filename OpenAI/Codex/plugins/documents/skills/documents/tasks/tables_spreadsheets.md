# Task: Tables ↔ spreadsheets (import/export)

## Goal
Move tabular data between Excel and Word reliably, without hand-copying.

## Import XLSX → DOCX table (simple)
Use the helper to convert a sheet into a Word table:

```bash
python scripts/xlsx_to_docx_table.py /mnt/data/input.xlsx /mnt/data/table.docx --title "Table: Results"
```

What it preserves (best-effort)
- cell values (data_only)
- basic alignment (left/center/right)
- header rows as bold
- column widths (heuristic)

What it does **not** preserve
- merged cells, formulas, charts, conditional formatting, complex number formats

## Export DOCX table → CSV

```bash
python scripts/docx_table_to_csv.py /mnt/data/input.docx --table_index 0 --out /mnt/data/table0.csv
```

## Render → PNG review checklist (tables)
- Table fits within margins (no clipped columns)
- Header row is visually distinct
- Numbers align consistently (esp. decimals)
- No unexpected wrapping that hurts readability

## Common pitfalls
- Word tables do not auto-match Excel column widths; you must verify visually.
- Multi-line cells and merged cells round-trip poorly.
