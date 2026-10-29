# Business performance data contract

Northstar is a fictional B2B workflow platform. The deterministic fixture contains 177 customer organizations, 295 product contracts, and 29,554 contract-day records across 182 completed UTC days, February 16 through August 16, 2026. Accounts can use Workspace, Automations, and API together. Account region and customer segment are stable exclusive assignments in this fixture, not universal assumptions.

The snapshot's `source.metricDefinitions` owns definitions. [performance-data.js](content/dashboard/performance-data.js) owns scope and calculation logic. [generate.mjs](fixtures/generate.mjs) regenerates the fixture. No warehouse query was run; all names and measures are synthetic.

## Sources and grain

`account_contracts` is an independent paid-service roster. Each contract has a stable contract ID, account ID, product, region, segment, inclusive start date, and inclusive end date. A null end means ongoing through observed coverage. It determines expected rows even when an entire contract is absent from facts.

`account_daily_performance` has one row per contract and completed UTC date during paid service within the declared recent daily coverage, including observed zero-use days. The independent roster begins in November 2025; daily facts begin February 16, 2026. Older cohort membership and retention are roster-backed and do not imply daily financial coverage before that date.

| Field | Meaning |
| --- | --- |
| `date`, `contractId` | Unique contract-day key |
| `accountId`, `account` | Stable identity and fictional display name |
| `product`, `region`, `segment` | Must match the contract roster |
| `subscriptionUsd`, `usageUsd` | Recognized seat and usage revenue; additive |
| `revenueUsd` | Subscription plus usage revenue in USD |
| `costUsd` | Modeled infrastructure and delivery-support cost of revenue |
| `completedRuns` | Successful workflow executions; each belongs to one product |
| `activeUserIds` | Active user IDs, namespaced by account and shared across products |
| `seats` | Account-day entitlement, repeated consistently across active products |

Costs exclude research, sales, and administration. Gross margin is not operating profit. This fixture has no plan, forecast, pipeline, or causal attribution.

## Period and missing-data rules

The historical May 18-August 16 regression window and February 16-May 17 comparison each contain 91 days. Previous always means the immediately preceding equal-length interval. Expected coverage intersects each contract's paid-service dates with the selected window. Missing/duplicate or incorrectly attributed rows invalidate the affected aggregate. Missing individual measures propagate null. Out-of-coverage windows and an empty matching population are unavailable; observed zeros remain zero. A known roster with no paid service during a covered interval has zero activity.

Weekly buckets start Monday and clip to selected boundary days. Prior buckets shift by the selected window's day count, preserving relative position and exact length. Revenue interval changes only the revenue chart; adoption and account history stay weekly. Period totals never sum daily or weekly distinct counts. Bucket dates and both period boundaries remain available in source inspection.

## Derived measures

- Paying accounts: distinct accounts with paid service at the period endpoint.
- Active accounts: distinct accounts with positive completed runs anywhere in the period or individual chart bucket. Product account counts overlap.
- Active users: union of account-namespaced user IDs across products and dates.
- Seat utilization: sum of unique account-day active users divided by unique licensed seat-days. Do not count repeated entitlements for each product.
- Runs per active account: full-period runs divided by full-period distinct active accounts, not a mean of daily ratios.
- Gross margin: (total revenue minus total cost of revenue) / positive revenue.
- Growth: current minus previous revenue; divide by positive prior revenue for percentage change. Zero/missing prior revenue makes growth rate unavailable.
- Revenue movements: New, Reactivated, Expansion, Contraction, and Churn reconcile to total revenue change. Churn requires prior revenue, zero current revenue, and no remaining selected-scope contract. Partial-period losses are Contraction. These are period-revenue movements, not MRR movements or causal explanations.
- NRR: current revenue from prior-positive-revenue accounts / their prior revenue. GRR caps each account's retained revenue at its prior revenue. Unknown prior revenue prevents baseline membership from being determined and yields null. The Overview headline and its trend use trailing 28 days versus the preceding 28 at the same selected endpoint, independently of the comparison toggle. Missing endpoint coverage produces null, never the nearest earlier point. Product revenue-retention diagnostics retain their explicitly separate selected-period definition.
- Seven-day activation: new-to-scope paid accounts with a completed run within seven inclusive days / eligible new paid accounts. Exclude immature windows. A known positive observation proves activation; unknown activity without a known positive observation makes the rate unavailable, not a failure.
- Paid cohorts: first paid calendar month in the selected product scope, including only closed cohort months. M0 is initial membership; M1-M8 are paid-account retention at subsequent calendar month-ends. Unmatured cells are null. The section has its own cohort-entry range and observation cutoff; activity-period changes do not alter either. Each cell carries cohort, elapsed age, month-end cutoff, observation date, eligible count, retained count, rate, and maturity. Cohort detail uses that exact roster population. These are not engagement-retention cohorts.

## Scope, evidence, and adaptation

Product/region/segment filters select contracts before aggregation. Date range applies to facts, not to the historical roster needed for cohorts. Revenue and runs reconcile across products; account and user counts do not add across them. Account selection cannot broaden tab scope. The account explorer defaults to a currently paying, revenue-producing account and keeps a valid explicit selection even when that account has since churned; empty matches remain empty.

