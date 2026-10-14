# Print design — posters, flyers, brochures, documents, anything that leaves as a PDF

Printed work leaves through Export PDF in one of two shapes. Decide which
BEFORE the first artboard; if the brief doesn't say and someone can
answer, ask in plain terms ("one designed page each, or text that flows
onto pages? what size?") — nobody to ask: documents flow, everything else
is Fixed, on Letter/A4.

- **Fixed pages** (`print` absent or `"fixed"`): each artboard is exactly
  ONE PDF page at its frame's size. Posters, flyers, certificates,
  résumés, brochure faces, one-pagers — any page designed as a layout,
  and any brief that states a page count.
- **Flow** (`"print": "flow"` + `"paper": "letter"|"a4"`): ONE artboard of
  running content that the export paginates. Reports, memos, letters,
  papers, guides.

(`print`, `paper`, `w`, `h` are the artboard's canvas.json fields — in a
canvas made from the type, the same keys of its `boards` entry in `project/canvas.json`.)

## Sheets and units (CSS px at 96 px/in)
- Fixed: the PDF page is the frame at that scale; Flow: the paper's size.
- Letter 816×1056 · A4 794×1123 · landscape = swap them (Fixed only).  
  Letter for North American readers, A4 for anyone clearly metric;  
  unsure → Letter.
- Fixed pages only: Legal 816×1344 · Tabloid 1056×1632 · A5 559×794 ·  
  A3 1123×1587 · a poster at a size the user GAVE = inches × 96  
  (18×24in → 1728×2304; a side ≤ 8000). No size given → design it on  
  Letter/A4, never an invented sheet.
- 1in = 96px · 1pt = 4/3px (12pt = 16px, 9pt = 12px) · 0.75in = 72px ·
  1mm ≈ 3.78px. Write px; think in points and inches. Never vh/vw or
  window percentages — they track a viewport the editor resizes, not
  the paper.

## Fixed pages
- Root element fixed to the frame's `w`×`h` (and the same `$preview`); FILL the
  page; anything past the edge is clipped in the PDF, never carried to a
  next page — budget heights before writing.
- Pages are full-bleed: backgrounds may run to the edge, content may not —
  keep ≥40px clear inside every edge, 72px (0.75in) around running
  text.
- A multi-page piece is a SERIES of artboards, one per page, laid out in
  reading order (left→right, then the next row) on one canvas page with
  nothing else on it; "All artboards (.pdf)" is every artboard on that
  page, in that order, as one file.
- Page numbers, running heads, a letterhead on every sheet: draw them on
  each artboard. Two-sided flyer = 2 artboards. Trifold = 2 artboards of
  3 panels: outside face = inside flap · back cover · FRONT cover
  (rightmost); inside face = one spread read left→right — write it in the
  order the reader unfolds it (cover promises, inside delivers in three
  beats, back carries logistics and contact).

## Flow documents
- `w` 816 with `paper` `"letter"`, or 794 with `"a4"`; portrait only. Root
  `width` = `w` and NO fixed height (a print document is px-wide and
  fluid-high; a PAGE has no px width at all) and no inner scroller;
  frame `h` = the content's height up to the 8000 cap (longer content still exports in full; the
  canvas shows the first 8000px).
- Margins are yours: pad the root 72px (0.75in) all round — that padding
  is the printed margin. At each break the export adds only
  ≈53px (5% of a page) below the cut and above the next page's content,
  filled with the `<body>`/`<html>` background — set the paper colour
  there, not on an inner box.
- Breaks are placed by the exporter, not by CSS: it cuts BETWEEN text
  lines and never through an `<img>`/`<svg>` (place photos as `<img>`,
  never `background-image` — those get cut); nothing else is kept whole —
  a bordered box, table or card can split between two of its lines.
  `break-before/inside`, `orphans`/`widows`, `@page` and a repeating
  `<thead>` do nothing here, and you cannot force a new page. Keep each
  figure + caption well under a page; a caption can still land on the next
  page, and an image taller than ≈950px is cut where the page ends. Where
  a split or a forced page start matters, make a Fixed series instead.
- ONE column of running text: CSS `columns` and side-by-side text columns
  run the whole document's height and are sliced across pages — use them
  only inside a block shorter than a page.
- Nothing repeats per page (no header, footer or page number); no
  `position: fixed/sticky`; ≤100 pages per artboard.

## Type, tables, ink
- Documents open with their own `<h1>` (no separate masthead), then a
  clear h2/h3 ladder; body 16px (12pt) at line-height 1.5–1.65, measure
  60–75 characters; captions and footnotes ≥12px (9pt), nothing smaller.
  `text-wrap: balance` on headings, `pretty` on body.
- Tables: a header row, ≥1px rules (finer hairlines vanish on paper),
  numbers right-aligned; figures and code blocks carry a one-line
  caption.
- Ink: body near-black on light stock; no huge dark floods; no grey text
  lighter than #767676; strokes ≥1px; it must still read in grayscale.
- A flyer is read from across a room in three seconds: ONE dominant line
  (≤6 words, 80px/60pt+), everything else clearly subordinate; the five
  Ws — what, when, where, cost, one way to act (short URL or QR, phone,
  an optional tear-off fringe of dashed cells) — grouped tight, not
  spread through prose; flat color blocks and vector shapes over photos
  and gradients; cut copy until the hierarchy is unmissable.
