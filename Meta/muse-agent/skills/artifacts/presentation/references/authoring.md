---
description: How to write each slide's HTML so the deck reads as designed rather than templated.
---

# Slide authoring rulebook

How to write each slide's HTML so the deck reads like a designed presentation, not a
template. You write a self-contained `section.slide` per slide, images embedded as `data:`
URIs, validated by `render_audit.mjs`. Read this together with `design-system.md` (the CSS
tokens + canvas + hero/lockup/layout scaffolds) and `image-directive.md` (art-directing
`media.generate_image`).

When you were handed a `StylePlan`, it already picked the archetype, theme, palette, fonts,
a per-slide layout, and the deck's lockup pair: apply it; do not re-pick colors or fonts.
Without one, apply the design system you set in the workflow with the same discipline.

## Content strategy

- Decide what the slide *says* before how it looks; content drives layout.
- One message per slide. Put that message in the heading as a **claim, not a topic**
  ("Proposal stage is driving growth", not "Pipeline overview"), and let the largest element
  on the slide prove it. If you can't name the one takeaway, the slide isn't ready.
- Titles are short and contain no metrics. Lead with the so-what: text carries the
  interpretation, visuals carry the evidence.
- Give each fact one home. If a chart plots the per-item values, don't also repeat them as
  stat cards, bar labels, and a legend.
- Highlight at most 3 metrics, chosen to build toward the takeaway.
- Let it breathe: cap a content slide at ~5 bullets (1-2 lines each) or 3-4 cards. When
  there's more, cut it or split across slides rather than cramming.
- Use only real, verifiable data from the provided source material; never fabricate figures,
  dates, citations, or source names. Cite a real source at most once, as a small muted note;
  never cite a chart you just generated.

## Simplicity and restraint

- **Strictly prohibited anywhere on a slide:** pills, subtitles, summary lines, eyebrows,
  kickers, badges, chips, tags, captions. Remove them. Do not write CSS for them either: a
  `.kicker` rule you never use, or one that only hides the class, is dead code in every deck.
- Every element must serve the point and must not repeat information. Information reads
  linearly in a logical order.
- The cover carries only the title over its hero image: no subtitle, tagline, date/source
  line, icons, cards, or stat boxes. Save details for the content slides.

## Layout and composition

- Aim for unified, full-canvas layouts, and vary the structure between slides (cover and
  closing are the exceptions). Use typography and spacing to guide attention.
- Build multi-element layouts with **CSS Grid**, giving every cell an explicit `grid-column`
  and `grid-row` so nothing overlaps and nothing relies on auto-placement. Do not use
  `position:absolute` for main containers, and keep containers aligned.
- Keep at least a 16px gap between content blocks and at least 48px between any content and
  every slide edge. No element's bounding box may intersect another's; text never sits over a
  busy part of a photo.
- Fill the canvas by **centering the content as a group** (`align-content:center` on a grid,
  `justify-content:center` on a flex column) so leftover space becomes balanced top/bottom
  margins. Do not inflate cards to fill vertical space, and do not dump the slack into one
  band at the bottom. If a layout is much shorter than 720px, enlarge the image, step up the
  type scale, or use fewer columns.
- Keep prose to **at most two side-by-side columns** (~460px each so lines hold 8-14 words).
  If content seems to need three or more, drop to two, stack full-width rows under the
  heading, or cut. Only short stat lockups (a number + a ~3-word label) belong in three
  columns, never sentences or bullets.
- A numbered, ranked, or sequential list reads as a **left-aligned vertical list** (one item
  per row, number/label at the left, heading left-aligned above). Never lay a ranked sequence
  as a centered block or a 2x2 grid. Reserve centered alignment for a single statement slide
  or the closing slide; never center a multi-item list or a content slide's title.
- If content exceeds the space, **reduce content** (fewer bullets, shorter text) rather than
  shrinking fonts below the hierarchy minimums. Clipping is never acceptable.

## Typography and color

- Content layouts use these sizes: heading `var(--slide-font-display)` 48-64px bold
  `var(--slide-fg)`; body `var(--slide-font-body)` 16-18px, line-height 1.4-1.5; stat number
  `var(--slide-font-display)` 48-72px bold `var(--slide-primary)`; stat label
  `var(--slide-font-body)` 11-13px sentence case. Stat lockups put the number above the label,
  left-aligned, ≥24px between adjacent lockups.
- Two adjacent elements never share a font size; each level is visibly distinct.
- **Sentence case everywhere** (including stat labels). Never use `text-transform:uppercase`
  or `letter-spacing` on any text.
