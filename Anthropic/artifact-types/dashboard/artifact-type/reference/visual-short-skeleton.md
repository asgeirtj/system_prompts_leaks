# A Visual short's skeleton: HTML and CSS

Working HTML and CSS that, with the script in
`artifact-type/reference/visual-short-script.md`, already do the engine's
part of `visual-short.md`: one writer for each part, the fit, the
containers, filling each marked figure, cues worked out after filling, one
clock, keeping step with Listen, captions that have a row of their own, and the
controls. Start from them and change whatever the piece needs,
keeping the class names the script looks for. What is left to write is the piece
itself: the chapters and captions, the calcs, a `dash.draw` per chart, one
function in `scenes` per chapter, `fmt`, and the look of the drawings.

## One reply has a limit

One reply of yours can only be so long, thinking included, and a call that the
limit cuts short is never run: all of it is lost. Thinking is often the larger
part of a long reply. Calls sent together are still one reply; your next reply
starts once they have been answered. A Visual short planned and written in one
reply can come near the limit, so it need not be the one batch of `SKILL.md`'s
step 3. Whether to split the writes, and how, is yours to judge.

The code is three files: `files/vs.css`, the CSS below and the look of your
drawings; `files/vs.js`, the script; and `files/index.html`, the HTML below,
which names them. A remix writes them under its draft, as
`artifact-type/reference/remix.md` says.

However you write the piece:

- **The script is best left as one file.** A page's scripts each run in a scope
  of their own and this script's parts share names, so two files would need all
  of those on `window`.
- **Each file written draws an open page again, and the page is checked as it
  then stands.** Stored before its script, `index.html` shows the person an
  unfinished page and can fail the check. On a new dashboard, once a file lands
  more than a few seconds after `index.html`, the check stops listing errors
  left uncaught in a timer, a listener or a promise. Until the last file is in,
  the check says nothing of the finished page, so read it after that write. A
  new dashboard with no `index.html` says it is missing once your turn ends.
- **A later change that touches several files goes as one batch**, so that
  nobody sees half of it. In one too long for a reply, each write shows at once
  to everyone looking at that page, and a file `index.html` names that isn't
  there yet is left out, with no note on the page. Read its check only after the
  last write.

```html
<meta name="dash-one-writer">
<link rel="stylesheet" href="vs.css">
<div class="vs">
  <section class="vs-stage" data-read-stage><div class="vs-in">
    <div class="vs-chapters">
      <article class="vs-ch">
        <p class="vs-label">Part of the story</p>
        <h2>A sentence that states the finding</h2>
        <div class="vs-say"></div><!-- on every chapter, and empty: the row where the script lays its caption -->
        <div class="vs-draw"><div data-draw="d1" data-source="orders"></div></div><!-- a chart is a drawing, stored empty; words and single figures beside it are HTML, each figure data-draw="fig" -->
        <p class="vs-src">Measure, who, dates. Runs about <span class="vs-runs" data-draw="runs">—</span> seconds.</p>
      </article>
      <!-- one .vs-ch per chapter; only the first, the title, has "Runs about … seconds." -->
    </div>
    <div class="vs-caps" data-read lang="en"><!-- lang: the language the captions are written in -->
      <p class="vs-cap" data-read-step><span class="vs-s">An email order cost about <span data-draw="fig" data-source="said" data-field="cost" data-where="channel=Email">—</span>.</span> <span class="vs-s">The next sentence.</span></p>
      <!-- one .vs-cap per chapter, in the same order; one .vs-s per sentence; nothing else in here: whatever is, is read aloud too -->
    </div>
    <div class="vs-line">
      <button class="vs-mk" data-read-move aria-label="Part of the story"><i></i></button>
      <!-- one .vs-mk per chapter, in the same order, named for its label; the script names it again, in case the label has been edited since -->
    </div>
    <div class="vs-controls">
      <button class="vs-toggle" data-read-pause aria-label="Play"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.44 3.682L11.59 6.765C12.022 7.024 12.286 7.497 12.286 8C12.286 8.503 12.022 8.976 11.59 9.235L6.44 12.318C6.241 12.437 6.014 12.5 5.782 12.5C5.074 12.5 4.5 11.926 4.5 11.218L4.5 4.782C4.5 4.074 5.074 3.5 5.782 3.5C6.014 3.5 6.241 3.563 6.44 3.682Z"/></svg><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="3" height="9" rx=".75"/><rect x="9.5" y="3.5" width="3" height="9" rx=".75"/></svg></button>
      <button class="vs-back" data-read-move aria-label="Back"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5L5.5 8L10 12.5"/></svg></button><button class="vs-next" data-read-move aria-label="Next"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8L6 12.5"/></svg></button>
      <button data-read-sound aria-label="Read aloud" aria-pressed="true"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12.9 5.5C13.284 6.25 13.5 7.1 13.5 8C13.5 8.9 13.284 9.75 12.9 10.5M10.599 6.5C10.854 6.941 11 7.454 11 8C11 8.546 10.854 9.059 10.599 9.5M8.5 12.899C8.5 13.328 8 13.558 7.671 13.275L4.783 10.748C4.6 10.588 4.367 10.5 4.124 10.5L3.5 10.5C2.948 10.5 2.5 10.053 2.5 9.5L2.5 6.75M5.768 4.391L7.671 2.726C8 2.443 8.5 2.672 8.5 3.102L8.5 7.25M2.5 4L11 12.5"/></svg><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12.9 5.5C13.284 6.25 13.5 7.1 13.5 8C13.5 8.9 13.284 9.75 12.9 10.5M10.599 6.5C10.854 6.941 11 7.454 11 8C11 8.546 10.854 9.059 10.599 9.5M3.5 5.5L4.124 5.5C4.366 5.5 4.6 5.412 4.783 5.253L7.671 2.726C8 2.443 8.5 2.672 8.5 3.102L8.5 12.899C8.5 13.328 8 13.558 7.671 13.275L4.783 10.748C4.6 10.588 4.367 10.5 4.124 10.5L3.5 10.5C2.948 10.5 2.5 10.053 2.5 9.5L2.5 6.5C2.5 5.948 2.948 5.5 3.5 5.5Z"/></svg></button><!-- on at first, struck out once the voice is off. The dashboard keeps aria-pressed, and hides the button where there is no voice -->
      <button class="vs-cc" aria-label="CC, captions" aria-pressed="true">CC</button>
    </div>
    <p class="vs-now" aria-live="polite" data-draw="now"></p>
  </div></section>
  <i data-draw="settle"></i><!-- keep it last: drawings run in order, and this one needs the others filled -->
</div>
<script src="vs.js"></script>
```

