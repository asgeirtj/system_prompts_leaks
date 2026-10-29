# Auto Layout

`slide.autoLayout(...)` places shapes within a frame using deterministic spacing.
Use `slide.compose(<row>/<column>/<grid>)` for new structured JSX layouts. Use
`slide.autoLayout(...)` when repositioning existing facade shapes, especially
imported or generated shapes.

## Pattern

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

## Inputs

- `direction`: horizontal or vertical flow.
- `frame`: `"slide"`, container `Shape`, or explicit `{ left, top, width, height }`.
- `align`: 3x3 group alignment within the frame.
- Gap and padding values use pixels.

## Inline Types

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

## Shape Prep

```ts
for (const shape of shapes) {
  shape.position = {
    width: shapeWidthPx,
    height: shapeHeightPx,
  };
}

slide.autoLayout(shapes, layoutConfig);
```

## Cookbook

```ts
// Equal KPI row.
const kpiShapes = metrics.map((metric) =>
  slide.shapes.add({
    geometry: "roundRect",
    position: { width: 240, height: 132 },
    fill: "white",
    line: { style: "solid", fill: "slate-200", width: 1 },
    borderRadius: "rounded-xl",
  }),
);

slide.autoLayout(kpiShapes, {
  direction: "horizontal",
  frame: { left: 80, top: 160, width: 1120, height: 160 },
  horizontalGap: "auto",
  align: "center",
});
```

```ts
// Vertical callout stack inside an existing shape frame.
slide.autoLayout(callouts, {
  direction: "vertical",
  frame: frameShape,
  verticalGap: 14,
  horizontalPadding: 24,
  verticalPadding: 24,
  align: "topLeft",
});
```
