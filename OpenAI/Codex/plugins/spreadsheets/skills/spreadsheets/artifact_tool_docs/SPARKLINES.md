# Sparklines

```js
const group = sheet.sparklineGroups.add({
  type: "line",
  targetRange: "E2:E4",
  sourceData: "A2:C4",
  seriesColor: "#2563EB",
  markers: { high: true, low: true },
});
```
- Sparkline type is a string. Use the public options documented below. Do not set internal/proto enum values for empty-cell display or axis modes; if a required option is not documented for the selected runtime, follow the bounded discovery policy.
- Avoid `dateAxisRange` for XLSX output; it is not serialized. Keep automatic axis limits: `manualMin` / `manualMax` alone do not select custom limits in Excel.
- Sparkline Inline Type:
```
type SparklineConfig = {
  type: "line" | "column" | "stacked";
  targetRange: Range | string;
  sourceData: Range | string;
  lineWeight?: number;
  displayHidden?: boolean;
  seriesColor?: ColorConfig;
  negativeColor?: ColorConfig;
  axisColor?: ColorConfig;
  markersColor?: ColorConfig;
  firstMarkerColor?: ColorConfig;
  lastMarkerColor?: ColorConfig;
  highMarkerColor?: ColorConfig;
  lowMarkerColor?: ColorConfig;
  markers?: SparklineMarkersOptions;
  axis?: SparklineAxisOptions;
};

type SparklineMarkersOptions = {
  show?: boolean;
  high?: boolean;
  low?: boolean;
  first?: boolean;
  last?: boolean;
  negative?: boolean;
};

type SparklineAxisOptions = {
  showAxis?: boolean;
  rightToLeft?: boolean;
};
```
- Range Alias: `const group = targetRange.sparklines.add(type, sourceRange, sparklineConfig);`
- Edit And Delete
```js
group.seriesColor = "#2563EB";
group.markers.high = true;
group.axis.showAxis = true;
sheet.sparklineGroups.delete(group);
sheet.sparklineGroups.deleteAll();
```
