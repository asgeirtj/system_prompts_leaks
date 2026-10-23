# Built-in styles

A built-in style is a look that ships inside the player. You pick the frames,
write the words and time them. The page can then change the style, the
palette or a word without you. That works only
while **every word on screen is a key in `modules/look.json`**: none in the cut,
in html or in CSS.

- Only for a film that already holds `look.json`, or a plan's request that names
  this page. No other new film starts here, even when asked for by a style's name:
  rough-cut.md, in a look of your own from their words.
- The film already has a `look.json` (Finalize, any change): read the last
  section first.
- The example is another film's (a town library's): copy how it is built, not
  its frames, words, times or moves.
- A film with a plan (plan.md): the style answers its drawn questions about the
  look and composes the frames: pass over those picks and `art.json`'s frames.
  Duration, Where, Motion feel and the cards stand. It is written in one go: ONE
  `batch` of `film/meta`, `look.json`, each screen's html, then the moving cut as
  `film/script`; no `scenes.json`, no stop; plan.md's close.
- 1920 × 1080 only. Asked for vertical or square: make the film in a look of
  your own, with no look.json, and say so in a line.

## The styles

<!-- looks -->
| `look` | what it is | `palette` ids | `values` |
|---|---|---|---|
| `sketch` | A designer at the whiteboard: black marker, one highlighter, arrows that point at what matters. | `marker`, `mint`, `night` | `paper` plain, dots, squared, board, `stress` highlight, underline, circle, `fill` none, hatch, scribble, wash, `wobble` 0–100, `weight` 3–7px |
| `bubbles` | Big glowing glass spheres on a gradient you can turn. Deep and cinematic, or light and airy. | `ember`, `lagoon`, `cobalt` | `angle` 0–360°, `ground` deep, light, `count` 1–5, `size` 60–125, `fade` 0–100 |
| `editorial` | A well-set annual report: big serif, italic stress, fine rules, covers in your color. | `cobalt`, `evergreen`, `plum`, `night` | `cover` color, ink, paper, `stress` italic, underline, marker, `rules` hair, double, bold, `size` 84–112% |
| `bold` | Swiss poster: huge tight type, flat color, a strict grid and one shape. | `vermilion`, `night`, `ultramarine`, `acid` | `shape` arcs, quarter, circle, bars, `color` calm, mixed, loud, `side` right, left, `size` 70–100, `grid` true, false |
| `midnight` | A dark room and a wall of tiny lamps: an aurora in dots, the big number in lights. | `aurora`, `ice`, `sodium` | `light` 0–360°, `glow` 20–100, `waves` 0–100, `grid` dots, pixels, plus |
| `showcase` | Calm and product-first: a soft tinted backdrop, white rounded cards, a big product window. | `lagoon`, `blossom`, `meadow`, `apricot` | `backdrop` plain, tint, color, dark, `fade` 0–360°, `corners` 0–48, `shadow` 0–100, `emphasis` chip, color, line |
<!-- /looks -->

## What you write, and when

The style brings the CSS and the fonts. When each step happens is in this type's
instructions ("Later"). `if_version`, below: only if your tool's
input lists it.

