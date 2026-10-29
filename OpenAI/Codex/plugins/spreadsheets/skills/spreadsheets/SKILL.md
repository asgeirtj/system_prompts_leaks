---
name: "Spreadsheets"
description: "Use skill when user requests to create, modify, analyze, visualize, or work with spreadsheet files (`.xlsx`, `.xls`, `.csv`, `.tsv`) or Google Sheets with formulas, formatting, charts, tables, and recalculation. Do not use for live controlling Microsoft Excel app or a live Excel session."
---

# Spreadsheets skill
Read entirely for spreadsheet creation, editing, analysis, or visualization.

## Decision Boundary
- Google Sheets targeted outputs also require `routing/google_sheets.md`. Otherwise, author local files with artifact tool.

## Important Instructions
- For new workbooks or authorized redesigns, plan the simplest correct workbook that meets the task, audience, actual data and domain. If formulas become hard to read, first reconsider whether the workbook's structure, layout, or logic is overcomplicated before simplifying individual formulas. Remove unnecessary or duplicated logic while preserving calculation correctness, required business relationships, and financial reconciliation
- Instruction precedence for workbook content, layout, and formatting is: user request > reference/template > domain defaults/conventions > general defaults.

## Tools + Contract Requirements
- Author the spreadsheet with `@oai/artifact-tool` JS and only `load_workspace_dependencies` executables/dependencies, never repo-local deps. If unavailable, check `~/.cache/codex-runtimes/codex-primary-runtime/dependencies/`. Never modify dependency directories.
- In a writable, conversation-specific or tmp directory, create a `node_modules` symlink or Windows junction to the loader `node_modules`.
- Prefer to patch/rerun one `.mjs` builder. No heredocs or duplicate builders.
- Use the provided API reference for supported syntax. Its examples do not set workbook structure, formatting or formula defaults. Do not inspect package internals or prototypes. If blocked, run at most one targeted `workbook.help("<api_or_feature>")` query.
- No `openpyxl`, `xlsxwriter`, or `pandas.ExcelWriter` authoring unless asked, or  `@oai/artifact-tool` is unavailable.
- Analyze with JS/formulas, else bundled Python (libraries) and JSON/CSV intermediates; other libraries only for missing capabilities.
- Use `update_plan` for complex work.
- In your final response, omit builders, previews, or other support files unless requested.
- Immediately before the first create/edit authoring command, run `mark_artifact_operation_started.mjs` successfully exactly once using the command below. Do not run it for read-only work. For edits, replace `create` with `edit`; adjust the expected count and output format to match the requested outputs.
  ```bash
  node container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format xlsx
  ```

## Spreadsheet (Workbook) Complexity: Workbook Structure & Formulas

Keep the workbook simple, especially for focused tasks. A focused task produces a simple analysis, report or tracker for a specific question or workflow. It needs one main output, supported by the necessary inputs and calculations. "Focused" describes the scope of the task, not the number of source records.

Design the structure and formulas together so a reader can follow the inputs, useful calculation steps and final answer. Put summaries and main outputs first, show the work behind them, and avoid tabs or formulas that only repeat finished results. Keep separate schedules and output views when they serve distinct needs. Preserve required detail, the supplied template and the requested edit scope.

## Workbook Structure

### Tab Types & Relationships

Tab types describe the role each part of the workbook plays. They do not require separate tabs. A simple workbook can combine inputs, assumptions, builds and outputs in clearly labeled sections on one worksheet.

**Inputs/Sources and Assumptions feed Builds; Builds calculate results and feed Outputs.** These relationships describe how calculations flow, not the physical tab order. The same rules apply when roles share a tab.

**Input / Sources** contain the data the workbook starts from. Keep dedicated raw source or Actuals areas intact, with original values and source meaning separate from prepared calculations. Cleaning, mapping and source summaries may have their own labeled areas with clear provenance. Put business calculations, including historical calibration from actuals, in the build. Raw source data does not read results back from downstream areas.

**Assumptions** hold the editable drivers and controls used by the builds. When cases are needed, keep one authoritative Case selector on Cover or Assumptions. Group each driver with its `Active Selection` row first, followed by its labeled case inputs, such as Base and Downside, sharing the same period columns. Prefer these driver groups to separate whole-case blocks for new designs. The build links directly to each period's active input. Preserve a supplied layout during narrow edits, and do not add cases or a separate tab when the task does not need them.

Changing the Case selector updates the active forecast assumptions for each period. The same build keeps linking to those active cells and recalculates with the selected values. Outputs update from the build results while historical actuals remain unchanged.

When cases are used, display the selected case on each worksheet by linking to the authoritative selector. Keep only one editable selector; distinguish source actuals and separately labeled comparison cases from the active forecast.

In historical periods, the active assumption row may link to ratios or other measures calculated from actuals in a build. Show that history once, aligned with the build's historical period columns, to help the user set forecast assumptions. The forecast active row selects the chosen case's assumptions and feeds the build. Forecast results must not feed back into the assumptions driving that same forecast. Historical calibration is a business calculation, not a terminal Check/Audit result.

**Build** tabs pull source inputs and assumptions to combine historical analysis, current results and/or a forecast. Bring the relevant inputs and applicable assumptions into clearly labeled rows or columns, then calculate the results on the build. Keep periods aligned and chronological. Show meaningful steps, subtotals and totals so readers can follow the logic—for example, headcount and compensation driving personnel cost, or revenue less COGS producing gross profit. Each step should do useful work. Do not hide the whole calculation in one dense formula or make the build merely repeat finished results from elsewhere.

For a simple calculation, a small labeled assumption block can sit beside it. For a larger build, link important drivers from their control area and show the useful calculation steps. Use one set of forecast schedules driven by the active assumptions, organized by the business sequence, such as revenue, headcount, vendors and cash. Do not mirror the Assumptions grid, add Case columns or parallel named-case forecasts, or apply the selector only to finished results.

A requested case comparison still needs each case's correctly evaluated results. If the requested simultaneous current results cannot be produced with the supported single-build design, explain the limitation and agree on the calculation or refresh method before building the comparison. Do not omit it, link both cases to the active result, or silently substitute snapshots, `TABLE`, arrays, dense formulas or a hidden second build. Preserve explicit user/template requirements and the separately authorized native-feature and capture workflows below.

**Output / Summary** tabs consolidate the builds and tell the main story. These might be named "Overview," "Summary," "Exec Summary" or "Dashboard," depending on the task. Bring across finished build results, show how matching totals roll into higher-level totals and put the main summary above the detail. Readers should be able to trace a headline result to its supporting build without finding the same calculation repeated elsewhere. Keep input retrieval, case selection and detailed business logic in the owning build/control area. Do not route forecast results through Assumptions before presenting them. Historical references used to set drivers and linked case/period displays remain allowed.

