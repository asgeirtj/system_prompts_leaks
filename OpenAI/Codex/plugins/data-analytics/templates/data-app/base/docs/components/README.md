# Data app components

Read the guide for the task at hand; these bindings do not prescribe a dashboard outline or require reading every topic. The installed build-dashboard and build-report skills own analytical composition and copy.

This local documentation is a snapshot matched to the app's copied protected source. Ordinary installed-runtime `prepare` and `build` return `documentation.entryPoint` for the matching installed runtime's documentation. Follow that entry point when using the installed runtime; source mode uses this copied snapshot.

- Import shared runtime APIs only from `src/data-app-public.jsx`. The examples assume authored code in `src/content/dashboard/`; adjust relative imports for another content directory.
- Give each source-backed block a stable `id` and an existing reviewed `queryId`. Do not derive identity from titles, positions, or query indices. Displayed rows, source evidence, controls, and copied data must describe the same scope.
- Authored chart settings are defaults; saved edits win. Preserve shared source/actions menus, owner editing, and presentation state when composing custom content.
- Keep reviewed values, rows, controls, statuses, axes, and computed outputs read-only. Use `EditableText` or `data-editable-narrative` with stable `data-editable-id` values for authored captions; report prose uses `RichNarrative`. Mark custom source collections `data-reviewed-rows`. Tooltip/source metadata is not inline-editable.

```jsx
import { Chart, EvidenceChart, DataComponent, DataTable, Filters, MetricCard, Section,
  SectionHeader, SortableItem, SortableRegion, useDataApp } from "../../data-app-public.jsx";
```

`useDataApp()` exposes reviewed queries/rows, active filters, chart and presentation state, the stable app title, and surface capabilities from the protected shell.

| Task | Guide |
| --- | --- |
| Record table usage and inspect source metadata | [Sources](sources.md) |
| Bind a chart, preserve editing, map fields, format axes, or add mark actions/annotations | [Charts](charts.md) |
| Build bullet, progress, range, segmented, or ranked bar presentations | [Bar presentations](bar-presentations.md) |
| Show ordered conversion stages | [Funnels](funnels.md) |
| Choose dropdowns, switches, sliders, local tabs, or dialogs | [Controls](controls.md) |
| Configure reviewed tables, cell presentations, row actions, or pagination | [Tables](tables.md) |
| Scope page, tab, section, or chart filters and coordinate exploration | [Filtering and exploration](filtering.md) |
| Compose evidence wrappers, cards, section headings, custom frames, or section navigation | [Cards and layout](layout.md) |
| Add movable blocks, canvas resizing, freeform layouts, or report ordering | [Sortable layout](sortable-layout.md) |
| Format comparisons and choose favorable, unfavorable, or neutral tones | [Comparison formatting](comparison-formatting.md) |
| Bind report prose, multiple sources, previews, or follow-up links | [Reports](reports.md) |
| Handle asynchronous loading, empty results, errors, and retained geometry | [Async data](async-data.md) |
