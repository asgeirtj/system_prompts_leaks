---
name: office-pptx
description: >-
  Use this skill any time a .pptx file is involved as input or output — create,
  read, edit, combine, or split presentations, decks, and slides. Trigger on
  'deck', 'slides', 'presentation', 'PPT', 'PowerPoint', or a .pptx filename. If
  a .pptx needs to be opened, created, or modified, use this skill.
---
# PPTX

| Situation | Section |
|-----------|---------|
| Read, check, or preview any deck | [Read](#read) to [Finish line](#finish-line) |
| An existing `.pptx` is the source | [Edit an existing deck](#edit-an-existing-deck) |
| A new deck | [Create a new deck](#create-a-new-deck) and [Design](#design) |

New files come from PptxGenJS. The `office pptx` and `office` commands never
create a deck from nothing. They open one, change it, check it, and render
it.

## Setup

The commands are on `PATH`, work from any directory, and take `--help`.
Run Python with `python3`; python-pptx, openpyxl, pandas, and markitdown
are installed for it. PptxGenJS is installed globally, so
`require("pptxgenjs")` works from any folder. LibreOffice (`soffice`)
renders the previews with a fixed profile under `~/.cache/officekit`.
Previews use the fonts `fc-list` shows; `office pptx check-fonts` names the
substitute for a font the box does not have.

## Read

```bash
python3 -m markitdown deck.pptx           # all text as markdown
office pptx inventory deck.pptx                  # shapes, boxes, text with run fonts, pictures, theme fonts
office pptx inventory deck.pptx --slides 3 4 --json
office pptx inventory work/unpacked --slides slide7.xml slide12.xml   # unpacked folder, by slide file
office pptx check-fonts deck.pptx                # fonts the file uses vs fonts installed (+ substitutes)
office pptx media-grid deck.pptx media.jpg       # every file in ppt/media/ on one labeled sheet
```

## Look at it: contact sheet first

```bash
office render deck.pptx out/render                                   # PDF, slide-NN.jpg, contact.jpg
office pptx thumbnail-grid deck.pptx grid.jpg --titles                # small labeled grid
office pptx thumbnail-grid work/unpacked grid.jpg --cols 3 --per-grid 12   # grid-1.jpg, grid-2.jpg, ...
office pptx thumbnail-grid a.jpg b.jpg c.jpg -o grid.jpg              # grid from any images
```

Open `contact.jpg` before you look at single slides. It shows rhythm,
repeated skeletons, density, and color jumps at a glance. Then open the
`slide-NN.jpg` files that need a close look. Render again after every round
of edits.

Grid tiles are labeled `N · slideK.xml`: the position in the deck, then the
slide file. After a reorder they differ, so use the file name to find a
slide's XML. Hidden slides render and are labeled "(hidden)"; `slide-NN.jpg`
numbers are deck positions.

## Check

```bash
office pptx check-overlap deck.pptx              # text boxes that collide or leave the slide
office pptx check-overlap deck.pptx --autofit -o fixed.pptx
office validate out.pptx --original source.pptx
```

`office pptx check-overlap` compares the boxes written in the slide XML: text
on text, and shapes past the slide edge. Only shapes holding text are
compared. It does not measure text, so it cannot see text that overflows
its own box; find that on the render. `--autofit` sets `normAutofit` on
the text boxes in each finding, so PowerPoint shrinks their text on open.
Exit code 1 means a finding is still open.

`office validate` runs the OOXML schemas and checks shape ids. `--original`
hides issues that the source already had, so you only see the ones your
edit added. `--repair` fixes duplicate shape ids, the negative chart axis ids
python-pptx writes, and the element order PptxGenJS gets wrong (a misordered
`presentation.xml`, repeated `a:pPr`, a dangling third chart axis id). Run
it once on every PptxGenJS build.

`office pptx check-fonts` exit code 1 means a theme font, or a font that a
run with text names, is neither installed nor embedded. Each missing font
lists the face LibreOffice renders instead.

## Finish line

A deck is done when all of these hold:

1. `office pptx check-overlap` reports no errors, and you have looked at every
   warning on the rendered slide.
2. `office validate --original <source>` (or `office validate --repair` for
   a new PptxGenJS deck) reports OK.
3. `office pptx check-fonts` lists no missing faces that matter, or you have said
   which ones will fall back.
4. The final `contact.jpg` has been opened and reviewed, and it sits next
   to the output so the work can be audited.

## Edit an existing deck

When the input is already a `.pptx`, change that file. Do not rebuild it
in PptxGenJS unless a new design is wanted. A rebuild drops theme colors,
media, masters, and custom geometry.

The loop is: **inspect → cut → edit → check → render → look.**

```bash
office pptx thumbnail-grid source.pptx work/source_grid.jpg --titles   # what is in the deck
office pptx inventory source.pptx --slides 4 9                         # shape names, boxes, fonts
#   ... python-pptx: cut and reorder, then edit -> work/out.pptx (below) ...
office pptx clean work/out.pptx                                        # unlisted slides, orphaned media
office pptx check-overlap work/out.pptx
office validate work/out.pptx --original source.pptx             # add --repair for python-pptx charts
office render work/out.pptx work/render                                # open work/render/contact.jpg
```

### Cut, reorder, and re-layout

Cutting a big template deck down to the slides you need is usually the
fastest good result.

```python
from pptx import Presentation

prs = Presentation("source.pptx")
ids = prs.slides._sldIdLst
slides = list(ids)
for el in slides:
    ids.remove(el)
for n in [1, 4, 7, 12]:          # 1-based positions, in the new order
    ids.append(slides[n - 1])
prs.save("work/cut.pptx")
```

A slide left out of `sldIdLst` stays in the file until `office pptx clean`
removes it. python-pptx has no copy-slide call: to reuse a layout, add a
slide on the same slide layout (`prs.slides.add_slide(slide.slide_layout)`)
and fill it.

Run `office pptx clean` after your edits, not right after the cut. It drops
slides that `p:sldIdLst` no longer lists, media whose picture you deleted
(python-pptx leaves the relationship behind), and every part nothing links
to any more. Unused slide layouts stay, because the master still lists
them. Hidden slides (`show="0"`) count as slides.

### Prefer python-pptx

[python-pptx](https://python-pptx.readthedocs.io/) opens the package,
exposes slides and shapes, and writes a new zip.

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

prs = Presentation("source.pptx")
slide = prs.slides[0]

for shape in slide.shapes:
    if not shape.has_text_frame:
        continue
    for paragraph in shape.text_frame.paragraphs:
        for run in paragraph.runs:
            if "PLACEHOLDER" in run.text:
                run.text = run.text.replace("PLACEHOLDER", "Q3 review")
            run.font.size = Pt(18)
            run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)

prs.save("output.pptx")
```

Useful surfaces:

- `prs.slides`, `prs.slide_layouts`, `prs.slide_width` / `slide_height`
- `shape.has_text_frame`, `shape.text_frame.paragraphs`, `run.font`
- `shape.has_table` → `shape.table.cell(r, c).text_frame`
- add a slide with `prs.slides.add_slide(prs.slide_layouts[n])`
- drop a picture with `slide.shapes.add_picture(path, left, top, width, height)`
- delete a shape with `el = shape._element; el.getparent().remove(el)`,
  then let `office pptx clean` remove its media
- python-pptx charts (`slide.shapes.add_chart`) write negative axis ids
  that fail the schema; `office validate --repair` rewrites them

python-pptx does not round-trip every theme trick. After a large edit,
render the result and look at the contact sheet.

Do not drive the XML with `sed` / `perl`. Apostrophes, entities, and
split tags break.

### When you need the XML

Unpack, edit the XML with a parser (lxml), and pack again. Do not hand-zip a
folder: `office pack` puts `[Content_Types].xml` first, condenses the
pretty-printed whitespace, and validates against `--original` in the same step.

```bash
office unpack source.pptx work/x/
#   ... edit work/x/ppt/slides/slide3.xml ...
office pack work/x/ work/out.pptx --original source.pptx
```

Namespaces you will see:

- `p` `http://schemas.openxmlformats.org/presentationml/2006/main`
- `a` `http://schemas.openxmlformats.org/drawingml/2006/main`
- `r` `http://schemas.openxmlformats.org/officeDocument/2006/relationships`

Slide order lives in `ppt/presentation.xml` (`p:sldIdLst`). To reorder or
delete slides, change that list, then run `office pptx clean`, which
removes the slides the list no longer names. A `<p:sldId>` that points
nowhere makes PowerPoint show a repair dialog, so change the list and
`ppt/_rels/presentation.xml.rels` together.

### What to replace

Everything the audience will read: titles, body, footers, captions, text
in groups. Stock leftovers ("Name Title or Position", template-vendor
marks) are the usual miss. `markitdown` after the save is a cheap sweep:

```bash
python3 -m markitdown output.pptx | grep -iE "lorem|placeholder|click to|name title"
```

Keep the source palette and typefaces unless a retheme was asked for. A
quiz template can carry a portfolio review. New runs should copy a nearby
`font.name` and size.

Look for overflow, collisions, leftover template strings, empty wells, and
footer chrome that no longer matches the new topic. Find overflow on the
render; `office pptx check-overlap` does not measure text. Mechanical
overflow is usually a box size or `word_wrap` fix. Use `--autofit` only
for small overflows. A missing font on this box changes the preview, not
the file.

## Create a new deck

Build a new `.pptx` with [PptxGenJS](https://gitbrent.github.io/PptxGenJS/).
There is no pack/unpack step: `pres.writeFile()` writes the zip. The
commands take over after that: check, validate, and render.

### Plan first

Write one line per slide before opening an editor.

- Title is a claim, not a label. "Deferred maintenance is the budget risk"
  beats "Budget Overview". Covers and section breaks can stay short.
- Name the slide's one visual: chart, diagram, photo, or a large number.
  If most slides have none, the deck idea is still unfinished.

### Use a template

The templates are complete PptxGenJS programs (palette, type, layout).
Most requests, including "plain professional", look better as a refill of
one of these than as a from-scratch file.

1. **Search** the template catalog. `--paths` prints just the matching
   `.js` files:

   ```bash
   office pptx search-templates white luxury
   office pptx search-templates dark minimal --paths -n 3
   office pptx search-templates --typography serif
   office pptx search-templates --color white red
   office pptx search-templates minimalist --mood corporate --density balanced
   office pptx search-templates --density data-heavy      # only a handful are data-heavy
   ```

   Flags: `--mood`, `--color`, `--density`, `--typography`, `--background`,  
   `--accent`, `--limit`. Keywords are ranked (BM25), not required, so the  
   match count is large; look at the top few. Ties are shuffled, so list  
   order is not a quality ranking. Pick by palette, density, and mood, not  
   by the sample topic baked into the file. Stdout is JSON (or paths); the  
   "Showing N of M" note goes to stderr.

   Render two or three candidates before choosing: copy each, run  
   `node <copy>.js`, then `office pptx thumbnail-grid <out>.pptx grid.jpg`.

2. **Copy** the template into the working folder, then edit the copy:

   ```bash
   cp "$(office pptx search-templates dark minimal --paths -n 1)" work/presentation.js
   ```

3. **Refill.** Each file starts with color/font constants and shared
   helpers, then one function or marked block per slide
   (`function slide07()` or `// === slide 7 ===`). Change the constants
   for brand, rewrite the strings, delete unused slide functions, clone a
   block when you need another slide of the same shape. Keep the
   coordinates and background helpers. Retyping "in the same style" from a
   blank file usually loses the alignment.

4. **Raise the content, keep the chrome.**
   - Swap label titles for the takeaway lines from the plan.
   - Put the planned visual on the slide. Icon-row + text-panel is a
     starting point, not the finish.
   - Drop fake buttons: footer nav chevrons, pill "links", page chips that
     look clickable. A page number plus one identifier is enough.
   - If titles are the same sans as body, point the title constant at a
     display face from `fc-list` and leave body alone.
   - Templates carry vendor chrome and fonts the box may not have. Before
     the first run, grep the copy for the vendor name, author metadata
     (`pres.author`, `company`), header/footer strings, and the
     `fileName`, and set the font constants to installed faces
     (`office pptx check-fonts out.pptx` after a run lists them).

5. **Run** it: `node presentation.js`. It writes the `.pptx` named by its  
   `fileName`.

6. **Repair, check, and look**:

   ```bash
   office validate output.pptx --repair       # once after every node run
   office pptx check-overlap output.pptx
   office pptx check-fonts output.pptx
   office render output.pptx render/                # open render/contact.jpg
   ```

   PptxGenJS writes a few schema defects PowerPoint tolerates: a  
   misordered `presentation.xml`, a dangling third chart axis id, repeated  
   `a:pPr` in multi-run paragraphs, and duplicate shape ids on tables.  
   `--repair` fixes exactly those, so the output reports OK. Everything  
   else: fix the source `.js` and run it again; do not hand-patch the  
   generated file. Repeat until `office pptx check-overlap` has no errors and the contact  
   sheet reads well.

### PptxGenJS from scratch

Use this only when a blank file was asked for or no template fits.

```javascript
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" × 7.5"; also LAYOUT_16x9, LAYOUT_16x10, LAYOUT_4x3
pres.author = "Author";
pres.title = "Title";

const slide = pres.addSlide();
slide.addText("Hello", { x: 0.5, y: 0.5, w: 12, h: 1, fontSize: 36, color: "1A1A1A" });

pres.writeFile({ fileName: "output.pptx" });
```

Units are inches. `LAYOUT_16x9` is 10 × 5.625; `LAYOUT_16x10` is 10 × 6.25;  
`LAYOUT_4x3` is 10 × 7.5.

#### Text

```javascript
slide.addText("Headline", {
  x: 0.6, y: 0.4, w: 12, h: 0.8,
  fontFace: "Georgia", fontSize: 32, bold: true,
  color: "1A1A1A", margin: 0,
});

slide.addText([
  { text: "Bold ", options: { bold: true } },
  { text: "and italic", options: { italic: true, breakLine: true } },
  { text: "next line" },
], { x: 0.6, y: 1.4, w: 8, h: 1.2, fontSize: 16, color: "333333" });
```

`letterSpacing` is ignored; use `charSpacing`. Put `breakLine: true` on
every run except the last or the pieces glue into one line. `margin: 0`
lines the glyphs up with shapes that share the same `x`.

#### Lists

```javascript
slide.addText([
  { text: "One", options: { bullet: true, breakLine: true } },
  { text: "Two", options: { bullet: true, breakLine: true } },
  { text: "Nested", options: { bullet: true, indentLevel: 1, breakLine: true } },
  { text: "Numbered", options: { bullet: { type: "number" } } },
], { x: 0.6, y: 2.2, w: 8, h: 2 });
```

Do not put a `•` character in the string when `bullet: true` is set.  
`lineSpacing` on bullets opens huge gaps; use `paraSpaceAfter`.

#### Shapes

```javascript
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 4.5, w: 3, h: 1.4,
  fill: { color: "0F766E" },
  shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.12 },
});
slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 4, y: 4.5, w: 3, h: 1.4,
  fill: { color: "FFFFFF" },
  rectRadius: 0.08,
  line: { color: "E5E7EB", width: 1 },
});
slide.addShape(pres.shapes.LINE, {
  x: 0.6, y: 6.2, w: 12, h: 0,
  line: { color: "D1D5DB", width: 1 },
});
```

`rectRadius` only affects `ROUNDED_RECTANGLE`. A solid bar on top of a
rounded card will miss the corners; use `RECTANGLE` for bars. Shadow
`offset` must be ≥ 0; an upward shadow is `angle: 270`. Put alpha in
`opacity`, not in an 8-digit hex color.

PptxGenJS mutates option objects. Do not reuse one `shadow` or `fill`
literal across calls; return a fresh object from a small factory.

#### Images

```javascript
slide.addImage({ path: "photo.jpg", x: 8.5, y: 1.5, w: 4.2, h: 2.8,
  sizing: { type: "cover", w: 4.2, h: 2.8 } });
slide.addImage({ data: "image/png;base64,iVBORw0KGgo...", x: 1, y: 1, w: 2, h: 2 });
```

Independent `w`/`h` without `sizing` stretches. Derive one side from the
other if you need the native ratio. PNG, JPEG, GIF, and SVG (in current
PowerPoint) all work.

#### Charts and tables

```javascript
slide.addChart(pres.charts.BAR, [{
  name: "Sales", labels: ["Q1", "Q2", "Q3", "Q4"], values: [45, 55, 62, 71],
}], {
  x: 0.6, y: 1.5, w: 12, h: 4.5, barDir: "col",
  chartColors: ["0F766E", "14B8A6", "5EEAD4"],
  chartArea: { fill: { color: "FFFFFF" } },
  catAxisLabelColor: "64748B", valAxisLabelColor: "64748B",
  valGridLine: { color: "E2E8F0", size: 0.5 },
  catGridLine: { style: "none" },
  showLegend: false, showValue: true, dataLabelPosition: "outEnd",
});

slide.addTable(
  [
    [{ text: "A", options: { fill: { color: "0F766E" }, color: "FFFFFF", bold: true } }, "B"],
    ["1", "2"],
  ],
  { x: 0.6, y: 6.2, w: 8, colW: [4, 4], border: { pt: 0.5, color: "E5E7EB" } },
);
```

Default chart chrome looks dated. Paint series with the deck palette and
turn off the legend when there is one series. Types: BAR, LINE, PIE,
DOUGHNUT, SCATTER, BUBBLE, RADAR.

- `dataLabelPosition: "outEnd"` is ignored on stacked bars (`barGrouping:
  "stacked"`); label totals with a separate text box.
- Set `valAxisMinVal: 0` on bar charts. With a hidden value axis,
  LibreOffice previews may start the axis below zero.

#### Background and master

```javascript
slide.background = { color: "F8FAFC" };
pres.defineSlideMaster({
  title: "BLANK",
  background: { color: "F8FAFC" },
  objects: [],
});
const next = pres.addSlide({ masterName: "BLANK" });
```

Gradients are not a first-class fill. A gradient PNG as `background.data`
is the usual workaround.

#### Things that break the file

1. `#` in a hex color (`"FF0000"` is valid; `"#FF0000"` is not).
2. Eight-digit hex for alpha.
3. Reusing one `new pptxgen()` across two output files.
4. Sharing one options object between `addShape` / `addText` calls.
5. A Unicode bullet plus `bullet: true`.

## Design

These notes matter most on a blank file. On a template, keep its grid and
palette; still apply the content rules (claim titles, one visual, no fake
buttons).

**One structure per slide.** Two columns (copy + picture), a 2×2 or 2×3
with one image cell, a half-bleed photo with type on the other half, a
process row, a comparison, or a 60–72pt number with a small label. A row
of icons in circles next to paragraphs is decoration, not a diagram.

**Cards.** A rectangle behind every paragraph is the common AI tell. Sit
type on the slide color and group with space and a thin rule. A card is
fine when it actually groups something. Size it to the copy; equal-height
grids on uneven text leave empty wells.

**Color.** One accent, siblings share a fill. A new hue per item implies
categories you did not define. Red is risk or miss; green is health or
pass. Do not use them as decoration. Blue is the default everyone picks.

**Draw the relationship the copy names.** If the sentence says "two axes",
"five stages", or "timeline", draw that. A card grid flattens it.

**Type scale** (lock it and reuse): title 36–44pt bold; section 20–24pt;
body 14–16pt; caption 10–12pt muted. Pair a display face for titles with a
quiet body face. `fc-list` shows what is installed. Display faces often
lack − × ≤ → glyphs, and the renderer falls back to a thin face for just
that character. Check with `fc-list ":charset=2212" family` (the hex code
point), or use ASCII (-, x) in big numbers.

**Space.** 0.5" from the slide edge; 0.3–0.5" between blocks, one value
for the whole deck. Left-align body. Center titles only. Shared constants
for sibling `x` / `w` / gutters beat retyped numbers.

**Skip.** Repeated skeletons; title + bullets with no visual; fake
buttons; grey photo wells; a donut that disagrees with its printed %;
"Max 20 slides" or "Version 1.0" chips; `Topic · Date · Confidential`
kickers on every slide; accent underlines under titles; random dark/light
flips. A cover motif (one shape or rule) echoed on the closer is enough
continuity.
