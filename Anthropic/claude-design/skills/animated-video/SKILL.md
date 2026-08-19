---
name: animated-video
description: "Timeline-based motion design"
user-invocable: true
---

# Animated video

Create an animated video or motion design piece rendered as an HTML page. Build a timeline-based animation with smooth transitions. Design frame-by-frame sequences with playback controls (play/pause, scrubber). Focus on visual storytelling with the Anthropic brand palette. Export-ready at a fixed aspect ratio (16:9 or 9:16). If you need to know the position of an element (eg to move a cursor or character between elements) use refs to grab the position.

ALWAYS build on the `animations_v3.jsx` starter for ANY animation piece — including one hosted on a design-components page (the helmet-script + x-import structure IS the starter case, not an exemption). The only exemptions: a minor animated accent inside a larger non-animation design, or the user explicitly asking you not to use the starter. Skipping the starter silently removes the user's timeline editor — scene trims, speed changes, and video export only exist when the page builds on the engine. Do NOT load `animations.jsx` or `animations-v2.jsx` alongside it (the engines share window globals — last wins). A project that already uses an older starter keeps it; don't migrate existing animations.

START by calling `copy_starter_component` with `kind: "animations_v3.jsx"` — the continuous-composition engine: the whole animation is ONE element tree rendered from one authored-time clock, so elements move, morph, and persist across section boundaries by ordinary interpolation — nothing mounts or unmounts at a boundary. It gives you `<CompositionStage>`, `useComposition()` (→ {T, CUES}), `<Shot>`, `<Captions>`, an `Easing` library, and `interpolate()` / `animate()` tweens. Read the file after copying.

