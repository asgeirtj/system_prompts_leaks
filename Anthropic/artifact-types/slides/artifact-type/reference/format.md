# Slide HTML — the whole subset

You write one HTML file, and the editor re-saves it in the same format, normalized: one `<section>` per slide on a fixed 1920×1080 canvas, every style inline in `style=""` (a `<style>` block may hold only `@font-face` — Document, below).

The subset is closed: only the HTML tags below and EXACTLY the CSS in the code block — one line per property: the values it allows · the elements it applies to. `text` = `h1`, `h2`, `h3`, `p`, `ul`, `ol` (text rows set on `body`, `section`, or `div` inherit down); `div/grid child` = a flow child of one; `pinned` = `position:absolute`. Anything else is a build error naming the slide, the element and the closest supported change; no flag ships it.

**Supported CSS.**  
```
LEN = Npx or bare N (px) — no em rem vw vh %
PCT = N%
N, INT = number, whole number
COLOR = #hex | rgb[a]() | hsl[a]() | named | transparent — no currentcolor, var()
ANGLE = Ndeg | Nturn | Nrad
ALIGN = start | center | end | stretch | baseline (flex-* forms ok)
FAMILY = 'Declared Face', Basic, generic — a Google Fonts <link> or @font-face family, a basic face (fonts.md), then serif | sans-serif | monospace | cursive

position: absolute | relative · any; absolute pins to the slide or a position:relative div
left top right bottom: LEN | PCT | auto; left/top also calc(PCT ± LEN) · pinned only (relative does not offset)
width height: LEN | auto | PCT (pinned, td/th, or along a flex row/column = that share) · any
min-width: LEN | min-content | max-content · div child
min-height max-width max-height: LEN · div child
display: flex | grid | none (no display = column) · section div
flex-direction: row | column [-reverse] · flex box
flex-wrap: wrap | nowrap · row div
gap: LEN 0–512, one value · section div
align-items: ALIGN · section div
justify-content: start | center | end | space-between | space-around | space-evenly · flex box, not grid
justify-items: ALIGN, no baseline · grid box
align-self: ALIGN | auto · div child
justify-self: ALIGN | auto, no baseline · grid child
flex: none | auto | N [N] [LEN | 0% | auto] (flex:1 = equal share; empty div + flex:1 = spacer) · div child
flex-grow flex-shrink: N · div child
flex-basis: LEN | auto · div child
grid-template-columns grid-template-rows: (LEN | Nfr | auto | repeat(INT, …))+ ≤24 tracks — no minmax, auto-fill, names, areas · grid box
grid-column grid-row: span INT only (cells fill in source order) · grid child
aspect-ratio: N | N / N · div child
padding: LEN 0–256 ×1–4 · section div text table; td/th: one per table, ≤64
overflow: hidden | visible · div
font-family: FAMILY · text table; on body/section/div it inherits
font-size: LEN 8–400 (Npt converts) · text table; inherits into p/li, not h1–h3
font-weight: 100–900 (whole hundreds) | normal | bold · text th; span (≥600 = bold)
font-style: normal | italic · text span
font: [italic] [weight] LEN[/N] FAMILY · text
line-height: N | PCT | LEN (0.5–4× the font-size) · text
letter-spacing: LEN | Nem (−24–32px) | normal · text
text-align: left | center | right | justify (not td) · text td/th
text-transform: none | uppercase | lowercase | capitalize · text
white-space: normal | nowrap · text
text-decoration: none | underline | line-through [solid | double | dotted | dashed | wavy] [COLOR] · text; span: underline only
font-variant-numeric: normal | tabular-nums · text
-webkit-text-stroke: LEN 0–8 COLOR · text
color: COLOR · text span td/th x-icon x-connector hr
background: COLOR | [repeating-]linear-gradient(ANGLE | to SIDE, COLOR [PCT [PCT]], … 2–8 stops; repeating: px stops) | radial-gradient([circle|ellipse] [at X% Y%], …); one gradient[, COLOR under it] · section div text img table x-icon; tr: COLOR; x-shape/hr = flat fill
background-clip: text (+ -webkit-text-fill-color: transparent): glyphs take the gradient | url(IMG) [center / cover|contain]; color = fallback; span: -webkit-text-fill-color: currentcolor · text
border: [LEN 0–16, else 1] solid | dashed | dotted | double | none [COLOR, else black] — one stroke; the style word is required · div text img table x-icon; = the stroke on x-shape hr x-connector (≤32)
border-top -right -bottom -left: as border | none; one style+color, any widths · div text img table x-icon
border-radius: LEN | PCT ×1–4 (TL TR BR BL); 50%=pill · div text img table; rect x-shape
box-shadow: [inset] LEN LEN [LEN [LEN]] COLOR, … ≤8 (x y ±64, blur ≤160, spread ±32) · div text img table x-icon x-shape
text-shadow: LEN LEN [LEN] COLOR, … ≤8 (blur ≤64) · text table
opacity: N 0–1 · any
transform: translate(LEN[, LEN]) | translateX|Y(LEN | -50%), rotate(ANGLE), scale(N 0.5–2), skew[X|Y](ANGLE ±60) — any subset in that order, each once · any but x-connector; x-shape: rotate only
filter backdrop-filter: blur(LEN ≤20) brightness|contrast(N 0–2) saturate(N 0–3) grayscale|sepia|invert(N 0–1) hue-rotate(ANGLE) — any subset · div text img x-shape
mix-blend-mode: normal | multiply | screen | overlay | darken | lighten · div text img x-shape
object-fit: cover | contain · img
accepted as no-ops only: margin | box-sizing | grid-template (0, border-box, none)
```

