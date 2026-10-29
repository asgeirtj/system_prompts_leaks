---
name: visualize-data
description: "Design, build, revise, and verify quantitative charts and figures while authoring reports, dashboards, notebooks, and other durable artifacts. Do not use for inline chat charts."
---

# Data Visualization

Create quantitative visuals that are analytically sound, immediately readable, and polished enough to ship in a report, memo, slide, dashboard, notebook, or HTML artifact. Use each chart's analytical question or supported takeaway to plan the visual; dashboard takeaways remain private planning context unless the user explicitly requests visible commentary. Redesign charts that are visually attractive but analytically weak, and revise charts that are technically correct but hard to interpret.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.
- When creating or revising visuals in a Data report or dashboard, follow the [Data App Contract](../../shared/data-app.md).

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Data Warehouse: Authoritative quantitative evidence at the grain and scope needed for each chart.
- Business Intelligence: Governed measures, reporting comparisons, and semantic definitions.
- Product Analytics: Event, funnel, retention, and experiment data for behavioral visuals.
- Knowledge & Files: Supplied chart data, metric definitions, annotations, and visual references.

## Related Skills

Use $metric-diagnostics when the visual needs an explanation of a metric movement.

Inline Codex answers use Data's shared React/Recharts inline renderer and `visualize:visualize` delivery.

Use $build-report when the visual is part of a durable analytical report.

## Runtime Delivery Routing

Inline Codex answers are not owned by this skill. The Data index invokes its shared React/Recharts inline renderer directly and delivers the resulting fragment through `visualize:visualize`.

