---
name: design-kpis
description: "Design KPI frameworks, metric definitions, targets, guardrails, and measurement plans for product or business decisions. Use when success metrics, drivers, guardrails, targets, or the measurement approach need to be defined or improved."
---

# Design KPIs

Design KPI frameworks, set targets, and develop measurement plans that help teams make product or business decisions.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Knowledge & Files: Goals, strategy, existing definitions, and measurement conventions.
- Data Warehouse: Measured baselines and historical distributions for evaluating metrics and targets.
- Business Intelligence: Existing scorecards, semantic definitions, and operating comparisons.
- Product Analytics: Event instrumentation, behavioral measures, and experiment guardrails.
- Internal Messaging: Ownership, operating practice, and discussions that point to canonical decisions.

## When To Use Data Quality First

Use $analyze-data-quality first when the task is to reconcile existing metrics, dashboards, tables, owners, or sources of truth.

Return to this skill only when the user asks to define the metric going forward, redesign the KPI framework, choose guardrails, or set targets.

## Skill Configuration

### Source Discovery And Verification

Use the relevant data context as a starting map, not a boundary.

1. **Find the authoritative evidence.** Follow references from discussions and summaries to the original metric, query, reporting view, or source artifact. Inspect relevant schemas, datasets, tables, views, models, and metrics when source discovery is needed. Known sources and semantic mappings are starting points; expand the search when stronger or complementary evidence could materially change the answer.
2. **Compare duplicates and conflicts.** When sources overlap or disagree, compare ownership, freshness, definition, grain, coverage, and directness. Use the best authoritative source, or combine complementary sources when needed. Note material conflicts, explain why the selected sources control the answer, and verify the data through source reads or the explicitly supplied evidence.

### Source Access Guardrail

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to identify required evidence, offer missing integrations, and continue supported work. Pause only claims or actions that depend on unavailable evidence; do not treat weaker substitutes as equivalent.

Clarify with the user when a missing input would materially change the analytical frame or recommendation. Otherwise make a reasonable assumption, state it, and proceed.

## Workflow

### 1. Clarify The Decision And Operating Context

Understand the decision the metrics need to support, the context in which they will be reviewed, and who will act on the result. Ask the user to clarify the goal, operating cadence, or measurement constraints when missing or ambiguous input would change the recommendation.

### 2. Gather Evidence Before Recommending Metrics

When the prompt does not already provide enough context to know what success means, gather that context before recommending metrics or targets. Use $gather-business-context to understand the goal, current state, audience, constraints, risks, existing definitions, prior decisions, and any baseline or target context that should shape the metric system.

For KPI design, use that context to clarify what success is meant to mean, how related metrics have been defined before, and which constraints or risks should affect the recommended KPIs, drivers, guardrails, or measurement plan.

### 3. Generate A Wider Candidate Set

Create candidate outcome, driver, and guardrail metrics before narrowing.  
Each candidate should have a clear definition and a plausible link to the decision. Use the example metric shapes below as inspiration when helpful, not as a required template.

### 4. Compare And Select Metrics

Compare candidate metrics by whether they:

- reflect the goal: the metric should represent the intended outcome. When using a proxy, explain why it should reflect real progress and where it could mislead.
- inform a real decision: movement should change what the team does, prioritizes, or investigates.
- show useful signal at the decision cadence: a metric can be conceptually good but too slow-moving or noisy for the decision it supports. For example, annual retention may be the right outcome, but it may not help a weekly launch review unless paired with earlier indicators.
- can be influenced by the team: the team should have plausible levers, or the metric should be paired with drivers it can affect.
- can be measured operationally: the team should be able to instrument, calculate, and track the metric consistently without one-off manual work.
- are hard to improve in a misleading way: improving the metric should not obviously hide harm to quality, trust, retention, cost, or another important outcome.

Use lightweight scoring only when it helps explain tradeoffs. Recommend `1-3` primary KPIs, `1-2` driver metrics for each KPI when they improve diagnosis, and `1-2` guardrails when tradeoffs are likely. Do not recommend extra metrics unless they materially improve decision-making.

For each recommended metric, include enough detail for the team to use it: what it measures, why it matters, how it is calculated, where it comes from, its main pros and cons against the selection criteria above, and what caveats or guardrails matter.

### 5. Set Targets When Needed

Treat target setting as a separate judgment from metric selection. First decide what should be measured; then set targets when the user asks or when the recommendation needs a threshold to be useful.

Use the target-setting approach that best fits the evidence:

- Top-down: start from benchmarks, historical performance, comparable products, competitor or market context, or a reasoned view of what good would need to look like for the decision.
- Bottom-up: start from what the team can realistically do, such as what is shipping, how adoption is expected to build, or which operating levers should move the metric.

Use data to set or evaluate targets. Once the target-setting approach is clear, identify what data it requires, such as provided inputs, internal performance data, external benchmarks or market data, and results from similar past work.

Compare aspirational targets with what the team can realistically influence through planned work, available audience, expected adoption, and historical movement. A good target should be meaningful for the decision and plausible enough to guide action. Explain the target anchor, key assumptions, and confidence. If the strongest target-setting method requires missing inputs, name the missing inputs and ask whether the user can provide or identify the relevant data. If there is still enough evidence for a directional target, present it as a provisional range; otherwise recommend the measurement needed before setting a firm target.

### 6. Deliver The Recommendation

For source-backed Desktop inline answers outside Work Mode, include the [Sources receipt](../visualize-data/references/inline-sources-receipt.md), even when no chart is needed.

Keep the final recommendation concise and decision-oriented. Use the response mode selected by the Data index. Pass chart-ready evidence to the selected response mode. Honor an explicitly requested report, dashboard, notebook, spreadsheet, native document, or slide deck as the primary artifact. The recommendation should include:

1. initiative summary
2. recommended metric candidates, with definition and rationale
3. target recommendation, if included, with anchor and material assumptions
4. evidence reviewed
5. assumptions and missing context
6. risks and guardrails
7. open questions

## Example Metric Shapes

Different contexts need different metric shapes. Use these as examples, not a template:

- Product launch or adoption: pair an outcome metric for adoption or value realization with drivers for activation, engagement, repeat use, or time to value, plus guardrails for experience quality.
- Growth work: choose the business outcome the team is trying to improve, such as activation, retention, or monetization; add drivers that explain how growth is expected to happen and guardrails for quality.
- Funnel work: choose the progression or completion outcome that represents success; add drivers around where people advance or drop off and guardrails for downstream quality.
- Operating review: focus on health, pacing, and action-oriented metrics that show whether the business is on track and where attention is needed.
- Experiment or intervention: use one primary success metric tied to the decision, diagnostics that explain movement, and guardrails for unintended effects.
- Data, model, or analytics initiative: connect technical performance to the decision or workflow it improves, with adoption, reliability, cost, or fairness guardrails when relevant.
- Platform, reliability, or operations work: measure service health, throughput, quality, cost efficiency, and customer impact in terms the owning team can act on.
