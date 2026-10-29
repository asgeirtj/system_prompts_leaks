# Native Inline Visualizations

Use this fallback reference only after the active workflow has selected an inline, chat-visible visual in positively identified Work Mode and the shared Data renderer or file-backed Visualize delivery is unavailable or has actually failed. The normal Desktop and Work Mode path is [inline-chart-renderer.md](inline-chart-renderer.md), preserving the same styling and editor. This reference does not choose inline delivery. Work Mode alone must never select this fallback.

`charts_widget_v2` and `app_block` are host-native Work Mode surfaces.

Do not use this reference to waive or replace `$build-report`, downgrade a selected report or dashboard to an inline answer, replace selected HTML/notebook/BI/slide/document output, or change the response mode selected by the Data index. If a report, dashboard, or HTML surface was selected, keep that surface and follow its existing rendering contract.

External MCP servers and other callable tools can still supply reviewed source data. The host-native surfaces below provide a fallback; they do not provide Data's shared source inspection or editing controls, so do not claim feature parity. Return an ordinary requested or lookup table directly as a Markdown table rather than constructing an interactive visual.

## Native Invocation

When this fallback is needed in positively identified Work Mode, `charts_widget_v2` is the directly surfaced native UI element for exactly one supported `bar`, `line`, `pie`, or `scatter` chart. For that case, invoke it with the exact host-provided `genui` content-reference syntax before considering fallback; do not search for it, self-declare it unavailable, or substitute a static image merely because no separate callable tool is visible. The payloads in this reference are widget arguments, not standalone assistant response text. Never emit a renderer payload as bare JSON, plain HTML, Markdown, or a code fence.

For a directly surfaced `charts_widget_v2`, the current Work Mode shape is `【genui|{"charts_widget_v2":{"content":{...}}}】`: the chart spec belongs inside the widget's `content` argument. Emit the live content reference without Markdown backticks or a fence.

For `app_block` when it is surfaced, use the equivalent outer shape `【genui|{"app_block":{"content":"<section>...</section>"}}】`. Unlike `charts_widget_v2`, keep `app_block` conditional on the host surfacing it. Use the exact invocation syntax the host provides if it differs from these examples.

## Renderer Choice

Choose the renderer that fits the already-selected inline result:

| Inline result needed | Renderer | Decision rule |
|---|---|---|
| Exactly one compact bar, line, pie, or scatter chart | `charts_widget_v2` | Use the host-rendered JSON chart when one chart answers the question without controls, KPI cards, or coordinated views. |
| KPI cards, filters, multiple coordinated views, a compact dashboard-like layout, or a chart family outside the JSON chart surface | `app_block` | Use one self-contained HTML fragment with local data and local interaction. This is the default for rich inline analytical visualizations. |
| A live `charts_widget_v2` reference was emitted and rejected or failed to render, or no suitable native renderer exists for the requested chart family | Reproducible static/Matplotlib chart | Preserve the requested visual using the same reviewed rows, and inspect the generated image before delivery. |
| No visual renderer can be produced or delivered, or the answer is inherently table-shaped | Compact Markdown table or prose | Preserve the answer and exact values without claiming that a visual rendered. |
| User explicitly asks for Python, Matplotlib, a notebook, a standalone static image/file, or an export | Static renderer | Honor that explicit surface request without attempting native inline rendering first. |

Mermaid is not a quantitative data-chart renderer for this path. Do not use it as a substitute for `charts_widget_v2`, `app_block`, or the static visual fallback.

When a native inline visual fails, prefer a static visual before a compact table. Do not switch a report to an app block merely because an inline app block would look better.

### JSON Charts Versus Custom Interactive HTML

Use the JSON `charts_widget_v2` path only for its supported simple chart families: `bar`, `line`, `pie`, and ordinary fixed-size `scatter`. A scatter spec can position points by x and y, but it cannot encode a third quantitative variable as point area; a true bubble chart is therefore not a `charts_widget_v2` scatter chart.

For bubble charts, funnel charts, and any other inline chart family outside that JSON surface, use `app_block` custom interactive HTML when the host surfaces it. Do not decline the request, ask the user to repeat it, emit an unsupported JSON shape, or fall back to Matplotlib merely because `charts_widget_v2` does not support the family. Build the custom HTML visual in the same answer, wrapped as a live `app_block` `genui` content reference. Use the static/Matplotlib path only if `app_block` is not surfaced, its emitted reference is rejected or fails to render after one targeted correction, or the user explicitly requested static/Python/export output.

For a bubble chart, follow the compact custom-HTML pattern: embed bounded reviewed rows; use inline SVG for axes, grid, labels, and circles; map x and y to position and the third measure to circle area/radius; add a concise size legend; and use a small labeled filter, hover/focus tooltip, and `aria-live` status only when they materially improve exploration. For a funnel, use inline SVG or semantic HTML/CSS for ordered stages, label each stage and value directly, show adjacent or step-to-step conversion where useful, and keep any filter or highlight interaction local and simple. Keep CSS app-scoped, use host design tokens, use vanilla JavaScript with `addEventListener`, and keep all data local; do not use external libraries, network requests, or raster screenshots.