**Document.** The `<head>` holds the `<title>` (the deck's name) and the fonts: a Google Fonts `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=…">` and/or one `<style>` holding only `@font-face { font-family: "Name"; src: url(file.woff2) }` rules for the user's own font files beside the .html (reference/fonts.md). Up to 4 families. `<body style>` sets the deck defaults: text inherits as in CSS, except `font-size` and `font-weight` never inherit into h1–h3 (tag defaults until set). `font-family`: declared family, basic face (fonts.md), generic; an unknown family heals to the generic.

**Slide = `<section id data-section="…" data-transition="fade|push|magic" hidden>`.** Always set a background color or gradient; set the text defaults and the slide's layout (`display:flex` or `display:grid`, padding = the margins, `gap`, `align-items`, `justify-content`). Children flow in it; `position:absolute` pins a child to the slide instead: `left`/`right`/`top`/`bottom`/`width`/`height` (left AND right = stretch; `left:50%` + `transform:translateX(-50%)` centers). Pinned boxes stay on the canvas and, normally, inside the 128px margins (left+width ≤ 1792, top+height ≤ 952). A negative offset is clamped to 0 with a WARNING, so give an overhanging sticker room in its parent's padding. Later children paint on top, and all flow content paints as ONE layer where the first flow child sits: a pinned backdrop (image, stripe, scrim) listed after the first flow child hides the flow text — list backdrops first. Inside a `position:relative` `<div>`, pinned children always paint over its flow content, so a decorative rule goes where nothing else sits, or is a flow child. `<aside>` = speaker notes (one per slide, last; takes no space). `hidden` = skipped. `data-transition` = how this slide leaves. `data-section` = a section of your outline starts here; its value is that section's one-sentence description.

**Text.** `<h1>` `<h2>` `<h3>` `<p>` (defaults 96/64/44/32px, weights 600/600/600/400, line-heights 1.1/1.15/1.2/1.4). Set `font-size` yourself: ≥24px everywhere, labels, cells, footers too (not build-checked). `<ul>`/`<ol>` of plain `<li>` (one level), `<br>`. Inline: `<b>` `<i>` `<u>` `<a href="https://…">` `<span style="color:…">` only — no sizes or fonts on spans (use two blocks). A pill is a `<p>` with `background` + `padding` + `border-radius`. Give pinned text a `width` so it wraps. Text wraps only at spaces; a word wider than its box breaks mid-word ("Leadershi/p" — a lint note; nothing hyphenates), so size every box to its longest word: about 0.6 × `font-size` per character (more for bold or caps) plus padding — at 44px, 5 cards across 1664px hold ≈11 characters each. An over-full slide shrinks a box's text (styles.md; `data-fit` opts out). Opt-ins: `white-space:nowrap` keeps one line (a flow box grows; a pinned box's text runs past its edge); `flex-wrap:wrap` on a row `<div>` lets its children wrap to a second line; `min-width:min-content` or `min-width:max-content` on a FLOW text element or column keeps it at least as wide as its longest word or line (siblings shrink).

