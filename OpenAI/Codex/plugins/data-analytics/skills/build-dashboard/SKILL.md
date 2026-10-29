---
name: build-dashboard
description: Build or update a source-backed interactive dashboard for monitoring, exploration, and operational decisions from connected data, uploaded spreadsheets, CSVs, or other structured sources.
---

# Build Dashboard

Create a private, editable measurement surface that answers the user's question through evidence and useful interactions.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.
- Follow the [Data App Contract](../../shared/data-app.md) for reviewed data, privacy, runtime, and delivery. If the skill reader cannot open this reference, read the file from the installed plugin directory, resolving the path relative to this skill.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Data Warehouse: Authoritative metrics, historical comparisons, cohorts, and granular records.
- Business Intelligence: Governed dashboards, reporting views, and semantic definitions.
- Product Analytics: Events, funnels, retention, experiments, and behavioral segments.
- Knowledge & Files: Supplied datasets, KPI definitions, targets, and business context.
- Internal Messaging: Operational events and stakeholder explanations that help interpret changes and locate original evidence.

## Workflow guidance

For requests to set up or change a recurring refresh schedule for an existing dashboard, read and follow [$schedule-refresh-jobs](../schedule-refresh-jobs/SKILL.md) before entering the authoring workflow. One-time refreshes and execution of an existing scheduled refresh stay in this skill; they do not create another job.

This skill owns dashboard planning, hierarchy, copy, and reference selection. Preserve existing dashboards and user-authored layouts when revising them.

Apply the relevant [analysis quality criteria](../../shared/analysis-quality.md) and [dashboard quality criteria](../../shared/dashboard-quality.md) while planning, authoring, and verifying the requested changes. Reuse completed checks within this workflow; a separate requested correctness audit belongs to $validate-data.