- **Use the CSS variables for all colors and fonts; never hardcode hex or font-family names.**
  `var(--slide-bg)` backgrounds, `var(--slide-fg)` primary text, `var(--slide-primary)` for
  emphasis (titles, key data, borders, icons) used sparingly, `var(--slide-accent)` for
  support, `var(--slide-font-display)` headings, `var(--slide-font-body)` body. For
  semi-transparent overlays use `color-mix` (e.g. `color-mix(in srgb, var(--slide-primary) 20%,
  transparent)`). Keep to 2-3 palette colors per slide. The `:root` block (from the StylePlan)
  defines all theme variables; do not redefine them.
- **In a slide file, a `#` colour or an `rgb(` is a bug.** Two exceptions exist, and nothing
  else. A slide's own `--hero-scrim-color:` is one, sampled from that slide's image. A cover
  title over a photo is the other, and it keeps `#fff` or a fixed dark value against the scrim.
  Everywhere else the colour is `var(--slide-*)`, or
  `color-mix(in srgb, var(--slide-*) N%, transparent)` for a tint. A darker or lighter shade of
  a token is `color-mix(in srgb, var(--slide-fg) 90%, black)`, or the same with `white`. A wash
  laid over an image is a `color-mix` of `var(--slide-bg)` inside the gradient, not an `rgba()`
  of its channels. That covers a `style=` attribute, a slide's own `<style>` block, a gradient
  stop, a shadow and an SVG `fill`. It covers a badge, a border and a status chip, and a set you
  colour-code by level or risk. In `deck.css` a `#` belongs in the one `:root` block, plus the
  `html, body` backdrop and the `var(--hero-scrim-color, #1a1a2e)` fallback. An inverse card
  needs no new colour, because a dark fill with light text is `background:var(--slide-fg)` with
  `color:var(--slide-bg)`. A raw value looks correct today. Then it stays as it is while
  everything around it changes theme.

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
- **Inline SVG takes its colours through CSS, not through attributes.** A presentation
  attribute does not resolve `var()` dependably. So do not write `fill="var(--slide-primary)"`.
  Write `style="fill:var(--slide-primary)"`, or put the rule in `deck.css`. A diagram whose
  `fill` and `stroke` attributes hold hex values keeps those colours through every theme
  change. A diagram is usually the largest coloured thing on its slide.
- Every slide sets an opaque `background` on `section.slide` (the deck's `var(--slide-bg)`, or
  a full-bleed cover image). An unset background shows the page grey and reads as broken. Don't
  give the cover or closing a different flat background color; a different look there comes from
  a full-bleed image or the layout, not from swapping the paper color.
- All readable text meets ≥4.5:1 contrast against whatever sits directly behind it (3:1 for
  text ≥24px or bold ≥19px). **Never create hierarchy or dim text with `opacity` or low-alpha
  `rgba`/`hsla`**: it composites against the background and quietly drops below AA; use
  `var(--slide-muted)`. A bold label and its continuation after a dash/colon are the same body
  tier at full contrast; don't gray the continuation.
- Do not use `padding-bottom` anywhere; use `padding-top` for vertical spacing.

## Images

- By default every deck needs imagery: source a real subject (a logo, product, place, or person)
  with the image-search skill, or generate a concept subject with `media.generate_image`. An
  all-typography deck, or one that fills space with CSS gradients and inline SVG, is a miss unless
  imagery can't be sourced or generated, or the brief asks for a deck with no imagery at all.
  Charts carry the data, images carry the concept. A brief that forbids SYNTHETIC imagery is not
  that case: it removes the generate route, not the source route, so a real subject is still
  sourced with the image-search skill.
- Each major section or concept that can be shown visually gets one image that genuinely
  depicts it. **Do not** drop a decorative image on a pure-number, stat, or statement cell, or
  into a grid cell just to fill it or hit a count (a non-illustrative image is worse than
  empty space). Carry at least 2 illustrative images across the deck, sourced or generated per
  their subject, only where they illustrate content.
- The **cover always carries a hero image**: source it with the image-search skill when its
  subject is a real thing (a company, product, place, or person), otherwise generate it with
  `media.generate_image`. A text-only cover is a bug; a CSS gradient, flat color, or inline SVG
  is not a substitute for a real hero image, except as a documented fallback when the image can't
  be obtained or the deck is intentionally image-free.
- Give images rounded corners (16-24px large, 12px thumbnails), except full-bleed hero and
  split-panel images, which bleed to the edge with no radius (see `design-system.md`).
