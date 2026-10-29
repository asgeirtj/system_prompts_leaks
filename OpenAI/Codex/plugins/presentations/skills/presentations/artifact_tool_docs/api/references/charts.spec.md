# Charts

`slide.charts` creates chart elements with slide placement and chart configuration.

## Resolved From Inspect

```ts
const chart = presentation.resolve("ch/b2c3d4e5");
chart.title = "Updated chart title";
chart.yAxis = { numberFormatCode: "$#,##0M" };
chart.series.getItemAt(0).values = [3.1, 3.7, 4.2, 4.8];
```

Use `presentation.inspect({ kind: "chart", search })` to find the `ch/...`
anchor id. If an imported chart resolves as an image, preserve it as an image or
rebuild it as a native chart intentionally.

## Add Chart

```ts
const chart = slide.charts.add(chartType, {
  position,
  title,
  titleTextStyle,
  categories,
  series,
  hasLegend,
  legend,
  barOptions,
  lineOptions,
  areaOptions,
  pieOptions,
  doughnutOptions,
  treemapOptions,
  mapOptions,
  funnelOptions,
  boxWhiskerOptions,
  histogramOptions,
  view3d,
  scatterOptions,
  radarOptions,
  bubbleOptions,
  xAxis,
  yAxis,
  dataLabels,
  dataTable,
  chartFill,
  chartLine,
  plotAreaFill,
  plotAreaLine,
});
```

Small chart option enums are listed below.

## Chart Inline Types

```ts
type ChartTypeName =
  | "line" | "pie" | "bar" | "doughnut" | "scatter" | "bubble" | "radar"
  | "treemap" | "sunburst" | "map" | "waterfall" | "line3D" | "pie3D"
  | "area3D" | "bar3D" | "funnel" | "histogram" | "boxWhisker" | "stock"
  | "surface3D" | "ofPie" | "surface" | "pareto" | "combo" | "area";

type ChartConfig = {
  position?: { left?: number; top?: number; width?: number; height?: number };
  title?: string;
  roundedCorners?: boolean | null;
  titlePlacement?: "none" | "aboveChart" | "centeredOverlay";
  titleTextStyle?: ChartTextStyleConfig;
  categories?: string[];
  series?: ChartSeriesConfig[];
  hasLegend?: boolean;
  legend?: ChartLegendConfig;
  barOptions?: { direction?: "bar" | "column"; grouping?: "clustered" | "stacked" | "percentStacked"; varyColors?: boolean; gapWidth?: number; gapDepth?: number; overlap?: number; bar3dShape?: number };
  lineOptions?: { grouping?: "standard" | "stacked" | "percentStacked"; smooth?: boolean; varyColors?: boolean };
  areaOptions?: { grouping?: "standard" | "stacked" | "percentStacked"; varyColors?: boolean };
  pieOptions?: { firstSliceAngle?: number };
  doughnutOptions?: { holeSize?: number; firstSliceAngle?: number };
  treemapOptions?: { parentLabelLayout?: "none" | "overlapping" | "banner" };
  mapOptions?: { mapArea?: "world" | "auto" | "dataOnly" | "region"; projection?: "mercator" | "auto" | "miller" | "albers"; labelLayout?: "none" | "bestFit" | "showAll"; dataLevel?: "auto" | "county" | "postalCode" | "countryOrRegion" | "stateOrProvince" | "stateCode" | "countyCode" | "countryOrRegionCode"; showUnknown?: boolean; onlyRegionsWithData?: boolean };
  funnelOptions?: { gapWidth?: number };
  boxWhiskerOptions?: { showMeanLine?: boolean; showMeanMarker?: boolean; showNonOutliers?: boolean; showOutliers?: boolean; quartileMethod?: "inclusive" | "exclusive" };
  histogramOptions?: { binWidth?: number | null; binCount?: number | null; underflow?: number | null; overflow?: number | null; intervalClosed?: number; aggregated?: boolean };
  view3d?: { rotX?: number; rotY?: number; perspective?: number; rightAngleAxes?: boolean };
  scatterOptions?: { style?: "line" | "lineWithMarkers" | "marker" | "smooth" | "smoothWithMarkers"; varyColors?: boolean };
  radarOptions?: { style?: "standard" | "marker" | "filled"; varyColors?: boolean };
  bubbleOptions?: { scale?: number | null; sizeRepresents?: "area" | "width" | null; showNegative?: boolean | null };
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  dataLabels?: ChartDataLabelsConfig;
  dataTable?: ChartDataTableConfig;
  chartFill?: FillConfig;
  chartLine?: LineConfig;
  plotAreaFill?: FillConfig;
  plotAreaLine?: LineConfig;
  displayBlanksAs?: "zero" | "gap" | "span" | null;
  styleIndex?: number;
};
```

