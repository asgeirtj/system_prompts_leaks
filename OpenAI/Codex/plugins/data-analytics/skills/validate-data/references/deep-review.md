# Deep review

Use this reference for standalone validation requests, explicit heavy/deep/comprehensive reviews, or an accepted deep-review offer. Explicit normal review and validation inside another skill use the standard workflow in [validate-data](../SKILL.md). Heavy review covers analytical trust and the artifact's usefulness, completeness and presentation, concentrating depth on what could change a decision.

Apply [analysis quality](../../../shared/analysis-quality.md) and, for dashboards, [dashboard quality](../../../shared/dashboard-quality.md) as criteria within this workflow. Consult [component verification](component-verification.md) for a date, compound metric or source-detail issue. Import only applicable sections of shared build/render guidance; these references do not start additional audits, source refreshes, usage enrichment or runtime upgrades. Honor supplied-snapshot restrictions.

## Select the authorized mode

- **Repair material issues by default.** Heavy review includes correcting demonstrated high-confidence P0/P1 defects and their necessary dependent changes. Establish both the error and supported replacement from actual inputs, computation and observed behavior. Apply already-authorized corrections without per-fix approval. Leave P2 cleanup proposed unless requested.
- **Audit-only or approval-first.** Preserve the artifact when asked for no changes or review before approval. Use separate scratch calculations and give concrete proposed fixes. Critical findings do not override a no-edit instruction.
- **Scoped repairs.** Honor named issues and other limits. A request to fix everything also covers supported P2 cleanup within the time budget. A listed batch does not authorize unrelated changes.

Preserve metric policy, raw evidence, historical snapshots, population, intentional design and requested format. Do not invent values, remove inconvenient content or change the question to make checks pass. Uncertain definitions, conflicting authorities or ambiguous remedies remain **Needs input**; continue independent supported work. Review permission does not authorize publishing, sending, sharing, scheduling or external writes.

## Finish within 20–30 minutes, including repairs

Aim to deliver in **20 minutes; finish by 30 minutes**, including delegated work, repairs, final rendered verification and the handoff. Honor a shorter explicit user/runtime budget. Read the available clock at entry, record the deadline, and check elapsed time at phase changes. Subagents, retries and repairs share that deadline. Bound tool calls so they leave time for verification.

| Elapsed time | Work |
| --- | --- |
| 0–3 min | Map questions, components, sources and material risks; dispatch independent reviewers. |
| 3–13 min | Parallel source/calculation checks and focused dashboard inspection; collect evidence. |
| 13–23 min | Reconcile high-impact findings and apply one coherent batch of supported repairs. Audit-only can finish earlier. |
| 23–28 min | Verify final affected calculations, controls, source details and desktop/narrow rendering. |
| By 30 min | Deliver scorecards, verified fixes, remaining material problems and specific limits. |

Use this allocation flexibly and finish earlier when the important work is done. Reserve at least the final five minutes for verification and delivery. Stop new exploratory or cosmetic work before it consumes that reserve. Do not start a repair that cannot reasonably be verified before the deadline; propose it instead. At the deadline collect available evidence, stop unfinished delegated work, and deliver the best supported result with named gaps. Preserve a usable verified build; revert only your own unverified edits if necessary and retain the proposed fix in notes. A partial review can be useful, but is never complete verification.

## Split independent work early

For a substantial dashboard, use **two or three bounded subagents when available** while the lead continues useful work:

1. **Numbers and definitions:** independently recompute consequential metrics in one batch; inspect actual SQL/formulas, populations, denominators, date predicates and relevant source conflicts.
2. **Conclusions and completeness:** assess the narrative, intended questions, missing comparisons, caveats and compound-source explanations against supplied evidence.
3. **Lead: dashboard behavior and integration:** inspect distinct rendering paths and meaningful controls, reconcile findings, own edits, rebuild and verify. Add a visual reviewer only with an isolated browser and enough independent work to justify it.

Give each reviewer a concrete scope, exact artifact/source paths, source/edit restrictions, relevant collected evidence and a return deadline within the investigation phase. Request compact results: visible location, checked claim/question, inspected evidence, observation, severity, supported remedy and uncertainty. Retain evidence files and a small component mapping, not another full report or duplicate inventory. Do not seed independent checks with a claimed correct answer. Avoid recursive delegation and duplicate full audits.

