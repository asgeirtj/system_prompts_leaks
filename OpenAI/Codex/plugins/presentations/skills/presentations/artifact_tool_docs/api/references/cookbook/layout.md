# Presentation Layout Cookbook

First-principles recipes for arranging editable presentation JSX. These are
layout mechanics, not deck archetypes.

Examples start after `presentation` and `slide` exist. Prefer string sizing
(`"fill"`, `"hug"`) and local track values over helper imports.

Use `1280 x 720` as the default canvas unless the task or source deck requires
another size:

```ts
const SLIDE_W = 1280;
const SLIDE_H = 720;
const PAGE = { left: 72, top: 64, width: 1136, height: 592 };
```

## Choose The Primitive

| Need | Use |
| --- | --- |
| Horizontal flow | `row` |
| Vertical flow | `column` |
| Column/row spans | `grid` |
| Overlays or background plates | `layers` |
| Surface plus child content | `box` |
| Fixed placement on a slide | `slide.compose(node, { frame })` or facade `position` |

Use `frame` for the outer composed region. Inside the region, use `row`,
`column`, `grid`, and `layers` so content stays resizable and inspectable. Use
`layers` plus image `geometry`/`borderRadius` for overlays, scrims, and masked
image compositions inside a region.

## Sizing Vocabulary

```tsx
<box width="fill" height="fill" />  // claim available space
<box width="hug" height="hug" />    // fit its children
<box width={320} height={180} />    // fixed pixels
```

Equal siblings fill equally:

```tsx
<row width="fill" height={160} gap={24} align="stretch">
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
</row>
```

One fixed sibling plus one flexible sibling:

```tsx
<row width="fill" height="fill" gap={32} align="stretch">
  <column width={360} height="fill" gap={16}>
    <paragraph className="text-slate-950 text-4xl font-bold">Fixed rail</paragraph>
    <paragraph className="text-slate-600 text-lg">This column stays 360px wide.</paragraph>
  </column>
  <box width="fill" height="fill" className="bg-slate-100 rounded-2xl" />
</row>
```

## Padding And Gutters

Use object padding for asymmetric page gutters. Use numeric padding for all
sides.

Use an 8px spacing scale unless matching a source deck: common gaps are `16`,
`24`, `28`, and `32`. Common page gutters use `PAGE`; pass `baseUnit: 8` to
`slide.compose` when examples rely on this scale.

```tsx
<column
  width="fill"
  height="fill"
  padding={{ top: 64, right: 80, bottom: 56, left: 80 }}
  gap={28}
>
  <paragraph className="text-slate-950 text-5xl font-bold">Page title</paragraph>
  <box width="fill" height="fill" className="bg-white rounded-xl" />
</column>
```

```tsx
<box width="fill" height="hug" padding={{ x: 28, y: 18 }} className="bg-sky-50 rounded-xl">
  <paragraph className="text-sky-950 text-xl font-bold">Compact padded box</paragraph>
</box>
```

## Rows

`row` lays out children left to right. `justify` distributes along the
horizontal axis. `align` controls vertical alignment.

```tsx
<row width="fill" height={72} align="center" justify="between">
  <paragraph className="text-slate-950 text-2xl font-bold">Left</paragraph>
  <paragraph className="text-slate-500 text-sm">Right</paragraph>
</row>
```

Center a child:

```tsx
<row width="fill" height={220} align="center" justify="center">
  <box width={360} height={120} className="bg-white rounded-xl shadow-sm" />
</row>
```

Stretch all children to the row height:

```tsx
<row width="fill" height={240} gap={20} align="stretch">
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
</row>
```

## Columns

`column` lays out children top to bottom. `justify` distributes along the
vertical axis. `align` controls horizontal alignment.

```tsx
<column width="fill" height="fill" justify="between" gap={24}>
  <paragraph className="text-slate-950 text-4xl font-bold">Top block</paragraph>
  <paragraph className="text-slate-600 text-lg">Bottom block</paragraph>
</column>
```

Metadata row, content region, and closing rule:

```tsx
<column width="fill" height="fill" gap={24}>
  <row width="fill" height={72} align="center" justify="between">
    <paragraph className="text-slate-500 text-sm font-bold">HEADER</paragraph>
    <paragraph className="text-slate-400 text-sm">Source</paragraph>
  </row>
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <rule stroke="slate-200" weight={1} />
</column>
```

## Three Columns

Use a `row` when all columns are equal or only one side is fixed.

