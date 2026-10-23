# A film of scenes, in a look of your own: its records

Part of "A new film: three questions, then the film" in this type's
instructions, which say when each step happens and what you reply. This page is
the records' format and how to write them. The example is another film's (a bell
foundry's open day): copy how it is built, never its scenes, words, colors,
typeface, shapes or times. `if_version`, wherever this page says it: only if your tool's
input lists it; the version is in your last `list`, `get` or write of that document.

## The first batch

Sent at once, before any scene is designed, in this order. The film then plays:
the player draws a plain card with the scene's name for each scene still to come.

**`film/meta`**, then **`modules/scenes.json`** (`kind` json):

```json
{"v":1,"stage":"rough","look":"Cast bronze: Heavy metal shapes lit by furnace glow, rising slowly into place",
 "palettes":[["#17455C","#FFC24B","#FFF1DE","#2A1410"],["#10201D","#3E8F84","#C9E4DC","#D98A3D"],["#F3EFE6","#7A4B2A","#2B211A","#C8962E"]],"theirs":0,
 "width":1920,"height":1080,"fps":60,"background":"#10201D",
 "fonts":{"display":{"family":"…","or":"…"},"sans":{"family":"…","or":"…"}},"scenes":[
  {"id":"yard","name":"The yard","dur":3,"desc":"Gates open on the foundry yard; the date sets in."},
  {"id":"pour","name":"The pour","dur":4.5,"desc":"The ladle tips; bronze runs into the mould."},
  {"id":"ring","name":"First ring","dur":4,"desc":"The bell swings once; rings spread."},
  {"id":"come","name":"Come and see","dur":3.5,"desc":"End card: day, place, free entry."}]}
```

- Three or four scenes for 20 s, five or six for 30, 24 at most, each ONE subject and ONE
  action: an establishing open → the subject arrives → the thing happens →
  closer scenes, each landing on motion → back out → an end card held 3 s or
  more. The seconds add up to the Length answer; 300 at most.
- `id`: lower-case letters, digits and `-`, a letter first, 32 at most. It never
  changes, and no two are alike: comments and the user's own edits hang on it.
  `name`: one to three words (48 characters at most), for a listener ("The pour",
  not "Scene 2"): it labels the timeline and the card. `dur`: seconds, above 0.
  `desc`: one plain sentence on what happens. A bad `id`,
  `dur` or count stops the whole film.
- One continuous action (one window, one camera move, one cursor's errand) is ONE scene, however
  long: nothing carries over a cut. The one exception: a character or object that moves about or
  travels (a window, screen, cursor, card or logo is not one). Where two scenes in a row show it,
  the second must **open in the same framing, with it as the first's code left it**: place, size,
  pose, speed; plan none of its moves ahead, in thought or in `shared.js`.
- `stage`: `"rough"` until the film's last write: to the page, "not done yet".
- `width`, `height`: vertical (Reels, TikTok, Shorts) is 1080 by 1920. `background`:
  the picked ground (an overlay: `"transparent"`, and `.ground` paints nothing). `look`: the look in words, for you when you draw the scenes, which may
  be another conversation: the picked option's name and line, and whatever they typed
  or asked for, word for word; you decided: a name and line of your own.
- `palettes`: every palette the Colors question offered, picked or not (a skipped
  form's too), in the order shown (the picked one is not moved up), each its four
  colors as `#rrggbb` in role order (ground, main, second, accent); offered in words
  alone: settle each one's four now. `theirs`: how many of them, counted from the
  first, are the user's (their brand, a design system), picked or not. One system's
  tile and two palettes of your own: 1. The example: three of your own, the second
  picked: 0. They answered Other, or in words of their own: the palette you made of
  that stands ahead of the rest, and counts as theirs. Hexes alone: no name, no
  title. No Colors question asked: the film's own four alone, `theirs` 1 if they are
  the user's, else 0. For the page to offer again: keep both keys, as they are, at
  every later write of this record.
- `fonts`: the faces the film is set in. Four optional slots: `sans`, `serif`, `mono` for text,
  `display` for headlines. A slot takes one of the ten faces that ship with the player, by id
  (a plain string), or nearly any Google Fonts family with the nearest of the ten to stand in (in a text slot, one for text):
  `{"family":"…","or":"…"}`. From memory: look nothing up. The player fetches it; `or` shows
  where it can't (no such name; a family that also holds Chinese, Japanese or Korean; no
  network). A family brings weights 400 and 700, or its nearest, never thickened; for others
  name them all, four at most, beside `or`: `"weights":[400,800]`. `display` unnamed: headlines
  take the film's `sans`, so a film set in a serif or a mono names it. Keep `fonts` at every
  later write.

The ten. For text: `plus-jakarta-sans` (wide), `manrope` (round), `space-grotesk` (angular),
`instrument-sans` (narrow), `fraunces` (serif), `dm-mono`, `departure-mono` (pixel), these two
of one weight. Headlines: `fraunces-display` (hairline), `inter-display` (loud),
`shantell-sans` (hand-drawn).

**Pick for THIS film**, from the look's words and the subject, never from habit: films
in the same faces look machine-made, and your habit is the same quiet sans under every
headline, with mono labels. Think where this look's lettering would be at
home (a road sign, a dashboard, a shop sign, a terminal), then what KIND of face
is found there (an old-style serif, a didone, a humanist, rounded or wide
sans, a typewriter, a brush script), then a family of that kind, fit for work (questions.md). The first that comes to
mind is the one every film would get, so look past it, to a name you are sure of. Most
films want two, a `display` over a text face that has a bold, unlike in kind, weight or
voice. A third only as `mono`: for code, a terminal, or figures that count up or sit in
columns.

The user names a family: that one, spelt right, in the slot they mean (titles:
`display`; the text: `sans`, serif or not; the whole film or a house face: `sans`, and no
`display`; one of the ten: its id). If it isn't Google's (Helvetica Neue): the nearest
Google family. Files they gave: the nearest of the ten under them, no `display` of yours,
their names in `look`; finalize.md's step 2 brings theirs in. The ten have Western European letters only (no ł, ő,
ş). Any other letters (Polish, Turkish, Greek, Cyrillic, Arabic): two slots at most, each a well-known
Google family that has them and Latin, none that the player ships, two weights each; `or` as ever (it won't show). Chinese, Japanese, Korean: leave `fonts` out,
whatever they named.

**`modules/base.css`** (`kind` css), six lines at most for now: the picked colors
as variables (`--ground`, `--main`, `--second`, `--accent`, each once, a plain
`#rrggbb`, no two alike), the ground painted from them (`.ground`, one per scene, at the
bottom), the type stacks the film uses, written as below or as
`var(--serif, Georgia, serif)`, `var(--mono, ui-monospace, monospace)`, never a family's
name (`#stage` takes the one most words wear; in a serif or mono film `.line` has that one
inside, in place of the sans one), the few classes every scene uses. It is applied
before any scene, and keeps scenes written apart looking like one film.

```css
#stage { --ground:#10201D; --main:#3E8F84; --second:#C9E4DC; --accent:#D98A3D; color:var(--second); font-family:var(--sans, system-ui, sans-serif) }
.ground { position:absolute; inset:0; background:var(--ground) }
.words { position:absolute; margin:0; display:flex; flex-direction:column; gap:24px } .words > * { margin:0 }
.line { font-family:var(--display, var(--sans, system-ui, sans-serif)); font-size:84px; line-height:1.05; font-weight:700 } .sub { font-size:36px }
```

**`film/script`**, last: `{"code":"window.CUT = kit.scenes();"}`, that line and
nothing else, for the film's whole life. No later step writes it again.

## A scene

One document per scene, `modules/scene-pour.js` (`kind` js) for the scene `pour`, one
`set` each, in film order, ONE call per message: think about one scene, write it,
send it, read the reply, go to the next. Calls sent together arrive together.

```js
const { seg, eio, lerp } = kit;
kit.scene('pour', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><div class="pour-ladle"></div></div>'));
    this.ladle = kit.stage.querySelector('.pour-ladle').style;
  },
  render(t) {
    this.ladle.transform = 'rotate(' + lerp(4, -24, eio(seg(t, 0.3, 1.2))) + 'deg)';
  },
});
```

That is the bare shape. A finished scene, whole: finalize.md. A rough one: "How rough".

- A scene is a small cut of its own. One `kit.scene` call per module, for the
  module's own id. `init(kit)` builds the scene once inside `kit.stage` (optional;
  may be async). `render(t, kit)` is required, synchronous and pure: every varying
  property set from `t` alone, SECONDS since the scene began. No CSS transitions
  or animations, no timers. Both are called as methods, so `this` carries what
  `init` built over to `render` (under any names but `lead` and `tail`, the player's).
  At a module's top level: constants and that call, no DOM. `init` awaits whatever
  `render` needs: the player tries `render(0)` as soon as `init` settles, and a throw
  there fails the scene.
- The whole film loads again at every write: keep each `init` light.
- A scene's `kit` is its own: `kit.stage` is the scene's box, which fills the stage
  and has no ground of its own (`scenes.json`'s `background` lies behind it); what
  `kit.css`, `kit.cursor`, `kit.svgLayer` and `kit.chip` make stays in the scene;
  `kit.video`'s `start` and `kit.typist`'s `t0` count from the scene's beginning.
  `kit.dur`: the scene's seconds. `kit.start`: where it begins in the film. `kit.fx`
  is one canvas, shared by all scenes: set its state (font, lineWidth, fillStyle,
  a clip) in `render`, never once in `init`.
- A scene's own class names begin with its id (`pour-ladle`).
- Scenes cut from one to the next: open what moves about as it was left; else build each to stand
  alone, and to hold its first and last picture for a `t` below 0 or past `kit.dur` (`seg` does).
  The first scene at `t` 0 is the poster and thumbnail: never blank.
- No flashes: nothing blinks or cuts more than three times a second, rough or
  finished. No scene under a second.
- `scenes.json`, `base.css`, `shared.js`, `score.js` and any name that begins `scene-`
  or `layer-` are the player's: name no other module so.
- A line of words is ONE string in ONE element, as the viewer reads it: the page
  lets the user retype it, and finds it by those words. So no id, class name or
  key spelt like words on screen.
- Lines that belong together (headline, subtitle, button) sit in ONE flow
  container (`.words`, a flex column with a gap), placed as a group, so that a line
  that wraps pushes the next one down; never each at its own `top`. A lone line sits
  in a `.words` too: `.line` has no place of its own.
- Markup in single-quoted strings, `style="…"` in double quotes, no quotes inside
  a style: a nested quote plays, then breaks every still and export.
- Helpers: `kit.el`, `kit.h`, `seg(t,a,b)` (0 to 1 across a to b), `lerp`, `clamp01`,
  `eo` `ei` `eio` (eases). The rest of the kit waits for finalize.md's step 1 (film-api.md).
  `kit.h` returns ONE element, the first in its string: wrap siblings in one root,
  or call it once for each.

## How rough

Only for a film whose scenes are rough already (a change to it, Continue). No new film
is written so.

A wireframe: the real words, places, sizes and timing.

- What you write: the picked ground, one ink that reads on it (`--second`), and type in
  the sizes and weights it will have, from `base.css`. All four picked colors stand
  there as variables from the start; `--main` and `--accent` wait for Finalize.
- What the player shows: a rough scene as if drawn by hand in black and white: not
  yours to imitate, mend or undo. No picked color shows until Finalize redraws the
  scene: say so only if asked, or after a change of color.
- Every object is an outline (2 px, no fill). One that holds no words of its own
  gets a short label in small capitals saying what it will be: LADLE, LOGO, CHART.
  A label is a placeholder, not the film's words: write it `data-label="LADLE"`
  (`base.css` draws it), so that the page never offers it for retyping, and at
  Finalize the drawing takes its place. Words that belong to the film (a chart's
  BEFORE and AFTER) are real text, and stay.
- No fill, texture, shadow, secondary motion, camera, sound, font file or image asset.

`base.css` holds these too:

```css
.box { position:absolute; margin:0 }
.box { border:2px solid var(--second); box-sizing:border-box; font-size:30px; letter-spacing:.12em }
.box::after { content:attr(data-label); position:absolute; left:14px; bottom:10px }
```

```js
const { seg, eo, lerp } = kit;
kit.scene('pour', {
  rough: true,
  init(kit) {
    kit.stage.append(kit.h('<div class="ground">' +
      '<div class="box" data-label="MOULD" style="left:760px;top:560px;width:400px;height:360px"></div>' +
      '<div class="box pour-stream" style="left:942px;top:330px;width:36px;height:230px"></div>' +
      '<div class="box pour-ladle" data-label="LADLE" style="left:960px;top:170px;width:300px;height:170px;transform-origin:0 100%"></div>' +
      '<div class="words" style="left:140px;top:150px;width:560px"><h2 class="line">Eleven hundred degrees, four minutes</h2>' +
      '<p class="sub">Bronze, poured by hand</p></div></div>'));
    for (const k of ['ladle', 'stream']) this[k] = kit.stage.querySelector('.pour-' + k).style;
  },
  render(t) {
    this.ladle.transform = 'rotate(' + lerp(0, -24, eo(seg(t, 0.4, 1.2))) + 'deg)';
    this.stream.opacity = t > 1 && t < 3.6 ? 1 : 0;
  },
});
```

## Scenes missing or broken

A turn cut short leaves listed scenes with no module; a scene whose code fails
shows its name card in place of the scene, and nobody tells you. At "Continue the
animation." (it may go on "Scenes left: 2, 3.": positions in `scenes.json`, from 1,
never a count: here `pour` and `ring`; "Scenes left: 2." is `pour` alone), or when you find it so: `list` `modules`; read the named scenes that have a module, or all,
for a slip and mend it (`if_version`). No scene is rough: finalize.md's "Cut short"
(not in this conversation: `read` it first): what is missing is written finished, then, the
stage still rough, the score and `"final"`. Else write what is missing, rough, in film order,
one `set` per message, and go no further.

## A change

`list` `modules` (every document whole, with its version), change the scenes it
touches at the same roughness (`rough: true` stays), `set` each with `if_version`. A
change of color: the variables in `base.css` (a new ground: `scenes.json`'s
`background` too); where scenes are rough, the one sentence more says it will show at Finalize. A scene added,
dropped, renamed, retimed or moved is an edit to `scenes.json` (`if_version`;
`"stage"` stays `"rough"`; no scene is rough: finalize.md's "Cut short" follows): a new scene's module after it, a dropped scene's module
`delete`d (`if_version`). Scenes that stay keep their ids. On a final film the
same, finished, as finalize.md says of a final film (not in this conversation: `read`
`artifact-type/reference/finalize.md` first): a new scene has no `rough: true`, the stage stays `"final"`, and
`score.js` is fitted to the new times, with no `T.` of a dropped id left (it would
sound at 0:00). Here and in finalize.md, a json module with an `about`, and `modules/refaced.json` with or
without one, is the page's own record of what the user changed by hand: never write or delete it; its `about` says
what counts.

## Finalize

Its steps are on a page of their own, `artifact-type/reference/finalize.md`.
