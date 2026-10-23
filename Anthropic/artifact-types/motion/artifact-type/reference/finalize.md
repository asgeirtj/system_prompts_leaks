# The finished film, in a look of your own

Part of "A new film: three questions, then the film" in this type's
instructions. The film holds `look.json`: not this page, styles.md's "Finalize". How a
film of scenes is built, and `if_version`: `artifact-type/reference/rough-cut.md`. Not in
this conversation: `read` it, with step 1's pages. `pour`, `bell` and `tip` below are its
example's, another film's. No step here writes `film/script`: it stays the one line the
first batch wrote, `window.CUT = kit.scenes();`. A json module with an `about`, and
`modules/refaced.json` with or without one, is the page's own record of what the user
changed by hand: never write or delete it; its `about` says what counts. The rules of
rough-cut.md's "A scene" hold for a finished scene too, above all:

- No flashes: nothing blinks or cuts more than three times a second, rough or
  finished. No scene under a second.
- Markup in single-quoted strings, `style="…"` in double quotes, no quotes inside
  a style: a nested quote plays, then breaks every still and export.
- A line of words is ONE whole string literal. To move it word by word, hand it to
  `kit.TextFx` or split that string at run time (`line.split(' ')`); never write the
  words as separate strings or separate spans in markup.

Four kinds of film come here. Go by what the film holds:

- **A new film** (this turn wrote the first batch): the five steps.
- **A rough cut** (a scene has `rough: true`, none is finished): the steps as "A rough cut
  redrawn", below them, changes them.
- **Cut short** (any other film whose stage says rough: a turn died with none, some or all
  of its scenes finished; or a final one with scenes missing or failing): "Cut short", at the
  end of this page, first.
