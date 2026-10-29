# Imported Deck Cookbook

Use these recipes when editing an existing presentation. The goal is targeted,
type-aware edits with a preview and a small verification snapshot.

For imported decks, render the affected slide before and after focused edits,
export layout JSON before and after when object placement matters, and use a
deck montage before/after when a change may affect multiple slides.

## Load A PPTX

```ts
const presentation = await Presentation.load("input.pptx");
```

## Edit Loop

```ts
const before = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,thread,layout",
  search: "Revenue",
  maxChars: 8000,
});

// Pick an exact anchor id from `before`; use inspect ids instead of slide indexes.
const target = presentation.resolve(anchorId);

// slideAnchorId is the `sl/...` id from inspect for the affected slide.
const slide = presentation.resolve(slideAnchorId);
const previewBefore = await slide.export({ format: "png", scale: 2 });
const layoutBefore = await slide.export({ format: "layout" });
const montageBefore = await presentation.export({
  format: "webp",
  montage: true,
  scale: 1,
});

target.text.replace("Revenue", "Revenue outlook");

const previewAfter = await slide.export({ format: "png", scale: 2 });
const layoutAfter = await slide.export({ format: "layout" });
const montageAfter = await presentation.export({
  format: "webp",
  montage: true,
  scale: 1,
});

const after = await presentation.inspect({
  target: { id: anchorId, beforeLines: 2, afterLines: 2 },
  kind: "textbox,shape",
  maxChars: 2000,
});
```

## Placeholder Edit

```ts
const layoutSnapshot = await presentation.inspect({
  kind: "slide,layout,textbox,shape",
  search: "Click to add title",
  maxChars: 6000,
});

// slideAnchorId is the `sl/...` id from inspect for this slide.
const slide = presentation.resolve(slideAnchorId);
const title = slide.placeholders.getItem("title");
title.text = "Updated executive summary";
```

Edit a slide placeholder for a local content change. Edit a layout or master
only when the intended change is global.
Inspect records use 1-based `slide` numbers for display; `slides.getItem(index)`
is 0-based. Prefer resolving the `sl/...` anchor from inspect.

## Master/Layout Blast Radius

```ts
// layoutId comes from inspect/layout export metadata; use it for search and comparison.
const affected = await presentation.inspect({
  kind: "slide,layout",
  search: layoutId,
  maxChars: 6000,
});
```

Inspect affected layouts and slides before changing a master, layout, theme
color, or placeholder geometry. Use layout ids for comparison/search, then
resolve affected slides through their `sl/...` ids before editing. These edits
can update many slides.

## Preserve Imported Image Placement

```ts
const image = presentation.resolve(imageAnchorId);
const oldFrame = image.frame;
const oldCrop = image.crop;
const oldFit = image.fit;
const oldAlt = image.alt;
const oldPrompt = image.prompt;
const oldGeometry = image.geometry;
const oldBorderRadius = image.borderRadius;
const oldRotation = image.rotation;
const oldFlipHorizontal = image.flipHorizontal;
const oldFlipVertical = image.flipVertical;
const oldLockAspectRatio = image.lockAspectRatio;

image.replace({
  blob: replacementBytes,
  contentType: "image/png",
  alt: oldAlt ?? "Updated product screenshot",
  ...(oldFit ? { fit: oldFit } : {}),
  ...(oldPrompt ? { prompt: oldPrompt } : {}),
});
image.frame = oldFrame;
image.crop = oldCrop;
image.geometry = oldGeometry;
image.borderRadius = oldBorderRadius;
image.rotation = oldRotation;
image.flipHorizontal = oldFlipHorizontal;
image.flipVertical = oldFlipVertical;
image.lockAspectRatio = oldLockAspectRatio;
```

Render the slide after replacement and verify subject crop, aspect ratio,
rounded mask, and legibility. Preserve placement-affecting properties unless the
edit explicitly changes them. Concrete source replacements produce concrete
images; pass `prompt` when it should remain available as regeneration metadata.

## Existing Table And Chart Edits

```ts
const table = presentation.resolve(tableAnchorId);
table.cells.set(1, 2, "$4.2M");
table.getCell(1, 2).text.style = "Body Small";

const chart = presentation.resolve(chartAnchorId);
chart.xAxis = { title: "Quarter" };
chart.yAxis = { numberFormatCode: "$#,##0M" };
chart.series.getItemAt(0).values = [3.1, 3.7, 4.2, 4.8];

await presentation.inspect({
  kind: "table,chart",
  target: { id: chartAnchorId, beforeLines: 3, afterLines: 3 },
  maxChars: 3000,
});
```

If an imported chart or table resolves as an image, preserve it as an image or
rebuild it as a native chart/table intentionally.

## Comments And Speaker Notes

```ts
const review = await presentation.inspect({
  kind: "thread,notes,slide,textbox",
  search: "TODO",
  maxChars: 8000,
});

const self = presentation.comments.setSelf({
  displayName: "Presentation Editor",
  initials: "PE",
  email: "presentation@example.com",
});

const thread = presentation.resolve(commentThreadAnchorId);
thread.addReply("Addressed in this revision.", { author: self });
thread.resolve(self);

const notes = presentation.resolve(notesAnchorId);
const existing = notes.text.trim();
notes.text = [
  existing,
  "Opening: summarize the revised revenue outlook.",
  "Call out risk on enterprise timing.",
].filter(Boolean).join("\n");
notes.setVisible(true);

const verified = await presentation.inspect({
  kind: "thread,notes",
  target: { id: slideAnchorId, beforeLines: 1, afterLines: 4 },
  maxChars: 3000,
});
```

Keep unrelated threads and speaker notes intact unless the task explicitly asks
to clear them.
