# Tables

Use `DataTable` (also exported as `Table`) for reviewed tabular data, with a `DataComponent` evidence wrapper where source/actions menus are needed. Keep scoped original evidence in `sourceRows`; `displayRows` may contain the derived values shown in the table. Multiple-source bindings are described in [layout](layout.md#evidence-wrappers).

## Columns and formatting

Column definitions support shared `identity` (with `secondaryField`), `sparkline`, `bar`, `status`, and `percent` cell presentations, including theme-aware visuals and accessible tooltips. They require no example-specific CSS. Keep unusual row density and chosen columns in authored content.

For specialized evidence cells, a column may supply `renderCell(value, row)`. It changes presentation only: search, sorting, source/export values, and first-column row actions still use the underlying evidence. Keep callbacks in authored code, not persisted specs.

Per-column `deltaTone` accepts `positive`, `negative`, `neutral`, or a function. Tone is an interpretation separate from numeric sign; omitting it preserves existing signed-delta behavior. See [comparison formatting](comparison-formatting.md) for a signed percentage-point formatter and objective-based tones. Whole-percent presentation may round away small rates; use enough displayed precision while retaining raw numeric source rows.

## Search, local controls, and pagination

Use `toolbarControls` for controls affecting only table rows. Search and local filters share one toolbar; counts accompany pagination below. See [filtering](filtering.md) when a selection affects other blocks too.

Use `searchable={false}` for short fixed summaries, such as a two-period comparison, and keep search for record exploration. Pagination uses the shared eight-row page size; there is no `pageSize` prop.

## Accessible row actions

Supply an accessible `caption` or `label`. `DataTable` also accepts `rowKey`, `selectedRowKey`, `onRowSelect(row)`, and `rowActionLabel(row)`. Action rows accept pointer clicks and expose a first-cell keyboard action; embedded controls and text selection do not navigate.
