# Recreating the user's UI — lift it, don't redraw it

When the film shows the user's product, the stills must pass for
screenshots. That only happens when the UI in the film IS their UI: its
element tree, its compiled CSS, its tokens, its icons, its copy — pruned
to what the camera sees. Claude is far better at recreating an interface
from code than from memory or a screenshot, so when the source is
reachable (their repo, a pasted component, a design file, a running
build), read it and build from it; screenshots are for checking, not for
measuring. It has to be THEIR product (or an original design): another
company's distinctive UI is not yours to recreate.

## 1. Find the real thing

- Ask where it lives: a repo path, a dev server or deployed URL you can
  reach, a Storybook, a design file or exported HTML, screenshots as a
  last resort. Start from what is visible: grep the code for the exact
  strings on screen (placeholder text, menu labels, button titles), walk
  up to the component that renders them and down through everything it
  composes. Note the page/route component too — it sets widths, gutters
  and the split between panes.
- Collect, with file:line so you can re-check: the component tree for
  each surface; the design tokens actually referenced (CSS custom
  properties → hex, including alpha greys for hairlines and hover
  washes); font stacks and the type scale (and get the font FILES — they
  become assets); the icon set and the icon names used; radii, paddings,
  gaps, shadows, border colors; the real copy (i18n files included);
  state variants (hover, selected, loading, streaming, disabled) and
  what toggles them.
- Prefer the variant real users see today (feature flags default off
  unless the brief is about the flagged thing). If two shells exist,
  ask which in the intake message.
- **Keep `film/SOURCES.md`** as you go: per surface, the component
  files (file:line), the token file, the icon names, the copy source,
  and every value you could NOT lift (marked "approx", with what you
  did instead). The hand-off caveats and your background check both
  read from it.

## 2. Lift it — two routes

**A. A rendered copy is reachable** (a dev server, Storybook, a deployed
page, an exported design artboard, an HTML mock): drive it headless into
the state you need (stub the flag or the response that unlocks it), then
lift markup, CSS and numbers in one go. Keep class names verbatim.
Highest fidelity, cheapest:

```js
// playwright-core is installed in the skill dir; point it at the page and the subtree you need
await page.coverage?.startCSSCoverage?.();                    // Chromium: which rules actually apply
await page.goto(url); await page.waitForSelector(sel);
const html = await page.$eval(sel, (n) => n.outerHTML);
const css = await page.evaluate(() => [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } }).join('\n'));
const used = await page.coverage?.stopCSSCoverage?.();         // ranges → keep only used rules when pruning
const probe = await page.$eval(sel + ' [data-testid], ' + sel + ' button', (ns) => ns.slice(0, 12).map((n) => { const c = getComputedStyle(n), r = n.getBoundingClientRect(); return [n.className, r.width, r.height, c.fontSize, c.fontWeight, c.borderRadius, c.padding, c.color, c.backgroundColor]; }));
```

Write `probe` into SOURCES.md: those are the numbers you check your
close-ups against later.

**B. Source only**: rebuild the markup by hand FROM the JSX/templates —
the same element nesting, the same class strings, the same inline
styles — and GENERATE its CSS rather than remembering it: for
utility-class repos run the project's own CSS build over your lifted
markup (e.g. its Tailwind config with `content` pointed at your module
files) and keep the output; for CSS modules / vanilla-extract / plain
stylesheets copy the compiled rules from the package's build output or
source; read custom properties from the token files and define them
verbatim at the top of your module. Copy exact numbers; never round to
a 4/8 px grid or substitute a framework default. Where the source
computes a size (a column clamp, a `calc()`), keep the formula.

Either way the product keeps its identity: its accent color, its
neutral buttons, its own spacing. The film's display type, accent and
lively motion belong to the cards and shapes around it, not inside
product chrome.

## 3. Make it film-ready

- **Strip behavior**: no `<script>`, handlers, iframes, external
  `src`/`href`/`url()`; a product video becomes a clip asset. Product imagery becomes film assets
  (`assets/…`, referenced through `kit.assets.url(name)`) or inline SVG.
- **Fonts**: ship the product's faces as font assets (a Google family, in a film of scenes: a slot of `fonts`, finalize.md's **Fonts**) and map its
  families onto them with a few override rules at the end of your module
  (`--font-ui: "BrandSans-500"`); a look-alike face is the first thing
  that reads "mock". **Icons**: product chrome is half icons, and a wrong
  stroke weight is the second; inline the real SVG paths (or the icon
  font as an asset) — never emoji or a look-alike.
- **Prune** the CSS to rules that match something on screen (a coverage
  pass in a headless page, or by hand from the class list) — a lifted
  app stylesheet is 400 KB+, a pruned scene is 30–150 KB. Keep
  `@font-face` out (assets register themselves); keep keyframes out
  (they won't run). Split what remains into modules per surface.
- **Namespace each plate** (prefix or wrapper class) — two lifted
  surfaces will share a class name (`.session`, `.composer`) and one
  silently restyles the other.
- **States are attributes you toggle from t** (`data-hover`,
  `data-sel`, `data-on` + rules for them) — `:hover` and friends never
  fire in a film: menu open, row hover tint, selected ring, button
  pressed, "Saving…", toast shown. Menus, popovers, toasts and "after"
  states live in the same markup, positioned where they open; a change
  big enough to reflow the page is a second fragment you cross-fade to,
  or a transform/clip you animate (`translateY` for scroll, `clip-path`
  for a panel growing).
- **Product micro-animations** (a spinner, a progress shimmer, a
  thinking mark) come from the product's own sprite or keyframe data,
  stepped from t (`frame = floor(t*30) % n`) — never a look-alike. Large
  sprite JSON shrinks 30–45 % by rounding path coordinates to integers;
  keep it in a `.json` module.
- **Dynamic text is spans**: a typed field is a text node you set to the
  typist's prefix plus a caret element; streamed prose is one
  `<span class="w">` per word revealed by count; status rows are list
  items revealed by index with the product's own shimmer class while
  "running" (drive the shimmer's phase from t).
- **Hooks**: put `data-v="send"`-style attributes on everything the
  cursor clicks, the camera frames or a mark annotates, so your cut can
  find them (`kit.srect`/`kit.center`/`kit.camrect`) by a stable selector.
- **Size**: build the window at real CSS pixels (a ≈1440×900 laptop
  window on a 1920-wide stage, or a 390-wide phone) on a plain desk; the
  camera does the zooming, never font-size.

## 4. Check fidelity before anyone sees it

Render the recreated surface at z = 1 with `frames.ts` and put it beside
a real screenshot (or the running product) in one contact sheet; look
for the tells reviewers catch: squashed controls (a 28 px button drawn
24), wrong font weight or tracking, greys that are flat instead of the
product's alpha-on-ink, missing hairlines, radii off by 2 px, icon size
and stroke, truncation and ellipsis behavior, scrollbars that should
not be there, a selection ring hugging the row instead of the text, a
drag ghost under instead of over. Then check one close-up at z ≈ 2 — at
that scale a 1 px error is 2 px. Fix these as content bugs.

## 5. When the input is a design, not shipped code

A design file's exported HTML, an HTML prototype or a Figma export is
lifted the same way (route A on its HTML; its token sheet for values).
Say in the hand-off which parts are design rather than product, and put
"Concept mock · Month YYYY" small and grey on the closing card. Never
invent product features to fill a beat; film what exists or what the
design shows.