**Check / Audit** tabs review source data and builds for completeness, consistency and reconciliation. They may calculate their own diagnostics, but do not own business calculations or feed assumptions, builds or outputs. Nothing outside the check/audit area should depend on its results.

**Cover, if useful** gives a complex workbook a simple front page, especially for recurring or shared workflows. Include the company/project name or available logo, workbook title and relevant period or as-of date, with generous whitespace and restrained branding. Place it first. Keep analysis and methodology off the cover. Skip it for focused tasks or when the main output provides enough context.

For complex workbooks, use a separate `ReadMe` only when source choices, joins, scoring or refresh steps need more explanation than nearby notes. Explain the method and material limitations without repeating outputs or giving a tab tour. Put it last. Multiple sources alone do not require one.

Apply [Style guidance](style_guidelines.md) to these tab and section roles, so formatting helps readers distinguish the main answer, editable inputs and supporting calculations.

### Tab Names

Use concise names that describe each tab's purpose, such as `Check` or `Audit` for a reconciliation tab. Preserve established names during unrelated edits. For new forecast work, use `Forecast review` for review checks, `Forecast variance` for comparisons with a prior forecast, or `Sensitivity` for assumption tests. Do not label these tabs or views `Movement` or `Forecast movement`.

### Tab Order & Progression

For a new workbook or authorized redesign, start with one clear primary view that answers the task. Start with one tab, or two when the original source needs to stay separate, for focused tasks such as a department budget versus actuals report, a peer-company valuation comparison, a weekly marketing campaign report, an appointment-capacity tracker or a research measurement log with unit conversions. Preserve required source tabs and dependencies. Put the requested summary above the supporting detail and calculations. Add another tab only for a distinct source, calculation, reader or workflow need; do not create a separate tab for every role. Keep review commentary, refresh instructions and documentation beside the relevant work when they do not need a separate workflow.

Keep separate schedules when the work requires them, such as revenue, payroll, depreciation and debt builds in a financial model. One or two tabs is a starting point for the examples above, not a limit on every workbook. Do not shrink text, hide necessary calculations or discard records to meet a tab count or fit one printed page. Preserve the supplied template and existing architecture during narrow edits.

| Domain and task | Do: one output tab | Don't: create extra output/build tabs by default |
| --- | --- | --- |
| Finance / FP&A: one department's monthly budget versus actuals | On `Budget vs Actuals`, tab name `BvA`, show total spend and variance at the top, with category-level budget, actuals and variance calculations below. | Separate Summary, Dashboard, Scenarios and Assumptions tabs for this report. |
| Financial modeling: peer-company valuation comparison from supplied data | On `Comparable Companies`, tab name `Comps`, show the requested multiple summaries at the top, with peer-company inputs and calculated multiples below. | A DCF, debt schedule or full three-statement model when the task only asks for comparable-company analysis. |
| Marketing: weekly campaign spend and cost per lead | On `Campaigns`, show total spend, leads and overall cost per lead at the top, with campaign detail below. Calculate overall cost per lead from the matching totals. | One output tab per campaign, a duplicate dashboard or an attribution model that wasn't requested. |
| Healthcare administration: appointment capacity by clinic | On `Appointments`, tab name `Appts`, show available slots, bookings and overall utilization at the top, with clinic and period detail below. Calculate overall utilization from the matching totals. | A separate dashboard, clinical alerts or a payroll schedule for an appointment report. |
| Scientific research: measurement log with required unit conversions and a requested summary | On `Measurements`, show the requested results at the top, with original observations, units and required conversions below. | Separate Protocol, Processing, Calculations and Checks tabs, or statistical tests that the task does not require. |

One output worksheet can contain several useful sections. Keep original sources and substantial builds separate when needed; do not create multiple output tabs for the same answer.

For a file with multiple tabs, the physical left-to-right order is **Outputs → Builds → Inputs/Sources/Internal**, with a separate **Assumptions** control panel kept easy to reach, usually just after the primary output and before build tabs. Covers, key outputs (executive summary, financial statements, etc.) belong toward the left; working builds sit in the middle when needed; data, sources, inputs and internal documentation sit toward the right. A two-tab workbook has Output on the left and Input on the right. The logical calculation flow is Source/Input and Assumptions → Build → Output; a visible control panel may sit to the left of its builds. Do not confuse tab position with calculation sequence. Within a horizontal build, factors may feed intermediate results from left to right; preserve chronological period columns. Within a single worksheet, inputs and supporting calculations below can feed the main answer above. Preserve an intentional user/reference layout; do not reorganize a narrow edit to enforce this default.

#### Checks and Audit

Checks/Audit are terminal review areas and are not required for focused tasks. They read source/build evidence and may calculate or summarize their own diagnostics within that area. No formula outside a terminal check/audit area may use its results, directly or through helpers, names or dynamic references. This includes assumptions, business calculations, summaries, presented outputs, displayed statuses and output gates. Keep necessary input validation in the owning input/build logic; checks observe it independently. When separate tabs are useful, keep Checks/Audit and internal documentation toward the right. In complex workbooks, a divider such as `Internal >>` can group them with source data; follow [Style guidance](style_guidelines.md) for divider and child-tab colors. Preserve useful supplied controls and notes, but do not add separate tabs for a few lines.


### Build Structure and Formula Flow

Arrange labeled rows and columns so a reader can follow starting data, assumptions, useful calculation steps, subtotals and results. Follow the physical layout above; the logical sequence of inputs to results does not require every build to run from top to bottom.