For visuals in a Data report or dashboard, define each visual with `ChartRenderer` or a source-backed custom React/Recharts component, back it with reviewed query rows and exact source metadata, and keep stable authored component and query IDs. Preserve the single **Copy link** action in every published component menu: charts use `/_data/charts/<target-id>`, while non-chart metrics, tables, text, and custom widgets use `/_data/components/<target-id>`. The target is an eight-character base64url alias derived from the first 48 bits of the canonical-Site-origin/authored-ID UUIDv5 without changing DOM/presentation identity or persisting a mapping; previously issued full-UUID/readable component/chart links and chart `/detail` URLs remain backward-compatible. Preserve supported view parameters in copied URLs following [Sharing selected views](../../shared/data-app.md#sharing-selected-views). Keep them free of readable component names, unrelated query parameters, fragments, credentials, tokens, and task IDs, and never present an opaque locator as a secret or component-scoped access to a whole-dashboard snapshot.

## Chart Selection

| Data relationship | Best chart | Use it well |
|---|---|---|
| Trend over time or ordered axis | `line` | Show enough points to reveal shape; use `area` only when filled magnitude helps, and `sparkline` only in dense KPI cards |
| Composition over time | `stackedArea` | Use when parts should read as one total; switch to `line` when comparing component trajectories matters more |
| Comparison across categories | `bar` | Sort when order is not semantic; use horizontal bars for long labels; avoid redundant legends |
| Ranking or top-N | `rankedList` | Use the shared theme-aware Leaderboard; start with five rows, fill a taller adjacent card, and retain Show more |
| Part-to-whole composition | stacked `bar` | Keep the denominator explicit; use `pie` only for a rough read with few slices |
| Distribution or spread | `histogram` | Use numeric bins that reveal shape; switch to `boxPlot` when comparing groups is the point |
| Distribution across groups | `boxPlot` | Use when median and spread matter more than full shape; switch to `histogram` when shape needs space |
| Relationship between two numeric variables | `scatter` | Use numeric x and y at a meaningful observation grain with enough distinct points to show a pattern; retain point labels, sample/volume fields, and one useful grouping candidate when safe |
| Estimate or forecast with material uncertainty | Point + interval, or line + band | Show reviewed bounds, interval meaning, and level using the selected surface's supported or permitted custom visual path; follow [Uncertainty](#uncertainty) |
| Dense two-dimensional pattern or cohort matrix | `heatmap` | Use for matrix shape or intensity; switch to `scatter` when point-level variation matters |
| Additive bridge from start to end | `waterfall` | Use only when drivers sum cleanly to the end value; otherwise use ranked `bar` |
| Ordered stage progression or drop-off | `funnel` | Use only for ordered single-series stages; prefer stage `bar` when funnel geometry distorts comparison |

When the user has not specified a time range or granularity, choose them together from the analytical question, metric cadence, source timescale, and intended comparison: use enough history and a fine enough grain to reveal meaningful cycles and changes, but avoid detail that adds noise or unnecessary query cost. Treat this as an adaptive default rather than a fixed rule, honor an explicit user-selected range or grain unless it is incompatible with the metric definition or source constraints, and refine the range or grain deliberately if the first result is too sparse or noisy.

For dashboard charts, a descriptive title can replace a redundant x- or y-axis title when the categories, ticks, and units already make that dimension obvious. Keep explicit axis titles for ambiguous measures, scatterplots, nonobvious units, or comparisons whose dimensions cannot otherwise be identified. Format each reviewed category consistently across its axis, tooltip, direct label, and legend. Preserve the shared readable axis-label font size; resolve dense dates or long categories by removing intermediate ticks, formatting dates compactly, or truncating labels with accessible full text, never by shrinking type or clipping text. Center donut summaries inside the actual ring, keep legends compact and responsive, and never allow chart annotations or tables to escape their component.

Geographic visuals called maps must use actual projected geographic geometry and truthful geographic coordinates. Reuse the shared world-map asset where available; otherwise choose a clearly labeled regional or country bar chart. Every map marker needs a visible custom tooltip on pointer hover and keyboard focus with its reviewed place, relevant values, and reporting period; an SVG `<title>`, browser-native tooltip, or inaccessible `aria-label` alone is not enough. Decorative regional buckets, schematic blobs, or bubbles at arbitrary locations are not maps.

## Workflow

1. Identify the analytical question, intended comparison, and context needed to make the visual honest. For dashboards, do not put takeaways in visible titles, captions, or commentary unless requested.
2. Choose the simplest defensible family and variant for the reviewed data. Reuse the active report/dashboard workflow and apply the shared [analysis quality criteria](../../shared/analysis-quality.md) to the supporting analysis. Do not require separate chart contracts or per-chart skill handoffs.
3. Select the delivery path that matches the final surface.

   - Use the selected report, dashboard, BI, notebook, slide, or static HTML surface's native chart primitives only when the user explicitly selected that surface or the active report/dashboard workflow selected it before chart rendering.
   - For reports and dashboards, render reviewed data directly with React and Recharts through the shared Data App Contract.
   - Outside the Work Mode native-render failure fallback, use static Python charting only when the user explicitly asks for Python, a standalone static image/file, or notebook-oriented output. Choose a reproducible local renderer and export the requested format. Do not use that path as the default for HTML reports or dashboards.
   - Use governed BI or dashboard-native widgets when that surface owns rendering.
   - Implement bespoke local HTML/CSS/SVG/canvas/JavaScript only for an explicitly selected non-report, non-dashboard output whose required interaction cannot be represented by the chosen surface. Report and dashboard charts use the shared React/Recharts app; custom visuals still preserve stable component and query identities, reviewed rows, source inspection, and accessibility.

4. Build with the selected surface's primitives, reviewed rows, honest labels, and shared styling. Do not fabricate data or substitute demo rows unless sample data was requested.
5. For Data apps, show the first useful built version, then complete the requested scope in the same app and follow the contract's [bounded rendered verification](../../shared/data-app.md#build-and-verification). This check is part of ordinary authoring; broad shared-runtime QA belongs to plugin maintainers.

## Standards

### Selection Rules

- Prefer aligned positions or lengths for precise differences; stacks serve composition and color intensity serves matrix patterns. Use the chart-selection table to match the question.
- Small multiples comparing magnitude need common units, scales, category order, encodings, and time windows. Disclose independent scales used for within-group movement and label index baselines.
- Check whether averages hide spread or changing segment mix reverses a trend. Use distributions or relevant segments when they change the answer; weight rates correctly and preserve missing observations.
- For dashboards, follow the [dashboard composition decision](../build-dashboard/SKILL.md#decide-what-the-reader-needs). For standalone visuals and reports, render comparisons and patterns as charts when the evidence and delivery surface support them; retain tables for exact lookup and honor explicit table/prose requests. Sparse evidence or an unavailable surface is not a reason to invent a chart.
- Do not choose `line` merely because the prompt says "trend" or "trending". Decide first whether the reader needs current status, movement, variance to plan, mix, concentration, drivers, progression, or distribution.
- Choose a form the available evidence supports. For a few discrete periods, use KPI cards, grouped bars, a slope chart, or a table instead of implying a detailed trend. Query more history or finer detail only when the analytical question requires it, not to meet a point-count target.
- Use scatter for relationships among comparable observations at one grain, with consistent denominators, periods, populations, and filters. Do not mix totals and detail rows. Choose measures that can plausibly vary independently; retain point identity, sample/volume context, and useful grouping fields. Use size only when a third measure changes interpretation, and labels rather than unique colors for point identity. A few observations may read better as dots, bars, or a table.
- Use horizontal bars for long labels and sorted bars when order has no semantic meaning.
- Use compact leaderboard-style ranked bars only for top-N previews with one numeric value and 3-8 visible rows. Default to 5-6 rows in compact dashboard cards. Use a paginated table for long-tail browsing or exact lookup, Pareto for cumulative concentration, and waterfall for additive start-to-end driver bridges.
- Use `groupOther: true` only for mutually exclusive categories with a nonnegative additive measure. Keep the leading categories stable across the reviewed window, retain important cohorts, label Other, reconcile each period to its total, and preserve original rows in source inspection. Never sum overlapping audiences, percentages, averages, or per-user rates; recompute valid ratios from reviewed numerators and denominators or retain the categories.
- For continuous histograms, make neighboring bins nearly touch. Ordered numeric bands, bins, buckets, and time intervals automatically use narrow gaps; use `distribution: true` for other reviewed pre-bucketed numeric or temporal distributions and `distribution: false` when distinct category spacing is intentional. Preserve normal spacing when bars represent unrelated entities.
- Do not use leaderboards to rank KPI definitions or time-window definitions against each other, such as latest DAU versus WAU versus MAU. Use KPI cards or a compact table for latest values; use trends, indexed trends, share trends, or ratio charts for movement or relationship questions.
- For a category bar chart, do not encode the axis category again as `color` or `series` to manufacture a legend. Use a single color when identity is incidental, or category styling and direct labels when it matters. Grouped bars color the actual series dimension.
- Preserve authored themes and stable colors for recurring entities and lifecycle states across charts. Keep meaningful states distinguishable, including different failure states; do not collapse them to satisfy a palette limit. Use related shades for ordered intensity and semantic negative color for churn.
- For heatmaps, use adjacent responsive cells and one quantitative sequential color scale. Do not attach a categorical legend, expose transformed x/y index fields in the tooltip, or draw unrelated crosshairs; show the reviewed row dimension, column dimension, and correctly formatted measure instead.
- Keep axis ticks, direct mark labels, legend encodings, and tooltip values on the same unit scale. Fractional rates must display as percentages everywhere, while count metrics remain counts. Single-population scatter tooltips should show point identity and the two readable axis values without duplicate same-color swatches.
- Prefer variant escalation inside a family before inventing a new chart type: line to small multiples, bar to dot/lollipop, scatter to density, stacked bar to pie only when the circular read is explicitly useful.
- Include volume, denominator, sample size, or cohort context when omission could mislead.
- Repeated chart types are appropriate for comparable questions. Do not force chart diversity or a fixed chart count.

### Uncertainty

Show material uncertainty with the estimate using reviewed intervals or bands; identify their meaning and level, and retain method, sample, population, period, and units in source evidence. Preserve asymmetric bounds and disclose unavailable uncertainty. Do not invent bounds, treat observation spread or scenarios as confidence intervals, average bounds, or reuse aggregate intervals for subgroups. Keep uncertainty visible through filtering, resizing, and export. Use documented renderer fields or a visible estimate-and-bounds table when intervals cannot render faithfully. Significance of a difference needs evidence for that comparison, not just overlap between separate groups' intervals.

### Surface And Implementation

- For reports, dashboards, notebooks, slides, docs, HTML, or explicit static/file output, render in the selected surface. Use a reproducible static chart only when the user explicitly asks for Python, a static image/file, notebook-oriented output, or export. Keep this skill's output to chart selection, data planning, implementation guidance, and QA for the selected surface.
- When the selected delivery surface is a report or dashboard, use the shared app's supported chart families after selecting the analytical family. Do not let a renderer-supported type list drive chart selection.
- Retain useful reviewed context such as denominators, comparison periods, ranks, or grouping fields when available and safe. Do not query extra fields, fabricate auxiliary measures, or ship raw detail rows merely to enable alternative chart types.
- Shape chart-ready data for realistic alternatives, not arbitrary ones. A trend chart should usually retain its temporal field, value field, and meaningful segment/comparator fields; a category comparison should retain the category, value, useful grouping candidates, and rank/sort context; composition charts should retain the denominator or share context when available. A scatter chart should retain a stable point identity or label, numeric x and y measures, any denominator or sample-size fields, a useful volume/size candidate, and one or two interpretable grouping or filter fields. Do not promote a retained grouping candidate into a color/series encoding unless it adds information not already carried by the axis, facet, or table labels.
- Use the selected surface's native chart block when one is available. Do not add an extra decorative outline shell around charts.
- For every report and dashboard, use React and Recharts through the shared Data app and the Data App Contract's prebuilt-runtime build. Do not rely on remote scripts.
- Assume local environments can be minimal or offline. Use Data's pinned prebuilt browser runtime and bundled local authoring tools with Codex's Node runtime; do not require a package install or dependency cache.

### Visual Design And House Style

Palette limits, typography, and branding are house style. Honor user choices while keeping evidence truthful, readable, and accessible.

- Use visible, neutral chart titles unless finding-led titles are requested; preserve user-authored titles. Reports may place supported interpretation in their own titles and prose; dashboards stay factual unless commentary is requested. Add factual subtitles only for essential scope or units unavailable elsewhere.
- Use a single font family across charts and surrounding output when possible. Prefer white or near-white backgrounds, quiet grey grid lines, deep charcoal text, and restrained approved palette roots centered on blue, gold, orange, olive, and pink.
- Do not rely on color alone. Use tone, open fill, marker fill, line style, direct labels, ordering, or faceting when series or states need separation.
- Default to one non-neutral root for simple charts, two for focal/comparator or signed comparisons, and up to five for categorical identity. Use base tones for marks, lighter supporting fills, and dark keylines or references. Preserve intentional theme and entity colors; change forms rather than merge nonadditive categories to fit a palette.
- Generate explicit palette maps from declared colors. Do not let plotting library categorical defaults choose shipped chart colors.
- For signed values, avoid green/red by default. Use dark versus open/light fills, direct signed labels, and clear zero-line context unless documented domain semantics require an exception.
- For waterfall charts, use matched neutral start and end anchors plus exactly two non-neutral delta colors: one positive and one negative. Do not introduce extra hues or darker/lighter non-neutral keylines for individual drivers.
- Absolute-magnitude bars start at zero. Delta-focused waterfalls, bridges, variance bars, and movement charts may use a focused domain when zero would materially hide the change, with exact values, units, and a clear scale cue. Keep zero visible when values cross it. Do not use a focused scale to exaggerate an absolute comparison.
- Keep one stroke-width system for marks, keylines, guides, and reference lines. Use dark-neutral styling for benchmark, calibration, or ideal lines.
- Keep left and bottom axis anchors visible when labels depend on them. Remove ticks, guides, or connectors that do not improve the intended comparison.
- Always include the first and most recent reviewed date on temporal axes, prefer readable calendar-spaced intervals, and keep equivalent ranges and centered tick anchors consistent across related line, area, and bar charts. Treat numeric ranks and measurements as quantitative axes, not categories. Prefer horizontal category labels, then at most two readable wrapped lines; use a restrained 45° to 60° layout only when dense named categories or heatmaps otherwise hide meaningful labels, and reserve its full vertical space. Once diagonal mode is selected, show every reviewed category: adjust rotation and preserve distinguishable readable abbreviations rather than skipping alternate labels. Keep dates, times, and numeric labels horizontal. Apply one stable whole-axis collision policy, retain complete accessible names, and use `xTickLabelLayout: "horizontal"`, `"wrapped"`, or `"angled"` only when an authored exception is necessary. Preserve explicit axis titles when both measures need identification, such as scatter plots; never shrink labels to force additional ticks.
- Prefer direct labels when they reduce legend lookups; use a compact top legend when direct labels create clutter.
- Render every cell in a reviewed two-dimensional count matrix; represent an absent reviewed combination as a zero-valued, hoverable structural cell without presenting it as a separately observed source row.
- Show every categorical bar label, keep labels bounded and readable, and provide an expansion control for overflowing legends.
- Reserve explicit left and right space for horizontal or diverging bars with long labels or negative values. Do not shrink typography to force a narrow card.
- Do not use gradients inside chart marks, arbitrary colored chart backgrounds, inconsistent or ad hoc corner radii, or thickness as an emphasis channel.
- Let the report or dashboard composition determine chart width. Prefer full-width evidence charts in reports, preserve enough plot area for labels and legends, and stack naturally on narrow screens.
- Use the shared app's semantic theme tokens for chart containers, legends, KPI strips, and notes. Express intentional palette choices in the chart spec rather than one-off CSS colors.
- Use dark chart variants only when the containing artifact is dark.
- For research charts, lock the blossom to the header's top-right corner. Omit it for third-party, partnership, and non-research charts.

### Annotations

Use sparse factual callouts when they help locate or explain evidence; a direct label or no annotation may suffice. Reviewed chart rows can support peaks or threshold crossings without an external citation. Scope claims to the displayed population and period; statistical anomaly claims need a supported criterion. External events require a source actually read, and timing alone does not establish causality. Keep supporting evidence inspectable and dashboard callouts factual.

Use the component reference's `charts.md` for supported anchors and geometry. After filtering or refresh, update or remove invalid claims and anchors; preserve unrelated user notes. Keep labels clear of marks and axes, with material qualifications visible at narrow widths and in exports, using a figure note when needed. The existing [contextual examples](../../templates/data-app/base/examples/reports/contextual-stories/README.md) illustrate sourced events with fictional records.

### Quality Bar

- Compare displayed values, units, scales, periods, and denominators with reviewed evidence. Metric deltas identify the actual comparison date or cadence.
- Inspect normal and narrow layouts and requested exports for visible marks, readable labels, and no clipping, overlap, or detached annotations.
- Exercise the main filter: estimates, bounds, callouts, inspected rows, and exports must describe the same selected population.
- Check meaningful distinctions under common color-vision deficiencies and in grayscale, using available simulation, contrast review, and redundant encodings. Palette compliance alone is insufficient.
- Fix observed failures and state any unavailable checks. Reuse the selected surface's rendered verification; do not claim checks that were not performed.
