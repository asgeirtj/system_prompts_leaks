# A Visual short's skeleton: the script

Goes with the HTML and CSS in `artifact-type/reference/visual-short-skeleton.md`,
as `files/vs.js`.
Yours to write: the calcs, `fmt`, a `dash.draw` per chart and `scenes`. The rest
is the engine: copy it as it stands, unless
the person asks for something it doesn't do.

```js
// Figures as the captions say them: rounded for the ear, still numbers from the data, so the mark check compares them.
dash.calc('said', {inputs: ['orders'], title: 'Figures as the captions say them', description: 'Rounded to two significant figures.',
  fn: (orders) => orders.map((r) => ({channel: r.channel, cost: r.cost == null || !Number.isFinite(+r.cost) ? null : +(+r.cost).toPrecision(2)}))});

const root = document.querySelector('#dash-root'), vs = root.querySelector('.vs'), stage = vs.querySelector('.vs-stage');
const [chs, caps, mks] = ['.vs-ch', '.vs-cap', '.vs-mk'].map((q) => [...vs.querySelectorAll(q)]); // one of each, and one scene, per chapter
const still = matchMedia('(prefers-reduced-motion: reduce)');
const words = (el) => el.textContent.replace(/\s+/g, ' ').trim();
const write = (el, s) => { if (el && el.textContent !== s) el.textContent = s; }; // text only when it changes
const says = (i) => [...(caps[i]?.querySelectorAll('.vs-s:not([hidden])') ?? [])]; // a chapter's sentences, less any the data ruled out
const called = (i) => ['.vs-label', 'h1, h2, h3'].map((q) => chs[i]?.querySelector(q)).map((el) => (el ? words(el) : '')).find(Boolean) ?? String(i + 1);
// How a figure is written, by source and field; any other as it comes.
const fmt = {'orders.cost': d3.format('$,.2f'), 'said.cost': d3.format('$,~f')};
let said = [], durs = [], cur = 0, t = Infinity, playing = false, begun = false, raf = 0, last = 0, heard = null, was = null, pace = 1;
const phase = () => root.getAttribute('data-dash-read-phase'); // there while a reading is open, and for a moment as a reader edits by hand

// While a reading is open every time is scaled by `pace`: how long the voice took over the last caption it read through, against 15 characters a second.
const paced = (at) => (phase() ? at * pace : at);
// The second at which the mark named by `word` arrives in chapter i: where the word starts in the caption; 0 if it isn't there.
const cue = (i, word) => paced(Math.max(0, said[i].indexOf(word)) / 15);
// How far a move that starts at second `from` has got at time t, 0 to 1.
const moved = (t, from, len = 0.6) => d3.easeCubicOut(Math.max(0, Math.min(1, (t - from) / len)));
// A figure that counts up: `real` is marked and keeps its value; `copy` (data-draw="copy", unmarked, aria-hidden) lies over it and counts.
const places = (v) => { const [m, e = 0] = String(v).split('e'); return Math.min(100, Math.max(0, (m.split('.')[1] ?? '').length - e)) || 0; };
const shown = (s) => (String(s).match(/\.(\d+)/)?.[1] ?? '').length; // the decimals in a figure as written
const count = (real, copy, p, value, f) => {
  real.style.opacity = p < 1 ? 0 : 1; copy.style.opacity = p > 0 && p < 1 ? 1 : 0;
  if (p >= 1) return;
  let s = f(value * p); // on the way it is never written with more decimals than the finished figure
  if (shown(s) > shown(f(value))) s = f(+(value * p).toFixed(places(value)));
  write(copy, s);
};

// One per chart: make its elements from its rows, whole, and leave a — when there are none or the status isn't "ok"; fill each mark it makes with fig(mark), but no header cell, which is a label. Runs on new data and on a new width.
dash.draw('d1', (el) => { /* el.replaceChildren(...) */ });
// One function per chapter. It finds what the drawings made at each call, skips what is missing, sets styles from t and makes nothing; t = Infinity is the chapter whole. Take every time from cue(), so that a voice's pace reaches it.
const scenes = [(t) => { /* for (const bar of chs[0].querySelectorAll('.bar')) bar.style.width = bar.dataset.share * moved(t, cue(0, 'email')) * 100 + '%' */ }];

function fig(el) { // the one place marked text is written: fills one mark, its row found as the dashboard finds it
  const dec = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  const {source, field, where, row: n} = el.dataset, d = dash.data(source), rows = d.status === 'ok' && Array.isArray(d.data) ? d.data : [];
  const row = where == null ? rows[+(n ?? 0)] : rows.find((r) => where.split('&').every((p) => {
    const i = p.indexOf('='); return i > 0 && String(r[dec(p.slice(0, i)).trim()] ?? '') === dec(p.slice(i + 1)); }));
  const v = row?.[field];
  write(el, v == null || v === '' ? '—' : (fmt[source + '.' + field] ?? String)(v));
}
dash.draw('fig', fig); // every marked figure in the HTML is data-draw="fig"
for (const name of ['runs', 'now', 'copy']) dash.draw(name, () => {}); // drawings the engine writes in at its own times
const due = new Map(); // the second each sentence starts at, by its span; not a property of the span, since Safari has a span.cue of its own
function timing() { // after the figures: filling moves where the words fall
  said = chs.map((_, i) => says(i).map(words).join(' ')); durs = said.map((s) => s.length / 15 + 1);
  chs.forEach((_, i) => { let at = 0; for (const s of says(i)) { const w = words(s), j = said[i].indexOf(w, at); due.set(s, (j < 0 ? at : j) / 15); if (j >= 0) at = j + w.length; } });
  write(vs.querySelector('.vs-runs'), String(Math.round(d3.sum(durs) / 5) * 5));
}
function draw(i, t) {
  scenes[i]?.(still.matches || t >= paced(durs[i]) ? Infinity : t); // under reduced motion the drawing is whole, and the sentences still take their turns
  const ss = says(i), k = begun ? ss.findLastIndex((s) => t >= paced(due.get(s))) : 0; // the sentence being said; before the first Play, the first
  ss.forEach((s, j) => s.classList.toggle('vs-on', j === Math.max(0, k)));
}
function frame() {
  draw(cur, t);
  mks.forEach((m, j) => { for (const bar of m.children) bar.style.width = (j < cur ? 1 : j > cur ? 0 : t === Infinity ? +begun : Math.min(1, t / paced(durs[cur]))) * 100 + '%'; }); // whole: full, but for the title before the first Play
}
function show(i, from) {
  if (i !== cur) { draw(cur, Infinity); if (!phase()) write(vs.querySelector('.vs-now'), called(i)); } // what leaves is left whole: its marks are still checked
  [cur, t] = [i, from];
  for (const set of [chs, caps]) set.forEach((el, j) => el.classList.toggle('vs-on', j === i));
  chs.forEach((ch, j) => ch.setAttribute('aria-hidden', String(j !== i))); // not the captions: Listen skips what is aria-hidden
  for (const set of [mks, caps]) set.forEach((el, j) => (j === i ? el.setAttribute('aria-current', 'true') : el.removeAttribute('aria-current')));
  mks.forEach((m, j) => m.getAttribute('aria-label') === called(j) || m.setAttribute('aria-label', called(j))); // so that a hand edit of the label reaches the chapter mark
  frame();
}
function tick(now) {
  raf = 0;
  if (!vs.isConnected || (phase() ? phase() !== 'playing' : !playing)) return;
  t += last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
  if (phase() || t < durs[cur]) frame(); // in a reading the chapter waits, whole, for the voice, and the clock runs on to time it
  else if (cur < chs.length - 1) show(cur + 1, 0);
  else return play(false);
  raf = requestAnimationFrame(tick);
}
const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
function look() { const on = phase() ? /starting|playing/.test(phase()) : playing; vs.classList.toggle('vs-playing', on); vs.querySelector('.vs-controls .vs-toggle')?.setAttribute('aria-label', on ? 'Pause' : 'Play'); } // Play or Pause by the voice's phase, or by the page's own clock when there is no voice; the dashboard reads vs-playing too
function play(on) { playing = on; begun ||= on; look(); frame(); if (on) kick(); }
// While a reading is open, the dashboard hears the same presses (data-read-pause, data-read-move) and the voice keeps time: a press here shows its chapter, and starts and stops no clock.
const from = (i) => (show(Math.max(0, Math.min(chs.length - 1, i)), 0), phase() || play(true));
const on = (q, f) => { const b = vs.querySelector('.vs-controls ' + q); if (b) b.onclick = f; }; // a piece may leave a control out
on('.vs-toggle', () => phase() || (playing ? play(false) : t < durs[cur] ? play(true) : from(cur === chs.length - 1 ? 0 : cur)));
on('.vs-back', () => from(cur - 1));
on('.vs-next', () => from(cur + 1));
mks.forEach((m, j) => (m.onclick = () => from(j)));
on('.vs-cc', (e) => e.currentTarget.setAttribute('aria-pressed', String(!vs.classList.toggle('vs-hush')))); // captions on or off, until the page is loaded again
// vs-idle: a mouse still for 3 s counts as gone, unless its last move was onto the controls (vs-held); vs-touch: a finger or pen, which may leave no hover, counts as on the stage
stage.onpointermove = stage.onpointerdown = (e) => {
  const m = e.pointerType === 'mouse', move = e.type === 'pointermove', l = stage.classList;
  if (move && Math.abs(e.clientX - stage.x) + Math.abs(e.clientY - stage.y) < 4) return; // no move: a click can drift a pixel, and a still mouse gets a move when the page changes under it
  [stage.x, stage.y] = [e.clientX, e.clientY];
  l.toggle('vs-idle', false); l.toggle('vs-touch', !m); l.toggle('vs-held', move && !!e.target.closest('.vs-controls'));
  clearTimeout(stage.idle); if (m) stage.idle = setTimeout(() => l.add('vs-idle'), 3000);
};
still.onchange = () => (vs.isConnected ? frame() : (still.onchange = null)); // switched while paused in mid-chapter

const mo = new MutationObserver(() => {
  if (!vs.isConnected) return mo.disconnect();
  const now = vs.querySelector('[data-dash-read-now]'), p = phase(), again = p === 'starting' && was !== 'starting'; // each start reads its caption from the top
  const through = heard && p === 'playing' && was === 'playing'; // the voice went on by itself, so t is how long the caption took
  const before = was; was = p;
  if (!p) { if (heard) t /= pace; heard = null; if (before) play(/starting|playing/.test(before)); return; } // the voice is off: go on without it from here, playing if it was starting or playing
  playing = false; begun = true; look(); // the voice keeps time now
  write(vs.querySelector('.vs-now'), ''); // else a later move to the chapter it names would not be announced, since write() skips unchanged text
  if (now && (now !== heard || again)) {
    if (through) pace = Math.max(0.5, Math.min(1.5, t / (durs[cur] - 1) || 1));
    const i = caps.indexOf((heard = now));
    if (i >= 0) show(i, 0); // a stamp on anything but a caption moves nothing
  }
  if (p === 'ended') show(cur, Infinity); // read to its end, or a reader edits by hand: whole
  kick();
});
mo.observe(root, {subtree: true, attributes: true, attributeFilter: ['data-dash-read-phase', 'data-dash-read-now']});

// Lays each caption over the row its chapter keeps for it under the headline; with no row, over the top of the drawing.
function seat() {
  const top = vs.querySelector('.vs-in').getBoundingClientRect().top;
  chs.forEach((ch, i) => { const row = ch.querySelector('.vs-say, .vs-draw'); if (row && caps[i]) caps[i].style.top = row.getBoundingClientRect().top - top + 'px'; }); // a person may have deleted either
  if (durs.length) frame();
}

let box = vs.parentElement; // the box the page scrolls in
while (box.parentElement && !/auto|scroll/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
const fit = () => vs.style.setProperty('--room', Math.max(240, box.getBoundingClientRect().bottom - box.scrollTop - vs.getBoundingClientRect().top
  - parseFloat(getComputedStyle(root).paddingBottom) - parseFloat(getComputedStyle(box).paddingBottom)) + 'px'); // the box may be padded for a bar that floats over its foot
const ro = new ResizeObserver(() => (vs.isConnected ? (fit(), seat()) : ro.disconnect())); for (const el of [box, stage, ...vs.querySelectorAll('.vs-draw')]) ro.observe(el); // the stage too: when only its width changes, the dashboard draws each chart again, whole, without settle, and this puts the chapter showing back at t; each drawing's box, which changes height when a headline above it rewraps, as under Translate
document.fonts.ready.then(() => vs.isConnected && seat()); // a web font that comes late moves the rows

dash.onData(fit);
dash.draw('settle', () => { timing(); show(cur, t); seat(); }); // the last drawing in the HTML, so it runs once the others have
```
