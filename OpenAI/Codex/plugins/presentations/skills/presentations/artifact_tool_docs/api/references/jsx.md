# Presentation JSX Reference

This is the compact API reference for authoring editable presentations with
presentation JSX. It describes the node vocabulary and layout mechanics. For
first-principles row, column, grid, alignment, mask, and overlay recipes, read  
`cookbook/layout.md`.

Examples start after `presentation` and `slide` exist.

## Authoring Defaults

- Use JSX for structured slide layout: `slide.compose(<row ... />, { frame })`.
- Use string sizing where supported: `width="fill"`, `height="hug"`,  
  `height="fill"`.
- Use raw pixel numbers for fixed sizes: `width={420}`, `gap={24}`,  
  `padding={{ x: 48, y: 40 }}`.
- Use Tailwind-like tokens for common styling: `fill="slate-950"`,
  `borderRadius="rounded-xl"`, `shadow="shadow-md"`,
  `className="bg-white rounded-xl shadow-sm"`.
- Use `row`, `column`, `grid`, `layers`, and `box` for layout. Use absolute
  slide frames only for the outer composed region, fixed chrome, and
  imported-template details. For overlays, scrims, and masked image
  compositions inside a region, use `layers` and image `geometry`/`borderRadius`.
- Put text in `paragraph` and inline emphasis in child `run` nodes.
- Put real data in native `table` and `chart` nodes.
- Model-facing examples use string sizing and local track objects instead of
  imported sizing helpers such as `wrap(...)`, `grow(...)`, and `fr(...)`.

## JSX Usage Rules

Use JSX props for layout and token strings for common visual styling:

| Need | Use |
| --- | --- |
| Layout sizing | `width="fill"`, `height={320}`, `gap={24}`, `padding={{ x: 32, y: 24 }}` |
| Flex flow | `<row align="center" justify="between">` and `<column gap={16}>` |
| Grid tracks | local arrays such as `[{ mode: "fr", value: 1 }]` |
| Visual tokens | `className="bg-white rounded-xl shadow-sm"` |
| Exact text | `style="font: 700 28px Inter; color: #0f172a; leading: 1.1"` |
| Gradients | `fill="linear(135deg, #fff 0%, sky-100 100%)"` |
| Image masks | `<image geometry="ellipse" crop={...} fit="cover" />` |

## Canonical Node Set

### Slide Roots

| Node | Purpose | Common props |
| --- | --- | --- |
| `slide` | Whole-slide JSX root | `id`, `name`, `width`, `height`, `padding`, `gap`, `align`, `justify`, `background`, `backgroundRef` |
| `background` | Slide background metadata | `fill`, `ref` |

Most code composes directly into an existing `slide` facade rather than using a
`<slide>` root.

### Layout Nodes

| Node | Purpose | Common props |
| --- | --- | --- |
| `row` | Horizontal flex-like layout | `width`, `height`, `gap`, `align`, `justify`, `padding` |
| `column` | Vertical flex-like layout | `width`, `height`, `gap`, `align`, `justify`, `padding` |
| `grid` | Track layout with spans | `columns`, `rows`, `autoRows`, `columnGap`, `rowGap`, `alignItems`, `justifyItems`, `padding` |
| `layers` | Overlay children in one frame | `width`, `height`, `padding`, `alignItems`, `justifyItems` |
| `box` | Surface/container with one child region | `width`, `height`, `padding`, `align`, `justify`, `fill`, `line`, `borderRadius`, `shadow`, `className` |

`align` controls the cross axis. `justify` controls the main axis. Supported
values are `"start"`, `"center"`, `"end"`, `"stretch"` for alignment and
`"start"`, `"center"`, `"end"`, `"between"` for distribution.

All direct grid children support `columnSpan` and `rowSpan`, including
`row`, `column`, `box`, `paragraph`, `shape`, `image`, `table`, and `chart`.

### Content Nodes

| Node | Purpose | Common props |
| --- | --- | --- |
| `paragraph` | Text block | `width`, `height`, `style`, `className`, `transform`, `bulletCharacter`, `marginLeft`, `indent`, `spaceBefore`, `spaceAfter`, `styleId`, `paragraphStyle` |
| `run` | Inline text run | children, `textStyle`, `className`, `link` |
| `shape` | Primitive drawing | `geometry`, `width`, `height`, `fill`, `line`, `borderRadius`, `shadow`, `className` |
| `image` | Raster/vector image | `path`, `blob`, `dataUrl`, `svg`, `prompt`, `contentType`, `fit`, `alt`, `geometry`, `borderRadius`, `crop`, `rotation`, `flipHorizontal`, `flipVertical`, `lockAspectRatio`, `width`, `height` |
| `rule` | Divider line | `stroke`, `weight`, `opacity`, `width`, `height` |
| `table` | Native table | `rows`, `columns`, `values`, `style`, `styleOptions`, `width`, `height` |
| `chart` | Native chart | `chartType`, `title`, `categories`, `series`, `legend`, `xAxis`, `yAxis`, `width`, `height` |

`id` and `name` are supported on materialized nodes. Use deterministic
kebab-case `name` values on composed roots and important descendants:
`content-frame`, `primary-heading`, `metrics-grid`, `chart-frame`, `revenue-chart`.
Names should describe role, not visual position. Use `id` when the calling code
controls stability across edits.

### Chart Child Nodes

Use a compact chart config when it is clearest. Use nested chart nodes when the  
JSX tree should expose structure.

