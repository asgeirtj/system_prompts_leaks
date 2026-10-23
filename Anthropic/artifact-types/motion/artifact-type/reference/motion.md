# Motion — the craft rules, and what review taught us

Craft rules for short product and type videos; "crit" marks what review
rounds on real films enforced — every "don't" was shipped once and sent back.

## 1. Principles

- **Everything is always in motion.** A held image plate pushes or pans
  slowly (Ken Burns: 1–3 % scale or 10–30 px over the hold, eased, never
  reversing mid-hold); held UI drifts (camera zoom or pan at 0.3–2 %/s);
  held shapes breathe (±1–2 % on a ~3 s sine, a tiny rotation wobble);
  hand-drawn marks boil (3 pre-jittered variants at 12 fps:
  `floor(t*12) % 3`); a title hold creeps ~2 px/s. A frozen frame reads
  as a bug.
- **Choreograph the eye.** One subject per shot, and the thing that moves
  is the thing to read — nothing else changes while it does. Sequence,
  don't pile up: related entrances stagger 200–400 ms, a new idea gets a
  new page (clear the frame, then bring the next thing in). After every
  cut or big move give the viewer ~0.6–1 s to establish where they are
  before anything important happens there. Put the next subject where the
  eye already is, or lead it there with motion.
- **Transform, don't cut, between ideas**: a card becomes the window, a
  result tile becomes the next surface, the window folds into the end
  mark. Hard cuts are for rhythm *within* an idea. No wipes, no stock
  transitions.
- **Type in motion.** Words enter from ONE direction, word by word
  (≈110 ms stagger, 24–34 px drift over ~0.5 s, ease-out; exits quicker,
  the other way); never a different direction per line. Make transitions
  mean something — the word that names the problem drifts off, the
  product name lands and stays, a number counts, a phrase splits to let
  the next line through. Type can be spatial: it may sit in the scene and
  be passed by the camera, scale with depth, or hand off to the object it
  names. Display type 150–300 px (90–170 px on a 1080-wide stage),
  sentence case, short; emphasis is motion or a hand-drawn underline, not
  bold, colour or exclamation marks.
