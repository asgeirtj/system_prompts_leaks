# Paint, effects and what the canvas actually does

Read this if a slide needs more than color and a card border. It also explains exactly what the canvas does with each style. The formal grammar is in the "Supported CSS" section of `format.md`. This page explains how to use those rules. The canvas does not support stylesheets, classes, hover effects, or keyframes. For motion effects, see the "Motion" section of `format.md`.

## Paint and effects — taste

- A gradient background is a deliberate choice, not a default. Flat, toned backgrounds are the norm. One gradient slide — a statement or cover slide — is plenty.
- `border: 1px solid #e3e6e4` draws a hairline one step off the background. Use it to separate a card on a light slide. On a dark background, use `rgba(255,255,255,.12)` instead. `border-top`, `border-bottom`, `border-left`, and `border-right` draw that same line on only the sides you choose. For example, use `border-top` to draw a line above a card. Use `border-bottom` to draw a line under a header row. Use `border-left` to draw an accent bar down the left side of a quote. Sides may differ in width, never in style or color — for that, use a painted 4px div instead. Boxes that touch (stacked rows, tiles with no gap) share ONE stroke: put `border-top:none` or `border-left:none` after the `border` on each box after the first, or keep the gap — two adjacent strokes read as one double line.
- To make a circle, use `border-radius: 50%` on a square box. This works for avatars, dots, and markers.
- An `<x-icon>` draws its glyph at about half its box: give it at least 32px (48px beside 24px body text), and a colour that stands off what is behind it — a pale yellow icon on a white card disappears. If you want a pale or accent-coloured icon, sit it on a filled chip (a small dark circle or square) instead. The build notes an icon under 32px.
- Shadows are seasoning — use them sparingly. Use one soft shadow with a large blur and low opacity. For example: `0 4px 24px rgba(0,0,0,.06)` on a white card over an off-white slide. Never use dark, hard shadows. Never put shadows on text. Never put shadows on everything.
- `opacity` fades an element and everything inside it.
- A small `rotate(-2deg)` on one polaroid-style photo is playful. On three photos it is just noise. Use `filter: blur(8px) brightness(.9)` on a full-bleed photo behind a statement. Use `backdrop-filter: blur(16px)` on a partly transparent div over an image to make a frosted panel. Use `mix-blend-mode: multiply` on a colored div over a photo to make a duotone effect. Most decks do not need any effects. The good ones use one effect idea consistently.

## Text

For large display text, use a `line-height` between `1.05` and `1.15`. For body text, use `1.3` to `1.45`. For large display text, use a negative `letter-spacing`. For small uppercase "eyebrow" text, use `2px` to `4px` of `letter-spacing` and `text-transform:uppercase`. Keep the `font-weight` within the range that the font supports. You can also emphasize text with `text-decoration:underline` in the accent color. Only use `text-shadow: 0 2px 8px rgba(0,0,0,.4)` for light text on a photo with no scrim. Use `<b>` and `<i>` to emphasize words inside a sentence. Use `<span style="color:…">` to color a phrase. Gradient or image text, when asked for: `background: linear-gradient(…)` (or `url(photo.jpg) center / cover`) with `background-clip: text; -webkit-text-fill-color: transparent` on the heading — keep `color` as its fallback; no box background on that element. If you want a bigger word or a second typeface, put it in a separate block.

## Rendering semantics

These facts help AI assistants understand how the canvas works, without having to guess. The exported slides use the same layout engine as the canvas.

- **Paint order is source order**: There is no `z-index`. Instead, the editor's z-order control changes the order of the HTML elements. All normal (flow) content paints as one layer. That layer sits where the first flow child is in the source. So list pinned backdrops first, before the flow content. If an element has `position:relative`, its pinned children paint on top of its normal content.
- **Nothing scrolls; a squeezed box shrinks its text**: When a slide holds more than fits, its column squeezes its boxes, and each squeezed text box or table in a column (or a pinned text box given a height smaller than its text) shrinks its own text until it fits its box — never below 60% of its size or 8px — and past that clips what still does not fit (like Google Slides' "shrink text on overflow", box by box: neighbouring boxes can land on different sizes, a nested group squeezed hard clips, a one-line title at the floor can lose its descenders). A box in a row or a grid cell is as tall as its row or track and does not shrink its text. Treat a shrunken slide as a mistake to fix by splitting it, not as a feature to lean on. Per element, `data-fit="none"` keeps that element's text at its authored size (it still gets squeezed: text paints past its box, a table clips its cells) and `data-fit="grow"` keeps a column from squeezing its box at all; the default is `data-fit="shrink"`. Content inside a div with `overflow:hidden` clips. Otherwise text that is too long for its box paints outside the box. To estimate heights: one line of text is about equal to `font-size × line-height`. For example, a 96px font with a `line-height` of `1.15` takes about 220px for two lines. A table row at 32px takes about 70px.
- **Inheritance is CSS inheritance**, with one exception:
  - `<body style>` sets default styles for the whole deck.
  - `<section style>` overrides those defaults for one slide.
  - An element's own style overrides for that element only.
  - These properties inherit down to everything inside the element: font family, font style, `line-height`, `letter-spacing`, `color`, `text-align`, and `text-transform`.
  - `font-size` and `font-weight` flow into `<p>` and `<li>`, but never into `<h1>` through `<h3>`. Headings keep their tag defaults until you set them directly.
  - Paint styles — background, border, and shadow — never inherit.
  - Table text uses the table's `font-size`.
- **Flex and grid are real CSS flex and grid**, but only within the vocabulary in the Supported CSS table of `format.md` (one gap size; tracks in px, fr, or auto; cells in source order with `span N` to widen; `flex-wrap` on rows only):

  Default behavior and sizing:
  - `align-items` defaults to `stretch`. Cards in a row will all have the height of the tallest card. Text children in a column span the column's width, so `text-align` works across the full column width.
  - Children are sized to fit their content, unless you use `flex` or `width` to set a different size.
  - `justify-content` only does something if the parent is bigger than its content.
- **Pinned elements measure from the section's padding-box edge**: For example, `left:0` puts an element at the left edge of the slide, not the margin.
- **Table cells wrap**: If a cell's content is too long, the table row gets taller. The cell's content does not get cut off — unless the whole slide is over-full: then the squeezed table shrinks its text to fit and, past the 60% floor, each cell clips what no longer fits; so count wrapped lines and split the slide before that happens. Every cell has rules on all four sides and pads 0.35em 0.6em by default; leave that padding alone on text cells (the web habit `padding:12px 0` puts the text on the column lines; the build notes it). The table's `font-size` sets the size for every cell. Use `<th style="width:30%">` to set the width of a whole column. `text-align` on a cell aligns the text in that whole column.
- **The editor re-saves your file normalized**: It will use the same language and snap values to what the style subset allows. It will use its own whitespace and attribute order. So check differences by what they mean, not by comparing bytes.
