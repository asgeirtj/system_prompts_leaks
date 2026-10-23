# Finance Lite — Simple Budget & Expense Guide

Load this reference for: simple budgets, expense reports, fee tracking, cost summaries, revenue/expense comparison, personal finance, project cost tracking — any financial table that does **NOT** need DCF, LBO, three-statement linkage, sensitivity analysis, or IB-grade formatting.

For complex financial models → use `scenes/finance.md` instead.

Also load `engines/design.md` for styling (use **standard** design tokens, NOT IB overrides).

---

## When to Use finance_lite vs finance

| Signal | finance_lite ✅ | finance.md ❌ |
|--------|----------------|--------------|
| 预算表 / budget | ✅ | |
| 费用报表 / expense report | ✅ | |
| 项目成本追踪 / project cost tracking | ✅ | |
| 收支对比 / revenue vs cost | ✅ | |
| 个人记账 / personal finance | ✅ | |
| 简单 ROI 计算 / simple ROI calculation | ✅ | |
| DCF / LBO / 估值模型 (valuation model) | | ✅ |
| 三表联动 (P&L + BS + CF) | | ✅ |
| 敏感性分析 / scenario table | | ✅ |
| IB pitch book level formatting | | ✅ |

---

## Standard Sheet Structure

```
Sheet: "Budget" (or user-specified name)
  Row 1: margin (whitespace)
  Row 2: Title (merged, styled via setup_sheet())
  Row 3: spacer
  Row 4: Headers
  Row 5+: Data rows
  Last row: Totals (if applicable)
```

### Typical Column Patterns

**Budget Table:**
```
Category (类别) | Budget Amount (预算金额) | Actual Amount (实际金额) | Variance (差异) | Variance Rate (差异率) | Notes (备注)
```

**Expense Report:**
```
Date (日期) | Category (类别) | Description (说明) | Amount (金额) | Claimant (报销人) | Status (状态)
```

**Revenue vs Cost:**
```
Month (月份) | Revenue (收入) | Cost (成本) | Gross Profit (毛利) | Gross Margin (毛利率)
```

**Project Cost:**
```
Phase (阶段) | Task (任务) | Budget (预算) | Used (已用) | Remaining (剩余) | Usage Rate (使用率) | Status (状态)
```

---

## Formula Patterns

```python
# Variance
cell.value = '=C{r}-B{r}'  # Actual - Budget

# Variance percentage (safe division)
cell.value = '=IFERROR((C{r}-B{r})/B{r},0)'

# Running total
cell.value = '=SUM(D$5:D{r})'

# Gross margin
cell.value = '=IFERROR((B{r}-C{r})/B{r},0)'

# Status formula (simple threshold)
cell.value = '=IF(F{r}>1,"Over Budget",IF(F{r}>0.9,"At Risk","On Track"))'

# Subtotal
cell.value = '=SUBTOTAL(9,D{start}:D{end})'

# Grand total
cell.value = '=SUM(D5:D{last_data_row})'
```

---

## Number Formats

Use standard formats from `templates/base.py`:

```python
from templates.base import FORMATS

cell.number_format = FORMATS['currency_cny']  # ¥#,##0.00
cell.number_format = FORMATS['percentage']     # 0.0%
cell.number_format = FORMATS['integer']        # #,##0
cell.number_format = FORMATS['date']           # YYYY-MM-DD
```

For budget-specific formatting (negatives in parentheses):
```python
BUDGET_FORMATS = {
    'currency':    '¥#,##0.00;(¥#,##0.00);"-"',
    'variance':    '#,##0.00;(#,##0.00);"-"',
    'var_pct':     '0.0%;(0.0%);"-"',
}
```

---

## Styling

Use **standard** design tokens (NOT IB overrides):

```python
from templates.base import (
    setup_sheet, style_header_row, style_data_row, style_total_row,
    FONT_NAME, HEADER_BOLD, PRIMARY, ACCENT_POSITIVE, ACCENT_NEGATIVE, ACCENT_WARNING,
    font_body, font_header, fill_header,
)

# Setup
setup_sheet(ws, title="2026年部门预算", last_col=7)

# Headers at row 4
style_header_row(ws, row_num=4, col_start=2, col_end=7)

# Data rows
for i, row_num in enumerate(range(5, last_row + 1)):
    style_data_row(ws, row_num=row_num, col_start=2, col_end=7, row_index=i)

# Totals
style_total_row(ws, row_num=last_row + 1, col_start=2, col_end=7)
```

---

## Conditional Formatting (Simple)

```python
from openpyxl.formatting.rule import CellIsRule
from templates.base import CF_POSITIVE_FONT, CF_POSITIVE_FILL, CF_NEGATIVE_FONT, CF_NEGATIVE_FILL

# Highlight positive variance (green)
ws.conditional_formatting.add(
    f'D5:D{last_row}',
    CellIsRule(operator='greaterThan', formula=['0'],
               font=CF_POSITIVE_FONT, fill=CF_POSITIVE_FILL)
)

# Highlight negative variance (red)
ws.conditional_formatting.add(
    f'D5:D{last_row}',
    CellIsRule(operator='lessThan', formula=['0'],
               font=CF_NEGATIVE_FONT, fill=CF_NEGATIVE_FILL)
)
```

---

## Quick Templates

### Template: Monthly Budget

```python
headers = ["类别", "预算金额", "实际金额", "差异", "差异率", "状态"]
# Variance = Actual - Budget
# Var% = IFERROR((Actual-Budget)/Budget, 0)
# Status = IF(Var%>0.1,"超支"(Over Budget),IF(Var%>0,"注意"(Watch),"正常"(Normal)))
```

### Template: Expense Report

```python
headers = ["日期", "类别", "说明", "金额", "报销人", "状态"]
# Date format: YYYY-MM-DD
# Amount: currency_cny
# Status: dropdown validation ["待审批"(Pending),"已审批"(Approved),"已报销"(Reimbursed),"已拒绝"(Rejected)]
```

### Template: Project Cost Tracker

```python
headers = ["阶段", "任务", "预算", "已用", "剩余", "使用率", "状态"]
# Remaining = Budget - Used
# Usage% = IFERROR(Used/Budget, 0)
# Status = IF(Usage%>1,"超支"(Over Budget),IF(Usage%>0.9,"预警"(Warning),"正常"(Normal)))
```
