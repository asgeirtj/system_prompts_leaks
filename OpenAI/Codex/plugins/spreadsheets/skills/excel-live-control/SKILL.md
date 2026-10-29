---
name: "excel-live-control"
description: "Control an open or active Microsoft Excel workbook through the ChatGPT add-in or connected session. Use when the user tags the Microsoft Excel app in Codex or follows up on an established live Excel task. Do not use for standalone spreadsheet files or Google Sheets."
---

# Excel Live Control

Inspect, edit, analyze, format, and verify the workbook in the selected live Microsoft Excel session. Use connected-document tools for workbook reads and writes; use Computer Use only for application setup, target confirmation, and focus management.

On initial entry, complete the setup gates in order before session discovery. On follow-ups, reuse only the verified target and rediscover after workbook or add-in lifecycle changes.

Resolve every referenced file relative to this skill folder. Do not load the sibling artifact skill or its artifact-tool instructions while this live route is active.

## Important Instructions
- For new workbooks or authorized redesigns, plan the simplest correct workbook that meets the task, audience, actual data and domain. If formulas become hard to read, first reconsider whether the workbook's structure, layout, or logic is overcomplicated before simplifying individual formulas. Remove unnecessary or duplicated logic while preserving calculation correctness, required business relationships, and financial reconciliation
- Instruction precedence for workbook content, layout, and formatting is: user request > reference/template > domain defaults/conventions > general defaults.

## Hard Routing Rules

Use this skill only when explicitly tagged or when the request clearly targets the Microsoft Excel desktop application, an open, active, or connected workbook in Excel Desktop, a selected range in Excel Desktop, the ChatGPT add-in for Excel, or a follow-up edit on the live-control path. For generic requests such as "create a spreadsheet," "create a workbook," or "create an Excel file" without explicit targeting of the Microsoft Excel desktop application or ChatGPT add-in, use the local workbook-authoring `Spreadsheets` skill instead. Stay on the live-control path unless the user explicitly switches targets; keep follow-up edits on the same path.

Routing selects the execution and delivery surface only; it does not override requested workbook content or a supplied reference/template.

Setup is part of the task. Use Computer Use only for setup checks and focus management, then use connected-document tools for workbook reads and writes. If a setup gate or required live capability is unavailable, stop and use the applicable exact guidance below. Do not silently switch to artifact authoring, open an unrelated workbook, or edit workbook cells through Computer Use.

Keep user-facing language to "Microsoft Excel", "ChatGPT add-in for Excel", "open workbook", "connected Excel session", or "live Excel control"; avoid internal connector/backend names.

## Setup State Machine

Complete these gates in order. A later gate cannot prove that an earlier gate passed.

Checklist: Excel app open -> intended workbook active and unambiguous -> ChatGPT add-in installed -> pane open -> signed in -> connected-document tools available -> target workbook registered.

### 1. Open Microsoft Excel And Establish The Target Workbook

Use Computer Use to inspect the Microsoft Excel application.

- If Microsoft Excel is installed but closed, open it.
- If Microsoft Excel is unavailable, use the exact **Excel unavailable** guidance below.
- If Excel shows its start screen or has no workbook open, open the workbook named by the user. If the user did not name an existing workbook, create a blank workbook.
- Wait until the workbook title, worksheet grid, and ribbon are visible. The Excel start screen is not a workbook.
- If several workbook windows are open, identify the intended workbook by title. Do not assume that the frontmost workbook is the target.
- If the request depends on the current selection, verify the selected sheet and range. If the selection is missing or ambiguous, ask the user to select it or provide an exact sheet and range.

### 2. Determine Whether The ChatGPT Add-in Is Installed

Inspect the Home ribbon only after a workbook grid is active.

- A visible `ChatGPT` button on the ribbon is positive evidence that the add-in is installed.
- If the button is absent, open **Home > Add-ins** and look for **ChatGPT** published by **OpenAI, LLC**. Do not infer that the add-in is missing only because its task pane is closed.
- If ChatGPT is not present in the ribbon or the installed add-ins list, treat the add-in as not installed.

For a missing add-in, give the user these exact choices:

1. Open the official Microsoft Marketplace listing: https://marketplace.microsoft.com/en-us/product/office/WA200010215
2. Or, in Excel, go to **Home > Add-ins**, search for **ChatGPT**, verify that the publisher is **OpenAI, LLC**, and choose **Add** or **Get it now**.
3. Return to the target workbook and open **ChatGPT** from the ribbon.

