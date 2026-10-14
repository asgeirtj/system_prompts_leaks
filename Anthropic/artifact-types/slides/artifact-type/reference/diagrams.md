# Diagrams — flowcharts, swimlanes, org charts, trees, timelines, system maps

Read this if a slide shows boxes connected by lines. **Boxes first, in the file; lines second.** Pick the idiom (`diagram-recipes.md` § Idioms and § Rows), take its row and column numbers, and write `deck.html` with only the boxes (and lanes) plus a node-list comment — `<!-- A 0,0,320,120  B 448,0,320,120 … -->` — then build. Only then add connectors and labels, reading every coordinate off that list. If you notice you are computing connector coordinates before the boxes are written, stop and write the boxes.

**Source order is paint order and reading order.** A screen reader or the PDF text layer gets only the `<p>`s, in source order — boxes first, so each edge label is heard after every box — and none of the lines. Put the structure in the words: number sequential steps in their box text, carry an edge's word into the step it leads to ("No → escalate to legal"), keep edge labels in the boxes' order, and let the slide's title or the line under it say what the diagram shows ("Four stages; legal gates the last two").

## Which layout

1. **If it is a straight chain, or a small tree (at most two levels of branching and four leaves), use "flow" layout.** Put the boxes in a stack with `display:flex; flex-direction:column; gap:24px`. Add a 32×24 down arrow (`<x-shape kind="arrow-down">`) or a flow connector (`<x-connector style="height:32px">`) between steps. Center both with `align-self:center`. For a left-to-right chain, use a row instead of a column, with `arrow-right`. Branches are columns inside a row. Nothing can overlap. You can nest `<div>` elements at most 15 levels deep. The leaf boxes are painted `<p>`s (with background, border, and padding).

2. **If it is a bigger tree, an org chart, a decision tree with more than four outcomes, or a bracket, use the pinned "Rows" recipe in `diagram-recipes.md`.** Do not build it in flow layout: the branches will not be joined by lines and the tree will crowd the top of the slide.

3. **For anything else, "pin" boxes inside one host `<div>`.** This works for loops, lines that cross, swimlanes, boxes with two parents, or a map. Make one `<div style="position:relative; width:1664px; height:700px">`. Inside it, put boxes with exact `left/top/width/height`, then connectors, then labels. That order sets the paint order (which layer is on top). A host `<div>` holds at most 24 pinned children, and connectors count. If the diagram will need more (count boxes + connectors + labels before you start — a bracket, a metro map and most swimlanes do), do not use a host: see "More than 24 pinned elements" in `diagram-recipes.md`.

## Pinned diagrams

- **Put the boxes on a grid**: Use one regular spacing (pitch) between columns and one between rows. For example, 320px wide boxes at left 0, 448, 896, and 1344px; 120px tall boxes at top 0, 290, and 580px. Keep at least 32px between boxes. Make boxes that represent the same kind of node the same size.

- **No box is narrower than its longest word.** At 24px text a node box is at least 200px wide; that holds a 10-letter word with room to spare (the dense 7–8-column swimlane plan in `diagram-recipes.md` is the one tighter exception, with its own numbers). Add 16px for each letter beyond 10 ("documentation", 13 letters → 248px). At 28px: at least 232px, plus 18px per letter beyond 10. Bold or capitals: add another 10%. Two lines of 24px text need a box about 100px tall; of 28px, about 112px. For a pinned box you set this `width` yourself — `min-width:min-content` is dropped when a box is pinned, and `white-space:nowrap` keeps one line but does not widen the box.
- **If the columns do not allow that width, use fewer columns — never narrower boxes or smaller text.** Three ways, in order: (1) put consecutive steps that belong to different lanes or rows in the SAME column, one above the other — only step to a new column when the next box is in the same lane; (2) wrap a long chain into two rows (left-to-right, then continue right-to-left below, joined by a `vh` at the turn); (3) merge boxes (one box "Validate & register" instead of two). Shorter label text is also fine. A 1664px host holds at most 7 columns of 200px boxes with 44px gaps (lefts 0, 244, 488, 732, 976, 1220, 1464).

