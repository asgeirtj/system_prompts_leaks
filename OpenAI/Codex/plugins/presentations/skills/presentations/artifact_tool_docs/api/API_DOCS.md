# Presentation API Docs

Use the presentation facades to create PowerPoint-style decks in TypeScript.

## Conventions (units + presets)

- **Pixels everywhere**: all slide geometry uses CSS pixels (`px`) at 96 DPI: `position.{left,top,width,height}`, line widths, and text `fontSize`.
- **Default canvas for examples**: use `1280 x 720` unless the task or source deck says otherwise. A useful full-slide content frame is `{ left: 72, top: 64, width: 1136, height: 592 }`.
- **Angles**: rotations use degrees.
- **Preset geometry**: `geometry` uses preset shape-name strings. Use standard shape presets and `geometry: "custom"` for bespoke paths.
- **Gradients**: stop `offset` ranges from `0` to `100000`.
- **Config-first authoring**: pass config objects into create/add APIs and grouped setters when the API provides them.
- **String values**: options such as geometry, fit, alignment, chart type, line style, and connector kind are strings; reference pages list exact small unions and grep targets for huge catalogs.
- **Inline docs types**: reference pages include illustrative `type ... = { ... }` blocks. Treat them as schema-shaped authoring guidance, not imports.
- **Authoring surfaces**: `slide.compose(...)` covers rows, columns, grids, layers, and token strings. Config-first facade APIs cover exact positions, fixed chrome, native charts/tables/images, and imported deck edits.

## Common Routes

- Rows, columns, grids, overlays, and 12-column spans: [`references/cookbook/layout.md`](./references/cookbook/layout.md).
- JSX node props and sizing mechanics: [`references/jsx.md`](./references/jsx.md).
- Tailwind-like visual strings: [`references/tokens.md`](./references/tokens.md).
- Inspect, resolve, edit, preview, and re-inspect loops: [`references/cookbook/imported-deck.md`](./references/cookbook/imported-deck.md).

## Quick start

```ts
const presentation = Presentation.create({
  slideSize: { width: 1280, height: 720 },
});

const slide = presentation.slides.add();
slide.background.fill = "slate-50";

const headline = slide.shapes.add({
  geometry: "textbox",
  name: "headline",
  position: { left: 72, top: 64, width: 720, height: 96 },
  fill: "none",
  line: { style: "solid", fill: "none", width: 0 },
});
headline.text = "Editable headline";
headline.text.style = { fontSize: 44, bold: true, color: "slate-950" };

const shape = slide.shapes.add({
  geometry: "roundRect",
  name: "summary-surface",
  position: { left: 72, top: 188, width: 520, height: 300 },
  fill: "white",
  line: { style: "solid", fill: "slate-200", width: 1 },
  borderRadius: "rounded-2xl",
});

const previewBlob = await presentation.export({
  slide,
  format: "png",
  scale: 2,
});
const deckPdfBlob = await presentation.export({ format: "pdf" });
const slidePdfBlob = await presentation.export({ slide, format: "pdf" });
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape",
  maxChars: 4000,
});
const help = presentation.help("*", {
  search: "chart axis labels",
  include: ["index", "notes"],
  maxChars: 4000,
});
const proto = presentation.toProto();
```

Inspect every final slide PNG at full size. After repairs, refresh previews for
the affected slides, including those affected by inherited changes.

## Optional Inspection Exports

When investigating placement, export layout evidence for the affected slide:

```ts
const layoutBlob = await slide.export({ format: "layout" });
```

For deck flow or changes affecting multiple slides, export an overview montage:

```ts
const montageBlob = await presentation.export({
  format: "webp",
  montage: true,
});
```

Capture these before and after edits when comparison is useful. A montage
supports deck-level review; use individual PNGs for full-size slide inspection.

## Load Existing Presentation Data

Load a PPTX from a local path:

```ts
const presentation = await Presentation.load("input.pptx");
```

Load serialized presentation data with `Presentation.load(proto)`:

