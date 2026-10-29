# Cards and layout

## Evidence wrappers

`DataComponent` wraps tables, custom visuals, and composites that need custom spec resolution. It inherits source inspection, chart exploration, copy/hide actions, and title editing; do not recreate those actions. Keep its chart record consistent with the custom plot. Prefer [EvidenceChart](charts.md#bind-a-chart-to-reviewed-evidence) for a standard source-backed chart.

For multiple reviewed sources, supply a primary `queryId` and ordered `queryIds`. Charts, tables, and metrics must provide explicit `displayRows`, including `[]` for an empty scope; query IDs do not join or aggregate data. Keep original scoped evidence separate in `sourceRowsByQuery`. Source inspection and copying retain each query independently.

A `SortableItem` with the same stable ID hides its entire slot automatically. Use `visible(compositeId)` for a separately owned custom container when its child IDs differ. See [sortable layout](sortable-layout.md) for hiding, restoring, and moving blocks.

## Card surfaces

Use `<DataComponent variant="card">` for an ordinary chart, table, or custom card on either surface. It owns padding, border, background, shadow, theme radius, and 60% Figma-style corner smoothing. Standard padding is **16px vertically / 20px horizontally**; `padding="spacious"` uses **20px on every side**.

Use `variant="plain"` for container-free content. It is the `DataComponent` default and the preferred report presentation. Reports may explicitly opt into cards without CSS exceptions or a separate report-card component.

Classic cards have a 20px smoothed radius. Other themes retain their own radius; square cards remain square. Theme tokens `--data-card-radius`, `--data-card-background`, `--card-shadow`, and `--border` own their appearance. A deliberately custom plain wrapper may still opt into `smoothCorners` at its own uniform CSS radius. Smoothing never clips menus, focus rings, or chart interactions.

`MetricCard` uses `variant="card" padding="spacious"` by default, with a 112px minimum height. It accepts children for an integrated trend and omits its duplicate mini-sparkline. Supply the chart spec, display rows, and nonduplicated source evidence for consistent editing and inspection. See [comparison formatting](comparison-formatting.md) for deltas and trend labels.

## Sections and headings

Use `Section` for a fixed group and `SectionHeader` in a canvas row's `header` slot. Both are surface-neutral; neither invents a query or source-backed component identity. Pass a stable globally unique header `id`; it is also the persisted text-edit key. Headers use 20px / 28px, weight 600, and -0.5px tracking.

Both accept optional `filters={<Filters {...scope.filterProps} />}` on the right, wrapping below the title when needed. A filtered `Section` requires an authored title to name its scope. See [filtering](filtering.md) for the shared scope bindings.

In Edit mode, titles can be edited inline and their menu offers **Hide heading**. Hiding affects only the heading, never its charts or filters. The stable header ID also persists its hidden state; undo/redo and **Restore hidden** work on headings and cards alike. Headings are not draggable.

`Section` defaults to one column and `spacing="section"`. `columns={2}` stretches adjacent cards to equal height and collapses to one column on mobile. Keep the shared stretch behavior for cards in the same row. To compact a row, shorten its chart bodies together rather than top-aligning individual cards. Independent rails or intentionally staggered custom layouts may size their cards separately.

| Spacing | Shared geometry |
| --- | --- |
| Cards | 20px |
| KPI cards (`kind="metrics"`) | 12px in both directions |
| Header to content | 20px |
| New section (`spacing="section"`) | 40px |
| Continuation (`spacing="content"` or `"continuation"`) | 20px |
| After KPIs (`spacing="after-metrics"`) | 32px total |
| `spacing="none"` | No leading space |
| `spacing="metrics"` | 16px |

A directly nested standard canvas inherits its initial gap from the containing `Section`; explicit row spacing still wins. Do not add outer gaps on top of shared spacing or reproduce these rules in `dashboard.css` / `report.css`. Those stylesheets own only the particular composition, custom visual internals, and analytical heights.

## Custom dashboard frames

For a deliberately custom dashboard frame, its direct authored root may declare `data-dashboard-layout="full-width"` for authored gutters with normal page scrolling, or `data-dashboard-layout="viewport"` for the remaining viewport height below chrome with authored scrolling panels.

The shared shell owns outer geometry. These opt-ins do not change chrome or apply canvas constraints; ordinary dashboards should omit them. Never target shell selectors from authored CSS to obtain these layouts. Put user-owned logos and custom visual assets in `src/content/assets/`. Report frame options are in [reports](reports.md#frame-and-snapshot).

## In-page section navigation

`SectionNavigator({ sections: [{ id, label }], placement: "auto" | "inline" })` is optional navigation for long dashboards. Place it beside the sections under their common content parent. It preserves filters/URL state, tracks the visible section, and expands its compact link panel in place on hover or keyboard focus. Escape/outside dismissal, reduced motion, and an interruptible 180ms scroll transition are shared.

Auto placement shows a desktop rail when the compact control fits in the left gutter with 16px of breathing room; with the standard 1440px column it appears at 1600px. It also hides below 1081px. The persistent rail never overlaps content. The deliberately opened menu is a temporary popover and may extend over the page; it does not reserve a permanent 194px sidebar. Do not automatically insert a mobile block.

Explicit inline placement supports contained scrolling examples. Use this component when a long page has several meaningful sections that users repeatedly jump between; omit it on short pages. It does not replace dashboard tabs for distinct questions or scopes.