- **Draw connectors from edge point to edge point**:

  - **Edge points.** The middle of the right edge is at `(left+width, top+height/2)`. The middle of the bottom edge is at `(left+width/2, top+height)`. If a connector already uses an edge's midpoint, use another point on that edge.

  - **Straight.** Draw the connector straight when the two points share a row or a column.

  - **`vh` (down, then across).** Use this from a top or bottom edge into a side edge.

  - **`hv` (across, then down).** Use this from a side edge into a top or bottom edge.

  - **One parent to several children, or several boxes into one: use the bus and join recipes in `diagram-recipes.md` § Rows (or the spine in its § Org chart).** Never join a top or bottom edge to another top or bottom edge (a parent's bottom to a child's top) with `elbow`, `hv` or `vh`: whichever you pick, one leg lies along a box's own border and the head lands sideways. (`vh` from a top or bottom edge into a SIDE edge, as in a swimlane hand-off, is fine.)

  - **`elbow` is only for two boxes in different rows AND different columns, side edge to side edge, when the two points are at least as far apart sideways as they are up-and-down** and the gap between the columns is at least 96px — then the middle leg runs down that gap. If the points are farther apart up-and-down than sideways, `elbow` bends the other way and its first leg runs down the box's own side: use `hv`/`vh` from a different edge, or three straight segments (across into the gap, down the gap, across into the box). If you are not sure, do not use `elbow`.

  - **Where the legs run.** A horizontal leg runs in the gap between two rows (its y is between the bottom of one row and the top of the next), never at a y where a box sits unless it ends at that box. A vertical leg runs in the gap between two columns, or at a column's centre when it enters a box from above or below. If a leg would have to pass a box at the box's own y (or x), move the leg into the gap: add a segment. A layout note names a leg that runs along a box's edge, through a box, or across a label.

  - **Loop-back.** To connect the last box back to the first, go around the outside: down from the last box, along a clear strip below the boxes, then up into the first box. Use three straight connectors with `head="none"`, `"none"`, and `"end"`. Never run a connector through a box.

