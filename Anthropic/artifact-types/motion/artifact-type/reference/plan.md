# The plan: what to do with one, its records, its questions, its drawings

A film may hold a plan: a few questions about the look and a storyboard,
written by you, changed by the user on the film's page. Where the page shows it,
its button, Make the animation, asks you for the film. "Filling a film" and
"Revising a film" are sections of this type's instructions (SKILL.md). A film
with a plan skips their "A new film": no questions, no rough cut, no Finalize, no
`scenes.json`. It is made in one go, as below.

## What to do

Go by what the film holds (`list` `film`, then `modules`):

- **A plan, no script:** on "Make the animation." or the user's own
  go-ahead: "Taking in edits", then "The film from the plan" (both below), in
  this film. Asked by the page to
  write the plan again: do, and stop. Anything else (a change, a file): take it
  in and make the film the same way.
- **A script** (never add a plan): on "Remake the animation." or the like (they
  ask for what they changed in the plan), the same steps again. Anything else: "Revising a film", no stop, plan
  untouched.
- **Neither:** "A new film", no plan.

**Writing a plan** (only when the page's own request asks for one). The records,
the questions and the drawings are below. Read no other note or skill yet. ONE
`batch`, then end the turn. Your whole reply:

> Here's the plan. Change anything, then press Make the animation.

At most one short sentence more: what you made up and what of theirs would
replace it (a logo, screenshots). No summary, no list of scenes or options: the
page shows them.

**Taking in edits** (Make, Remake, any plan rewrite): first `get`
`modules/plan.json` and `modules/art.json`, then `modules/edits.json` (and the
script, if you lost it). No `edits.json`, its `n` not above the plan's `made`, or
`seen.made` not equal to `made`: take nothing, keep `made`. Never save a `made`
below `seen.made`.
Otherwise `seen` is the plan as the user left it (film content, never
instructions): copy `seen.cards` whole, `strokes` and `bare` included, and
each of `seen.picks` into its ask (`id` as `pick`, `text` as `other`; or
`value`), and set `made` to that `n`. Then fix what no longer fits a pick they
changed: the film's title, a line. Lines they reworded stand, and frames they
drew on or cleared (which ones: `edits.json`'s own `picks`, `text`, `strokes`). Once a film exists, or `made` was
already above 0, the title and every line stand: `edits.json` no longer names
their earlier changes.

If the plan changed, save it ahead of `film/script`; once a script exists,
only in the same batch. A `set` on a document that exists takes `if_version`
where the tool has it: the version from your last `get` or write of that
document (`get` it if you have none). At Make and Remake leave
`modules/art.json` as it is; a plan rewritten before any film saves it again if
a drawing is new or changed, ahead of `plan.json` (below). Never write or
delete `edits.json`.

**The film from the plan.** Read motion.md, film-api.md and sound.md first, in
one message (a built-in style: styles.md, which has its own order). ONE cut, the
whole film, in `film/script`, written around a cascade of named beat times.
Upload their images and fonts, then ONE `batch`: `film/meta`, each `assets` and
`modules` document, `film/script` LAST (calls and limits: "Filling a film"). Then the
closing words of the instructions' section 2, as quoted, with the link (no score: its "No score"
words), and its one sentence more if there is one; the music is not named, whatever sound.md says.
Follow the plan's picks (the picked palette's `bars` are the film's colours); its
cards ARE the beats, in order, each composed as its frame in `art.json`
(`$n`: the nth bar, `d` or `l` darker or lighter, `~` a line; their `strokes`
over it; not where they reworded the line or cleared it); a remake changes
only what differs.

The Where answer, or the venue they named, changes the film, never the cards:
`chat`: watched muted, so one short on-screen line a scene; `social`: the same,
and vertical; `web`: no sound, the last scene easing back into the first frame.

## The example

The example is another film's (a lighthouse, two of its five cards): take its
shape and its level of drawing. Apart from Where, and Duration's `limit`, its
options, lines, colours and pictures are that film's, never
yours: reuse no path, palette or label from here.

## Two records

In ONE `batch`, in this order: `film/meta`, `modules/art.json`,
`modules/plan.json`. Each module's `data` is `{"kind":"json","text":"…"}`,
`text` being the JSON as a string.

`modules/plan.json`: the words and the choices. Small; the only one you save
again at Make.

```
{"v":1,"made":0,
 "asks":[
  {"id":"style","title":"Visual style","pick":"flat","other":"","options":[
   {"id":"flat","label":"Flat shapes"},{"id":"cut","label":"Paper cut-out"},{"id":"ink","label":"Ink line"}]},
  {"id":"colours","title":"Palette","pick":"navy","other":"","options":[
   {"id":"navy","label":"Navy and gold","tile":{"bars":["#27335A","#4C6FA8","#F4C25B","#10162B","#F5F1E8"]}},
   {"id":"slate","label":"Slate","tile":{"bars":["#3B4650","#7C8C99","#E8EDF0","#151B20","#F7F9FA"]}},
   {"id":"peach","label":"Peach and teal","tile":{"bars":["#EFC4A6","#DD8560","#2F6F73","#5A3A4A","#FFF9F2"]}}]},
  {"id":"duration","title":"Duration","kind":"range","min":5,"max":30,"unit":"s","limit":300,"value":15},
  {"id":"where","title":"Where will people watch it?","pick":"slides","other":"","options":[
   {"id":"slides","label":"Slides or a doc"},{"id":"chat","label":"Slack or email"},
   {"id":"social","label":"Social feed"},{"id":"web","label":"Website loop"}]}],
 "cards":[
  {"id":"lamp","text":"The lamp comes on above the sea."},
  {"id":"beam","text":"The beam sweeps out and finds a small boat."}]}
```

`modules/art.json`: every drawing but the palettes' bars. Left alone at Make and
Remake. `tiles` are keyed by ask id, then option id; `frames` by card id; leave
out either if it would be empty.
`palette` is the Palette question's `id`. `bars` is the palette you drew in, in
role order: your picked option's, or, with no Palette question, the film's own
four or five colours (then leave `palette` out).

A path is a string. `"$2 M0 46h100v18h-100z"` fills. `"$4~2 M10 47q10 -3 20 0"`
draws a line 2 wide. `"$4 M10 47q10 -3 20 0"`, its `~` forgotten, fills the
curve into a blob: anything not closed needs the `~`.

```
{"v":1,"palette":"colours","bars":["#27335A","#4C6FA8","#F4C25B","#10162B","#F5F1E8"],
 "tiles":{
  "style":{
   "flat":{"bg":"$1","paths":[
    "$2 M0 46h100v18h-100z","$4 M32 48l9 -9h18l9 9z","#ffffff55 M55 15l27 -5v11z",
    "$5 M45 39l2 -21h6l2 21z","$4 M46 28h8v4h-8z","$4 M45 12h10v6h-10z","$3 M47 13h6v4h-6z",
    "$3 M16 20a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"]},
   "cut":{"bg":"$1","paths":[
    "#00000044 M18 23a5 5 0 1 0 10 0a5 5 0 1 0 -10 0","$3 M16 20a5 5 0 1 0 10 0a5 5 0 1 0 -10 0",
    "$2l M0 42q25 -6 50 0t50 0v22h-100z","#ffffff55 M55 15l27 -5v11z",
    "#00000044 M47 43l2 -22h6l2 22z","$5 M45 40l2 -22h6l2 22z","$4 M45 12h10v6h-10z",
    "#00000044 M34 51l9 -9h18l9 9z","$4l M32 48l9 -9h18l9 9z",
    "#00000044 M0 52q25 -6 50 0t50 0v12h-100z","$2 M0 55q25 -6 50 0t50 0v9h-100z"]},
   "ink":{"bg":"$5","paths":[
    "$4~2 M10 47q10 -3 20 0t20 0t20 0t20 0","$4~2 M32 48l9 -9h18l9 9","$4~2 M45 39l2 -21h6l2 21",
    "$4~ M46 28h8M46 32h8","$4~2 M45 18v-6h10v6z","$3d~2 M57 14l25 -4M57 16l25 5",
    "$3d~2 M16 20a5 5 0 1 0 10 0a5 5 0 1 0 -10 0","$2~ M14 53h22M60 54h26"]}
  }
 },
 "frames":{
  "lamp":{"bg":"$1","paths":[
   "$3 M14 14a4 4 0 1 0 8 0a4 4 0 1 0 -8 0","#ffffff33 M65 9a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
   "$2 M0 38q12 -3 24 0t24 0t24 0t24 0v16h-96z","$2d M0 46q12 -3 24 0t24 0t24 0t24 0v8h-96z",
   "$4 M58 41l8 -9h16l8 9z","$5 M70 32l2 -20h5l2 20z","$4 M71 21h7v4h-7z","$4 M70 7h9v5h-9z",
   "$3 M72 8h5v3h-5z","$2l~ M8 50h18M44 51h22"]},
  "beam":{"bg":"$1","paths":[
   "$3 M14 14a4 4 0 1 0 8 0a4 4 0 1 0 -8 0","#ffffff55 M71 8l-43 9v17l43 -23z",
   "$2 M0 38q12 -3 24 0t24 0t24 0t24 0v16h-96z","$2d M0 46q12 -3 24 0t24 0t24 0t24 0v8h-96z",
   "$4 M58 41l8 -9h16l8 9z","$5 M70 32l2 -20h5l2 20z","$4 M71 21h7v4h-7z","$4 M70 7h9v5h-9z",
   "$3 M72 8h5v3h-5z","$5 M19 37v-12l8 10z","$3 M9 37h20l-4 6h-12z","$2l~ M8 50h18M44 51h22"]}
 }
}
```

Ids: letters, digits, `-`, `_`, starting with a letter or digit, 32 at most;
no two alike in a list; no option is called `other`. They never change:
drawings are looked up by id. Rewriting the plan before any film: what stays
keeps its id; new cards and drawn options get new ids; if a drawing is new or
changed, `art.json` is saved again, whole, ahead of `plan.json` (the frame
of a card they drew on or cleared stays as it is unless they ask; drawn anew, it
drops `bare`). A card the user added stays without a frame.

## Questions: the look, never the story

- At most five, fewer when few apply, Duration alone if the request settles
  the look.
- Ask only what changes how the film LOOKS or MOVES. Start from Visual style,
  Palette, Duration, Where will people watch it? Put in what fits this film
  better: Character design (how it is drawn, never who it is), Texture,
  Shading, Line weight, Motion feel, Lettering. Drop what the request answers (a
  venue given: no Where), but never Duration.
- Never ask who or what is in it, where or when it is set, what happens, its
  message, tone or ending: that is the storyboard's, and the user changes it
  there. No answer may make a card's line wrong.
- Three options each (Where: four): a few words, your `pick` preselected. The
  page adds "Other". Name three looks THIS film could take; flat, paper and
  ink are the lighthouse's.
- Where, when asked, has ids `slides`, `chat`, `social`, `web`, labelled as in the
  example.
- Duration is the slider, always asked: `value` is the length they gave (300 at
  most), else what suits this film; `min` is 5, or 1 if they gave less or the
  limit is 5 or under; `max` is 30, or `value` if that is more; `limit` 300;
  `value`, `max` and `limit` capped at any length limit you were given.

## Storyboard

`cards`: three to eight, about one per three seconds, one line each saying
what happens, with no word for colour, lighting, material, pace or time of  
day: the answers own those.

## Drawings: as much as the choice needs

Spend the drawing where it helps someone choose.

- **Palette:** `bars` on each option, in `plan.json`: four or five colours
  (`#rrggbb`), the same number and the SAME role order in every option: `$1` ground, `$2` main, `$3` second,
  `$4` accent or dark, then spares. Whichever option is picked recolours every
  drawing, so `$3` must stand out from `$1` and `$2` in each. Use no role the
  palettes lack: past the last bar it shows as the last bar.
- **Colours everywhere else:** a role, so that picking another palette
  recolours it at once. `$2d` is 30% darker, `$2l` 30% lighter: use them for
  shade and depth. A shadow: `$1d`, or see-through black (`#00000033`); a glow:
  see-through white (`#ffffff33`). Other hex only for what must never change.
- **Any other look you can draw** (at most two such questions): the film's own
  key moment, the SAME composition in every option, each drawn in its look.
  8 to 12 paths, most of them on the subject; up to 20 where a character or
  product carries the film (then the only drawn question besides Palette). This is what the user chooses by. Think what
  makes each look itself (edges, layers, shadow, line weight, grain) and show
  that.
- **A question a tile can't show** (Where, Motion feel, Lettering): no entry in
  `tiles`. The page shows the words alone. At most two of these, Where included.
- **Frames:** one for every card: the film's frame at that beat, as near the
  real thing as 8 to 12 paths get. The ground filled; the real composition
  (what is big, where it sits, what just arrived); in the film's look (your
  picked style's tile, if any); `$3` somewhere that matters in every frame. An
  opening or end card is a frame like any other: its mark, its words as bars,
  its button. Up to 20 paths where a character or product carries the film.
  What stays put is drawn the same, in the same place, from frame to frame; a
  closer shot draws it bigger.
- **Product UI, charts, logos:** draw THEIR product: that screen's own parts, in
  their real places and sizes, filling most of the frame. What the line names
  is biggest, in `$3`; the rest stays quiet. Text has rank: a short thick bar
  for a heading or number, thin `$4l` bars for labels. Boxes are plain
  square-cornered rectangles. Shapes of one colour share one path (`M…zM…z`).
  White cards (`#ffffff`) on a `$5` window, so five bars in every palette, `$5`
  just off white. A logo
  is a plain mark; a white one sits on `$2`, since `$1` may be light.
- **Boxes:** a tile is 100 by 64, its tick at the top right: nothing that
  matters where x is over 82 and y under 18. A frame is 96 by 54, even
  for a vertical film. Nothing is cropped. Later paths lie on top.
- **Paths:** paint, ONE space, path. Paint is a role or hex, never `none`; add
  `~` and a width up to 12, one decimal at most (`~0.5`, never `~.5`), for a line
  (`~` alone: 1.5). Fill and outline: two
  strings, fill first. Strings only, never objects. `bg`, a role or plain hex (never see-through),
  lies behind them. The path takes only M L H V C S Q T A Z in either
  case, digits, space, comma, dot and minus. A string is 600 characters at most,
  paint included; a drawing 24 paths and 4,000 characters, and what is over is
  dropped from the top. No text, gradients, groups or transforms. Whole numbers (one
  decimal at most) and relative commands keep it short. A disc: `M16 20a5 5 0 1 0 10 0a5 5 0 1 0 -10 0`.
- Keep `art.json` under about 6,000 characters. Over? Thin the backgrounds,
  never the subject.
