# Images

`slide.images` inserts image elements from local paths, bytes, data URLs, SVG, and prompts.

For embedded image output, use `blob={imageBytes}` with `contentType`. Download remote images
first, then pass their local `path` or embedded `blob` bytes to `add` or `replace`.
HTTP(S) sources are rejected without fetching them.

## Add Image

```ts
const image = slide.images.add({
  blob: imageBytes,
  contentType: "image/png",
  alt: "Product screenshot",
  fit: "cover",
  position: { left: 72, top: 120, width: 520, height: 320 },
  crop: { left: 0.02, top: 0, right: 0.04, bottom: 0 },
  geometry: "roundRect",
  borderRadius: "rounded-2xl",
});
```

## Path Reference And Inline SVG

```ts
const localImage = slide.images.add({
  path: "/absolute/path/to/product.png",
  alt: "Product screenshot from disk",
  fit: "cover",
  position: { left: 72, top: 120, width: 520, height: 320 },
});

const icon = slide.images.add({
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2563eb"/></svg>',
  alt: "Blue status icon",
  position: { left: 620, top: 120, width: 48, height: 48 },
});
```

## Image Inline Types

```ts
type ImageSource =
  | { path: string; prompt?: string }
  | { svg: string; prompt?: string }
  | { blob: ArrayBuffer | Uint8Array; prompt?: string }
  | { dataUrl: string; prompt?: string }
  | { prompt: string };

type ImageAddOptions = ImageSource & {
  alt?: string;
  fit?: "contain" | "cover";
  contentType?: string;
  position?: { left?: number; top?: number; width?: number; height?: number };
  frame?: { left?: number; top?: number; width?: number; height?: number };
  crop?: { left: number | string; top: number | string; right: number | string; bottom: number | string };
  geometry?: string; // common: "rect", "roundRect", "ellipse"; full list is the shape preset list
  borderRadius?: number | string; // number = pixels; string = supported rounded-* token
};
```

`position` and `frame` use the same pixel shape. Use either spelling; prefer
`position` in add calls and `frame` when preserving imported placement.

## Resolved From Inspect

```ts
const image = presentation.resolve("im/c3d4e5f6");
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
  blob: nextBytes,
  contentType: "image/png",
  alt: oldAlt ?? "Updated screenshot",
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

Use `presentation.inspect({ kind: "image", search })` to find the `im/...`
anchor id. Preserve frame, crop, fit, alt text, mask geometry, and border radius
unless the edit explicitly changes them.
Concrete source replacements produce concrete images; pass `prompt` when it
should remain available as regeneration metadata.

## Edit Placement And Fit

```ts
image.position = position;
image.frame = frame;
image.fit = fit;
image.crop = crop;
image.geometry = "roundRect";
image.borderRadius = "rounded-xl";
image.rotation = rotationDeg;
image.flipHorizontal = flipHorizontal;
image.flipVertical = flipVertical;
image.lockAspectRatio = true;
image.width = 320;
image.height = 180;
image.alt = altText;
```

`crop` supplies all four edges. Numbers are normalized `0..1` fractions removed
from the source image; strings accept percentages such as `"10%"` or pixel
insets such as `"24px"` when source dimensions are available. Values are clamped.
`fit="cover"` fills the frame and may crop; `fit="contain"`
preserves the full image. `geometry="ellipse"` or `geometry="roundRect"` clips
the image. `borderRadius` is for rect/roundRect masks; numbers are pixels and
strings use supported `rounded-*` tokens.

## Replace Source

```ts
image.replace({
  blob,
  contentType,
  path,
  svg,
  dataUrl,
  prompt,
  alt,
  fit,
});
```

`replace` swaps the source and common source metadata. Choose one primary source
field as with `add`. Preserve or set placement, crop, mask geometry, and border
radius on the image facade itself.

## Replace And Regenerate Inline Types

```ts
type ImageReplaceOptions = {
  alt?: string;
  fit?: "contain" | "cover";
  contentType?: string;
  path?: string;
  svg?: string;
  blob?: ArrayBuffer | Uint8Array;
  dataUrl?: string;
  prompt?: string;
};

type ImageRegenerateOptions = {
  prompt?: string;
  kind?: "sticker" | "layout" | "content" | "infographic";
  fit?: "contain" | "cover";
  size?: "1024x1024" | "1536x1024" | "1024x1536";
  quality?: "low" | "medium" | "high";
  background?: "auto" | "transparent" | "opaque";
  outputFormat?: "png" | "jpeg" | "webp";
};
```

## Prompt Images

```ts
const promptImage = slide.images.add({
  prompt,
  alt,
  position,
  fit,
});

promptImage.regenerate({ kind });
```

Prompt placeholders are optional. Use concrete sources when asset bytes or
references are already available.

## Concrete Image Sources

```ts
const imageBytes = assetBytes;
const imageUri = assetUri;
const imageDataUrl = assetDataUrl;
```

## JSX Declarative Image

```tsx
/** @jsxRuntime automatic */

slide.compose(
  <row width="fill" height="fill" gap={16}>
    <image
      blob={imageBytes}
      alt="Embedded bytes"
      fit="cover"
      width={320}
      height={180}
    />
    <image
      path={imagePath}
      alt="Local image"
      fit="contain"
      width={320}
      height={180}
    />
  </row>,
  {
    frame: { left: 48, top: 40, width: 864, height: 240 },
    baseUnit: 8,
  },
);
```

## Cookbook

```ts
// Full-frame image crop.
slide.images.add({
  blob: imageBytes,
  contentType: "image/jpeg",
  alt: "Workspace image",
  fit: "cover",
  position: { left: 0, top: 0, width: 1280, height: 720 },
});
```

```ts
// Rounded image mask.
slide.images.add({
  blob: imageBytes,
  contentType: "image/jpeg",
  alt: "Customer interview",
  fit: "cover",
  geometry: "roundRect",
  borderRadius: "rounded-3xl",
  position: { left: 720, top: 96, width: 448, height: 512 },
});
```

```tsx
// Circular avatar mask in JSX.
<image
  blob={avatarBytes}
  contentType="image/png"
  alt="Speaker"
  fit="cover"
  geometry="ellipse"
  width={96}
  height={96}
/>
```

```tsx
// Rounded crop/mask in JSX.
<image
  blob={portraitBytes}
  contentType="image/jpeg"
  alt="Customer portrait"
  fit="cover"
  geometry="roundRect"
  borderRadius="rounded-2xl"
  crop={{ left: 0.08, top: 0.02, right: 0.14, bottom: 0 }}
  width={320}
  height={420}
/>
```

```ts
// Manual crop when the subject is off-center.
image.fit = "cover";
image.crop = { left: 0.08, top: 0.02, right: 0.18, bottom: 0.06 };
```