- **Put text labels in `<p>` elements pinned beside their line**, never on the line: at least 8px clear of the stroke and of every box (an angled label's first letter beside its dot is the one exception). Set the `width` of the `<p>`. Along a rail, path or timeline: period names (months, quarters) go inside or directly under the track; a milestone label sits only at the far end of its own leader line, and neighbouring leaders alternate two lengths (e.g. 40px and 100px) or two sides so the labels cannot touch; flags, ticks and "today" markers never share a label's strip; phase names go in a gutter, not on the track.

- **Angled labels (45°) on maps and dense timelines — use this recipe, do not place them by eye.** `transform:rotate` turns a box about its centre, so a rotated label whose corner is at the dot swings back across the line. For a dot centred at (X, Y), a label that starts beside the dot and runs up and to the right is:  
  ```
  <p style="position:absolute; left:{X−23}px; top:{Y−114}px; width:240px; height:34px; line-height:34px; font-size:24px; white-space:nowrap; transform:rotate(-45deg)">Station name</p>
  ```
  One that runs down and to the right is the same with `top:{Y+80}px` and `rotate(45deg)`. Always keep `width:240px; height:34px` whatever the text: the text starts about 16px from the dot centre and shorter names simply end sooner. Keep names to 13 characters (abbreviate); a 13-character label climbs about 160px, so parallel lines sit at least 170px apart — in the 700px host that is four lines at y = 160, 330, 500, 670 with every label above its line — and stations at least 56px apart along a line. (A longer name runs on past the 240px box and up into the line above: the character limit is what keeps lines clear, not the box.) The layout lint cannot see rotated text, so the recipe is the check.

- **Keep the slide within budget**: Allow 64px for the title (about 70px tall), a 40px gap, and 700px for the diagram host. That uses 810px of the slide's 824px height. With a pinned legend or source line at the bottom (a footer slide, see layout.md § Footer band), give the slide `padding:128px 128px 160px` and a 16px gap: 786px of a 792px budget. **Use the whole host**: the lowest row of boxes ends below y = 600 (the row tables in `diagram-recipes.md` § Rows do this for you); a diagram squeezed into the top half above an empty band reads as unfinished. If the brief allows two slides, split at about 12 nodes. If it must be one slide, keep 24px text and use the Rows and fewer-columns rules to make it fit; do not shrink the text (the one exception is the dense-swimlane plan in `diagram-recipes.md` § Swimlane).

- **Before you save a pinned diagram, check the source — the geometry is the check.** The build cannot see where connector legs run, SVG lines, angled labels or diamond text, so go down your node list once: (1) every connector's `x1,y1` and `x2,y2` is an edge midpoint of a listed box, or a bus / junction point from a recipe — none is "about there"; (2) every horizontal leg's y is in a gap between rows, and every vertical leg's x is in a gap between columns or at a column centre where it enters a box from above or below; (3) every label `<p>` is at least 8px from every line and every box; (4) boxes are at least 32px apart (except boxes that deliberately touch and share one stroke) and inside the host; (5) the last build printed no `note: layout:` lines. If you built from the recipes, (1) and (2) hold by construction; check the connectors you improvised. Do not take screenshots or build a proof rig.

## The connector element

```
<x-connector x1="320" y1="100" x2="448" y2="100"></x-connector>
<x-connector x1="608" y1="160" x2="896" y2="320" route="vh" style="color:#2b7a78; border-width:3px"></x-connector>
<x-connector x1="1504" y1="160" x2="1504" y2="260" head="none" style="border-style:dashed; color:#8a9199"></x-connector>
```

Put it in a `<section>` (then x1/y1/x2/y2 are canvas coordinates) or in a `position:relative` `<div>` (then they are measured from that div, in px or %). Keep the endpoints at least 2.2 times the stroke width plus 1 pixel inside the host's top and left edges. Round up: for example, use at least 6px if the stroke is 2px, or 10px if the stroke is 4px. If not, the head margin is clamped and you get a warning.

If you use `x1`, `y1`, `x2`, `y2`, do not set `left`, `top`, `width`, or `height`. The `<x-connector>` must have no content.

If you do not use `x1`, `y1`, `x2`, `y2`, the connector is a sized flow child. Set its width with `style="width:96px"`. Use `from="tl|tr|bl|br"` to pick which corner it starts from. `tl` (top left) is the default. Use this as the arrow between steps in a flow layout. Never use a stretched block arrow for that.

`head="end"` (the default) puts a filled arrow head at the end point (x2,y2), `head="both"` at both ends, `head="none"` at neither. `head-start` and `head-end` (`none|open|filled`) set one end alone.

Set `route="straight"` for a straight line (the default), `route="hv"` for horizontal then vertical, `route="vh"` for vertical then horizontal, or `route="elbow"` for three segments that bend at the midpoint of the longer run.

A head is a constant size, about 4 stroke widths, at any length or angle.

For style, you can set `color`, `border-width` for the stroke (default is 2px, max is 32px), and `border-style:dashed` for a dashed line. It has no fill, shadow, or rounded corners.

In the editor each end of a connector has its own handle, which snaps onto other elements' corners and edge midpoints; head, route, dash, colour and width are panel fields. Exports draw it as an image.

Lines have round caps and round joins.

If the `hv`, `vh`, or `elbow` routes cannot make the path you need, chain several solid `<x-connector>` elements with `head="none"`:

- Only the last segment carries a head.
- The `x2`,`y2` of one segment must be EXACTLY the same as the `x1`,`y1` of the next segment. Use the same numbers.
- Use the same width and colour for all segments.
- Never overlap or offset the ends to fill a corner.
- If the line is dashed, the dash pattern restarts at each joint.
- A 45° angle means |dx| == |dy|.

If you have a many-bend line that nobody will edit piecewise, you may use one `<svg>` `<path>` with round joins, in a box that contains it.

The `<x-shape kind="arrow-*">` element is a block arrow glyph. The head is the last 40% of its length and stretches with it. Keep it near 2:1 (such as 64×32) as a glyph. If the ratio goes past about 3:1, a lint note will flag it.

## Fallback: curves are `<svg>` paths

Only use an `<svg>` element when the line must be curved. Use a `<path>` with a fixed-size `<marker>` for the head. Make the `<svg>` cover the whole host — `style="position:absolute; left:0; top:0" width="1664" height="700" viewBox="0 0 1664 700"`, listed FIRST in the host, before the boxes (it is one image the size of the host: listed later it would sit over the boxes and take their clicks in the editor) — so that path coordinates are the same numbers as your boxes' edges, with nothing to subtract. Every path starts at one box's edge midpoint and ends at another's, copied from your node list (`M x1 y1 Q cx cy x2 y2`: only the control point is free; put it 80–160px to the outside of the straight line between the ends, or to the inside when the outside would take the curve out of the host). End the path 2 stroke widths short of the target edge point (8px at a 4px stroke): the marker's tip sits 2 stroke widths past the path's last point, so the tip then touches the edge (ending farther back leaves a visible gap). Never estimate an endpoint; if you cannot name the box edge a path ends on, it is wrong.

The `width` and `height` of the `<svg>` must match the `viewBox`. Use the `<path>`'s stroke color as the `<marker>`'s fill. Keep the `<path>` at least 2 stroke widths (8px at a 4px stroke) inside the `viewBox` so the head does not get clipped.

Do not put `<text>` or comments inside the `<svg>`. Inside it write a character only as itself (`—`), as its number (`&#8212;`) or as one of XML's five names (`&amp;` `&lt;` `&gt;` `&quot;` `&apos;`): any other `&name;`, or a bare `&`, breaks the drawing. When the curves carry meaning the labels do not (direction, polarity), give the `<svg>` an `aria-label` saying it ("more listings → lower rents"): that is its alt; without one a screen reader skips it.

In the editor, the `<svg>` appears as one image. You cannot edit each arrow separately.

```
<!-- A 0,0,320,120  B 896,0,320,120 : arc from A's right-edge midpoint (320,60) to B's left-edge midpoint (896,60), ending 8px short -->
<svg style="position:absolute; left:0; top:0" width="1664" height="700" viewBox="0 0 1664 700">
  <defs><marker id="h" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible"><path d="M0 0 L4 2 L0 4 Z" fill="#2b7a78" stroke="none"/></marker></defs>
  <path d="M 320 60 Q 608 180 888 60" fill="none" stroke="#2b7a78" stroke-width="4" marker-end="url(#h)"/>
</svg>
```

The default `markerUnits` is `strokeWidth`, so the head scales with the stroke. `orient="auto"` turns it to match the line direction. Use `stroke-dasharray="12 10"` to make a dashed line.