Keep one owner for shared-browser navigation and one owner for each edited file. Parallelize read-only investigation; delegate edits only with non-overlapping ownership and an integration deadline. The lead inspects evidence behind material findings and verifies the combined final artifact. A subagent's assurance or count is not proof. If subagents are unavailable, batch independent tool calls and computations, retain the deadline, and disclose consequential coverage limits.

## Map scope, then investigate by impact

Recover the question, audience, decisions and required comparisons from the request and artifact. Build a compact index from existing component/source declarations and visible navigation in one pass. Include hidden views and absent-but-required questions. Record components, controls, principal claims and comparison groups in working notes; do not manually enumerate every possible subcheck or filter combination.

Prioritize decision-driving values, surprising changes, weighted rates, joins, distinct counts and eligibility denominators; conflicting populations/windows/definitions; unsupported causal or confidence claims; missing evidence and comparisons; and controls or source details that materially impair trust or usability.

Inspect every major section's purpose, then sample repetitive low-risk components and states sharing verified data/presentation paths. State sampling in Assessment. Shared checks cover multiple components only with an actual input, logic and presentation mapping. A sampled pattern is not proof that every component passed. Group repeated symptoms under a shared cause. P2 cosmetics and general engineering cleanup must not crowd out analytical trust or missing decision-critical content.

## Verify evidence efficiently

**Definitions and authority.** Start with retained/cited evidence. Read the actual relevant rule or SQL predicate: population, grain, eligibility, numerator/denominator, units and reporting period. A title, badge, SQL length or metadata presence is insufficient. Follow targeted leads needed to settle material gaps; honor source restrictions and effective periods. Explain intentional alternatives and legitimate scope differences. Do not resolve conflicting authorities by recency, majority vote or convenience; retain consequential uncertainty as Needs input.

**Independent calculations.** Create or reuse one compact script/notebook that recomputes important quantities directly from selected source rows, recording expected versus displayed values and component mappings. Batch raw versus curated rates, pooled denominators, partitions, cohort bounds and time boundaries when applicable. Rerunning the dashboard's display helper is a consistency check, not independent verification. Preserve zero, missing and immature-cohort states. Inspect date expressions: scan bounds, latest activity and extraction timestamps can legitimately differ.

**Source details.** Trace high-impact figures through every material contributor, including secondary denominators and comparisons. Check their Overview, Data preview, SQL/calculation and Evidence flow against the figure and one another. A compound figure needs all contributing evidence and the actual transformations. Use source inspection for bindings/calculations and the browser for rendered meaning and runtime behavior. Listing source names or opening one overview cannot certify complete source details.

**Rendered behavior.** Plan a small set of meaningful paths covering high-impact components, distinct chart/source-detail implementations, scope-changing controls, and desktop/narrow use. Observe resulting values, labels, source details or unavailable states after actions. Use actual screenshots for marks, scales, clipping, overlap and readability; DOM text alone is not visual acceptance. Reuse evidence for unchanged verified paths. Extra navigation must answer a remaining question; avoid touring every combination. Stop repeated retries against an unchanged blocker and record its effect.

**Conclusions and completeness.** Check that intended questions have usable evidence/comparisons and conclusions follow from compatible populations and periods. Distinguish arithmetic contributions and observational associations from causal mechanisms. Keep material proxies, small samples, uncertain exclusions and missing authority beside affected interpretations. Do not invent chart quotas, new dimensions or unrelated redesigns.

## Repair and verify per coherent batch

Rank findings by decision impact: **P0** invalidates a central result; **P1** materially changes interpretation, trust, completeness or usability; **P2** is cleanup. A plausible hypothesis is not a proven defect. Confirm consequential findings by independent calculation, reproduction or an equivalent concrete source trace before editing.

Correct the earliest wrong step and dependent values, labels, source details and conclusions together. Preserve existing layout when it can express the right meaning. Prefer completing a missing comparison from supported existing data or clarifying scope to rebuilding the app. Uncertain metric-policy changes remain proposed.