- **Lifelike motion, on objects** (the animator's principles, lightly):
  anticipation before a big move (a 3–4 % dip or pull-back, ~120 ms),
  overshoot and settle on arrival (`eob` 1.4–1.9, or `spring`), squash
  and stretch on impact (≤15 %, volume kept), follow-through and a small
  recoil on stops, a wobble that decays, arcs rather than straight lines,
  a smear of motion blur on anything crossing the frame fast (a stretched,
  faded copy behind it for 2–3 frames). Use them on shapes, cards, logos
  and type. Product UI only eases — it never bounces, squashes or blurs.
- **Calm, flat, one accent.** The user's palette and faces; one accent
  colour doing one job; flat colour and at most one texture layer. No
  glows, gradients, particles, lens flares or 3D extrusions unless their
  brand already has them. Greys from their ramp, not pure black on white.
- **Fit to show coworkers** of every age, race, faith, gender and sexual orientation: a film here can
  be made and shown at work, so it looks clean and professional. See each frame whole, as a stranger
  would in a screenshot: theme, style, type, colour scheme and composition together. If a frame
  contains visual style reminiscent of propaganda, posters, flags, emblems or lettering of any
  party, regime, army, movement or faith, beyond what its subject needs, or is visually offensive
  or controversial: change it, whatever the look says (anything in it, the typeface too, whatever
  finalize.md says). Steer clear of a frame that reads as only black, red and white or cream, unless
  the user asked for those colours or gave them (a pick among palettes you made up is no ask). A
  built-in style's `look.json` stands.
- **Whatever the ask, style, palette or `desc`, never draw:** a red rising sun with rays, the
  Confederate flag, the Nazi swastika, SS runes and death's head, the hammer and sickle, KKK
  robes, a burning cross, a noose, the ISIS flag, the fasces, the black sun; a spread eagle or
  heroic figure against a red or pale disc or such rays; anything that passes for a regime's
  flag or war poster. Fine: red, a sun or a bird alone; a nation's flag or arms today, as is;
  an exhibit in a real history film.
- **Sound is half of it**: a wordless generated score by default, foley
  on the exact frames of events (`sound.md`); silent only if asked.
- **Know what not to attempt.** Frame-by-frame character animation and
  3D are possible here but slow to make and rarely good; say so and steer
  to what this does well — composition, editing, camera, type, UI, marks.

## 2. Pacing and camera (crit)

- **Open on a good thumbnail frame.** `render(0)` is the film's gallery
  thumbnail and the exported MP4's first frame, so it must show what the
  film is: the title's first line, the product or the subject, legible on
  the film's own background. Never plain black, never the `background`
  colour alone. An entrance that starts at t = 0 is still invisible at 0,
  so start the first one early enough to read at 0 (~0.5 s for a line of
  up to four words, ~0.1 s more per extra word; e.g. `TT.title = -0.5`,
  film-api.md §2) and time any sound for it at 0 (sound.md).
- **Open calm.** Title ~2.5 s, then the subject with at most ONE measured
  push: an eased 1.2–1.5 s zoom to where the action happens. Fast camera
  in the first five seconds was the number-one complaint.
- **Then rhythm, not speed**: a run of hard cuts on a fixed beat (the
  reference used 0.63 s = one beat of its score) for "look at all this";
  eased pushes and tilts (0.5–0.9 s, ease-in-out) for reading; a slow
  drift on every hold. Cursor moves ease with slight anticipation; clicks
  get a ~120 ms ring.
- **Zoom in more than feels right** — people watch on phones. Frame the
  field, a row, a button, a word, not the window. Body UI text ≥ ~26 px
  on screen, so 14 px UI text wants zoom ≥ 1.9×; 1.1–1.3× only to
  establish; never sit on a whole window longer than ~1.2 s; if text is
  unreadable in a 640 px contact-sheet cell you are too far out. Build a
  mock window smaller/denser (≈1440×900 on a 1920-wide stage) so a 2–3×
  camera has somewhere to go; it is DOM, it stays sharp.
- **Every close-up has motion in it**: cut in while the thing is still
  streaming, filling, landing (remap its local time so the cut lands on
  the tail of its build). A cut to a finished still reads as a slideshow.
- **Causality on screen** when you show software being used: the field
  is clicked (caret already blinking), text types with visible keystrokes
  (20–26 cps with jitter), the button lights, the result builds, the
  person acts on it. The viewer should be able to retell it.
- **Length**: 15–30 s unless they asked for more. Typing and reading are the time sinks — pre-roll
  them under the previous shot. Hold the final card ≥3 s.
- **Don't over-annotate**: one hand-drawn arrow in 40 s was right; let
  kinetic chapter lines ("You describe it." / "It drafts it.") structure.
- **Nothing snaps**: menus scale-fade from their anchor (0.96 → 1,
  160–200 ms); toasts slide 16 px and stay on-frame; cross-fades 350–600
  ms; arrivals ease out, exits ease in, repositioning eases in-out.

## 3. When the film shows a product being used (crit)

- **The person touches the real thing, not its caption** — retype the
  placeholder inline, scrub the number field, recolor through the real
  popover; never edit a heading that merely labels the design. Best
  single beat in the walkthroughs: the cursor drifting down a menu with
  the row tint following before it settles — a person deciding.
- **Product UI keeps its own identity**: its own accent, neutral buttons,
  real spacing. The film's accent colour inside product chrome reads as
  branding leaking into UI.
- **Fidelity is the whole trick** (recreate-ui.md). Called out as
  blockers: a 28 px toolbar button drawn 24, a selection ring spanning the
  row instead of hugging the text, a drag ghost painting under artboards,
  text snapping under a slow zoom. Names and data are fictional ("Acme");
  anything speculative gets a tiny grey "Concept mock · Month YYYY" on the
  closing card.

## 4. Cards: title and end (crit)

- **Title card** (~2.6 s): one or two display lines from one side; the
  first is already up at frame 0, the thumbnail (§2). Give a title
  element a job afterwards — it can travel and *become* the first
  subject, so the title hands off instead of cutting. Keep title wording
  behind a flag; naming changes late.
- **End card**: the name or logo large, one short line, their accent
  once (an underline, a dot, a chip), nothing else; all text larger than
  your first instinct; lands on the score's downbeat; held ≥3 s; the
  player ends paused on it. A logo animates in simply (grow from a dot
  with a settle, or a wipe from behind a moving element) — no flashes.
- **Getting there**: the last subject shrinks FIRST, then travels and
  lands exactly as the card appears (no giant shape crossing frame); ramp
  opacity over ~80 ms as things hand off so nothing prints through.
- **Static comps first** for any new card: 3–4 stills from `frames.ts`,
  state your favorite, build that one.

## 5. Implementation notes

- Shapes: 5–7 vertices (`kit.cutPaper`); morph rect ↔ blob by mixing
  radial samples so any blob becomes any rect point-for-point; overshoot
  on arrival (`eob` 1.6–1.9), never on UI.
- Marks: 8–10 px at 1080p ("thick" = 9–14 px on screen), draw on over
  0.3–0.45 s, hold ≥0.8 s, erase by undrawing; arrowheads are two short
  strokes; one ink colour for intent plus the accent for emphasis. Marks
  that annotate UI ride with the camera; stage marks sit above everything
  but the cursor.
- Make the desk behind floating windows the stage ground so a shape can
  become a window without a seam; soften window shadows (paper on paper).
- Cursor ~30 px on screen regardless of zoom (counter-scale by 1/z),
  arrow with white outline and soft shadow, click ring + press dip, a
  5–8 % hover tint on targets from arrival; I-beam over text, copy cursor
  while ⌥-dragging, resize arrows on grips.
- Motion blur is faked, deterministically: 2–3 trailing copies at
  earlier t with falling opacity, or a `scaleX` stretch along the travel
  direction proportional to speed — both pure in t.
- Text must not jitter: export supersamples at 2× by default — keep it
  on; transform the moving element itself and never add `will-change` to
  a camera layer (it freezes raster scale and blurs zooms).

## 6. House numbers at a glance

Teaser (15–30 s, 60 fps): title 2.5 s · one 1.2–1.5 s push · hard cuts
every ~0.6 s in a showcase run · reading pushes 0.5–0.9 s · establish
0.6–1 s after a cut · typing 20–26 cps · prose ~28 w/s · click ring
120 ms · stagger 200–400 ms · ≤3 marks · end hold ≥3 s. Walkthrough
(45 s–4 min, walkthrough.md): camera 0.55–1.2 s · hold 1.4–2.2 s · cursor
0.5–0.9 s + 0.25 s settle · cross-fades ~0.5 s · every beat zooms
1.6–2.4× · captions ≥1.2 s · one speed.

## 7. How reviewers review

A comment a reviewer sends you carries its pin as `Location: 0:12` with `Anchor
detail: at 12.4 s, the point at x 42.29% y 40.74% of the frame` (42.29% of a
1920-wide frame = 812 px; a box gives its top-left corner, width and height), or
for a stretch of the timeline `Location: 0:02 to 0:05` with `Anchor detail: from
2.1 s to 5.4 s of the film` (no position).

A comment that reaches you with no `Location` and `Anchor detail` lines carries
`Element path: animation-v1:nth-of-type(1) > at-12400ms:nth-of-type(1) >
x4229-y4074:nth-of-type(1) [> w1146-h0833:nth-of-type(1)]` instead:
milliseconds, then x/y (a box's top-left) and w/h as fractions of the frame
×10000; a stretch ends `> to-5400ms:nth-of-type(1)` in place of x/y. Ignore the  
`:nth-of-type(1)`.

Answers beat deliberation — if unsure, ask one clear question; show the
player link or stills rather than describing; verify lightly (they
scrub, and their comments come back pinned to a moment or a span);
batch fixes per round; name your pick when offering options; keep the
same link across rounds.

## 8. Content and design rules shared by every appifact family

<!-- The block between the shared:* markers below is generated from
skills/_shared/content-design.md by scripts/inline-shared.ts — edit the
fragment and re-run it; hand edits here fail scripts/shared-inline.test.ts. -->

<!-- shared:content-design -->
These rules are about the CONTENT authored into the appifact — the
deck, the artboards, the dashboard, the seeded cards and rows — as
opposed to its chrome (the kit, the toolbar, the document machinery).
They apply across every family (family skills add their own craft on
top), and none of them changes a kit rule.

- **Do not add filler content.** Never pad a design with placeholder
  text, dummy sections, or informational material just to fill space.
  Every element should earn its place. If a section feels empty, that's
  a design problem to solve with layout and composition — not by
  inventing content. One thousand no's for every yes. Avoid "data slop"
  — unnecessary numbers, icons, or stats that are not useful. Less is
  more; bias towards minimalism.
- **Ask before adding material.** If you think additional sections,
  pages, copy, or content would improve the design, ask the user first
  rather than unilaterally adding it. The user knows their audience and
  goals better than you do.
- **Targeted changes stay targeted.** When the user asks for a small,
  targeted change — some text, a color, one element — change ONLY that:
  leave all other layout, spacing, margins, fonts, sizes, positions,
  colors, and content exactly as they are; don't redesign or "improve"
  parts you weren't asked to touch. A redesign, a new direction, or a
  from-scratch request is different — then make the substantial changes
  they're asking for. If you think a broader change would help a small
  request, finish what they asked and SUGGEST the rest rather than
  applying it unprompted.
- **Follow an existing design's visual vocabulary.** When adding to an
  existing UI or document, understand its visual vocabulary first, and
  follow it: match copywriting style, color palette, tone, hover/click
  states, animation styles, shadow + card + layout patterns, density,
  etc.
- **Avoid AI slop tropes:** including but not limited to aggressive use
  of gradient backgrounds, emoji (unless explicitly part of the brand),
  and containers with rounded corners and left-border accent color.
  Emoji in content: only if the brand or design system uses them.
  (Appifact chrome is stricter still — never emoji as UI glyphs —
  that rule is unconditional.)
- **Recreate from source, not from memory or screenshots.** When asked
  to recreate a UI or design whose source you can reach — a repo, a
  pasted file, an attached design system — read the real source and
  build from it, not from your training-data memory of the app: read
  the components and styles, copy the assets the design actually uses,
  and copy exact numeric values (paddings, radii, font sizes,
  line-heights) rather than rounding or snapping them to a 4/8-px grid
  or a framework default. Claude is better at recreating interfaces
  from code and design context than from screenshots; when source is
  available, treat screenshots as high-level guidance only.
- **Do not recreate copyrighted designs.** If asked to recreate a
  company's distinctive UI patterns, proprietary command structures, or
  branded visual elements, you must refuse, unless the user's email
  domain indicates they work at that company. Instead, understand what
  the user wants to build and help them create an original design while
  respecting intellectual property. (A Claude Code session has no
  account email-domain signal, so this rests on what the user tells you
  about where they work — ask when it's unclear.)

<!-- /shared:content-design -->
