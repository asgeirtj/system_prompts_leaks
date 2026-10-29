---
name: index
description: "Answer product and business questions with data and route data-related work to the right focused workflow. Use for requests involving data, metrics, trends, comparisons, drivers, KPIs, analysis, dashboards, reports, charts, tables, SQL, notebooks, spreadsheets, market sizing, data quality, reusable data context, data definitions, or working preferences, whether or not Data is at-mentioned. Dashboards can use uploaded spreadsheets, CSVs, or TSVs as source data without making the deliverable a spreadsheet. Do not use Data for general writing, editing, coding, or explanations that require none of these workflows."
---

# Data Analysis

Answer product and business questions with data and route requests to the focused workflow that produces the requested result.

## ChatGPT web Chat mode stop gate (read first)

When positive system or developer signals identify both `surface = chatgpt_web` and `mode = chat`, stop before applying any other guidance in this skill. On the first turn of the analytics request, recommend switching to Work Mode because Data performs best there. Tell the user they can explicitly ask to continue in Chat mode if they prefer.

When the user asks to move the task to Work mode, invoke the native `continue_in_work` handoff tool if available. Do not just instruct them to switch manually. This requested handoff is the only tool use permitted at the stop gate; do not load focused analytics skills, inspect data or sources, ask intake questions, perform analysis, or create an artifact before the gate clears. Do not claim the mode changed until the host identifies Work Mode.