```tsx
slide.compose(
  <row name="three-column-layout" width="fill" height="fill" gap={24} align="stretch">
    <column name="column-a" width="fill" height="fill" gap={12}>
      <paragraph className="text-slate-950 text-2xl font-bold">Column A</paragraph>
      <paragraph className="text-slate-600 text-base">Editable body copy.</paragraph>
    </column>
    <column name="column-b" width="fill" height="fill" gap={12}>
      <paragraph className="text-slate-950 text-2xl font-bold">Column B</paragraph>
      <paragraph className="text-slate-600 text-base">Editable body copy.</paragraph>
    </column>
    <column name="column-c" width="fill" height="fill" gap={12}>
      <paragraph className="text-slate-950 text-2xl font-bold">Column C</paragraph>
      <paragraph className="text-slate-600 text-base">Editable body copy.</paragraph>
    </column>
  </row>,
  { frame: PAGE, baseUnit: 8 },
);
```

Use fixed rails when the center should absorb resize:

```tsx
<row width="fill" height="fill" gap={24} align="stretch">
  <box width={240} height="fill" className="bg-slate-50 rounded-xl" />
  <box width="fill" height="fill" className="bg-white rounded-xl" />
  <box width={240} height="fill" className="bg-slate-50 rounded-xl" />
</row>
```

## Twelve-Column Grid

Use `grid` when child spans matter. Keep `fr` and fixed track objects local and
obvious; use the literal `"auto"` for auto tracks:

```tsx
const GRID_12 = Array.from(
  { length: 12 },
  () => ({ mode: "fr", value: 1 }) as const,
);
```

Use a 12-column grid when spans communicate structure. Spans in a row usually
add to 12, such as `4/4/4`, `3/6/3`, or `4/8`. Put vertical content inside
`column` children and surfaces inside `box` children. Use a simple `row` when
every column is equal and no span semantics are needed.

Full-width heading plus three equal columns:

```tsx
<grid
  width="fill"
  height="fill"
  columns={GRID_12}
  rows={["auto", { mode: "fr", value: 1 }]}
  columnGap={24}
  rowGap={28}
>
  <paragraph columnSpan={12} className="text-slate-950 text-5xl font-bold">
    Full-width heading
  </paragraph>
  <box columnSpan={4} width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box columnSpan={4} width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box columnSpan={4} width="fill" height="fill" className="bg-slate-50 rounded-xl" />
</grid>
```

Four/eight split:

```tsx
<grid width="fill" height="fill" columns={GRID_12} columnGap={28}>
  <column columnSpan={4} width="fill" height="fill" gap={16}>
    <paragraph className="text-slate-950 text-4xl font-bold">Left span</paragraph>
    <paragraph className="text-slate-600 text-lg">Uses 4 of 12 columns.</paragraph>
  </column>
  <box columnSpan={8} width="fill" height="fill" className="bg-sky-50 rounded-2xl" />
</grid>
```

Three/six/three split:

```tsx
<grid width="fill" height="fill" columns={GRID_12} columnGap={20}>
  <box columnSpan={3} width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box columnSpan={6} width="fill" height="fill" className="bg-white rounded-xl shadow-sm" />
  <box columnSpan={3} width="fill" height="fill" className="bg-slate-50 rounded-xl" />
</grid>
```

Rows plus row spans:

```tsx
<grid
  width="fill"
  height="fill"
  columns={GRID_12}
  rows={["auto", { mode: "fr", value: 1 }, { mode: "fr", value: 1 }]}
  columnGap={24}
  rowGap={24}
>
  <paragraph columnSpan={12} className="text-slate-950 text-4xl font-bold">
    Heading
  </paragraph>
  <box columnSpan={8} rowSpan={2} width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box columnSpan={4} width="fill" height="fill" className="bg-sky-50 rounded-xl" />
  <box columnSpan={4} width="fill" height="fill" className="bg-emerald-50 rounded-xl" />
</grid>
```

Mixed fixed and flexible tracks:

```tsx
<grid
  width="fill"
  height="fill"
  columns={[
    { mode: "fixed", value: 280 },
    { mode: "fr", value: 1 },
    { mode: "fixed", value: 220 },
  ]}
  columnGap={24}
>
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
  <box width="fill" height="fill" className="bg-white rounded-xl shadow-sm" />
  <box width="fill" height="fill" className="bg-slate-50 rounded-xl" />
</grid>
```

## Grid Alignment

Use `alignItems` and `justifyItems` for grid child alignment. If one child
needs different alignment, wrap it in a `row`, `column`, or `box`.

