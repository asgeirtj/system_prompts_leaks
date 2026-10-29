# Analysis quality criteria

## Scope and use

These are reusable criteria for analytical work, not a separate workflow or report. Apply the relevant criteria within the selected task and reuse evidence that still applies. Consulting this reference does not start a full artifact audit, an approval sequence, or a publication gate. The selected workflow owns scope, repair authorization, verification depth, and the user-facing handoff.

Judge the claims actually made and the decision they support. Prioritize consequential or surprising results, uncertain evidence, and transformations that could change interpretation. A polished artifact, a successful build, or a prior assurance is not analytical verification.

## Question and method

- The analysis answers the intended question for the audience and decision. Requested metrics, comparisons and sections are present, or their absence is explained as unavailable, inapplicable or outside the agreed scope.
- Population, eligibility, exclusions, sampling, metric definitions, formulas, units, denominators, timezones and cohort rules fit the question. Preserve established definitions and distinguish observed measures, targets, estimates and scenarios.
- Baselines, periods and groups are comparable for the claimed comparison. Account for partial periods, cohort maturity, seasonality and changing eligibility when relevant. Intentional differences can be useful when their meaning is clear; different dates alone do not prove an error.
- Selection, survivorship and look-ahead bias do not silently determine the result. For causal comparisons, groups must not be defined by the outcome being explained.

## Source and data fitness

- Evidence is appropriate and authoritative for the particular metric, population and period. A governed table does not validate every query or interpretation built on it; a reproducible derived metric can have strong support.
- Cross-check other identified applicable authorities when they can settle a material claim or source disagreement. Reconcile definitions, scope and timing before comparing values; repeated summaries of one upstream source are not independent confirmation. Honor explicit source restrictions and stop discovery once the relevant question is resolved.
- Freshness and coverage are sufficient for the intended use. Distinguish measurement bounds, latest observed activity and execution time; check the expression behind a date label before interpreting it as a cutoff.
- Expected partitions, entities and segments are represented. Check relevant nulls, duplicates, missing categories, late arrivals, backfills and source disagreements. Preserve legitimate unknowns and distinguish them from measured zero or a genuinely empty selection.
- Filters and joins preserve the intended population and grain. Check unmatched records, many-to-many multiplication and unintended exclusions using the applicable predicates and actual input state.
- Source links, queries, returned rows and material transformations remain recoverable. Include secondary sources supplying denominators, comparisons or fallback values. Generated provenance prose or a "reviewed" label is not independent proof.

## Calculations and transformations

- Independently recompute consequential results from inspectable inputs when possible. Check numerator and denominator membership, zero denominators, distinct entities, group-by grain, period-over-period bases, signs, rounding, currency and unit conversion.
- Totals reconcile where categories are mutually exclusive and additive. Do not sum overlapping audiences, percentages or per-entity rates. Combine rates from their numerators and denominators, or use valid weights; do not average group averages or percentiles without justification.
- Follow the actual displayed binding through filters, joins, aggregation and fallback branches. Source metadata or an unused helper does not establish what a chart reports. Agreement between two outputs sharing the same calculation is not an independent check.
- Useful checks include tracing a record through a join, recomputing a ratio, reconciling a total against an appropriate independent source, and checking one period, segment or eligibility boundary. Describe sampled checks as samples rather than full-series verification.

## Reasonableness and boundary cases

Compare scale and movement with relevant history, known totals or independently supported expectations. Investigate unexplained jumps, flatlines, exact round values, impossible ranges and unexpected 0% or 100% rates; surprising observations are prompts to investigate, not proof of defects. Shares should reconcile only where their definitions require it.

Check meaningful empty, all-null, new-entity and boundary-date cases. Consider small samples, outlier-dominated averages, changing segment mix, aggregate/segment reversals, multiple testing and cherry-picked ranges where they affect the claim. An alternate computation can help resolve a surprising result; plausibility alone cannot validate it.

## Conclusions and causality

Conclusions and recommendations must follow from the visible evidence or retained sources, with factual findings separated from interpretation, uncertainty and open questions. External context needs a reviewed source. Claims and callouts must remain true for the displayed population after filtering.

An accounting contribution is not a causal mechanism: a lower funnel count, rate component or peer difference can explain arithmetic without explaining why it changed. Check causal direction against the governing policy, code or process and time-aligned comparable evidence. Consider feedback and alternative explanations; an observed component may be downstream of the proposed cause. If mechanism or ordering is unverified, retain the supported decomposition, label causal explanations as hypotheses, and identify evidence that could distinguish them.

Separate source authority, confidence in a result, and the consequence of being wrong. Explain consequential proxies, inferred mappings, assumptions and missing evidence without presenting low confidence as a proven error. Ordinary disclosed statistical uncertainty does not itself require a new approval or invalidate an otherwise supported estimate.

## Visual and narrative integrity

- Chart forms, ordering, axes, scales, intervals and precision support the intended comparison. Comparable views use compatible units, periods, encodings and magnitude scales; explain justified differences. Absolute-magnitude bars start at zero. A focused delta scale needs exact values and clear disclosure; avoid geometry that exaggerates the claim.
- Material uncertainty stays with the estimate, including interval meaning and level where defined. Do not substitute observation spread or scenarios for uncertainty, average bounds, or reuse aggregate intervals for subgroups. Preserve uncertainty through filters and exports.
- Labels, legends, tooltips, source details and callouts agree with the reported values and scope. Titles and narrative are accurate; retain qualifications needed to interpret the evidence while removing repetition that obscures it.
- Relevant values, marks, labels and distinctions are readable in the actual output. Do not rely on color alone. Inspect applicable final formats for missing marks, clipped text, overlap or misleading presentation through the selected workflow's rendered checks; source inspection alone does not establish visual acceptance.

## Evidence and coverage units

Question fit, overall completeness and methodological fitness are artifact-level judgments. Values, figures, tables, source details, controls and major claims are component-level checks; relationships between figures may require an explicitly identified comparison group. Keep those units distinct when the selected workflow records coverage. A shared check covers multiple components only when its inputs and bindings actually apply to them. Queries, raw rows and test counts are not substitutes for reviewed components.

Retain concise supporting evidence and the limits of each check within the existing task. Distinguish established defects, unresolved interpretations and unavailable verification. Do not create an extra assessment report or an overall accuracy percentage from overlapping checks.
