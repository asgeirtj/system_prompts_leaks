# Finance Guidance

Use for financial planning, reporting, operating models and valuation. The main skill governs structure, formulas and verification; [shared style](../style_guidelines.md) governs general formatting.

## Financial Basis and Sources

Preserve reference drivers and schedules. Keep scope, accounting basis, inclusions/exclusions, periods, currency, scale and signs consistent. Distinguish revenue from collections, payroll expense from cash paid, capex from depreciation, and earnings from cash flow. Explain material differences and estimates; do not imply FX conversion or round stored values for display.

Follow [Citation Requirements](../SKILL.md#citation-requirements). Reconcile source controls before combining extracts or comparing versions. Use concise period/unit labels; do not add a redundant Units column.

## Periods, Assumptions and Scenarios

Use the source fiscal calendar, cutoff, horizon and grain. Use source actual/forecast labels. Use editable dated drivers even when flat. Keep inputs and commentary tied to absolute dates as horizons advance.

With monthly pay and no proration, $60,000 actual salary / 10 paid FTE implies $6,000/FTE. Forecast Base/Downside pay of $6,300/$6,000 with 11 paid FTE gives $69,300/$66,000; actual salary stays $60,000. Missing pay or zero FTE cannot establish an implied rate.

For refreshes, merge complete periods on business/date keys, preserving history and excluding overlaps. Do not roll headers over stationary inputs. Distinguish one-time adjustments from changes to the future run rate.

## Operating Schedules and Reporting

- Revenue: preserve volume, price, mix and recognition timing. Roll customers through additions/losses; average billable volume needs a timing assumption.
- Payroll: distinguish headcount, FTE and paid FTE. Use hire/exit dates and supported proration; convert annual pay but do not divide monthly pay by 12 again. Keep commission and employer-cost bases explicit; do not invent load rates or round away fractional FTE.
- Opex: distinguish units × rate, fixed fees and one-time adjustments. Seats need not equal headcount.
- Capital/D&A: use cost, residual value, in-service date, useful life and opening assets' remaining depreciation. Preserve partial periods and disposals; reconcile gross assets, accumulated depreciation and net assets. Bridge cash capex to additions and add back noncash D&A where appropriate.
- Statements: roll retained earnings using source accounting. Keep working capital, principal, interest and equity distinct; tie cash-flow ending cash to balance-sheet cash. Show needed debt/share schedules; never force a tie with unexplained plugs.
- Variances: compare matching periods and bases; show material monetary variance as amount and percent. Label expense over/under-budget and favorable/unfavorable direction. Missing/zero denominators are unavailable, not 0%. Reconcile driver bridges; align charts and requested commentary to the selected period/case.

## Valuation and Returns

Use the requested method/date; comps or LBO does not imply DCF. Keep metric periods, net debt and share counts consistent. A DCF shows operating drivers, taxes, D&A, capex, working-capital changes, unlevered cash flow, discounting, terminal value and the applicable enterprise-to-equity bridge. State terminal-value method and discount timing; label missing inputs.

IRR/XIRR requires valid cash-flow signs and timing; do not silently substitute another return.

For requested Excel financial-model sensitivities, default to native What-If Data Tables where supported; the user need not request them explicitly. Link to the model's actual inputs and calculated output instead of recreating model logic in the sensitivity grid. Verify the base case and representative non-base combinations against the model.

## Finance Presentation

Write titles, tab names, labels and commentary in plain business language. Do not use `movement`, `backbone`, `pressure point`, `pain point`, `pressure test`, `proof point` or `durable`, including plural and grammatical variants, in authored Finance text. Name the specific result, driver, variance, assumption or risk instead of substituting another vague or dramatic phrase. Preserve and attribute necessary source-defined labels and exact required quotations.

In working model areas, numeric editable inputs are blue, same-sheet formulas black, cross-sheet links green and external-file links red. On output views such as Summary, Exec Summary, Dashboard or Overview, results use black or dark brand text, including linked numbers. Preserve header contrast, editable-control cues and meaningful warning/status colors. Show the linked selected-case name in green, including on outputs; this exception does not turn output result rows green. Apply these conventions by section when working calculations and outputs share a tab; do not impose Finance formula colors on non-Finance operational trackers.

Use accounting formats: parenthesized negatives, dash zeros, one decimal for percentages, two for per-share prices, and enough precision for fractional FTE/scaled amounts. Currency symbols belong on main/first monetary rows, totals and ending balances across periods, not counts or rates. Keep numeric metric rows numeric: show a runway in months or `n.a.`, with explanations such as cash generation in a separate note. Avoid double-scaling. Indent supporting labels visibly with the text format `  @` (two leading display spaces), not stored spaces. Italicize percentage and ratio rows, including labels and values. Keep totals flush left.

For financial period headers, use these compact defaults unless user, locale or reference/template conventions specify otherwise. Full dates follow the main skill's locale-appropriate short-date rule.

| Period | Display format | Example |
| --- | --- | --- |
| Week start | `"Week of "d-mmm` on the first business day's date | `Week of 13-Jul` |
| Month | `mmm-yy` on a real date | `Jul-26` |
| Calendar year | `yyyy` for a stored date; retain a numeric year as a year | `2026` |

Use `Q#:YY` for Finance quarter labels, such as `Q3:26`, and `FY:YY` for fiscal years, such as `FY:26`. Derive both from the stated fiscal calendar and year-label convention. Do not invent either. Excel has no quarter number-format token, so calculate a quarter display label while preserving the underlying date/period. Use `2026` for a regular calendar year, not `FY:26`.

For new substantial models, use narrow A:B gutters and content from C; optional faint `x` section markers support navigation. Do not impose these gutters on raw data or compact calculators.

## Finance Audit and Verification

Reconcile financial schedules and bridges. For nonnegative flows, annual assumptions cannot imply a negative remainder after actuals. Follow [Checks and Audit](../SKILL.md#checks-and-audit). Show differences to two decimals, including `0.00`. Passing differences use neutral text even when cross-sheet formulas would normally be green. Use conditional light-red fill and bold red text above an absolute tolerance appropriate to the unit. Missing or untested checks are unavailable, not zero/PASS. Name failed reconciliations and source cells.
