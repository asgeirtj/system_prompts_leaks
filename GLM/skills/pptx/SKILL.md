---
name: pptx
metadata:
  author: Z.AI
  version: "1.1"
description: "Use this skill any time a presentation file is the primary input or output. Covers: creating new .pptx decks from scratch or from an outline/document (pptxgenjs / python-pptx); editing and restyling an existing .pptx; reading and extracting text/structure from a deck (markitdown); and rendering a deck to PDF (LibreOffice) or to per-slide PNG images (pdftoppm) for previews, thumbnails, or visual review. Trigger when the user references a .pptx file by name or path, says 'make/build a deck, slides, presentation, PPT, 幻灯片, 演示文稿, 汇报/路演材料', or asks to convert, export, render, or preview slides as PDF or images (e.g. 'PPT转PDF', 'ppt导出图片', 'turn these slides into a PDF')."
license: Proprietary. LICENSE.txt has complete terms
---
# Part 1 · Slide Design Best Practices

In one sentence: **don't make boring slides.** Bullet points on a white background are forgettable.

But "not boring" is not "flashy." The goal is a deck that looks **ready to use in real life** — the kind you could drop into a real meeting, class, or client pitch without editing.

**Substance comes before styling:** every slide must carry one specific, concrete claim — real numbers, names and mechanisms, and the "so what" behind them — not a topic label or generic filler. Depth is not density: it comes from picking the sharpest fact and cutting the rest, never from more text.

**Original file preserved:** user-provided decks are read-only by default. Deliverables go to new files
(`<stem>_updated.pptx` next to the input); edit an original in place only when the user explicitly
asks — and then copy it to `<stem>_backup.pptx` next to it (never `/tmp`) first. See *"Editing an
existing PowerPoint presentation"* in Part 2.

## 1. Decide three things before you start

**① Pick a content-informed color palette**  
The palette should feel designed *for this topic*. A good test: if you could drop your colors into a completely unrelated deck and it would still "work," your choices aren't specific enough. Derive the hues from the subject itself — its place, industry, brand, or mood — rather than reaching for a default.

**② Dominance, not equality**  
One color should dominate 60–70% of the visual weight, supported by 1–2 secondary tones and one sharp accent. **Never give all colors equal weight.**

**③ Dark/light contrast + a visual motif**

- "Sandwich" structure: **dark backgrounds** for the title and closing slides, **light backgrounds** for content slides. Or commit to dark throughout for a premium feel.
- Pick **one** signature motif and repeat it on every slide: rounded image frames, oversized numbers, a consistent card treatment, etc.
- ⚠️ **Do NOT** use a "color bar / accent stripe / sidebar strip" as your motif — that's a hallmark of AI-generated slides (see the avoid list).

## 2. Color

Build the palette on the **BACKGROUND → PRIMARY → ACCENT** model, and reuse those exact same three roles on every single slide:

- **BACKGROUND** — a neutral or near-neutral surface (off-white, warm grey, deep navy, near-black) that carries 60–70% of the slide
- **PRIMARY** — the brand/topic color used for headers, key shapes, chart bars and structural elements
- **ACCENT** — ONE saturated color, used sparingly (roughly 5–10% of the slide) on the single most important element: a headline number, a highlighted bar, an underline
- **Define the palette once as constants at the top of the script** (e.g. `BG`, `PRIMARY`, `ACCENT`, plus `TEXT` and `MUTED`) and reference only those constants — never hand-pick ad-hoc colors slide by slide.
- Be **restrained and consistent**: no loud, garish, neon or clashing colors, no rainbow palettes, no slide that introduces a color the rest of the deck never uses. Slide-to-slide color shifts should be limited to the background/text inversion of the sandwich structure.
- Prefer **tints and shades of the primary** (lighter/darker variants) over adding new hues when you need more differentiation — including in charts.
- High contrast between text and background: dark text on light backgrounds **or** light text on dark backgrounds.

## 3. Layout for each slide

**Every slide needs a visual element** — image, chart, diagram, or shape. Text-only slides are forgettable.

**Every slide needs ONE clear visual focal point** — an oversized number, a chart, an image, a single bold statement — that dominates the composition. Everything else is subordinate to it.

**Prefer container-free grouping — use it on the majority of slides.** Grouping comes from alignment, spacing and weight, not from drawing a box around things:

