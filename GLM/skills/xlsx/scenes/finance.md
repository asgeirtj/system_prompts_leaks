# Financial Model Specialist Guide

Load this reference when the task involves: financial statements, budgets, forecasts, DCF models, LBO, valuation, P&L, balance sheets, cash flow, or any investment banking deliverable.

Also load `engines/design.md` → use **Finance** scene overrides (IB text color rules, section dividers).

---

## Financial Model Architecture

### Standard Sheet Structure
```
Assumptions Sheet:
  - All inputs, growth rates, margins, multiples
  - Blue font for every changeable number
  - Yellow background for key assumptions
  - Source citations in adjacent cells or comments

Income Statement / P&L:
  - Revenue → COGS → Gross Profit → OpEx → EBIT → Interest → Tax → Net Income
  - All values are formulas referencing Assumptions

Balance Sheet:
  - Assets = Liabilities + Equity (must balance!)
  - Include balance check row: =Assets-Liabilities-Equity (should be 0)

Cash Flow Statement:
  - Operating → Investing → Financing → Net Change
  - Ending Cash = Beginning Cash + Net Change

Valuation / Output:
  - DCF, comparables, or whatever model the user needs
  - Green font for values pulled from other sheets
```

### Formula Construction Rules

```python
# ✅ CORRECT: Reference assumptions
sheet['C10'] = '=C9*(1+Assumptions!$B$5)'  # Growth rate from assumptions

# ❌ WRONG: Hardcoded magic number
sheet['C10'] = '=C9*1.05'

# ✅ CORRECT: Protected division
sheet['D15'] = '=IF(C15=0,"-",B15/C15)'

# ✅ CORRECT: Consistent formula across periods
# If D10 = '=D9*(1+Assumptions!$B$5)' then E10 must follow the same pattern
```

### Assumptions Sheet Layout
```
B4: "Key Assumptions"           (section header, bold)
B6: "Revenue Growth Rate"       C6: 0.05    (blue font, yellow bg)
B7: "Gross Margin"              C7: 0.65    (blue font, yellow bg)
B8: "OpEx as % Revenue"         C8: 0.30    (blue font, yellow bg)
B9: "Tax Rate"                  C9: 0.21    (blue font, yellow bg)
B10: "Discount Rate (WACC)"     C10: 0.10   (blue font, yellow bg)
B11: "Terminal Growth Rate"     C11: 0.02   (blue font, yellow bg)
```

### Source Documentation for Hardcodes

Every hardcoded input MUST have a source citation:

```python
# In cell comment
ws['C6'].comment = Comment(
    "Source: Company 10-K, FY2024, Page 45, Revenue Growth",
    "Z.ai"
)

# Or in adjacent cell (if end of table)
ws['D6'] = "Source: Management guidance, Q3 2024 earnings call"
ws['D6'].font = Font(size=8, italic=True, color="808080")
```

---

## Number Formatting (CRITICAL)

> Finance-specific formats below. For general number formats, see `engines/design.md §10`.  
> Finance formats take priority when both apply.

```python
FINANCE_FORMATS = {
    # Currency — zeros as dash, negatives in parentheses
    'currency': '$#,##0;($#,##0);"-"',
    'currency_k': '$#,##0,"K";($#,##0,"K");"-"',
    'currency_mm': '$#,##0.0,,"M";($#,##0.0,,"M");"-"',

    # Percentages — one decimal
    'pct': '0.0%;(0.0%);"-"',

    # Multiples — for EV/EBITDA, P/E etc.
    'multiple': '0.0"x";(0.0"x");"-"',

    # Years — MUST be text, not number (avoids "2,024")
    'year': '@',

    # Integer with thousands separator
    'integer': '#,##0;(#,##0);"-"',

    # Two decimal places
    'decimal': '#,##0.00;(#,##0.00);"-"',

    # Shares (millions)
    'shares': '#,##0.0,,"M"',
}

# Apply
cell.number_format = FINANCE_FORMATS['currency_mm']
```

**Always specify units in column headers**: "Revenue ($mm)", "Shares (M)", "Growth (%)"

---

## IB Model Layout Rules

> All colors below use **design tokens from `engines/design.md`**. Do not hardcode hex values.  
> Finance-specific overrides (IB text color rules, section dividers) are in `design.md §2.4`.

### Section Headers
```python
# Dark background, white bold text, merged across data width
# Uses PRIMARY from design.md (or Finance palette PRIMARY from design.md)
ws.merge_cells('B10:H10')
ws['B10'] = 'Income Statement'
ws['B10'].fill = PatternFill('solid', fgColor=PRIMARY)
ws['B10'].font = Font(name=FONT_NAME, size=12, bold=HEADER_BOLD, color='FFFFFF')
```

### Data Alignment
- Column labels (years, quarters): **right-aligned**
- Row labels (line items): **left-aligned**
- Submetrics: **indented** (add 2-3 spaces prefix)

```python
# Parent line item
ws['B12'] = 'Revenue'
ws['B12'].font = Font(name=FONT_NAME, bold=HEADER_BOLD)

# Sub line item (indented)
ws['B13'] = '   Product Revenue'
ws['B14'] = '   Service Revenue'
```

### Totals Formatting
```python
# Uses design tokens — see engines/design.md §6.3
total_border = Border(top=Side(style='thin', color=PRIMARY))
for col in range(3, 9):  # C through H
    cell = ws.cell(row=total_row, column=col)
    cell.font = Font(name=FONT_NAME, bold=HEADER_BOLD)
    cell.border = total_border
```

