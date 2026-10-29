# Lattice · Product growth

Product tracker for a fictional team-project collaboration app. A workspace is a team, not a user. Teams invite colleagues, create projects, complete tasks and adopt templates, automations and reporting. The central question is whether acquisition and onboarding improvements produce sustained, deeper product use.

## Investigation paths

- Overview → feature adoption scorecard → workspace-by-feature usage matrix → workspace history. Starter is excluded from paid-feature adoption, not reported as failure. The matrix distinguishes observed use, observed non-use and features outside the plan; it is not a fabricated health score.
- Activation & retention → locate the drop from first-task completion to teammate participation in the six-stage onboarding funnel → compare signup-cohort activation with mature week-4 retention → channel evidence → workspace health. The July 20 guided-setup release is dated context, not an experiment or causal claim.
- Overview → plan scorecard → inspect slipping workspaces. Task-volume declines are explicit usage signals, not churn predictions or commercial risk scores.
- Overview starts with the original shared `MetricCardTabs` composition: select a metric to replace the associated large trend, retaining all four headline readings. Do not split it into standalone cards and a duplicate chart when adapting this reference.
- Overview → feedback-to-roadmap Sankey → source/theme/feature/roadmap-status filters → select a node or ribbon → view matching feedback records → workspace history. Record counts reconcile across paths; unplanned requests intentionally skip features. A ribbon filters its two endpoints, not a presumed complete path. Feedback requests are synthetic fixture evidence, not real customer quotes or a representative survey.

The four tabs share the same source contract but retain independent viewer filters. The selected week sets the latest complete week; trend charts show history through it, and cohorts use its Sunday cutoff. Row selections open the existing shared investigation/Back flow. Feature controls affect the feature detail, not the overview.

This replaces the Main gallery's arbitrary business composition. Main links to this canonical implementation; `/examples/product-tracker/` and prepared artifacts use the same content and generated fixture. The legacy base sample remains a test fixture, not an automatically selected or publicly promoted business example. No second renderer, dependencies or shared runtime is copied.

For adaptation, match the acquisition → activation → retained usage questions and workspace-level evidence, not the company name. Replace the whole fixture with reviewed data. Keep units, feature eligibility and cohort maturity; omit entity drilldowns if only aggregates are available. Do not copy release events, thresholds, colors or business targets as facts.

Omit the feedback flow when dated feedback and dispositions are unavailable; do not infer customer requests from activity counts. The local flow filters apply only to its source records and diagram; the selected tab week anchors its trailing four complete weeks.

Prepare from the plugin root with `node scripts/prepare-data-app.mjs --surface dashboard --example product-tracker --output /absolute/new-project`; use the standard offline builder. The catalog records approval for the current revision; builds alone do not establish visual/interaction acceptance.
