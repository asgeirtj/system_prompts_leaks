# Walkthrough films — the slower, explanatory flavor

For "show me how this flow works" pieces (a single flow 35–50 s; a
multi-flow story up to 3–4 min) the tone is focused:
deliberate, one speed, generous holds, an eased camera with a
spotlight, an honest cursor, caption chips, chapters. Same cut contract,
same kit, same rules — only the tempo and a few extra devices change.

## Story first: chapters → beats

Write it before any code. Per flow: who wants what (a fictional persona
and a one-line need, first person, ≤12 words), the 4–8 UI beats that
show it — each beat = ONE region of interest + ONE action + at most one
caption or mark — the line worth saying afterwards, and a closing recap.
A beat you can't caption in four words is two beats; anything that
doesn't move the story goes. Chapters become `window.CUT.chapters`
(their titles are verbs: "Start from an app", "Share it").

## House numbers (defaults; every one was tuned in review)

- Camera moves 0.55–1.2 s, eased `cubic-bezier(.22,.7,.24,1)` for
  arrivals and `(.45,0,.2,1)` for repositioning. **Hold 1.4–2.2 s** on
  every point of interest before anything else happens; if in doubt add
  0.4 s. The window rests at ~92 % of the stage but rests rarely:
  **every beat zooms 1.6–2.4×** onto its region; never sit on the full
  window longer than ~1.2 s. Drift 1–2 % on holds.
- Cursor travel 0.5–0.9 s on arced paths, a visible 200–300 ms settle
  on the target, then the click; hover tint from arrival. Cross-fades
  350–600 ms; menus 160–200 ms from their anchor. Nothing snaps, nothing
  teleports.
- **Spotlight**: a mask on `kit.fx` that dims everything outside a
  rounded region to ~55 % — `kit.spotlight(rect, amount, {pad: 24,
  radius: 28})` inside `render`, with `amount` eased from t (0.5–0.8
  for context beats, 1.0 for "look exactly here"; lerp the rect to glide
  between nearby regions, fade-jump-fade between distant ones). Off
  during typing and streaming beats.
- **Caption chips**: `kit.chip(text, {x, y, anchor: [ax, ay]})` in
  `init` → a 26 px white pill (pass `style: 'font-family:…'` for your
  font asset) with a 1.5 px leader line and anchor
  dot to the thing it names; `kit.show(chip, t, tIn, tOut)` in
  `render`. Place it in the dimmed area — never over the region — on
  screen ≥1.2–1.6 s. Labels, not sentences ("Pinned for you"), ≤6
  words, never "successfully". A tooltip and a caption never say the
  same thing.
- **Chapter title slide**: a breathing cut-paper number quad in the
  accent, a 96 px display headline fading from the right (60 ms word
  stagger, 34 px drift), a 40 px subhead; 2.4–3.2 s. Then the quad **morphs into
  the UI window** (1.1–1.2 s) while the screen fades up inside it — no
  hard cuts from slides into UI.
- **Personas** (multi-flow only): a 220 px flat smiley in ONE secondary
  color (never touching the accent) whose eyes and smile are ink marks
  that draw on and boil; name 40 px semibold, role 30 px, their need as a
  44 px display line from the right; ~3.5 s;
  then it flies down to a 72 px badge bottom-left and rides there
  through that flow's beats.
- **No speech bubbles over UI.** When the person has something to say
  mid-flow, use an interstitial text card: the UI eases to scale 0.96 /
  opacity 0.25, one 72 px display line (and the small smiley) scales
  0.92 → 1 over 1.4 s, holds 1.6 s, the UI eases back.
- **Closing card**: a 72 px display line from the right, one accent
  recap chip per flow tumbling in (2.5D is allowed for shapes), a tiny grey
  "Concept mock · Month YYYY". The player ends paused on it.
- Type: the product's own body face inside mocks; everything the
  viewer must read ≥ ~26 px on screen after zoom.

## Don'ts (each was real feedback)

Tiny text · resting zoomed out · speech bubbles over UI · a cursor that
jumps · yellow-highlighter rectangles (use marks) · "Made with X"
overlays · a speed toggle · player chrome cluttered with tickers · toasts
firing off-frame while the camera is elsewhere (pan to them or skip
them) · frozen holds · tooltip + caption duplication · hard cuts from
slides into UI · real customer names or data.

## QA for long films

`frames.ts --every 1 --sheet` reads as a storyboard: two or more
consecutive cells at each point of interest, no cell where nothing
readable is on screen, the cursor never jumps between consecutive cells
without a fade, captions never overlap their region, at most one
secondary color per scene. Check click targets by eye on the stills at
each click time (`frames.ts --at` those times); `check.ts` does not
hit-test clicks yet.
