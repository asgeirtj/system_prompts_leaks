# Async data

## Loading and permalink discovery

An asynchronous dashboard can call `setDashboardBusy(boolean)` from a layout effect and clear it on completion/unmount, pausing component-permalink discovery until real blocks register. This does not change filters or permissions.

Use `DataComponent`/`MetricCard` with `loading`, optional `loadingKind` (`chart`, `table`, `metric`, `metric-trend`), and `loadingError`. Affected cards preserve their settled frame, body height, and header, show neutral skeletons matched to chart family/category counts, and disable stale source/export actions. `loadingHeight` sets initial body geometry when it cannot be inferred from a direct chart child.

## Errors, empty results, and retained state

`onRetry` adds a recovery button only when the caller actually supports retry; errors otherwise stay informative and non-actionable. Empty charts show a clear no-data state instead of axes without marks. Keep loading announcements accessible, not additional visible labels.

Retain unaffected results only for the same snapshot and global scope; global population/date/grain changes must not display old numbers. A prior result may supply layout only during global loading.

## On-demand published query data

`QueryDataBoundary` can defer complete query results until an authored tab or
section needs them. Declare every query read by the child, including filter
choices, comparisons, and additional source bindings:

```jsx
import { QueryDataBoundary, useDataApp } from "../../data-app-public.jsx";

function RevenueView() {
  const { queries } = useDataApp();
  return <RevenueChart rows={queries.revenue.rows} />;
}

<QueryDataBoundary queryIds={["revenue", "revenue_target"]}>
  <RevenueView />
</QueryDataBoundary>
```

Put row-reading hooks and calculations inside the child component, not in the
parent that creates the boundary. Avoid module-scope imports or calculations of
reviewed rows in an on-demand app. The boundary mounts its children only after
all declared queries are complete, and provides loading, error, and retry states.
While a tab's queries load, the default `loadingLayout="page"` shows the shared
page-content skeleton with a heading, metric cards, and chart cards. It sits
inside the real shell, so the top bar and tabs remain available. For a boundary
around a small section or single chart, pass `loadingLayout="component"` to
retain the chart-sized placeholder; `loadingKind` and `loadingHeight` then
control that placeholder. Neither layout predicts the exact eventual chart
count or shape. Error and retry behavior is the same for either layout.

Shared queries are downloaded once and retained for later tabs; no rows are
sampled or capped. A large query can still take time when its tab first opens.

Build with `--separate-data` as usual. To enable this behavior for a compatible
authored app, explicitly pass `--query-loading on-demand` to the ordinary Data
Sites packaging helper. The original snapshot and portable offline export stay
complete. Local previews and ordinary publications remain eager; the boundary
passes through immediately when complete rows are already available.

The published bootstrap contains exact query counts, columns, filter choices,
and color assignments. Context tools report whether each query is loaded; a row
request can load an unvisited query. Source and chart export actions retain the
complete reviewed rows of their declared queries. The full snapshot endpoint
remains available for complete exports and source recovery.

This first implementation uses on-demand loading only for unedited indexed
snapshots. Existing legacy storage and snapshots with saved owner query edits
load eagerly. An owner query update first loads the remaining queries, retaining
the existing complete-data editing behavior. A changed deployment or snapshot
fails explicitly; reload the page to read its current data.
