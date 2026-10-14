# Layout — how slides, flow and pinning compose

SKILL.md shows the common slide. Read this page when a layout needs more than a column of blocks and a card row. This page explains:

- The flow-vs-pin model
- The flex and grid idioms
- How to put labels over an image
- The few things the editor does with structure that affect how you should write the HTML

The page format.md lists the exact CSS properties you can use.

## Two ways to place anything

A `<section>` is a 1920×1080 canvas. Its style controls both its background (the "paint") and its layout.

- `padding` is the slide margin. 128px is the standard margin.
- `display:flex; flex-direction:column; gap` stacks the child elements from top to bottom with space between them.
- `justify-content:center` centers the child elements vertically.
- `justify-content:flex-end` sinks the child elements to the bottom.

A section with no `display` style is a plain column with no gap.

There are two ways to place child elements inside a `<section>`:

- **Flow**: Flow children sit one after another in the section's layout. They are sized to fit their content unless you give them a `width`, `height`, or `flex` style. Open space appears wherever the flow leaves it. Open space LOW on a slide is correct. Do not reach for `justify-content:center` on every slide.

- **Pinned**: Pinned children have `position:absolute`. They leave the flow and sit where their `left`, `right`, `top`, and `bottom` styles say, relative to the section. Give them a `width` (text needs one to wrap), or pin both sides. Use pinned children only for the things flow cannot do:
  - A source line at the bottom edge
  - A badge over a corner
  - A full-bleed photo behind everything, with `position:absolute; left:0; top:0; width:1920px; height:1080px; object-fit:cover`, listed first in the HTML so the other elements paint over it
  - A magic-move element

Put everything else in the flow.

The order of elements in the HTML source is the order they paint. There is no `z-index`. List pinned backdrops first in the HTML. Inside a `position:relative` host, pinned children always paint over its flow content. The page format.md explains this in the "Slide" section.

## Flex idioms