Batch compatible repairs, rebuild once, and recheck affected calculations and rendering. Reopen investigation only for a material regression or unresolved central contradiction within the remaining budget. Invalidate evidence affected by source, binding, label or formatter changes; retain successful unaffected checks. An edit, build, click or screenshot capture alone is not a verified fix: inspect the final result. Applied-but-unverified fixes remain unresolved.

For a later request simply to show reviewed views, reuse the artifact, saved navigation paths and applicable evidence. Open the requested views and details directly. Restart review only if the artifact changed or another review was requested.

## Record honest coverage

Keep one compact [coverage record](coverage-record.md) populated from actual component mappings and evidence. Use these categories and consistent internal units:

| Category | Internal units |
| --- | --- |
| Source authority and confidence | Principal values/claims or explicitly mapped components |
| SQL/value accuracy | Figures, tables or KPIs with calculations or values |
| Within-chart agreement | Figures and their headlines, labels, legends and tooltips |
| Complete source details | Figures with applicable source-detail surfaces |
| Cross-artifact consistency | Related components or named comparison groups |
| Data-quality controls | Components dependent on eligibility, filtering, missingness or other quality rules |
| Conclusion support | Major insights, callouts and recommendations |
| Analytical clarity | Sections, figures and major explanations |
| Visual and interaction consistency | Components or controls with relevant rendered states |
| Dashboard usefulness and completeness | Intended questions, required comparisons or section purposes |

Retain total applicable units, current evidence, defects and incomplete checks internally. Absent required comparisons remain question units. Queries, raw rows, retries, helpers, repair families and generic tests are not component substitutes. Count an affected unit once per category even if it has several defects. Categories overlap; never sum them into an accuracy percentage.

The public **Observed defects** cell is **bad / total**: units with a demonstrated remaining defect divided by all applicable units in the scoped inventory, including units not fully inspected. A known defect on a partly reviewed unit counts as bad. A repaired unit leaves the numerator only after final-state verification; unrelated unresolved defects remain. **0 / N means no defects observed, not N verified passes.** Explain material sampling, inaccessible evidence and incomplete checks in Assessment, naming important gaps. Use **N/A** with a reason for inapplicable categories, never a clean 0/0. If a full denominator cannot be established, state that it is unknown; do not invent or shrink it to inspected examples.

Use the coverage helper to derive counts and generate the compact scorecard; it checks accounting, not truth or completeness. Keep internal incomplete states even though the handoff has no Unverified column. Preserve before/after repair evidence. Reuse prior checks only when their actual inputs, logic, scope and relevant presentation remain applicable.

## Return one review handoff

Give a brief readiness caption (**Ready within reviewed scope**, **Share with caveats**, or **Needs revision**), completeness (**Complete** or **Partial**), artifact link and whether changes were made. Then use two tables and **Prioritized problems and proposed fixes**:

1. **Dashboard best practices and quality:** usefulness/completeness, analytical clarity, visual/interaction consistency.
2. **Analytical correctness and robustness:** source authority/confidence, SQL/value accuracy, within-chart agreement, complete source details, cross-artifact consistency, data-quality controls, conclusion support.

Each table has exactly three columns: **Category | Observed defects | Assessment**. Display observed defects as `bad / total`. Omit Declared unit, Checked / Applicable, separate defect counts and Unverified columns. Put useful confidence reasons, supported successes and consequential limits in Assessment. For other artifacts adapt the first title and mark dashboard-only categories N/A. Explain once that totals are scoped inventory counts, not complete verification.

Lead with the highest-impact findings; usually three to five shared causes suffice, while retaining any additional P0/P1 issue that changes a decision. Group repeated symptoms and keep P2 observations brief. Each numbered finding names the visible location, what is wrong and why it matters in one or two sentences, followed by **Fixed:** with verified before/after impact, **Fix (Proposed):**, or **Needs input:**. Distinguish remaining problems from completed repairs. Do not add an approval question to audit-only responses.

Write for the reader: retain technical traces in notes, use visible section names and reader-facing links, and link governing evidence when needed. Implementation vocabulary must not replace the analytical explanation. Keep routine build/test counts and process receipts out of the handoff. Combine it with the existing delivery response; do not create a second report or dashboard section. Claim readiness only within verified evidence and keep decision-critical gaps explicit.
