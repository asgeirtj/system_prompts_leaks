---
description: Write clear, readable slides using the deck's shared theme and layouts.
---

# Author the slides

- Write one self-contained `section.slide` per file, with images embedded as `data:` URIs. Read [the design system](design-system.md) for the CSS variables, canvas and layout scaffolds, and [image direction](image-directive.md) for visuals.

- The StylePlan you were handed already picked the archetype, theme, palette, fonts, a layout for each slide and the deck's lockup pair. Apply it and never re-pick colors or fonts.

## Give each slide one message

- Decide what the slide says before how it looks. Content drives the layout.

- Put the slide's one message in the heading as a claim, not a topic: "Proposal stage is driving growth", not "Pipeline overview". Let the largest element on the slide prove it. If you cannot name the takeaway, the slide is not ready.

- Keep titles short and free of metrics. Text carries the interpretation and visuals carry the evidence.

- Give each fact one home. A chart that plots the values does not also need them as stat cards, bar labels and a legend.

- Highlight at most three metrics, chosen to build toward the takeaway.

- Let the slide breathe. A content slide holds about five bullets of one or two lines each, or three to four cards. Treat those as ceilings, not targets, and cut or split across slides when there is more.

- Use only real, verifiable data from the source material. Never invent figures, dates, citations or source names. Cite a real source at most once, as a small muted note, and never cite a chart you generated.

## Keep slides restrained

- The format guide bans slide furniture. Do not write CSS for it either: an unused `.kicker` rule, or one that only hides the class, is dead code in every deck.

- Make every element serve the point without repeating information, in an order that reads linearly.

- The cover carries only the title over its hero image: no subtitle, tagline, date or source line, icons, cards or stat boxes. Save details for the content slides.

- A required source note on a content slide is information, not a decorative label.

## Lay out the canvas

- Aim for unified, full-canvas layouts and vary the structure from slide to slide, except the cover and closing. Use typography and spacing to guide attention.

- Build multi-element layouts with CSS Grid and give every cell an explicit `grid-column` and `grid-row`, so nothing overlaps and nothing depends on auto-placement. Never use `position: absolute` for main containers, and keep containers aligned.

- Keep at least 16 pixels between content blocks and at least 48 pixels between any content and every slide edge. No element's bounding box may intersect another's, and text never sits over a busy part of a photo.

- Fill the canvas by centering the content as a group, with `align-content: center` on a grid or `justify-content: center` on a flex column, so spare space becomes balanced top and bottom margins. Do not inflate cards to fill height or leave all the slack in one band at the bottom.

- When a layout is much shorter than 720 pixels, enlarge the image, step up the type scale or use fewer columns.

- Keep prose to at most two side-by-side columns of about 460 pixels each, so lines hold 8 to 14 words. If content seems to need three, drop to two, stack full-width rows under the heading or cut. Only short stat lockups, a number with a label of about three words, belong in three columns.

- Lay a numbered, ranked or sequential list out as a left-aligned vertical list: one item per row, the number or label on the left, the heading left-aligned above. Never lay a ranked sequence out as a centered block or a two-by-two grid.

- Reserve centered alignment for a single statement slide or the closing slide. Never center a multi-item list or a content slide's title.

- Treat the slide's assigned layout as the default and let the content decide. A light slide takes a simpler layout instead of manufactured cards in a denser grid.

- The closing slide is centered text on one uniform background, a single color or one full-bleed image over the whole canvas. Never use a partial-height band that leaves a two-tone strip.

- When a slide combines text and an image, use one of the deck's two assigned lockups from `StylePlan.lockups` and fill its image cell edge to edge. Never invent a new text-and-image arrangement.

- Pair a chart or image with its text side by side, never stacked vertically.

- Side-by-side panels must not overlap, so their widths sum to 100% or less.

## Set type and color

- Use these content sizes:
  - Heading in `var(--slide-font-display)`, 48 to 64 pixels, bold, `var(--slide-fg)`.
  - Body in `var(--slide-font-body)`, 16 to 18 pixels, line height 1.4 to 1.5.
  - Stat number in `var(--slide-font-display)`, 48 to 72 pixels, bold, `var(--slide-primary)`.
  - Stat label in `var(--slide-font-body)`, 11 to 13 pixels, sentence case.

