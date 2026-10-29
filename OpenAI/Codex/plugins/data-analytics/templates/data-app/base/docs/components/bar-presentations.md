# Bar presentations

Use `Chart` for bar-family plots, bullet/target charts, segmented compositions, grouped/ranked lists, progress, ranges, and comparisons. Ordinary chart specs are unchanged; presentations are explicit rather than an automatic visual conversion.

For ordinary axis-title behavior, see [charts](charts.md#sizing-and-axes).

## Recipes and field bindings

```jsx
const chart = barChartSpec({
  presentation: "bullet", category: "team", value: "revenueUsd", target: "planUsd",
  format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
});
// Pass the same chart and reviewed rows to DataComponent and Chart.
<Chart spec={chart} rows={rows} {...chartProps("team-plan")} />
```

`barChartSpec` translates recipe names into the canonical `{ type, x, y, presentation, barOptions }` shape. `barOptions` retains the supported `series`, `range`, `markers`, `target`, `projection`, `track`, `axes`, `labels`, and `style` options from Component Lab. `format` contains Intl number-format options; range display text can come from `rangeLabelField`. Materialize calculated ranges/labels in reviewed derived rows, not callback-valued chart specifications. Source projection retains every referenced measure, goal, range, tooltip, and display field.

Progress hover content defaults to a concise actual-of-goal summary and percentage. Set `unitField` to a reviewed row field such as `unit: "hours"`; explicit `tooltipFields`
still request the structured tooltip. Segmented comparisons may use `annotations: "auto"`
to retain aligned labels only when every segment's label and value fits; otherwise they show a value table. The legacy `"aligned"` mode uses the same overflow protection.  
Hover or keyboard focus emphasizes the same segment across both periods and their annotations, including the narrow-layout table. Category colors remain unchanged.

## Progress and ranges

- For attainment against a positive goal, use `presentation: "progress", track: { max: "goalField" }`. Optional `style: { segments: 10 }` renders 2–40 equal steps, rounding the filled step count while keeping exact attainment in text/hover. This is not a part-to-whole composition. `detailField` plus `labels: { position: "summary" }` gives a compact percentage/detail row.
- For a current value within known bounds, use `presentation: "rangePosition", category: "label", value: "current", range: ["low", "high"]`. It supports signed values; a collapsed interval centers its matching value. Outside values pin the marker to the appropriate end but retain their exact value in text, hover and source. Missing bounds/current never produce a fabricated marker. `labels: { primary: false }` omits the duplicate heading when embedded under an existing label. It is not a confidence interval unless the supplied evidence actually defines one.

## Editing and data requirements

Specialized presentations edit compatible reviewed-field mappings. Arbitrary type changes, splitting, or generic appearance toggles that would discard presentation requirements are not offered. Signed values belong in plots or range-position indicators; progress needs positive reviewed goals; composition needs complete, mutually exclusive additive segment values. Missing values are not zero, absent targets are not invented, and zero-total composition has no percentage share.