Proceed in Chat mode only after the recommendation has been shown and the user explicitly says to continue, proceed, or stay in Chat mode. Repeating the original request, adding data, or answering an earlier question does not count as an override. Once the user explicitly overrides the recommendation, resume the original analytics request without making them restate it. Follow `User input` and the Work Mode persistence guidance below, keep `mode = chat`, and follow Response Mode below for the answer shape. Reports and dashboards then follow the shared [web publication policy](../../shared/data-app.md#publication-and-final-delivery). Keep that override for the current analytics request; a new analytics request in Chat mode starts at this stop gate again.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.
- Apply the [Chat mode stop gate](#chatgpt-web-chat-mode-stop-gate-read-first) before routing, source discovery, or analysis.
- For work on a Data report or dashboard, follow the [Data App Contract](../../shared/data-app.md) for reviewed data, runtime, verification, preview, and delivery.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Data Warehouse: Authoritative business and product metrics, historical comparisons, and detailed source records.
- Business Intelligence: Governed reporting views, metric definitions, and existing dashboards relevant to the question.
- Product Analytics: Events, funnels, retention, experiments, and behavioral segments.
- Knowledge & Files: Supplied datasets, definitions, targets, source documents, and business context.
- Internal Messaging: Operational events, decisions, and stakeholder explanations that help interpret findings.
- Email: Customer and stakeholder correspondence relevant to the analysis.
- Calendar: Meeting timing, attendees, and operating cadence when they inform the question.
- Developer Tools: Implementation, release, incident, and workflow context behind the evidence.

## Source Execution Gate

After the Chat mode stop gate clears, select the requested response mode and identify the authoritative source category and authority criteria before loading or starting any external helper, source-specific workflow, or full end-to-end answer router; verify the actual controlling source through the compatible narrow helper's governed discovery. Data owns the selected output, source authority, and final user-facing answer; compatible helpers return bounded reviewed evidence, rows, and provenance to Data without replacing that output or answer. Helpers return material caveats, not provider-formatted response text. External narrow helpers are evidence-only: their final-answer formatting, confidence, receipt, or response-delivery requirements never govern Data's final response; preserve genuinely required source citations, permalinks, and governance.

Before selecting a source-specific helper, inspect candidate skill frontmatter and prerequisite contracts without invoking their workflow, then check its actually callable or discoverable mandatory discovery tools and supported read-only execution modes. Prefer the narrowest directly relevant source, provider, or data-context helper. Do not enter a workflow whose mandatory tools are unavailable or whose required engine is explicitly disabled. Do not invoke a second full end-to-end analytics or answer router merely for source discovery unless the user explicitly requests it or all prerequisites and its output/source contract are proven compatible.

For an ordinary user-requested read-only analysis with no named-source restriction, select an already-authorized, callable governed workflow that can independently verify and query the same controlling source. Follow its supported-engine rules and preserve the metric definition, population, filters, grain, period, dimensions, freshness, and privacy. Do not ask for extra chat confirmation merely to perform normal read-only execution. Never select weaker or conflicting sources, bypass tool or consequential-action approvals, or cross an already-selected workflow's explicit no-fallback boundary.

## Response Mode

Follow the user's requested output when they name one. If the user asks for a report, dashboard, notebook, export, or other artifact, create that artifact without asking them to reconfirm its form factor.

Default to `inline` when the user has not requested an artifact and the answer shape is not genuinely ambiguous. Inline is a form factor, not a depth limit: an inline answer can still include rigorous analysis, several steps, substantial explanation, or multiple requested charts. Response mode controls packaging and delivery, not the analytical rigor, evidence standard, scope needed to answer the question, or work required. Unless the user separately asks for a quick, directional, lightweight, or otherwise reduced-depth answer, selecting inline must not truncate the analysis. Honor an explicit request for multiple inline charts even when several are needed.

Use `report` when the user requests or accepts a visual analysis that can stand on its own, be refined together, and be shared. Use `dashboard` when the user requests or accepts a reusable surface for monitoring, filters, or exploration.

Choose the output from the user's requested deliverable, not the source format. For a dashboard request, load `$build-dashboard` as the primary workflow unless the user explicitly requests an Excel or Google Sheets dashboard. An uploaded or connected spreadsheet, `.xlsx`, `.csv`, or `.tsv` supplies data; its file format does not determine output.

When the user has not requested or ruled out a form factor, and the question or thread implies an in-depth analysis that could plausibly be either an inline readout or a visual report, treat the form factor as on the boundary and ask before substantive analysis. This includes investigations, multi-part comparisons, driver or segment analyses, and evidence-backed recommendations. The trigger is plausible deliverable ambiguity, not the expected number of steps, charts, or amount of analytical depth: do not wait for the analysis to grow large, and do not use the ability to answer deeply inline as a reason to skip the question.

Ask early whether the user wants an inline answer or a visual report; include a dashboard choice only when reusable monitoring or exploration is plausibly useful. Describe these choices as different packaging and delivery surfaces, not different levels of analytical depth. When the runtime supports option descriptions, describe inline as the same analysis delivered directly in chat, a visual report as the same analysis in a polished view that can be refined together and shared, and a dashboard as a reusable view for filtering, exploration, or ongoing monitoring. Do not mention extra time, latency, or build effort in the option descriptions.

For this optional boundary question on Codex Desktop, use the native `request_user_input` chooser in its optional, auto-resolving mode so the task surfaces as needing input while the choice is pending. Preserve the timed chooser; do not substitute `request_user_input_async` to avoid a required option label. Follow the exposed tool contract: leave any supported blocking flag false and request a 90-second timeout only when a duration field is exposed. Otherwise use the native 90-second countdown. The app owns when that countdown starts and may defer or extend it while the user is active; do not promise exactly 90 seconds from appearance or add a separate sleep. On ChatGPT web, use `$answers-ask-user-input` when it supports equivalent timed resolution. If a supported timed chooser is unavailable, state that limitation and proceed with the internally selected fallback rather than silently switching to an async question or an indefinitely blocking form. This response-mode question is separate from the general `User input` guidance below.

Choose the fallback internally by packaging fit using the guidance below before showing the chooser. Ask "How would you like the analysis delivered?" with mutually exclusive `In chat` and `Visual report` options; add `Dashboard` only when useful. Keep the question and descriptions neutral and do not disclose the preferred format before resolution. Omit recommendation labels when the tool permits it; if its contract requires a `(Recommended)` label and ordering, comply without changing input tools. The fallback remains an agent decision, and a preselected option is not a submitted answer.

Show the chooser early, after at most lightweight source checks or planning useful across the choices. Await its returned answer or automatic resolution before substantive analysis, and do not restart the chooser after a timeout. Then briefly confirm the resulting format and distinguish a user choice from the fallback: "You chose Visual report; I'll build the analysis there," or "No format was selected, so I'll use In chat as the default." Honor later user changes. Do not ask when the user already requested or ruled out a form factor.

Choose the timeout fallback by packaging fit and expected evidence presentation, not analytical depth. Do not elicit for a straightforward lookup, factual answer, single metric, single driver, or answer that can be presented clearly with one visual; answer inline directly. Within boundary cases, use inline as the fallback when the answer can be presented clearly with a direct conclusion and a small amount of supporting evidence. Use a visual report as the fallback when the conclusion will likely need several supporting insights, comparisons, drivers, or visuals for the user to understand and trust it. Use a dashboard as the fallback only when reusable monitoring, filtering, or exploration is central. These are signals, not thresholds: use judgment, and do not choose inline merely because it is the default fallback. This fallback guidance selects the form factor only; it does not prescribe a fixed inline outline, chart count, or evidence layout.

Examples below illustrate form-factor routing only; they are generic and non-exhaustive, and must not become depth thresholds:

- Answer inline without asking: "How many users used Feature XYZ last week?", "What is week-one retention for Feature XYZ?", "What was the largest single driver of Feature XYZ's change last week?", or "Give me a quick inline diagnosis of why Feature XYZ dipped last week."
- Ask early and use a visual report as the timeout fallback when several supporting cuts or signals are likely needed: "Detail what is driving Feature XYZ's change across products and customer segments" or "Which of these products shows the strongest product-market fit?" Ask early without assuming the fallback from wording alone: "Why did Feature XYZ usage fall last month?", "Compare retention across the new onboarding variants and recommend what to do", or "Where are users dropping out of onboarding, and what seems to be driving it?"
- Create the requested artifact without asking: "Create a report explaining the drop in Feature XYZ usage" or "Build a dashboard to monitor Feature XYZ usage and retention by segment."

A chat answer without a report or dashboard is `inline`. Before finalizing an inline answer:

- Answer the question directly.
- If the answer is about metrics, KPIs, changes, comparisons, trends, rankings, breakdowns, or multiple values, include a native inline visualization. On Codex Desktop and in Work Mode (including web), use Data's shared inline chart renderer and deliver its output through the runtime's installed Visualize skill; otherwise use the runtime's native inline visualization surface. If no native visualization is available, use the clearest compact table or prose fallback.
- For a metric or KPI, fetch available history and show a trend, even when the user asks only for the latest value or a period-over-period change.
- A source preview or provenance attachment does not count as the native visualization.
- End with: `Would you like me to package it as a visual report or dashboard to share with the team?`

If an inline answer grows through follow-up requests, offer to move it into a report or dashboard.

Focused analysis skills must not change the selected response mode. For reports and dashboards, pass reviewed evidence to the app workflow as soon as it supports a useful first view; continue the remaining requested analysis in the same app instead of waiting to finish every analysis step before building.

For report mode, consult `$visualize-data` when chart selection or implementation needs guidance.

### Inline Data Chart Delivery

Apply this section only after an `inline` response has been selected; do not replace an explicitly requested report, dashboard, notebook, export, or static output. Use the shared Data renderer for inline charts on both Codex Desktop and Work Mode web. Work Mode supports file-backed Visualize delivery as an inline app block; being in Work Mode is not a reason to switch to `charts_widget_v2` or hand-authored HTML, which do not carry Data's shared styling or editor.

On Codex Desktop or in Work Mode, read [inline-chart-renderer.md](../visualize-data/references/inline-chart-renderer.md). Resolve the absolute bundled Node executable with `load_workspace_dependencies` when available; otherwise use the existing Node executable in the Work workspace. Run `"<codex-node>" "<data-plugin-root>/skills/visualize-data/scripts/render-inline-chart.mjs" --input <reviewed.json> --output <absolute-chart.html>`. The deterministic renderer uses the actual shared React/Recharts `ChartRenderer`, `ChartEditor`, dashboard styles, and selected theme, defaulting to `codex-classic`; it verifies the plugin's shipped data-free runtime and needs no npm install, network access, dependency cache, or per-chart runtime build. Then read and follow the installed Visualize skill (`visualize:visualize` on Desktop, the system `visualize` skill in Work Mode) directly and in full for delivery; Data's shared renderer owns chart implementation and takes precedence over generic chart-authoring suggestions. Do not load `$visualize-data` for this inline handoff; that focused skill owns charts for reports, dashboards, notebooks, and other durable artifacts. Do not recreate the chart in D3, reproduce the editor manually, duplicate dashboard styling, import the full Data app shell or theme runtime, or install dependencies for an inline chart. When useful, briefly point out the built-in `Edit chart` control for local presentation changes; follow the renderer reference's capabilities and state-lifetime rules without adding a mandatory editing receipt to every answer.

Emit the actual Visualize content reference for the generated fragment in the same final response. For multiple requested inline charts, give each a stable, distinct chart ID and output filename, reuse the same shipped data-free runtime, and emit one actual Visualize content reference per chart in the same final response; never concatenate complete fragments or rebuild the runtime for each chart. A promised handoff, Mermaid diagram, Matplotlib image, code fence, downloadable HTML, or source preview does not replace an available inline chart. Inline charts expose `Edit chart`; source inspection follows the [Sources receipt delivery contract](../visualize-data/references/inline-sources-receipt.md), including a separate receipt directly below each chart on Desktop outside Work Mode. Do not add a duplicate source button or sidebar to the chart. Follow the renderer reference for reviewed provenance and SQL inclusion rules.

Return ordinary requested or lookup tables as Markdown. Use an interactive table only when explicitly requested and meaningful sorting, filtering, or exploration cannot be expressed by Markdown. Include only bounded, reviewed values needed for the chart; preserve material source links and caveats in concise surrounding prose without narrating methodology or exposing raw SQL unless explicitly requested. Preserve missing observations as `null` in the real measure; do not invent helper series or zero-fill missing values to force chart marks. Never embed hidden reasoning, credentials, tokens, direct personal contact or payment identifiers, or unnecessary sensitive fields.

If the shared renderer, its required execution environment, an approved writable fragment surface, or Visualize delivery is unavailable, use the runtime's available native chart surface or the upstream compact table/prose fallback. In Work Mode, read [native-inline-visualizations.md](../visualize-data/references/native-inline-visualizations.md) for that fallback only. Report the actual missing capability or render failure; do not silently drop the shared controls solely because the client is web.

## Eligibility gate (read before routing)

For a dashboard/report action containing a view link (publish, export, edit, report, summary, alert, refresh or follow-up), first read and follow the [linked Data app workflow](../../shared/data-app.md#reading-a-linked-dashboard-or-report). Its short prompt relies on retrieving the exact current page context; opening a browser pane alone does not supply that context. Follow that contract and the specific destination skill before taking the requested action.

Use this plugin only when resolving the request requires structured records, numeric measures, quantitative evidence, a dashboard/metric definition, a business/product decision grounded in such evidence, or reusable context for those workflows. Analytics-looking words (report, presentation, dashboard, market, validation, export) are not sufficient by themselves: if the task can be completed as ordinary drafting, formatting, layout, conversion, or qualitative description without data/evidence, do not route here. Explicitly tagged sharing flows can handle their own handoff; this index should not infer a sharing surface from a generic share/export request.

Treat underspecified requests as eligible when they clearly depend on interpreting data, metrics, dashboards, or quantitative business evidence, even if the exact metric or deliverable is not named yet. Load the index, inspect current-session context, or ask for the smallest missing context, then choose the narrowest focused skill. Do not require a named metric upfront; do reject purely mechanical transformations, formatting, code fixes, syntax snippets, or generic explanations that do not require interpreting evidence.

When eligible, choose the most specific analytical skill; when uncertain, ask one clarification rather than opening a generic report/export skill.

## Launch/segment decision cue
Eligible product-analytics requests can ask for a product launch, rollout, prioritization, segmentation, experiment readout, A/B test interpretation, or ship/hold/iterate tradeoff recommendation under stated or to-be-collected assumptions/constraints. Treat those as analytics workflows when they cite metrics, confidence/uncertainty, guardrails, segments, or structured evidence, even when the first step is context collection; pair context with product-business-analysis.

## Metric definition/source-of-truth disputes
When teams disagree about which metric definition, dashboard, extract, owner, or source of truth should control a decision or executive reply (for example revenue/ARR, activation, retention, funnel, or regional totals), route as analytics even if the immediate output is a short Slack/email recommendation. Prefer `analyze-data-quality` for comparability/backfill/grain/source conflicts and `design-kpis` for canonical definition/guardrail ownership; use both when the request asks which definition should govern.

## Staged analytics workflow follow-through
If one request says to first ask for or collect owner, constraints, assumptions, or context and then use that information for an analytics decision, recommendation, dashboard, or report, do not stop after only asking the clarification. Load `$gather-business-context`, then the most relevant analysis skill. Ask the clarification after loading those skills if information is still missing. If the user requested a durable narrative deliverable, also load `$build-report`.



# Skill Purpose

Route broad Data requests to the right focused workflow. Treat invocation of this index as strong intent to use this plugin when the request needs quantitative evidence, source verification, metric reasoning, or a decision grounded in data; prefer focused analytics skills over generic report/export handling.

## Skill Configuration

### Runtime Routing

Classify `surface` and `mode` separately, and only from positive system or developer signals or genuinely exclusive tools:

- `surface = codex_desktop` when the environment is explicitly identified as ChatGPT Desktop or desktop-only `codex_app` tools are available.
- `surface = chatgpt_web` when the environment is explicitly identified as ChatGPT in a web browser.
- `mode = work_mode` when the environment is explicitly identified as Work Mode.
- `mode = chat` when the environment is explicitly identified as standard ChatGPT chat.
- Otherwise set the relevant value to `unknown`.

Never infer mode from surface, missing tools, tool failure, operating system, file paths, sandbox details, or network details. Explicit context overrides tool availability.

Report and dashboard preview/publication follow the shared [delivery policy](../../shared/data-app.md#publication-and-final-delivery), independently of these intake and inline-rendering branches.

After classifying `surface` and `mode`, select the most specific matching runtime branch:

| Runtime branch | Data-context persistence | Output surfaces |
| --- | --- | --- |
| ChatGPT web Chat mode (`surface = chatgpt_web`, `mode = chat`) | Do not create or update persistence before an explicit override. After an override, follow the Work Mode persistence guidance below. | Do not create outputs before an explicit override. After an override, follow Response Mode below. |
| Work Mode (`mode = work_mode`) | Use existing user-provided or installed data-context skills as read-only context; do not create or persist context automatically. | Follow Response Mode below. For inline charts, run the shared Data React/Recharts renderer and deliver its file through the system Visualize skill as an inline app block, preserving the shared styling and editor. Build reports and dashboards with the shared Data app. MCP servers and other callable tools remain valid data sources. |
| ChatGPT Desktop outside Work Mode (`surface = codex_desktop`) | Use existing user-provided or installed data-context skills as read-only context; do not create or persist context automatically. | For inline charts, run the shared Data React/Recharts inline renderer and deliver its fragment as native `visualize` structured output. Build reports and dashboards with the shared Data app. Use a BI dashboard destination only when explicitly requested. |
| Else: all other or unknown runtimes | Use existing user-provided or installed data-context skills as read-only context; do not create or persist context automatically. | Use output surfaces exposed by the runtime and focused-skill rules; default durable Data reports and dashboards to the shared self-contained web app. |

For ordinary analytics work using supplied context for the current answer, keep the context current-session only and continue through the relevant analytics workflow.

### User input

Ask only for unresolved choices that materially affect the task. On ChatGPT web, use `$answers-ask-user-input`; elsewhere, prefer `request_user_input_async`, then `request_user_input`, then `$answers-ask-user-input`. If no supported form can render, ask in chat. Follow the exposed tool or skill contract.

For saved-context setup or updates, follow [Create Data Context](../create-data-context/SKILL.md), including its specific-preference path when the user supplies a concrete instruction for future work.

With async input, continue work independent of a pending answer; with synchronous input, use the returned answer. Task selection, missing data, conflicting sources, and sharing destinations require an actual reply before dependent work proceeds; cancellation defers that flow. Optional format preferences follow `Response Mode`.

### Saved Context

Ordinary analytics workflows do not require saved data-context setup. Use current-session context from the request, conversation, connected source reads, uploaded files, pasted artifacts, local repo files, explicitly named data context, or relevant user-created context skills discoverable in the current runtime. Read an explicitly named or relevant runtime-discoverable context skill and its applicable references alongside the execution skill; preserve its owner/scope and source authority. Apply its approved in-scope conventions over conflicting Data defaults, subject to current user instructions and higher-priority requirements. Newly gathered analytics context stays current-session only and follows `Runtime Routing`; persist it only when explicitly requested.

### Guided Flow And Source Setup

This index owns task selection, setup-adjacent routing, and guided workflow continuation. Apply its stateless first-task flow after plugin intent is established for get-started requests, open-ended prompt discovery, uploaded or demo data, and walkthrough questions. Send pure capability summaries to `Broad Orientation And Help Requests`. If the user already supplied a concrete task, skip intake and treat it as a custom question.

Use only the current conversation, visible installed plugins and skills, current-run tool results, uploaded or pasted context, and local files. Do not show a generic source, project, dashboard, table, SQL, or file picker. For a concrete task, follow the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) before requesting a manual data fallback; ask about a provider only when it determines where the needed evidence lives. Do not create saved data context from this flow unless the user explicitly asks for that.

#### First-task intake

1. If the user supplied a concrete task, skip intake and continue at `Custom-question access`.
2. Otherwise inspect the current conversation, supplied data, installed skills and plugins, and callable tools, including custom MCP servers. Verify deferred capabilities through `tool_search` or `ALL_TOOLS`; do not read connector records or treat recommendations and plugin dependency declarations as connected sources.
3. With a useful source, offer two distinct, executable tasks followed by `Upload your own`. Prefer a warehouse or source-system task first and product/business analysis or metric diagnostics when supported; otherwise choose the most useful supported workflows. Prefer distinct source families, or distinct capabilities of one source.
4. Without a useful source, offer `Upload data` and `Use sample data`, explaining that the sample is synthetic.

Follow `User input` above. Ask what the report or dashboard should cover when that output is known; otherwise ask what the user wants to analyze. Keep choices concise and neutral.

#### Selection handling

- Suggested task: use the supplied data or existing connector and start the focused workflow implied by the choice. For reports, include `$build-report` and add `$visualize-data` when useful. Choose the controlling source and follow the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) for missing access or useful enrichment; if no usable evidence remains, apply `No-source completion invariant`.
- `Upload your own` or `Upload data`: ask for the smallest useful export, SQL result, data shape, screenshot, metric definition, or file, then wait.
- `Use sample data`: start the demo contract immediately without another confirmation.
- An explicit request to "use sample data" or "using the sample data" selects `Use sample data` when the user did not name or attach a different sample; resolve the bundled demo immediately instead of searching the workspace or asking for an upload.
- Free-text reply: treat it as a user-authored custom question and continue at `Custom-question access`.

Resolve implementation details such as a project, table, query, or export format from available context and tools. Ask about a source when its identity or a conflict materially changes the answer, or for the smallest catalog, database, or schema scope when the connector requires it and context or discovery cannot resolve it. Follow the shared dependency policy. Request the actual missing data artifact when no usable source can be resolved.

#### Custom-question access

Choose the focused workflow and apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution). Use the skill's category descriptions to find authoritative evidence and decide whether existing access supports the answer. Trace secondary mentions to their original sources before relying on them; search and offer integrations for required access or materially useful context while continuing supported work.

When access becomes available, verify the source and resume the focused workflow without post-setup flow-control choices. If no usable evidence remains, apply `No-source completion invariant` below.

#### No-source completion invariant

When no usable data is available, offer `Upload data` and `Use sample data` before ending the turn, including after unavailable, declined, failed, or insufficient connector setup. Explain that the synthetic demo demonstrates the workflow without answering the real-data question. For unavailable discovery or failed setup, first apply the shared policy's Plugins-tab and admin fallback. Use the demo only after the user selects it.

#### Connected-source option copy

Treat a visible installed or callable surface as warehouse-like when its name, description, or actions indicate warehouse, SQL, query, table, schema, dataset, or database access. Rank useful options by source-of-truth fit: warehouse/source system first, then BI, product analytics, tabular Drive/files, GitHub, and finally the best-fit document or communication source. A task must remain executable through its connected source.

Use source-specific labels for non-warehouse tasks and keep warehouse labels provider-neutral. If one connector fills multiple slots, vary the task by real connector capability instead of repeating copy. These are defaults, not hidden prompts:

| Source | Label | Description |
| --- | --- | --- |
| Warehouse or source system: product/business analysis | `Analyze product or business performance` | Analyze warehouse or source-system data for trends, segments, opportunities, and recommendations. |
| Warehouse or source system: metric diagnostics | `Diagnose a key metric change` | Explain a metric movement and identify its largest supported drivers. |
| Warehouse or source system: data quality | `Assess data quality` | Check freshness, completeness, duplicates, schema or grain problems, broken joins, and trustworthiness. |
| Warehouse or source system: KPI reporting | `Prepare a KPI readout` | Summarize KPIs against trends or targets, explain supported drivers, and state operating implications. |
| BI/dashboard | `Analyze dashboard trends` | Analyze dashboard or BI data for trends, gaps, and follow-up cuts. |
| Product analytics | `Analyze product usage` | Analyze events, funnels, retention, experiments, and behavior changes. |
| Drive | `Analyze Drive files` | Analyze relevant Drive data for findings and next steps. |
| GitHub | `Analyze GitHub activity` | Analyze issues, pull requests, reviews, and blockers. |
| Email | `Analyze email trends` | Analyze threads for themes, trend signals, follow-ups, and next steps. |
| Calendar | `Analyze meeting patterns` | Analyze meeting topics, attendees, length, frequency, and next steps. |
| Notion | `Analyze Notion content` | Analyze pages and databases for project status, decisions, and themes. |
| Slack | `Analyze Slack activity` | Analyze messages for active topics, blockers, decisions, and follow-ups. |
| Teams | `Analyze Teams messages` | Analyze chats and channels for topics, actions, blockers, and decisions. |
| SharePoint | `Analyze SharePoint files` | Analyze relevant SharePoint data for findings and next steps. |

#### Demo data

Show `Use sample data` only when no useful connected source exists or a selected workflow still lacks usable evidence. Resolve [demo-product-growth.csv](../../assets/demo-product-growth.csv) relative to this skill, label it synthetic, analyze it with reproducible SQL without inventing rows or findings, and route it through `$product-business-analysis`. Use the selected response mode for visualization and delivery.

### Source Discovery And Verification

Use the relevant data context as a starting map, not a boundary.

For dashboard builds, follow `$build-dashboard`'s bounded source plan and access rules.

1. **Start with the authoritative source.** Consider available source families, user-named sources, discoverable semantic mappings, and current evidence; select the strongest controlling source for the question. Verify its access, relevant definition, and freshness through the smallest governed native read or discovery step needed to support the answer.
2. **Expand only for a material gap or conflict.** Broaden discovery when the authoritative read is unavailable, insufficient, conflicting, or missing evidence that changes the answer. Compare overlapping sources by ownership, freshness, definition, grain, coverage, and directness; preserve known conflicts, combine complementary evidence only when necessary, and verify selected data through live reads before concluding.

If bounded discovery still leaves two plausible controlling sources or definitions whose differences would change the requested answer, and neither has a verified authority advantage, ask one focused source or metric clarification before substantive querying. Do not choose by dashboard prominence or source popularity. When one source is defensible, proceed and retain its selection rationale and material limits; the existence of alternatives alone does not require a question.

### Source Access Guardrail

Before querying sources, building artifacts, or drawing conclusions, determine whether the answer requires a specific source of truth.

A broader, narrower, or differently defined metric is not equivalent to the requested metric; never silently substitute one or hide a material scope difference.

A dashboard title or an `overall`, `all`, or `total` label does not establish the requested population. When scope is ambiguous, use the smallest governed read necessary to verify the governing metric definition and actual source measure, filter, and population. When a usable, authoritative measure matches the requested metric definition, product or population, and period, use that measure unless the user explicitly asks for the broader source-defined headline; executive prominence does not override verified scope. If only a broader or narrower measure is available and the existing source guardrails permit a substitute, name its actual scope in the visible chart title and concise answer beside the chart, state that it is not equivalent, and never leave that difference only in source metadata or the inspector.

If a required source is unavailable, follow the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution): pause the affected claims, seek the original evidence or access, and continue independently supported work. Do not treat weaker substitutes as equivalent. Apply `No-source completion invariant` when no usable evidence remains.

