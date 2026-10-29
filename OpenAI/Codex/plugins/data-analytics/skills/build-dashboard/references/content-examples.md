# Dashboard content examples

Use these examples to choose concise, factual dashboard content and information hierarchy. They do not prescribe a fixed layout, chart count, KPI count, section list, or dashboard structure. Use the shell title rather than repeating it as a page hero. Use the build-dashboard skill for scope and qualification placement; these examples do not add another disclosure surface. Put changing values, rankings, comparisons, and statuses in source-backed UI rather than authored headings.

## Product adoption

- Dashboard title: `Product adoption`
- Tooltip scope: `Paid workspaces; excludes trials`
- Section headings: `Usage`, `Adoption by segment`
- Chart titles: `Weekly active users`, `Activation rate by plan`
- KPI labels: `Weekly active users`, `Activation rate`, `Activated workspaces`
- Definitions and caveats: Explain the active-user qualification and activation denominator in the metric tooltip or source inspector.
- Avoid: `Adoption is surging`, `Activation increased 18%`, `The growth story behind our product`.

## Revenue

- Dashboard title: `Revenue performance`
- Tooltip scope: `Recognized revenue; USD; excludes taxes`
- Section headings: `Revenue`, `Revenue by segment`
- Chart titles: `Revenue vs. target`, `Net revenue retention by cohort`
- KPI labels: `Recognized revenue`, `Net revenue retention`, `Revenue target`
- Definitions and caveats: Put recognition rules, currency, target provenance, and retention denominator in source metadata or metric definitions.
- Avoid: `Revenue beats expectations`, `Q2 revenue reached $12.4M`, `Double down on enterprise sales`.

## Reliability

- Dashboard title: `Service reliability`
- Tooltip scope: `Production traffic; excludes scheduled maintenance`
- Section headings: `Availability`, `Latency and errors`
- Chart titles: `Error rate by endpoint`, `P95 response time`
- KPI labels: `Availability`, `Error rate`, `P95 response time`
- Definitions and caveats: Explain the measurement window, excluded maintenance, and percentile calculation in the relevant metric definition.
- Avoid: `Reliability is deteriorating`, `Urgent action required`, `99.8% uptime is below target`.

## Experiments

- Dashboard title: `Experiment performance`
- Tooltip scope: `Eligible sessions; excludes internal traffic`
- Section headings: `Enrollment`, `Conversion by variant`
- Chart titles: `Conversion rate by variant`, `Eligible sessions over time`
- KPI labels: `Eligible sessions`, `Conversion rate`, `Experiment exposure`
- Definitions and caveats: Show material uncertainty visibly with estimates. Keep assignment rules, sample exclusions, and calculation details in source inspection or contextual tooltips.
- Avoid: `Variant B is the clear winner`, `Ship the winning experience`, `Conversion improved 12%`.

## Customer health

- Dashboard title: `Customer health`
- Tooltip scope: `Active contracted accounts`
- Section headings: `Account activity`, `Renewals and risk`
- Chart titles: `Accounts by risk level`, `Renewals by contract month`
- KPI labels: `Active accounts`, `Accounts at risk`, `Renewals due`
- Definitions and caveats: Explain risk thresholds, renewal timing, and account coverage in a metric definition, tooltip, or source inspector.
- Avoid: `Critical accounts demand immediate action`, `Three customers are likely to churn`, `Our customer success strategy`.

## Operational monitoring

- Dashboard title: `Support operations`
- Tooltip scope: `Customer support queues; excludes automated closures`
- Section headings: `Ticket volume`, `Resolution time by queue`
- Chart titles: `Open tickets by queue`, `Resolution time by priority`
- KPI labels: `Open tickets`, `Median resolution time`, `Tickets past SLA`
- Definitions and caveats: Put SLA thresholds, business-hour rules, queue ownership, and excluded closures in operational definitions or source inspection.
- Avoid: `Support is falling behind`, `The key insights you need to know`, `Hire additional support agents`.

## Positive and negative patterns

| Content | Prefer | Avoid |
| --- | --- | --- |
| Dashboard title | `Product adoption` | `Product adoption is accelerating` |
| Section heading | `Revenue by segment` | `Where growth is coming from` |
| Chart title | `Conversion rate by variant` | `Variant B increased conversion 12%` |
| KPI label | `Weekly active users` | `A record-breaking week for engagement` |
| Scope | Specific label `Paid active workspaces`, exclusions in its tooltip | Standalone population, date, or methodology paragraphs |
| Eyebrow | Omit unless explicitly requested | `Executive overview`, `Performance dashboard`, `At a glance` |
| Page introduction | Start with controls and evidence under the shell title | A second page title or metadata paragraph |
| Dynamic comparison | Source-backed KPI comparison or chart annotation | A stale percentage embedded in an authored heading |
| Recommendations | Omit unless explicitly requested | `Recommended next steps`, `What this means`, `Strategic priorities` |
| Caveats | Metric definition, contextual tooltip, or source inspection | A generic introductory paragraph repeated across sections |

## Explicit user-authored exceptions

If the user asks for the eyebrow `Q4 board review`, preserve it exactly. If the user supplies the title `Where growth is coming from`, preserve it rather than rewriting it to match the default. If the user requests commentary or recommendations, include a clearly labeled, narrowly scoped, source-backed section and ensure its contents remain accurate as filters or reviewed data change. An explicit exception changes only the requested content; it does not require adding generic filler elsewhere.
