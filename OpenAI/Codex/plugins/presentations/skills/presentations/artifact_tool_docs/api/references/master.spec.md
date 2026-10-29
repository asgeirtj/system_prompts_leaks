# Masters

Masters share theme, background, and color-map structure with child layouts.

## Create And Link

```ts
const master = presentation.masters.add(masterName);
const layout = presentation.layouts.add(layoutName);

layout.setParentLayoutId(master.id);
```

## Color Map And Background

```ts
master.setColorMap(colorMapConfig);
master.background.ref = backgroundRef;

const slide = presentation.slides.add();
slide.setLayout(layout);
```

## Master Inline Types

```ts
type ColorMapConfig = Partial<Record<
  "bg1" | "tx1" | "bg2" | "tx2" | "accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6" | "hlink" | "folHlink",
  "bg1" | "tx1" | "bg2" | "tx2" | "accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6" | "hlink" | "folHlink"
>>;
```

## Resolve

```ts
const resolved = presentation.layouts.getById(master.id);
```

## Cookbook

```ts
// Shared brand master with inherited layout.
const master = presentation.masters.add("Brand Master");
master.setColorMap({ bg1: "bg1", tx1: "tx1", accent1: "accent1" });
master.background.ref = "bg1";

const layout = presentation.layouts.add("Brand Title");
layout.setParentLayoutId(master.id);
layout.placeholders.add({
  type: "title",
  geometry: "textbox",
  position: { left: 72, top: 72, width: 1000, height: 96 },
});
```

Before editing a master in an imported deck, inspect affected layouts and
slides; master edits have intentional global blast radius.
