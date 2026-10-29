# Fleet operations: evidence contract

**Grain:** Route × day ledger, aggregated to weekly × region operations/financials and daily × region 4 PM snapshots; modeled intraday curves and customer-week invoices.

**Queries:** route_daily, operations, daily_deliveries, daily_delivery_progress, financials, cost_categories, cash_balance, invoice_ledger. Exact fields and deterministic fixtures are in `fixtures/generate.mjs`. `fixture()` returns an independent copy.

## Required evidence

- Dated operations and financial totals
- Comparable region assignments
- Explicit intraday observations for an observed intraday view; modeled curves must be identified as modeled

## Exclusions

- Claimed daily observations derived only by dividing weekly aggregates
- Unrelated domains without matching evidence

This fixture is synthetic, never an executed warehouse query or live market feed. Missing evidence is not zero. Rates require their eligible population; percentile aggregates require mergeable observations/distributions. Preserve independently scoped filters and the example's custom compositions. The catalog owns current approval status; semantic and rendered/interaction verification remain separately recorded.

History controls select covered weeks; the Day control scopes daily metrics, progress and route exceptions. Daily and weekly totals derive from the route-day ledger, not by dividing a weekly observation. Route costs sum exactly to cost categories and weekly operating costs. Weekly on-time rate is total on-time deliveries / completed deliveries; utilization is driver hours / available hours. The current week includes only completed work through the latest 4 PM snapshot. Intraday paths are modeled against the snapshot, not scan-level evidence. Completed values after 4 PM remain unobserved (`null`). Region totals reconcile to the mutually exclusive regional facts. Regional-volume and delivery-cost histories consume reviewed filtered rows, not the unfiltered snapshot.

Invoices carry stable IDs and an explicit August 21, 2026 observation cutoff. Open balances are overdue before that cutoff, due soon within the next seven days, and otherwise outstanding. Date history filters invoice issue week, not payment date. Paid + due soon + unpaid equals the scoped billed amount; each customer-week invoice reconciles to delivered-route charges, while paid balances are not recognized revenue. Status/search narrow the table and copied rows; the summary and underlying source evidence retain all invoices in the selected date/region scope.

Harbor Logistics is fictional. Route customers/depot assignments are stable; July 21–24 has a West road-closure scenario, August 17–21 has additional fuel charges per route-day ($36 Northeast, $28 Central, $52 West), and August 21 has a Newark loading delay. Fuel pressure rolls through costs, profit and cash; the comparison uses four preceding observed weeks per scheduled delivery, not a budget. The chart identifies the variance but does not infer its cause. Selecting a route filters customer invoices without implying a causal link to payment status. Cash equals $250,000 opening funds + paid invoice receipts − accrued operating costs, assuming those costs are paid as incurred; it is global, not allocated by region. Contacts use reserved `.example` domains.