## Chart Family Options

```ts
histogram.histogramOptions = { binWidth: 5 };
histogram.histogramOptions = { binCount: 8, underflow: 0, overflow: 30 };
histogram.histogramOptions = { binWidth: null, binCount: null };
histogram.histogramOptions = { underflow: null, overflow: null };
bubble.bubbleOptions = { scale: 150, sizeRepresents: "area" };
bubble.bubbleOptions = { scale: null, sizeRepresents: null };
bubble.bubbleOptions = { showNegative: true };
```

## Grouped Edits

```ts
chart.xAxis = axisConfig;
chart.yAxis = axisConfig;
chart.legend = legendConfig;
chart.dataLabels = dataLabelsConfig;
chart.dataTable = dataTableConfig;
```

### Data Labels

```ts
chart.dataLabels = { showValue: true, position: "outEnd" };
chart.dataLabels = { textStyle: { fontSize: 14 } };
chart.dataLabels.showCategoryName = true;

const series = chart.series.getItemAt(seriesIndex);
series.dataLabels = { showValue: false, showSeriesName: true };
series.dataLabels.showSeriesName = false;
```

Config assignments update supplied fields and preserve omitted values. New label
collections initialize all seven `show*` flags to `false`. A series without its
own label collection inherits chart labels; omitted point flags inherit series
or chart labels.

### Axis Placement

```ts
chart.xAxis = { crossesAt: 2 }; // The value axis crosses at category 2.
chart.yAxis = { crossesAt: 25 }; // The category axis crosses at value 25.
chart.yAxis = { tickLabelPosition: "high" };
```

## Series

```ts
const chart = slide.charts.add(chartType, {
  categories,
  series: [
    {
      name: seriesName,
      categories,
      values,
      xValues,
      categoryPaths,
      fill: fillConfig,
      line: lineConfig,
      marker: markerConfig,
      points,
      dataLabels: dataLabelsConfig,
      dataLabelOverrides,
      trendlines,
      errorBars,
    },
  ],
});
```

## Series Inline Type

```ts
type ChartSeriesConfig = {
  name: string;
  categories?: string[];
  values?: Array<number | null>;
  xValues?: Array<number | null>;
  categoryPaths?: string[][];
  bubbleSizes?: Array<number | null>;
  bubbleSizeFormula?: string;
  bubbleSizesFormatCode?: string;
  explosion?: number;
  smooth?: boolean;
  fill?: FillConfig;
  line?: LineConfig;
  stroke?: LineConfig;
  // Scatter outline color defaults to the marker's solid fill; explicit stroke fills take precedence.
  marker?: { symbol?: "circle" | "diamond" | "dot" | "none" | "plus" | "square" | "star" | "triangle" | "x"; size?: number; fill?: FillConfig };
  points?: Array<{ idx: number; fill?: FillConfig; line?: LineConfig; stroke?: LineConfig }>;
  dataLabels?: ChartDataLabelsConfig;
  dataLabelOverrides?: Array<{ idx: number; text?: string; separator?: string; position?: string; fill?: FillConfig; line?: LineConfig; stroke?: LineConfig; showValue?: boolean; showSeriesName?: boolean; showCategoryName?: boolean; showPercent?: boolean; textStyle?: ChartTextStyleConfig }>;
  trendlines?: Array<{
    type?: "linear" | "exponential" | "logarithmic" | "polynomial" | "power" | "movingAverage";
    name?: string;
    polynomialOrder?: number;
    movingAveragePeriod?: number;
    forecastForward?: number;
    forecastBackward?: number;
    intercept?: number;
    displayEquation?: boolean;
    displayRSquared?: boolean;
    line?: LineConfig;
    label?: { text?: string; textStyle?: ChartTextStyleConfig; fill?: FillConfig; line?: LineConfig };
  }>;
  errorBars?: { type?: "standardError" | "percentage" | "standardDeviation" | "none"; value?: number; endStyle?: "cap" | "noCap"; line?: LineConfig };
  valuesFormatCode?: string;
  xValuesFormatCode?: string;
};
```

