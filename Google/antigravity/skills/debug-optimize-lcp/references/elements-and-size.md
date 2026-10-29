# Elements and Size for LCP

## What Elements are Considered?

The types of elements considered for Largest Contentful Paint (LCP) are:

- **`<img>` elements**: The first frame presentation time is used for animated content like GIFs.
- **`<image>` elements** inside an `<svg>` element.
- **`<video>` elements**: The poster image load time or first frame presentation time, whichever is earlier.
- **Background images**: Elements with a background image loaded using `url()`.
- **Block-level elements**: Containing text nodes or other inline-level text element children.

## Heuristics to Exclude Non-Contentful Elements

Chromium-based browsers use heuristics to exclude:

- Elements with **opacity of 0**.
- Elements that **cover the full viewport** (likely background).
- **Placeholder images** or low-entropy images.

## How is an Element's Size Determined?

- **Visible Area**: Typically the size visible within the viewport. Extending outside, clipped, or overflow portions don't count.
- **Image Elements**: Either the visible size or the intrinsic size, whichever is smaller.
- **Text Elements**: The smallest rectangle containing all text nodes.
- **Exclusions**: Margin, padding, and borders are not considered toward the size.
- **Containment**: Every text node belongs to its closest block-level ancestor element.