- **Card row**: Use `<div style="display:flex; gap:32px">` with `flex:1` on the children. This makes equal columns. The default `align-items:stretch` makes every card as tall as the tallest card. A card is a `<div>` with `display:flex; flex-direction:column; gap:12px` plus its paint (background, border, radius, and padding).
- **Two columns, unequal**: Use `flex:2` and `flex:1`, or set `width:800px` on one and `flex:1` on the other.
- **Push apart**: Put an empty `<div style="flex:1"></div>` between siblings, or use `justify-content:space-between` on the parent.
- **Bottom-anchored block**: Set `display:flex; flex-direction:column` on the section. There is no `margin` property. To make space above the block, put an empty `flex:1` spacer above it.
- **Centered block**, for a one-off slide (a statement, a quote, a closing line): `justify-content:center` on the section's column puts the block in the middle of the height; without it a short column hangs from the top, which is what a slide with a heading wants (next idiom).
- **A run of slides with one layout** (the content slides of a deck; one slide per region, per step, per option): the heading sits at the top margin on every one, at the same height, so it stays put when the viewer flips from slide to slide. Leave the section's column top-aligned — no `justify-content:center` — and spread or anchor the BODY below the heading instead: `justify-content:space-between`, or a `flex:1` spacer above the block you want low. Centering the whole column makes the heading's height depend on how much the slide holds, so it hops 20–60px between neighbouring slides — a common flaw in generated decks. A slide of a different kind in the run (a centered statement, quote or closing line with no heading above its body) is free to differ. See the content slides of `samples/data-deck.html`: every `<h2>` lands at the same height.
- **Align a row's items**: Use `align-items:center` to center vertically in a row, `baseline` to line up text of different sizes on one line, or `flex-end`.
- **Big number + caption**: Use a column with gap 8. Set the number to 160–200px with `line-height:1`. Set the caption to 28–32px in the softened tone.
- **Bar chart, and a row of small bar charts**: every bar stands on ONE baseline. Give the bars a track of fixed height and bottom-align inside it — `<div style="height:360px; display:flex; align-items:flex-end; gap:12px">` holding the bar `<div>`s (each bar's `height` is its value × one scale for the whole slide) — and put the value above each bar, the category label and any note BELOW the track. When a slide has several groups side by side (plan vs actual per department, one mini-chart per region), every group uses the same track height and the same scale, so all the bars on the slide share one floor and the labels sit on one line under it. Never build a group as a top-aligned column with the bars first: short bars then hang from the top, float at different heights, and the labels land raggedly. A waterfall (bridge) chart is the one exception — its middle bars float on purpose, each starting where the previous one ended; its first and last bars still stand on the floor. See the "Monthly active accounts" slide in `samples/data-deck.html`.
- **Tree / linear flowchart**: Use flow for a straight chain or a small tree (at most two levels, four leaves); pin anything bigger, a bracket, or lines that join or cross. The page reference/diagrams.md has both idioms.
- **Widths**: Make every column, card, pill, and legend item at least as wide as its longest word. If not, the word breaks in the middle. The rule, the numbers, and the wrap opt-ins are in format.md in the "Text" section.

A `<div>` is invisible unless it has background, border or box-shadow. So you can group freely. A plain grouping `<div>` costs nothing visually. Fifteen `<div>` levels is the build cap (an empty, unpainted `<div>`, such as a `flex:1` spacer, does not count). Past three levels, the slide wants splitting. Revising a deck you do not know was made from the type, keep to 5: its page keeps the editor it was published with, and one from before the cap rose from 5 locks a deeper slide that `validate-content.ts` passes.

## Grid idioms

Use `display:grid; grid-template-columns:repeat(3, 1fr); gap:32px`. This fills children into cells in row-major order. Use `grid-column:span 2` to widen one cell.

That is the whole grid vocabulary. You can see the supported CSS in format.md in the "Supported CSS" section: tracks of `px`, `fr`, `auto`, or `repeat(N, …)`, and one `gap`. No `minmax()`, `auto-fill`, named areas, or line numbers.

Use grid for KPI tiles, photo grids, feature matrices, and anything a flex row cannot keep square. Add `aspect-ratio:1` (or `4/3`) to the tiles. Row heights follow the content unless you set `grid-template-rows`. A table is usually better than a grid of text cells when the content is tabular.

**A matrix is ONE grid, not many columns.** Three columns — each holding a chip, a blurb, and a card — look like three column stacks. But they are one grid: `display:grid; grid-template-columns:repeat(3,1fr)`. The nine children go in row-major order: chip, chip, chip, blurb, blurb, blurb, and so on. Grid rows line up across the columns. Separate stacks drift apart as their content heights differ. Parallel content — like a bilingual table or a before/after pair — shares rows the same way: use one table with both languages as column groups (or one flex row per row). Add a `gap` or a divider between side-by-side tables so their rules don't read as one.

## Footer band

A footer — a page number, a source line, a logo — is ONE pinned 24px row (text, or a logo no taller) at `bottom:64px`, in the same spot on every slide that has one. It sits at y ≈ 982–1016, nearer the edge than content ever does. Backdrops aside, it is the one pinned element allowed past the 952 line. Nothing else enters its band: give that slide `padding:128px 128px 160px` so flow stops at y 920 (a 792px budget, not 824), and keep pinned content at `top+height ≤ 920`.

## Labels over an image (and anything pinned to a box)

To put labels over an image, wrap the `<img>` in a `<div>` with `position:relative` and set its `width` and `height`. This lets you pin children to that box with `position:absolute` instead of to the slide. For example, you can pin badges, callouts, or a caption bar (`left:0; right:0; bottom:0; padding:24px 32px; background:rgba(0,0,0,.55); color:#fff`). Put diagram labels here as real text — `<p>` elements over the image. Never draw them inside the SVG. Fonts do not load inside images, and the PPTX export cannot reach them. The artwork is the image, and the words are `<p>`s over it.

## What the editor does with structure

The user never sees your HTML tree. Here is what the editor does when the user interacts with elements:

- **Select**: A click selects the leaf element; a grouping `<div>` with no paint is not selectable. A `<div data-group>` is a group the user made: it selects and moves as one. Keep the attribute.
- **Drag an element out of flow** (or resize it from an edge the flow holds, e.g. the top of a stacked block): The editor turns it into a pinned element (`position:absolute`) at its rendered spot. On a drag its former siblings reflow; on a resize whatever would have shifted is pinned too and the containers it sat in keep their size (min-width/min-height), so the rest of the slide stays put.
- **Drag a painted container**: It moves whole; its children keep flowing inside it.
- **Delete**: The element goes; its siblings reflow.

The editor writes these changes back into the same HTML, so a deck you re-read may have pinned elements where you wrote flow. Keep them; do not "fix" them.

## Example — one slide, flow plus pin

```
<section id="kpis" style="background:#fbfbf8; padding:128px 128px 160px; display:flex; flex-direction:column; gap:40px">
  <p style="font-size:24px; font-weight:600; letter-spacing:2px; color:#2b7a78">Q3 IN NUMBERS</p>
  <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:32px">
    <div style="background:#fff; border:1px solid #e3e6e4; border-radius:16px; padding:40px; display:flex; flex-direction:column; gap:8px">
      <p style="font-size:120px; font-weight:600; line-height:1; color:#0f2a3d">41%</p>
      <p style="font-size:28px; color:#4a5568">faster ramp</p>
    </div>
    <div style="background:#fff; border:1px solid #e3e6e4; border-radius:16px; padding:40px; display:flex; flex-direction:column; gap:8px">
      <p style="font-size:120px; font-weight:600; line-height:1; color:#0f2a3d">6→1</p>
      <p style="font-size:28px; color:#4a5568">onboarding paths</p>
    </div>
    <!-- third tile alike -->
  </div>
  <p style="position:absolute; left:128px; bottom:64px; font-size:24px; color:#6a7179">Source: People Ops, Q3 survey (n=212)</p>
</section>
```
