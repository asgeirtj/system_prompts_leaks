---
description: The CSS contract slides are authored against, covering theme tokens, the canvas, and the layout scaffolds.
---

# Slide design system

- This is the CSS contract every slide is authored against: the theme tokens, the canvas and the hero, lockup and content-layout scaffolds. The StylePlan supplies the token values (`css_variables`), picks each slide's layout and picks the deck's lockup pair.

- All of it lives in the deck's own `.src/slides/deck.css`, which every slide file links. There is no external foundation CSS and no external font reference: `embed_deck_fonts.mjs` writes the theme's fonts into `deck.css`.

## Theme tokens

- Emit the StylePlan's `css_variables` verbatim into a single `:root` block, then reference the variables everywhere. Never hardcode a theme hex or font-family name and never redefine these tokens. The page backdrop, the hero-scrim fallback and hero-overlay text below are the intended literal-color exceptions.

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

- Set `--hero-scrim-color` only on a full-bleed hero slide, as a dark tone sampled from its image, never in `:root`. The `var(--hero-scrim-color, #1a1a2e)` fallback keeps an unset value safe.

## Name the fonts and write no font URL

- Both StylePlan fonts are Google Fonts families, but a deck never references Google. Write no `@import`, no `<link>` and no `fonts.googleapis.com` or `fonts.gstatic.com` URL, in `deck.css` or in any slide file.

- Name each family in `--slide-font-display` and `--slide-font-body`. Step 7 of the workflow runs `embed_deck_fonts.mjs`, which downloads those faces and writes them into `deck.css`. The render browser cannot fetch a webfont at all, so an external reference makes the font gate fail rather than satisfying it.

- Those `:root` names are the download's only input, so spell each family exactly as Google publishes it.

- Weights come from the CSS you write, so `font-weight: 900` is what fetches a real 900 face. Google returns only the weights a family publishes. Every current StylePlan family publishes `400`, while single-weight display families such as `Bebas Neue`, `Anton`, `DM Serif Display` and `Archivo Black` do not publish `600` or `700`.

- Never hand-write an `@font-face` rule or its base64. One face is over 100 KB, and the script is the only thing that should write it.

- Keep each exact StylePlan family first in its `:root` font stack and never substitute a local family for it. A local or generic fallback may follow it for an HTML deliverable opened offline, but it does not satisfy the slide render gate.

- The report separates a theme face that was unavailable (`fonts.missing`) from one that resolved but no element used (`fonts.unused`). `fonts.used` lists the families Chromium actually rasterized.

- Replacing the primary family with `Liberation` or `Noto` does not fix a load failure. It ships the deck in a generic system face. The slide render uses `--require-webfonts`, so even an installed local face with the same name cannot satisfy the webfont policy.

- When the gate flags a face, check the family spelling in `:root`, run `embed_deck_fonts.mjs` again and re-render. Gate both families at `400`, and add a heavier face to the gate only when the family publishes that exact weight.

## Canvas

- Each slide is one `section.slide` in its own file, and assembly stacks them into the deck's one self-contained document. These rules live in `deck.css`:

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

- Put the layout class on the section, as in `<section class="slide slide-hero-stats">`.

## Content layout classes

- There are eight content layouts, plus `cover` and `closing`. The StylePlan assigns one per slide, which is the default, and a light slide can drop to a simpler layout. Build each with CSS Grid as [authoring](authoring.md) describes, using its type sizes:
  - `slide-two-column` holds two side-by-side prose or image columns.
  - `slide-bento` is a balanced grid of mixed stat, text and image cells.
  - `slide-hero-stats` holds up to three big stat lockups, each a number over its label.
  - `slide-headline-bullets` is a heading with up to five bullets.
  - `slide-steps` is an ordered, left-aligned vertical sequence.
  - `slide-comparison` holds before-and-after or A-versus-B blocks.
  - `slide-statement` is one centered editorial statement.
  - `slide-gallery` shows two or three subject-filling images in a row.

- `slide-statement`, `slide-hero-stats`, the cover and the closing use editorial-scale sizing, so let the heading or number be large. The rest follow the content sizes in [authoring](authoring.md).

## Cover hero scaffolds

- The cover carries only the hero image and the title. Pick the scaffold that fits the image's composition.

- Fill the hero edge to edge and never letterbox it. Give a hero image no `border-radius`, `border`, `box-shadow` or padding.

- Every cover scaffold splits the same way: the structure is shared in `deck.css`, and the embedded image sits in the slide file's own `<style>`, scoped to its ID. A `data:` hero in `deck.css` would make every slide carry one slide's image, and assembly refuses an unscoped selector in a slide file.

### Full-bleed

- Full-bleed suits a 16:9 image and is the usual choice. The title sits in the image's empty region. The shared scaffold goes in `deck.css`:

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

- The embedded hero and its sampled scrim tone belong to that one slide, so they go in its own scoped `<style>`:

```html
<style>
  #cover {
    background-image: url('data:image/...');   /* the embedded hero */
    --hero-scrim-color: #1a1a2e;               /* a dark tone sampled from the image */
  }
</style>
```

### Split panel

- A split panel suits a tall or portrait image. The image takes at least half the slide and bleeds to the edge, with the text on its own panel. The shared scaffold, without the image, goes in `deck.css`:

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

- The hero goes in the slide file's own scoped `<style>`:

```html
<style>
  #cover .image-panel { background-image: url('data:image/...'); }
</style>
```

- Put `.text-panel` first in DOM order to move the image to the right. Do not add a standalone accent-bar element.

### Diagonal split

- A diagonal split uses one clean full-height diagonal, with the text on the plain `var(--slide-bg)`. The shared scaffold, without the image, goes in `deck.css`:

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

- The hero goes in the slide file's own scoped `<style>`:

```html
<style>
  #cover .image-panel { background-image: url('data:image/...'); }
</style>
```

- Do not give `.text-panel` its own background or border, which would create a second straight edge.

## Lockups

- A lockup pairs text and an image on a content slide. Use only the deck's two assigned lockups (`StylePlan.lockups`, drawn from L1, L2 and L4). Fill the image cell edge to edge with `width: 100%; height: 100%; object-fit: cover; border-radius: 20px` so no blank band shows.
  - L1, left-heavy, uses `grid-template-columns: 55fr 45fr; grid-template-rows: auto 1fr;`. The image cell takes `grid-row: 2; grid-column: 1`, and the text cell takes `grid-column: 2`, vertically centered with `align-self: center`.
  - L2, right-heavy, mirrors L1 with the text in column 1 and the image in column 2.
  - L4, asymmetric and the strongest, is a 60/40 grid with the image filling its cell and the text inset by 56 pixels of padding. Prefer it.

## Closing

- The closing slide is centered text on one uniform background, as [authoring](authoring.md) describes. Add no scrim unless the text overlays a background photo.