Charts, tables, source inspection, and copy share derived numeric rows. Table formatting preserves nulls. Source definitions resolve both current field names and legacy saved revenue aliases; legacy aliases are included only when needed by an existing chart edit. NRR trend history is included in its source rows. Chart edits change encoding, not calculation grain. Prior chart columns remain null when comparison is off so saved styles do not drop the comparison schema.

Real sources with changing assignments, incomplete rosters, overlapping user identities, multiple currencies, or different revenue and retention definitions need explicit mapping and semantic review. Omit unsupported sections instead of manufacturing contract, cost, user, or cohort evidence.

## Deep-dive measures

Gross profit is revenue minus modeled cost of revenue; weekly financials reconcile with selected-period totals. Paid-account retention uses accounts paying at the previous endpoint as its denominator and checks how many still pay at the current endpoint. Churned accounts are lost endpoint accounts; this differs from the period-revenue Churn movement. Multi-product share counts endpoint accounts with more than one selected-scope product. Top-five concentration uses total scoped revenue, never just top-five revenue, as its denominator.

Activation signup-week cohorts are evaluated independently. Each account needs a mature seven-day window; positive observed activity proves activation, but incomplete expected coverage without a positive observation leaves its outcome unknown. A missing August account must not erase complete June or July cohorts. Metric-card source rows include labeled current and previous summaries with independent boundaries whenever a prior-period delta is shown.

The revenue bridge carries explicit absolute endpoints and signed intermediate contributions. Zero contributions are excluded only from the plot and remain in the movement table; missing comparisons yield no bridge. Every bridge row retains current/comparison dates. Display aliases ending in (%) multiply raw ratios by 100, including NRR above 100%; the original ratios and display values coexist in source rows. Currency aliases retain unscaled USD. These presentation transforms do not change aggregate definitions.

## Navigation and source contract

The three investigation payloads are product/segment plus source period to financial/customer detail; account identity plus source population and activity period to Customers; and cohort plus elapsed age to the exact retained/lost population under the section cutoff. Private focus stays in local viewer/history state. Normal tab navigation restores manual selections; drill-through uses a temporary destination view and leaves a return path. Scope changes may replace an invalid selection but must not silently broaden population.

Revenue and cost charts are additive. Weekly active-customer counts are distinct within each week, not contributions to the period distinct total. Margin is a ratio of sums. The overview NRR card and final trend point are the same fixed-window observation. Cohort cells use a fixed 0–100% color scale; neutral unobserved cells differ from observed zero, and cell selection does not invent accounts for immature follow-up.

## Comparison presentation

Optional comparison never changes the current measure. Each ordinary trend bucket is paired with the equal-length bucket shifted back by the selected period's day count. Prior margin is calculated from prior sums, not current margin or averages of ratios. Product rows preserve product identity and true source dates; `plotDate` aligns the display, and `seriesLabel` distinguishes Current from Previous. All numeric fields in a Previous row are prior-period values or unavailable, including when a reader edits the chart measure. Prior-prior values are not fabricated.

The NRR comparison line evaluates the same trailing-28-day definition at each current endpoint minus the selected period's length. The headline delta is the percentage-point difference between current and prior NRR. Uncovered windows remain null.

Combined outcome/trend cards enrich existing evidence once rather than appending duplicate history. Chart display rows contain only the plotted history, not summary observations. Saved compatible product-series encodings migrate `date` to `plotDate` and `product` to `seriesLabel`; source dates retain their factual meaning.

## Calendar buckets and execution

Daily, weekly, monthly, quarterly and yearly buckets partition the selected inclusive days; the first and last calendar buckets may be partial. The same selected-period day offset aligns prior buckets, so a monthly chart does not silently switch to prior-calendar-month comparison. NRR remains trailing 28 days at each displayed bucket endpoint, regardless of the display interval. Current non-baseline accounts do not enter NRR; unknown revenue for those accounts does not invalidate otherwise-known cohort retention. Unknown prior revenue still prevents defining baseline membership.

Caches are owned by an immutable reviewed context/snapshot and are bounded. Refreshed snapshots create a new engine/worker, and stale request responses cannot populate a new scope. Comparison is presentation-only; source rows retain the reviewed prior values even when that optional series is hidden. The worker is bundled inline into the standalone artifact; it does not fetch or publish data.

## Default scope and local loading

The authored default is July 20–August 16 (28 days), compared with June 22–July 19. It produces current revenue $294,048 and prior revenue $278,576; endpoint trailing-28-day NRR is 103.4701%. Daily is the default display grain for ranges of 45 days or fewer; longer scopes start weekly. Selecting a window leaves reviewed rows unchanged.

Local request identity includes account and segment-breakdown choices, but retained-data eligibility includes the reviewed snapshot, population, date range and display grain. Only matching global scopes may retain unaffected components. Pending local components expose no old source values under the new local selection. Explicit date URLs retain their selected range.

Northstar's synthetic company story uses unequal monthly cohorts and independently sliceable regions, products and segments. API unit serving cost rises 90% on July 20, 2026, while some customers contract; these facts support margin and retention investigation, not causal attribution from the charts alone. Names and fixture events are illustrative and must not transfer to adapted dashboards.
