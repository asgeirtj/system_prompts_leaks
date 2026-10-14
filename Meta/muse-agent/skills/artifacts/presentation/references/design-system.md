---
description: The CSS contract slides are authored against, covering theme tokens, the canvas, and the layout scaffolds.
---

# Slide design system

The CSS contract every slide is authored against: the theme token set, the canvas, and the
hero / lockup / content-layout scaffolds. The `StylePlan` you were handed supplies the token
values (`css_variables`) and picks each slide's layout + the deck's lockup pair. All of it lives
in the deck's own `.src/slides/deck.css`, which every slide file links; no external foundation
CSS, and the one external reference the deck carries is the theme's Google Fonts stylesheet,
imported at the top of `deck.css` (see below).

## Theme tokens (`:root`)

Emit the `StylePlan.css_variables` verbatim into a single `:root` block, then reference the
variables everywhere. Never hardcode a theme hex or font-family name; never redefine these.
(The page backdrop, the hero-scrim fallback, and hero-overlay text below are the intended
literal-color exceptions.)

```css
:root {
  --slide-bg: <paper>;           /* page background */
  --slide-fg: <ink>;             /* primary text */
  --slide-primary: <primary>;    /* emphasis: titles, key data, borders, icons (sparingly) */
  --slide-accent: <accent>;      /* supporting elements */
  --slide-muted: color-mix(in srgb, var(--slide-fg) 80%, var(--slide-bg));  /* de-emphasis; never opacity */
  --slide-font-display: "<display font>";  /* headings; quote multi-word names */
  --slide-font-body: "<body font>";        /* body */
}
```

`--hero-scrim-color` is set per-slide only on a full-bleed hero (a dark tone sampled from the
image), never in `:root`; the `var(--hero-scrim-color, #1a1a2e)` fallback keeps an unset value
safe.

**Name the theme fonts in `:root`, and write no font URL anywhere.** Both `StylePlan` fonts are
Google Fonts families, but a deck never references Google. Write **no `@import`, no `<link>`, and no
`fonts.googleapis.com` or `fonts.gstatic.com`**, in `deck.css` or in any slide file. You name each
family in `--slide-font-display` and `--slide-font-body`. Then `embed_deck_fonts.mjs` (workflow.md
step 7) downloads those faces and writes them into `deck.css`. The render browser cannot fetch a
webfont at all. So an external reference is what makes the font gate fail, not what satisfies it.

Those `:root` names are the download's only input. Spell each family exactly as Google publishes it.
Weights come from the CSS you write, so `font-weight: 900` is what fetches a real 900 face. Google
returns only the weights a family publishes; all current StylePlan families publish `400`,
while single-weight display families such as `Bebas Neue`, `Anton`, `DM Serif Display`, and
`Archivo Black` do not publish `600` or `700`. Never hand-write an `@font-face` rule or its base64.
One face is over 100 KB, and the script is the only thing that should write it.

**Keep each exact StylePlan family first in its `:root` font stack; never substitute a local
family for it.** A secondary local/generic fallback may follow for an HTML deliverable opened
offline, but it does not satisfy the slide render gate. The report distinguishes an unavailable
theme face (`fonts.missing`) from one that resolved but no element used (`fonts.unused`), and
`fonts.used` lists the families Chromium actually rasterized. Replacing the primary family with
`Liberation` or `Noto` does not fix a load failure; it permanently ships the deck in a generic
system face. The slide render uses `--require-webfonts`, so even an installed local face with the
same family name cannot satisfy the webfont policy. If the gate flags a face, check the family
spelling in `:root`, re-run `embed_deck_fonts.mjs`, and re-render. Gate both families at `400`;
add a heavier face to the gate only when the family publishes that exact weight.

## Canvas

Each slide is one `section.slide`, authored in its own file; assemble stacks them into the
deck's one self-contained document. These rules live in `deck.css`.

```css
* { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
html, body { margin: 0; background: #111; }
section.slide {
  width: 1280px; height: 720px;   /* 13.333in x 7.5in @96dpi; do NOT use min-height */
  overflow: hidden;               /* clips silently; budget content to ~620px usable */
  position: relative;
  background: var(--slide-bg);    /* opaque; an unset bg shows page grey and reads as broken */
  color: var(--slide-fg);
  font-family: var(--slide-font-body);
  page-break-after: always; break-after: page;
}
section.slide:last-child { page-break-after: auto; break-after: auto; }
```

Put the layout class on the section: `<section class="slide slide-hero-stats">`.

## Content layout classes

Eight content layouts (the ninth/tenth are `cover` and `closing`). The StylePlan assigns one
per slide; treat it as the default and let content drive the final choice (a light slide can
drop to a simpler layout). Author each with CSS Grid per `authoring.md`; sizes come from the
typography rules there.