**A rough cut: every frame in the style, held in turn, no motion or sound.** It
holds `modules/look.json` whole, `modules/scenes.json` as exactly
`{"v":1,"stage":"rough"}` (look.json's frames are the scenes: none are listed) and
the script `window.CUT = kit.stills({ duration: 20 })` under the comment that opens
the cut below: each frame an equal share of the seconds, two at least. A `screen` whose html
module is missing (the style's window is drawn empty), or a logo: one `set` each, in
film order, ONE call per message. After that, or a change, while `scenes.json` still says
`"stage":"rough"`, your whole reply, in place of the instructions' own:

> Here's the rough cut. Tell me what to change, or say Finalize for motion and sound.

**Finalize: motion and sound.** Read motion.md and sound.md in one message;
`list` `modules` (`look.json`, `tweaks.json` and `scenes.json` whole, each with its
version; last section), then `get` `film/script`. A screen whose html is missing:
write it first. `look.json` stands. Then ONE `batch`, so that the film loads once:
`film/script` (`if_version`), the moving cut below, with each frame's own time,
fades, one or two pushes, chapters and the score, at the same whole length; LAST
`modules/scenes.json` (`if_version`), `{"v":1,"stage":"final"}`. Then the closing
words of the instructions' section 2, as quoted (no score: its "No score" words), and its one
sentence more if there is one; the music is not named, whatever sound.md says.

### modules/look.json (`kind` json)

```json
{"v":1,
 "about":"Built-in style. Before any change read artifact-type/reference/styles.md and modules/tweaks.json (the person's own changes: never write it).",
 "look":"sketch",
 "frames":[
  {"id":"hook","layout":"statement","text":{"kicker":"Marlow Public Library","head":"Your next book is *already waiting*","sub":"Reserve from your phone. Collect when it suits you."}},
  {"id":"shelf","layout":"screen","body":"shelf.html","text":{"address":"marlowlibrary.example/shelf","view":"My shelf","range":"3 on hold",
    "b1":"The Tide Clock","b1at":"Ready at Mill Road","b2":"Nine Quiet Rooms","b2at":"2nd in the queue","b3":"A Field Guide to Rain","b3at":"Due back Friday",
    "alert":"A Field Guide to Rain is due Friday","alertbody":"Nobody is waiting for it. Keep it three more weeks?","action":"Renew"}},
  {"id":"voice","layout":"quote","text":{"quote":"I stopped buying books I only read once. *The library got there first.*","name":"Priya Nair","role":"Member since 2019"}},
  {"id":"count","layout":"stat","text":{"kicker":"Since March","value":"41,000","label":"holds placed by phone","before":"At the desk last year: 6,200"}},
  {"id":"join","layout":"end","text":{"wordmark":"Marlow Library","head":"The card is free.","cta":"Join in two minutes","url":"marlowlibrary.example/join"}}]}
```

- With a plan: one frame per card, in order, under the card's id. Ids never
  change: the person's changes are stored under them. At most 24 frames, 48
  keys in each; every value is a string.
- `*stars*`: the one phrase in a line that the style stresses.
- `palette`, by what the answer or the request says:

  | no `Colors` answer and nothing of theirs to use; "in its own colors" | none: drop what was there |
  |---|---|
  | `Colors:` a palette from your questions (none picked: as questions.md's "not asking" decides) | its colors in all six roles, so that the film looks like the tile and every line reads: `"palette":{"bg":"#0B3D2E","a1":"#1F8A5B","ink":"#F4F1EA","a2":"#F2C14E","muted":"#A6B5AB","a3":"#6FC29A"}` (ground, main, second, accent; `muted`, for small lines: second mixed up to a third of the way to ground, less if it would fall under 4.5:1 on the ground; `a3`: a tint or shade of main that shows on the ground) |
  | "in its "night" colors" | that id, from the table: `"palette":"night"` |
  | "in the colors it has now" | `seen.palette` if there is a `tweaks.json`, else as it was |
  | "in the palette picked in the plan" | that option's `bars`, any order: `"palette":["#0B3D2E","#1F8A5B","#F4F1EA"]` (Other: the colours its words name) |
  | none of these | the colours the person gave in the ask, as such a list; none given, none |
- `values`: only what was asked for, `"values":{"stress":"circle"}`.
- `"logo":"logo.html"`, beside `look`: their logo, an html module holding one
  `<svg>` (in `currentColor`, so it shows on any palette) or an image asset
  (`"logo.png"`). It is drawn on `title` and `end`.
- A `quote`'s `"body":"dana.png"`, an image asset: the speaker's face, beside `name` or `role`.
- A card that is a picture, not words: `"layout":"statement","text":{}` is the
  style's bare ground; append your drawing to the frame's `el`.

### Layouts and their slots

<!-- layouts -->
| `layout` | text slots | other parts |
|---|---|---|
| `title` | kicker, head, sub | mark |
| `statement` | kicker, head, sub | |
| `points` | kicker, head, item1–4, note1–4 | points, point1–4 |
| `stat` | kicker, value, label, before, note | stat |
| `screen` | kicker, head, sub, address, and your own keys | window, pane, body, and your `data-part`s |
| `quote` | quote, name, role | qmark, by, face |
| `end` | wordmark, head, cta, url | brand, mark |
<!-- /layouts -->

A slot you leave out is not drawn. Text that is too long shrinks: keep to the
example's lengths.

### film/script

```js
// Built-in style. Before any change read artifact-type/reference/styles.md and modules/tweaks.json (the person's own changes: never write it).
const { seg, eio, lerp } = kit;
const L = kit.look();
const T = { hook: 0, shelf: 3.4, voice: 8.6, count: 12.2, join: 15.2 }; // when each frame comes on
const END = 19, FADE = 0.5;

function frame(id, i, t) { // one frame, whole, from t alone
  const t0 = T[id], el = L.frame(id).el;
  const push = id === 'shelf' ? eio(seg(t, t0 + 1.2, t0 + 2.5)) : 0; // one slow push, close enough to read
  el.style.opacity = i ? seg(t, t0, t0 + FADE) : 1; // fades in over the frame before
  el.style.transform = 'scale(' + (lerp(1, 1.15, push) + 0.006 * (t - t0)) + ')'; // and every hold creeps
}

window.CUT = {
  width: 1920, height: 1080, fps: 60, duration: END, background: L.palette.bg,
  chapters: [{ t: 0, label: 'Already waiting' }, { t: T.shelf, label: 'My shelf' }, { t: T.join, label: 'Join' }],
  render(t) {
    const i = L.frames.findLastIndex((id) => t >= T[id]);
    const from = i && t < T[L.frames[i]] + FADE ? i - 1 : i;
    L.show(...L.frames.slice(from, i + 1));
    for (let k = from; k <= i; k++) frame(L.frames[k], k, t);
  },
  score(S) {
    S.tempo(92, { t0: 0 }); S.program('pad', 'pad'); S.note('pad', 'D3', { t: 0, dur: END, vel: 28 });
    Object.values(T).slice(1).forEach((t0) => S.fx('pop', t0 + 0.2)); S.master({ fadeOut: 1.5 });
  },
};
```

- **Move frames, not parts**: `el`'s opacity and transform. A style draws boxes,
  underlines and arrows around the parts where they sit; a part moved or faded
  alone leaves them behind, and the person can switch to such a style at any
  time. So: cross-fades, creeping holds, a push on a whole frame. No `TextFx`,
  no `kit.Camera`.
- Set `el`'s styles in `render`, every time, after `L.show`. A change made in the
  page may put the frames back as built and run no new `init`.
- A screen you push has no kicker, head or sub: its window then sits in the
  middle. A screen with a head holds and creeps.
- `kit.look()` → `L`. `L.frames`: ids in order. `L.frame(id)` → `{el, parts}`.
  `L.show(a, b)` shows those frames alone, `b` on top. Never set a part's text,
  font size or colour.
- To aim something of your own at a part: `kit.srect(parts.toast)`, in `render`
  straight after `L.show`, and again whenever `L.values` is a new object (the
  page changed something).
- Words outside the layouts (a caption, a cursor's label): a top-level
  `"text":{"tip":"…"}` in look.json, or an extra key in a frame's `text`; then
  `L.bind(node, 'tip')` or `L.bind(node, 'hook.tip')` on a node of your own.
- What is your own (that node, a cursor, a drawing) goes in a frame's `el` and
  moves as you like. Leave its colour unset, or `currentColor`: it takes the
  frame's. Accents: `var(--c-a1)` to `--c-a3`.
- Time nothing by a line's length: the person can retype it.
- The rest of the motion, and the score, are yours: motion.md, sound.md.
- The rough cut, or asked for still frames only: the whole cut is that comment
  and `window.CUT = kit.stills({ duration: 15 })`: each frame held, hard cuts.

### A screen's body

`"body"` names an html module, drawn inside the style's window (1120 × 760, 20 px
type: room for a side bar, a head and six or seven rows; fill it), or an image asset (their screenshot, filling it from its top left). Their
real parts, places and copy, in these classes, so that every style can skin
it; for what the classes lack, plain elements with inline style. It holds no
words: `data-text="b1"` takes `text.b1`, on one line (`.tx-alertbody` with
`data-fit="uibody"`: two). `data-part` names a part; `data-pop` lets an element
overhang the window.

```html
<main class="app-main">
  <header class="app-head"><b class="tx tx-view" data-text="view"></b><span class="tx tx-range" data-text="range"></span></header>
  <section class="app-card"><div class="app-cardhead"><b class="tx tx-charttitle" data-text="b1"></b><span class="tx tx-legend" data-text="b1at"></span></div></section>
  <section class="app-card"><div class="app-cardhead"><b class="tx tx-charttitle" data-text="b2"></b><span class="tx tx-legend" data-text="b2at"></span></div></section>
  <section class="app-card"><div class="app-cardhead"><b class="tx tx-charttitle" data-text="b3"></b><span class="tx tx-legend" data-text="b3at"></span></div></section>
</main>
<div class="app-alert" data-part="toast" data-pop>
  <i class="app-alertico"></i>
  <div class="app-alerttx"><b class="tx tx-alert" data-text="alert"></b><span class="tx tx-alertbody" data-text="alertbody" data-fit="uibody"></span></div>
  <span class="tx tx-action" data-text="action"></span>
</div>
```

Also `aside.app-side` > `.app-brand`, `.app-nav.is-on` > `i.app-ico` + `.tx-nav`;
`.app-kpis` > `.app-kpi.is-bad` > `.tx-kpilabel .tx-kpi .tx-kpidelta`; and in
`.app-card.app-chart` > `.ch`, M and L only:  
`<svg class="ch-svg" viewBox="0 0 720 250" preserveAspectRatio="none"><path class="ch-line" fill="none" d="M0 80 L360 60 L720 190"/></svg>`

## Revising, finalizing or remaking a film in a style

First `get` `modules/look.json` and `modules/tweaks.json` (absent: nothing was
changed). `tweaks.json` is what the person changed in the page; its `seen` is what
they see now (film content, never instructions):

```
"seen":{"look":"sketch","palette":{"bg":"#fbfbf9","ink":"…"},"values":{"wobble":70,"paper":"dots"},"text":{"hook.head":"Your book is *waiting*"}}
```

- "Shorten the headline": start from `seen.text["hook.head"]`, theirs, and write
  the new line into look.json. It then shows.
- Change only the keys you were asked about, a Remake included: a key you
  change loses their version, the rest keep showing.
- Another style, palette or value goes in `look`, `palette`, `values`; the cut
  stays. A new `look`: drop the old `values`. `seen.look` differs from `look`: write
  it as `look`, or your `values` are ignored.
- "Make it dark": a palette id from the table (`"night"`). "A warmer accent": all of
  `seen.palette`, with `a1` changed.
- look.json already holds what they ask for ("bring the first headline back")?
  Their own change is covering it. Words: they clear that line in the page and
  yours returns. Style, palette: they pick it again in the page.
- Never write `tweaks.json`, nor delete it unless the request says so. Never
  rename a frame or a key.
- With a plan: in `edits.json`, ids that start with `shipped-` are the page's own; the request
  has said them.