```css
.vs, .vs-stage { container-type: inline-size; }
.vs-stage { box-sizing: border-box; aspect-ratio: 16 / 9; width: min(100%, calc(var(--room, 70dvh) * 16 / 9)); margin-inline: auto; overflow: clip;
  background: var(--color-panel); border: 1px solid var(--color-border-line); border-radius: var(--cds-radius); }
@container (max-width: 800px) { .vs-stage { aspect-ratio: 1; width: min(100%, var(--room, 70dvh)); } }
@container (max-width: 560px) { .vs-stage { aspect-ratio: 4 / 5; width: min(100%, calc(var(--room, 70dvh) * 4 / 5)); } }
.vs-in { box-sizing: border-box; height: 100%; padding: 0 3.6cqi 3cqi; display: grid; grid-template-rows: auto minmax(0, 1fr); position: relative; }
.vs-chapters { display: grid; box-sizing: border-box; isolation: isolate; } /* isolated, or a z-index in a drawing lifts it over the caption and the controls */
.vs-in, .vs-chapters, .vs-ch { grid-template-columns: minmax(0, 1fr); } /* Without this, one wide child widens every column. */
.vs-ch, .vs-cap { margin: 0; opacity: 0; transition: opacity 400ms var(--cds-ease-out); }
.vs-ch.vs-on, .vs-cap.vs-on { opacity: 1; } .vs-ch:not(.vs-on) { pointer-events: none; }
.vs-ch { grid-area: 1 / 1; display: grid; grid-template-rows: auto auto auto minmax(0, 1fr) auto; }
.vs-say { grid-row: 3; } .vs-draw { grid-row: 4; } .vs-src { grid-row: 5; } /* by name: a chapter that has lost a row keeps its drawing's */
.vs-draw { container-type: size; display: flex; flex-direction: column; justify-content: safe center; font-size: max(12px, 1.8cqi); } /* a container of its own: inside it, cqh is 1% of the drawing's height, which comes from .vs-ch's 1fr row, not from what it holds */
/* The chapter marks: a band of bars across the top of the stage, which stays up. Each is a button as tall as the band that draws a 3px bar. --marks is the band's height, --row the controls', --ctl their width. */
.vs-in { --marks: max(24px, 4cqi); --row: 32px; --ctl: 176px; }
@media (pointer: coarse) { .vs-in { --marks: max(32px, 4cqi); --row: 52px; --ctl: 240px; } }
.vs-line { grid-area: 1 / 1; height: var(--marks); display: flex; gap: 6px; }
.vs-mk { flex: 1; min-inline-size: 0; position: relative; display: flex; align-items: center; padding: 0; border: 0; background: none; cursor: pointer; forced-color-adjust: none; outline-offset: -3px; } /* the stage would clip a focus ring drawn outside it */
.vs-mk::before { content: ''; position: absolute; inset-inline: 0; background: var(--cds-chart-muted); }
.vs-mk i { position: relative; display: block; width: 0; background: var(--color-fg); }
.vs-mk::before, .vs-mk i { height: 3px; border-radius: 3px; }
@media (forced-colors: active) { .vs-mk::before { background: GrayText; } .vs-mk i { background: CanvasText; } }
/* The caption is a line of plain words under the headline, where it covers nothing drawn. Each chapter keeps a row for it, .vs-say, as tall whatever is being said and with captions off,
   so the drawing never moves; the script lays the caption over that row. It is placed against .vs-in, so .vs-caps must stay unpositioned. Presses pass through it. */
.vs-chapters, .vs-caps { grid-area: 2 / 1; }
.vs-caps, .vs-say { font-size: max(14px, 2cqi); line-height: 1.4; }
.vs-say { block-size: 2lh; } .vs-ch h2 { margin: 0.1em 0 0.3em; } /* the caption stands close under the headline */
.vs-cap { position: absolute; inset-inline: 3.6cqi; display: grid; font-weight: var(--cds-font-weight-medium); }
/* One sentence shows at a time. The rest, and all of them with captions off, are hidden from the eye alone. */
.vs-s { grid-area: 1 / 1; opacity: 0; } .vs-s.vs-on { opacity: 1; }
.vs-caps { pointer-events: none; } .vs-hush .vs-caps { opacity: 0; }
/* The controls: bare icons and CC at the top right, on the label's line, away from claude.ai's own bars under the page. On a narrow stage they have a row of their own above the label. */
.vs-label { margin: 0; padding-block: calc((var(--row) - 1lh) / 2); padding-inline-end: var(--ctl); text-transform: uppercase; } /* one line of it stands level with the controls, and clear of them */
.vs-controls { position: absolute; inset-block-start: var(--marks); inset-inline-end: calc(3.6cqi - 6px); height: var(--row); display: flex; align-items: center; gap: 8px; } /* 6px out, so that CC's letters end where the marks do */
/* vs-idle, vs-held and vs-touch come from the script. The controls fade by opacity, not display, so a keyboard and a screen reader still reach them.
   :focus-visible, not :focus-within: in most browsers a button pressed with the mouse keeps focus, which would hold them up. */
.vs-controls { transition: opacity 200ms var(--cds-ease-out); }
@media (hover: hover) { .vs-playing .vs-stage:is(.vs-idle:not(.vs-held), :not(:hover, .vs-touch)):not(:has(:focus-visible)) .vs-controls { opacity: 0; transition: opacity var(--cds-dur-slow) var(--cds-ease-out) 300ms; } }
@media (prefers-reduced-motion: reduce) { .vs-controls { transition: none !important; } }
.vs-controls > button { flex: none; height: calc(100% - 8px); min-inline-size: 24px; padding-inline: 6px; font: inherit; font-size: 13px; color: var(--color-fg); background: none; border: 0; border-radius: 6px; cursor: pointer; }
@media (hover: hover) { .vs-controls > button:hover { background: var(--cds-border); } .vs-mk:hover::before, .vs-mk:hover i { height: 5px; } } /* on touch, hover sticks after a tap */
.vs-controls > button:has(svg) { display: grid; place-items: center; padding-inline: 4px; }
.vs-controls svg { grid-area: 1 / 1; inline-size: 16px; block-size: 16px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; } /* CDS's Play, Pause, CaretLeft, CaretRight, SpeakerSlash and Speaker, 16px, as its Icon draws them: a page has no icon font */
@media (pointer: coarse) { .vs-controls > button:has(svg) { min-inline-size: 40px; } .vs-controls svg { inline-size: 20px; block-size: 20px; } }
.vs-cc[aria-pressed="false"] { color: var(--color-fg-muted); text-decoration: line-through; }
.vs.vs-playing .vs-toggle > :first-child, .vs:not(.vs-playing) .vs-toggle > :last-child { visibility: hidden; }
[data-read-sound][aria-pressed="true"] > :first-child, [data-read-sound]:not([aria-pressed="true"]) > :last-child { visibility: hidden; }
@container (max-width: 560px) { .vs-line { gap: 4px; } .vs-say { block-size: 3lh; } .vs-chapters { padding-top: calc(var(--row) + 4px); } .vs-label { padding: 0; } }
.vs-now { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
```
