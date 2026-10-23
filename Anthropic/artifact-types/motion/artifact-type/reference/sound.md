# Sound — a score generated from the cut

The score is part of the film: `window.CUT.score(S)` declares notes and
foley against the SAME timeline constants the picture uses, the player
synthesizes it (a small built-in WebAudio synth — no samples, no
soundfont) in sync with playback, and Export renders the
identical events into the MP4's audio track. `S` only records events;
it is deterministic data, so write it like the picture: from `TT`.

## The method (what worked in review)

- **Pick the tempo from the cut, not the other way round.** One beat =
  the hard-cut cadence of your showcase run (0.63 s → 95 BPM in the
  reference); phase the grid (`t0`) so bar lines land on the big
  moments — the first close-up, the editor landing, the end page. If a
  visual beat misses a downbeat by a few frames, retime the BEAT in
  `TT`: nobody sees three frames, everybody hears an off-beat hit.
- **Groove on the grid, foley on exact frames.** Music events take
  beats; UI foley takes the precise t of the event it belongs to, off
  grid: a wood-block tick per visible keystroke (your typist's
  `times`), side-stick clicks on clicks, a double tick for a
  double-click, pops as list items or capsules appear, a rising roll
  while something is dragged or scrubbed with a ding when the value
  lands, a two-note chime on Save, a whoosh under a whip-pan, a boing
  when something drops in and squashes.
- **Arc** (keep the dynamics; don't flatten them): near-silent title
  (a pad, maybe one mallet note) → a light pulse under the typing →
  the groove enters when the action starts → stabs on the hard-cut
  section → drop to a pad for the transform → groove B under the
  person's edit → a short build (an accelerating run) INTO the hit as
  the end page lands → resolve and let the last chord ring; fade by the
  last second. Stop-time before the biggest hit is free drama.
- **Instrumentation that suits a product film**: marimba or kalimba ostinato,
  electric piano chords, a round fingered bass, a light kit (kick, side
  stick, closed hat, a shaker at most), a soft pad. No risers, no
  cinematic booms, no vocal chops. Major or modal, mid-tempo, warm.
- **Your own tune.** Write no existing song's, theme's or jingle's melody, note by note or near
  enough to be recognised: write an original one in that mood. That you did goes in the close's one
  sentence more (what you could not do as asked): it names the song they asked for, not your music.
  The user's own, or in the public domain: fine. A genre, a mood, a tempo, an instrument: fine.
- **They asked for other music: name it in a plain line**: what you wrote (a mood you aimed
  for, two instruments in everyday words: a marimba, plucked notes, an electric piano, a
  shaker), never how it sounds. No key, BPM or apology. Mellower, no typing ticks, other
  instruments: a one-line change. Music off by request is `score` returning nothing; mute and
  volume are the viewer's own.

## `score(S, kit)`

Runs once at load, after `init` (so typists made in `init` have
filled `kit.typing.times`). `S` only records events — pure data.

```js
score(S, kit) {
  const BPM = 95.24, B = 60 / BPM;
  S.tempo(BPM, { t0: TT.cut1 - 16 * B });                  // grid phased so beat 16 IS the first close-up
  S.program('keys', 'ep'); S.program('bass', 'bass'); S.program('mallet', 'marimba'); S.program('pad', 'pad', { rev: 0.6 });
  S.note('pad', 'D3', { beat: 0, beats: 8, vel: 30 });                   // {beat, beats} on the grid, or {t, dur} in seconds
  S.chord('keys', ['D3', 'A3', 'D4', 'F#4'], { beat: 16, beats: 4, vel: 52 });
  S.note('bass', 'D2', { beat: 16, beats: 1.5, vel: 78 });
  S.pattern('mallet', 'x.x.X.xx', { from: 16, repeat: 4, pitch: ['D5', 'A4'], vel: 64 });   // step 0.5 beat; X accents
  S.drums({ kick: 'x...x...', sidestick: '..x...x.', hat: 'oxoxoxox' }, { from: 16, repeat: 8 });   // o = ghost note
  S.ticks(kit.typing.times, { vel: 30 });                               // one wood tick per keystroke, timbre-jittered
  S.fx('click', TT.send); S.fx('pop', TT.chip); S.fx('roll', TT.dragA, { dur: TT.dragB - TT.dragA });   // roll lands on a ding
  S.fx('chime', TT.saved); S.fx('whoosh', TT.whip, { dur: 0.5 }); S.fx('revswell', TT.end, { dur: 1.2 });   // swells INTO TT.end
  S.run('mallet', ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'], { t: TT.end - 0.62, step: 0.1, vel: 50, cresc: 8 });
  S.master({ gain: -6, fadeOut: 1.2 });
}
```

- `S.tempo(bpm, {t0})` sets the grid; `S.beat(n)` → seconds,
  `S.toBeat(t)` → beats. Everything takes `{beat, beats}` (grid) or
  `{t, dur}` (seconds).
- `S.program(track, patch, {pan −1..1, gain dB, rev 0..1, bright
  0..2}?)` names a track. Pitched patches: `marimba`, `vibes`,
  `glock`, `ep` (electric piano), `keys` (soft synth), `pluck`
  (kalimba-ish), `bass`, `pad`. Drums: `kick`, `snare`, `clap`,
  `sidestick`, `hat`, `openhat`, `shaker`, `tamb`, `woodblock`,
  `cowbell`, `tom`, `crash`, `ride`.
- `S.note(track, 'F#4' | midi, {…, vel 0–127})`, `S.chord(track,
  [pitches], {…, spread})`, `S.pattern(track, 'x.X.', {from, step =
  0.5, repeat, pitch: [cycle], vel, dur})`, `S.run(track, [pitches],
  {t, step, vel, cresc})`, `S.drum(name, {beat | t, vel})`,
  `S.drums({name: 'x..o'}, {from, step, repeat, vel})` (`X` accent,
  `o` ghost). A little humanizing is built in (`S.seed(n)` varies it).
- Foley at exact seconds, `S.fx(name, t, {dur, vel, pitch, pan}?)`:
  `tick` (keystroke), `click`, `doubleclick`, `pop`, `ding` (two
  notes a fifth apart), `chime` (a small arpeggio — Save), `sparkle`,
  `whoosh` (`{into: 1}` reverses it), `revswell` (swells INTO its
  `t` over `dur`), `roll` (accelerating ticks over `dur`, a ding on
  landing — drags and scrubs), `boing` (a bouncy landing), `thud`.
  `S.ticks(times, {vel, jitter})` = one tick per time.
- `S.master({gain dB = −6, fadeOut s = 1})`. Keep the arc: the hit
  should be clearly louder than the intro pad.

`pattern`/`drums` with `repeat` happily overrun the beat you meant to
stop at — compute the repeat count (or the step string) to fit
[t0, t1). Unknown drum or foley names are SILENT (an unknown pitched
patch falls back to marimba); `check.ts` lists them with the event
count, tempo and sounding span. An event timed 0.1 s or more before 0
is dropped without a word (one closer is moved to 0), so the sound for
an entrance that starts early goes at 0. Listen by numbers: `export.ts --no-video --levels`
prints loudness per second (RMS dBFS: −60 silent, −30 quiet bed, −20
groove, −12 hit) — no second between the title and the sign-off should
sit below about −30; `--mid score.mid` added to them writes a Standard
MIDI File on your grid for a composer.
Keep it small — a 35 s score is a few hundred events.
