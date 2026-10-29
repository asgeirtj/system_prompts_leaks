# Presentation Facade

## Create And Load

```ts
const presentation = Presentation.create({ slideSize });
const loaded = await Presentation.load("input.pptx");
const imported = Presentation.load(proto);
```

## Create Inline Type

```ts
type PresentationCreateOptions = {
  slideSize?: { width: number; height: number };
};
```

## Presentation Slide Collection

```ts
const slide = presentation.slides.add({ layout, layoutId, background: { fill } });
const inserted = presentation.slides.insert({ after, layout, layoutId });
const byIndex = presentation.slides.getItem(slideIndex);
presentation.slides.keep([0, 2, 4]);
presentation.slides.reorder(orderedSlideIds);
```

`keep` accepts an array of zero-based indexes or an array of canonical `sl/` IDs.
It validates the selection against the current slide list, then preserves the
selected slides in their existing relative order. Repeated selections are ignored;
an empty array deletes all slides. `reorder` requires the complete desired order,
with every current slide ID exactly once. Invalid selections fail before mutation.

## Presentation Slide Collection Inline Types

```ts
type SlideAddOptions = {
  layout?: string;
  layoutId?: string;
  width?: number;
  height?: number;
  background?: { fill: FillConfig };
};

type SlideInsertOptions = SlideAddOptions & {
  after?: Slide | number | null;
};

interface SlideCollection {
  keep(selection: readonly number[] | readonly string[]): void;
  reorder(ids: readonly string[]): void;
}

interface Presentation {
  delete(ids: string | readonly string[]): void;
}
```

## Discover And Edit

```ts
const snapshot = await presentation.inspect({
  kind,
  search,
  limit,
  offset,
});

const target = presentation.resolve(anchorId);
const targets = presentation.resolve(anchorIds);
presentation.delete(anchorIds);
```

`delete` accepts one canonical ID or an array. It supports slides (`sl/`) and owned
shapes, images, charts, tables, and embedded artifacts (`sh/`, `im/`, `ch/`, `tb/`,
`ea/`). All IDs are validated first. Repeated IDs are ignored; selecting a slide
and its children deletes the slide once. Inherited elements, notes, text ranges,
and the presentation itself are not delete targets.

`inspect` returns stable anchor ids for slides, shapes, images, tables, charts, text ranges, speaker notes, and comment threads. `resolve` maps one anchor id to its facade, or an array of ids to facades in the same order. Layout records expose canonical `ly/...` IDs with `editable: false` for search and comparison; pass only `pr/`, `sl/`, `sh/`, `im/`, `tb/`, `ch/`, `nt/`, `th/`, and `tr/` anchors to `resolve`.

## Inspect

Use `presentation.inspect({ select, include, fileName })` with JSONPath over the
public presentation tree. `include` is an exact array of typed fields, including
nested paths such as `elements.text`. The query writes all selected records to
NDJSON in the session output directory; ordinary printing shows the count and
file metadata. See [Inspect](./inspect.md) and the
[inspection JSON Schema](./inspect.schema.json) for content and layout queries.

## Help

```ts
const help = presentation.help(query, {
  search,
  include,
  maxChars,
});
```

## Help Inline Type

```ts
type PresentationHelpOptions = {
  search?: string;
  include?: string[]; // common: ["index", "examples", "notes"]
  maxChars?: number;
};
```

## Presentation View

```ts
presentation.view.showGridlines();
presentation.view.showGuides();
presentation.view.showPlaceholders();

const gridlinesVisible = presentation.view.gridlinesVisible;
const guidesVisible = presentation.view.guidesVisible;
const placeholdersVisible = presentation.view.placeholdersVisible;
const horizontalGridSpacingEmu = presentation.view.gridSpacingCxEmu;
const verticalGridSpacingEmu = presentation.view.gridSpacingCyEmu;

presentation.view.hideGridlines();
presentation.view.hideGuides();
presentation.view.hidePlaceholders();

const nextGridlineState = presentation.view.toggleGridlines();
const nextGuideState = presentation.view.toggleGuides();
const nextPlaceholderState = presentation.view.togglePlaceholders();
```

## Render And Export

```ts
const overview = await presentation.render({ montage: true, fileName: "overview.png" });
const selectedPreviews = await presentation.render({ slide: [0, 2] }); // PNG/layout pairs
const allPreviews = await presentation.render(); // pairs in deck order
const firstPreview = await presentation.render({ slide: 0 }); // one image Blob with .layout
const pptxBlob = await presentation.export({ format: "pptx", fileName: "presentation.pptx" });
const deckPdfBlob = await presentation.export({ format: "pdf" });
const slidePdfBlob = await presentation.export({ slide, format: "pdf" });
const layoutBlob = await slide.export({ format: "layout" });
const proto = presentation.toProto();
```

### Montage overview