- Put a stat number above its label, left-aligned, with at least 24 pixels between adjacent lockups.

- Never shrink text to fit. Body, bullet and card text never drop below 14 pixels, and only short stat labels sit at 11 to 13 pixels. When content does not fit, cut it or split it across slides rather than shrinking text or tightening spacing.

- Never give two adjacent elements the same font size. Each level must look distinct.

- Use the CSS variables for every color and font, never a hardcoded hex or font-family name:
  - `var(--slide-bg)` for backgrounds and `var(--slide-fg)` for primary text.
  - `var(--slide-primary)` for emphasis such as titles, key data, borders and icons, used sparingly.
  - `var(--slide-accent)` for supporting elements.
  - `var(--slide-font-display)` for headings and `var(--slide-font-body)` for body text.

- Make semi-transparent overlays with `color-mix`, for example `color-mix(in srgb, var(--slide-primary) 20%, transparent)`. Keep to two or three palette colors per slide. The `:root` block from the StylePlan defines every theme variable, so never redefine them.

- In a slide file, a `#` color or an `rgb(` is a bug, with two exceptions. A slide's own `--hero-scrim-color`, sampled from its image, is one. A cover title over a photo, which keeps `#fff` or a fixed dark value against the scrim, is the other.

- Everywhere else, a color is `var(--slide-*)`, or `color-mix(in srgb, var(--slide-*) N%, transparent)` for a tint:
  - A darker or lighter shade of a token is `color-mix(in srgb, var(--slide-fg) 90%, black)`, or the same with `white`.
  - A wash over an image is a `color-mix` of `var(--slide-bg)` inside the gradient, not an `rgba()` of its channels.
  - An inverse card needs no new color: `background: var(--slide-fg)` with `color: var(--slide-bg)`.

- The rule covers `style=` attributes, a slide's own `<style>` block, gradient stops, shadows and SVG `fill`, and it covers badges, borders, status chips and any set colored by level or risk. A raw value looks right today and then stays unchanged while everything around it changes theme.

- In `deck.css`, a `#` belongs only in the one `:root` block, the `html, body` backdrop and the `var(--hero-scrim-color, #1a1a2e)` fallback.

```html
<!-- wrong: every one of these survives a theme change unchanged -->
<strong style="color:#008694">                                        <!-- copied token -->
<div style="border:1px solid rgba(0,134,148,0.12)">                    <!-- token as rgba channels -->
<div style="background:#FAF7F2">                                       <!-- the paper colour, written out -->
<div style="background:color-mix(in srgb, #11181F 70%, transparent)">  <!-- copied inside a function -->

<!-- right -->
<strong style="color:var(--slide-primary)">
<div style="border:1px solid color-mix(in srgb, var(--slide-primary) 12%, transparent)">
<div style="background:var(--slide-bg)">
```

- Give inline SVG its colors through CSS, not attributes, because a presentation attribute does not resolve `var()` dependably. Write `style="fill:var(--slide-primary)"` or a rule in `deck.css`, never `fill="var(--slide-primary)"`. A diagram whose `fill` and `stroke` attributes hold hex values keeps those colors through every theme change, and a diagram is often the largest colored thing on its slide.

- Give every `section.slide` an opaque background, the deck's `var(--slide-bg)` or a full-bleed cover image. An unset background shows the page gray and reads as broken.

- Do not give the cover or closing a different flat color. A different look there comes from an image or the layout.

- Give all readable text at least 4.5:1 contrast against whatever sits directly behind it, or 3:1 for text of at least 24 pixels or bold text of at least 19 pixels.

- Never create hierarchy or dim text with `opacity` or a low-alpha `rgba` or `hsla`. It composites against the background and quietly drops below the contrast floor, so use `var(--slide-muted)`. A bold label and its continuation after a dash or colon are the same body tier at full contrast.

- Never use `padding-bottom`. Use `padding-top` for vertical spacing.

## Use images for the content

