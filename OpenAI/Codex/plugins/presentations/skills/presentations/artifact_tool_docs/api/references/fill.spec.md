# Fill And Line Configs

Fill configs style shapes, chart regions, table cells, slide backgrounds, lines,
and text fills. Text outlines use `LineConfig`, so their `fill`/`color` fields
accept the same fill forms.

## Fill Forms

```ts
shape.fill = fillConfig;
shape.line = lineConfig;
```

Supported fill forms:

- Theme, hex, RGB/RGBA, Tailwind-like color, and transformed color strings.
- `"none"` and `"transparent"`.
- Gradient strings such as `linear(...)` and `radial(...)`.
- `{ type: "none" }`.
- `{ type: "solid", color, pattern }`.
- `{ type: "gradient", gradientKind, angleDeg, stops }`.
- `{ type: "image", imageReference, srcRect, fillRect, stretchFillRect }`.

## String Fill Shortcuts

Use string fills for compact JSX and facade setters:

```tsx
<shape geometry="rect" fill="none" line={{ style: "solid", fill: "slate-300", width: 1 }} />
<box fill="black/45" />
<box fill="transparent" />
<box fill="accent1+18/90" />
<box fill="linear(135deg, #ffffff 0%, sky-100 58%, #ffffff/0 100%)" />
<shape geometry="ellipse" fill="radial(white/80 0%, emerald-200/45 48%, emerald-700/0 100%)" />
```

Use `fill="none"` when the object should have no fill. Use
`fill="transparent"` when the object should keep an editable transparent solid
fill.

`+` lightens theme/RGB colors, `-` darkens, and `/` sets opacity. Tailwind-like
color tokens, theme aliases, gradients, shadows, and text style strings are
summarized in `tokens.md`.

## Fill Inline Types

```ts
type ThemeColorName =
  | "accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6"
  | "bg1" | "bg2" | "tx1" | "tx2" | "dk1" | "lt1" | "dk2" | "lt2"
  | "hlink" | "folHlink";

type ColorConfig =
  | string
  | { type: "rgb"; value: string; transform?: ColorTransform }
  | { type: "theme"; value: ThemeColorName; transform?: ColorTransform };

type ColorTransform = {
  opacity?: number; // 0..1 or 0..100
  lighten?: number; // 0..1 or 0..100
  darken?: number; // 0..1 or 0..100
};

type FillConfig =
  | string
  | { type: "none" }
  | { type: "solid"; color: ColorConfig; pattern?: PatternConfig }
  | {
      type: "gradient";
      stops: Array<{ offset: number; color: ColorConfig }>; // offset 0..100000
      offsetScale?: 1 | 100000;
      angleDeg?: number;
      gradientKind?: "linear" | "path";
    }
  | {
      type: "image";
      imageReference: { id: string };
      alphaModFix?: number;
      stretchFillRect?: { l?: number; t?: number; r?: number; b?: number };
      fillRect?: { l?: number; t?: number; r?: number; b?: number };
      srcRect?: { l?: number; t?: number; r?: number; b?: number };
    };
```

## Gradient

```ts
const fillConfig = {
  type: "gradient",
  gradientKind,
  angleDeg,
  stops: [
    { offset: startOffset, color: startColor },
    { offset: endOffset, color: endColor },
  ],
};
```

Gradient offsets use `0` to `100000`.

## Pattern Fills

Patterns are available through object fill configs:

```ts
shape.fill = {
  type: "solid",
  color: "white",
  pattern: { type: "diagonalCross", color: "slate-300/70" },
};
```

Common compact pattern names:

```text
percent10, percent20, lightHorizontal, lightVertical, smallGrid, dotGrid,
diagonalCross, narrowVertical, wave, smallCheck
```

Supported pattern names:

```text
none, solid, mediumGray, darkGray, lightGray, darkHorizontal, darkVertical,
darkDown, darkUp, darkGrid, darkTrellis, lightHorizontal, lightVertical,
lightDown, lightUp, lightGrid, lightTrellis, gray125, gray0625, percent5,
percent10, percent20, percent25, percent30, percent40, percent50, percent60,
percent70, percent75, percent80, percent90, horizontal, vertical,
narrowHorizontal, narrowVertical, dashedHorizontal, dashedVertical, cross,
largeGrid, smallGrid, dotGrid, downwardDiagonal, upwardDiagonal,
wideDownwardDiagonal, wideUpwardDiagonal, dashedDownwardDiagonal,
dashedUpwardDiagonal, diagonalCross, smallCheck, largeCheck, smallConfetti,
largeConfetti, horizontalBrick, diagonalBrick, solidDiamond, openDiamond,
dottedDiamond, plaid, sphere, weave, divot, shingle, wave, trellis, zigZag
```

## Line

```ts
const lineConfig = {
  style: lineStyle,
  fill: lineFill,
  width: lineWidthPx,
};
```

## Line Inline Type

```ts
type LineConfig = {
  style: "solid" | "dashed" | "dotted" | "dash-dot" | "dash-dot-dot" | string;
  fill?: FillConfig;
  width?: number;
  color?: FillConfig; // alias for fill
  weight?: number; // alias for width
};
```

## Cookbook

```ts
// Linear background wash.
slide.background.fill = "linear(0deg, #020617 0%, #2563eb 100%)";
```

```ts
// Soft radial spotlight behind a chart.
chart.plotAreaFill = "radial(#dbeafe/90 0%, #ffffff/0 100%)";
```

```ts
// Exact gradient object.
shape.fill = {
  type: "gradient",
  gradientKind: "linear",
  angleDeg: 35,
  offsetScale: 100000,
  stops: [
    { offset: 0, color: "#ffffff" },
    { offset: 100000, color: "sky-100" },
  ],
};
```

```ts
// Normalized gradient offsets.
shape.fill = {
  type: "gradient",
  gradientKind: "linear",
  offsetScale: 1,
  stops: [
    { offset: 0, color: "#ffffff" },
    { offset: 1, color: "sky-100" },
  ],
};
```

```ts
// Hairline rule and muted border.
shape.line = { style: "solid", fill: "slate-200", width: 1 };
ruleShape.line = { style: "dashed", fill: "#94a3b8", width: 1 };
```