Installing an add-in is a user-controlled software-install action. Ask the user to complete the final install step, then resume inspection. If the Microsoft Marketplace or Office add-in store is blocked by organization policy, ask the user to contact their Microsoft 365 administrator. The official OpenAI setup and admin-deployment guidance is at https://help.openai.com/en/articles/20001063-chatgpt-for-excel/.

### 3. Open The ChatGPT Add-in Pane

If the add-in is installed but its pane is not visible, click **ChatGPT** on the Home ribbon. Allow a few seconds for the task pane to load, then inspect the pane again.

- A ribbon button without a visible task pane means installed but not open.
- A task pane titled **ChatGPT** means the add-in is open, but it does not by itself prove that the user is signed in.
- If Excel shows an add-in load or restart error, retry opening the pane once. If the same error returns, stop and tell the user what Excel displayed. For a recurring Windows SSO add-in error, direct the user to OpenAI Support as described in the official setup guidance.

### 4. Verify ChatGPT Sign-in

Inspect the contents of the open task pane.

- A normal chat surface such as **New chat** with the composer text **Ask anything, @ for context** is positive evidence that the add-in is signed in.
- A **Sign in**, **Log in**, **Get started**, account-choice, or workspace-access screen means sign-in is incomplete.
- Do not infer sign-in from the ribbon button, the pane title, or a previously signed-in browser session.

If sign-in is incomplete, ask the user to take over and finish sign-in with the ChatGPT account and workspace they intend to use. The user must handle credentials, account choice, SSO, and MFA. If the workspace says the add-in is disabled, the user needs a ChatGPT workspace administrator to enable **ChatGPT for Excel and Sheets** in workspace permissions. Resume only after the normal chat composer is visible.

### 5. Verify Connected-Document Tool Availability

After Excel, the target workbook, the open add-in pane, and sign-in are all verified, check whether `list_document_sessions` is available in the current Codex thread.

- If the tool is unavailable, do not report that the workbook failed to register. The current Codex thread did not load the connected-document tool surface.
- Tell the user to confirm that the Spreadsheets plugin is installed or reinstalled, then start a new Codex thread and retry the Microsoft Excel request. A thread does not necessarily acquire newly installed plugin tools after it has started.

### 6. Verify Workbook Registration

Call `list_document_sessions(surface="excel")` only after the previous gates pass.

- If exactly one session matches the target workbook, select it.
- If several sessions match and the target is unclear, ask the user which workbook to use.
- If sessions exist only for other workbooks, do not send commands to them. Activate the intended workbook, open its ChatGPT pane, keep the pane visible, and retry discovery.
- If no Excel session exists, keep the target workbook active, select a cell in it, keep the signed-in ChatGPT pane open, wait briefly, and retry once.
- If no session appears, close and reopen the ChatGPT pane once, wait for the normal composer, and retry once.
- If the workbook still does not register, tell the user that Excel and the add-in are ready but Codex cannot see a connected session. Ask the user to reopen the target workbook or restart Excel, then reopen ChatGPT and sign in if prompted. Do not loop indefinitely.

Workbook registration is tied to the current workbook and add-in lifecycle. Rediscover sessions after the workbook is renamed or saved under a new name, after the add-in reloads, after Excel recovers or restarts, or when a previously working command reports a missing or stale session. Never reuse an `executor_session_id` merely because its workbook title looks similar.

### Exact User Guidance For Incomplete Gates

Use the smallest applicable message and wait for the user when their action is required:

- **Excel unavailable:** "I cannot find the Microsoft Excel desktop app. Install or make Microsoft Excel available, open it, and tell me to continue. I will not switch this request to another spreadsheet workflow unless you ask me to."
- **Target workbook unclear:** "Microsoft Excel has more than one workbook open, and I cannot safely identify the target. Tell me the workbook title to use, or bring that workbook to the front and tell me to continue."
- **Add-in missing:** "Microsoft Excel and the workbook are open, but ChatGPT for Excel is not installed. Install the OpenAI add-in from https://marketplace.microsoft.com/en-us/product/office/WA200010215, or use Home > Add-ins in Excel and search for ChatGPT by OpenAI, LLC. Open ChatGPT from the ribbon when installation finishes, then tell me to continue."
- **Installation blocked:** "Your organization is blocking the Microsoft Marketplace or the ChatGPT add-in. Ask your Microsoft 365 administrator to deploy ChatGPT for Excel using the admin guidance at https://help.openai.com/en/articles/20001063-chatgpt-for-excel/. After the add-in appears in Excel, open it and tell me to continue."
- **Pane closed:** "ChatGPT for Excel is installed, but its task pane is closed. Open ChatGPT from the Home ribbon and keep the pane visible, then tell me to continue."
- **Signed out:** "The ChatGPT pane is open, but sign-in is not complete. Please finish sign-in, account/workspace selection, and any MFA in the pane. When you see New chat and the Ask anything composer, tell me to continue."
- **Tools unavailable:** "Excel and ChatGPT for Excel are ready, but this Codex thread does not have the connected Excel tools. Reinstall or enable the Spreadsheets plugin if needed, then start a new Codex thread and retry this request."
- **Wrong workbook registered:** "Codex can see an Excel workbook, but it is not the workbook you asked me to use. Activate the target workbook, open its ChatGPT pane, and tell me to retry. I will not send commands to the other workbook."
- **Workbook not registered:** "Excel and the signed-in ChatGPT pane are ready, but Codex cannot see this workbook yet. Keep the target workbook active, reopen the ChatGPT pane, and tell me to retry. If it still does not connect, reopen the workbook or restart Excel and open ChatGPT again."

## Live Commands

Before live commands, fetch the selected session's tool schemas with `get_document_tool_schemas`, then call `execute_document_command` with the exact `executor_session_id`, schema-valid args, and a caller-stable `idempotency_key`. Treat advertised schemas as the live-control contract.

Default to direct live workbook tools when the selected session advertises them: `read_ranges`, `search_workbook`, `list_items`, `write_range`, `clear_range`, `update_sheet`, `update_workbook`, `copy_range_to`, `read_range_image`, `read_sheets_metadata`, `resize_range`, `update_sheet_view`, `format_range`, `chart`, `table`, and `pivot_table`. The session may also advertise `run_officejs`; use it only under the Office.js gate below.

### Live Workbook Quality Checklist

For generated workbooks, source-to-workbook conversions, analytical trackers, and substantial workbook edits, apply the shared workbook quality rules and live completion rules in this skill before final response.

Minimum live verification:

- Inspect key values and formulas after writes; resolve formula errors, blank outputs, broken references, and obvious mismatches with the requested logic.
- Follow `features/charts.md` for chart source and object verification. For tables and PivotTables, verify source ranges before creation and confirm the expected native objects with `list_items` when available.
- Use `read_range_image` for charts, dashboards, dense presentation tables, or substantial layout changes; fix blank charts, clipped headers or numbers, unreadable formatting, and obvious layout overflow.
- For long multi-sheet builds, verify and format each user-facing sheet before moving far ahead; do not defer all content checks and layout repair until the end.
- For dashboards, reports, scorecards, and trackers, apply the relevant layout and formatting guidance from `style_guidelines.md` and chart decision rules from `features/charts.md` when those files are required.
- Do not treat successful setup, a completed command, or a saved workbook as task completion until the workbook content has passed the relevant checks.

When the user expects a file from a live Excel session, save through the selected session only when an advertised command supports save or export behavior. If no such command is available, report that limitation and leave host-global save or recovery unchanged.

If the selected session does not advertise a tool needed for the request, follow the workbook-registration rediscovery rules once if the workbook or add-in changed. Otherwise report the missing live capability and wait for the user to repair setup or explicitly switch targets.

## Office.js Gate

Before calling `run_officejs` for any reason, read `officejs.md` completely in the current turn and follow its decision boundary and instructions, even when the schema is already available. The hard routing rules above continue to govern setup, Computer Use, and fallback behavior.

## Out Of Scope

Do not use live Excel control for Google Drive, Google Sheets, or other cloud spreadsheet connector requests.

Do not claim live control can install desktop apps, change OS or Excel settings, enable macros, use COM/win32com, run native print/PDF/export/page-setup workflows, bypass workbook protections, or perform commands not advertised by the selected session.

