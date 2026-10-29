# Filtering and exploration

## Choose the scope

Put `Filters` beside the page title only when the relevant page-wide KPIs and charts respond. Render section-exclusive definitions beside their first affected heading with `SectionHeader` and `useSectionFilters`. For one consumer of a shared query, place `InlineFilters` beside its component and keep its selection in the shell's `chartStates[id].inlineFilters` through `updateChartState` when it should travel with links. Arbitrary authored React state is not automatically shareable. View controls belong with the same-scope data controls and do not implicitly reset them; see [controls](controls.md).

Pass scoped reviewed evidence as `sourceRows`; `displayRows` may contain derived plotted aggregates. Never concatenate headline summaries and daily/category aggregates into one source array. Comparisons retain raw evidence for both periods, with the actual derivation in the source definitions. Copying and source inspection must preserve the same scope.

## Page filters

Page-wide filters are controlled by `useDataApp`. `Filters children` places custom controls before generated filters; `trailingControls` places them afterward. Each slot renders once, including when there are no generated filters.

Categorical definitions may set `multiple: true`: selected values are string arrays and `[]` clears the restriction. Selections intersect across page and section scopes. New complete-view links (`view=1`) carry all declared filter selections, including definitions formerly marked `shareInUrl: false`. That flag is honored only while reading legacy unversioned links. Values are visible in copied URLs. Only reviewed choices are accepted; missing choices in a complete view reset to authored defaults rather than the recipient's remembered selections.

Page-wide `<Filters sticky ... />` stays below the protected top bar while scrolling. Place it directly in full-height page content, not a short filter-only wrapper: CSS sticky positioning ends at its containing block. The bar stays transparent before scrolling while chips retain backgrounds; sticky mode compacts its padding without shifting content. Do not implement another scroll-direction handler. Omit `sticky` for section-local controls in `SectionHeader`, and keep page controls outside sortable content. Temporal filters use the shared [date range picker](controls.md#date-and-numeric-inputs), with presets bounded by loaded coverage.

## Tab scope and exploration

`useDashboardTabs([{ id, label, filterIds, defaultFilters, focusFields, aliases, previousLabels }])` opts tabs into independent viewer-local filters. IDs reference snapshot definitions; absent `filterIds` preserves legacy shared filters. Defaults apply per tab. Aliases and previous labels support authored migrations without replacing custom labels. Bindings and viewer focus are not shared presentation.

`useDataApp()` exposes `exploreDashboard(tabId, { filters, focus })`, `viewFocus`, `setDashboardFocus(focus)`, `canReturnFromExploration`, and `returnFromExploration()`. Only destination-declared fields transfer. Explicit exploration offers Back; normal tab navigation restores browsing state. Declared focus travels in complete-view links alongside filters; use it only for information intended to be included when sharing the view. Reviewed-row functions use the active tab's definitions.

## Section filters

`useSectionFilters(definitions, initialValues?, sectionScope?)` keeps section selections independent of page filters and other sections, even when filter IDs match. Give the section a stable `sectionScope.id` (or its existing `rowId`) to include its selections in current-view links. Definitions use the same `id`, `label`, `field`, `defaultValue`, `mode`, and optional `queryIds` contract as page filters. It intersects page and section scope against the original reviewed rows before aggregate-row selection. An incompatible page/local selection returns no rows; local All never broadens page scope. Controls do not rerun source queries.

```jsx
function RegionalSection() {
  const { chartProps, chartOverrides } = useDataApp();
  const scope = useSectionFilters([
    { id: "region", label: "Region", field: "region", defaultValue: "all",
      queryIds: ["usage_summary"] },
  ], {}, { id: "regional-adoption" });
  const chart = chartOverrides["regional-adoption"] ?? { type: "line", x: "week", y: "activeUsers" };
  const scoped = scope.componentProps("usage_summary", [chart.x, chart.series].filter(Boolean));
  return (
    <Section id="regional-section-title" title="Regional adoption"
      filters={<Filters {...scope.filterProps} />}>
      <DataComponent id="regional-adoption" queryId="usage_summary"
        title="Active users over time" kind="chart" chart={chart}
        variant="card" {...scoped}>
        <Chart spec={chart} rows={scoped.displayRows}
          {...chartProps("regional-adoption")} />
      </DataComponent>
    </Section>
  );
}
```

`componentProps(queryId, breakdown?)` supplies `displayRows`, `sourceRows`, and `scopeFilters`, plus `sectionFilters` placement metadata for movable groups. Forward the complete result to **every affected source-backed block** so charts, copied data, source inspection, and the chart editor agree. With `EvidenceChart`, pass `{...scoped}` and `rows={scoped.displayRows}`. Derive captions, totals, and local comparisons from those same rows; do not use unscoped page rows or global prior-period helpers for a locally scoped comparison.

Include temporal/dimension fields in `breakdown` when retaining their full history/categories. Ranged dates otherwise select the latest available scoped endpoint. Section **All dates** selects all dates within page scope. Reset a section selection through its dropdown's **All** / **All dates** option; section filters omit a redundant reset button.

Section selections remain personal view state, not shared owner presentation. Current-view links marked `view=1` include selections from named sections, including explicit All, empty multi-selections, and defaults when a selection is changed. The runtime namespaces the stable section ID by the active dashboard tab so sections on different tabs stay independent. A received link restores only declared valid values against that section's reviewed queries; unknown or stale selections use the section's initial/default values. Clearing the link's section state resets to those initial/default values.

Use a stable `sectionScope.id` for fixed sections; movable groups can use their stable `rowId`. Do not reuse the same section ID for independent scopes within one tab. Sections without either ID keep their existing component-local state and reset when unmounted or reloaded; they are not included in current-view links. Arbitrary custom controls or independent React state are not automatically captured. Print retains visible section filter values. Legacy links without `view=1` retain their existing URL behavior.

## Filters on movable groups

For movable canvas consumers, provide placement metadata as the hook's third argument:

```jsx
const scope = useSectionFilters(definitions, {}, {
  rowId: "dashboard:engagement",
  componentIds: ["engagement-heatmap", "engagement-scatter"],
  label: "Engagement filters",
});
```

Use `scope.filterProps` in that row's header and `scope.componentProps` on every listed consumer. If a block moves out, its filters appear locally on the card. If an unrelated block joins the filtered row, controls move onto the affected cards instead of implying the newcomer is filtered. Returning to the original group restores the header controls without duplicates. The selection remains shared by that semantic group; dragging never silently changes its data scope. Fixed sections do not need this placement metadata. See [sortable layout](sortable-layout.md) for the placement primitives.

For a new report without visible page-wide controls, author `snapshot.filters: []`; do not copy hidden dashboard filter definitions that silently constrain report data. Report-specific visible-filter bindings are in [reports](reports.md#narrative-and-evidence).

## Sharing the current view

The address bar, dashboard/component Copy link and action source links use the same complete-view contract. Selected tabs, page cuts, numeric scenario assumptions, section scopes with stable IDs, chart series/zoom/inline selections, and declared tab focus travel with the link. A reset view is still explicit. Saved chart types, layout, titles and hidden blocks continue loading from the shared presentation; links do not freeze historical data or unsaved owner edits. No new capture database is involved. Access is unchanged.

Only view parameters are copied; authentication, unrelated host parameters and routing fragments are removed from shared links. Custom controls must use shell filters, assumptions, chart state or identified section scopes to participate. Large selections increase URL length; if the runtime's bounded encoding cannot represent a view, copying/preparing an action fails rather than silently sharing a partial view. Browser and platform URL limits still apply.