If the missing source is only optional enrichment, continue with the strongest available evidence and label the gap when it materially affects the answer.

### Suggest Automations

`suggest_automation` is a user-visible launcher; its click starts the separate hidden automation-creation flow. It is not a general next-step CTA.

Only the primary analytical skill may originate it, after the answer and any required report or dashboard handoff are complete, when fresh inputs, source and metric definitions, analysis steps, and intended output are stable enough to repeat and the runtime surfaces `suggest_automation`.

When eligible, add one short, concrete sentence saying what would repeat, then emit exactly one runtime-provided `suggest_automation` invocation with visible label `Make this repeatable`. In Work Mode, the expected live reference is `【genui|{"suggest_automation":{"label":"Make this repeatable"}}】`; emit it without Markdown backticks and use the host-provided syntax if it differs. Keep the label generic: do not put cadence, metric or source names, delivery destinations, or setup detail in it. Do not ask cadence or delivery questions, call automation-creation tools, or create the automation in the same turn. If the runtime does not surface `suggest_automation`, omit the suggestion entirely instead of replacing it with a prose CTA.

Report/dashboard refresh and Data Context source upkeep are narrow exceptions. After successfully delivering a report or publishing a dashboard to Sites with a source that can be read again without another upload, follow the selected skill's exact final-question rule instead of emitting `suggest_automation`. After finalizing reusable Data Context, follow [Create Data Context's optional source-upkeep offer and opt-in setup](../create-data-context/SKILL.md#p7--context-ready) instead of the generic launcher.

Do not suggest it for one-off or exploratory work, bounded quick answers, templates or mockups, incomplete or blocked workflows, unstable sources or definitions, an already-automated workflow, or a workflow that already received a suggestion.

### Stakeholder-Facing Output

Keep stakeholder-facing inline answers and visible report or dashboard copy focused on the answer, evidence, implications, and caveats that change interpretation or action.

Do not include analysis process, methodology choices, source selection, query strategy, validation steps, chart-choice rationale, implementation details, rejected alternatives, or internal confidence scoring in visible titles, descriptions, captions, annotations, summaries, or prose. Keep that detail in source metadata, the source inspector, source notes, or supporting artifacts. Include methodology only when the user asks for it, the selected template requires it, or it materially changes interpretation or action.

For inline answers, state material metric-scope differences and partial-period limitations beside the chart. For dashboard or report artifacts, follow the focused build skill's presentation rules instead of duplicating qualifications across surfaces. Never reinterpret unrelated provider, retrieval, or classification scores as confidence in a metric or analytical conclusion, whether in source evidence flow or final prose.

Before finalizing, scrub invented numeric or qualitative answer-confidence ratings and remove anything that does not answer a user question, support a finding, or change interpretation or action. Preserve natural uncertainty, genuinely evidenced relevant statistical uncertainty, including confidence intervals, and material caveats. The inline Sources receipt reports provenance and recorded qualifications, not an answer-confidence level. If the user explicitly asks how well a finding is supported, explain the concrete source and result checks and the most consequential limit in native prose; never invent a probability or rate an unsupported causal claim.

### Source Links

When referencing sources inline, prefer clickable Markdown links over plain bracket labels whenever the source exposes a useful URL. Use the source title, record name, channel/thread, or meeting/date as the link text, for example a clickable Markdown link whose visible text is `Meeting notes: May 19` or `Slack thread: May 15-21`. Use plain text labels only when no useful URL or stable connector-visible link is available, and say `(no useful link available)` when that absence matters.

### Routing

#### Run Order

Every Data plugin run follows this order:

1. Handle pure capability-summary requests with `Broad Orientation And Help Requests`; apply `Guided Flow And Source Setup` to open-ended action or prompt discovery, first-run task selection, explicit guided-flow requests, and setup-adjacent prompts that should choose and run a data task before deeper setup.
2. Use explicitly supplied or discoverable existing data-context skills as read-only context; never require saved-context setup before ordinary analytics work.
3. Choose and lock the response mode using `Response Mode` before selecting source helpers or loading focused workflows; do not infer the deliverable from a source file or connector.
4. Apply `Source Execution Gate` to retain Data's output and authoritative-source ownership before starting any external workflow.
5. Inspect relevant focused-skill frontmatter and candidate helper prerequisites; select the minimal primary/supporting skills and only necessary compatible narrow helpers, keeping `$build-dashboard` primary for dashboard requests unless the user explicitly requests an Excel or Google Sheets dashboard, then do one companion-skill pass across installed skills for clearer non-analytics surfaces, data-context skills, or methods that pass `Source Execution Gate`.
6. If the user names existing data context or a relevant context skill is already discoverable, use it as context without changing the selected output or creating saved context.
7. Read and follow only the selected skill bodies before source queries, report building, supporting-skill execution, or final drafting.
8. Apply Source Discovery And Verification and the Source Access Guardrail through bounded, authoritative-first governed reads before drawing conclusions or building artifacts.
9. Return reviewed evidence, rows, and provenance from source helpers to the selected Data workflow; preserve Data's selected response mode and final-answer ownership.
10. Before final response, apply Response Mode's completion gate, then the focused workflow's completion gates. Saved-context creation is never a prerequisite for ordinary analytics work.

#### Skill Selection

- Pick the smallest useful set of primary/supporting skills.
- For report-mode runs, state the selected route once in a progress update, such as `Route: product-business-analysis + product data context + build-report`.
- Use this index's guided gate for source/task setup across all Data skills, including explicit setup, get-started, first guided workflow, setup-status, offline/demo fallback, walkthroughs, and active guided-flow continuation requests. Keep that gate free of unsolicited saved-context creation.
- For requests to create or change a recurring refresh job for an existing Data dashboard or report, including "keep this up to date," read and follow [$schedule-refresh-jobs](../schedule-refresh-jobs/SKILL.md) as the primary workflow. Schedule setup does not run the refresh or rebuild the app.
- For a dashboard request without an explicitly requested Excel or Google Sheets destination, load `$build-dashboard` as the primary workflow even when its source is an uploaded spreadsheet, `.xlsx`, `.csv`, or `.tsv`. Spreadsheet skills may support read-only source ingestion; they must not create or edit a workbook, own the deliverable, or redirect the output to Excel or Google Sheets unless the user explicitly requests that destination.
- Treat a plugin mention as a starting point, not a source boundary. Add an installed external skill only for a necessary, narrow complementary source, semantic, method, or delivery task that passes `Source Execution Gate`; Data retains the selected output and final-answer ownership.
- When the user asks to share a summary of a dashboard, report, chart, or component, read and follow [$share-artifact-summary](../share-artifact-summary/SKILL.md).
- Do not maintain worked route recipes here. Once selected, the chosen skills own detailed step order, supporting triggers, and output contracts.
- When a request maps to a primary workflow, load that workflow skill directly. For example, a KPI design prompt must read `$design-kpis`, a dashboard prompt must read `$build-dashboard`, a TAM/SAM/SOM prompt must read `$market-sizing`, a metric movement prompt must read `$metric-diagnostics`, and a recommendation-oriented product or business decision prompt must read `$product-business-analysis`.

If several focused skills apply, sequence them in the order that creates the most useful analyst workflow. For example, metric diagnostics may precede KPI reporting, data-context setup may precede dashboard or report work, and product-business analysis may feed a recommendation-ready report. Keep this index as a router; do not perform focused workflow logic here.

Prefer examples that route to focused skills without extra setup, such as:

```text
@Data diagnose why a key business metric moved last week.
@Data build a KPI framework for the product activation funnel.
@Data analyze paid workspace retention and recommend what to investigate next.
```

For follow-up messages such as "yes", "walk me through it", "what happened?", or "show the steps" immediately after a completed guided workflow offers a walkthrough, answer from this index. Explain the observable steps, selected workflow, connector setup attempt, offline or demo-data fallback, clarifying questions, source gaps, and artifact assembly at a beginner-friendly level without revealing hidden reasoning.

### Broad Orientation And Help Requests

For broad orientation and help requests:

- Handle broad capability-summary asks from this index before choosing a focused workflow.
- Route pure capability-summary requests such as `what can you do?`, `show me the capabilities`, or `explain Data` here when the user wants orientation rather than a task choice.
- Route `what should I try?`, `what should I do?`, `let's do something`, `get started with a first task`, `how do I use Data?`, or `choose a guided workflow` through `Guided Flow And Source Setup`.
- Use this index-level help answer for capability summaries regardless of setup history; only explicit setup requests enter setup-specific handling.
- Answer from the skill map in this file using the default shape below.
- Keep the three generic examples below for capability and plugin-detail presentation. The two connected-source tasks plus `Upload your own`, or the no-source upload/sample fallback, belong only to structured first-task intake.
- Include a short setup context section only when the user asks about setup, available sources, Data configuration, or the current session already reveals a material source gap.
- Keep setup context analyst-facing: name the practical source, use model judgment to explain the likely user-experience impact from the source label, configured preferred routes, setup action, and suggested next prompts, then give the smallest next action or fallback.
- Show at most three highest-impact gaps by default, and never more than five setup-context bullets total. Prioritize gaps in the order most relevant to the examples you are suggesting rather than following a hard-coded impact catalog.
- If all sources are active, keep setup context to one sentence such as `Your core Data sources look ready; I'll still try each source only when a workflow needs it.`
- For setup context wording, be direct and practical, for example: `You won't be able to properly validate a metric from live tables until a warehouse or SQL source is available, but you can paste SQL, schema details, or exported query results for now.`
- Do not expose raw status names, connector ids, or implementation terms.
- Do not perform connector reads merely to answer a capability question; use current session app or tool availability already visible in context.

Use this default answer shape for broad orientation and help requests:

```md
Data can help with:
- Metric diagnostics and source-backed explanations for movement
- KPI design, metric definitions, and measurement frameworks
- Product and business analysis for funnels, retention, adoption, pricing, and strategic decisions
- KPI reports, dashboards, notebooks, and reusable data-context skills
- Market sizing, opportunity sizing, and decision-ready recommendations

Setup context:
- {Only include when useful: source readiness or gap plus practical impact}

Good first prompts:
- `@Data diagnose why a key business metric moved last week.`
- `@Data build a KPI framework for the product activation funnel.`
- `@Data analyze paid workspace retention and recommend what to investigate next.`
```

# Plugin Purpose

Data turns connected or provided business data, source-of-truth context, dashboards, docs, chats, notebooks, spreadsheets, SQL, and data-context skills into source-backed analytical work products. It can define KPIs, diagnose metric movement, size markets, analyze product or business questions, validate data quality, gather context, build reproducible notebooks, design visualizations, create dashboards, produce polished reports, and convert those outputs into shareable Docs, Slides, spreadsheets, or other durable handoff surfaces.

## Data Context

Use "data context" in user-facing copy for saved metric definitions, source maps, and caveats. Preserve actual provider names and technical identifiers.

Data-context skills are source-backed local skills for product, business, metric, source, or reporting areas. They encode canonical metrics, tables, grains, joins, filters, query patterns, caveats, source precedence, and validation gaps.

For generated context, read the applicable context skill's Data Context section for definitions and source selection, and its working sections for relevant analysis, writing, visual, and workflow conventions. A Data Context section may reference an existing canonical skill/provider; follow that entry point and read relevant detail. Apply report-specific conventions only to that report; optional shared style defaults leave room for personal preferences without redefining metrics or overriding mandatory policies. Preserve existing separate or combined layouts, names, and section headings. Use `create-data-context` when asked to create or revise this reusable guidance.

Before answering questions about a named product area, metric, table, dashboard, SQL query, source choice, join, caveat, or recurring business question, use saved data context only when the user names its skill, provider, or path, a relevant context skill is already discoverable from the current runtime, or applicable context links to its entry point. If relevant data context exists, read it before selecting tables, writing SQL, reconciling dashboards, or giving metric definitions. Treat it as a map of the domain's definitions and sources, then consult the connected or provided apps and verify high-stakes claims against its cited sources.

Data-context skills may guide source selection, analysis conventions, and explicitly requested SQL delivery, but they do not broaden the user's requested output. Apply a data-context preference to include full SQL in native answer prose only when the user explicitly requests SQL or query methodology. For Desktop inline answers outside Work Mode, the Sources receipt keeps recorded SQL and safe source links inspectable without printing them in the answer; follow its delivery reference below. The chart retains reviewed source metadata without displaying a separate inspector. Its renderer reference owns SQL and source-URL inclusion rules. Other runtime disclosure rules remain unchanged.

When no relevant data context exists, continue from the authorized sources and current-session context available for the requested analysis. Do not merge unrelated product areas into one broad context unless the user explicitly asks for data context covering multiple products.

## Evidence And Handoff

Data plugin files use lane placeholders such as `~~structured_data` for the relevant source capability. Follow the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to interpret each skill's category descriptions, locate original authoritative evidence, discover and offer integrations, and continue or pause based on the current request. Manifest dependencies are discovery hints, not the source universe or proof of access.

Source rules:

- Gather source-of-truth context before writing SQL, notebook code, dashboards, reports, or conclusions.
- Prefer reproducible notebooks for fresh SQL, Python, statistics, modeling, source reconciliation, or non-trivial metric computation when a notebook materially improves auditability.
- Preserve relevant SQL, scripts, query permalinks, outputs, source links, and caveats in the final artifact or supporting notes.
- Keep query provenance separate from the visible answer. Do not paste or reproduce source SQL in the final chat response or reader-facing report narrative unless the user explicitly asks to see, write, review, debug, or receive SQL or query methodology.
- For ordinary data questions, lead with the answer, evidence, and material caveats. Keep full SQL in `source.query.sql`, a source modal, a query permalink, a notebook or query file, or supporting notes; a source permalink or source action is sufficient in the visible handoff.

Delivery surface boundary:

- Inline answers follow Response Mode above. For every source-backed Desktop inline answer outside positively identified Work Mode, including text-only answers, follow [Inline Sources receipt](../visualize-data/references/inline-sources-receipt.md) to place a collapsed receipt directly below each chart and cover any uncharted findings according to that reference. Source previews and provenance are separate from native visualizations and do not satisfy the inline visualization requirement. Leave existing chart source interactions unchanged.
- Default to the Data app for dashboard creation and editing. Use BI tools as data sources unless the user explicitly chooses a BI dashboard destination. Unpublished desktop previews return to `codex://threads/<user-facing-task-id>?prompt=<encoded-prompt>` using the originating task retained in local build metadata. Direct publication preserves the compiled HTML, including embedded metadata. Hosted pages ignore local task identity and start a new task through the shared desktop/web chooser: desktop uses `codex://new?prompt=<encoded-prompt>&browserUrl=<encoded-selected-view-URL>`; web uses `https://chatgpt.com/?q=<encoded-prompt>`. Preserve the selected view in the prompt link and browser pane using [Sharing selected views](../../shared/data-app.md#sharing-selected-views). Never put task IDs in prompts, canonical URLs, or copied/shared links.
- Do not expose hidden reasoning, credentials, secrets, direct personal contact/payment identifiers, or unvalidated calculations in any user-facing surface. Reviewed customer, account, or company names may be included when they are needed for the analysis.
- Once the analysis commits to a source table in an inline or dashboard route, expose a small deterministic source preview when safe through the selected surface's normal preview mechanism. This preview is separate from any required inline visualization.
- If a preview is unsafe, unavailable, or blocked by access limits, record that briefly and continue from schema, documentation, or other reviewed evidence.

## Completion Gates

Report and dashboard completion:

- Once a report or dashboard analysis has findings, complete the selected app through `$build-report` or `$build-dashboard`; local and hosted delivery must use the same source tree and compiled UI. Record any concrete build blocker. Do not silently downgrade to chat prose, a notebook, loose charts, or an inline widget.
- Complete the shared [delivery policy](../../shared/data-app.md#publication-and-final-delivery): required publication needs a successful deployment and verified Site URL, or an actual blocker with the permitted fallback. Built HTML alone is insufficient.
- Deliver the verified report or dashboard through the shared delivery policy, using its live Site or local preview link. A chat summary alone does not replace the artifact.
- If a required deliverable is skipped, include the explicit omission reason in the final handoff.
- The same verified `dist/index.html` is the report and the conversion source for PDF, Google Docs, or Google Slides; do not maintain a second renderer or sidecar runtime.

Final verification:

- For requested publication, sharing, or export, or after successful Site publication, consider the shared [one-time optional review offer](../../shared/data-app.md#optional-final-consistency-review). Do not enter its deep path automatically or delay the requested delivery; standard validation remains available within ordinary work. Ordinary authoring uses applicable [analysis](../../shared/analysis-quality.md) and [dashboard quality criteria](../../shared/dashboard-quality.md) within its own verification.
- For reports and dashboards, follow the Data App Contract's [build and rendered verification](../../shared/data-app.md#build-and-verification). Inline charts follow their delivery reference above; inspect other generated artifacts in their requested format.
- Check source-backed claims against the controlling sources used for the analysis.
- Call out unresolved gaps or caveats when they materially affect the conclusion.
- Verify that every selected primary workflow skill was read and followed. If a primary workflow was skipped, record why in the final handoff. Do not treat a data-context lookup, notebook, validation pass, visualization, or report artifact as satisfying the primary workflow contract.
- If the run was classified as `report`, do not finalize until the downstream $build-report contract has either passed or been explicitly blocked.
- If a selected rendering surface is unsafe, unavailable, too large, or fails after a targeted retry, continue the analysis through another appropriate surface and briefly note the reason in the progress update or final handoff.

## Skills

### publish-artifact-to-sites

Use $publish-artifact-to-sites when the shared [delivery policy](../../shared/data-app.md#publication-and-final-delivery) calls for publication.

### share-artifact-summary

Read and follow [$share-artifact-summary](../share-artifact-summary/SKILL.md) to share a concise, source-backed dashboard, report, chart, or component summary. The sharing skill owns destination selection, source-link safety, and delivery.

### schedule-refresh-jobs

Read and follow [$schedule-refresh-jobs](../schedule-refresh-jobs/SKILL.md) to create or update a recurring refresh job in a cloud task for an existing Data dashboard or report. The scheduling skill owns cadence intake, cloud-task setup, exact job identity, refresh instructions, and verification; `$build-dashboard` or `$build-report` owns each refresh run.

### design-kpis

Use $design-kpis for goals, primary KPIs, driver metrics, guardrails, scorecards, measurement plans, and launch or experiment success criteria.

### kpi-reporting

Use $kpi-reporting for KPI updates, scorecards, business reviews, executive metric summaries, target or pacing readouts, and leadership-ready performance narratives. Add $metric-diagnostics when the update must explain why a KPI moved.

### market-sizing

Use $market-sizing for TAM/SAM/SOM, opportunity, spend or revenue pool, customer count, unit volume, commercial upside, and sensitivity models.

### metric-diagnostics

Use $metric-diagnostics to identify what drove a metric over a defined time period, baseline, or segment comparison, rule out measurement artifacts, and label findings by certainty.

### product-business-analysis

Use $product-business-analysis to analyze product or business data and context for recommendation-oriented decisions. Add $metric-diagnostics when the recommendation depends on validated metric movement.

### analyze-data-quality

Use $analyze-data-quality to investigate underlying data problems: freshness, grain, row counts, nulls, duplicates, schema drift, broken joins, outliers, backfills, and conflicting source results. Use $validate-data for a requested correctness audit of an existing analysis or artifact.

### build-dashboard

Use $build-dashboard to create or update the shared Data app, source-backed scorecards, and monitoring pages, including verification of the authored changes. Requested dashboard correctness audits belong to $validate-data. Use BI tools as data sources, not the default destination. Follow the shared [delivery policy](../../shared/data-app.md#publication-and-final-delivery).

### build-report

Use $build-report to build exactly one durable report surface selected for the user request, with data visualizations when the analysis benefits from them.

### convert-to-doc

Use $data-analytics:convert-to-doc for an explicitly requested DOCX or native Google Doc when an existing Data app is identified. If no Data app exists, ask the user to choose whether to build a dashboard or a report, invoke $build-dashboard or $build-report for that choice, and then invoke $data-analytics:convert-to-doc once the chosen app is built and verified.

### convert-to-slides

Use $data-analytics:convert-to-slides for an explicitly requested PPTX or native Google Slides deck when an existing Data app is identified. If no Data app exists, ask the user to choose whether to build a dashboard or a report, invoke $build-dashboard or $build-report for that choice, and then invoke $data-analytics:convert-to-slides once the chosen app is built and verified.

### report-to-pdf

Use $data-analytics:report-to-pdf for an explicitly requested PDF. Convert an existing dashboard or report directly using its verified HTML, reviewed evidence, and presentation. Build the shared report app only when the user requested a new report and no source app exists yet; delegate PDF authoring to the canonical PDF plugin.

### create-data-context

Read and follow [create-data-context](../create-data-context/SKILL.md) to create, update, or share reusable context, or arrange requested source upkeep. Requests to remember a preferred tool, report/dashboard look and feel, or analysis practice for future work also enter this workflow, even without the words "context" or "skill." A single instruction is enough starting material: introduce the context skill and examples, then ask together about additional context and personal versus team use. Follow its local installation and natural-starter outcome for personal context; highlight future sharing help for shared context. Do not assume personal scope, merely acknowledge it as remembered, or require metric definitions.

### gather-business-context

Use $gather-business-context for docs, dashboards, chats, planning notes, launch or experiment material, source-of-truth pages, owners, incidents, roadmap, GTM or customer context, and prior decisions.

### jupyter-notebooks

Use $jupyter-notebooks to create, edit, and verify reproducible notebooks for SQL, Python, statistics, modeling, cohort or funnel analysis, data-quality checks, experiments, market sizing, diagnostics, and report support.

### validate-data

Use $validate-data for analysis QA: methodology, source authority, calculations, presentation and conclusion support. A standalone explicit validation request, including a direct $validate-data invocation, defaults to heavy/deep review with supported material repairs. An explicit normal/standard request overrides that default. Validation called from another skill during ordinary authoring or delivery defaults to normal; naming $validate-data as a build step does not make it a standalone audit. Explicit heavy review or acceptance of its optional offer selects the deep path within a workflow. Deep review adds component and missing-question coverage, dashboard cohesion/functionality, complete source details and verified material repairs. Respect audit-only, approval-first and scoped-fix instructions independently of depth. Ordinary authoring uses shared criteria within its existing checks and may offer the deep path without delaying authorized delivery.

### visualize-data

Use $visualize-data to design, implement, and verify charts while authoring reports, dashboards, decks, notebooks, and other durable artifacts. Use $validate-data for a requested analytical audit of an existing chart or artifact. Inline Codex answers use Data's shared React/Recharts inline renderer and native `visualize` structured output through `visualize:visualize`.
