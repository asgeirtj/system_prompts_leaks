# Rich Text

Shape text accepts strings, paragraph arrays, and structured runs.

## Set Text

```ts
shape.text = textValue;
shape.text = paragraphs;
shape.text = structuredRuns;
```

## Text Value Inline Types

```ts
type TextValue = string | string[] | StructuredTextInput | Text;

type StructuredTextInput =
  | ParagraphRunsInput
  | StructuredTextParagraphInput
  | Array<ParagraphRunsInput | StructuredTextParagraphInput>;

type ParagraphRunsInput = Array<string | number | TextRunInput>;

type StructuredTextParagraphInput = {
  runs?: ParagraphRunsInput;
  bulletCharacter?: string;
  marginLeft?: number;
  indent?: number;
  spaceBefore?: number;
  spaceAfter?: number;
  styleId?: string;
  paragraphStyle?: Record<string, unknown>;
};

type TextRunInput = {
  run: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: string;
    fontSize?: string;
    typeface?: string;
    color?: FillConfig;
  };
  textStyle?: TextRunInput["style"]; // Compatibility alias.
  link?: { uri: string; isExternal: boolean; action?: string };
};
```

`style` takes precedence as a complete object when both `style` and `textStyle` are supplied.

Structured run `fontSize` accepts unit strings such as `"20pt"` and `"28px"`.  
Shape text style setters use numeric pixels with `fontSize` and numeric points
with `fontSizePt`.

## Structured Paragraphs

```ts
shape.text.set([
  [{ run: "Status", style: { bold: true } }, { run: " review" }],
  {
    bulletCharacter: "•",
    marginLeft: 18,
    indent: -10,
    runs: [
      "Open the",
      {
        run: " rollout notes",
        style: { underline: "sng", color: "#2563eb" },
        link: { uri: "https://example.com", isExternal: true },
      },
    ],
  },
]);
```

The paragraph-object form is the non-JSX peer of `<paragraph>...</paragraph>`. Use it when the text needs paragraph metadata plus authored runs.

## JSX Rich Text

```tsx
/** @jsxRuntime automatic */

slide.compose(
  <column width="fill" height="hug" gap={8}>
    <paragraph width="fill" className="text-slate-950 text-2xl leading-tight">
      <run textStyle={{ bold: true }}>Status</run>
      <run> review</run>
    </paragraph>
    <paragraph
      width="fill"
      className="text-slate-950 text-2xl leading-tight"
      bulletCharacter="•"
      marginLeft={18}
      indent={-10}
    >
      Open the
      <run
        textStyle={{ underline: "sng", color: "#2563eb" }}
        link={{ uri: "https://example.com", isExternal: true }}
      >
        {" rollout notes"}
      </run>
    </paragraph>
  </column>,
  {
    frame: { left: 48, top: 40, width: 864, height: 160 },
    baseUnit: 8,
  },
);
```

## Shape Text Style

```ts
shape.text.style = {
  styleName,
  fontSize: fontSizePx,
  color: colorConfig,
  fill: fillConfig,
  outline: lineConfig,
  alignment,
  verticalAlignment,
  autoFit: autoFitMode,
  wrap: wrapMode,
  insets,
};
```

Use grouped `text.style = { ... }` for whole-shape text formatting. Use single
property setters for focused edits:

```ts
shape.text.fontSize = fontSizePx;
shape.text.color = colorConfig;
shape.text.fill = fillConfig;
shape.text.outline = lineConfig;
shape.text.alignment = alignment;
shape.text.verticalAlignment = verticalAlignment;
shape.text.autoFit = autoFitMode;
shape.text.wrap = wrapMode;
shape.text.insets = 0; // Set all four sides; use an object for individual sides.
```

`shape.text.color` uses `ColorConfig`. `shape.text.fill`, run `style.fill`,
and text ranges accept the shared `FillConfig`, including linear and path
gradients. `shape.text.outline`, run `style.outline`, and text ranges accept
`LineConfig`; the outline line fill can be a solid, pattern, or gradient fill.

```ts
shape.text.fill = {
  type: "gradient",
  gradientKind: "linear",
  angleDeg: 0,
  stops: [
    { offset: 0, color: "#ff5a5f" },
    { offset: 100000, color: "#4f46e5" },
  ],
};
```

Path gradients use the same fill config with `gradientKind: "path"`, `pathType`, and optional
`fillRect` in thousandths of a percent (`100000` = 100%).

## Text Style Inline Type

```ts
type TextStyleConfig = {
  styleName?: string;
  className?: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  lineSpacing?: number;
  alignment?: "left" | "center" | "right" | "justify";
  verticalAlignment?: "top" | "middle" | "bottom";
  underline?: string;
  fill?: FillConfig;
  color?: ColorConfig;
  outline?: LineConfig;
  wrap?: "square" | "none";
  autoFit?: "none" | "shrinkText" | "resizeShapeToFitText";
  insets?: number | { top?: number; right?: number; bottom?: number; left?: number };
  typeface?: string;
};
```

## Ranges

```ts
const range = shape.text.get(searchText);
range.bold = isBold;
range.italic = isItalic;
range.fill = fillConfig;
range.outline = lineConfig;
range.link = linkConfig;

const fixedRange = shape.text.getRange(start, length);
fixedRange.style = styleName;
```

## Lists

```ts
shape.text = listParagraphs;
shape.text.style = listStyleName;
shape.text.get(itemText).lineSpacing = lineSpacing;
```

## Links

```ts
shape.text.get(linkText).link = {
  uri,
  isExternal,
};
```

## Link Inline Type

```ts
type LinkConfig = {
  uri: string;
  isExternal: boolean;
  action?: string;
};
```

## Cookbook

```ts
// Title with emphasized suffix.
shape.text.set([
  [
    { run: "Revenue", style: { bold: true, color: "#0f172a" } },
    { run: " momentum", style: { color: "#2563eb" } },
  ],
]);
shape.text.style = { fontSize: 44, lineSpacing: 0.92 };
```

```ts
// Bullets with bold lead-ins.
shape.text.set([
  { bulletCharacter: "•", marginLeft: 22, indent: -12, runs: [{ run: "Quality:", style: { bold: true } }, " defect rate down 31%"] },
  { bulletCharacter: "•", marginLeft: 22, indent: -12, runs: [{ run: "Speed:", style: { bold: true } }, " p95 latency under target"] },
]);
```

```ts
// Edit one phrase inside imported text.
const range = shape.text.get("legacy workflow");
range.text = "new workflow";
range.className = "text-emerald-700 font-bold";
```
