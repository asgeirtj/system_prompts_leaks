# Slide Facade

## Slide Show Visibility

```ts
slide.hidden = isHidden;
```

Hidden slides stay in the deck but are skipped during a slide show.

## Content Collections

```ts
const shape = slide.shapes.add(shapeConfig);
const image = slide.images.add(imageConfig);
const table = slide.tables.add(tableConfig);
const chart = slide.charts.add(chartType, chartConfig);
```

## Content Config Pointers

```ts
type ShapeConfig = PresetShapeConfig | CustomShapeConfig | ConnectorConfig; // see shapes.spec.md
type ImageConfig = ImageAddOptions; // see images.spec.md
type TableConfig = TableAddOptions | TableCellValue[][]; // see tables.spec.md
type ChartConfig = {
  position?: { left?: number; top?: number; width?: number; height?: number };
  title?: string;
  categories?: string[];
  series?: Array<{ name: string; values?: number[] }>;
}; // see charts.spec.md for axes, legend, labels, and series styling
```

## Background

```ts
const slide = presentation.slides.add({ background: { fill: fillConfig } });
slide.background.fill = fillConfig;
```

`fillConfig` accepts theme color strings, hex strings, solid configs, gradient configs, pattern configs, and image-fill configs.

## Layouts And Placeholders

```ts
slide.setLayout(layout);

const placeholder = slide.placeholders.getItem(placeholderName);
placeholder.text = placeholderText;
placeholder.text.style = placeholderStyleName;
```

```ts
const actualPlaceholders = slide.placeholders.items;
const emptyContentPlaceholders = slide.placeholders.editable;
const allVisibleEmptyPlaceholders = slide.placeholders.unfilled;
const missingLayoutSlots = slide.placeholders.availableFromLayout;
const createdPlaceholders = slide.placeholders.addFromLayout();
```

## Frame And Export

```ts
const frame = slide.frame;
const preview = await slide.export({ format, scale });
const pdf = await slide.export({ format: "pdf" });
```

## Compose Layout

```tsx
/** @jsxRuntime automatic */

slide.compose(
  <row width="fill" height="fill" gap={20}>
    <column width={340} height="fill" gap={12}>
      <paragraph name="summary" className="text-slate-950 text-3xl font-bold">
        Summary
      </paragraph>
      <paragraph className="text-slate-600 text-sm">
        Compose-first layouts stay readable and export cleanly.
      </paragraph>
    </column>
    <box name="surface" width="fill" height="fill" padding={16} fill="#ffffff">
      <column height="fill" gap={10}>
        <rule stroke="#0f172a" weight={2} />
      </column>
    </box>
  </row>,
  {
    frame: { left: 48, top: 40, width: 864, height: 460 },
    baseUnit: 8,
  },
);
```

`slide.compose(...)` accepts either compose helper nodes or a JSX-authored tree.  
It still returns the materialized elements. Use `name` on materializing nodes
when the slide needs stable inspect or layout-export anchors.

## Export Inline Type

```ts
type SlideExportOptions = {
  format?: "png" | "jpeg" | "webp" | "pdf" | "layout";
  width?: number;
  height?: number;
  scale?: number;
  quality?: number;
};
```

`format: "layout"` exports the composed layout tree alongside the materialized slide elements. That is the most useful export when you need stable names, hierarchy paths, and resolved text for follow-up targeting.

## Auto Layout

```ts
slide.autoLayout(shapes, {
  direction,
  frame,
  align,
  horizontalGap,
  verticalGap,
  horizontalPadding,
  verticalPadding,
});
```

## Auto Layout Inline Type

```ts
type AutoLayoutOptions = {
  direction?: "horizontal" | "vertical";
  frame?:
    | "slide"
    | Shape
    | { left: number; top: number; width: number; height: number };
  align?:
    | "center"
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "left"
    | "right"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight";
  horizontalGap?: number | "auto";
  verticalGap?: number | "auto";
  horizontalPadding?: number;
  verticalPadding?: number;
};
```

## Speaker Notes

```ts
slide.speakerNotes.text = notesText;
slide.speakerNotes.setVisible(visible);
```

## Visual QA Loop

```ts
const preview = await slide.export({ format: "png", scale: 2 });
const layout = await slide.export({ format: "layout" });
const after = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes",
  target: { id: slideAnchorId, beforeLines: 2, afterLines: 8 },
  maxChars: 4000,
});
```

Check the PNG for clipping, overlap, weak contrast, illegible text, bad image
crops, accidental rasterized labels, and off-canvas elements. Check the layout
export or inspect output for stable `name` values on important nodes.

## Cookbook

```ts
// Gradient background plus editable content.
slide.background.fill = "linear(180deg, slate-950 0%, blue-950 100%)";
const title = slide.shapes.add({
  geometry: "textbox",
  name: "title",
  position: { left: 72, top: 72, width: 760, height: 120 },
  fill: "none",
  line: { style: "solid", fill: "none", width: 0 },
});
title.text = "Editable headline";
title.text.style = { fontSize: 44, bold: true, color: "white" };
```

```ts
// Clone rhythm from another slide, then change content.
const next = sourceSlide.duplicate();
next.moveTo(3);
next.placeholders.getItem("title").text = "Updated section title";
```
