# Sortable layout

## Canvas rows and resizing

Wrap intentionally movable authored content with the protected sortable primitives:

```jsx
<SortableRegion id="dashboard:overview:canvas" variant="canvas" spacing="standard" columns={12}
  rows={[{ id: "overview:metrics", kind: "metrics", items: ["active-users"] }]}
  label="Dashboard blocks">
  <SortableItem id="active-users" label="Weekly active users"
    kind="metric" span={3} minSpan={2}>
    <MetricCard id="active-users" queryId="usage_summary"
      title="Weekly active users" value={compact(reviewedRows("usage_summary").at(-1)?.activeUsers)} />
  </SortableItem>
</SortableRegion>
```

Choose a stable surface/page-scoped canvas when independent blocks benefit from row packing and shared-divider resizing; full-width and asymmetric rows are supported. Choose freeform when authored geometry such as sidebars, vertical spans, or small multiples matters more than canvas resizing. Neither mechanism prescribes a KPI-first order or a particular analytical structure.  
Prefer direct `SortableItem` children. If an authored wrapper stands in for one, forward all remaining props to `SortableItem`; otherwise canvas-injected resize and placement props are lost even though the cards render and can appear movable.  
Reuse the existing authored component ID for every movable block. The region omits hidden items from layout while retaining their saved position for restore; a separate `visible(id)` guard is optional when the item and evidence component share an ID. A custom composite with different child IDs still owns whether to hide its entire container. Its `rows` describe the initial semantic composition. Use `spacing="standard"` to inherit shared section spacing for every row;
row metadata can declare `kind="metrics"` and override `spacing` explicitly. Explicit spacing wins, including after metrics. Legacy/custom canvases default to `spacing="authored"` and retain authored gaps; a row with explicit `kind` or `spacing`
opts just that row into shared presentation. A row may provide a `header` React node for an authored section heading;
it spans the row, stays outside block dragging/resizing, and hides when the row is empty.
Drop beside a block to join its row, or briefly pause in the visible,
sticky insertion zone above, between, or below rows to create a row. Existing rows remain the preferred destination, including at block edges; sibling movement and the opened row provide placement feedback without a blue insertion rule. The protected runtime rebalances unequal widths when row membership changes within a 12-column desktop / 6-column tablet /
single-column mobile layout without shrinking blocks below their semantic `minSpan` or measured readable width, moving locked blocks, or accepting overcrowded rows. Wide,
dense tables remain alone when their reviewed columns require the full row.
Canvas minimums default to **3 for charts/tables and 2 for metrics**. Omit `minSpan`
to inherit them; raise it only for a demonstrated content requirement, not by copying an example's preferred width. These constraints do not apply to custom/freeform layouts.  
Authored `span` and explicit owner-selected widths remain separate preferred sizes; temporary row rebalancing must not overwrite them. Reordering blocks within the same row preserves every existing width. Authorized owners can drag a compact grip centered in the measured gutter between neighboring dashboard blocks or adjust it with the arrow keys. The grip borrows width from the nearest block with available space when adjacent blocks are already at their minimum; component action menus do not expose redundant width presets.  
Do not add separate row drag affordances: rows are derived from block placement. Start pointer drags from existing component headers or metric surfaces; their grab cursor is the only pointer-drag cue, and editable titles retain the shared inline-text hover and focus treatment. Blocks displace neighbors when their moving edge crosses the neighbor's midpoint, independent of where the pointer grabbed the block. Keep component titles and menus aligned, and do not add movement icons or header-wide hover panels. Menus, source links, editable titles, chart gestures, and scenario controls remain interactive. A visually hidden Move control appears above the header only for keyboard focus and preserves full keyboard access without permanent handles.

## Freeform composition

For creative editable layouts, use `variant="freeform"` and ordinary authored CSS:

```jsx
<SortableRegion id="dashboard:custom:visuals" variant="freeform"
  authoredRevision={2} className="custom-bento">
  <SortableItem id="hero-chart" label="Regional performance"
    kind="chart" style={{ gridRow: "span 2" }}>
    <DataComponent id="hero-chart" queryId="usage_summary"
      title="Regional performance" kind="chart">
      <CustomRegionalVisual />
    </DataComponent>
  </SortableItem>
  <SortableItem id="compact-trend" label="Growth trend" kind="chart">
    <DataComponent id="compact-trend" queryId="usage_summary"
      title="Growth trend" kind="chart"><CompactTrend /></DataComponent>
  </SortableItem>
</SortableRegion>
```

```css
.custom-bento {
  display: grid;
  grid-template-columns: 2fr repeat(5, minmax(0, 1fr));
  grid-auto-rows: minmax(120px, auto);
  gap: 18px;
}
```

Omit the `columns` prop in freeform mode and declare any desired track count and placement in authored CSS. Freeform regions retain protected dragging, keyboard access, source inspection,
owner-only editing, hidden-item reconciliation, and saved order without imposing a 12-column grid, canvas rows, minimum spans, automatic resizing, or divider handles.  
The agent may use CSS Grid areas, equal fifths, any track count, flexbox, vertical spans, dense small multiples, custom visuals, and arbitrary internal React markup.  
Keep a tightly coupled visualization together as one draggable composite, or author an ordinary fixed `DataComponent` section outside the sortable region when preserving a user-requested layout is more important than independently moving every piece.

Separate freeform regions may opt in to exchanging compatible blocks by sharing a safe `transferGroup`, for example `transferGroup="dashboard:related-charts"`.  
Only blocks of the same kind and comparable dimensions transfer; their stable component identities, reviewed sources, protected actions, and region layouts persist.  
Leave unrelated freeform, canvas, report, and fixed bespoke sections ungrouped.

## Existing layouts and authored revisions

For an existing custom dashboard, reuse its `SortableDashboardLayout` adapter or wrap the composed content with it. From `src/content/dashboard/`, import `{ SortableDashboardLayout }` from `../shared/SortableDashboardLayout.jsx` and use `<SortableDashboardLayout scope="overview">…</SortableDashboardLayout>`. Give each page/tab a stable `scope` and preserve it during revisions; it forms part of persisted region identities. Compatible ordinary authored grids are measured and promoted into full protected canvas rows, preserving their original relative widths while restoring smooth sibling motion, adjacent-card resize dividers,
and persisted ordering and widths. Explicit grid areas, vertical row spans, and other incompatible creative layouts retain freeform movement. In owner Edit mode, verify a real pointer drag and adjacent-card resize; both changes must survive reload.

Increase `authoredRevision` only when the user explicitly requests replacing an existing layout. The new authored order/placement then overrides that region's stale saved layout without resetting other regions, filters, titles, reviewed values,
permissions, or source metadata. Routine edits must leave the revision unchanged.

## Report stacks and fixed groups

`variant="stack"` preserves report editorial flow; keep each report section's narrative and supporting evidence together instead of converting the document to a dashboard grid; row dividers and dashboard row insertion do not apply to reports. Pass its complete stable `authoredOrder` when sections can be hidden so restoring a section preserves its original slot even before the first saved reorder.  
`variant="grid"` remains available for an intentionally isolated fixed-column group;  
prefer `variant="freeform"` when the model should own its complete spatial layout.  
Choose semantic row membership, block kinds, spans, and readable minimums from actual reviewed content rather than forcing a universal component count or composition. Keep shared page controls pinned; report summaries and introductions may be ordered when useful. The protected runtime owns pointer/keyboard interaction, permissions, motion, hide/restore,
constrained width changes, and presentation-only persistence.

For controls that follow moved blocks, see [filtering](filtering.md#filters-on-movable-groups). Component-specific guidance belongs in [tables](tables.md), [charts](charts.md), and [cards and layout](layout.md).
