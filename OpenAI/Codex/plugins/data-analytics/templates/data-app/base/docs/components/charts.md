# Charts

## Bind a chart to reviewed evidence

Prefer `EvidenceChart` for source-backed charts. It connects the shared renderer to `DataComponent`, so one effective edited spec drives the plot and source/actions record. Legend/zoom state and hidden state come from the shell; the wrapper chooses no page layout, card variant, or data aggregation.

```jsx
import React from "react";
import { EvidenceChart, useDataApp } from "../../data-app-public.jsx";

function AdoptionTrend() {
  const { reviewedRows } = useDataApp();
  const rows = reviewedRows("usage_summary", ["week"]);

  return (
    <EvidenceChart id="adoption-trend" queryId="usage_summary"
      title="Weekly adoption" spec={{ type: "line", x: "week", y: "activeUsers" }}
      rows={rows} sourceRows={rows} height={260} />
  );
}
```

Pass `rows` for plotted values, `sourceRows` for scoped reviewed evidence, and ordinary `DataComponent` props for title, controls, provenance, and surface styling. Renderer-only callbacks such as `getMarkActions`, `tooltipContent`, and `onSankeySelection` go in `chartOptions`; shell-owned identity, spec, rows, and persistent interaction props take precedence. For a scroll container or custom plot adornment, `renderPlot={(plot, chart) => ...}` wraps the connected plot. Children follow it as an optional footer. Heights and controls remain authored choices.

When composing `DataComponent` with `Chart` or `ChartRenderer` directly, use the same stable component `id` and `chartProps(id)`, and keep the wrapper's chart record consistent with the plot. Authored specs are fallbacks; saved `chartOverrides[id]` take precedence. Do not reapply fixed types, axes, fields, series, labels, or appearance over an edited spec. Verify that an edit previews correctly, applies after Save, and survives reopening the editor and reloading the app.

`useDataApp().chartExportActive` is true while the native Export chart dialog owns its independent preview. Expensive authored views may suspend their background plot children until it closes, while retaining complete source/display rows, resolved chart registration, layout height, and shell-owned legend/zoom state. This signal does not apply to Copy as image, which captures the mounted chart. Offscreen or suspended placeholders must remain unavailable to image capture; resume the actual renderer before exporting them.

Saved chart settings are complete snapshots: omitted settings use renderer defaults. Supply reviewed waterfall totals separately with `dataInputs={{ beginning, ending }}` on `EvidenceChart`, or pass the same inputs to both `DataComponent` and `Chart`/`ChartRenderer` when composing them directly. Those current values travel with source inspection, editing, and export. Legacy totals inside `spec` remain supported; `dataInputs` cannot override visual settings.

## Field mappings

Use exact keys from the plotted rows. `y` is one field name, never an array. These runnable examples show the three common bindings:

```js
const wideRows = [
  { week: "2026-08-03", north: 18, south: 12 },
  { week: "2026-08-10", north: 21, south: 15 },
];

// One measure: one numeric row key in y.
const singleMeasure = { type: "line", x: "week", y: "north" };

// Several measure columns in each row: scalar y plus all plotted fields.
const wideMeasures = {
  type: "line", x: "week", y: "north", fields: ["north", "south"],
};

// One measure column with separate rows per group: scalar y plus series.
const longRows = [
  { week: "2026-08-03", site: "North", orders: 18 },
  { week: "2026-08-03", site: "South", orders: 12 },
  { week: "2026-08-10", site: "North", orders: 21 },
  { week: "2026-08-10", site: "South", orders: 15 },
];
const groupedMeasure = { type: "line", x: "week", y: "orders", series: "site" };
```

Pass `wideRows` with `singleMeasure` or `wideMeasures`, and `longRows` with `groupedMeasure`. For `y: ["north", "south"]`, replace it with `y: "north", fields: ["north", "south"]`; do not cast, stringify, or flatten field names to suppress an error. `series` names a categorical row key, not an array of measure keys. Preserve genuine null observations rather than zero-filling missing values to force marks.

Set `stackable: false` for non-additive or overlapping series; omitting a stacked initial view or mentioning overlap in prose does not constrain editing. Use `type: "horizontalBar"` for horizontal bars and `"horizontalStackedBar"` for horizontal stacks. Specialized bar recipes are in [bar presentations](bar-presentations.md).

## Sizing and axes

Size the authored grid/card container and use the chart's `height` prop; leave renderer-internal widths alone. In particular, `max-width: 100%` on `.recharts-wrapper` can resolve against Recharts' intentionally zero-width measurement wrapper and hide a correctly populated plot. Verify actual painted marks and nonzero SVG bounds after building, not merely a successful bundle or data/paths in the DOM.

Ordinary charts omit inferred axis titles; ticks and legends still carry their units. Set `xLabel`/`yLabel` for necessary context or `showXAxisLabel`/`showYAxisLabel: true` to request inferred titles. Explicit `false` hides that axis title. Numeric relationships, distributions, and separate value scales retain the applicable inferred titles.