| Class | For |
|---|---|
| `slide-two-column` | two side-by-side prose/image columns |
| `slide-bento` | a balanced grid of mixed cells (stat, text, image) |
| `slide-hero-stats` | up to 3 big stat lockups (number over label) |
| `slide-headline-bullets` | a heading + ≤5 bullets |
| `slide-steps` | an ordered, left-aligned vertical sequence |
| `slide-comparison` | before/after or A-vs-B blocks |
| `slide-statement` | one centered editorial statement |
| `slide-gallery` | 2-3 subject-filling images in a row |

`slide-statement`, `slide-hero-stats`, and the cover/closing use editorial-scale sizing (let
the heading/number be large); the rest follow the content sizes in `authoring.md`.

## Cover hero scaffolds

The cover carries the hero image + the title only (see `authoring.md`). Pick the scaffold that
fits the image's composition. Fill the image edge-to-edge; never letterbox a hero; no
`border-radius`/`border`/`box-shadow`/padding on a hero image.

**Full-bleed** (suits a 16:9 image, the usual choice; title sits in the image's empty region).
The scaffold is shared, so it goes in `deck.css`:  
```css
section.slide.cover {
  background-color: var(--slide-bg);
  background-size: cover; background-position: center;
}
section.slide.cover::after {              /* bottom-band scrim ONLY, never inset:0 */
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 55%;
  background: linear-gradient(transparent,
    color-mix(in srgb, var(--hero-scrim-color, #1a1a2e) 90%, transparent));
  z-index: 1;
}
.cover .title-block { position: absolute; bottom: 40px; left: 56px; right: 56px; z-index: 2; color: #fff; }
```

The embedded hero and its sampled scrim tone belong to that one slide, so they go in the slide
file's own `<style>`, scoped to its id (`workflow.md` step 5):  
```html
<style>
  #cover {
    background-image: url('data:image/...');   /* the embedded hero */
    --hero-scrim-color: #1a1a2e;               /* a dark tone sampled from the image */
  }
</style>
```

**Split panel** (suits a tall/portrait image, image ≥50%, edge-bleed, text on its own panel).
Shared scaffold, in `deck.css`, image left out:  
```css
section.slide.cover { display: flex; padding: 0; }
.cover .image-panel {
  flex: 0 0 50%; position: relative;
  background-size: cover; background-position: center;
}
.cover .text-panel {
  flex: 0 0 50%; background: var(--slide-bg);
  display: flex; flex-direction: column; justify-content: center;
  padding: 64px 56px; color: var(--slide-fg);
}
```
The hero itself belongs to that one slide, so it goes in the slide file's own `<style>`, scoped:  
```html
<style>
  #cover .image-panel { background-image: url('data:image/...'); }
</style>
```
Put `.text-panel` first in DOM order to flip the image right. No standalone accent-bar div.

**Diagonal split** (one clean full-height diagonal; text on the plain `var(--slide-bg)`).
Shared scaffold, in `deck.css`, image left out:  
```css
section.slide.cover { position: relative; padding: 0; background: var(--slide-bg); }
.cover .image-panel {
  position: absolute; inset: 0 0 0 0; width: 100%;
  background-size: cover; background-position: center;
  clip-path: polygon(0 0, 58% 0, 42% 100%, 0 100%);
}
.cover .text-panel {
  position: absolute; top: 0; right: 0; bottom: 0; width: 42%;
  display: flex; flex-direction: column; justify-content: center;
  padding: 56px 60px 56px 40px; z-index: 2; color: var(--slide-fg);
}
```
Hero in the slide file's own `<style>`, scoped the same way:  
```html
<style>
  #cover .image-panel { background-image: url('data:image/...'); }
</style>
```
Don't give `.text-panel` its own background/border (that creates a second straight edge).

Every cover scaffold splits the same way: structure shared in `deck.css`, the embedded image in the
slide's own scoped `<style>`. A `data:` hero in `deck.css` would make every slide carry one slide's
image, and an unscoped selector in a slide file is refused by assemble.

## Lockups (text + image on a content slide)

Use only the deck's two assigned lockups (`StylePlan.lockups`, drawn from L1/L2/L4). Fill the
image cell edge-to-edge (`width:100%; height:100%; object-fit:cover; border-radius:20px`) so no
blank band shows.

- **L1 left-heavy**: `grid-template-columns:55fr 45fr; grid-template-rows:auto 1fr;` image cell
  `grid-row:2; grid-column:1`, text cell `grid-column:2` vertically centered (`align-self:center`).
- **L2 right-heavy**: L1 mirrored (text column 1, image column 2).
- **L4 asymmetric** (the strongest; prefer it): 60/40 grid, image fills its cell, text inset
  with 56px padding.

## Closing

Centered text on one uniform background (see `authoring.md` for the full closing rule). No
scrim unless text overlays a background photo.
