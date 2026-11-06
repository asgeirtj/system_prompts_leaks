---
description: 3D scenes, model viewers, and 3D games in three.js or WebGL: loading three.js so the audit can render it, modeling, lighting, game controls, and checking the render.
builders: web
---

# 3D web pages and browser games

Read this whole file before you write code for a 3D page, scene, model viewer, or 3D browser game. On an edit, use it for the parts you touch, and when the page loads three.js from a CDN, download that same version into `~/workspace/ts-spaces/<slug>/assets/` and point the tag at the copy, so the audit can render your change.

## Loading three.js

On a static build, copy the bundled classic build with `exec`, as `mkdir -p ~/workspace/ts-spaces/<slug>/assets && cp /opt/hatch-image/three/three.min.js ~/workspace/ts-spaces/<slug>/assets/`, and load it with `<script src="assets/three.min.js"></script>` before the page's own script. It defines the global `THREE`. three.js 0.161.0 and later ship only as ES modules, so do not fetch a newer copy. These addons hang off the same global, as in `new THREE.OrbitControls(camera, renderer.domElement)`: `OrbitControls`, `MapControls`, `GLTFLoader`, `RoomEnvironment`, `EffectComposer`, `RenderPass`, `ShaderPass`, `UnrealBloomPass`, `OutputPass`, `RoundedBoxGeometry`, `Sky`, `CSS2DRenderer`, `CSS2DObject`, `ImprovedNoise`, `SimplexNoise`, `BufferGeometryUtils`, and `SkeletonUtils`. Write anything else yourself.

Do not load three.js from a CDN, even though the published page could: the audit browser cannot reach one, so it would judge a blank canvas. A CDN three.js failure under `assessment.expected_lockdown_effects` means the audit saw no scene.

On a server-backed build, run `bun add three` and `bun add -d @types/three` in `~/workspace/ts-spaces/<slug>/` (strict `tsc` refuses an untyped import), and import from `"three"` and `"three/addons/..."` under `client/src/`.

Keep `new Worker()` and dynamic `import()` out of either build: private rendering throws on both.

## Plan before the first write

Write down, in concrete terms with shape words, sizes, and hex colors:

1. Test list: each behavior, control, and mode the request names, with the on-screen input that reaches it and the visible result that shows it works.
2. Look: grounded, cinematic stylization with a few related hues and one accent, unless the request is for young children or asks for a cartoon look. Cinematic does not mean dark: the hero, threats, and controls stay easy to see.
3. Forms: for each part a viewer looks at first, its silhouette, real proportions, and defining parts, each built the way the real part is: `LatheGeometry` from a traced profile for turned parts, an extruded `Shape` for thick outlines, `TubeGeometry` for pipes and limbs, rings lofted along a spine for hulls and bodies, `InstancedMesh` for repeats. Bevel visible hard edges, and cut openings such as windows into one closed shell instead of stacking dark slabs on a solid. Use a plain primitive only where the real part is one.
4. World: a ground fading into the backdrop, props near the camera, variants behind, far silhouettes in haze, and one moving element, so no floor edge or void shows from any allowed view.
5. Materials: each role with a hex color and a starting roughness and metalness, such as steel 0.25 and 1, paint 0.4 and 0, skin 0.6 and 0, wood or stone 0.8 and 0. Glass is a `MeshPhysicalMaterial` with transmission. Glossy and metal roles need an environment map from `PMREMGenerator` with `RoomEnvironment`, or they render gray. Keep emissive for lamps and screens, and draw seams, grain, and labels with a `CanvasTexture`.

## Build

Build forms first, then materials, then light (a key, a fill, and a rim with contact shadows, tone mapping with sRGB output), then effects. Bloom, fog, and glow finish a scene; they do not stand in for missing form or cover an empty world. Tune exposure on active play, not the title view.

Frame the hero and what it acts on at a depth-showing angle, filling most of the frame, and set distance or field of view from the aspect so the scene fills the first screen on a phone and on desktop. Start the frame loop at once with idle motion, so the scene is live the moment the page opens, and show `window.onerror` and `unhandledrejection` in a readable overlay instead of a black canvas. No full-screen flashes or strobing faster than about three times a second; honor `prefers-reduced-motion` with a calmer camera and no shake.