## `charts_widget_v2`

Use `charts_widget_v2` only for exactly one polished `bar`, `line`, `pie`, or `scatter` chart. Inside the required `charts_widget_v2` invocation, put one valid chart-spec JSON object directly in its `content` argument; do not stringify it, nest it under another inner key, or add prose, Markdown, JavaScript, JSX, imports, comments, or code fences. Do not print the chart spec as the assistant response.

The JSON spec should contain `chartType`, `meta`, the relevant field mappings, and `data` last:

- `meta` contains a concise `title`, a reader-facing `description`, and optional `footer`.
- Bar, line, and scatter charts use `xKey`, optional `xAxisLabel`, and `series`; pie charts use `nameKey`, `valueKey`, and `series`.
- Each series uses a stable `dataKey` and may add `label`, `axisLabel`, `valueFormat`, `valuePrefix`, or `valueSuffix`.
- For percentages with `valueSuffix: "%"`, pass percentage points such as `42` for `42%`, not `0.42`.
- Use `layout: "vertical"` for horizontal bars when long labels or six or more categories make that easier to read.
- Use friendly date labels in `data` rather than raw ISO strings unless exact source labels are required.

Let the host renderer own the card, spacing, axes, grid, tooltip, legend, colors, hover states, responsive layout, compact formatting, and dark mode. Do not add an outer card or custom color system. If the answer needs shared filters, KPI cards, a coherent multi-chart layout, a true bubble chart, or an unsupported family such as heatmap, waterfall, funnel, histogram, box plot, or cohort matrix, use `app_block` instead.

## `app_block`

Use `app_block` for a richer but still compact inline analytical surface. Inside the required `app_block` invocation, provide one self-contained HTML fragment in its `content` argument; do not print that HTML as plain response text or a code block:

- Include only app markup, optional app-scoped `<style>`, and one optional final `<script>` block.
- Do not include `<!doctype>`, `<html>`, `<head>`, `<body>`, an outer `<main>`, a Tailwind CDN script, imports, exports, frameworks, JSX, custom elements, iframes, external scripts or stylesheets, network requests, storage APIs, or permission-gated APIs.
- Use plain HTML, app-scoped CSS, Tailwind utilities when helpful, and vanilla JavaScript with `addEventListener`; do not use inline event handlers.
- Keep all reviewed data embedded and bounded. Do not fetch data at render time or imply live refresh.
- Prefer responsive grids and stacks that fit chat-message width. The top-level fragment should not add a decorative outer card, border, shadow, background, or padding; use those treatments only for meaningful internal controls, KPI cards, chart regions, and result boxes.
- Use semantic controls with visible labels, local state, focus-safe spacing, and `aria-live` for dynamic results.
- Prefer crisp inline SVG for chart marks, axes, labels, and annotations; use HTML/CSS for cards, legends, filters, and tables. Avoid raster images and do not recreate a full-page app.

A strong analytical app block usually has a short heading, one or two clearly labeled controls only when they materially improve exploration, a compact KPI row when headline values matter, one primary chart, optional supporting comparison, and a concise takeaway or caveat. Keep interaction focused: filter, metric switch, series toggle, or highlighted comparison is enough. Do not build a long dashboard, multi-screen application, file upload flow, or remote-data experience.

## Data And Visual Quality

- Use only reviewed values and keep the visual grain, time window, units, denominator, and filters consistent with the surrounding analysis.
- Embed only bounded fields needed for the displayed marks or requested interaction; omit hidden reasoning, credentials, secrets, tokens, direct personal contact/payment identifiers, and other unnecessary sensitive values.
- Use the simplest chart family that answers the question, readable labels, honest axes, restrained color, compact number formatting, and direct labels or a clear legend when grouping matters.
- Keep material caveats that change interpretation or action in the surrounding response or concise visible notes. Cite useful sources when they help trust, but do not narrate source selection or methodology unless the user asks, the selected template requires it, or it materially changes interpretation or action.
- Keep raw source SQL out of surrounding answer prose unless the user explicitly requests it; preserve recorded SQL in a supported source inspector.
- Do not claim that a chart, app block, or filter rendered unless the selected native surface actually rendered.

## Failure Path

For exactly one supported `bar`, `line`, `pie`, or `scatter` chart, do not classify `charts_widget_v2` as unsurfaced before attempting it: emit the live `genui` content reference first. If that emitted reference is rejected or fails to render after one targeted correction, render a reproducible static/Matplotlib chart from the same reviewed rows, inspect it, and deliver it on the selected response surface. For a richer composition, keep `app_block` conditional on the host surfacing it; if it is not surfaced and no other suitable native renderer exists, use the same static visual fallback. Use a compact table or prose only when a static visual also cannot be produced or delivered, or when the answer is inherently table-shaped.
