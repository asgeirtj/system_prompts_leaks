# Layouts

Layouts define reusable placeholder structure for slides.

## Create A Layout

```ts
const layout = presentation.layouts.add(layoutName);
layout.placeholders.add({
  type: placeholderType,
  index: placeholderIndex,
  text: placeholderText,
  geometry: "textbox",
});
```

## Placeholder Inline Type

```ts
type PlaceholderConfig = {
  type?:
    | "title"
    | "subtitle"
    | "body"
    | "picture"
    | "chart"
    | "table"
    | "content";
  index?: number;
  text?: TextValue;
  geometry?: "textbox" | "rect" | "roundRect" | string;
  position?: { left?: number; top?: number; width?: number; height?: number };
  fill?: FillConfig;
  line?: LineConfig;
};
```

## Shape-Based Placeholders

```ts
const placeholder = layout.shapes.addPlaceholder(placeholderName);
placeholder.placeholder.type = placeholderType;
placeholder.placeholder.index = placeholderIndex;
placeholder.text = placeholderText;
```

## Use A Layout

```ts
slide.setLayout(layout);

const target = slide.placeholders.getItem(placeholderType);
target.text = textValue;
```

## Discover

```ts
const layoutSummary = layout.placeholders.summary();
const resolved = presentation.layouts.getById(layout.id);
const importedGuides = layout.slideGuides;
const actualPlaceholders = slide.placeholders.items;
const emptyContentPlaceholders = slide.placeholders.editable;
const allVisibleEmptyPlaceholders = slide.placeholders.unfilled;
const missingLayoutSlots = slide.placeholders.availableFromLayout;
```

These getters do not modify saved slide content.
`items` includes filled placeholders. `editable` contains visible empty content
shapes with positive bounds; `unfilled` also includes empty furniture.
`availableFromLayout` contains missing layout slots for explicit creation.
`getAll()` retains layout/master discovery, and `getItem()` creates a local
instance when the requested placeholder exists only in the layout or master.

## Preview And Insert A Layout

```ts
presentation.view.showPlaceholders();
const image = await layout.export({ format: "png", scale: 0.25 });

const { slide } = presentation.slides.insert({
  after: selectedSlide,
  layoutId: layout.id,
});
slide.placeholders.addFromLayout();
slide.placeholders.getItem("title").text = titleText;
```

`addFromLayout()` creates missing content placeholders once and returns the
created shapes. Adding a slide alone leaves placeholder creation to the caller.

## Cookbook

```ts
// Branded title/body layout.
const layout = presentation.layouts.add("Title Body");
layout.placeholders.add({
  type: "title",
  index: 0,
  geometry: "textbox",
  position: { left: 72, top: 64, width: 920, height: 88 },
  text: "Title",
});
layout.placeholders.add({
  type: "body",
  index: 0,
  geometry: "roundRect",
  position: { left: 72, top: 180, width: 760, height: 360 },
  fill: "slate-50",
  line: { style: "solid", fill: "slate-200", width: 1 },
});
```

```ts
// Use placeholders for repeated structure; override slide content locally.
const slide = presentation.slides.add({ layout: "Title Body" });
slide.placeholders.getItem("title").text = "Market overview";
slide.placeholders.getItem("body").text = "Three editable points go here.";
```

## Read A Rendered Slide's Layout

Each `presentation.render()` preview is an image Blob with a `.layout` JSON Blob.  
The paired files use the same stem, for example `slide-1.png` and
`slide-1.layout.json`. A complete render replaces the previous render set;  
a subset render updates only the selected slides' pairs.

```ts
const preview = await presentation.render({ slide: 0 });
const layout = JSON.parse(await preview.layout.text());
const title = layout.elements.find((element) => element.name === "cover-title");
if (title) presentation.resolve(title.id).text = "Updated title";
```

The default `openai.presentation.layout/v5` view is compact and uses pixels and
canonical IDs. Request `slide.export({ format: "layout", detail: "full" })` for
inherited paint layers, paragraph/run formatting, and table-cell details.
Both views use the same IDs and editing coordinates:

| Field                                          | Meaning                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `slide.id`, `slide.index`                      | Canonical slide ID and zero-based deck index.                                              |
| `slide.position`                               | Slide bounds: `{ left, top, width, height }`.                                              |
| `elements[].id`, `kind`, `name`                | Canonical element ID, element kind, and optional authored name.                            |
| `elements[].position`                          | Bounds using the same keys as edit configuration.                                          |
| `elements[].text`, `style`                     | Text and effective text styling, including `style.fontSize`.                               |
| `elements[].crop`, `fit`, `mask`               | Image crop, fitting, and geometry configuration.                                           |
| `elements[].scope`, `editable`                 | Owned slide content is editable; inherited layout/master content is identified separately. |
| `tableCell.tableId`, `cells[].ownedElementIds` | Canonical IDs connecting a table, its cells, and cell-owned elements.                      |
| `inheritedLayers[].id`                         | Canonical `ly/…` ID of a layout or master.                                                 |

Pass IDs from editable records to `presentation.resolve()` or
`presentation.delete()`. In the full view, inherited content has `editable: false`; its IDs identify
where the content came from and are not slide-owned edit targets. Raw PowerPoint
IDs, asset IDs, and paragraph style IDs are not part of this public view.