- A cell-filling image uses `width:100%; height:100%; object-fit:cover` so it fills its cell
  with no blank band. **Never** give such an image a fixed height or `max-height` inside a
  flexible (`1fr` / `height:100%` / `flex:1`) track: a fixed-height child can't fill a
  flexible parent and leaves a white bar. Request each image in its cell's aspect ratio
  (tall for a tall cell, wide for a wide cell). Use `object-fit:contain` (over a
  `var(--slide-bg)` backdrop) only for an image with embedded text or a diagram that must not
  be cropped.
- Embed every image as a `data:` URI before validation, in the slide file that shows it, so each
  slide stands alone. Generate concept imagery with `media.generate_image` per `image-directive.md`
  and source real photos and logos with the image-search skill; place both under `.src/media/`. A deck carries **no** external reference at all, fonts
  included: you name the theme's families in `deck.css`'s `:root` tokens, and
  `embed_deck_fonts.mjs` writes those faces into `deck.css` as `@font-face` rules holding the font
  bytes. Never write a `fonts.googleapis.com` or `fonts.gstatic.com` URL in any file. Images and
  CSS `url(...)` stay `data:` URIs. Never leave any other `http(s)://`, `file://`, or relative
  `.src/media` refs in a slide file.
  Omit an image rather than reuse a mismatched one.
- Hero text legibility: prefer the image in its own panel with text on a separate solid
  `var(--slide-bg)` panel (no scrim needed). When text must sit on a photo, use a bottom
  gradient scrim scoped to the text band (never a full-slide scrim), a frosted-glass card, or
  a text-shadow stack. Never put unstyled text on a photo.
- On a content slide, keep image edges straight or rounded-rect, never cut a text column with a
  diagonal `clip-path`/`skew` edge (an angled edge makes the title read off-center).
  Diagonal-split is a cover-only scaffold (see `design-system.md`).
- Side-by-side panels must not overlap: their widths sum to 100% or less.

## Charts and diagrams

- When a slide plots data, read `/opt/hatch/skills/artifacts/references/charts.md`
  first: it owns where the numbers come from, how to render a chart for a
  deck, and the encoding rules that apply everywhere.
- Never stack a chart or image vertically with its text; pair them side by side.

## Overflow and card sizing

- `section.slide` is `1280px × 720px`, `overflow:hidden`, `box-sizing:border-box`. Overflow is
  **clipped silently**: content past 720px is hidden, not shown. You can't see overflow while
  authoring, so budget content to fit up front and rely on the `render_audit` `overflow` and
  `fill` checks (see `workflow.md` step 8) to catch it.
- Budget before writing: usable height ≈620px (720 minus margins). A slide fits roughly a
  heading + 10-12 body/row lines total; the ~5-bullet / 3-4-card caps are hard ceilings, not
  targets. A text column beside an image spans the full 720px but holds only ~a heading + 3-4
  short lines; an intro paragraph or 4+ rows there overflows.
- Text and data cards **grow to fit their content** (`height:auto` or `min-height`); never
  give a stat card, callout, bento cell, or comparison block a fixed height or a line-clamp,
  and never clip text mid-line.
- For card grids use `align-items:stretch` with auto row tracks (`grid-auto-rows:auto`) so
  every card in a row grows to match the tallest, without cropping. Keep `min-width:0`; don't
  set `min-height:0` on text cards, don't use `align-items:start`, don't use fixed-height or
  `1fr`-of-720px tracks. If the tallest card would exceed 720px, reduce the number of cards or
  shorten the text.
- A **bento** reads as a balanced grid: adjacent cells equal height (`align-items:stretch`), a
  taller feature or image cell may span two rows or a wide one (`grid-column: span 2`), and the
  whole bento is centered (`align-content:center`). A text cell sizes to its content; only an
  image cell fills via `object-fit:cover`.

## Layouts and lockups

- Each slide has an assigned layout class in the StylePlan's `layout_plan` (`cover`,
  `closing`, or one of the eight content layouts, see `design-system.md`). Treat it as the
  default, but let content drive the choice: when a slide is light, prefer a simpler layout
  over a denser grid; don't manufacture cards to fill an assigned grid.
- The **closing** is centered text on one uniform background (a single color or one full-bleed
  image over the whole 720px canvas), never a partial-height panel/band that leaves a two-tone
  strip.
- When a slide combines text and an image, use one of the deck's two assigned **lockup
  patterns** (`StylePlan.lockups`, drawn from L1/L2/L4, see `design-system.md`); fill the
  lockup's image cell edge-to-edge so no band of blank background shows under the image or
  text. Don't invent a new text-and-image arrangement.