| Node | Main axis | Cross axis | Distribution prop | Cross-axis prop | Defaults |
| --- | --- | --- | --- | --- | --- |
| `row` | horizontal | vertical | `justify`: `start`, `center`, `end`, `between` | `align`: `start`, `center`, `end`, `stretch` | `start` / `start` |
| `column` | vertical | horizontal | `justify`: `start`, `center`, `end`, `between` | `align`: `start`, `center`, `end`, `stretch` | `start` / `start` |
| `grid` | tracks | cells | `justifyItems`: `start`, `center`, `end`, `stretch` | `alignItems`: `start`, `center`, `end`, `stretch` | `stretch` / `stretch` |
| `layers` | shared frame | shared frame | `justifyItems`: `start`, `center`, `end`, `stretch` | `alignItems`: `start`, `center`, `end`, `stretch` | `stretch` / `stretch` |

```tsx
<grid
  width="fill"
  height={260}
  columns={[{ mode: "fr", value: 1 }, { mode: "fr", value: 1 }]}
  rows={[{ mode: "fr", value: 1 }]}
  columnGap={24}
  alignItems="center"
  justifyItems="stretch"
>
  <box height={120} className="bg-slate-50 rounded-xl" />
  <box height="fill" className="bg-sky-50 rounded-xl" />
</grid>
```

## Layers

`layers` gives every child the same parent frame. Put visual backgrounds first,
then overlays, then editable text.

```tsx
<layers width="fill" height="fill">
  <image
    blob={backgroundBytes}
    contentType="image/jpeg"
    fit="cover"
    alt="Background"
    width="fill"
    height="fill"
  />
  <shape geometry="rect" width="fill" height="fill" fill="black/45" />
  <column width={620} height="fill" padding={64} justify="end" gap={18}>
    <paragraph className="text-white text-5xl font-bold leading-tight">
      Editable headline
    </paragraph>
    <paragraph className="text-white/80 text-xl leading-relaxed">
      Editable supporting copy.
    </paragraph>
  </column>
</layers>
```

## Image Masks

Use image `geometry` for real clipping. Use `crop` plus `fit="cover"` when the
subject should fill the mask.

Quick reference:

| Need | Use |
| --- | --- |
| Preserve the full image | `fit="contain"` |
| Fill the frame and allow crop | `fit="cover"` |
| Clip to a shape | `geometry="ellipse"` or `geometry="roundRect"` |
| Rounded rectangle mask | `borderRadius="rounded-2xl"` |
| Manual crop | `crop={{ left, top, right, bottom }}` with normalized `0..1` insets |

`crop` values are fractions removed from each source-image edge and are clamped.
Overlays do not clip images; use image `geometry` or `borderRadius` for masks.

```tsx
<image
  blob={portraitBytes}
  contentType="image/jpeg"
  alt="Portrait"
  geometry="ellipse"
  fit="cover"
  crop={{ left: 0.1, top: 0, right: 0.08, bottom: 0 }}
  width={240}
  height={240}
/>
```

Rounded rectangle image:

```tsx
<image
  blob={photoBytes}
  contentType="image/jpeg"
  alt="Photo"
  fit="cover"
  width="fill"
  height={320}
  borderRadius="rounded-2xl"
/>
```

## Flow Versus Absolute Placement

Use flow for related content:

```tsx
slide.compose(
  <column width="fill" height="fill" gap={20}>
    <paragraph className="text-slate-950 text-4xl font-bold">Title</paragraph>
    <row width="fill" height="fill" gap={24} align="stretch">
      <box width="fill" className="bg-slate-50 rounded-xl" />
      <box width="fill" className="bg-slate-50 rounded-xl" />
    </row>
  </column>,
  { frame: PAGE, baseUnit: 8 },
);
```

Use absolute positions for elements that must land at exact slide coordinates:

```ts
slide.shapes.add({
  geometry: "rect",
  name: "fixed-accent-bar",
  position: { left: 0, top: 0, width: 12, height: 720 },
  fill: "accent1",
  line: { style: "solid", fill: "none", width: 0 },
});
```

## Verify Layout

Inspect the layout tree when spans or wrapping matter:

```ts
const layout = await slide.export({ format: "layout" });
const png = await slide.export({ format: "png", scale: 1 });
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart",
  maxChars: 8000,
});
```

Check the rendered PNG for clipping, overlap, broken image crops, and text
that should have stayed editable.