- **A final film, a change** (rough-cut.md's "A change"): step 3's way of drawing a scene; another typeface:  
  "Another typeface", below step 5;
  `score.js` refitted if times or scenes changed (sound.md first, if not in this
  conversation); a silent film has none.

Every kind but the first has scenes on show: `base.css` and `shared.js` are added to, nothing
renamed or removed, type sizes and weights as they are, unless that is the change asked for; what is there already takes `if_version`, its version
from your `list` or your last write of it.

**The five steps**

1. Read motion.md and film-api.md in one message, unless this conversation has their text, whole
   (recreate-ui.md too if it shows their product; rough-cut.md too if it is not in this
   conversation). sound.md waits for step 4.
2. **What the scenes share, ONE `batch`, your first write here, small** (uploads alone go ahead): 1,500 to 2,000
   characters of `base.css`; `shared.js` only if two listed scenes draw the same thing, and
   most films have none. Settle the shared look
   from `scenes.json`'s `look` and the color variables, write it and send it before you
   think of any one scene. First `modules/base.css` (`if_version`: the version the first
   batch's reply gave; none shown: `get` it), whole: the four color variables and the type stacks as they are, then the finished look
   that scenes share (type sizes, and weights from among those that `fonts` brings, settled now; colors, radii, spacing) as classes (a headline class wears `.line`'s stack).
   Scenes refer to it and never repeat it inline, so that a film-wide
   change is one write. A new shade is mixed from the color variables
   (`color-mix(in srgb, var(--main) 70%, var(--ground))`, quieter; with
   `var(--second)`, stronger; a panel: `var(--ground) 92%, var(--second)`), never
   black, white or a new hex. See-through: `color-mix(in srgb, var(--second) 20%,
   transparent)`, never the color spelt again as `rgba()`. A shadow alone may be
   `rgba(0,0,0,.25)`. Their product's lifted CSS keeps its own colors.
   Then the new documents (uploads come first).
   `modules/shared.js` (`kind` js), run once before any scene: the drawing or helper
   that the list already shows two scenes share, no more (a scene can hold its own), on
   `window` (`window.UI = { bell(kit, size) { … } }`).
   A helper takes the scene's `kit` as a parameter: the `kit` that `shared.js` itself
   sees is the film's, and what that one adds sits over every scene. Nothing shared: no
   `shared.js`. Each font
   and image as its `assets` document.  
   **Fonts.** `scenes.json`'s `fonts` stands:
   change it only when the user asks for another typeface, or their product's own face is a
   Google family (recreate-ui.md): a free `serif` or `mono` that nothing wears (none free, or words the ten can't spell: the film's `sans` stack), `scenes.json` in this batch (`if_version`); the
   product's CSS takes that slot's stack. Never download a font, look one up, or search
   the machine for one. Weights, beyond what rough-cut.md says:
   `inter-display` goes to 900, `manrope` to 800, `fraunces-display` has one, `shantell-sans`
   slants from 600 up. No italic but `fraunces-display`'s: a fetched family brings none. A line
   must still fit where `or` shows: leave it room. Figures that count up
   or sit in columns need `tabular-nums`: set them in a face that surely has them (any mono;
   of the ten `instrument-sans`, `space-grotesk`, `plus-jakarta-sans`, `inter-display`); none in the film: the mono stack, as rough-cut.md writes it. A stack with
   no face named (that mono; a film with no `fonts`) stands, whatever film-api.md says of
   system stacks. In js: `kit.fonts.sans`, `.serif`, `.mono`,
   `(kit.fonts.display || kit.fonts.sans)`; they hold double quotes, so inside
   a `style="…"` write the stack as `base.css` does: `var(--sans, system-ui, sans-serif)`.
   Font files they gave you (or that their code holds, for the product's CSS alone): upload them
   together (not at hand: go on without; E, below); each is an asset, named by its file's stem
   in `base.css` ahead of its stack, the one case where `base.css` names a face
   (`#stage { font-synthesis:style; font-family:"Face-400", var(--sans, system-ui, sans-serif) } .line { font-family:"Face-700", var(--display, var(--sans, system-ui, sans-serif)) }`).
   A bold is a face of its own: a class that wants it names it; in js it goes ahead of
   `kit.fonts.sans`; `fonts` stays.
3. **Each scene, in film order, one `set` each**, a new document (no `if_version`), ONE
   call per message, the scene inline in the call, written once and sent at once: they
   are watching. **No scene by way of a file or shell script, and render nothing of the
   film unasked**, even with a browser at hand: what other pages say of stills,
   `frames.ts`, `check.ts` and `export.ts` does not hold here. The list is the plan: lay
   out no scenes ahead. Think of one, write it, send it, read the reply, go to the next;
   whatever motion.md or recreate-ui.md says of asking, no question now except the one that
   decides a refusal (ask, end the turn; their answer takes it up: a film still rough, by "Cut short"). Compose it from its `desc` and
   the look, and draw it in full, as below: shapes with fills, light, motion from first
   frame to last. No `rough: true`. About 2,000 characters a scene, like the one below;
   3,500 at most (their product's UI, or a scene over 8 s: what it needs): what they
   wait for is what you write.
4. **Last, ONE `batch`: the score, then the stage**, so that the film loads once. They
   asked for silence: no `score.js`, no read. Else first `read` sound.md (what it says of
   `check.ts` and `export.ts` does not hold here either).
   `modules/score.js` (new, `kind` js): `kit.score(function (S, T) { … })`. `S` as in
   sound.md; `T` holds each scene's start in seconds by id, and `T.END` the film's
   length: `S.fx('pop', T.pour + 1)`. Then `modules/scenes.json` (`if_version`: your last
   version of it), whole, with
   `"stage":"final"` and nothing else changed (`fonts`, if you added it, stays).
5. That batch ends the work: the closing words of the instructions' section 2, as quoted, and its one sentence more if there is one (of fonts: below). Four sentences at most (five: below); the link, where one is wanted, after "Here's your animation"; nothing of artifact types or how it was made; the music is not named, whatever sound.md says. Then end the turn. No stills: they are playing it and
   will say what is off.

**Another typeface**, on a final film: `fonts`, as rough-cut.md says, in the slot whose stack
those words wear now, so that no stack changes, with 400 and `base.css`'s weights;
one that the face lacks: `base.css` takes its nearest. A scene only to widen a
line's box, never shrink its type. A font asset named ahead of that stack comes out of
`base.css` and of any scene, and stays in `assets`: asked for back, name it again. What
`modules/refaced.json`'s `about` says of a font asset holds for their own files alone.

**Of fonts** say only these, as quoted (X: the family; Y: yours; Z: the shipped face underneath; words
the ten can't spell: "a system typeface"). As the one sentence more they rank: what you refused, or the file they asked for (Export); A, D or E; what else
you could not do; a design system's colors that they did not pick (questions.md); B or C.
After one of these, anything you made up: a short sentence of its own (five in all).

- A. They named X, which isn't Google's: "X isn't on Google Fonts, so I chose Y, the
  nearest there: send me X's font files and I'll use them."
- B. They named X, fetched (not one of the ten), or ask what a fetched face is called: "X
  loads from Google Fonts when the animation opens; where it can't, Z shows."
- C. No `fonts`, no `modules/refaced.json`: "The words show in each device's own typeface:
  send me font files if you want a particular one." (They named a family for such words: it
  ranks with A.)
- D. `modules/refaced.json` is there, you changed `sans`, the ten spell the words: "The typeface you picked on the
  page still shows: set Font, under Style, to Original to see the new one."
- E. `look` names font files, you have none, `assets` holds none: "I no longer have
  your font files, so Z shows: send them again and I'll use them."
- F. With any still of a film that has a fetched family: "This still shows Z where the
  animation loads X from Google Fonts."

C, E: not where `base.css` names a font asset of theirs. None fits: nothing of fonts but a name they ask for.
A final film's typeface changed: D first, if it fits; what changed, without a
fetched family's name; then A or B, if one fits.

**A finished scene**, the list's `pour`: copy how it is built, never its scenes, words,
colors, shapes or times, nor how its line comes in: motion.md's "Type in motion" has more
ways than this one (a number counts, a phrase splits, a word lands and stays; typed:
`kit.typist`), and `fadeFromRight`'s options set drift and pace. Pick for THIS film, scene by
scene. `base.css` grew by these:

```css
.ground { background:radial-gradient(120% 90% at 50% 115%, color-mix(in srgb, var(--main) 40%, var(--ground)), var(--ground)) }
.sub { color:color-mix(in srgb, var(--second) 70%, var(--ground)) }
.art { position:absolute; inset:0; width:100%; height:100%; overflow:visible }
.metal { fill:color-mix(in srgb, var(--ground) 78%, var(--second)); stroke:var(--second); stroke-width:3; stroke-linejoin:round }
.hot { fill:var(--accent) }
.glow { position:absolute; border-radius:50%; background:radial-gradient(closest-side, color-mix(in srgb, var(--accent) 55%, transparent), transparent) }
```

```js
const { seg, eo, eio, lerp, TextFx } = kit;
kit.scene('pour', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground">' +
      '<div class="glow pour-glow" style="left:610px;top:400px;width:700px;height:700px"></div>' +
      '<svg class="art" viewBox="0 0 1920 1080">' +
      '<rect class="hot pour-stream" x="948" y="336" width="24" height="280" rx="12"/>' +
      '<path class="metal" d="M760 920 L800 600 H1120 L1160 920 Z"/>' +
      '<rect class="hot pour-fill" x="812" y="606" width="296" height="12" rx="6"/>' +
      '<g class="pour-ladle"><path class="metal" d="M960 340 H1260 L1225 180 H995 Z"/>' +
      '<path class="hot" d="M1001 204 H1219 L1223 226 H997 Z"/></g></svg>' +
      '<div class="words" style="left:140px;top:150px;width:600px"><h2 class="line">Eleven hundred degrees, four minutes</h2>' +
      '<p class="sub pour-sub">Bronze, poured by hand</p></div></div>'));
    for (const k of ['glow', 'stream', 'fill', 'ladle', 'sub']) this[k] = kit.stage.querySelector('.pour-' + k).style;
    this.line = kit.stage.querySelector('.line');
    this.ladle.transformOrigin = '960px 340px';
    this.stream.transformOrigin = '960px 336px';
    this.fill.transformOrigin = '960px 612px';
  },
  render(t) {
    TextFx.fadeFromRight(this.line, t, 0.2);
    this.sub.opacity = eo(seg(t, 1.1, 1.6));
    this.ladle.transform = 'rotate(' + (lerp(4, -24, eio(seg(t, 0, 1.2))) + lerp(0, 14, eio(seg(t, 3.6, 4.5)))) + 'deg)';
    this.stream.transform = 'scaleY(' + eo(seg(t, 1, 1.35)) * (1 - eo(seg(t, 3.5, 3.8))) + ')';
    this.fill.transform = 'scaleX(' + eo(seg(t, 1.3, 3.6)) + ')';
    this.glow.opacity = lerp(0.12, 1, eio(seg(t, 1.1, 3.6)));
    this.glow.transform = 'scale(' + lerp(0.7, 1.08, eo(seg(t, 1.1, 4.5))) + ')';
  },
});
```

**A rough cut redrawn.** The user has seen it: same ids, names, order and seconds; the
same words, each line exactly as in the rough scene.
`modules/retyped.json` lists lines they retyped,
`{"was":"…","v":"…"}`: the film shows `v` wherever the code says `was`. Leave `was` and
the record as they are, and fit the layout to `v`. The steps, but:

- Step 1, after the pages: `list` `modules`, unless you just did: every document whole, with
  its version.
- No `fonts` in `scenes.json` (an older rough cut) and no `modules/refaced.json`: ahead of step 2 `set` `scenes.json` (`if_version`) with `fonts` added, picked as
  rough-cut.md says, with 400 and `base.css`'s weights; step 2's `base.css` adds the stack of
  each slot named (`.line`: the display one).
- Step 2 is two writes. `set` `modules/base.css` (`if_version`), adding to it: rename or
  remove nothing (the rough scenes still on show use it), type sizes and weights as they
  are. Then the batch, if there is anything for it. `shared.js` also takes what the rough scenes show two scenes share,
  and a time inside a scene that the score needs too, as a constant
  (`window.TT = { tip: 0.4 }`) read by both.
- Step 3 is over the same document, with `if_version`. Redraw it: what is there was a
  stand-in, not a base. What stands is where things sit and how large, what happens
  when, and the words. Type keeps the sizes and weights it has; a new face changes widths:
  widen a line's box, never shrink its type. A listed scene with no  
  module: new, as in the steps.

**Cut short.** For any film: step 1's pages, if not in this conversation; `list` `modules`,
unless you just did. A scene named in "Scenes left" that has a module failed when the page ran
it, or the sentence is stale (it can be copied early and pasted late): read the scene for a
slip and mend it (`if_version`). No slip to be seen: leave the scene as it is and say in one line
that you found nothing to mend, and to tell you if it still fails; only if they then say so, or
"Scenes left" names it again, write it again, plainer.

- The stage says final (scenes missing or failing): those alone: the named ones, any other whose
  code you see is broken, and any with no module in your `list` (no module: step 3), no more: no
  step 2, 4 or 5. Say in one line what you mended. Nothing missing and no slip, the first
  time: change nothing; say only that you found nothing to mend, and to tell you if it still fails.
- The stage says rough: step 2 only if `base.css` is still the first batch's few lines. Step 3
  for each scene that has no module (new) or is rough (redrawn, and step 2, as "A rough cut
  redrawn" says), in film order; none: nothing. Then 4 and 5.
