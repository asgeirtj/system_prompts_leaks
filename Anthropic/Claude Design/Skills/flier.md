# Flier

Design a print-ready, single-page flier as one self-contained HTML
file: exactly one fixed-size page.

Sheet setup:
- START by calling copy_starter_component with kind: "doc_page.js",
  then build inside <doc-page size="letter" margin="0"> (size="a4"
  when the user is metric). The component owns the page box, the
  desk background that disappears at print, and all print geometry —
  do NOT write your own @page rule or body background.
- The flier is a single block of exactly 8.5in × 11in (A4: 210mm
  × 297mm) — the whole sheet, since margin="0" means the content
  fills the page box — and the print dialog must show exactly 1
  page, nothing spilling to a second sheet (watch trailing margins
  and whitespace).
- margin="0" makes the sheet full-bleed: the flier owns its own
  inset — keep a visual margin of at least 0.375in as the content
  block's own padding, and keep everything inside it.
- Physical units only (in/pt/mm) — no viewport units, no vh/vw.

A flier is read at a distance, in passing, in under three seconds:
- One dominant element — usually a headline under ~6 words — sized so
  it reads across a room (think 60pt+), everything else clearly
  subordinate.
- The five Ws grouped tight and scannable: what, when, where, cost,
  and one way to act (QR-sized URL, phone number, or tear-off) — not
  scattered through prose.
- Strong flat color blocks and vector shapes over photos and
  gradients; high contrast; body text in near-black on light stock.
- Generous whitespace beats more words — cut copy until the hierarchy
  is unmissable.
- Optional: a tear-off fringe along the bottom edge (a row of
  narrow cells with dashed left borders and rotated contact text) when
  the user wants phone-number slips.

Check the print preview: nothing clipped, nothing spilling to page
two, colors that still work in grayscale.