THE AUTHORING CONTRACT (it's in the file's usage block; follow it exactly): declare the scene list as a JSON string literal in a plain inline `<script>` of the MAIN document — `<script>window.OM_SCENES = '[{"name":"Opening","dur":3},…]';</script>` (exact JSON.stringify formatting, no spaces) — NOT in a text/babel script and NOT in a sibling .jsx (only vanilla inline script literals are addressable for the editor's write-back); declare `window.OM_PLAYBACK` the same way; pass both through untouched as `<CompositionStage scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>` wrapping ONE component — the whole piece. The scene list is the user-control view (names, order, playback durations); the engine derives the cue table from it, so the literal is the single source of structure. The user edits timing on the host timeline — trim a scene's edge, or set a section's speed — and every edit writes back into your literal and reflows the composition live.

CUE-FIRST DISCIPLINE (this is what makes a piece read as one continuous video):
1. Write the OM_SCENES literal FIRST — it is the piece's outline. Get {T, CUES} from `useComposition()` and key ALL choreography to T and CUES.SectionName (authored seconds) — never to your own clock, never to wall-clock time.
2. One helper component per section for readability, but ALL of them render ALL the time inside the one tree, keyed to cues — never conditionally mounted per section. A shared element crossing a boundary is just motion whose start and end straddle a cue.
3. Define exactly three motion helpers up front (e.g. `MOTION = {enter, draw, pop}` wrapping Easing curves) and use no easing or transform outside them; one caption element, one visible at a time (`<Captions>` has this built in).

TIMING IS USER-EDITABLE (time-stretch): when the user trims or speeds a section, the engine replays that section's SAME authored slice over the new playback length — choreography keyed to T retimes, never cuts off. Authored hard cuts are content now, not structure: wrap a shot's elements in `<Shot from={CUES.X} to={CUES.Y}>` (visibility flips at the cues; children stay mounted so images and videos hold their readiness). A looping piece shows its last authored frame immediately before its first — make them match.

Give every motion project a tweaks panel (`kind: "tweaks_panel.jsx"`) whose TWEAK_DEFAULTS include `"motionEditor": true` with a `<TweakToggle label="Motion editor">` wired to it. That key is the host timeline editor's visibility gate: the user flips it in the Tweaks panel to hide or show the editor bar, and the animation, its timing data, and export are untouched either way. Declare the TWEAK_DEFAULTS literal in a plain inline `<script>` of the MAIN document (the /*EDITMODE-BEGIN*/ convention), so the flip persists.

The stage renders inside <svg><foreignObject>; if a screenshot of it comes back black, that's a capture artifact — trust the live preview.

WATCH the video before calling it done: stills at hand-picked timestamps hide exactly the boundary bugs (pops, mistimed motion) that make a piece feel disjointed. Build a filmstrip with ONE multi_screenshot call — in each step's code, seek by dispatching `new CustomEvent('data-om-seek-to-time-frame', {detail: {time: T, sync: true}})` on `document.querySelector('[data-om-exportable-video-with-duration-secs]')`, with T values straddling every scene boundary (boundary ±0.15s; boundaries are the running sums of your OM_SCENES durs) plus a mid-scene anchor or two (12-step cap per call — on long pieces spend the steps on boundaries). Two adjacent captures that don't visually match are a discontinuity to fix.

Animations are complex code! Make reusable JSX components for each visual element and each section. Invest in tweaking the timeline iteratively.

Animation tips:
- Storytelling is KEY! Before you create ANYTHING, identify the story arc, key tensions, characters, etc. Align on the message you want to convey. Run it by the user.
- Use good animation principles... anticipation, easing, follow-through, exaggeration, all the Disney animator principles.
- Scenes should have establishing shots setting the scene (use titles or captions if NECESSARY, but prefer to show not tell), followed by heavy zooms on the action. (either hard cuts, or ken-burns-style zooms, or mouse-follows.) Most scenes should exist in a realistic context: they should have a background, or exist in the UI of a computer or phone; etc. Elements should generally not float in the aether.
- In short animations, most 'scenes' are a single shot, or a sequence of shots in the same setting. Scenes may be slides (e.g. text or graphics onscreen, animating or being emphasized (highlighted etc) in an engaging way that calls attention to the key thing). Decide what the shot is going to be. Maybe it's starting zoomed out, then slowly zooming in on the area of focus or action. Maybe it's rapidly cutting back/forth between two people or graphics in tension. Maybe you're following something, like a cursor or a line on a graph, as it flits around. Be creative!
- Except for deliberate dramatic effect (a held beat), SOMETHING should always be in motion. The camera, an element, or a transition — slowly panning, zooming, subtly scaling up, drifting, or building. A truly static frame reads as a bug. Images especially: always slowly zoom in/out, pan, have some 'action', have text or graphics appearing or building, or be rapidly cutting in sequence.
- Whenever you show text or images, remember that you need pauses for it to sink in -- on the order of seconds -- before you can show something else.

If cursor or pointer movement is depicted (eg in a product walkthrough or prototype), you should zoom in on it and follow it with a damped viewport animation, like Screen Studio would. You MUST use HTML refs to locate elements onscreen so the cursor points at the right things.

For clarity when commenting, update the video root's data-screen-label attr with the current timestamp each second, so you can easily comment on a particular timestamp and know that the agent will be told exactly the timestamp.

To make content the user can export as a video (Share → Export → Video):

IF YOU ARE BUILDING ON AN ANIMATIONS STARTER (`animations_v3.jsx`, or `animations_v2.jsx` in an older project; the normal case): the stage component (`<CompositionStage>` / `<SceneStage>`) ALREADY SATISFIES THIS ENTIRE CONTRACT — it owns the exportable attribute, the seek listener, the svg/foreignObject wrapper, and font inlining (animations_v2 additionally provides a `<VideoSprite>` helper for looped <video> clips). Do NOT add `data-om-exportable-video-with-duration-secs` to any element yourself. Adding it to a wrapper ABOVE the stage creates two nested exportable roots, and the export and timeline transport bind to the wrong (outer) one — playback control and export silently break.

Only for a page built WITHOUT the starter, implement the contract yourself:

- Put `data-om-exportable-video-with-duration-secs="<N>"` on the ONE root element you want exported (N ≤ 300; longer is clamped). Exactly one element in the document may carry this attribute — never nest it.
- That element MUST listen for the custom event `data-om-seek-to-time-frame` (`detail: {time, frame}`): on receipt, pause playback and synchronously render that exact timestamp so every visible child is at that point.
- Nested `<video>` elements that should contribute audio must carry `data-om-exportable-video-play-start`, `data-om-exportable-video-play-end` (seconds into the source), and optionally `data-om-exportable-video-play-speed`; they loop within [start,end] at that speed and their audio is mixed into the export. Keep their visual frame in sync with the timeline yourself (set `video.currentTime` from the seek event / your clock).
- For best results, make the root an `<svg><foreignObject>` wrapper and inline your @font-face rules into it once — the exporter then serializes the svg directly per frame (fast, pixel-perfect). A plain div works too, just slower (full-page snapshot per frame).

A page carrying this contract also gets a live timeline under the preview — the host scrubs and plays it by dispatching the same seek event, so treat every seek as pause-and-hold (don't resume your own clock until seeks stop arriving).