- **Hairline separators** (one 1px rule between items, never thickened, never shadowed) / **row list** (full-width rows, no container, separated by generous line spacing and a bold lead-in phrase) / **outline box** (1px stroke, no fill) / **tinted band** (a horizontal band of very light tint bleeding to both slide edges — no rounded corners, no border, no shadow)
- Icon + text rows (icon at the row's left, bold header, description below — set the icon on the bare background or in a square/rounded-square holder, not a circle)

**Pick layouts that serve each slide's purpose:**

- Opening / closing → bold title layouts
- Processes / workflows → numbered step visuals
- Comparisons → side-by-side or table layouts
- Data / metrics → chart-centric layouts with oversized figures
- Key insights → single-statement emphasis layouts
- Team / people → side-by-side card row (parallel cards in one row, not a grid)

**Data display:** (point sizes here and throughout assume the 13.33 × 7.5" canvas — see §6)

- Large stat callouts (numbers 60–72pt with a small label below)
- Comparison columns (before/after, pros/cons, side-by-side options)
- Timeline / process flow (numbered steps, arrows)
- Keep metrics short and punchy — "$87B TAM" beats "Total Addressable Market is $87 billion"

**Density & rhythm:**

- **One key message per slide** — never overcrowd. Visual hierarchy: title → subtitle → body → supporting detail.
- **Control the amount of text per slide.** Too much text is the most common cause of overflow. Keep bullets concise (a short phrase, not a full sentence), avoid dense paragraphs, and if a slide is getting text-heavy, trim it or split it across two slides. The goal is comfortable density, not empty slides — just don't overpack.
- **Leave breathing room** — give each text box enough width/height that the text fits comfortably at its font size with margin to spare, rather than filling the box edge-to-edge.
- **Vary the rhythm** — alternate between text-driven, image-driven, and data-driven slides.
- **No large blank areas.** Don't leave a big region of the canvas empty. Resolve it with CONTENT — enlarge the type or the focal element, widen the chart or image, tighten the grid and margins, or promote real content (a pull quote, a caption, a supporting figure) into that space.
- **Never fill space with content-free decoration** — no filler bars, strips, rules, or flat color blocks whose only purpose is to occupy emptiness. A graphic element must separate, group, or emphasize real content; otherwise leave the space alone.
- A region occupied by a **photo is NOT empty**. If a photo area reads as a dark void, the overlay is too heavy or the photo too dark — lighten the overlay or pick a brighter image rather than stacking decoration on top of it.
- **Sanity check per slide:** is there an obvious focal point, and is nothing overflowing?

## 4. Diagrams, flowcharts & data charts (strongly preferred)

- **Favor visual explanation over prose.** Whenever content can be shown as a diagram, show it as a diagram — a bulleted list is the fallback, not the default.
- Reach for these first: schematic/concept diagrams (boxes + connectors for architecture or relationships), flowcharts and numbered process chains (chevrons, arrows, timelines), comparison matrices, and data charts (bar, column, line, stacked, donut) for anything quantitative.
- Aim for a diagram, flowchart, or chart on a substantial share of the content slides — **a deck that is all text blocks is a failed deck**.
- Build them **natively** (`addChart` / `add_chart` with `CategoryChartData`, or composed shapes + connectors + text boxes) so they inherit the palette and cost zero image calls.
- **Label everything**: axis titles, units, categories, and direct value labels on bars/points. Drop chart junk — no 3D, no gradients, no unnecessary gridlines or legends when direct labels suffice.
- **Cite the source for every key figure and every chart**: a small source line (10–12pt, muted) at the bottom of the slide, e.g. "Source: IDC Worldwide Tracker, 2025" or "Source: company 10-K, FY2024".
- Never present an invented number as sourced. If a figure is an estimate or illustrative, label it as such ("illustrative", "est.").

## 5. Image + text layering (critical)

- **NEVER place text directly on a full-bleed image** — it will be unreadable.
- When using a background image, ALWAYS add a semi-transparent overlay between the image and the text:
  1. Add the image (full-bleed, send to back)
  2. Add a dark overlay rectangle (full-bleed, ~60–80% opacity) on top of the image
  3. Then add text on top of the overlay
- **Alternative (preferred):** instead of full-bleed images, place the image in a bounded region (e.g. the right half) and keep text in the other region on a solid background.
- If an image is decorative, keep it small and positioned where it won't collide with text.
- **Never stretch an image to fit** — when its aspect ratio doesn't match the target box, crop it (`sizing: { type: 'cover' }` or an explicit `crop`), never distort it by setting a `w`/`h` that breaks the ratio. This matters most on covers and full-bleed backgrounds, where a stretched photo is the most visible defect on the deck.
- Test mentally: *"if I printed this slide in grayscale, could I still read every word?"*

## 6. Typography

- **Deliberately CHOOSE a font pairing that suits the scenario, and name the choice in your plan** — a geometric/neo-grotesque sans for corporate, tech and data decks; a serif for editorial, academic, legal or heritage topics; a high-contrast display face for the cover only. **Never leave the library's default font in place.**
- **Set the font explicitly on every run/paragraph** (`run.font.name` in python-pptx, `fontFace` in pptxgenjs) — do not rely on inherited theme fonts.
- **Cover/title type:** large (44–72pt), bold, impactful. **Content slides:** readable body text, ~24pt preferred. (All sizes in this skill assume the default **13.33 × 7.5"** canvas — set it explicitly, and if you deliberately target a 10"-wide layout scale every size down by ×0.75.)
- The **smallest text on any slide** (captions, axis labels, footnotes, source lines) must still be legible: never below 12pt, and keep it high-contrast against its background.
- **Legibility beats decoration:** no thin/light weights on colored or image backgrounds, no all-caps for long strings, no letter-spacing so tight that glyphs collide.
- **Limit to 2 font families maximum**, and create hierarchy with **size and weight**, not by swapping faces.
- **No emoji in slide content.**

> **Preview caveat:** the font names you write into the `.pptx` are rendered by the **user's PowerPoint**, not by your build environment. If you preview via LibreOffice, it substitutes any font it doesn't have — and substitutes with different character widths make the preview's "overflow / fits" verdict disagree with the real deck. Prefer faces that both ship with Office and render true-to-width locally; where you can't, leave ~10% slack instead of trusting the preview.

## 7. Spacing

- Minimum margins **0.5"**
- **0.3–0.5"** between content blocks
- Consistent margins and spacing across all slides
- Leave breathing room — don't fill every inch

## 8. CJK fonts

- **Name a face the viewer's PowerPoint actually ships**: 微软雅黑 / 等线 (Windows), 苹方 PingFang SC (macOS). A face that only exists on the build machine (Noto Sans SC, 思源黑体, LXGW 文楷 …) silently substitutes on the user's machine — use it only as the fallback, not the only name.
- **Sans for the deck, serif for editorial weight**: 微软雅黑 / 苹方 for corporate, tech and data decks; 思源宋体 / 宋体 only for cultural, academic or heritage topics, and mainly on titles. **Never** use 楷体 / 行楷 / 隶书 / 艺术字体 for body text.
- **Avoid Light/Thin CJK weights** — Chinese glyphs have far more strokes than Latin, so hairline weights turn to mud on a projector. Regular for body, Bold/Semibold for titles; build hierarchy with size and weight, not with a third face.
- Chinese text has no spaces to break on, so a long run wraps mid-phrase — keep lines short and give CJK boxes ~15% more width than the Latin equivalent. Upside: CJK glyphs are full-width, so overflow checks on Chinese text are fairly trustworthy.
- Default to 宋体 or the library default and the deck instantly reads as a Word document — pick the face deliberately, same as §6 requires.

## 9. Avoid list (sources of an "AI-generated" look)

- ❌ **Don't reuse the same layout on every slide** — vary between columns, cards, and callouts
- ❌ **Don't overuse grid layouts** — card/tile grids (2×2, 3×2, 4-up …) are a strong AI-slide tell when repeated. Cap them at roughly **1 in 5 content slides**, never on consecutive slides, and only when the content is genuinely a set of peer items (team, feature matrix). For everything else use a focal-point, column, timeline, or diagram layout instead
- ❌ **Don't center body text** — left-align paragraphs and lists; center only titles
- ❌ **Make size contrast big enough** — titles need 36pt+ to stand out from body text
- ❌ **Don't default to blue** — choose colors that reflect the topic
- ❌ **Don't mix spacing randomly** — pick 0.3" or 0.5" and use it consistently
- ❌ **Don't style one slide and leave the rest plain** — commit fully or keep it simple throughout
- ❌ **Don't create text-only slides** — add images, charts, diagrams, or shapes
- ❌ **Mind text-box padding** — to align text with shapes/lines, set the text box `margin` to 0 (or offset the shape to compensate)
- ❌ **Don't use low contrast** — text and graphics both need strong contrast against the background; avoid light-on-light or dark-on-dark
- 🚫 **Never add a decorative underline under titles** — a classic AI-slide tell; use whitespace or background color instead
- 🚫 **Never add decorative color bars / accent stripes** — including full-width header/footer bands, vertical sidebar strips, thin colored strips along a card edge, and "single-side borders" on rectangles. To set a card apart, use a **subtle background tint or shadow**, not an edge stripe. In particular, never run the same edge-bar treatment on several consecutive slides
- ❌ **Don't default to cream/beige backgrounds** — when unspecified, use white `FFFFFF` or your brand color; avoid warm-neutral defaults like `F5F5DC`, `FAF0E6`, `FAEBD7`, `FFF8E1`
- ❌ **Don't let text overflow its shape** — if it doesn't fit, reduce the font, split across slides, or enlarge the container; never leave content cut off or spilling out
- ❌ **Don't extra postprocess the east asia font if not needed**

## 10. QA (recommended)

**Content QA:** check for missing content, typos, wrong order; when using a template, grep for leftover placeholders (`xxx`, `lorem`, `TODO`, `[insert`, etc.).

**Code QA:** run a short `python-pptx` script over the finished deck to flag text overflow (estimated text height/width vs. the shape box, plus boxes outside the slide) and overlap (bounding-box intersection between two text-bearing shapes), then fix the real hits and re-run.

**Visual QA** once only: render the deck to images and use the visual-judge subagent (if not present, check it yourself) when necessary. Do not call an external VLM to check slides for visual QA.

**Output QA (before handing the deck over):** the user's original input file is untouched at its original path (unless the user explicitly asked for in-place editing); any backup you created stays next to it — these are NOT temp/retry artifacts. The deliverable is a new file (`<stem>_updated.pptx`), and intermediate renders (the PDF and per-slide PNGs from the commands below) are cleaned up.

PPTX → images is **two steps** — `pdftoppm` reads PDF, not `.pptx`, so LibreOffice must convert first:

```bash
# Step 1: PPTX → PDF (LibreOffice; also the command for any "export deck as PDF" request)
soffice --headless --convert-to pdf --outdir <out_dir> deck.pptx

# Step 2: PDF → per-slide PNGs
pdftoppm -png -r 150 <out_dir>/deck.pdf <out_dir>/slide
# Generates slide-1.png, slide-2.png, ...
```

> If `soffice` is only available under a full path (macOS:  
> `/Applications/LibreOffice.app/Contents/MacOS/soffice`), call it there. Only one LibreOffice  
> instance may run at a time — if a conversion hangs, add  
> `--env:UserInstallation=file:///tmp/libreoffice_tmp`.  
>  
> 🔴 **`soffice` not installed? You MUST install it, not substitute it** — using PowerPoint/Keynote/WPS  
> to render instead is forbidden, and a large download is not a reason to skip. Once installed,  
> **register it on `PATH` and re-verify `soffice --version`** so the next probe doesn't reinstall it  
> (step 4 of the hard requirement). See  
> [HARD REQUIREMENT](#-hard-requirement--libreoffice-is-missing) below.

---

# Part 2 · pptxgenjs in Depth

pptxgenjs generates `.pptx` files in **JavaScript / Node.js**. Coordinates are in **inches**.

## Setup & basic structure

```bash
npm install -g pptxgenjs
```

```javascript
const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';   // 13.33 × 7.5" — the default for this skill (see below)
pres.author = 'Your Name';
pres.title  = 'Presentation Title';

// Canvas constants — derive every position from these, never hardcode 10 or 13.33
const W = 13.33, H = 7.5, M = 0.5;   // width, height, margin (true width is 13.333"; 13.33 keeps you inside it)

let slide = pres.addSlide();
slide.addText("Hello World!", { x: M, y: M, w: W - 2 * M, fontSize: 36, color: "363636" });

pres.writeFile({ fileName: "Presentation.pptx" }).then(() => console.log("done"));
```

## Layout dimensions


| Layout         | Size (inches)                   |
| ---------------- | --------------------------------- |
| `LAYOUT_WIDE`  | **13.33 × 7.5 — use this**    |
| `LAYOUT_16x9`  | 10 × 5.625 (pptxgenjs default) |
| `LAYOUT_16x10` | 10 × 6.25                      |
| `LAYOUT_4x3`   | 10 × 7.5                       |

> ⚠️ **Set `LAYOUT_WIDE` explicitly on every deck.** pptxgenjs defaults to `LAYOUT_16x9`, which is only **10 × 5.625"** — but every type size in this skill (§6: 44–72pt titles, ~24pt body; §3: 60–72pt stat callouts) is tuned for a **13.33 × 7.5"** canvas. Leaving the default gives you a canvas 25% narrower and 25% shorter with type sized for the big one, which overflows systematically — the exact failure §3, §9 and §10 all tell you to avoid. If you deliberately target a 10"-wide layout, scale every font size and the 0.5" margins down by the same factor (×0.75).

## Text & formatting

```javascript
// Basic text
slide.addText("Simple Text", {
  x: 1, y: 1, w: 8, h: 2, fontSize: 24, fontFace: "Arial",
  color: "363636", bold: true, align: "center", valign: "middle"
});

// Character spacing: use charSpacing (letterSpacing is silently ignored)
slide.addText("SPACED TEXT", { x: 1, y: 1, w: 8, h: 1, charSpacing: 6 });

// Rich text array (mixed styles in one paragraph)
slide.addText([
  { text: "Bold ",   options: { bold: true } },
  { text: "Italic ", options: { italic: true } }
], { x: 1, y: 3, w: 8, h: 1 });

// Multi-line (each line needs breakLine: true; the last may omit it)
slide.addText([
  { text: "Line 1", options: { breakLine: true } },
  { text: "Line 2", options: { breakLine: true } },
  { text: "Line 3" }
], { x: 0.5, y: 0.5, w: 8, h: 2 });

// Text-box padding: set margin: 0 to align with shapes/lines
slide.addText("Title", { x: 0.5, y: 0.3, w: 9, h: 0.6, margin: 0 });
```

> ⚠️ **Rich text arrays emit one `<a:pPr>` per run, not per paragraph.** Two or more consecutive items *without* `breakLine` land in the same `<a:p>`, each carrying its own `<a:pPr>` — which violates the `pPr? (r|br|fld)* endParaRPr?` schema. LibreOffice renders it fine, so a PDF preview will not catch it; PowerPoint paints the first frame correctly, then re-lays-out the paragraph and the line garbles. Two safe options: give every item `breakLine: true` (one run per paragraph), or, when you genuinely need mixed formatting inline, post-process the slide XML after `writeFile()` and drop every `<a:pPr>` after the first one inside each `<a:p>`. Do **not** fix it by splitting the runs into separate paragraphs — that silently turns one inline-mixed line into two lines and changes the layout you designed.

## Lists & bullets

```javascript
// ✅ Correct: multiple bullets
slide.addText([
  { text: "First item",  options: { bullet: true, breakLine: true } },
  { text: "Second item", options: { bullet: true, breakLine: true } },
  { text: "Third item",  options: { bullet: true } }
], { x: 0.5, y: 0.5, w: 8, h: 3 });

// ❌ Wrong: never use unicode bullets (creates double bullets)
slide.addText("• First item", { ... });

// Sub-items & numbered lists
{ text: "Sub-item", options: { bullet: true, indentLevel: 1 } }
{ text: "First",    options: { bullet: { type: "number" }, breakLine: true } }
```

### Make bullets look good (default `bullet: true` looks amateurish)

The bare `bullet: true` renders a big dot with a **huge gap** to the text (pptxgenjs defaults to a ~27pt hanging indent) — a classic AI-list tell. Always style bullets:

```javascript
// bullet is a PARAGRAPH property — put it in EACH item's options, not top-level.
// A top-level `bullet` only styles the first paragraph; the rest get <a:buNone/> (no dot).
const bu = () => ({ code: "2022", indent: 14 });  // factory: fresh object per item (pptxgenjs mutates in place)
slide.addText([
  { text: "First item",  options: { bullet: bu(), breakLine: true } },
  { text: "Second item", options: { bullet: bu(), breakLine: true } },
  { text: "Third item",  options: { bullet: bu() } }
], {
  x: 0.5, y: 0.5, w: 8, h: 3, fontSize: 15, color: "334155",
  paraSpaceAfter: 8,   // item spacing (never lineSpacing)
  margin: 0,           // align glyph to x
});
```

- **`indent` matters most** — cut the default ~27pt to 10–16pt to kill the "floating dot" (`indent` = glyph→text gap in pt; try 10–16).
- **Refined glyphs** — `2022`(•), `25AA`(▪), `2013`(–), `25B8`(▸) read more designed than a fat dot; mute the color (e.g. `94A3B8`) to keep it subtle.
- **For short card lists** (3–4 items), skip native bullets: draw a small colored dot/square shape + a text box per row for full control.

## Shapes

```javascript
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.8, w: 1.5, h: 3.0,
  fill: { color: "FF0000" }, line: { color: "000000", width: 2 }
});

slide.addShape(pres.shapes.OVAL, { x: 4, y: 1, w: 2, h: 2, fill: { color: "0000FF" } });

slide.addShape(pres.shapes.LINE, {
  x: 1, y: 3, w: 5, h: 0, line: { color: "FF0000", width: 3, dashType: "dash" }
});

// Transparency
slide.addShape(pres.shapes.RECTANGLE, {
  x: 1, y: 1, w: 3, h: 2, fill: { color: "0088CC", transparency: 50 }
});

// Rounded rectangle (rectRadius works only on ROUNDED_RECTANGLE, not RECTANGLE)
slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 1, y: 1, w: 3, h: 2, fill: { color: "FFFFFF" }, rectRadius: 0.1
});

// Shadow (to make a card stand out — use this, not an edge stripe)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 1, y: 1, w: 3, h: 2, fill: { color: "FFFFFF" },
  shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 45, opacity: 0.15 }
});
```

**Shadow options:**


| Property  | Range / notes                                                                           |
| ----------- | ----------------------------------------------------------------------------------------- |
| `type`    | `"outer"` / `"inner"`                                                                   |
| `color`   | 6-char hex (no`#`, no 8-char hex)                                                       |
| `blur`    | 0–100 pt                                                                               |
| `offset`  | 0–200 pt,**must be non-negative** (negatives corrupt the file)                         |
| `angle`   | 0–359°, clockwise from 3 o'clock (45 = bottom-right, 135 = bottom-left, 270 = upward) |
| `opacity` | 0.0–1.0 (use this for transparency, never encode it in`color`)                         |

> To cast a shadow upward (e.g., a card near the bottom), use `angle: 270` + a positive offset — **not** a negative offset.  
> Gradient fills are not natively supported — use a gradient image as the background instead.

## Images

```javascript
// Three sources
slide.addImage({ path: "images/photo.jpg", x: 1, y: 1, w: 5, h: 3 });            // local
slide.addImage({ path: "https://example.com/img.jpg", x: 1, y: 1, w: 5, h: 3 }); // URL
slide.addImage({ data: "image/png;base64,iVBORw0KGgo...", x: 1, y: 1, w: 5, h: 3 }); // base64 (faster)

// Options
slide.addImage({
  path: "image.png", x: 1, y: 1, w: 5, h: 3,
  rotate: 45, rounding: true /*circular crop*/, transparency: 50,
  flipH: true, flipV: false, altText: "Description",
  hyperlink: { url: "https://example.com" }
});

// Sizing modes
{ sizing: { type: 'contain', w: 4, h: 3 } }  // fit inside, preserve ratio
{ sizing: { type: 'cover',   w: 4, h: 3 } }  // fill area, preserve ratio (may crop)
{ sizing: { type: 'crop', x: 0.5, y: 0.5, w: 2, h: 2 } } // cut a specific portion

// Compute size from aspect ratio and center it (W = the canvas-width constant, never a literal)
const origW = 1978, origH = 923, maxH = 3.0;
const calcW = maxH * (origW / origH);
const centerX = (W - calcW) / 2;
slide.addImage({ path: "image.png", x: centerX, y: 1.2, w: calcW, h: maxH });
```

Supports PNG / JPG / GIF / SVG (SVG works in modern PowerPoint / Microsoft 365).

## No `outEnd` labels on stacked bar charts

OOXML restricts `c:dLblPos` by grouping: **stacked / percentStacked only allow
`ctr` / `inBase` / `inEnd`** — `outEnd` is valid only for `clustered` (line: ctr/l/r/t/b;
pie/doughnut: bestFit/ctr/inEnd/outEnd).

pptxgenjs won't stop you from writing `barGrouping: "stacked"` +
`dataLabelPosition: "outEnd"`, and LibreOffice renders it fine — only PowerPoint rejects it,
triggers "repair", and drops the chart.

**To highlight a single bar, use per-point colors instead:**

```js
slide.addChart(p.charts.BAR, [{
  name: "series",
  labels: ["A", "B", "C"],
  values: [10, 20, 30],
}], {
  barDir: "col",
  varyColors: true,                            // per-point coloring
  chartColors: ["17457E", "17457E", "E8590C"], // highlight the 3rd bar
  showValue: true,
  dataLabelPosition: "outEnd",                 // valid under clustered grouping
});
```

## Backgrounds

```javascript
slide.background = { color: "F1F1F1" };                        // solid
slide.background = { color: "FF3399", transparency: 50 };      // with transparency
slide.background = { path: "https://example.com/bg.jpg" };     // image URL
slide.background = { data: "image/png;base64,iVBORw0KGgo..." };// image base64
```

## Tables

```javascript
slide.addTable([
  ["Header 1", "Header 2"],
  ["Cell 1", "Cell 2"]
], { x: 1, y: 1, w: 8, h: 2, border: { pt: 1, color: "999999" }, fill: { color: "F1F1F1" } });

// Merged cells
let tableData = [
  [{ text: "Header", options: { fill: { color: "6699CC" }, color: "FFFFFF", bold: true } }, "Cell"],
  [{ text: "Merged", options: { colspan: 2 } }]
];
slide.addTable(tableData, { x: 1, y: 3.5, w: 8, colW: [4, 4] });
```

## Charts

**Principle: keep charts native and editable.** Choose your approach by what PowerPoint can represent, not by what's quickest to code:

1. **Library-native** (bar/column/line/pie/area/scatter/bubble/radar/doughnut/combo) → use `addChart()`; **never** render to an image.
2. **PowerPoint-native but not exposed by the library** (trendlines, error bars) → stay native: compute the extra series yourself (e.g., a regression line as a second LINE/SCATTER series) or inject the OOXML. **Don't** fall back to a matplotlib PNG — you lose editability.
3. **Genuinely no native representation** (Sankey, network/graph, chord, complex statistical plots) → only here render to an image and insert via `addImage()`.

```javascript
// Bar
slide.addChart(pres.charts.BAR, [{
  name: "Sales", labels: ["Q1","Q2","Q3","Q4"], values: [4500,5500,6200,7100]
}], { x: 0.5, y: 0.6, w: 6, h: 3, barDir: 'col', showTitle: true, title: 'Quarterly Sales' });

// Line
slide.addChart(pres.charts.LINE, [{
  name: "Temp", labels: ["Jan","Feb","Mar"], values: [32,35,42]
}], { x: 0.5, y: 2.5, w: 6, h: 2.5, lineSize: 3, lineSmooth: true });

// Pie
slide.addChart(pres.charts.PIE, [{
  name: "Share", labels: ["A","B","Other"], values: [35,45,20]
}], { x: 6.5, y: 1, w: 3, h: 3, showPercent: true });
```

**Make charts look modern (defaults look dated):**

```javascript
slide.addChart(pres.charts.BAR, chartData, {
  x: 0.5, y: 1, w: 9, h: 4, barDir: "col",
  chartColors: ["0D9488", "14B8A6", "5EEAD4"],            // match your palette
  chartArea: { fill: { color: "FFFFFF" }, roundedCorners: true },
  catAxisLabelColor: "64748B", valAxisLabelColor: "64748B", // muted axis labels
  valGridLine: { color: "E2E8F0", size: 0.5 },             // subtle grid, value axis only
  catGridLine: { style: "none" },
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: "1E293B", // data labels
  showLegend: false,                                       // hide legend for single series
});
```

## Slide masters & speaker notes

```javascript
// Master
pres.defineSlideMaster({
  title: 'TITLE_SLIDE', background: { color: '283A5E' },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 1, y: 2, w: 8, h: 2 } } }]
});
let titleSlide = pres.addSlide({ masterName: "TITLE_SLIDE" });
titleSlide.addText("My Title", { placeholder: "title" });

// Speaker notes (visible only in Presenter View, not on the slide)
slide.addNotes("Open with the FY25 revenue headline; pause after the number. If asked about the Q3 dip: supply chain, resolved in Q4.");
```

## Common pitfalls (file corruption / visual bugs / AI look)

1. **Never use `#` with hex** — corrupts the file: `color: "FF0000"` ✅ / `"#FF0000"` ❌
2. **Never encode opacity in hex** — 8-char hex (e.g., `"00000020"`) corrupts the file; use the `opacity` property
3. **Use `bullet: true`** — never unicode `•` (double bullets)
4. **Use `breakLine: true`** between array items
5. **Avoid `lineSpacing` with bullets** (excessive gaps) — use `paraSpaceAfter` instead
6. **Fresh instance per presentation** — don't reuse the `pptxgen()` object
7. **Don't reuse option objects across calls** — pptxgenjs **mutates objects in place** (e.g., converts shadow values to EMU), so sharing corrupts the second shape. Use a factory that returns a fresh object:
   ```javascript
   const makeShadow = () => ({ type:"outer", blur:6, offset:2, color:"000000", opacity:0.15 });
   slide.addShape(pres.shapes.RECTANGLE, { shadow: makeShadow(), ... }); // ✅
   ```
8. **Don't add edge accent bars to cards** — use a `fill` tint or `shadow` to set them apart
9. **Rich text arrays emit one `<a:pPr>` per run** — two or more runs in a single paragraph produce duplicate, schema-invalid paragraph properties that only PowerPoint chokes on; see the note under "Text & formatting"

## Quick reference

- **Shapes**: RECTANGLE / OVAL / LINE / ROUNDED_RECTANGLE
- **Charts**: BAR / COLUMN / LINE / AREA / PIE / DOUGHNUT / SCATTER / BUBBLE / RADAR / combo (array of `{type, data, options}`)
- **Alignment**: `"left"` / `"center"` / `"right"`
- **Data-label position**: `"outEnd"` / `"inEnd"` / `"center"`

---

## Creating a presentation FROM a user-provided template (.pptx)

Route here when the user supplies a .pptx and wants a NEW deck built on it. Working from a template, you can infer the deck's design system — its layouts, typography, spacing, colors, and recurring content patterns, including the rules embedded in the Slide Master — and apply those conventions consistently to new material. Two non-negotiables: study the template BEFORE writing any content, and verify AFTER building — most template failures come from skipping one of the two.

> **Template inheritance (mandatory)** — If the user provides an existing PPT, a corporate template, or a reference file, you **must** follow the "template inheritance" flow rather than recreating a look-alike from scratch:  
>  
> - Analyze fonts, color scheme, spacing, footers, page numbers, placeholders, and brand elements.  
> - Build a mapping between source pages and new pages.  
> - Inherit existing layouts as much as possible instead of recreating a new set.  
> - Only modify elements that are allowed to be modified.  
> - Preserve the original template's visual language unless the user asks for a redesign.  
> - If no page in the original template can carry the target content, state the limitation explicitly and propose the closest alternative.

**1. Decide the mode — "use as template" hides two different jobs:**


| Mode             | User signal                                                            | Build                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Clone & fill** | new outline or free structure — "做成这个风格" / "用这个模板做一份 X" | clone template pages and fill them; pick which pages to reuse by role and shape your outline around what the template offers |
| **Fill-in**      | new content maps ≈1:1 onto the template's pages (换数据 / 换客户)     | in-place replacement — Approach A of the Editing section                                                                    |

Both modes edit the .pptx natively and output an editable PowerPoint — **never** route a template job through the from-scratch HTML pipeline; a foreign HTML-rendered page next to the template's real pages is instantly visible and loses the theme. Clone & fill builds a new deck on the template; Fill-in is the lighter in-place path. Everything below applies to both.

**2. Study the template (before generating any content) — programmatic first, vision only to break ties:**  
  • Inventory every text shape with python-pptx (recurse into GROUPs): position, size, font, current text length. The original text length is the budget ceiling — the **"Budget every shape"** rules of the Editing section apply verbatim. Collect this first; it also drives the role classification below.  
  • Classify each page's role (cover / section / content / stats / quote / closing…) — this role map is your layout catalog for planning. Derive the role from the inventory, not from an image: cover = few shapes + an outsized title (≥36pt) and/or a full-page background image; section = only 1–2 short text shapes; stats = a 60pt+ numeric shape; quote = a single large centered long-text box; content = several body boxes. Derive every page's role from the inventory alone — never fall back to rendering an image.  
  • Answer the one decisive structural question: does the design live in `slideLayouts` with real placeholders (→ clone & fill can `add_slide` + fill), or is it drawn on slides with free text boxes while layouts sit empty (common in downloaded templates; → clone & fill must clone slides at XML level)?  
  • Read the design's source of truth: `presentation.xml` for slide size (never assume 16:9); `theme1.xml` for colors and fonts — slide XML uses `schemeClr` indirection, the real hex lives in the theme (remapped by the master's `clrMap`), and CJK text renders in the `<a:ea>` font.

**3. Plan, then build — always on a COPY of the user's file:**  
  • **Decide the output path BEFORE you modify anything.** By default save to a NEW sibling file  
    (`<stem>_updated.pptx`), never touch the input; overwrite in place ONLY if the user explicitly  
    asks to edit their own file — then first copy it to `<stem>_backup.pptx` next to it (never  
    `/tmp`). `Presentation.save(path)` clobbers whatever path you name, so never pass it the user's  
    original.  
  • Write a short plan first: final page order; each page's template source (slide index to clone, or layout name) chosen by ROLE; replacement text written WITHIN the budget. If the user's outline and the template's structure conflict, surface the trade-off instead of improvising. (Clone & fill: since structure is free, let the template's available page roles drive the outline rather than forcing a shape the template can't carry.)  
  • Fill-in: follow the Editing section's Approach A as written.  
  • Clone & fill: materialize pages first — `add_slide` + fill placeholders when layouts are real; otherwise clone the slide at XML level (copy the slide part + its `.rels`, re-register media rIds, add to `sldIdLst` and `[Content_Types].xml`). **No helper scripts ship with this skill — write the clone yourself**, either in-process (`copy.deepcopy(src.slides[i]._element)` + `prs.part.relate_to(...)` to rebuild each rel) or by unpacking the file with `zipfile` (`ZipFile.extractall` → edit the XML → repack: write `[Content_Types].xml` as the first entry, use `ZIP_DEFLATED`, and add no directory entries). Then replace content page by page (scope mappings per slide — clones share identical source text), swap images by replacing the image part bytes (keep the shape and rId), and delete unused template pages LAST, high-index first. Never hand-build a from-scratch page next to template pages — a foreign page is instantly visible.

**4. Verify (mandatory before reporting done) — programmatic checks, no rendering:**  
The whole checklist is decidable without an image; run these and fix until clean:  
  • **Page order & count** — count `sldIdLst` against the plan.  
  • **Leftover placeholders** — grep the slide XML for `Click to add`, `xxx`, `lorem`, `TODO`, `[insert`.  
  • **Broken images** — confirm every image rId on a cloned page resolves to a real media part (empty frames come from dangling rels): for each slide walk `slide.part.rels` and assert every non-external rel has a `target_part` with a non-empty `.blob`.  
  • **File still opens** — reopen the saved copy with `Presentation(path)` and walk every slide's shapes. A dangling rel or malformed slide XML raises here; this load-and-walk is the XML validity check (there is no `validate.py` in this skill).  
  • **Fonts & colors unchanged** — diff the run/theme font+color against the original rather than eyeballing it.  
  • **Overflow / collision** — re-check the "Budget every shape" rule (`len ≤ orig_len × 1.1`) on the final text and compare each `left+width` against its neighbor. A passing budget is the overflow guard here — treat any shape over budget as a real defect and fix it (trim, widen, or shrink per the Editing rules).

## Editing an existing PowerPoint presentation (.pptx)

For in-place edits to an existing deck (Fill-in mode, and small fixes like typos or updating numbers), work on a COPY and pick the approach by what the edit touches:

> **Output first, modify second.** By default save edits to a NEW sibling file (`<stem>_updated.pptx`),  
> never touch the input; overwrite in place ONLY if the user explicitly asks to edit their own file —  
> then first copy it to `<stem>_backup.pptx` next to it (never `/tmp`). "Work on a copy" means the  
> *original stays byte-identical at its original path*, not merely that you opened it read-only.

- **Approach A — `python-pptx` script** — preferred for text replacement, deleting/reordering slides, and any edit that should preserve fonts/colors/layout. Simpler and safer than raw XML for content swaps.
- **Approach B — raw OOXML** — required for animations, transitions, comments, speaker notes XML, theme tweaks, custom layout edits — anything `python-pptx` can't reach.

### Approach A — `python-pptx` text replacement (preferred for text edits)

**Workflow**

1. **Inventory the deck** — walk every slide, recurse into GROUP shapes (`shape_type == 6`), `print(repr(para.text))`. Use the inventory as the source of truth for replacement keys; rendered text often contains hidden chars that won't survive copy-paste.
2. **Helpers** — keep the build script short:

   ```python
   from pptx import Presentation
   from pptx.enum.text import MSO_AUTO_SIZE
   from pptx.oxml.ns import qn
   from pptx.util import Emu, Pt

   def iter_text_frames(shapes):
       for s in shapes:
           if s.shape_type == 6:                 # GROUP → recurse
               yield from iter_text_frames(s.shapes)
           elif s.has_text_frame:
               yield s, s.text_frame

   def _norm(s):                                  # strip soft breaks before matching
       return s.replace("\x0b", "").replace("\r", "").strip()

   def replace_in_paragraph(p, new_text):         # first-run replace preserves formatting
       runs = p.runs
       if not runs:
           p.add_run().text = new_text; return
       runs[0].text = new_text
       for r in runs[1:]:
           r._r.getparent().remove(r._r)

   def apply_replacements(tf, mapping):           # full-frame match, then per-paragraph
       m = {_norm(k): v for k, v in mapping.items()}
       full = "\n".join(p.text for p in tf.paragraphs)
       if _norm(full) in m:
           parts = m[_norm(full)].split("\n")
           for i, p in enumerate(tf.paragraphs):
               replace_in_paragraph(p, parts[i] if i < len(parts) else "")
           return
       for p in tf.paragraphs:
           if _norm(p.text) in m:
               replace_in_paragraph(p, m[_norm(p.text)])

   def delete_slide(prs, idx):                    # call high-index first
       sld = list(prs.slides._sldIdLst)[idx]
       prs.part.drop_rel(sld.get(qn("r:id")))
       prs.slides._sldIdLst.remove(sld)
   ```

**Budget every shape BEFORE generating replacement text (do this first)**

Most overflow bugs come from generating copy without knowing the target box's capacity. Before drafting any replacement, walk the deck once and emit a capacity manifest — then feed it to the content step as a hard constraint.

For each text-bearing shape collect: `slide_idx, shape_id, w_cm, h_cm, font_pt, orig_text, orig_len`. Then:

- `budget = orig_len × 1.1`. The template designer already tuned `orig_len` for this box — treat it as the ceiling, not a starting point. This one rule is the actual overflow guard; don't over-engineer it with width/line-height estimates (glyph advance widths vary by font and by CJK-vs-Latin mix, so any `chars_per_line` formula is a rough guess that the `orig_len` cap already subsumes).
- `role = "label"` if `h_cm < 1.5` OR `orig_len ≤ 8` OR `font_pt ≥ 20`; else `"body"`.

Rules the generation step MUST obey:

- **Label boxes**: short phrase only. No full sentences, no trailing punctuation, no "term + explanation" expansion. Hard cap = `max(orig_len, 8)`. SWOT tiles, timeline tags, KPI labels all fall here.
- **Body boxes**: stay within `budget`. Font size is inherited from the template; shrinking is a last resort, not plan A.
- If the content is genuinely longer and the layout permits, **grow the box itself** (`widen_to_fit(shape, Emu(...))` — see below) rather than shrinking the font. Check first that `left + width` won't collide with the next shape.

**Handling long replacement / unwanted wrapping after replacement**

When a longer replacement wraps to a new line, apply remedies in this order (cheapest first):

```python
def widen_to_fit(shape, max_grow_emu=Emu(0)):
    """Let PowerPoint size the shape to its text. Pass max_grow_emu>0 to also
    grow the explicit width (centered on the original position) before sizing."""
    if max_grow_emu:
        shape.left -= max_grow_emu // 2
        shape.width += max_grow_emu
    shape.text_frame.word_wrap = True
    shape.text_frame.auto_size = MSO_AUTO_SIZE.SHAPE_TO_FIT_TEXT

def shrink_text_to_fit(shape):
    """Keep the box fixed; let PowerPoint shrink the font to fit."""
    shape.text_frame.word_wrap = True
    shape.text_frame.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE
```

> ⚠️ Both helpers only **write the autofit flag** into the XML — python-pptx does not compute the resized shape or the shrunk font-scale itself. The actual fit is applied by the viewer (PowerPoint / LibreOffice) when the file is opened, so your programmatic overflow check can't see the result. Prefer trimming to `budget` (below), which *is* verifiable without rendering.

1. **Budget first (preferred).** Check `shape.width` × `font_size` from inventory and trim the replacement so it fits the original visual budget. Numeric badges / small label boxes (`width ≤ 0.7"`, `font_size ≥ 16pt`) hold ~3–4 chars max.
2. **Widen the shape** with `widen_to_fit(shape, Emu(...))` when the content is genuinely longer and there's free space next to it. Always check the shape isn't going to collide with a neighbor first (compare `left+width` against the next shape's `left`).
3. **Shrink the font** with `shrink_text_to_fit(shape)` only for tight-layout boxes (table cells, numeric badges) where widening would break the grid. Last resort — it visibly breaks the typographic rhythm.

Skip `word_wrap = False`: it makes text overflow the box invisibly in PowerPoint and looks broken when exported.

**Critical gotchas**

- **Soft line breaks (`\x0b`)** silently break exact-match. Always `_norm()` both keys and lookups.
- **GROUP shapes** (`shape_type == 6`) hide text frames — recurse.
- **First-run replace** preserves formatting; `paragraph.text = ...` destroys it.
- **Short tokens collide.** `"01"`, `"%"`, `"18"` recur across slides — keep identity mappings or scope per slide index, never global cross-mappings like `"18": "12"`.
- **Delete slides high-index first** — deleting index 5 first shifts every later index down by one.

## Code Style Guidelines

**IMPORTANT**: When generating code for PPTX operations:

- Write concise code
- Avoid verbose variable names and redundant operations
- Avoid unnecessary print statements

## Dependencies

Required dependencies (should already be installed):

- **markitdown**: `pip install "markitdown[pptx]"` (text extraction)
- **pptxgenjs**: `npm install -g pptxgenjs` (creating presentations)
- **playwright**: `npm install -g playwright@1.50.0` (HTML rendering)
- **sharp**: `npm install -g sharp` (SVG rasterization and image processing)
- **LibreOffice**: PDF conversion — install from the Tsinghua mirror
  (`https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/26.8.0/`, see the hard
  requirement below); `sudo apt-get install libreoffice` only as a fallback
- **Poppler**: `sudo apt-get install poppler-utils` (pdftoppm)
- **defusedxml**: `pip install defusedxml` (secure XML parsing)

### 🔴 HARD REQUIREMENT — LibreOffice is missing

Every PPTX → PDF conversion and every rendered preview/thumbnail step depends on LibreOffice.

**If LibreOffice is not installed, you MUST install it. This is not a choice.**

**FORBIDDEN — do not do any of these:**
- ❌ Using Keynote, Microsoft PowerPoint, WPS Office, or any other program already on the user's
  machine *instead of* installing LibreOffice.
- ❌ Deciding on the user's behalf that the download is "too large", "too slow", or "not worth it".  
  **The package being large is NOT a reason to skip the install.** It is expected to be large.
- ❌ Asking the user "should I use Keynote/PowerPoint instead to save time?" — that is the same
  violation dressed up as a question. Do not offer the substitution.
- ❌ Silently degrading (shipping the deck without the render check) to avoid installing.

**REQUIRED sequence — no steps skipped, in this order:**

1. **Explain the necessity to the user.** LibreOffice is what renders the deck's real layout —
   master slides, themes, placeholder geometry — so it is the only way to verify slides actually
   fit before delivery. Substituting it means shipping an unverified deck.
2. **Tell them the download is large** (roughly several hundred MB) and may take a while. This is
   information for the user, **not** a decision point for you — state it and proceed to install.
3. **Install it now.** **Preferred source — Tsinghua TUNA mirror** (fast in China, current build):
   `https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/26.8.0/`. Pick the
   subdirectory matching the OS and CPU arch (`uname -m` / `$env:PROCESSOR_ARCHITECTURE`) and
   download the main package from it:

   | Platform | Path | Main package |
   |----------|------|--------------|
   | Linux x86_64 (deb) | `deb/x86_64/` | `LibreOffice_26.8.0_Linux_x86-64_deb.tar.gz` |
   | Linux ARM64 (deb) | `deb/aarch64/` | `LibreOffice_26.8.0_Linux_aarch64_deb.tar.gz` |
   | Linux x86_64 (rpm) | `rpm/x86_64/` | `LibreOffice_26.8.0_Linux_x86-64_rpm.tar.gz` |
   | macOS Apple Silicon | `mac/aarch64/` | `LibreOffice_26.8.0_MacOS_aarch64.dmg` |
   | macOS Intel | `mac/x86_64/` | `LibreOffice_26.8.0_MacOS_x86-64.dmg` |
   | Windows x64 | `win/x86_64/` | `LibreOffice_26.8.0_Win_x86-64.msi` |
   | Windows ARM64 | `win/aarch64/` | `LibreOffice_26.8.0_Win_aarch64.msi` |

   Linux (deb): `tar -xzf <pkg>.tar.gz && sudo dpkg -i LibreOffice_26.8.0*/DEBS/*.deb && sudo apt-get install -f -y`  
   macOS: `hdiutil attach <pkg>.dmg && cp -R /Volumes/LibreOffice/LibreOffice.app /Applications/ && hdiutil detach /Volumes/LibreOffice`  
   Windows: `msiexec /i <pkg>.msi /qn` (needs admin). Verify with `soffice --version`.

   **If 26.8.0 is gone** (the mirror keeps only a few releases), list  
   `https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/` and use the newest version  
   directory, substituting that version number above.

   Package-manager fallback, only if the mirror is unreachable:
   - macOS: `brew install --cask libreoffice`
   - Linux (Debian/Ubuntu): `sudo apt-get install libreoffice`
   - Windows: `winget install TheDocumentFoundation.LibreOffice`
4. **Register the binary on `PATH`, then re-verify.** Do this as part of the install, not as an
   afterthought: an install that leaves `soffice` off the executable search path is
   indistinguishable from "not installed" to the next `command -v soffice` probe — which re-triggers
   this whole block and makes you download several hundred MB you already have. **The mechanism
   differs per OS — use the one for the platform you are on:**

   | Platform | Register it | Then verify |
   |----------|-------------|-------------|
   | Linux | `sudo ln -sf /opt/libreoffice*/program/soffice /usr/local/bin/soffice` | `soffice --version` |
   | macOS | `sudo ln -sf /Applications/LibreOffice.app/Contents/MacOS/soffice /usr/local/bin/soffice` | `soffice --version` |
   | Windows | `setx PATH "$([Environment]::GetEnvironmentVariable('PATH','User'));C:\Program Files\LibreOffice\program"` | `& "C:\Program Files\LibreOffice\program\soffice.exe" --version` |

   Notes: on Apple Silicon `/usr/local/bin` is not always on `PATH` — if the verify still fails, link  
   into `/opt/homebrew/bin` instead. On Windows `setx` only affects **newly launched** shells, so for  
   the rest of the current session call `soffice.exe` by its full path. Only continue once the verify  
   prints a version. Corollary: **probe before installing** — if the binary already exists on disk  
   but off-`PATH` (check `/opt/libreoffice*/program/soffice`,  
   `/Applications/LibreOffice.app/Contents/MacOS/soffice`,  
   `C:\Program Files\LibreOffice\program\soffice.exe`), register it instead of reinstalling.
5. **Only after that install has actually been attempted AND failed** may you use software already
   on the user's machine (Keynote, PowerPoint, WPS). Report the install failure and what you
   switched to, and warn that the rendering may differ from this skill's normal checks.

> **The gate is simple: no install attempt = no substitute program.** If you have not run the  
> install command and seen it fail, using Keynote/PowerPoint/WPS is a violation of this skill.

---

## Final response citations

Place `::zcode-file-citation{...}` inline in prose, not in a trailing list. Use `purpose="source"` for Q&A/no-op and `purpose="output"` for create/edit.

- [HARD REQUIREMENT] Create/edit: cite each final file exactly once with a plain output citation. Summarize representative changes; do not cite every slide or add a separate filename, path, or Markdown link. Example: `Created ::zcode-file-citation{path="/abs/path/launch-deck.pptx" purpose="output"}, highlighting the rollout and owners.`
- Q&A: do not edit/re-export.

### Presentation

inspect the complete relevant slide, including callouts, question wording, chart/table titles, totals/sample sizes, and source/methodology footers. Answer directly, group same-slide claims, and cite that slide once. For concrete chart/table/image/diagram/callout evidence, include exact inspected `slide_id`, `object_id`, and a useful label when available.

For non-in-place edits, preserve the source and export a copy; if unchanged, cite the source plainly.

Use only locators verified against the latest render/inspection:

```text
::zcode-file-citation{path="/abs/path/deck.pptx" purpose="source" artifact_kind="presentation" slide_number=3}
::zcode-file-citation{path="/abs/path/deck.pptx" purpose="source" artifact_kind="presentation" slide_number=1 slide_id="sl/gs5z1kshq0xv" object_id="ch/pz9t1r3ka8vn" label="ARR by segment chart"}
```

If IDs are not exact, stop at `slide_number`; never guess or cite intermediates unless asked.
