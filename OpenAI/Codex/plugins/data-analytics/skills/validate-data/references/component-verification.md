# Component verification workflow

This hypothetical example illustrates the workflow; its entities, dates, and values are not evaluation expectations.

## Follow the meaning of the dates

A report's "Weekly processing per account" card combines an overall median and instrumentation coverage with a distribution by each account's primary queue. Two saved queries show different `period_end` values:

| Source | Measurement predicate | Expression producing `period_end` | Saved value |
| --- | --- | --- | --- |
| Overall summary | `measured_at >= '2025-04-07' AND measured_at < '2025-04-14'` | `MAX(activity_date)` | April 11 |
| Primary-queue distribution | Same predicate | Last day before the scan cutoff | April 13 |

The measurement windows agree. The fields describe different facts: last observed activity and the intended window end. Inspect other qualifying-event and join predicates before concluding the populations also agree. Do not infer a shorter measurement window from the field name, a refresh receipt, or the latest returned date alone.

If the card calls both dates the measurement cutoff, correct that explanation: "April 7–13 measurement window; latest qualifying activity April 11." Preserve any uncertainty about whether the source is complete. If the existing explanation already makes the distinction clear, there may be no defect.

Do not replace the primary-queue distribution with overlapping queue-membership rows, remove valid percentile columns, or drop observations merely to make date labels equal. Those change the question answered. Automatic-fix permission allows supported corrections; it does not settle an unproven cause or a different attribution policy.

## Trace the whole card into its source details

Write one compact binding note before changing the card:

`Overall median + coverage numerator/denominator → summary row and query; per-queue percentiles → distribution rows and query; displayed dates → scan bounds plus activity maximum.`

Keep the card's layout. Make its source popover expose both contributors with their rows and transformations. A percentile cannot generally be reconstructed by averaging group percentiles; the pooled eligible denominator cannot be recovered from an instrumented-only table. Check that Overview explains the scopes, Data preview includes the necessary pooled and group inputs, SQL/calculations match them, and Evidence flow describes how both sources reach the visible card. Merely listing both query names is insufficient.

In an explicit audit-only review, translate that technical trace into a concise finding for the reader. In the default mode, correct this material evidence gap and verify the completed source details before reporting it as **Fixed**:

1. **P1 — "Weekly processing per account" does not show how its coverage was calculated.** Its "View data source" details omit the total number of eligible accounts, so readers cannot verify what share of accounts the measurements represent.

   **Fix (Proposed):** Add the account counts behind the coverage percentage to the existing source details.

## Derive coverage from components and completed checks

Inventory every section, chart, table, KPI and major insight in the requested scope before editing. Include components reached through navigation and meaningful conditional views; do not count a query as a component or multiply repeated states into separate components. Keep a small internal manifest, not another user report. For each component, record its visible name/ID and section, contributing sources, applicable categories, required checks completed, result, and any gap. Cross-check this inventory against the artifact's navigation and rendering paths so hidden-by-default sections are not omitted. For example:

| Component | Category | State | Evidence or gap |
| --- | --- | --- | --- |
| Weekly processing per account | Complete source details | Checked; failed | All sections examined; pooled denominator absent |
| Daily processing trend | Complete source details | Checked; passed | Bound rows, definitions, query and flow agree; applicable layout inspected |
| Queue comparison | Complete source details | Partial | Query inspected; preview and explanation not yet checked |

For these three inventoried popovers, preserve the passed, failed and partial observations internally. The public **Observed defects** cell counts popovers with demonstrated remaining defects over all three applicable popovers; Assessment names the partial inspection. A partially inspected popover with a known defect belongs in the numerator, but its remaining checks do not become passes. After verified repairs update the affected state. Derive real tallies from actual units; do not copy these illustrative numbers.

Prioritize outstanding components by decision impact within the deep review's shared 20–30 minute budget, including repairs and verification. Reuse mapped shared evidence and sample repetitive low-risk paths. At the deadline retain the full denominator, name consequential incomplete checks in Assessment and mark the review Partial; do not prolong the audit to make every counter complete.

Shared source or rendering checks can cover several components only with an explicit mapping showing the relevant bindings, inputs and presentation path apply to each. Metadata presence, test-case counts, prior review totals and repeated attempts are supporting evidence, not substitutes for that mapping. Reuse prior checks only when their scope, inputs, logic and successful result remain applicable; identify reused evidence rather than presenting it as a new inspection.

## Observe the final rendered state

Reserve browser capacity for the changed views after the final relevant edit and rebuild. Check displayed values and controls with rendered observations, and inspect actual images/screenshots for clipping, overlap, readability and visual meaning. A text/DOM snapshot can support content checks but does not by itself establish visual acceptance. Reuse an image for unchanged components sharing a verified presentation path; do not tour every possible state.

A successful resize is not an observation of the resized view. A successful click is not an inspection of the opened tab. A later copy, formatter or binding change invalidates observations it affects. Capture the necessary final observation or leave that requirement unverified with the actual gap. If the available tool cannot provide images, say which visual checks remain unavailable instead of recording them as passed.