Treat spreadsheet-processing code questions as software implementation or debugging unless the user also asks to control a connected Excel session.

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
- **Sensitivity analysis:** For requested one- or two-input sensitivity analyses, use native What-If Data Tables where supported when the alternative would duplicate complex model logic in the sensitivity grid. Simple, self-contained calculations may use ordinary formulas. For requested Excel financial-model sensitivities, default to native What-If Data Tables where supported; follow [Finance Guidance](domain_guidance/financial_models.md#valuation-and-returns) for model links and verification. Do not introduce `TABLE` into an ordinary forecast or case comparison, or manufacture a second varying input with a metric selector. Excel supports one or two varying inputs; use a native data table only when the selected Excel session advertises a supported command. Two inputs test one output across their combinations; use separate tables for additional outputs. If the requested native design is unsupported, explain the limitation before agreeing on a formula-based design or change-input/recalculate/restore process. Label captured results and their refresh method. Ordinary case comparisons follow the single-build and comparison boundary above.

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
- `style_guidelines.md` for formatting.

As applicable:
- `officejs.md`: read completely before using `run_officejs`; do not read it for direct-tool-only work.
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
Use native Excel tools to verify requested features and results within the authorized changes and their affected dependencies. Match coverage to the scope, complexity and risk. Report unrelated pre-existing defects without repairing them and keep authoring-only tests out of the delivered workbook.

Use only tools advertised by the selected Excel session, with their advertised schemas.

1. Inspect key ranges:
- Read key values and formulas after writes with `read_ranges` or an advertised equivalent.
- Use workbook metadata, range reads, and object inspection to capture the pre-edit baseline and check for unintended changes across tabs.
- Confirm chart, table, and PivotTable objects and their source ranges with `list_items` and other advertised reads when available.

2. Scan formula errors:
- Use `search_workbook` or an advertised equivalent to locate `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, `#NUM!`, `#NULL!`, `#SPILL!`, and `#CALC!` errors.

3. Verify visual output with `read_range_image` or an advertised equivalent:
- For long multi-sheet builds, verify each user-facing sheet as it is built rather than deferring all checks until the end.

For creation or broad authorized restructuring, visually review every sheet. For a narrow edit, review the changed view and affected dependencies, then compare all tabs with the source for unintended value, formula, object, validation or style changes. Do not repeatedly render unchanged tabs; investigate any scope-preservation failure.

Inspect at normal zoom with cells unselected. Fix blank/broken charts, low-contrast text, unreadable fonts, clipped headers/numbers, `####`, awkward wrapping, truncated chart labels, default blank sheets and content outside the working area. Check effective cell/chart fonts, fitted row heights and widths, pane boundaries and conditional-format ranges. Logical titles and labels should appear once with a clear layout. Valid check values should stay neutral, with errors and missing inputs visibly distinct. Do not shrink content to force a fit.

4. Keep verification compact:
- Use native Excel tools to verify requested features and results, reusing checks for unchanged content.
- Successful setup or a completed command does not prove that the requested workbook content is correct. Apply the shared checks to the connected workbook itself.
- Avoid arbitrary formula count checks, assumptions about file storage, and huge diagnostic dumps.

5. Finalize when the connected workbook passes the checks above.
- Follow this skill's setup and missing-capability rules if a required live check is unavailable. Do not substitute Artifact Tool or require a local workbook export to verify a live edit.

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

## Completion

- Complete a live edit only after the connected workbook contains the requested changes, key values and formulas have been inspected, and native objects have been confirmed when relevant.
- Use `read_range_image` or the advertised equivalent for charts, dashboards, dense presentation tables, or substantial layout changes. Fix material clipping, overlap, blank charts, unreadable formatting, and visible formula errors before finishing.
- Do not require a local `.xlsx` export unless the user explicitly requests one and the selected session advertises a supported save or export command.
- For question-only requests, answer from the connected workbook context without editing unless the user asks for a change.
- If setup or a required live capability is blocked, use the smallest applicable user guidance from this skill and wait. Do not silently switch to artifact authoring.

## Error Recovery
On first tool or API error:
1. Read error text.
2. Consult the selected workflow's targeted help or schema discovery only if needed.
3. Retry with minimal patch (not full rewrite).
4. Continue from existing workbook state.

Do not loop indefinitely on similar failures.



## Comment Author
- If the authenticated profile provides a display name, use it as the threaded-comment author unless the user requests another name. Default to `User`.

## Source, PDF, and Attachment Processing
- For attachment references, include only the file/section/table details needed to locate supporting data. Do not paste large PDF excerpts unless requested.
- Use bundled extraction libraries only for supporting analysis. Keep auditable and user-editable calculations in workbook formulas, then write results through the connected Excel session.