- By default every deck needs imagery. Source a real subject, such as a logo, product, place or person, through the [Image Search skill](/opt/muse/skills/image-search/SKILL.md), and generate a concept with `media.generate_image` following [image direction](image-directive.md).

- An all-typography deck, or one that fills space with CSS gradients and inline SVG, misses the brief unless imagery cannot be obtained or the brief asks for no imagery at all. Charts carry the data and images carry the concept.

- A brief that forbids synthetic imagery removes only the generate route. Still source a real subject.

- Give each major section or concept that can be shown one image that genuinely depicts it, and carry at least two illustrative images across the deck where they illustrate content.

- Never drop a decorative image on a number, stat or statement cell, or into a grid cell just to fill it or reach a count. A non-illustrative image is worse than empty space.

- The cover always carries a hero image, sourced when its subject is real and generated otherwise. A text-only cover is a bug. A CSS gradient, flat color or inline SVG is not a substitute, except as the documented fallback in step 6 of the [build workflow](workflow.md).

- Round image corners at 16 to 24 pixels for large images and 12 pixels for thumbnails. Full-bleed hero and split-panel images bleed to the edge with no radius.

- Make a cell-filling image `width: 100%; height: 100%; object-fit: cover` so no blank band shows. Never give it a fixed height or `max-height` inside a flexible track (`1fr`, `height: 100%` or `flex: 1`), which leaves a white bar.

- Request each image in its cell's aspect ratio, tall for a tall cell and wide for a wide one. Use `object-fit: contain` over a `var(--slide-bg)` backdrop only for an image with embedded text or a diagram that must not be cropped.

- Embed every image as a `data:` URI in the slide file that shows it, so each slide stands alone. Keep source assets in `.src/media/`.

- A deck carries no external reference at all, fonts included. Name the theme's families in the `:root` tokens of `deck.css`, and `embed_deck_fonts.mjs` writes those faces into `deck.css` as `@font-face` rules holding the font bytes. Never write a `fonts.googleapis.com` or `fonts.gstatic.com` URL, or leave any other `http(s)://`, `file://` or relative `.src/media` reference, in a slide file.

- For hero text, prefer the image in its own panel with the text on a separate solid `var(--slide-bg)` panel, which needs no scrim. When text must sit on a photo, use a bottom gradient scrim scoped to the text band (never a full-slide scrim), a frosted-glass card or a text-shadow stack.

- Keep image edges on a content slide straight or rounded. Never cut a text column with a diagonal `clip-path` or `skew` edge, which makes the title read off-center. The diagonal split is a cover-only scaffold.

## Keep charts factual

- Read the shared [chart guide](/opt/muse/assets/artifacts/references/charts.md) before plotting. Charts and diagrams must explain real relationships or values, and image generation cannot supply chart data.

## Fit the content before rendering

- `section.slide` is 1280 by 720 pixels with `overflow: hidden` and `box-sizing: border-box`. Content past 720 pixels is clipped silently and you cannot see it while authoring, so budget content to fit up front. The `overflow` and `fill` checks in step 8 of the workflow catch what slips through.

- About 620 vertical pixels remain after margins. A slide fits roughly a heading and 10 to 12 body or row lines in total. A text column beside an image holds only a heading and three or four short lines, so an intro paragraph or four rows there overflows.

- Let text and data cards grow to fit their content with `height: auto` or `min-height`. Never give a stat card, callout, bento cell or comparison block a fixed height or a line clamp, and never clip text mid-line.

- For card grids, use `align-items: stretch` with auto row tracks (`grid-auto-rows: auto`), so every card in a row grows to match the tallest without cropping. Keep `min-width: 0`. Do not set `min-height: 0` on text cards, use `align-items: start`, or use fixed-height tracks or `1fr` fractions of the 720-pixel canvas.

- If the tallest card would exceed 720 pixels, reduce the number of cards or shorten the text.

- A bento reads as a balanced grid. Adjacent cells share a height through `align-items: stretch`, a taller feature or image cell may span two rows or a wide one (`grid-column: span 2`), and the whole bento is centered with `align-content: center`. A text cell sizes to its content, and only an image cell fills with `object-fit: cover`.

- Fix overflow by reducing content, never by shrinking type below its readable size.
