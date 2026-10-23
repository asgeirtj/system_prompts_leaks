# Scene: Data Analysis → Excel Output

## When This Applies
User wants to analyze data (statistics, trends, comparisons, pivots, aggregation) and receive results as an Excel file — possibly with charts, summary tables, or dashboards.

This scene bridges **pandas analysis** with **openpyxl output**. The deliverable is always an .xlsx file.

## Workflow

```
1. LOAD       → Read input data (CSV/XLSX/JSON/DB)
2. EXPLORE    → Understand structure, quality, distributions
3. ANALYZE    → Compute metrics, aggregations, statistical tests
4. DESIGN     → Plan Excel output (sheets, charts, KPIs)
5. BUILD      → Write analysis results to .xlsx with formatting
6. CHART      → Add charts (Excel-native or embedded matplotlib)
7. QA         → recalc → audit → scan → chart-verify
8. PIVOT      → If needed, run xlsx.py pivot as final step
9. VALIDATE   → validate → deliver
```

## Analysis Framework

### Phase A: Problem Framing
- What question is the user trying to answer?
- Who will consume this output? (executive summary vs. detailed analysis)
- What decisions will be made based on this data?

### Phase B: Data Quality Assessment
- Missing values: count, pattern (random vs. systematic)
- Outliers: statistical detection (IQR, z-score)
- Data types: numeric vs. categorical, date parsing
- Duplicates: exact and fuzzy

### Phase C: Exploratory Analysis
- Distributions: histograms, box plots for key variables
- Correlations: pairwise for numeric columns
- Segmentation: group-by analysis on categorical dimensions
- Time patterns: trends, seasonality if time-series data

### Phase D: Insight Extraction
- Rank findings by business impact, not statistical significance
- Each insight must be actionable — "so what?" test
- Cross-validate: check the same insight from a different angle

### Phase E: Cross-Validation
- Sanity check totals against known benchmarks
- Verify computed metrics with alternative formulas
- Document any assumptions or limitations in the output

**Industry-specific frameworks:**
- **Finance**: Variance analysis → trend decomposition → ratio analysis → peer comparison
- **Marketing**: Funnel analysis → cohort analysis → attribution → ROI calculation
- **Operations**: Throughput analysis → bottleneck identification → utilization rates → SLA compliance

---

## Multi-Sheet Report Layout

```
Sheet 1: "Dashboard"     — KPI cards + summary chart
Sheet 2: "Detail"        — Full analysis table with formatting
Sheet 3: "Charts"        — Additional visualizations
Sheet 4: "Raw Data"      — Original data for reference (tab color: gray)
```

### KPI Summary Card Pattern

Place 4-6 KPI metrics at the top of Dashboard sheet (row 3-4), each spaced 3 columns apart. Include label (small, gray) and value (large, bold, themed) with appropriate number format.

---

## PivotTable Decision

| Situation | Use |
|-----------|-----|
| Need interactive PivotTable in Excel | `"$XLSX_SKILL_DIR/xlsx.py" pivot` |
| Just need a summary table (static) | pandas `pivot_table` → openpyxl |
| Simple aggregation (1 dimension) | pandas `groupby` → openpyxl |

**Trigger phrases**: summarize, aggregate, group by, categorize, breakdown, distribution, tally, totals per, cross-tab, 汇总, 透视, 分类统计, 交叉分析

---

## Data Provenance

When analysis uses external data, create a **"Sources" sheet** (tab color: `PRIMARY`) with columns: Data Description | Source Name | Source URL | Access Date.

Skip when user provides all data directly.

---

## Code Recipes

When the analysis involves aggregation, time series, comparison, cleaning, or bridge patterns, **you MUST read `scenes/analyze-recipes.md`** before writing code. It contains tested code patterns — do not reinvent them from memory.
