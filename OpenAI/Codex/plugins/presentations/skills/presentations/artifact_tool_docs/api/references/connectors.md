# Connectors

`slide.shapes.connect` creates connector lines that stay attached to slide
shapes. Use it for arrows, flow links, callouts, dependency lines, and other
relationships between positioned shapes.

Use direct `geometry: "connector"` creation only when you need exact connection
site indexes.

## Connect Shapes

```ts
const connector = slide.shapes.connect(sourceShape, targetShape, {
  kind: "elbow",
  fromSide: "right",
  toSide: "left",
  line: { style: "solid", fill: "slate-500", width: 2 },
  head: { type: "arrow", width: "med", length: "med" },
});
```

Endpoints accept shape facades or shape ids. `fromSide` and `toSide` accept
`"top"`, `"left"`, `"bottom"`, or `"right"` and resolve to the nearest
connection site for that shape geometry. When you omit side and index options,
the API chooses a connection pair from the relative shape positions.

`kind` defaults to `"elbow"` for `slide.shapes.connect(...)`.

## Connect Inline Types

```ts
type ConnectorSide = "top" | "left" | "bottom" | "right";

type ShapeConnectOptions = {
  kind?:
    | "straight"
    | "elbow"
    | "elbow2"
    | "elbow3"
    | "elbow4"
    | "elbow5"
    | "curved";
  fromSide?: ConnectorSide;
  toSide?: ConnectorSide;
  fromIdx?: number;
  toIdx?: number;
  line?: LineConfig;
  head?: LineEndConfig;
  tail?: LineEndConfig;
  cap?: "flat" | "round" | "square";
  join?: "round" | "bevel" | "miter";
};

type LineEndConfig = {
  type?: "none" | "triangle" | "stealth" | "diamond" | "oval" | "arrow";
  width?: "sm" | "med" | "lg";
  length?: "sm" | "med" | "lg";
};
```

## Anchor Choice

Use side anchors for readable authoring:

```ts
slide.shapes.connect(sourceShape, targetShape, {
  fromSide: "bottom",
  toSide: "top",
  kind: "elbow",
  line: { style: "dashed", fill: "accent1", width: 2 },
});
```

Use explicit connection site indexes when you need an exact preset-geometry site:

```ts
const fromIdx = slide.shapes.getConnectionSiteIndex(sourceShape, "right");
const toIdx = slide.shapes.getConnectionSiteIndex(targetShape, "left");

slide.shapes.connect(sourceShape.id, targetShape.id, {
  fromIdx,
  toIdx,
  kind: "straight",
  line: { style: "solid", fill: "slate-700", width: 2 },
});
```

Connection site indexes are PowerPoint preset geometry connection points. Side
anchors map to the closest useful preset site for rectangles, ellipses, and
other shapes.

## Direct Connector Shape

```ts
const connector = slide.shapes.add({
  geometry: "connector",
  kind: "curved",
  from: sourceShape,
  fromIdx: 3,
  to: targetShape,
  toIdx: 1,
  line: { style: "solid", fill: "accent1", width: 2 },
  tail: { type: "triangle", width: "med", length: "med" },
});
```

## Unattached Connector

```ts
const arrow = slide.shapes.add({
  geometry: "connector",
  kind: "straight",
  position: { left: 40, top: 160, width: 240, height: 0 },
  line: { fill: "accent1", width: 2 },
  tail: { type: "arrow" },
});
```

## One Attached Endpoint

```ts
const connector = slide.shapes.add({
  geometry: "connector",
  kind: "straight",
  from: sourceShape,
  fromIdx: slide.shapes.getConnectionSiteIndex(sourceShape, "right"),
  position: { left: 40, top: 160, width: 240, height: 0 },
  line: { fill: "accent1", width: 2 },
  tail: { type: "arrow" },
});
```

## Direct Connector Inline Type

```ts
type ConnectorConfig = {
  geometry: "connector";
  from?: Shape | string;
  fromIdx?: number;
  to?: Shape | string;
  toIdx?: number;
  position?: PositionConfig;
  kind?:
    | "straight"
    | "elbow"
    | "elbow2"
    | "elbow3"
    | "elbow4"
    | "elbow5"
    | "curved";
  line?: LineConfig;
  head?: LineEndConfig;
  tail?: LineEndConfig;
  cap?: "flat" | "round" | "square";
  join?: "round" | "bevel" | "miter";
};
```

Connectors support line styling and line ends, but not `borderRadius` or  
`shadow`.

## Edit Existing Connectors

```ts
const connector = presentation.resolve(connectorAnchorId);
const nextFromIdx = slide.shapes.getConnectionSiteIndex(
  nextSourceShape,
  "right",
);
const nextToIdx = slide.shapes.getConnectionSiteIndex(nextTargetShape, "left");

connector.setConnectorFrom(nextSourceShape, nextFromIdx);
connector.setConnectorTo(nextTargetShape.id, nextToIdx);
connector.line = { style: "solid", fill: "slate-800", width: 2 };
connector.bringToFront();
```

Use `presentation.inspect({ kind: "shape", search })` to find connector anchor
ids. Connector facades expose `connector`, `connectorLineStyle`,
`connectorHead`, and `connectorTail` for readback.

## Routing And Ordering

New connectors are sent behind shapes by default so boxes and labels remain
readable. Call `connector.bringToFront()` when the connector should sit above
other elements.

## Cookbook

```ts
// Arrow from one card to another.
slide.shapes.connect(sourceCard, targetCard, {
  kind: "elbow",
  fromSide: "right",
  toSide: "left",
  line: { style: "solid", fill: "slate-500", width: 2 },
  head: { type: "arrow", width: "med", length: "med" },
});
```

```ts
// Bidirectional relationship line.
slide.shapes.connect(leftShape, rightShape, {
  kind: "straight",
  fromSide: "right",
  toSide: "left",
  line: { style: "dashed", fill: "accent2", width: 2 },
  head: { type: "arrow", width: "sm", length: "sm" },
  tail: { type: "arrow", width: "sm", length: "sm" },
});
```

```ts
// Curved connector with explicit preset connection sites.
slide.shapes.add({
  geometry: "connector",
  kind: "curved",
  from: sourceShape,
  fromIdx: slide.shapes.getConnectionSiteIndex(sourceShape, "bottom"),
  to: targetShape,
  toIdx: slide.shapes.getConnectionSiteIndex(targetShape, "top"),
  line: { style: "solid", fill: "accent1", width: 2 },
  tail: { type: "triangle", width: "med", length: "med" },
});
```
