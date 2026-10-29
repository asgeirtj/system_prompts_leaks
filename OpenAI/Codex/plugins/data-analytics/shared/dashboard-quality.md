# Dashboard quality criteria

## Scope and use

Use these criteria with [analysis quality](analysis-quality.md) to judge whether a dashboard serves its intended reader. They describe outcomes, not a required layout, chart count, section sequence, or separate audit workflow. Ordinary authoring uses the applicable criteria within its existing scope; reading them does not invoke a full review. The selected workflow owns repair authorization and the final handoff.

Recover purpose, audience and intended use from the request, artifact and available context. Do not introduce clarification questions or new visible prose when those are already clear. Cadence matters when the dashboard supports recurring decisions; a one-time analysis need not invent one. Preserve author intent, user edits and deliberate design choices.

## Artifact-level criteria

| Criterion | What establishes quality |
| --- | --- |
| Purpose, audience, decision and cadence | The dashboard answers a recognizable question at a level its intended reader can use. Its reporting period, freshness and detail suit the decision and, where applicable, review cadence. |
| Intentional and sufficient coverage | The available views answer the requested questions with the needed level, change, history, segments, denominators or uncertainty. Include only dimensions relevant to that purpose. Missing requested evidence is explicit; retained source rows alone do not establish that the authored views answer the question. |
| KPI roles | Headline measures have a clear role, such as outcome, driver, diagnostic or guardrail, and useful context for interpreting direction or importance. Avoid unrelated metric collections and redundant totals. Not every dashboard needs every KPI role, a target or a KPI strip. |
| Structure and review path | Hierarchy, grouping and navigation let the reader find the main evidence, compare relevant views and reach supporting detail. Each tab or section has a distinct analytical job. A supporting records table remains close to the figure it explains; repeated views earn their place through a different useful question. |
| Decision usability | The reader can recognize what matters and pursue the next useful comparison, exception or investigation supported by the evidence. Operational dashboards may need actionable records; exploratory dashboards may need well-scoped comparisons. Do not invent causal explanations, staffing assignments, business targets or recommendations to create an appearance of actionability. |
| Fidelity to scope and intent | Content, populations, metric policy and presentation respect the agreed question and explicit requests. Do not fill template slots with unsupported data, expand a narrow task into every possible dimension, or replace a deliberate layout merely for variety. Prefer supported corrections within the existing figure; structural changes need a concrete analytical benefit and existing authorization. |

## Component and comparison criteria

| Criterion | What establishes quality |
| --- | --- |
| Meaningful, compatible comparisons | Baselines, cohorts, populations, periods, units, order and scales support the intended inference. Related evidence is visible together when comparison requires it; selecting one entity at a time does not replace comparing entities. Explain justified differences rather than forcing all metrics onto one period or definition. |
| Recoverable definitions, sources and caveats | Labels and available detail let a reader recover metric meaning, denominator, scope, active filters, period, sources and material limitations. Source inspection accurately explains all contributors, returned data, calculations and transformations, and agrees with the figure. Essential caveats remain near affected claims; supporting methods need not dominate the dashboard. |
| Honest visuals | Chart forms fit the analytical relationship, with faithful marks, scales, uncertainty, labels and precision. Tables serve exact lookup or multi-attribute records; charts serve patterns and comparisons. Color and emphasis convey supported meaning without relying on color alone. Preserve requested table formats and intentional themes. |
| Loaded data, controls and empty states | The displayed result uses the intended available data, not stale placeholders or sample fallbacks. Filters, sorting, drill-downs and reset behavior have clear scope and preserve the same population across plots, headlines, source details and exports. Distinguish loading, unavailable data, measured zero, all-null results and legitimate empty selections; do not fabricate observations to fill them. |
| Rendered readability and polish | In the actual output, meaningful marks and labels are visible; legends, units, tables, controls and source explanations remain readable without clipping, overlap or detached annotations. Normal and narrow layouts preserve interpretation and usable navigation. Authored controls support keyboard access, visible focus and meaningful labels. Related views use consistent metric names, number/date formats, semantic colors and ordering, with justified differences explained. Remove repetition and distracting copy where they obscure the evidence, while retaining informative labels and qualifications. |

Use [the Data App Contract's rendered verification](data-app.md#rendered-verification) within the selected workflow's applicable scope, reusing valid observations and rechecking affected surfaces after edits. A successful build or text snapshot alone does not establish readable charts. This criterion concerns the reader's ability to interpret and use the dashboard; dependency maintenance, build configuration and generic application engineering are outside it.

## Evidence and coverage units

Assess purpose, sufficient coverage, KPI roles, structure, decision usability and fidelity once at the artifact level, with concrete supporting or missing views. These judgments do not become a pass for every chart. Assess applicable component and comparison criteria against the relevant figures, tables, controls, details and major insights, naming the actual units or comparison group.

The selected review workflow owns any coverage table. Record the applicability and evidence for these criteria there without inventing additional per-chart checks for an artifact-level question, duplicating totals, or treating one attractive view as proof of the whole dashboard. Unavailable source or rendered evidence remains a stated gap.