**Containers.** `<div>`: a flex row or column, or a grid (the layout rows above); no `display` = a column; an empty `<div style="flex:1">` = a spacer. `position:relative` on a `<div>` lets `position:absolute` children pin to it (≤24 per `<div>`; split across sibling hosts). A pinned `<div>` inside a host is flattened: its positioned children re-pin to the host (exact for `left`/`top`; for `right`/`bottom`/centering only when it has a set size — else an error); it stays only if painted or holding flow content. `%` on a pinned child needs a sized host or sized pinned one (else error; `100%` with no offset fills a host). A sized host needs no flow child, and in a flex column it stretches to the column's start (`align-self:center` centers it). A `<div>` is invisible unless it has `background`, `border`, or `box-shadow`.

**Images.** `<img src alt style="width; height; object-fit:cover|contain; border-radius">`; `alt` = what it shows (`alt=""` if decorative); `src` = an image file beside the .html (png/jpg/webp/gif/svg; images.md). `data-crop="ZOOM X% Y%"` (zoom 1–50, object-position) is a person's crop: keep it unless `src` changes. A video clip: images.md.

**Graphics & live embeds.** Charts, illustrations and a diagram's curved lines (diagrams.md) are `<svg …>…</svg>`: one opaque graphic — paths, shapes, gradients, filters, local `#id` refs only. `<text>` is warned: fonts never load in an svg, so labels are `<p>`s over it. No script, on*=, foreignObject or URLs (`<style>`, animation, comments, CDATA: fine). ≤52 KB each; `width`/`height` = the `viewBox`; shown as an image. Entities: only numeric (`&#160;`), the XML five (`&` as `&amp;`); other characters literal (`—`). Prefer presentation attributes or `style=`: a drawing with a `<style>` is saved as an image.

A live embed, `<x-embed style="position:absolute; left; top; width; height">…a whole small page…</x-embed>`, is a sandboxed iframe (`allow-scripts`; CSP: no network, `font-src data:` only). Its HTML/CSS/JS runs, but the deck's `@font-face` and styles do NOT reach it (use a system font stack); its background is transparent until painted; viewers cannot click or type into it. A DIRECT child of `<section>`, pinned (left/top or right/bottom + width/height) — inside a `<div>` is an error; ≤16 KB each, ≤8 per slide. The build does not read its contents, so keep its text ≥24px. PPTX/PDF flatten it; the web page runs it.

**Tables.** `<table>` of `<tr>` with `<th>`/`<td>` (plain text; ≤100 rows × 24 columns); a first `<th>` row is the header. Column widths: `width:N%` on EVERY cell of the first row (any missing = equal columns). `text-align` on a cell aligns its column; `color` works on a cell; set `font-family`, `font-size`, or `color` on the `<table>`, or it inherits them. Cells pad 0.35em 0.6em unless a cell sets `padding` (one per table); never `padding:… 0` on a text cell — cells are ruled; text would sit on a line. A row ≈ 2.1 × the font size per line of text; every row must fit under the heading — if not, use 24–28px or split the table. Columns never grow for one long word (it breaks mid-word): make each column at least as wide as its longest word (0.6 × font size per character); 5+ columns at 32px in a half-width table do not fit: 24–26px or abbreviate.