`render({ montage: true })` includes every slide in deck order, regardless of
which slide is active. It returns one image Blob without per-slide layout files.
The default format is PNG and the default filename is `presentation-montage.png`.
A custom `fileName` names the overview. In an Artifact Session, it is published
as one render output under the session output directory.

Read the montage and content inspection first, then render selected slides for
full-size PNGs and companion layout JSON files. A montage cannot combine with
`slide`; use a separate selected render for detailed text and layout review.

Pass a montage options object to configure the grid. Dimensions are pixels before
`scale`. Defaults are 320 pixels per slide, 16 pixels of padding and gap, and
`ceil(sqrt(slideCount))` columns. Slides retain their aspect ratios; each row uses
its tallest slide's height. `montage.width` sets the total width and overrides
`slideWidth`. `montage.format` overrides the outer raster format. Widths and scale
must be positive and finite, columns must be a positive integer, and padding and
gap must be nonnegative and finite. Montages support PNG, JPEG, and WebP.

### Individual slide previews

Without a montage, `render()` defaults to every slide. An omitted `slide` or an
index array returns an array of image Blobs; a single index or `Slide` returns one
image Blob. Selected arrays preserve their requested order. Default output names
use the actual slide number, such as `slide-1.png` and `slide-3.png` for
`slide: [0, 2]`. A custom `fileName` requires a single selected slide.

Each returned image Blob has a `.layout` JSON Blob containing the same slide's
layout view. Session outputs publish both files as render outputs with matching
stems, such as `slide-1.png` and `slide-1.layout.json`. Full-deck renders replace
both parts of the previous render set; subset renders update only the selected
pairs. Rendering a montage does not replace that per-slide set. See
[the layout reference](layout.spec.md#read-a-rendered-slides-layout) for the schema.
An empty deck or empty selection returns `[]` for individual slide rendering.

Use `export({ format: "pptx" })` for the editable deliverable. Existing raster
and montage `export` options remain supported; raster `export` without a montage
retains its single-active-slide default.

Use `export({ format: "pdf" })` for one PDF containing every slide in deck order,
or pass `slide` to export one slide as PDF.

## Render And Export Inline Types

```ts
type PresentationMontageOptions = {
  format?: "png" | "jpeg" | "webp";
  width?: number;
  slideWidth?: number;
  padding?: number;
  gap?: number;
  background?: string;
  columns?: number;
};

type PresentationExportOptions = {
  fileName?: string;
  slide?: Slide;
  format?: "png" | "jpeg" | "webp" | "pdf" | "layout" | "pptx";
  width?: number;
  height?: number;
  scale?: number;
  quality?: number;
  montage?: boolean | PresentationMontageOptions;
};

type PresentationRenderOptions = Omit<
  PresentationExportOptions,
  "format" | "slide"
> & {
  format?: "png" | "jpeg" | "webp";
  slide?: Slide | number | number[];
};

type PresentationRenderResult = Blob & { layout: Blob };

interface Presentation {
  render(options: PresentationRenderOptions & { montage: true | PresentationMontageOptions; slide?: never }): Promise<Blob>;
  render(options: PresentationRenderOptions & { montage?: false; slide: Slide | number }): Promise<PresentationRenderResult>;
  render(options?: PresentationRenderOptions & { montage?: false; slide?: number[] }): Promise<PresentationRenderResult[]>;
}
```

## Scripts

```ts
const result = presentation.scripts.run(scriptKind, scriptOptions);
```

Scripts provide high-level authoring recipes. Use `presentation.help(...)` to discover available script keys and option shapes.

## Cookbook

```ts
// New deck skeleton: create, set theme, add slides, render checks.
const presentation = Presentation.create({
  slideSize: { width: 1280, height: 720 },
});
presentation.theme.colorScheme = {
  name: "Clean Product",
  themeColors: {
    accent1: "#2563eb",
    accent2: "#0f766e",
    accent3: "#f59e0b",
    accent4: "#dc2626",
    accent5: "#7c3aed",
    accent6: "#16a34a",
    bg1: "#ffffff",
    bg2: "#f8fafc",
    tx1: "#0f172a",
    tx2: "#475569",
    dk1: "#000000",
    dk2: "#1e293b",
    lt1: "#ffffff",
    lt2: "#e2e8f0",
    hlink: "#2563eb",
    folHlink: "#7c3aed",
  },
};

const first = presentation.slides.add();
const second = presentation.slides.add();
const third = presentation.slides.add();

await presentation.render({
  slide: first,
  scale: 1,
});
const snapshot = await presentation.inspect({
  kind: "deck,slide,textbox,chart,table",
  limit: 20,
});
```

```ts
// Existing deck: inspect first, then resolve exact anchors.
const before = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,thread,layout",
  search: "Customer growth",
  limit: 20,
});
const target = presentation.resolve(anchorIdFromBefore);
```
