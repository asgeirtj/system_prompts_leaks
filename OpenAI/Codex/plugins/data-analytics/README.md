# Data

Data helps you answer product and business questions with data you can trust, then turn the findings into shareable reports, charts, dashboards, notebooks, and recommendations.

## When to use this plugin

Use Data when a product or business decision depends on metric-backed evidence: understanding performance, explaining a metric movement, deciding where to focus, defining KPIs, checking whether data is reliable, or sizing an opportunity. Start with connected warehouses, BI or product analytics tools, docs, chats, spreadsheets, uploaded files, pasted results, or clearly labeled sample data.

## Get started

Try asking:

`@Data Help me get started with my first data task`

The plugin will help you choose a data source, pick a useful workflow, and decide whether to use connected tools, upload data, paste results, or try sample data.

Already have a focused task? Start directly with one of the workflows below.

Report and dashboard apps publish to Sites in web/cloud tasks and preview on localhost in local desktop tasks. Cloud tasks still publish when viewed on desktop; Work Mode does not change delivery. New Sites default to private, and you can request another destination. See the [delivery policy](shared/data-app.md#publication-and-final-delivery).

## Example workflows

| Workflow | Try this | Skill | Result |
| --- | --- | --- | --- |
| Analyze a product or business question | `Analyze activation and recommend where to focus next` | `product-business-analysis` | A decision-ready analysis with evidence, measurable opportunities, and a clear recommendation |
| Diagnose a metric movement | `Diagnose why weekly active users dropped last week` | `metric-diagnostics` | A calibrated explanation of verified drivers, likely contributors, unresolved questions, and next actions |
| Design KPIs | `Design a KPI framework for this new product area` | `design-kpis` | A measurement plan with outcome metrics, drivers, guardrails, targets, and validation priorities |
| Prepare a KPI readout | `Turn this month's metrics into a leadership-ready operating update` | `kpi-reporting` | A concise KPI update with actuals, comparisons, validated drivers, and operating implications |
| Build a dashboard | `Build a dashboard for monitoring activation, retention, and conversion` | `build-dashboard` | A source-backed dashboard with metrics, filters, visual hierarchy, QA, and handoff |
| Size a market | `Estimate the market opportunity for this product and show the assumptions` | `market-sizing` | A transparent market or opportunity sizing estimate with sensitivity, uncertainty, and validation priorities |
| Build an analytical report | `Create an executive report explaining the biggest growth drivers this quarter` | `build-report` | A polished report with answer-first narrative, charts, tables, caveats, and source metadata |
| Improve or render a chart | `Turn this analysis into a clear chart for the product review` | `visualize-data` | A production-ready visual with the right chart type, labels, hierarchy, and accessibility checks |
| Create a notebook | `Build a reproducible notebook for this experiment readout` | `jupyter-notebooks` | A reproducible SQL or Python notebook with purposeful charts, concise takeaways, and saved outputs that can be skimmed and rerun |
| Validate an analysis | `Check this analysis`; `Do a deep review of this dashboard` | `validate-data` | Heavy review and verified material repairs for explicit validation requests; normal checks within other workflows or when explicitly requested; audit-only when requested |
| Assess data quality | `Check whether this table is reliable enough for our retention analysis` | `analyze-data-quality` | A source-backed quality assessment covering grain, freshness, missingness, duplicates, joins, and material risks |
| Create reusable Data context | `Turn these metric links and working preferences into reusable team context` | `create-data-context` | One editable context skill per audience, with a portable personal/team plugin |

## Reusable context

Data includes [Create Data Context](skills/create-data-context/SKILL.md) for reusable personal or shared guidance for data work. The initial input handoff includes the introduction in the last final reply, even if a form was shown earlier. Every input handoff includes the pending questions and enough context above them to answer. Related blocking questions, such as source approach and personal versus shared use, can be asked together. Users can answer without expanding progress or finding "questions above." The short introduction leads to "Where should I start?" and "Who is this for?" Users can provide references, request a scan of their connected tools, or do both and give direction. The scan offer explains that discovered sources will be shown for selection. Data then asks who the guidance is for when that is unclear: personal use or sharing across the company. Team and company use share the same option; named teams and workflows still limit where particular conventions apply. Choosing a shared audience does not share or install anything for others. The handoff links the saved draft for review and explains that it can be installed when it looks good. No particular reply or review confirmation is required to complete the draft; installation follows the user's actual request.

- [Annotated context sample](skills/create-data-context/references/sample-context-skill.md): one skill combining useful working conventions with definitions when needed. Reporting preferences can reference company context in their source-use rules and omit Data Context; only genuine report-specific metric differences need a compact scoped section. Shared style guidance is broadly useful, optional defaults allow personal preferences, and specific requirements apply only to their named workflows. Explicitly mixed personal/shared instructions may use separate audience contexts; content type alone does not cause a split. Generated YAML descriptions identify the domain and relevant work without listing individual metrics; personal-use and workflow limits remain explicit so invocation stays appropriate.
- [Data context workflow](skills/create-data-context/references/data-context-authoring.md): one file with concrete domain definitions in tables for Entities, Metrics, Filters, Dimensions, Pitfalls, and Open Questions, plus Sources. This dictionary structure applies to substantive data definitions, whether personal or shared; it does not turn reports, decks, or source contracts into entities in a reporting-preferences skill. Metric rows retain their eligibility rules, calculations, windows, and important exceptions; notes below hold supporting detail. Both data context and working preferences use clear wording from the first draft. The normal content review checks clarity and preserves useful information without a separate rewrite stage.
- [Packaging and sharing](skills/create-data-context/references/packaging-and-sharing.md): local availability, portable ZIPs, and the administrator handoff.

For metrics and reporting context, a supplied deck, report, or dashboard can inform both data definitions and Working Preferences. Data inspects the example's content and presentation, includes useful inferred writing and visual conventions directly in the same skill as the definitions, and reviews the whole draft together. Examples supplied later in the conversation receive the same treatment. Explicit requests for definitions only remain limited to definitions.

Providing sources still leaves room for additional research: Data asks once whether you want a scan for more context related to the work and lets you supply more references or direct the scan. It keeps reviewing your supplied material while you decide. Declining or leaving the offer unanswered keeps the draft limited to those sources and necessary linked evidence. An explicit research request or source-only restriction is reused without asking again.

After a scan finds useful additional sources, Data shows their links, concrete findings, and what each would add, then asks which to include before using them in the context draft. You can accept all, select sources, refine the scan, or skip the discoveries. Supplied and previously accepted sources do not need another selection; the complete draft still receives its normal review.

After finalization, Data can offer [regular source checks](skills/create-data-context/references/data-context-authoring.md#source-upkeep) when the sources can be revisited and the host supports recurring tasks. It asks whether you want the context kept up to date, including how often it will check. A yes lets Data make clear updates and bring uncertain changes back to you; there is no extra update-mode choice. Every update includes a short explanation of what changed, why, and its sources, with a link to the context so you can request adjustments or undo it. Working Preferences stay intact, and unchanged checks stay quiet. An explicit request to review every change first is still honored.

Generated context remains separately owned and shareable. Existing user-created contexts remain usable, and recipients still need access to their linked sources.

## Integrations

Data can use available tools when they are connected:

| Source | Supported integrations | What they unlock |
| --- | --- | --- |
| Warehouses and query tools | Databricks, Databricks Genie, BigQuery, Snowflake | Schema inspection, query-backed analysis, and source-grounded metric investigation |
| Product analytics and BI | Amplitude, Mixpanel, PostHog, Omni Analytics, Metabase, ThoughtSpot, Statsig | Behavior analysis, dashboard context, experiment evidence, and reusable reporting inputs |
| Notebooks and analytical workspaces | Hex, Deepnote | Reproducible analysis, notebook handoff, and shared analytical context |
| Docs and collaboration | Google Drive, SharePoint, Notion, GitHub, Slack, Microsoft Teams | Business definitions, source-of-truth documents, implementation context, and stakeholder evidence |
| Email and calendar | Gmail, Outlook Email, Outlook Calendar | Supporting context for stakeholder questions, operating cadence, and analytical handoff |

You can also start with spreadsheets, uploaded files, pasted query results, schema descriptions, or manually provided business context.

## Inspect inline answers

Source-backed Desktop answers outside Work Mode include a collapsed Sources receipt directly below each inline chart. Text-only answers have one receipt at the end; mixed answers add a final receipt only for findings that no chart covers. The collapsed row reads `Sources` for one finding and `Sources • N` for multiple findings, where `N` counts finding cards. Expand a receipt to inspect optional assumptions, recorded definitions, filters, sources, preview rows, SQL/Python or calculations, and evidence when available. Source types and recorded purposes are available in hover/focus tooltips. The receipt uses the dashboard/report source inspector in a compact card layout and preserves existing chart source buttons. See [Inline Sources receipt](skills/visualize-data/references/inline-sources-receipt.md) for its evidence and delivery contract. Work Mode retains its existing rendering path.

## Maintaining authoring guidance

Change each rule at its owner and link to it from the decision that needs it:

| Guidance | Owner |
| --- | --- |
| Common instructions and dependency resolution for every workflow | [Shared skill instructions](shared/shared-skill-instructions.md) |
| Reusable Data context authoring, review, and packaging | [create-data-context](skills/create-data-context/SKILL.md) |
| Report analysis, composition, and next-step selection | [build-report](skills/build-report/SKILL.md) |
| Report wording and presentation examples | [narrative-style](skills/build-report/references/narrative-style.md) |
| Dashboard composition and monitoring behavior | [build-dashboard](skills/build-dashboard/SKILL.md) |
| Chart selection, contextual annotations, and visual QA | [visualize-data](skills/visualize-data/SKILL.md) |
| Notebook structure, visual presentation, and execution | [jupyter-notebooks](skills/jupyter-notebooks/SKILL.md) |
| Requested analysis reviews, verified important repairs, and audit-only assessments | [validate-data](skills/validate-data/SKILL.md) |
| Reusable source, calculation, methodology, and conclusion checks | [Analysis quality criteria](shared/analysis-quality.md) |
| Reusable component, source-details, interaction, and presentation checks | [Dashboard quality criteria](shared/dashboard-quality.md) |
| App data representation, provenance, runtime, revision, and delivery | [Data App Contract](shared/data-app.md) |
| Copied-app APIs and runtime constraints | [template AGENTS.md](templates/data-app/base/AGENTS.md) |

Keep essential decisions in the owning skill; load references for conditional detail and examples. The copied app retains the API constraints needed to revise it independently. Worked examples illustrate these rules, not alternate instructions or mandatory outlines. Keep development plans, review logs, and validation receipts in the PR or local working artifacts, not in the installed plugin.
