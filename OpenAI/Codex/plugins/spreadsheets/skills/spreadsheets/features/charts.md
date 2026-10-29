# Charts

Use a chart when it clarifies a comparison, trend, distribution, or relationship; otherwise prefer a compact table or summary. Give each chart a distinct analytical purpose. Create native, editable workbook charts, not static images.

Follow Tufte's principles: graphical integrity, clear comparisons, and minimal non-data ink while retaining useful context and readability.

## Choose the chart

The available API may not support all chart types; always reference the spreadsheet authoring API documentation for chart and export support.

These are defaults, not restrictions; choose what makes the comparison or relationship clearest:

- Comparisons/rankings: bar or column; sort rankings by descending value.
- Time trends: line in chronological order; area only when the filled volume adds meaning.
- Distributions: histogram for shape; box-and-whisker for median, spread, and outliers. If unsupported in the available API, use formula-backed bins with bars or a summary table.
- Relationships between numeric variables: scatter.
- Part-to-whole: sorted bar or compact table; pie/doughnut for a few slices when rough share is enough.
- Exact values: table. Single metric with context: compact KPI plus a small trend/sparkline.

## Keep data auditable

- Bind series directly to source cells so edits update charts; use expandable ranges where supported and useful. Derived values must use formulas; raw inputs need not.
- Use compact, formula-backed helper ranges only for reshaping, date grouping, shorter labels, render/export workarounds, or useful tables that drive charts, within the authorized edit scope. Keep source tables legible and retain full labels. Group crowded dates by Year, Quarter, Month, or Week when appropriate.
- Preserve missing values as blanks, not invented zeros, including in helpers. Keep category and series ranges aligned; disclose omitted observations and aggregation that affects interpretation.
- Show enough context for fair comparisons; do not cherry-pick periods or omit relevant baselines. Keep comparable charts consistent in scales, units, colors, and date ranges.

## Format and place

- Preserve process order for workflows.
- Place charts near the data they explain, aligned with related charts, with whitespace and no overlap with data, controls, notes, or other charts.
- Size to rendered content: compact for few marks, larger only for dense data, labels, or legends. Shrink obvious unused space during visual QA.
- Match workbook typography and title hierarchy. Use plain titles, e.g. `Profit by Category ($bn)`, no larger than section labels. Avoid placeholder titles.
- Use plain, human-readable chart titles and units; write `($K)`, `($M)`, or `(USD thousands/millions)`, never `($000)`.
- Show units in titles, axes, or labels. Set axis number formats explicitly; do not assume source-cell formats carry over. Derive display units from stored units and verify actual ticks (e.g. 1,500,000 dollars displays as `$1.5M`). Never rescale source values or apply scaling twice to fix presentation.
- Include zero on bar/column and area value axes. Line/scatter axes may use a narrower range when useful; make bounds and any logarithmic scale clear. Avoid scales or 3-D effects that exaggerate differences.
- Add axis titles only when meaning or units are unclear. Label values selectively when exact numbers matter or axes are hard to read; avoid labeling every point on dense lines. Prefer direct labels for a few series; when a legend is needed, place it above the plot without crowding the title or data, unless the reference specifies otherwise.
- Use the workbook or supplied brand palette consistently for meaning; match the same business item across charts and tables, and preserve meaningful warning/status colors. Keep single-series charts one color unless highlighting meaningful differences. Use a contrasting neutral or palette color for reference/target series; add a dashed line when it helps distinguish the reference. For line charts, set the line stroke explicitly; `series.fill` alone may color a preview without setting the exported line. With the artifact tool, use `series.line = { fill: color, style: 'solid', width: 2 };` (or `style: 'dashed'` for a reference). Avoid unnecessary gradients, heavy borders, excessive gridlines, and decorative effects unless requested; retain useful reference lines.

## Verify and repair

- Before creation, verify source ranges/formulas, headers, categories, series names/values, orientation, and point counts. Repeat these checks after creation or editing, and verify expected chart count and bindings. Exclude headers from values; catch stale/disconnected ranges, formula errors, and categories misread as series.
- Render and inspect at normal zoom: correct values/units, readable titles, ticks, labels, and legends; no blank charts, clipping, crowding, duplicates, or overlaps.
- Verify saved/exported series colors and line strokes against the intended palette using the exported file's chart properties or target application; a correctly colored authoring preview is not enough.
- If categories become series, points disappear, or numeric/date labels or blanks misrender, normalize a formula-backed helper range with explicit labels (e.g. `Jan 2025`) and rebuild once. If the requested type cannot be delivered, disclose the limitation and use the closest clear supported alternative; do not claim the original requirement passed.

## Edit existing charts

First inspect the chart object, source ranges/formulas, and rendered output. Preserve layout and style unless redesign is requested; move or resize minimally to resolve overlap. Apply the verification above after editing. Leave unrelated pre-existing errors unchanged unless they break the requested chart or the user requests an audit/repair.