```ts
const presentation = Presentation.load(proto);

const before = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,thread,layout",
  search: "Revenue",
  maxChars: 8000,
});

const slide = presentation.resolve(slideAnchorIdFromInspect);
const previewBefore = await presentation.export({
  slide,
  format: "png",
  scale: 1,
});

const target = presentation.resolve(anchorIdFromInspect);
target.text.replace("Revenue", "Revenue outlook");
target.text.style = { fontSize: 24, color: "slate-950", bold: true };

const previewAfter = await presentation.export({
  slide,
  format: "png",
  scale: 1,
});
const after = await presentation.inspect({
  target: { id: anchorIdFromInspect, beforeLines: 2, afterLines: 2 },
  kind: "textbox,shape,image,table,chart",
  maxChars: 3000,
});
const nextProto = presentation.toProto();
```

## Compose-first layout

```tsx
/** @jsxRuntime automatic */

const presentation = Presentation.create();
const slide = presentation.slides.add();

slide.compose(
  <column width="fill" height="fill" gap={16}>
    <paragraph
      name="headline"
      className="text-slate-950 text-3xl leading-tight"
    >
      <run textStyle={{ bold: true }}>Quarterly</run>
      <run> readiness</run>
    </paragraph>
    <rule stroke="#0f172a" width={160} weight={2} />
  </column>,
  {
    frame: { left: 48, top: 40, width: 864, height: 460 },
    baseUnit: 8,
  },
);
```

Use `name` for stable inspect and layout-export targeting. JSX materializing
tags default `width` to `"fill"` when you omit it.

## Core API Sequence

- Create presentations with `Presentation.create({ slideSize })` to control default slide dimensions.
- Add slides with `presentation.slides.add({ layout, layoutId })` or `presentation.slides.insert({ after, ... })`.
- Use `slide.compose(nodeOrJsx, { frame, baseUnit })` for compose-first layouts. JSX lowers into the same compose runtime as the helper-based API.
- Author content with config-first calls: `slide.shapes.add({ geometry, position, fill, line })`, `slide.images.add({ ... })`, `slide.tables.add({ ... })`, and `slide.charts.add(chartType, { ... })`.
- Format whole-shape text with grouped configs such as `shape.text.style = { fontSize, bold, color, alignment }`.
- Edit imported decks with `presentation.inspect({ kind, search, maxChars })`, `presentation.resolve(anchorId)`, and focused facade edits.
- Export previews with `presentation.export({ slide, format, scale })`.
- Export all slides as one PDF with `presentation.export({ format: "pdf" })`.
- Export deck montages for overview review with `presentation.export({ format: "webp", montage: true })`.
- Export layout JSON for placement investigations with `slide.export({ format: "layout" })`.
- Control editor gridlines and imported guides with `presentation.view`.
- Search API help with `presentation.help(query, { search, include, maxChars })`.
- Run high-level edits with `presentation.scripts.run(kind, options)`; see [`references/presentation.spec.md`](./references/presentation.spec.md) for the script surface.

## Output Map

| Output              | API                                                             | Result                                                             |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| All slide previews  | `presentation.render()`                                         | PNG blobs in deck order, named `slide-1.png`, `slide-2.png`, and so on |
| Selected previews   | `presentation.render({ slide: [0, 2] })`                         | PNG blobs for zero-based indexes, in requested order                 |
| Raster preview      | `presentation.render({ slide, format: "png", scale })`          | One raster blob for a `Slide` or a single zero-based index           |
| Slide PNG           | `presentation.export({ slide, format: "png", scale })`          | One preview image for one slide                                    |
| Deck PDF            | `presentation.export({ format: "pdf" })`                        | One PDF `Blob` with one page per slide                             |
| Slide PDF           | `presentation.export({ slide, format: "pdf" })`                 | One PDF `Blob` for one slide                                       |
| Editable PPTX       | `presentation.export({ format: "pptx" })`                       | Editable presentation `Blob`                                       |
| Deck montage        | `presentation.export({ format: "webp", montage: true, scale })` | One overview image containing the deck slides                      |
| Layout JSON         | `slide.export({ format: "layout" })`                            | Structural JSON with bounds, ids, text, names, and object metadata |
| Searchable snapshot | `presentation.inspect({ kind, search, maxChars })`              | NDJSON records for locating and resolving objects                  |
| Runtime handoff     | `presentation.toProto()`                                        | Serializable presentation data for host adapters                   |

## Minimal Patterns

Use these as the first API patterns to reach for:

```ts
// Create, preview, inspect, then serialize.
const presentation = Presentation.create({
  slideSize: { width: 1280, height: 720 },
});
const slide = presentation.slides.add();
const preview = await presentation.export({ slide, format: "png", scale: 1 });
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape,image,chart,table",
  maxChars: 4000,
});
const proto = presentation.toProto();
```

```tsx
// Compose structure with first-principles rows/columns.
slide.compose(
  <row width="fill" height="fill" gap={28}>
    <column width={420} height="fill" gap={16}>
      <paragraph className="text-slate-950 text-5xl font-bold leading-tight">
        Title
      </paragraph>
      <paragraph className="text-slate-600 text-xl leading-relaxed">
        Editable copy in a fixed text column.
      </paragraph>
    </column>
    <box
      width="fill"
      height="fill"
      className="bg-slate-50 rounded-2xl shadow-sm"
    />
  </row>,
  { frame: { left: 56, top: 56, width: 1168, height: 608 }, baseUnit: 8 },
);
```

For 3-column and 12-column layouts, use [`references/cookbook/layout.md`](./references/cookbook/layout.md); keep spans local with `{ mode: "fr", value: 1 }` track objects.

Use `className` only for visual/text tokens such as `bg-*`, `rounded-*`,
`shadow-*`, `text-*`, `font-*`, and `leading-*`. Use layout props for
`width`, `height`, `gap`, `padding`, `align`, and `justify`.

## Reference Map

Open these references as needed:

- [`references/jsx.md`](./references/jsx.md) — compact JSX node surface and layout mechanics.
- [`references/tokens.md`](./references/tokens.md) — Tailwind-like token reference for colors, text, radius, shadows, and `className`.
- [`references/cookbook/layout.md`](./references/cookbook/layout.md) — first-principles layout recipes for rows, columns, 12-column grids, alignment, masks, and overlays.
- [`references/cookbook/imported-deck.md`](./references/cookbook/imported-deck.md) — safe inspect, resolve, edit, preview, and re-inspect loops for existing decks.
- [`references/presentation.spec.md`](./references/presentation.spec.md) — `Presentation` facade, slide collection, view controls, export/toProto, scripts.
- [`references/slide.spec.md`](./references/slide.spec.md) — `Slide` API, backgrounds, placeholders, notes, export, auto-layout.
- [`references/inspect.md`](./references/inspect.md) — grep-first snapshot (`inspect → rg → resolve/edit → re-inspect`) for loaded presentation data and templates.
- [`references/help.md`](./references/help.md) — grep-first API and template lookup (`help → build/edit → inspect`) for presentation JS workflows.
- [`references/layout.spec.md`](./references/layout.spec.md) — layouts, placeholders, and slide layout assignment.
- [`references/master.spec.md`](./references/master.spec.md) — masters, layout linking, background refs, color maps.
- [`references/theme.spec.md`](./references/theme.spec.md) — theme color schemes and hex maps.
- [`references/styles.spec.md`](./references/styles.spec.md) — named text styles and flow through text.
- [`references/rich-text.spec.md`](./references/rich-text.spec.md) — text blocks, ranges, links, list presets.
- [`references/shapes.spec.md`](./references/shapes.spec.md) — shape geometry, custom Bézier curves, fills, strokes, rounded corners, shadows, and z-ordering.
- [`references/connectors.md`](./references/connectors.md) — connected lines, arrows, side anchors, direct connection sites, and rerouting behavior.
- [`references/fill.spec.md`](./references/fill.spec.md) — fill/stroke config shapes and color shorthands, solid, gradient, pattern.
- [`references/images.spec.md`](./references/images.spec.md) — images, cropping, contain/cover framing, prompt placeholders.
- [`references/tables.spec.md`](./references/tables.spec.md) — tables, merges, and cell text.
- [`references/charts.spec.md`](./references/charts.spec.md) — charts, series, axes, legends, mini-chart YAML.
- [`references/comments.md`](./references/comments.md) — comment authors, threads, replies, reactions, and resolving imported review threads.
- [`references/auto-layout.spec.md`](./references/auto-layout.spec.md) — deterministic layout helpers for arranging shapes within frames.
- [`references/speaker-notes.spec.md`](./references/speaker-notes.spec.md) — speaker notes surface and visibility toggles.
