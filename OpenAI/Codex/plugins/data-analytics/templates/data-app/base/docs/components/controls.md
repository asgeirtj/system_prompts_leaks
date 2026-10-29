# Controls

## Place controls at their scope

Place controls in tab `Filters`, section `SectionHeader`, chart `DataComponent headerControls`, or table `DataTable toolbarControls`. Supply all controls for one scope together; the shared header wraps them and reserves the overflow-menu corner. A chart's measure selector belongs with its population selector, not below its values. View controls do not implicitly reset data filters. See [filtering](filtering.md) for data scope, sticky bars, and `Filters` slots.

`Dropdown` uses scalar `choices`, with optional `choiceLabels` or `formatChoice`. `SegmentedControl` uses `options` (`{value, label}` objects); do not interchange these APIs. This chart-header fragment assumes controlled `plan`/`measure` state and rows already scoped to that plan:

```jsx
<DataComponent id="plan-history" queryId="usage" title="Plan history"
  kind="chart" chart={chart} sourceRows={sourceRows} displayRows={rows}
  description="Adoption is the share of active users in the selected plan."
  headerControls={<>
    <Dropdown label="Plan" showLabel value={plan} choices={plans} onChange={setPlan} />
    <Dropdown label="Measure" showLabel value={measure}
      choices={["users", "adoption"]} choiceLabels={{users: "Active users", adoption: "Adoption"}}
      onChange={setMeasure} />
  </>}>
  <Chart spec={chart} rows={rows} {...chartProps("plan-history")} />
</DataComponent>
```

Pass the same selected spec and rows to wrapper and chart. Use `SectionHeader filters` instead when both controls affect several blocks, and `DataTable toolbarControls` when they affect only table rows. Neither case needs a second toolbar. `description` is available from the shared info control; do not duplicate it in a paragraph inside the card. Keep raw definitions and evidence in the reviewed source.

## Choice controls

- `Switch({ label, checked, onChange, disabled, fullWidth, size })` is the boolean control. `size="compact"` preserves the smaller comparison-control track.
- `SegmentedControl` supports controlled single or multiple choice, option labels/tooltips, disabled options, and compact/default sizes. Use it for a small local choice set, not a duplicate global filter. Its default size follows dropdown height in the active theme; compact remains 32px.
- `MetricCardTabs` groups related selectable metrics with one associated chart/detail panel. Keep its selected ID controlled and use stable item IDs; retain separate charts when simultaneous comparison matters. See [comparison formatting](comparison-formatting.md) for item tones.

## Date and numeric inputs

`DateRangePicker({ label, value, choices, onChange, disabled })` is the same control used by temporal `Filters`. Supply available ISO days. It normalizes ordering and offers only covered presets plus a custom range; presets are anchored to the latest reviewed date and use explicit historical labels. Values use `start..end`; callers own filtering. Empty choices disable the control. Do not implement a second calendar.

`Slider` and `RangeSlider` accept `label`, `min`, `max`, `step`, `value`, `onChange`, `disabled`, `showBounds`, and `formatValue`. Range values are `[lower, upper]`, with `minDistance` when required. Choose `labelPlacement="outside"`, `"inline"`, or `"hidden"`; hidden visual labels retain accessible names. Formatters affect presentation, not reviewed values.

Values and optional bounds stay inside the track. With bounds, the single current value follows the handle and conflicting endpoint labels are suppressed; without bounds it stays pinned to the right.

## Local panels, dialogs, and shared primitives

`Tabs`/`TabPanel` switch local content inside a section or inspector. The default is the shared underline treatment; `variant="pills"` retains the older treatment. Use the shell's [dashboard tabs](filtering.md#tab-scope-and-exploration) for top-level views and tab-scoped filters.

`ExecutiveSummary` provides an optional controlled/uncontrolled disclosure. Use it for requested commentary, not as a mandatory dashboard introduction.

`Button`, `Dialog`, `InfoTooltip`, `MenuItem`, `MenuSub`, `MenuGroup`, and `MenuSeparator` expose the existing shared primitives. `TruncatedText` reveals clipped labels after a short hover delay; component titles and dropdown/segment labels use it automatically. It preserves the full accessible text and suppresses reveal while editing.

`Dialog` defaults to a compact 480px width and shared typography; `expanded` remains available for larger workspaces. Keep it mounted with controlled `open` and `onClose` for entry/exit transitions and focus restoration. Reduced motion is respected; modal scroll/focus containment remains enabled.