- **Row progression:** make the useful business steps visible, such as quantity × rate, capacity used ÷ capacity available, or a balance plus its movements. Link the clean input and applicable assumption into their own labeled rows, then calculate the result on that build. Do not add trivial steps just to create more rows.
- **Active assumptions:** select the active assumptions once in the control area and link each period's cells directly into the same build. Do not bypass the active row, repeat case selection across schedules, put a forecast inside Assumptions or maintain parallel case builds. Resolve a required comparison's calculation and refresh method as described in [Tab Types & Relationships](#tab-types--relationships).
- **Historical reference:** Assumptions may link to historical ratios calculated from actuals in a build to help set forecast drivers. Trace the cells: this actuals-only reference must not create a feedback loop from the forecast into its own assumptions.
- **Column progression:** keep comparable items, scenarios and periods aligned. Use the shared headers and controls described in [Anchoring](#anchoring) and [Dates and Time Periods](#dates-and-time-periods), rather than repeating them beside each calculation.
- **Roll-forwards:** show opening balance, relevant movements and closing balance. Normally link each new period's opening balance to the prior period's closing balance, preserving the model's actual timing and conventions.
- **Reuse:** keep one place that owns each calculation, then link matching results into summaries and useful output views. Apply the matching-input, period, unit, rounding and override conditions in [Formula Construction](#formula-construction).

A tab that only repeats linked values from another tab or workbook is a red flag. Build tabs should perform useful calculations and show the steps. Output tabs should bring results together and calculate relevant subtotals or totals where needed. A useful output may link directly to completed build results without adding new calculations. Keep a linking-only tab when it serves a clear source, import or reporting need; otherwise, combine or remove it within the authorized scope. Do not invent calculations merely to justify a distinct reader view.

### Workbook Structure Examples

| Example | Do | Don't |
| --- | --- | --- |
| A1. Simple action tracker | Use one `Actions` tab with owner, due date, status and the requested totals above the table. | Add Cover, Readme, Inputs, Dashboard and Checks tabs around a small task list. |
| A2. Newly designed monthly activity report | Keep Month as a column in one activity table; use that table directly or add a linked summary tab to its left. | Copy the same layout into Jan, Feb and Mar tabs when separate monthly sheets are not required. |
| A3. Compare several teams or campaigns | Keep the comparison in one table with a team/campaign field and the requested measures. | Create a separate nearly identical report tab for each team and make the reader assemble the comparison. |
| A4. A few shared assumptions | Put a short labeled rate/assumption block to the left of the working calculation, or below the results on one worksheet. | Create Setup and Assumptions tabs for three cells, or duplicate editable copies of the same rate. |
| A5. A requested scenario comparison | Group each driver's Active Selection and case inputs together. Keep one active build. Agree on any required comparison's calculation and refresh method, and label retained results accurately. | Maintain parallel case forecasts, omit the comparison or affected dependencies, link both cases to the active result, or use `TABLE` or snapshots as an ordinary shortcut. Do not add unneeded scenarios. Preserve explicitly required native sensitivity or [capture workflows](#circular-references-and-iterative-calculation). |
| A6. Explain a one-page operating calculation | Put People needed at the top, the work/capacity calculation beneath it, and Requests and Minutes per request below. Let the lower inputs feed the answer above. | Scatter each step across a different tab, bury the answer at the bottom, or show only an unexplained staffing result. |
| A7. Present an existing calculation | In a new multi-tab workbook, put Outputs on the left, Builds in the middle and Sources/Inputs on the right. Link the output to the completed build; on one worksheet, show that output above its build. Keep each editable control authoritative in one place; preserve an intentional front-end selector. | Put the primary output after internal source tabs, duplicate the same editable control in several places, create an unintended circular calculation, or rebuild the same calculation in the summary. |
| A8. Reconcile a small import | Put an independent comparison near the relevant table. Use a Checks/Audit tab only if needed, and keep it a terminal reader of sources and builds. | Add a full control dashboard for one useful tie-out, or make the build, summary or output gate read a Checks/Audit result. |
| A9. Keep source context usable | Document each source once alongside the relevant input data, following [Citation Requirements](#citation-requirements). Retain essential period/unit labels, required row-level source columns and intact source tabs. | Repeat filenames and source explanations across builds and outputs, hide essential context in cell notes, or create Sources, Notes, Methodology and Version History tabs for a one-off analysis with one source. |
| A10. Summarize a long source table | Keep all required records intact and make the primary view compact. Use a separate source tab when it improves use or preserves the import. | Drop rows, hide needed calculations or make text tiny so all the evidence fits on one page. |
| A11. A production plan with distinct schedules | Keep materials, line-capacity and staffing schedules separate when their inputs, time grains or update owners differ; place the primary output plan to the left of those builds, with supporting data/inputs farther right. | Merge incompatible schedules just to stay within two tabs, or repeat their calculations in the summary. |
| A12. A narrow edit to an existing workbook | Change the requested cells and affected dependencies, preserving established tabs, native features and layout. | Normalize, merge, rename or remove existing tabs just because a new workbook could be simpler. |
| A13. Several thin tabs around one calculation | For a new capacity plan, keep the input factors, meaningful work/capacity calculation and requested result together in one view or two useful tabs. A Build should contribute the steps shown in F13. | Create seven tabs that mostly repeat the same central range, with nominal Build tabs doing no distinct work. Putting that central calculation on Checks/Audit is also a dependency failure. |
| A14. More than one output view | Keep an operator detail view and a manager summary when their fields, level of detail or workflow differ. Both may link to the same owning build, as in F14. | Copy the same table into Summary, Dashboard, Report and Executive tabs without a distinct reader need, or invent new calculations just to make each tab look different. |


## Formulas

Apply these rules to newly added or edited formulas and their affected dependencies. Follow the user's preferences and supplied template; preserve unrelated formulas and layout during narrow edits. Design formulas to support the workbook structure above: the reader should be able to follow the inputs, useful calculation steps and final answer.

### Formula Construction

- Use direct references, familiar functions and meaningful intermediate calculations. Follow [Build Structure and Formula Flow](#build-structure-and-formula-flow) to show the work; do not hide an entire build in one dense formula or add trivial helpers just to make formulas shorter.
- Keep raw data, editable assumptions, mappings and business rules in labeled cells or tables. Mathematical, index and control constants may remain in formulas. Keep calculated results as formulas so they update with their inputs.
- Fixed cutoffs or categories from the user's request can appear directly in formulas when result labels state the rule. For example, label `COUNTIFS(B2:B100,">1000")` as `Invoices over $1,000`, without adding an input cell for `1000`. Use one labeled input cell when the cutoff is user-adjustable or serves as a shared assumption across different calculations.
- Calculate a shared result once and reuse it when the inputs, period, units, rounding and overrides match. Keep independent reconciliations independent.
- Use consistent formulas across comparable rows and periods, while preserving intentional differences such as [historical versus forecast logic](domain_guidance/financial_models.md#periods-assumptions-and-scenarios), one-off adjustments and overrides.
- Keep business calculations in the owning build and necessary input guards with their inputs or dependent build logic, following the [terminal Checks/Audit rule](#checks-and-audit). Do not invent business restrictions or wrap ordinary calculations in repeated workbook-wide validation gates. For example, use `=SUM(I11:I12)` for a valid total; do not add an `IF` that rejects a negative result unless the business rule requires it.

### Anchoring

Use `$` to fix only the part of a reference that must stay in place when a formula is copied. Anchor shared **rows, columns or individual cells** so the workbook can reuse one period header, assumption block, item column or Case selector instead of repeating it beside every calculation.

| Reference | What stays fixed | Useful pattern |
| --- | --- | --- |
| `C8` | Neither row nor column | A quantity that moves with the calculation when copied across or down. |
| `C$4` | Row 4 | Read each column's period from one shared header row; copying across advances the period, copying down keeps that header. |
| `$A8` | Column A | Read each row's item or category from one shared column; copying down advances the item, copying across keeps its label. |
| `$B$3` | Cell B3 | Reuse one fixed conversion rate or Case selector throughout the applicable calculation. |

For example, `=SUMIFS(Amount,Month,C$4,Item,$A8)` reads the period above and the item at the left. Copied one column right it uses `D$4`; copied one row down it uses `$A9`. The aligned named ranges represent the source columns; they do not require named ranges in the delivered workbook.

A period-specific assumption should move with its period: `=C8*C$3` becomes `=D8*D$3` when copied across. A single assumption shared by every period should stay fixed: `=C8*$B$3` becomes `=D8*$B$3`. Choose between them from the model's meaning, not by adding `$` everywhere. Use keyed lookups when source and destination orders differ; anchoring cannot make mismatched row positions equivalent. Quote cross-sheet names, for example `='Build'!E14`.

### Dates and Time Periods

- When calculations depend on a reporting date, use the date specified by the task or source. Use TODAY() only when calculations should update with the current date. Use a fixed reporting date when results should remain tied to a particular date. Label any assumed date. Preserve source deadlines and flag conflicts with derived deadlines.
- Review the template's calendar, period layout and source grain before building formulas. Use real dates where the source supports them, with number formats for display; do not invent a missing reporting year. Derive period filters and labels from the shared header rather than hardcoding months in individual formulas.
- For a new `Week of` label, use the week's first business day as the underlying date: Monday by default, moved forward for holidays only when a holiday calendar is supplied. Follow an explicit source/template week convention. Do not invent holidays or relabel a week-ending date as a week start.
- When several time scales are needed and the template does not prescribe a layout, place the broader summaries to the left and finer detail to the right: **Annual | Quarterly | Monthly | Weekly**. Include only the time scales needed for the task. Keep periods chronological from left to right within each group; use the supplied fiscal calendar and week convention.
- Separate different time scales with narrow, blank, unfilled spacer columns; do not extend formatting down the entire column. Do not add a spacer merely between actual and forecast months in one continuous schedule. Align matching period columns across Assumptions, builds and summaries where practical. When recent actuals help set drivers, include that historical reference on Assumptions in the same period column as the build, followed by the matching forecast periods. Within a continuous schedule, use one shared period header rather than repeating identical date rows above every subsection. Keep it visible when useful; separate tables with different column meanings may need their own headers, and print titles can repeat headers on printed pages.
- Match each period to its own assumptions and data. Roll detail into summaries using the right calculation: sum additive amounts, use the appropriate ending balance for stocks, and calculate ratios or weighted averages from the relevant components. Do not sum monthly percentages or double-count weeks that cross month boundaries.

For a monthly summary of daily dates, with `C4` holding the first day of the month and aligned source ranges, use `=SUMIFS(Amount,Date,">="&C$4,Date,"<"&EDATE(C$4,1),Item,$A8)`. The next-month exclusive upper bound includes the full last day, including timestamps. Equality to `C$4` is appropriate only when the source already stores that same monthly key.

### Choosing Formulas and Excel Tools

- **Totals and products:** use `SUM` over the relevant detail for total rows. Use `PRODUCT` for a result built by multiplying a range of numeric factors, or direct multiplication for a simple two-cell calculation. Use `SUMPRODUCT` for a sum of matching quantity × rate pairs or a weighted calculation. Keep ranges aligned and bounded; do not include both subtotals and their detail. Check required factors first: `PRODUCT` ignores blank/text cells in a referenced range, which can make missing inputs look like a valid result.
- **Conditional counts, sums and averages:** prefer `COUNTIFS`, `SUMIFS` and `AVERAGEIFS` for new formulas, even with one criterion, so another condition can be added consistently. Avoid choosing `COUNTIF`, `SUMIF` or `AVERAGEIF` for new work by default; preserve a valid existing/template convention during a narrow edit. This preference does not prohibit an ordinary `IF` condition.
- **Lookups:** `INDEX/MATCH`, `VLOOKUP` and `XLOOKUP` are all useful. Follow the user's preference and the workbook's established approach where it works. Make exact versus approximate matching intentional, handle missing keys explicitly and confirm whether duplicate keys should be rejected, matched once or aggregated. Do not substitute a first-match lookup for a required sum.
- **Conditional logic:** use a short `IF` for a simple choice. Nested `IF` formulas are appropriate when they express necessary, understandable logic, including advanced Finance calculations. For a long list of categories or editable rules, prefer a mapping table or labeled steps. Preserve rule order, boundaries, gaps and the unmatched case; do not replace useful business logic merely to reduce nesting.
- **Formula choices to avoid:** do not introduce `LET`, array/spill formulas, `MAP`, `REDUCE` or `LAMBDA`. Use familiar formulas and labeled intermediate steps. Normal range arguments in functions such as `SUMIFS` and `SUMPRODUCT` remain appropriate, as do the lookup, `INDIRECT`, `OFFSET` and `CHOOSE` patterns below. Preserve required existing/template behavior and do not rewrite unrelated formulas during a narrow edit. Formula length alone is not the test: the reader must be able to understand and extend the calculation.
- **Sensitivity analysis:** For requested one- or two-input sensitivity analyses, use native What-If Data Tables where supported when the alternative would duplicate complex model logic in the sensitivity grid. Simple, self-contained calculations may use ordinary formulas. For requested Excel financial-model sensitivities, default to native What-If Data Tables where supported; follow [Finance Guidance](domain_guidance/financial_models.md#valuation-and-returns) for model links and verification. Do not introduce `TABLE` into an ordinary forecast or case comparison, or manufacture a second varying input with a metric selector. Excel supports one or two varying inputs; the current Artifact Tool supports only two-variable tables, with both input cells on the table's worksheet. Read [Data Tables](artifact_tool_docs/DATA_TABLES.md) before creating one. Two inputs test one output across their combinations; use separate tables for additional outputs. If the requested native design is unsupported, explain the limitation before agreeing on a formula-based design or change-input/recalculate/restore process. Label captured results and their refresh method. Ordinary case comparisons follow the single-build and comparison boundary above.

An Excel Table, PivotTable and What-If Data Table are different features. Check the chosen tool and destination's support. If a requested native feature cannot be created or preserved, explain the limitation before substituting a formula or static result. Keep API setup and feature-specific execution details in the relevant tool reference.

### Scalable Formulas and Brief Explanations

Use the patterns below when they make recurring updates easier without hiding the calculation. Choose the simplest approach that supports the actual update workflow, not just the current snapshot.
- **Assumption and Case selection:** prefer one numeric Case selector with labeled case names and `CHOOSE` or `OFFSET` to select the active assumptions. `INDEX/MATCH` or `XLOOKUP` remain valid when they fit the layout. In each driver group, put Active Selection above its case inputs, sharing the same period header. For example, with Case in B3 and two case values in I22:I23, active I21 can be `=CHOOSE($B$3,I22,I23)`; the matching build input is simply `='Assumptions'!I21`. Anchor and validate the selector. Do not repeat the choice in the build or maintain a second editable copy of the drivers. The simple CHOOSE example assumes validated numeric case inputs. Otherwise, test the selected source value before a reference can turn a blank into zero. Preserve a valid zero. A missing unselected case must not block the active case. In an agreed comparison, mark only the affected case and dependent deltas unavailable. Keep necessary validation local to the driver and reuse it. OFFSET and INDIRECT are volatile, so keep references bounded and consider recalculation cost.
- **New monthly source tabs:** if the workflow receives a separate tab in the same format each month, a visible month-to-tab registry and bounded `INDIRECT` references can support new periods without rewriting the reference pattern. Register the new tab and extend the summary periods or bounded ranges when needed. Validate the expected layout, tab names and source coverage; quote and escape sheet names correctly. For a new workflow without that constraint, one source table with a Month column may be simpler.
- **Explain recurring updates:** when a less familiar formula materially improves the workbook, add a short explanation near its control or in the existing guide: why it helps, what the user can change and how to extend it safely. For example: "Add the new month tab in the same layout and register its name in Setup. Extend the summary period and ranges if needed; the formulas keep the same reference pattern." Keep this brief; do not add comments to every formula or create a new instruction tab for one note.

### Missing Inputs, Errors and Overrides

- Do not invent missing source data or substitute a different metric. If required data is absent, leave the result unavailable and state the specific missing input beside its data or setting and briefly in the response. For a rate, preserve the requested numerator, denominator, population and period; do not substitute another available denominator.
- Distinguish a real zero from missing data, an unavailable result and something that is not applicable. Use `"n.a."`, a deliberate `""` blank, or an exposed error according to the user's preference and the calculation's meaning. Right-align `n.a.` and similar placeholders when they sit among numeric results; do not turn them into numeric zero for appearance.
- `IFERROR` can be useful for a deliberate, understood fallback, but must not hide unexpected failures. Prefer testing the expected condition directly, or `IFNA`/a lookup's not-found result when only a missing match is expected. Do not blanket-wrap formulas in `IFERROR(...,0)` or `IFERROR(...,"")` to make broken references and bad inputs disappear. Text `"n.a."` and the `#N/A` error are different; choose intentionally and ensure downstream formulas handle the result correctly.
- Guards such as `ISNUMBER` must not turn a failed prerequisite into a healthy zero or an understated issue count. Keep unexpected failures visible in the affected results, even when an intermediate formula returns text or a blank instead of an error.
- Handle necessary validation in the input/build that owns it, affecting only the relevant outputs. A SUMIFS result of zero does not prove matching records exist; retain a source-coverage test when no match must remain blank or unavailable. Keep the issue visible without spreading the same long guard through every summary formula or pulling a global status from Checks/Audit.
- A matched lookup key does not prove its value is populated. Check required source values before a lookup or reference can turn a blank into zero; preserve a permitted numeric zero.
- Add manual overrides only when the task, template or established workflow needs them. Otherwise, calculate directly from the relevant drivers; do not add an optional override row to every result.
- Preserve deliberate zero overrides, blanks, one-off adjustments and rounding. A blank optional override may mean "use the base"; a zero override may mean "use zero." Do not treat those as the same condition.

### Circular References and Iterative Calculation

Avoid unintended circular references. Use intentional circular logic only when the requested model needs it and the selected tool and target engine support it. Document the loop and its purpose; preserve or deliberately configure iteration, maximum iterations and maximum change. Verify convergence after representative input changes and save/reopen. Do not silently enable iteration, change application-wide settings, or treat cached values, a successful export or an error-free scan as proof. If calculation or setting preservation cannot be verified, report the limitation and use a verified workflow or a mathematically equivalent non-circular approach within scope. Keep Checks/Audit outside the loop.

An explicit/template case-capture workflow may use a self-retaining `IF` in an output area to store a selected case's result while the same model calculates the other cases. This is a snapshot, not a live recalculation of every case; assumptions and business calculations must not depend on it. Define initialization and capture/refresh steps, show the captured case and stale-state warning, and verify each case is captured and retained correctly in the intended engine. Convergence alone does not prove capture correctness. Do not introduce this pattern as a default scenario comparison.

Present case results as a compact `Case comparison`, with each case named above comparable metric rows and period columns. Keep capture/refresh instructions secondary and label saved snapshots clearly; a new label or layout does not make them live.

### Formula Examples

These examples assume the inputs, ranges and units described. Named ranges stand for labeled source ranges, not a requirement to add names. Preserve the task's missing-data policy and material rounding.

| Example | Do | Don't |
| --- | --- | --- |
| F1. Reuse an editable assumption | With one fixed conversion rate in B3, use `=C8*$B$3`. With a different rate in each period of row 3, use `=C8*C$3` and fill across. | Hardcode the rate in every formula, or let a shared rate drift to a neighboring cell when copied. |
| F2. Show a build on one worksheet | Put Requests in B10 and Minutes per request in B9; calculate Work minutes in B8 as `=PRODUCT(B9:B10)`. With positive Available minutes per person in B7, put People needed in B6 as `=B8/B7`, with required whole-person rounding. All factors must be present and numeric. | Hide input retrieval, unit conversion and staffing logic inside one unexplained output, or treat a missing factor as zero workload. |
| F3. Reuse the matching subtotal | If B12 is the eligible-volume subtotal for the required period, calculate `=B12*$B$3`. | Re-sum the detail in every output, or reuse a subtotal with different eligibility, units, period or rounding. |
| F4. Link a period rollforward | Link this month's Beginning inventory to the prior month's Ending inventory; calculate Ending as Beginning + Receipts − Usage. | Rebuild cumulative history from the first month in every period when the prior ending balance already represents the same quantity. |
| F5. Resolve a shared lookup once | With unique validated keys and matched ranges, put the rate in D8 with `=INDEX('Rates'!$C$5:$C$12,MATCH($A8,'Rates'!$A$5:$A$12,0))`; reuse D8 for that same rate. An established VLOOKUP or XLOOKUP pattern is also valid. | Repeat the same lookup in each output, silently select an ambiguous duplicate, or add a helper for an already simple one-use expression. |
| F6. Replace a long category decision tree | Keep the category-to-owner mapping in a table; with unique keys, use `=XLOOKUP($A8,Categories,Owners,"Unmapped",0)`. | Repeat a long category `IF` chain in every row, or remove necessary conditional model logic merely because it uses nested IFs. |
| F7. Preserve rule boundaries | For supplied bands `0 ≤ x < 100`, `100 ≤ x < 500`, and `x ≥ 500`, preserve those boundaries and test the thresholds and values on either side. | Turn `<100` into `≤100`, reorder overlapping tests, fill an intentional gap or invent a default category. |
| F8. Guard the expected exception | With validated numeric B8 and C8 and a not-applicable policy for a zero denominator, use `=IF(C8=0,"n.a.",B8/C8)`. A deliberate blank may be appropriate under a different display policy. | Use `IFERROR(...,0)` so missing data or a broken reference appears to be a real zero rate. |
| F9. Preserve a zero override | With base B8 and validated optional override C8, use `=IF(C8="",B8,C8)`. | Use `=IF(C8=0,B8,C8)` and erase a valid zero override, or overwrite the base to apply an adjustment. |
| F10. Fill using shared headers and labels | Use `=SUMIFS(Amount,Month,C$4,Item,$A8)` for matching monthly keys. Row 4 supplies periods across the table; column A supplies items down it. Use the date-bounds pattern above for daily source dates. | Repeat the same date header in every subsection, hardcode January across the year, or assume differently ordered source tabs have matching row positions. |
| F11. Choose the aggregate that matches the math | Use `=SUM(C8:C11)` for a total, `=PRODUCT(C8:C10)` for three required numeric factors, or `=SUMPRODUCT(B8:B11,C8:C11)` for matching quantity × rate pairs. Use SUMIFS for an ordinary conditional sum. | Replace these with a custom array pipeline, double-count subtotal rows, or let PRODUCT silently skip a missing required factor. |
| F12. Keep checks independent and one-way | If a Checks tab is warranted, compare the build with an independent source control there, such as `='Build'!E14-'Source'!D20`. | Use `='Checks'!C8` in a build, summary or output gate, compare a total with itself, or treat a cached PASS as a newly executed check. |
| F13. Show progression within a build | For A13's capacity plan, use numeric Runs in C8 and kWh per run in D8 to calculate Energy needed in E8 as `=C8*D8`. With positive Available kWh in F8 for the same period, calculate Capacity share in G8 as `=E8/F8`. | Label a linked copy "Build," hide all factors in one long formula, or add relay tabs without useful work. |
| F14. Share a result across useful views | For A14's distinct output views, let both read the owning result, such as `='Build'!E14`, and present the detail their readers need. | Recompute the same result in every output, or copy the same table into several tabs without a distinct reader or workflow need. |


## Writing Quality and Authored Content
Apply these defaults to text you write, including titles, labels and messages returned by formulas. User instructions and preferences, reference/template conventions and domain guidance take precedence, in that order. For edits, do not change unrelated content outside of the user's request and follow the workbook's existing writing style.

- Write for the intended audience. Never include internal file paths, authoring commentary, planning notes, or requester instructions in the artifact unless explicitly requested. Do not repeat audience or style directives such as "executive-friendly" in headings, content, or comments.
  - Omit: `Discussion support only. This workbook does not make final rating or promotion decisions.` just because the user asked for a workbook for discussion.
  - Omit: `Supports discussion and consistency checks. Human reviewers remain responsible.` unless that limitation is explicitly required.

- Include text only when it helps the reader understand the data or use the workbook. Keep clear text unchanged. Rewrite useful text that is unclear. Delete unnecessary text instead of replacing it with a cleaner version of the same filler.

- Use concise, plain-language titles and labels. Name the specific subject, issue or action and avoid internal jargon and vague status labels. Preserve what each label measures, including the population, period, units, comparison, and uncertainty. Do not shorten a label by removing a distinction the reader needs.
  - Good: `Weekly metrics`. Bad: `Follow the weekly trends`
  - Use `Metric` for a general metric column and `Revenue driver` for a revenue assumption explanation. Avoid invented labels such as `Planning measure`, `Movement explanation` or `Planning basis`. Retain specific labels when they add necessary meaning.
  - Bad: `Requisition blockers`. Good: `Hiring requests awaiting approval` when approval is the issue.
  - Bad: `Two-band rating movement`. Choose a descriptive, clear phrase that represents the underlying event, e.g.:
    - Promotion: `Promoted by two job levels`
    - Rating change: `Performance rating increased by two levels`
  - Good: `Monthly results`. Bad: `Decision-ready monthly impact analysis`
  - Good: `Income and household assumptions`. Bad: `Same paycheck. Different purchasing power.`
  - Use `Retained employees` only for employees who remained over a defined period. Otherwise, name the population counted, such as `Total employees` or `Employees reviewed`.

- Avoid decorative bullets, icons, emoji, arrows and pipe-delimited titles. Omit filler suffixes; keep terms such as `review`, `analysis` or `dashboard` when they identify the content.
  - Bad: `$ in USD • monthly • forecast`
  - Good: `Monthly forecast (USD)`

- Prefer direct, specific human wording. Avoid slogans, buzzwords, invented terminology, vague framing and formulaic claims.
  - Good (when supported by the data): `Most revenue growth comes from data centers.` Bad: `Data centers are doing the heavy lifting.`
  - Good: `Contributions decreased`. Bad: `Contributions waned`
  - Good: `Revenue metrics`. Bad: `Strategic Value Drivers`
  - Bad formulaic phrasing: `The tool not only saves time, but also transforms how teams collaborate.` or `Faster, smarter, and more intuitive.`
  - Bad: `While remote work offers flexibility, it also presents unique challenges.` (synthetic balance without a real tradeoff)
  - Bad: `Operating evidence improved`. Operating evidence is unclear and not a common term used.

- Avoid AI-like sentence constructions. Use direct sentences with clear meaning and avoid vague explanations and forced contrasts. Prefer periods between sentences. Do not use semicolons, pipes, bullets, or dashes to assemble several labels into a slogan.
  - Semicolons and vague explanations: Use `Travel demand and employment fell from Jan to Feb.`, not `Travel demand and employment fell from Jan to Feb; persistent behavior shifts are shaping the path back.`.
  - Passive voice when active is clearer e.g. Use `The team approved the proposal.` not `The proposal was approved by the team.`
  - Contrast slogans like `It's not X, it's Y`: For a title, use `Humidity exposure over time` not `Humidity is an exposure trajectory, not a setpoint.`
  - Unnecessary em-dashes: Bad: `Purpose: isolate what changed – and what deliberately stayed in place – under Osaka Prefecture's Red Stage emergency response.`

- Keep wording factual, parseable and supported by the workbook.
  - Good: `Transit use is 79% of pre-pandemic levels.`
  - Bad: `79% Transit use back to pre-pandemic`

- Omit repeated information, obvious purpose statements and generic disclaimers. Subtitles are optional. State critical definitions and material assumptions once beside the relevant data or setting. Preserve task-required limits and warnings, such as a review supporting discussion rather than making final personnel decisions.

- Do not include motivational wording or self-assessment. Omit decorative badges and self-evaluation banners. Preserve task-required business statuses, risk flags, uncertainty labels and specific warnings as ordinary data. Do not invent scoring systems or confidence scales merely to decorate the workbook.
  - Omit: `This workbook is source-backed and ready for review`.

- For checks and logic, be specific:
  - Bad: `Signal integrity: BLOCKED`. Good: `Missing input: forecast rate` (a specific functional warning)

- For a requested workflow, provide an obvious editable field for required human input, separate from original source notes. Short calculated statuses or actions should reflect all required prerequisites. Do not imply completion while another required action is still open.


## Workflows
Required:
- `workflows/edit_workflows.md` for existing files/follow-ups.
- `workflows/create_workflows.md` for new files

## Resources
Read the following BEFORE starting the task:

Required:
- `artifact_tool_docs/API_QUICK_START.md` for `artifact_tool` JS API documentation. Read entirely.
- `style_guidelines.md` for formatting.

As applicable:
- `references/template-elicitation.md`: if user has not provided a template, reference, or visual direction.
- `references/image-references.md`: if a reference image or screenshot is provided.
- `references/read_only_qna.md`: for Q&/audits
- `features/charts.md`: for creating or editing charts.

`<a id="domain-requirements"></a>`

## Role and Domain Guidance
Before authoring, identify the user's **task/function**, **role**, **audience** and **industry** separately, then read the relevant guides below. Apply the professional conventions of the work being done; a role or industry label alone does not determine the workbook's structure or formatting.
- Use function guidance for the work being done. Financial forecasts, budgets, cash models and valuations use Finance guidance in any industry.
- Add industry requirements only when they affect definitions, units, source handling or the workflow. A healthcare company's financial forecast uses Finance guidance; an appointment tracker does not inherit financial-model structure or colors.
- Use the user's role and audience to choose useful detail, terminology and outputs, and to resolve ambiguity in the task. Do not apply Finance conventions to an unrelated task just because the user works in Finance. Explicit instructions and templates retain precedence; relevant domain conventions override generic defaults.

Guides:
- Finance, corporate finance and FP&A, financial modeling, valuation and investment banking: `domain_guidance/financial_models.md`. Read the relevant financial requirements below the shared structure, formula and style rules.
- Healthcare: `domain_guidance/healthcare.md`
- Marketing and advertising: `domain_guidance/marketing_advertising.md`
- Scientific research: `domain_guidance/scientific_research.md`

## Create and Edits
For any task that requires modifying or creating a workbook:

### Data Formatting Rules
- Store numbers, percentages, currency, and dates as typed spreadsheet values, not preformatted strings. Use text only for true identifiers such as ZIP codes, account IDs, SKUs, or labels.
- Use Excel-invariant number/date format codes, not locale-specific display strings. Generic numeric examples include `#,##0`, `#,##0.0`, `0.0%`, `0.00%`, `"$"#,##0`, `"$"#,##0.00`. Preserve source dates and unrelated existing formats.
- Percentages: Follow the domain or reference's precision. Otherwise, use 1 decimal for most analytical cells, 0 decimals for dashboard outputs, and 2 decimals where small rate differences matter.
- Do not swap `.` and `,` in format codes to mimic locale separators; separators are controlled by spreadsheet/render locale. Use `0.0%`, not `0,0%`, and `#,##0`, not `#.##0`.
- Choose the appropriate format for readability. Match precision to meaning: counts use `#,##0`; rates usually use `0.0%` or `0.00%`; currency uses whole units unless cents matter.

- For dates in data columns, default to a short date format appropriate to the workbook's language/location, such as `mm/dd/yy` for the US. Follow explicit user preferences and reference/template or domain conventions.

Keep underlying dates numeric and sortable. A display format does not change the period represented or authorize aggregation. Fit the final display so dates do not truncate or show `####`.

### Verification Rules
Use Artifact Tool to verify requested features and results within the authorized changes and their affected dependencies. Match coverage to the scope, complexity and risk. Report unrelated pre-existing defects without repairing them. Reuse checks for unchanged content and keep authoring-only tests out of the delivered workbook.

After completing all edits, call `workbook.recalculate()` once before the final checks below and export. If you make further edits, recalculate again before repeating affected checks and exporting.
```js
workbook.recalculate();
```

1. Inspect labels, values and formulas in key ranges:
```js
const check = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:H20",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 12,
});
console.log(check.ndjson);
```

Check what each source row represents, units, reporting periods, and numerators and denominators for rates. Spot-check representative metrics against source data or an independent calculation. Trace headline results through the build to inputs, including named and dynamic references. Confirm the build does useful calculations and does not depend on terminal Checks/Audit. When cases are used, trace each period to its active assumptions. Summary should link to finished results without repeating the build or routing results through Assumptions. An actuals-only historical calibration reference is allowed.

Check formula copying across and down at first, middle and later rows/periods. When the workflow promises extensions, test the next record, period or requested case. Keep notes and overrides tied to stable record IDs after supported sorts or refreshes. Reconcile key totals to independent source controls using the right period aggregation. Apply tolerances appropriate to the units and precision, but compare identifiers, counts and categories exactly. Investigate double-counting or conflicting data and fix confirmed errors within scope.

2. Scan formula errors:
```js
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);
```

Check wrong or shifted references and unintended cycles as well as reported errors. Distinguish deliberate missing-data markers from unexpected failures. Trace unavailable results and zero issue counts through their prerequisites: a failed detail calculation must not disappear into a healthy zero or an understated summary.

3. Verify applicable recalculation in the intended engine. Test representative input changes and boundaries in a disposable copy or restore every temporary edit before delivery. Include blank versus zero, missing/duplicate keys, period cutoffs, overrides and rounding. For cases, change the selector and a later-period driver. Confirm the same build and linked outputs update while actuals remain unchanged. A blank unselected input must not block a valid active case; selecting that case must expose the missing input. Verify any agreed comparison refresh and stale-state behavior separately. Report any engine checks that could not be performed.

For workflows, check that required human inputs have editable fields and that completion guidance accounts for every prerequisite. Complete one prerequisite while leaving another open and confirm the remaining action stays visible. For input-driven rankings and action lists, change an input that should alter the order or included records and verify the list updates. Verify affected charts, status text, validation and conditional formatting react to edits. A saved value, static matrix or unchanged PASS cell is not recalculation proof.

4. Render sheets/ranges to verify visual output. Skip only when the rendered view and its data/formula dependencies are unchanged:
```js
const blob = await workbook.render({ sheetName: "Sheet1", range: "A1:H20", scale: 2 });
```

For creation or broad authorized restructuring, visually review every sheet. For a narrow edit, review the changed view and affected dependencies, then compare all tabs with the source for unintended value, formula, object, validation or style changes. Do not repeatedly render unchanged tabs; investigate any scope-preservation failure.

Inspect at normal zoom with cells unselected. Fix blank/broken charts, low-contrast text, unreadable fonts, clipped headers/numbers, `####`, awkward wrapping, truncated chart labels, default blank sheets and content outside the working area. Check effective cell/chart fonts, fitted row heights and widths, pane boundaries and conditional-format ranges. Logical titles and labels should appear once with a clear layout. Valid check values should stay neutral, with errors and missing inputs visibly distinct. Do not shrink content to force a fit.

Keep output compact: avoid arbitrary formula-count checks, assumptions about file storage and huge NDJSON dumps.

5. Export:
```js
await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/output.xlsx`);
```

6. Inspect the saved file when an affected feature or export concern requires it. Verify requested or preserved native features in the intended engine, including any explicitly required Data Table input/output behavior. Check iteration and capture behavior separately when used.

Finalize only after successful export and the applicable checks. Report what was performed and any remaining limitations. Formula text, a preview and a successful export do not establish native-application behavior.
- Do not export extra `.xlsx` variants unless asked.

### Citation Requirements
These are defaults for new workbooks: user instructions, reference/template conventions and domain guidance take precedence. For edits, follow the workbook's existing citation practices.
- Cite real sources when they exist.
- Keep citations and sources in one place: an existing input tab (sources or data tab) or in the correct input section in a tab, alongside the input data.
- There are two ways to cite a source:
  1. (Preferred) Inline in the input tab when the tab exists.
    - If there are multiple unique sources (different pages/lines don't count), inline them in an adjacent cell at the table's end, with one column as a buffer, when a table exists
    - If there is a single source, just have a single cell above the data, left aligned.
  2. (Fallback) Cell note, not a comment/thread, with the citation  
    Only do this for hardcoded inputs not on a separate input tab, such as an input area on a build sheet. For adjacent cells in the same row or column that come from the same source, do not add duplicate cell notes. Never add citation notes to titles or headers.
- If there is no clear place for sources, return sources in chat. Do not add a tab just for citations.
- Citation format should follow best practice for domain, default to `(Source: Company 10-K, FY2026, Page 20, Revenue Note, [URL LINK])`
- Do not add citations, comments or notes to cover/presentation tabs or output regions unless requested. On a mixed-use sheet, citations may sit beside the input data, outside the output region.
- When comments are requested, keep them succinct, minimal and easy to read.
- Do not add a different annotation type to a cell that already has one. Update an existing note/comment/thread rather than layering another system over it.
- Do not add cell comments unless the user requests them. Preserve existing annotations.

## Completion Criteria
### Criteria for Question / Read only requests
- Answer from the available workbook context. Do not edit or overwrite unless the user asks for a workbook change.

### Criteria for all create and edit requests
Complete only when:
- Content is populated, addresses the user's request, and formulas compute, with no obvious formula errors in key scanned ranges (including bad-reference, off-by-one or circular errors).
- Deliverable is saved as a live session when available, or as an `.xlsx` in `outputs/<unique_thread_id>/` when using file authoring or a requested export.
- Visual verification passes: organized, legible layout matches requested style or default/existing edit baseline; all important numbers/callouts are visible; numbers, text, charts and content are unclipped without awkward wrapping.
- Required controls, charts, panes and requested features exist.

## Error Recovery
On first tool or API error:
1. Read error text.
2. Consult the selected workflow's targeted help or schema discovery only if needed.
3. Retry with minimal patch (not full rewrite).
4. Continue from existing workbook state.

Do not loop indefinitely on similar failures.

## Final response

### Final Response Citations

- **Create/edit:** for created or edited spreadsheets, cite each final deliverable exactly once with `purpose="output"`, in its own paragraph. Briefly describe the result without repeating its filename, path, or link. Never put output directives inside prose or list items.
- **Q&A and summaries:** Every file whose contents you summarize or use to support an answer MUST receive a `:codex-file-citation{...}` with `purpose="source"` in the final response. Use the source citation in place of the filename, wherever the filename would appear. Do not write the filename separately and append its citation at the end. Files merely inspected but not used in the answer need no citation. Do not emit output citations for unchanged files or read-only answers.

- Emit `:codex-file-citation{...}` directly, without backticks, code fences, or a Markdown-link wrapper. Use verified targets only. No need to cite or reference intermediate work.

When Artifact Session is available, create, edit, and validate spreadsheets there. Keep the deliverable live unless the user requests another output format. Validate directly via the session instead of exporting to check.  
Otherwise, use the artifact tool file-authoring workflow.

For a live Artifact Session deliverable, set `path` to the exact returned `artifactRef`, add `mode="live"`, and include `artifact_kind="workbook"` matching the session. If the session provides a `page_id`, include `page_id="<returned page_id>"`; otherwise omit it.  
For exported files or native Google files, cite their verified path or URL without `mode`.  
For file citations, set `path` to the verified absolute file path on the task host. Omit `mode`.

Some illustrative examples, real responses use verified targets outside code fences.

```text
:codex-file-citation{path="<returned artifactRef>" mode="live" artifact_kind="workbook" purpose="output"}
```

```text
The review of :codex-file-citation{path="<returned artifactRef>" mode="live" artifact_kind="workbook" purpose="source"} is due Friday.
```

### Additional citation guidance


For substantive whole-workbook claims, use a plain source citation. Otherwise use the narrowest reliable `sheet` + `range`, including the exact cell for a discrete value. Cite discontiguous cells separately where they support the answer. For objects, use `sheet` + exact inspected `object_id`; add `object_kind`/`label` only when useful. Never cite a sheet alone or guess locators. Cite only distinct inputs, drivers, formulas, or results the answer needs.

```text
Revenue falls because the growth assumption is negative in :codex-file-citation{path="/abs/path/book.xlsx" purpose="source" artifact_kind="workbook" sheet="Revenue Model" range="C27"}.
```

- Calculations: cite only distinct inputs, drivers, formulas, or results the answer needs.



## Comment Author
- If the authenticated/user profile or env context provides a user display name, use it as the threaded comment display name unless the user requests another name. Default to `User`.

## Source, PDF, and Attachment Processing
- For attachment references, include only the file/section/table details needed to locate supporting data. Do not paste large PDF excerpts unless requested.
- Bundled Python libraries available in the bundled runtime environment for extraction/analysis include `pandas`, `numpy`, `pypdf`, `python-docx`, and `reportlab`. You may read/extract in separate scripts if needed.
- Bundled JS libraries available for document/PDF work include `docx`, `pdf-lib`, and `pdfjs-dist`.