## Data Label Overrides

```ts
const override = chart.series
  .getItemAt(seriesIndex)
  .dataLabelOverrides.add(dataPointIdx);
override.text = labelText;
override.position = labelPosition;
override.textStyle.fontSize = fontSizePx;
override.textStyle.fill = textFill;
override.fill = fillConfig;
override.stroke = lineConfig;
```

## Chart Areas

```ts
const chart = slide.charts.add(chartType, {
  chartFill,
  plotAreaFill,
});
```

## Axis, Legend, Label Inline Types

```ts
type ChartTextStyleConfig = {
  fontSize?: number;
  fill?: FillConfig;
  bold?: boolean;
  italic?: boolean;
  underline?: string;
  alignment?: "left" | "center" | "right" | "justify";
};

type ChartLegendConfig = {
  position?: "left" | "top" | "topRight" | "right" | "bottom";
  overlay?: boolean;
  fill?: FillConfig;
  line?: LineConfig;
  textStyle?: ChartTextStyleConfig;
};

type ChartDataLabelsConfig = {
  visible?: boolean;
  deleted?: boolean;
  position?: "center" | "inEnd" | "outEnd" | "left" | "right" | "top" | "bottom" | "insideBase" | "bestFit" | "dataCallout";
  showValue?: boolean;
  showSeriesName?: boolean;
  showCategoryName?: boolean;
  showLegendKey?: boolean;
  showPercent?: boolean;
  showBubbleSize?: boolean;
  showLeaderLines?: boolean;
  numberFormatCode?: string;
  numberFormatSourceLinked?: boolean;
  separator?: string;
  textStyle?: ChartTextStyleConfig;
  fill?: FillConfig;
  line?: LineConfig;
};

type ChartAxisConfig = {
  visible?: boolean;
  title?: string | { text?: string; textStyle?: ChartTextStyleConfig };
  numberFormatCode?: string;
  min?: number;
  max?: number;
  majorUnit?: number;
  minorUnit?: number;
  position?: "bottom" | "left" | "right" | "top";
  tickLabelPosition?: "nextTo" | "high" | "low" | "none" | string;
  labelOffsetPercent?: number; // Category-axis font-size percentage; 0–1000, default 100.
  textStyle?: ChartTextStyleConfig;
  line?: LineConfig;
  majorGridlines?: LineConfig | null;
  minorGridlines?: LineConfig | null;
};
```

## Cookbook

```ts
// Executive horizontal bar chart.
slide.charts.add("bar", {
  position: { left: 96, top: 160, width: 720, height: 360 },
  categories: ["Enterprise", "Mid-market", "SMB"],
  series: [{ name: "ARR", values: [42, 28, 17], fill: "#2563eb" }],
  barOptions: { direction: "bar", grouping: "clustered", gapWidth: 44 },
  hasLegend: false,
  xAxis: { visible: false, majorGridlines: null },
  yAxis: { textStyle: { fill: "#475569", fontSize: 13 }, line: { style: "solid", fill: "#e2e8f0", width: 1 } },
  dataLabels: { showValue: true, position: "outEnd", textStyle: { fill: "#0f172a", fontSize: 13, bold: true } },
});
```

```ts
// Compact trend line with muted grid.
slide.charts.add("line", {
  position: { left: 96, top: 150, width: 880, height: 280 },
  categories: ["Jan", "Feb", "Mar", "Apr"],
  series: [{ name: "Conversion", values: [31, 34, 37, 43], line: { style: "solid", fill: "#0f766e", width: 3 } }],
  legend: { position: "bottom", overlay: false },
  yAxis: { numberFormatCode: "0%", majorGridlines: { style: "solid", fill: "#e2e8f0", width: 1 } },
});
```

```ts
// Doughnut chart with labels outside.
slide.charts.add("doughnut", {
  categories: ["Product", "Sales", "Support"],
  series: [{ name: "Share", values: [52, 31, 17] }],
  dataLabels: { showPercent: true, showCategoryName: true, position: "outEnd" },
  legend: { position: "right" },
});
```