| Node | Purpose |
| --- | --- |
| `bar`, `line`, `area`, `scatter`, `bubble`, `radar`, `pie`, `doughnut`, `treemap`, `sunburst`, `map`, `waterfall`, `funnel`, `histogram`, `boxWhisker`, `stock`, `surface`, `surface3D`, `pareto`, `combo`, `line3D`, `pie3D`, `area3D`, `bar3D`, `ofPie` | Chart family selector/options |
| `legend`, `data-labels`, `data-table`, `x-axis`, `y-axis`, `axis`, `major-gridlines`, `minor-gridlines` | Chart chrome and axes |
| `series`, `marker`, `point`, `data-label`, `trendline`, `trendline-label`, `error-bars` | Series and point-level options |
| `view-3d` | 3D camera options |

## Sizing And Frames

Use these forms first:

| Intent | JSX |
| --- | --- |
| Fill parent | `width="fill"` or `height="fill"` |
| Fit content | `width="hug"` or `height="hug"` |
| Fixed pixels | `width={320}` or `height={180}` |
| Equal children in a row/column | give each child `width="fill"` or `height="fill"` |
| One fixed region plus remaining space | one child `width={520}`, sibling `width="fill"` |
| Fixed slide region | `slide.compose(node, { frame: { left, top, width, height } })` |

`frame` uses numeric pixels. JSX size props accept strings for `"fill"` and
`"hug"` plus raw pixel numbers.

Use `1280 x 720` as the default canvas unless the task or source deck requires
another size. A common content frame is:

```ts
const PAGE = { left: 72, top: 64, width: 1136, height: 592 };
```

## Alignment Matrix

| Node | Main axis | Cross axis | Distribution prop | Cross-axis prop | Defaults |
| --- | --- | --- | --- | --- | --- |
| `row` | horizontal | vertical | `justify`: `start`, `center`, `end`, `between` | `align`: `start`, `center`, `end`, `stretch` | `justify="start"`, `align="start"` |
| `column` | vertical | horizontal | `justify`: `start`, `center`, `end`, `between` | `align`: `start`, `center`, `end`, `stretch` | `justify="start"`, `align="start"` |
| `grid` | tracks | cells | `justifyItems`: `start`, `center`, `end`, `stretch` | `alignItems`: `start`, `center`, `end`, `stretch` | both `stretch` |
| `layers` | shared frame | shared frame | `justifyItems`: `start`, `center`, `end`, `stretch` | `alignItems`: `start`, `center`, `end`, `stretch` | both `stretch` |

## Layout Recipes

This top-level reference stays close to the JSX API. For copy-paste row,
column, 3-column, 12-grid, alignment, mask, overlay, and gradient recipes, use
[`cookbook/layout.md`](./cookbook/layout.md).

## Text Examples

```tsx
<paragraph className="text-slate-950 text-4xl font-bold leading-tight">
  A paragraph can contain plain text.
</paragraph>

<paragraph className="text-slate-600 text-lg leading-relaxed">
  Use <run textStyle={{ bold: true, color: "sky-600" }}>runs</run> for inline
  emphasis or links.
</paragraph>

<column width="fill" height="hug" gap={8}>
  <paragraph
    width="fill"
    className="text-slate-700 text-lg leading-relaxed"
  >
    First paragraph.
  </paragraph>
  <paragraph bulletCharacter="•" marginLeft={18} indent={-10}>
    Bulleted paragraph with native list metadata.
  </paragraph>
</column>
```

Use `style={{ ... }}` for exact text config and `className` for tokenized
common text styling. A string `style` containing `:` or `;` is parsed as a
compact text declaration; any other string is treated as a named presentation
style id.

```tsx
<paragraph style="font: 700 22px Inter; color: #334155; leading: 1.25; wrap: none">
  Exact style string
</paragraph>
```

## Tables And Charts

Prefer compact config for data objects.

```tsx
<table
  rows={3}
  columns={3}
  values={[
    ["Metric", "Q1", "Q2"],
    ["Revenue", 12, 18],
    ["Margin", "42%", "45%"],
  ]}
  style="TableStyleMedium2"
  styleOptions={{ headerRow: true, bandedRows: true }}
  width="fill"
  height={220}
/>

<chart
  chartType="bar"
  title="Pipeline"
  categories={["Q1", "Q2", "Q3"]}
  series={[{ name: "Revenue", values: [12, 18, 24], fill: "sky-500" }]}
  xAxis={{ textStyle: { fontSize: 10, fill: "slate-600" } }}
  yAxis={{ majorGridlines: { style: "solid", fill: "slate-200", width: 1 } }}
  width="fill"
  height={280}
/>
```

Use nested chart nodes when the chart needs explicit series, point, trendline,
axis, or label structure in the JSX tree.

## Image Sources

| Source prop | Use when |
| --- | --- |
| `blob={bytes}` | Export must embed the actual image bytes. |
| `dataUrl="data:image/..."` | Bytes are already encoded inline. |
| `path="/assets/image.png"` | A downloaded image is available as a local file. |
| `prompt="..."` | The slide should contain an image-generation placeholder. |

Use `fit="contain"` when the full image must remain visible. Use `fit="cover"`
when cropping is deliberate. Keep labels and data as editable slide text layered
with the image.

## Reference Tests

- `tests/presentation/jsx.spec.tsx`: JSX normalization and compose behavior.
- `tests/presentation/jsx-style-language.spec.tsx`: compact style strings.
- `tests/presentation/tailwind-tokens.sanity.spec.ts`: token coverage.
