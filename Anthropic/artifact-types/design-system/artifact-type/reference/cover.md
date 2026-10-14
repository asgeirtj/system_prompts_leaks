# The cover — components/Cover/preview.html

Every system has one. A preview document exactly like a component's — the marker on
line 1 (`<!-- @dsCard height=288 -->`; 240–360), the same preview frame,
preload (tokens.css, the fonts, bundle.css, bundle.js), caps and theme
hand-off — that Overview shows above the brand book, so a system has a face
the moment it opens. Keep the folder BARE: a README.md or Cover.d.ts beside
it, or `Cover` in the bundle header, makes it an ordinary component and the
system has no cover. make.ts checks it like every preview; `--render-check`
renders it. Write it LAST, from what you built.

## The direction: palette and pattern

A cover shows the two things a person remembers a system by — its colours
and its shapes — with the name as the figure. All three parts, every time:

1. **Colour blocks.** The palette as big solid fields, not chips: three to
   five blocks in the system's identity colours at FULL value — brand,
   accent and signal hues, a deep ink or a dark surface, one tint for
   relief — together a quarter to a half of the cover. Weight them by
   identity, not UI frequency: the colours people know the brand by take
   the big blocks even where the UI spends them sparingly (a neutral-first
   system leads with its one or two hues); a colour that only ever means a
   state (error red) stays small. Cut them from the scales: sides are
   spacing steps or multiples, corners are radius tokens (square for a
   square system; for a pill or disc set `rx` to half the short side — an
   SVG `rx` of 9999px draws an ellipse, not a pill). Arrange them the way
   the brand composes — a flush modular grid, a staggered stack, one tall
   slab with satellites, a strip of unequal bands, blocks bleeding off the
   top or right edge. Never a row of equal squares: that is a swatch table.
2. **One pattern**, over or between the blocks, in block colours (or the
   ground cut out of a block), picked from what the system says about
   itself — the README's principles and the tokens' `usage` notes:
   - soft, friendly, large radii → discs, pills, half-rounds from the
     radius scale
   - precise, technical, mono, a 4px grid → a dot or plus grid at one
     spacing step
   - editorial, serif, "borders not shadows" → a FEW hairline rules (the
     system's hairline token at its own strength) or a baseline grid
     crossing the blocks — never a field of rules, never rules without  
     blocks
   - loud, bold, poster type → stripes, chevrons or a checker at a
     spacing pitch
   - geometric, modular, dense UI → tiles cut by the radius tokens, some
     merged two-wide like the components
   - a literal motif (lens, wave, leaf, ticket, spark) → arcs,
     quarter-circles or that silhouette built from radii
   - a distinctive display or numerals face → one oversized glyph or
     numeral used as a shape, clipped by a block

   Shapes, not pictures: no faces, mascots, icons or scenes. Take the row  
   that is most specifically THIS brand and say why in the derivation; if  
   a generic system would land on the same row AND the same arrangement,  
   change the arrangement. Geometry from the scales (pitch, gap, radius  
   are tokens); a dozen to sixty units for tiles, dots or pills, three to  
   six rules — never hundreds.
3. **The name** in the display face (one-family systems: the body family at
   display weight), as large as 120px, leading .9–.95 (.95 or more on two
   lines), bottom-left on the GROUND in ink, with one tagline line under
   it at 13–14px in muted (the README's, or one sentence in the system's
   voice), the two in a text block at most 440px wide. No other words. The
   name reads exactly as the README writes it — same words, same case —
   breaking only at a space or hyphen it already has (never inside a
   word), two lines at most. Zone it: pick a size from 120 down to 64px at
   which its longest line measures ≤ 440px (fallback faces run up to a
   fifth wider: count 0.6em a letter for a sans, 0.55 for a serif, 0.62
   for a mono); lines × size + tagline + two steps must also fit the
   height. If it is still wider than 440px at 64px, use the top-band
   skeleton (see Rules). Otherwise every block and pattern unit sits right
   of x = 480: nothing crosses the name or the tagline, hairlines included.

Rules:
- **One inline SVG plus the two text elements, over the ground**; every
  fill, stroke and `rx` a class bound to a token (`.brand{fill:var(--brand)}`,
  `.tile{rx:var(--radius-lg)}`; pills and discs: half the short side). No
  images, no gradients or shadows the tokens don't define.
- **Both themes are the same file.** Render dark and LOOK: a block within a
  few percent of the ground vanishes there — bind it to another token
  rather than outlining it.
- **One layout, at 960 × height.** Overview lays the cover out 960px wide
  and scales the whole picture down to fit a narrower page, so it looks the
  same at every width. Write nothing responsive: no width queries (container
  or media), no `cqw`/`vw` sizes, no narrow layout. The blocks and pattern
  sit in one box from x = 480 to the right edge. The one other skeleton: a
  band of blocks and pattern full-width across the top (96–120px tall, about
  a third of the height, a step clear of the name's cap line), the name
  beneath it, sized as in 3; a name that is here because it was too wide
  takes the largest size ≤ 64px at which its longest line fits 960px minus
  the text block's left and right insets. Use it for a brand that composes
  in horizontal strips, and whenever the name is too wide for its zone.
- **No motion.**
- **Squint:** the name reads first, then colour, then pattern; if the
  pattern wins, halve its count. **Thumb over the name:** the blocks and
  pattern alone should say which brand this is; if they could be anyone's,
  the colours or the row are wrong.
- **Derivation first** — four lines kept as a comment atop the SVG:
  blocks (tokens × sizes), arrangement, pattern row and the sentence that
  chose it, the steps and radii used. A blocks, pattern
  or scales line with no token in it means start over.

Avoid: the barcode (a field of thin vertical rules tightening toward an
edge), the swatch table, confetti (more than five colours or two
patterns), the poster (pattern louder than the name), words on blocks.
Regenerate when the name, palette, display face or scales change, not for
smaller edits. A person changes it by asking — in the chat or a comment
("quieter", "more of the green", "use the wave"): revise the file, keep the
derivation unless the ask changes it, save as a revision. It is not edited
in the page.