**Tables, banding & rotated headers.** A `<tr>` may carry `background:COLOR`; no background on cells, no colspan/rowspan; rows are as tall as their content and a table as tall as its rows (a height on it is ignored). Merged group headers: a painted flex row above the table whose parts use the same `width:N%` shares as the columns. Row groups: a pinned painted spine beside the table. Do not rotate text inside a cell: rotation is about the box center (45° labels: the recipe in diagrams.md). A bottom-to-top header over a column of width C centered at cx, in a header zone of height Z (≥ the longest label ≈ 0.6 × font size per character + 24px), is `<p style="position:absolute; left:{cx−Z/2}px; top:{zoneTop+Z/2−C/2}px; width:{Z}px; height:{C}px; line-height:{C/font-size}; transform:rotate(-90deg); white-space:nowrap; text-align:left">`. (the unitless `line-height` centers the line in the C-high box; `text-align:left` anchors every label at the table edge; cx−Z/2 < 0 on the first column is clamped — leave margin or shorten). With 12 columns or fewer, prefer abbreviated or wrapped headers to rotation.

**Shapes & icons.** A painted `<div>` IS a rectangle; `<hr>` is a line (`border-top` = its stroke and thickness, else `color`; `width` as usual). `<x-shape kind="ellipse|diamond|arrow-right|arrow-left|arrow-up|arrow-down|line" style="background COLOR; border (stroke); box-shadow; opacity; width; height">` — each kind fills its box, so an arrow is a block glyph whose head is the last 40% of its length: keep it near 2:1 (lint note past 3:1). Connectors: `<x-connector x1 y1 x2 y2 head="end|both|none" head-start|head-end="none|open|filled" route="straight|hv|vh|elbow" style="color; border-width (2px default, ≤32); border-style:dashed|dotted">` — a line, constant-size heads (`hv` = across then down, `vh` = down then across, `elbow` = 3 segments), in canvas coordinates in a `<section>` or relative to a `position:relative` `<div>` (px or %). A pinned layer (counts toward the 24); no `left`/`top`/`width`/`height`, no fill; a missing coordinate errors. Without coordinates it is a sized flow child (`<x-connector style="width:96px">` between cards) whose line runs corner to corner from `from="tl|tr|bl|br"` (default `tl`; a flat box: a straight arrow) — see reference/diagrams.md. Shapes, icons, and connectors hold no content. `<x-icon name="…" style="color; width; height">` — name is one of  
Activity Book Chart Chat Check CheckCircle Clock Cloud Code Database Globe GraduationCap Home Key Lightbulb Lightning Link Lock PaperPlane Play Search Settings Star ThumbsUp Tool Trust Users Verified Warning Wrench (exact).

**Motion (Present only).** `data-build-in` / `data-build-out="fade|rise|drop|left|right|scale|pop [order 1–50] [auto]"` on a slide's `position:absolute` children. Magic move: `data-transition="magic"` on the slide plus the same `id` on the matching absolute element of both slides.

**Not in this subset.** Any CSS not in the table above (`margin`, `z-index`, `float`, grid areas/lines, `em`/`rem`, `var()`…), `<style>` beyond `@font-face`, scripts (`<script>` or `on*=`), `<iframe>`/`<canvas>` outside `<x-embed>`, nested lists, colspan/rowspan, hover, keyframes.

**Errors.** These stop the build with line:col: malformed markup; an unknown or misplaced tag, `x-shape` kind, or `x-icon` name; >15 nested `<div>`s; a `<link>` to anything but Google Fonts; a `<style>` holding anything but `@font-face`; a missing image file or an image URL; >24 positioned children in one `<div>`; text over 20000 characters or 100 inline marks; >4000 table cells or >200 elements on a slide; >500 slides; and anything outside the subset (`unsupported:` — a property not in the table, a value, unit or number outside its grammar or range, a property on an element that does not take it). A heal that changes something visible is a WARNING and stops the build unless you pass `--allow-warnings`; a heal to an equivalent is a NOTE and never blocks: `pt` → `px`, `width:N%` on a flex child → its share, `<span style="font-weight:600">` → bold, `class`/`data-*` ignored. Layout lints (`note: layout: …`, never blocking) are estimates — overlapping text boxes, a block arrow past ~3:1, a box narrower than its longest word, a fixed-height box its text overflows, a connector leg along or through a box, a line across a label, a small icon, reading order: treat each as probably real and fix `deck.html`.