### Grid Lines
```python
ws.sheet_view.showGridLines = False  # Standard — defined in design.md §7.3
```

---

## Balance Check Pattern

For any financial model with a balance sheet:

```python
# Balance check row (should always be 0)
check_row = bs_end + 2
ws.cell(row=check_row, column=2, value='Balance Check')
for col in range(3, last_col + 1):
    letter = get_column_letter(col)
    ws.cell(row=check_row, column=col).value = \
        f'={letter}{assets_total_row}-{letter}{liab_total_row}-{letter}{equity_total_row}'
    # Conditional: red if not zero
    ws.conditional_formatting.add(
        f'{letter}{check_row}',
        CellIsRule(operator='notEqual', formula=['0'],
                   font=Font(color='FF0000', bold=True))
    )
```

---

## Sensitivity / Scenario Tables

```python
# Two-way data table: vary growth rate (rows) × discount rate (cols)
# Row headers: growth rates
growth_rates = [0.02, 0.03, 0.04, 0.05, 0.06]
# Col headers: discount rates
discount_rates = [0.08, 0.09, 0.10, 0.11, 0.12]

# Write headers
for i, g in enumerate(growth_rates):
    ws.cell(row=start_row + i + 1, column=start_col, value=g)
    ws.cell(row=start_row + i + 1, column=start_col).number_format = '0.0%'
    ws.cell(row=start_row + i + 1, column=start_col).font = Font(color='0000FF')

for j, d in enumerate(discount_rates):
    ws.cell(row=start_row, column=start_col + j + 1, value=d)
    ws.cell(row=start_row, column=start_col + j + 1).number_format = '0.0%'
    ws.cell(row=start_row, column=start_col + j + 1).font = Font(color='0000FF')

# Fill formulas for each combination
# Yellow background for the cell matching base case assumptions
```

---

## Projection Period Patterns

```python
# Historical + Projected columns
years = ['FY2022', 'FY2023', 'FY2024', 'FY2025E', 'FY2026E', 'FY2027E']

for i, year in enumerate(years):
    col = start_col + i
    cell = ws.cell(row=header_row, column=col, value=year)
    cell.font = Font(name=FONT_NAME, bold=HEADER_BOLD)
    cell.alignment = Alignment(horizontal='center')

    # Visual separator between historical and projected
    if year.endswith('E') and not years[i-1].endswith('E'):
        # Add left border to mark transition
        for row in range(header_row, last_row + 1):
            ws.cell(row=row, column=col).border = Border(
                left=Side(style='medium', color=PRIMARY))
```

---

## Additional Model Templates

### Template: P&L (Profit & Loss) Statement

```
Sheet: "P&L"
  Row 1: Company Name + Period
  Row 3: Headers (Month/Quarter columns)

  Revenue Section:
    Product Revenue     =Assumptions!B5 * (1+Assumptions!C5)
    Service Revenue     =Assumptions!B6 * (1+Assumptions!C6)
    Total Revenue       =SUM(above)

  COGS Section:
    Direct Costs        =Total_Revenue * Assumptions!gross_margin
    Gross Profit        =Total_Revenue - Direct_Costs
    Gross Margin %      =IFERROR(Gross_Profit/Total_Revenue, 0)

  OpEx Section:
    S&M, R&D, G&A       (each from Assumptions)
    Total OpEx          =SUM(S&M:G&A)
    EBITDA              =Gross_Profit - Total_OpEx
    EBITDA Margin %     =IFERROR(EBITDA/Total_Revenue, 0)

  Below the Line:
    D&A, Interest, Tax
    Net Income          =EBITDA - D&A - Interest - Tax
```

### Template: Budget vs Actual

```
Sheet: "Budget vs Actual"
  Columns: Category | Budget | Actual | Variance | Var %

  Key formulas:
    Variance     = =Actual - Budget
    Var %        = =IFERROR(Variance/Budget, 0)

  Conditional formatting:
    Var % > 0    → Green font (favorable)
    Var % < -10% → Red font + red fill (unfavorable)
    Var % -10~0  → Orange font (watch)

  Summary section:
    Total Budget    =SUM(Budget range)
    Total Actual    =SUM(Actual range)
    Overall Var %   =IFERROR((Total_Actual-Total_Budget)/Total_Budget, 0)
```

### Template: SaaS Metrics Dashboard

```
Sheet: "SaaS Metrics"
  KPIs (each with formula, not hardcoded):
    MRR              =SUMPRODUCT(Users * ARPU)
    ARR              =MRR * 12
    Net Revenue Retention = =IFERROR((Starting_MRR + Expansion - Contraction - Churn) / Starting_MRR, 0)
    CAC              =IFERROR(Total_S&M / New_Customers, 0)
    LTV              =IFERROR(ARPU * Gross_Margin / Monthly_Churn_Rate, 0)
    LTV:CAC Ratio    =IFERROR(LTV / CAC, 0)
    Payback Months   =IFERROR(CAC / (ARPU * Gross_Margin), 0)

  Chart: MRR waterfall (starting → new → expansion → contraction → churn → ending)
  Chart: LTV:CAC trend line
```

### Template: Project Budget Tracker

```
Sheet: "Project Budget"
  Columns: Phase | Task | Planned Cost | Actual Cost | Remaining | % Spent | Status

  Key formulas:
    Remaining   = =Planned - Actual
    % Spent     = =IFERROR(Actual/Planned, 0)
    Status      = =IF(% Spent>1, "Over Budget", IF(% Spent>0.9, "At Risk", "On Track"))

  Phase subtotals with SUBTOTAL function
  Grand total row with project-level health indicator
```