Temporal axes measure labels against actual plot geometry. Date-based line/area trends use elapsed time. Regularly sampled series label actual observations at a consistent stride, including monthly and month-end series; irregular series use independent UTC calendar ticks without adding source rows or compressing time gaps. Bars and mixed line/bar charts retain bucket centers with a consistent label stride. Neither mode forces an endpoint label that breaks the cadence. Exact observation dates remain available in tooltips and source inspection. Do not compensate with authored margins or hard-coded date ticks. Browser checks verify observation alignment, cadence, containment, and interactions; Recharts SSR omits actual axes.

## Units, labels, and colors

`valueDecimals`, `yTickCount`, and `legend.labels` control presentation without changing units. `currency: "USD"` formats quantitative axes and values in that currency; use it only when the quantitative measures share that currency, not on mixed-unit charts. `valueDecimals` controls hover precision.

Percentage inference recognizes 0–1 fields ending in `Rate`, `Retention`, `Share`, or `Adoption`. Signed fields describing growth, change, delta, or variance retain percentage units outside that interval. A field ending in `(%)` contains 0–100 percentage values instead. A generic `format: "percent"` is not supported. For a source alias such as `rate_w4`, derive a display-row alias such as `week4Retention` with the same raw value and preserve the original source rows. Verify cells, axes, and tooltips, not just the legend.

Line/sparkline specs may declare `lineGradients: { revenue: ["var(--chart-1)", "#61c7ff"] }`. An explicit stop is `{color, offset}` with offset from 0 to 1. Stops are serialized and rendered by the core chart, not injected into SVG afterward. Keep an appropriate base `colors` entry for legends and hover.

`legend.comparisons: "grouped"` links each metric's current/prior series with matched colors and dashed/faded comparison styling; paired tooltip columns use their actual dates. For semantic delta colors and signed labels, see [comparison formatting](comparison-formatting.md).

## Mark actions and coordinated views

`ChartRenderer getMarkActions({ row, field })` returns bounded `{ label, context?, onSelect }` actions. Keep callbacks viewer-local and in authored code, never in chart specs or reviewed rows. `tooltipContent` can compose public `ChartTooltip` for concise reviewed details.

Clicking an actionable hovered mark morphs its tooltip into the shared actions-only card at the same anchor. The opaque surface, corners, and shadow are preserved; animation respects reduced motion. Hover remains pinned until click-away or Escape. A single-date selection preserves its cursor and points, not an axis-label-sized band. Ask remains a separate capability; exploration can work where Ask is unavailable.

Pie, scatter, and heatmap pointer tooltips follow the cursor with viewport-edge collision handling; keyboard hover keeps its datum anchor. Heatmap cells share continuous hit areas, while missing/unobserved gaps remain non-actionable. Pie tooltips retain category identity.

Sankey charts expose `onSankeySelection(criteria)` for coordinated detail views. Committed node/link selection emits `{ field, name, stage, key }` criteria (empty on clearing), not transient hover. Filter the underlying records by every criterion; a link represents its two endpoints, not an inferred complete path.

For custom visualizations, use public `ChartMark` inside `data-chart-interaction-root`. It renders a native button with `tooltip={<ChartTooltip ... />}` and `context={{kind:"chart",chartType:"heatmap",label,value,row,actions:[{label:"View customers",onSelect}]}}`. Supply ordinary accessible button props. Put cross-block changes in the named action, not the mark click; preserve useful defaults separately from explicit selection and restore focus/scroll on return.

## Heatmaps

Annotated heatmaps support `showValues`, `reverseRows`, `tooltipFields: [{ field, label }]`, and `missingValues: "gap"`. Match `colorDomain` to raw units, such as `[0,1]` for fractions. In gap mode, null/absent cells are unobserved, not zero. The shared palette and annotation contrast are automatic. Use an authored semantic [table](tables.md) when additional metadata columns or custom cohort navigation are needed, while retaining shared cards and selection controls.

## Supported chart annotations

Line, area, bar, and horizontal-bar specs accept up to eight `annotations`, each with stable `id`, `kind`, and one plain-text `label` of at most 160 characters without control characters.

- `benchmark`: plotted `measure` and numeric reviewed `field` constant across plotted rows, or `at` selecting one unambiguous x value.
- `event`: exact ISO-date `at` and a reviewed text/boolean evidence `field`.
- `range`: exact ISO-date `at` and `end`.
- `point`: exact `at` and visible plotted `field`.

Do not supply arbitrary y values, extra rows/SQL, or another query. Include relevant definitions/lineage in the same reviewed query. Missing, conflicting, filtered-out, or unsupported anchors are omitted. Sparse factual callouts may identify reviewed points, extrema, changes, or threshold crossings, or add supported external context; zero is valid. Preserve the supporting evidence for external facts, and do not infer causality from event timing.

The renderer owns plain-text placement, wrapping, connectors, and a full-label figure-note fallback when the plot has no room. Preserve source inspection, print/image evidence, and the existing Show annotations switch. Visibility defaults on unless `showAnnotations === false`; do not invent an annotation editor.
