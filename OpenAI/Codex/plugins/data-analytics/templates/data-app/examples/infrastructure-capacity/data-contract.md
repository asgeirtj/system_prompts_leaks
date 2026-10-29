# Infrastructure capacity: evidence contract

**Grain:** Half-hour × region × environment × accelerator pool; incident rows are separate.

**Queries:** capacity, queues, failures, incidents, concentration. Exact fields and deterministic fixtures are in `fixtures/generate.mjs`. `fixture()` returns an independent copy.

## Required evidence

- Capacity, unavailable capacity and demand with common units
- Queue depth and valid delay distributions
- Timestamp and regional/pool dimensions

## Exclusions

- SLO percentiles from subgroup percentiles alone
- Financial forecasting

This fixture is synthetic, never an executed warehouse query or live market feed. Missing evidence is not zero. Rates require their eligible population; percentile aggregates require mergeable observations/distributions. Preserve independently scoped filters and the example's custom compositions. The catalog owns current approval status; semantic and rendered/interaction verification remain separately recorded.

Queue rows include `delayHistogram`, exact `[seconds, placementCount]` frequencies. Combined P95 is the nearest-rank 95th percentile of the merged frequencies, not the mean of `p95DelaySeconds`. Missing distributions invalidate the combined percentile. The generator preserves each subgroup's prior P95 while providing explicit synthetic frequencies; the scoped/global curve intentionally changes to the valid aggregate.

Aster Compute is fictional. The example ends August 21, 2026 at 14:00 UTC during a Production H200 rollout/placement-delay episode. Incidents have opening timestamps, status at the cutoff and proposed next steps; they are not a historical status-event stream. Incident selection scopes the existing environment, region and pool filters, including queue distributions. Do not infer a completed recovery or safe migration destination from the incident label alone.