In local desktop tasks, open the [localhost preview](../../shared/data-app.md#proactively-open-the-in-app-browser) at the first useful build and reuse it for revisions.

## Refresh an existing dashboard

When the user sends a refresh prompt in ChatGPT web or Codex, complete the refresh without asking for consent again after preparing the data. For a published dashboard, follow [Refresh a published dashboard or report](../../shared/data-app.md#refresh-a-published-dashboard-or-report) to read its snapshot, rerun saved requests, and redeploy the same Site. For a local dashboard, follow the [data lifecycle](../../shared/data-app.md#local-and-hosted-data-lifecycle).

Ask only for information or access needed to proceed, or approval for changes beyond the dashboard's existing query or data scope. Preserve its layout, filters, and access; honor required tool approvals. Report completion only after verifying the update; otherwise explain the blocker and any partial changes.

## Plan the evidence and hierarchy

Identify the audience, decision or action, question, population, period, comparison basis, and next useful investigation; establish the operating cadence for recurring use. The default view should support that job before interaction. Ask only for missing user-owned facts that materially change the result; otherwise choose reversible defaults. Chart types, counts, and other implementation choices belong to this skill.

Before coding, map the user's distinct questions to the available evidence: current level and meaningful change, trajectory, relevant segment or cohort differences, population size and denominators, and the next useful investigation. Account for every material question, recurring view, named requirement, and selected dimension with a supported view, deliberate exclusion, or explicit blocker. Include the dimensions together when their relationship matters. Narrow this coverage for a narrow question; a short prompt does not imply a shallow dashboard. Keep a brief private plan of the intended views, metric roles, prominence, and section order, revising it as evidence develops; no fixed section sequence or dashboard prose is required.

Reserve KPI cards for the most important topline metrics. Use the clearest form for drivers, context, diagnostics, composition, exceptions, and detail; source convenience must not determine prominence. Use visuals for aggregate comparisons, change, composition, and relationships. Use tables for identifying records, exact multi-attribute inspection, and operational action. A useful queue may lead the page; a table of totals already shown in charts usually belongs in source inspection or detail. Combine duplicate views, not distinct analytical questions. Honor explicit table requests; there is no chart quota.

Discover useful breakdowns from the brief, authoritative context, and verified source schemas. Select dimensions, baselines, benchmarks, and targets for their interpretive purpose and semantic compatibility with the measure, not a fixed business-specific checklist. Show needed comparisons together, using consistent units, order, encodings, and magnitude scales; disclose justified scale changes. Filters alone cannot substitute. Use meaningful baselines and comparable reviewed history. Include KPIs or sparklines only when they add a useful summary.

## Establish source-backed measurements

Use the named source or authoritative governed evidence. Follow the shared [source guidance](../../shared/shared-skill-instructions.md#find-the-authoritative-source) when gathering evidence and the Data App Contract's [provenance schema](../../shared/data-app.md#reviewed-data-and-provenance) when constructing the snapshot. Define measures, populations, denominators, comparisons, assumptions, and lineage at the affected component. Preserve source classification and limitations in provenance; never present supplied fictional data as real observations.

Reconcile totals and weighted rates at the correct grain. Preserve nulls, incomplete coverage, cohort maturity, and distinctions between actuals, targets, and scenarios. Correlation and accounting decomposition are not causal proof. Fetch extra evidence only to answer a question, never to fill template slots. Omit unsupported measurements, explicitly identifying unavailable required evidence where it affects interpretation; never silently replace, drop, or redefine requested content. If no useful dashboard is possible, ask for the missing source.

For workbook inputs, use spreadsheet tools for ingestion and calculations. Their workbook-presentation advice does not govern this HTML dashboard. Use a spreadsheet or BI-native destination only when requested.

## Start from appropriate working code

For a new dashboard, choose a useful starting composition from the [golden catalog](../../templates/data-app/examples/manifest.json) by analytical task: comparing segments, monitoring change, investigating exceptions, or exploring an entity. The subject and data grain need not match to learn from its layout. Read the closest reference's `DashboardContent.jsx` and relevant CSS, following local composition imports where they own the layout. Prefer adapting its working code when it provides useful groupings or interactions, even if only part of the page fits:

```sh
node scripts/prepare-data-app.mjs --surface dashboard --from-reference REFERENCE_ID --output /absolute/new-project --snapshot /absolute/reviewed.json
```

Run from the plugin root or use the absolute helper path. Read the selected reference's brief and data contract before binding your evidence. The shared preparer sets the dashboard surface and a fresh stable artifact ID, and copies working code with your reviewed snapshot. It never loads the reference's fixture on this path. Remove unsupported measurements, sample annotations, and fallback values. Golden approval applies to design, not fictional evidence; use draft examples only for explicit development/review.

The starting golden is scaffolding, not the finished outline. Keep useful compositions, but reorder, resize, combine, replace, or add sections and change navigation when the question calls for it. Borrow complementary groupings or interactions from other goldens; read only the additional implementation and CSS needed, not the whole catalog. Integrate borrowed parts into one coherent page with consistent controls and spacing. There is no one-reference limit or requirement to preserve the starting dashboard's tabs, chart types, or block count.

Create an original composition when existing patterns do not serve the analysis. A custom layout can still use shared cards, charts, controls, and tables; it does not require inventing new components. Do not keep a section merely because it was copied, fill unsupported slots, or add variety without analytical purpose.

Omit `--from-reference` to use the populated base when no golden provides a useful starting composition. Both modes return a compact golden index for further borrowing. Preserve sparse answers and user-requested custom layouts. Use `--blank` only when the user requests starting from scratch; a small dataset or lack of a matching reference does not require an empty project.

The helper refuses existing destinations. Revise existing apps in place. Read the copied `AGENTS.md` for boundaries and author React/CSS in `src/content/`. Before consulting component APIs, follow the contract's [read-only reference lookup](../../shared/data-app.md#resolve-the-component-reference) and read only needed topics from the returned `documentation.entryPoint`; this also resolves current bindings for older apps. Reuse public cards, charts, controls, tables, and source actions before creating a custom component. Wrap custom evidence in `DataComponent` with stable identities and reviewed rows.

## Compose the page and interactions

Put useful evidence under the shell title and scoped controls. Give each section a distinct job and short descriptive label; order and prominence should follow the audience's review path. Use `Section`/`SectionHeader` and the copied `AGENTS.md` geometry defaults. Keep related views visible together, size them to their evidence, avoid redundant nested frames, and preserve requested custom layouts.

Use canvas for independent movable/resizable blocks, freeform for authored grids or sidebars, and a composite block for tightly linked views. These mechanisms do not prescribe analytical structure. Keep the intended Edit-mode affordances and saved user placement; consult the [sortable layout API](../../templates/data-app/base/docs/components/sortable-layout.md) for details.

Place controls at their actual page, tab, section, or chart scope, grouped in the shared header slot. Intersect local filters with original reviewed rows and apply the same population to visuals, sources, copying, and export. "All" removes that dimension's restriction; do not look for a literal aggregate row unless the source supplies one. Preserve metric grain: sum additive measures only, recompute rates from their numerators and denominators, and do not average subgroup medians or sum overlapping distinct counts. Keep identity-bearing filters out of URLs. A tab needs a distinct analytical or operational job; a supporting records table belongs with its chart, in expandable detail or source inspection, not in a tab inherited from a reference.

A filter changes the current view; a drill-down reveals additional records or explanation and offers a clear return. Keep comparisons needed for the main question visible together; inspecting one entity at a time does not replace comparing entities or their histories. Put secondary exploration on the relevant chart mark or row; avoid repeated card-header buttons that just select an entity and open its records. Do not label filter presets as investigations or duplicate an existing selector with a button. Add scenarios only when useful and supported, with assumptions, modeled outputs, and reset separate from observed data.

## Copy and presentation

Use one shell title and concise, sentence-case measurement labels. Chart titles stay descriptive unless a finding-led title is requested. Omit redundant headings and visible heroes; retain an accessible h1. Keep filter values and index baselines in controls or info descriptions. Do not invent branding, eyebrows, introductions, instruction subtitles, or evaluation/privacy prose. Preserve user-authored titles and requested commentary. Sparse factual callouts must remain true for the displayed population and add interpretation, a useful comparison, or a supported implication beyond reading off nearby chart values; omit redundant insight cards. Source external events and avoid unsupported causal stories. Omit leaderboards when all displayed values are equal and the ranking adds no useful distinction. If relevant, summarize the shared value once.

Keep sample-data classification truthful in source metadata; add a visible disclosure only when requested. Use the same name for a derived metric in titles, legends, tooltips, and prose. Explain an unfamiliar derived metric beside its first use in plain language, including the calculation or adjustment and what it means; source inspection alone is insufficient. Place each other definition or caveat once, in its relevant label, tooltip, or source sidebar. Material uncertainty belongs visibly with estimates, including interval meaning and level where defined. Keep supporting methods in source inspection and preserve uncertainty through filtering and export. Use accurate measurement labels rather than contradictory explanatory prose.

Keep dates human-readable and units/signs consistent. Round displayed numbers to useful precision, including summary tables; use compact units for large totals while preserving exact reviewed values in sources and exports. Keep sparkline periods consistent with their metric and comparison, or state a justified different period in the associated description. Omit redundant axis titles, not informative ticks or units. Use semantic delta color according to the objective while keeping ambiguous changes neutral; absolute trends retain their series colors. Use the [comparison formatting API](../../templates/data-app/base/docs/components/comparison-formatting.md) rather than inventing formatting. Keep values legible, labels contained, controls wrapping, and wide record tables scrolling within their container.

## Build, inspect, and deliver

Build with the copied project's `AGENTS.md`, then follow the contract's [preview and verification guidance](../../shared/data-app.md#build-and-verification). Show a useful first view promptly and complete the requested scope in that same artifact.

During the contract's bounded rendered review, check the opening hierarchy, distinct value of each view, redundant copy/tables, and alignment. Confirm the default view makes priorities and useful investigations apparent, with action or follow-up detail when the use case calls for it. Fix changed content and inspect again; report which checks actually ran.

Reconcile the final artifact with the request and private plan: account for additions, omissions, and changes to metric roles, prominence, comparisons, breakdowns, sections, and order. Update the plan with reasons for deliberate revisions and disclose changes to requested scope; leave no unexplained drift or silently missing requirement. Verify calculations, definitions, source/filter/export scope, honest time-series continuity, and reconciliation across cards, charts, and tables. Retained source rows alone do not establish that the dashboard answers a question; check that its needed comparison is available in the authored views.

Follow the shared [delivery policy](../../shared/data-app.md#publication-and-final-delivery) and state any remaining gaps. For a requested sharing summary, use [share-artifact-summary](../share-artifact-summary/SKILL.md).
