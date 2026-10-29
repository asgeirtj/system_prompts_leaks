# Comparison formatting

## Signed values and semantic tones

Choose a tone from the raw change and the metric's objective, then format it. A signed formatter alone does not color a value. For an adoption objective:

```jsx
const adoptionTone = value => !Number.isFinite(value) || value === 0
  ? "neutral" : value > 0 ? "positive" : "negative";
const signedPoints = value => Number.isFinite(value)
  ? `${value > 0 ? "+" : ""}${value.toFixed(1)} pp` : "—";
// changePp is already expressed in percentage points, not a 0–1 ratio.
<MetricCard id="adoption" queryId="usage" title="Adoption" value={formattedAdoption}
  comparison={signedPoints(changePp)} deltaTone={adoptionTone(changePp)} trendValues={history} />
const columns = [{field: "changePp", label: "Change", renderCell: signedPoints, deltaTone: adoptionTone}];
```

`MetricCard deltaTone` controls both the comparison text and its sparkline. Use `MetricCardTabs` item `tone` and standalone `MetricSparkline tone` for the same three values. Explicit tones override the legacy `negative` flag; existing consumers keep their behavior. [Table columns](tables.md#columns-and-formatting) also support `deltaTone`.

Reverse positive/negative for costs, errors, or other lower-is-better objectives. Zero, missing, and directionally ambiguous measures stay neutral. Descriptive adoption/retention changes do not require neutral styling merely because they are not causal findings.

`Chart` signed bar comparisons support `colorBySign: true` for favorable increases/unfavorable decreases, including an all-negative series. For reversed or ambiguous meaning, set `colorBySign: false` and supply explicit category `colors` instead. Absolute-value trends retain metric/series colors; a falling line is not automatically an unfavorable delta. Preserve signs and units in labels/tooltips regardless of color.

## Comparison context and history

`MetricCard comparison` normally shows just the signed delta, such as `+5%`. Identify the comparison basis once in the scoped comparison control or info description; grain alone does not distinguish previous-period from year-over-year comparisons. Do not repeat that basis on every card or use `comparison` for population notes or sample-size prose.

`periodComparison(current, previous, { includePeriod: false })` formats the delta when its context is already provided; the default retains period text for standalone consumers. Supply `trendLabel` for history whose metric or period is otherwise unclear; standalone `MetricSparkline` uses `label`. Sparklines preserve the entire supplied history and gaps for missing observations. Omit trends for snapshots or incomparable history; do not add a KPI strip simply to fill the top row.