Watch these WebGL traps:

- `PointsMaterial` without a `map` draws hard squares; give it a soft round sprite.
- Transparent parts draw in the wrong order; set `depthWrite: false`, and use `renderOrder` for layered glass and `alphaTest` for cut-outs.
- Faceted hero curves need more segments, smooth normals, and a small bevel.
- Set the camera's `near` and `far` from the scene bounds so nothing is cut off.
- This three.js removed `PCFSoftShadowMap`; use `THREE.PCFShadowMap`.

The audit renders WebGL in software, so slow frames and the `Automatic fallback to software WebGL has been deprecated` warning are not defects. Do not lower quality for a frame rate measured there.

## Games

A detailed design document is the design: build it faithfully and add no mechanics. A short request is a floor: expand it into a complete design with one clear hook. Put a real decision in the first 30 seconds, make the objective clear without reading, let failures explain themselves, and raise difficulty by combining what the player already knows.

Most players are on a phone. Give every control an on-screen touch form, with keys and mouse as a desktop extra; keys reach the page only after a tap inside it. Open on the live scene and let the first tap, click, or key anywhere start play, a start card included; once play starts, nothing covers the playfield. A start card is compact enough to fit a 390x844 phone with the playfield in view. Keep the HUD in thin edge bands and the controls along the bottom within thumb reach, make game text non-selectable, and let the canvas take touch without scrolling the page.

Build a game interface, not a web page: meters, icons, and reticles over text, fixed-width numerals, and a HUD on thin rules or dark translucent plates, not stat cards, cream or white rounded cards, pill buttons, emoji icons, or bubbly display fonts, unless the look calls for them.

- Run a fixed-step loop with a clamped delta, wrap each frame in try/catch, and schedule the next frame in `finally`.
- Map pointer events to CSS pixels, and load fonts with `document.fonts.load()` before the first draw.
- Synthesize sounds with Web Audio, and create or resume the `AudioContext` on the first tap, or iOS stays silent.
- Teach the core loop through a first success, not text.
- Give the game a title screen and an end screen; play-again resets the score, timers, entities, and camera.
- The main action answers within about 100 ms, with its sound on the same frame.
- Give each contact feedback scaled to its weight, such as a flash or squash, a brief freeze on a heavy hit, or camera shake, and fire effects from events such as a pickup, hit, or fail, none of it hiding the next decision.
- A high score that must survive a reload is saved data: on a static build follow Static page limits, not `localStorage`; on a server-backed build store it with `ctx.db`.

## Check the render

The person will not come back to ask for fixes, so start play once through the probe at desktop and at phone size, with an on-screen start control or `key`, and read both frames: a blank canvas or a visible error overlay is a defect to fix, and the start card should be gone. The probe acts only on controls it observes, so it cannot tap a bare canvas, hold a key, or drag. Drive each test-list behavior through its on-screen control, use `key` for single presses, and name what no probe input reaches, such as a canvas tap, held-key motion, drag-to-look, and audio, as unverified in `verification_notes`. Check that the look-right control turns the view right, the move-right control moves the player right, and the horizon stays level.

Ask of the desktop and the phone shot, and fix what fails:

- What would a stranger call this in two seconds? Which defining part is missing, out of proportion, or a stand-in shape?
- After light and fog, does each material read as itself, with no white-out, black void, or blown highlight?
- Is the hero framed at a depth-showing angle, filling most of the frame on the wide and the tall shot?
- On the phone, is the scene on most of the screen, with the HUD in edge bands and the controls reachable?
- Does anything float, poke through, flicker, show a hollow side, or show helper geometry such as axes or grids?
- Unless the request is for young children, would a stranger take this for a children's app, or the HUD for a dashboard of cards?

Play the loop end to end through the page's controls: a pickup raises the score, an end state shows the result, and play-again resets everything. A defect that survives a round of fixes needs a different approach, such as rebuilding the part or changing the light rig, not tuning numbers.
