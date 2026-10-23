# Spreadsheet Integrity Pipeline

Every xlsx deliverable is built and verified through a role-based workflow. Three roles collaborate in sequence: **Blueprint Architect**, **Builder**, and **Inspector**. Each role has explicit responsibilities and handoff criteria.

---

## Tool Reference: xlsx.py

All commands: `python3 "$XLSX_SKILL_DIR/xlsx.py" <command> [arguments]`

| Command | Purpose | Called By |
|---------|---------|-----------|
| `recalc <file>` | Recalculate formulas via LibreOffice, scan for errors | Builder (self-check) |
| `audit <file>` | Deep formula error scan + zero-value + implicit array detection | Builder (self-check) |
| `scan <file>` | Detect out-of-range, header-included, small-aggregate, inconsistent patterns | Builder (self-check) |
| `inspect <file> --pretty` | Get sheet structure, data ranges, headers (JSON) | Blueprint Architect |
| `pivot <in> <out> --source --values [--rows --cols --filters --style --chart]` | Create PivotTable | Builder (final step only) |
| `chart-verify <file>` | Verify embedded charts have data | Builder (self-check) |
| `validate <file>` | Structural validation (release gate) | Inspector |

> 🔴 **`recalc` needs LibreOffice — if it is missing you MUST install it, not substitute it.**  
> Forbidden: skipping recalculation, or handing the workbook to the user's Excel/WPS/Numbers *instead  
> of* installing. A large download is **not** a reason to skip. Required: explain the necessity (it is  
> what actually recalculates the formulas so errors surface), say the package is large, then install  
> it — **preferred source is the Tsinghua TUNA mirror**  
> `https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/26.8.0/` (pick the  
> platform/arch subdirectory; if that version is gone, take the newest under  
> `.../libreoffice/stable/`), with `brew install --cask libreoffice` /  
> `sudo apt install libreoffice-core` / `winget install TheDocumentFoundation.LibreOffice` as  
> fallbacks. Only after an install attempt has **failed**  
> may you use another program, and you must report which verification steps were skipped.  
> **No install attempt = no substitute program.** After installing, **register `soffice` on `PATH`  
> and re-verify `soffice --version`** (per-OS commands: `env_setup/setup.md` → *"Register the binary  
> on PATH"*) — an install left off the search path reads as "not installed" next time and gets  
> reinstalled needlessly. See `env_setup/setup.md`.

---

## Role 1: Blueprint Architect

Before any code runs, the Architect produces a build plan:

- **Decompose the request**: separate explicit requirements from implicit business context
- **Map every sheet**: name, column structure, formula dependencies, cross-references
- **Identify data flow**: which sheets feed into which (source → derived → summary)
- **Flag ambiguity**: if the request is unclear, ask — don't guess

The Architect's output is a mental blueprint. No files are created yet.

---

## Role 2: Builder

The Builder writes code and produces the workbook. The Builder operates under a strict **single-sheet discipline**: complete one sheet fully, verify it, then move on.

### Build Cycle (per sheet)

```
┌─────────────────────────────────────────────┐
│  Write sheet (data, formulas, styling, charts)  │
│                    ↓                            │
│  Save workbook to disk                          │
│                    ↓                            │
│  Self-check chain:                              │
│    recalc → audit → scan                        │
│    + chart-verify (if sheet has charts)          │
│                    ↓                            │
│  All clear? ──Yes──→ Proceed to next sheet      │
│       │                                         │
│      No                                         │
│       ↓                                         │
│  Fix errors → re-save → re-run self-check       │
│  (loop until clean)                             │
└─────────────────────────────────────────────┘
```

### Builder Constraints

- **No batch-then-check**: you cannot create all sheets first and verify later. Errors in early sheets propagate silently into later sheets.
- **No error forwarding**: a sheet with unresolved errors blocks all subsequent work.
- **No silent delivery**: a file that hasn't passed self-check is not a deliverable — it's a draft.

### Pivot Tables — Special Sequencing

PivotTables depend on finalized source data. They are always the **last data operation**:

```bash
python3 "$XLSX_SKILL_DIR/xlsx.py" inspect input.xlsx --pretty   # understand structure
python3 "$XLSX_SKILL_DIR/xlsx.py" pivot input.xlsx output.xlsx \
    --source "Sheet!A1:F100" \
    --values "Revenue:sum,Units:count" \
    --rows "Product,Region" \
    --cols "Quarter" \
    --filters "Year" \
    --location "Summary!A3" \
    --style "finance" \
    --chart "bar"
```

Aggregations: `sum`, `count`, `average`/`avg`, `max`, `min`  
Chart types: `bar` (default), `line`, `pie`  
Styles: `monochrome` (default), `finance`

**Never modify pivot output with openpyxl afterward** — it corrupts the pivotCache.

---

## Role 3: Inspector

The Inspector runs after all sheets are built. Two levels of inspection: **Semantic** and **Structural**.

### Semantic Inspection (for edit/transform tasks)

When the task involves transforming existing data (not creating from scratch), verify the transformation didn't corrupt meaning:

| Check | Method |
|-------|--------|
| **Row count** | Does output have the expected number of rows? (e.g., grouping 15 rows by 5 keys → expect 5 rows) |
| **Column totals** | Do numeric sums in output match source? (or expected transformation) |
| **Spot-check** | Compare 2-3 specific rows between source and output |
| **Formula evaluability** | Can formulas be verified in Python? If self-referencing or cross-sheet, verify computed values instead |

```python
# Semantic verification template
source_total = sum(normalize_cell_value(ws_src.cell(row=r, column=c).value) or 0
                   for r in range(start, end + 1))
output_total = sum(normalize_cell_value(ws_out.cell(row=r, column=c).value) or 0
                   for r in range(out_start, out_end + 1))
assert abs(source_total - output_total) < 0.01, f"Total mismatch: {source_total} vs {output_total}"
```

### Structural Inspection (release gate)

```bash
python3 "$XLSX_SKILL_DIR/xlsx.py" validate output.xlsx
```

- Exit 0 → file is releasable
- Non-zero → Builder must regenerate from scratch with corrected code

---

## Known Traps & Countermeasures

These are recurring failure modes. The Builder must internalize them.

| Trap | What Goes Wrong | Countermeasure |
|------|----------------|----------------|
| `data_only=True` then save | Formulas permanently replaced with cached values | Never save after opening with `data_only=True` |
| Column index miscalculation | col 64 ≠ "BK" | Always use `openpyxl.utils.get_column_letter()` |
| Row offset confusion | DataFrame row 5 = Excel row 6 | Excel is 1-indexed, pandas is 0-indexed |
| NaN leaks into formulas | `=A1+nan` → broken formula string | Check `pd.notna()` before referencing |
| Cross-sheet reference typo | `Sheet1!A1` vs `'Sheet 1'!A1` | Quote sheet names containing spaces |
| Division by zero | `#DIV/0!` in Excel | Wrap with `IFERROR()` or `IF(denom=0,...)` |
| Text starting with `=` | `#NAME?` error | Prefix descriptive text with `'` |
| Implicit array formula | `#N/A` in Excel | Avoid `MATCH(TRUE(),range>0,0)`, use `SUMPRODUCT` |
| Chart renders blank | Formula cells have no cached values | Run `recalc` before creating charts |
| Hidden rows → empty chart | Chart skips hidden data | Set `chart.plot_visible_only = False` |
| Overlapping charts | Multiple charts stacked on same cells | Calculate anchor: ~15 rows per chart + 2 rows gap |
| Verify newly-written formulas with `data_only=True` → get `None` | openpyxl doesn't evaluate formulas; `data_only=True` only reads Excel's cached values which don't exist for new formulas | Compute expected values in Python and compare directly. For TOTAL rows needing verification, write computed values (see SKILL.md Design Principle #1 Exception) |
| Manual row sort breaks references | Value-swap sorting doesn't update formula references | After sorting by swapping data, regenerate all formula strings with updated row numbers |
| NBSP (`\xa0`) treated as non-empty | Cells containing `\xa0` or `\u200b` look blank but fail `is None` | Normalize: `\xa0`, `\u200b`, whitespace-only → `None` before comparison or aggregation |

---

## Cross-Validation Review Sheet

For analysis-heavy deliverables, embed a self-checking Review sheet in the workbook.

### When Required

- Deliverables with computed metrics or aggregated data
- Financial models with cross-sheet references
- Data sourced from external APIs or web searches

### Structure

```python
review_ws = wb.create_sheet("Review")
review_ws.sheet_properties.tabColor = "FFC000"  # amber tab

checks = [
    ["Check", "Expected", "Actual", "Status"],
    ["Total Revenue", "=SUM(Data!B2:B100)", "=Summary!B10", '=IF(B2=C2,"✓ PASS","✗ FAIL")'],
    ["Row Count", "=COUNTA(Data!A:A)-1", "=Summary!B3", '=IF(B3=C3,"✓ PASS","✗ FAIL")'],
    ["Grand Total Match", "=Detail!F50", "=Dashboard!C5", '=IF(B4=C4,"✓ PASS","✗ FAIL")'],
]
for i, row in enumerate(checks, 1):
    for j, val in enumerate(row, 1):
        review_ws.cell(row=i, column=j, value=val)
```

### Rules

- Every Summary/Dashboard metric must have a cross-check formula back to source data
- Status column uses live formulas — green if correct, red if mismatch
- Review is the **last sheet** in the workbook (before Sources, if present)

---

## Release Checklist

Before handing the file to the user:

- [ ] Every sheet passed the Builder's self-check chain
- [ ] Semantic inspection passed (if applicable)
- [ ] `validate` returned exit code 0
- [ ] `auto_fit_columns()` + `auto_fit_row_heights()` called on every data sheet (prevents text clipping)
- [ ] All temp files, drafts, and retry artifacts removed
- [ ] The user's original input file is untouched at its original path (unless the user explicitly asked for in-place editing); any backup you created stays next to it — these are NOT temp/retry artifacts
- [ ] If multiple versions exist from retries, only the latest correct version remains
- [ ] Every remaining file in the output directory is an expected deliverable
- [ ] **VBA check** (if `.xlsm`): VBA modules preserved, no unintended macro removal
- [ ] **VBA security** (if VBA generated): passes security checklist in `scenes/vba.md`
