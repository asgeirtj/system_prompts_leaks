# Pet sprite-sheet and preview contract

Apply this contract whenever creating, replacing, repairing, validating, or previewing ChatGPT pet artwork. Create new and replacement artwork as v2. Accept an existing v1 sheet for validation and preview; preserve its approved standard rows when upgrading or repairing it.

## Contents

- Save artifacts to Library
- Supported sprite-sheet layouts
- Generate grounded, pet-safe artwork
- State and effect semantics
- Assemble and validate incrementally
- Required v2 look-direction stage
- Direction acceptance and blind review
- Show motion before upload
- Repair and acceptance checklist

## Save artifacts to Library

- Use ChatGPT Library throughout every pet-artwork workflow. Reuse or create the top-level `Pets` folder and a folder for this pet inside it.
- Save every useful pet artifact generated during the workflow, including the request or brand brief, source art, row strips, frames, sprite sheets, validation output, contact sheets, GIFs, MP4s, direction QA, and other previews or working revisions.
- Preserve Library identity when updating the same logical artifact. Add subfolders or revisions when requested or when they make artifacts easier to navigate.
- Keep preview iteration outside the persisted pet record. Do not transfer a sheet through the Pets upload session or mutate an existing pet until final motion has been shown and the exact encoded bytes pass validation.

## Supported sprite-sheet layouts

Produce one transparent PNG or WebP no larger than 20 MiB. Cells are always `192x208` pixels in eight columns, with required frames placed from the leftmost cell of each zero-indexed row.

The supported layouts are:

- v1: `1536x1872`, eight columns by nine rows, with 57 required frames and 15 transparent unused cells;
- v2: `1536x2288`, eight columns by eleven rows, with 73 required frames and 15 transparent unused cells.

Use v2 for new and replacement artwork. An existing v1 sheet may be inspected, previewed, or used as the approved rows `0-8` input to a v2 upgrade. Do not discard approved standard rows merely to add look directions.

| Row | State | Frames | Required semantics |
| --- | --- | ---: | --- |
| 0 | idle | 6 | calm, visibly alive loop |
| 1 | running-right | 8 | directional movement facing screen-right |
| 2 | running-left | 8 | directional movement facing screen-left |
| 3 | waving | 4 | greeting through an attached limb or appendage |
| 4 | jumping | 5 | natural upward motion and return to baseline |
| 5 | failed | 8 | readable failure reaction |
| 6 | waiting | 6 | expectant request for approval, help, or input |
| 7 | running | 6 | active work, processing, thinking, or focused effort; not literal running |
| 8 | review | 6 | inspecting or checking completed work |
| 9 | look directions, first half | 8 | `000` through `157.5` clockwise |
| 10 | look directions, second half | 8 | `180` through `337.5` clockwise |

Rows 9-10 exist only in v2. Leave every unused cell fully transparent. Do not add extra rows, placeholder frames, labels, or a separate neutral cell; the normal idle frame supplies the neutral or resting reference.

## Generate grounded, pet-safe artwork

Use `$imagegen` for every new or edited pet visual, including base art, animation strips, cardinal anchors, look strips, and visual repairs. When a reference pet is supplied, preserve its identity, proportions, scale, lighting, palette, outline treatment, material, markings, props, and alpha treatment.

Unless the user requests a manual technique, do not substitute SVG, HTML/CSS, canvas, procedural raster code, or another manually constructed visual. Deterministic tools may create layout guides, remove backgrounds, tightly crop and fit generated pixels, mirror an approved directional row, assemble the atlas, encode files, validate the result, and render previews. They must not invent or redraw the pet. If image generation is unavailable or fails, stop before upload or mutation rather than fabricating a placeholder or proceeding with partial frames.

For creation and repair, the authoritative deterministic tools are the scripts bundled with the creation skill. Run `prepare_pet_run.py` to choose a contrasting chroma key and build the grounded image-generation job graph; use its extraction, inspection, composition, look-registration, despill, atlas-validation, continuity, direction-QA, and final quality-gate scripts. Do not replace them with generated helper code or a validator that checks only size, occupied cells, and transparent padding. Do not claim a gate passed without its actual successful script output and saved report.

Generate the canonical base first. It is the only visual job that may be prompt-only. Ground every animation or look row in that base and all identity-defining references. Use an invisible layout guide for the correct frame count, separation, centering, and safe padding when available. Reject visible boxes, guide colors, borders, center marks, labels, frame numbers, or copied guide pixels.

Accept any requested style that remains readable and consistent at pet size, including pixel, plush, clay, sticker, flat-vector, 3D-toy, painterly, ink, or brand-inspired styles. Infer style from the concept and references when unspecified. Require:

- one compact whole-body silhouette readable within a `192x208` cell;
- consistent face, proportions, material, palette, markings, outline, and props across every row;
- details large enough to read at normal size;
- a clean removable chroma-key background or clean transparency;
- no text, labels, UI, or readable logos unless explicitly supplied and requested.

Do not ask `$imagegen` to generate the complete atlas. Generate coherent state strips and assemble exact geometry deterministically.

## State and effect semantics

Every generated pixel must either belong to the sprite or be cleanly removable background. Prefer pose, expression, and silhouette changes over decorative effects. Keep the complete pet and any attached prop inside its frame slot, with no neighboring-frame bleed, detached fragments, accidental transparent interior holes, seam bands, scanline gaps, or clipped body parts.

Avoid wave marks, motion arcs, speed lines, action streaks, afterimages, blur, smears, detached stars or sparkles, floating punctuation or icons, separated smoke or tear drops, dust, shadows, landing marks, impact bursts, glow, halo, scenery, UI, speech bubbles, or other loose effects. An effect is acceptable only when it explains the state, is physically attached to or overlapping the pet, remains in the same frame slot, is opaque and cleanly extractable, and stays readable at pet size.

Apply these state-specific rules:

- `idle`: show subtle breathing, blink, bob, or material sway with visible micro-variation. Keep it calm; do not wave, walk, run, jump, talk, work, review, react strongly, or introduce props.
- `running-right` and `running-left`: show directional drag movement through body, limbs, and props. Face and travel toward the named screen direction, use visibly alternating cadence, and avoid speed lines, dust, shadows, or trails.
- `waving`: communicate the wave through paw, hand, wing, or appendage pose only. Do not draw wave marks, arcs, lines, or floating effects.
- `jumping`: communicate vertical movement through body position. Preserve apparent body size, depart naturally from idle, and land on the same baseline without a shadow, dust, landing mark, or impact burst.
- `failed`: use a readable failure reaction. Attached opaque tears, smoke puffs, or stars are acceptable when they remain part of the sprite; do not add a red X, floating symbol, detached smoke, star, or droplet.
- `waiting`: show an expectant asking pose that clearly means approval, help, or input is needed. Keep it distinct from idle and review.
- `running`: show active task work, processing, thinking, scanning, typing, or focused effort. Do not depict foot-running, jogging, sprinting, raised knees, long steps, directional travel, or motion effects.
- `review`: communicate inspection through lean, eyes, blink, head tilt, or attached limb position. Do not introduce magnifying glasses, papers, code, UI, punctuation, or new props that are not already part of the pet identity.

Generate every state independently except an explicitly approved `running-left` derivation. Generate and inspect `running-right` first. Mirror its individual frames in place only when markings, lighting, handed props, and identity remain correct; never mirror the entire strip if that reverses frame order. Generate `running-left` normally when mirroring changes meaning or identity.

## Assemble and validate incrementally

Validate each generated standard strip before accepting it. Confirm frame count, separated and unclipped poses, consistent identity, removable background, stable scale and baseline, correct state semantics, connectivity, and absence of forbidden effects. Repair a known source-row problem immediately instead of deferring it to the completed sheet.

After background removal, compute tight visible-pixel bounds across all approved frames. Remove unused source margins and fit the largest pose as large as practical within the cell without clipping. Keep one shared scale, body registration, and ground baseline; do not resize each frame independently to its own bounds or stretch the design to fill a cell. If the source strip is stable but extraction produces size popping or baseline jumps, correct extraction with stable slots and a shared transform before regenerating imagery.

Preserve intentional airborne motion: the jumping row must contain a visible lift above the resting foot/base baseline and return to that baseline. Shared registration must not pin every jump frame to the ground or convert a jump into character resizing.

Assemble rows `0-8` in the required order and inspect a contact sheet plus looping state previews before generating v2 look rows. Block progress for:

- missing or blank frames, opaque backgrounds, clipping, neighboring-cell bleed, or detached fragments;
- identity, style, palette, face, marking, material, prop, outline, or silhouette drift;
- wrong facing direction, reversed or non-alternating gait, effectively static idle, or incorrect state semantics;
- unintended size, baseline, or registration pops during playback.

For final assembly, recover each approved pose group without fixed-slot slicing when source spacing varies, preserve its order, and apply a shared scale and baseline. Remove the selected chroma background and perform one edge-local spill-suppression pass after all rows are assembled. Preserve alpha, clear hidden RGB under fully transparent pixels, and treat the final structural and chroma validation as authoritative; do not repeatedly regenerate good imagery for a fringe that deterministic cleanup resolves.

Validate the exact encoded bytes that will be transferred:

1. Confirm MIME type and extension agree, encoded size is between one byte and 20 MiB, and the image is transparent PNG or WebP.
2. Confirm dimensions and grid match a supported schema: `1536x1872` for v1 or `1536x2288` for v2, with `192x208` cells.
3. Confirm every required cell is non-empty (57 for v1, 73 for v2), all 15 unused cells are fully transparent, no chroma panel or opaque background remains, and no non-transparent pixels bleed between cells.
4. Confirm consistent overall character scale, baseline, identity, and alpha treatment. Inspect suspect alpha holes or seam bands against a high-contrast background; a structurally valid atlas can still contain a visibly broken silhouette.
5. Preview idle-to-jump-to-idle from the encoded sheet at native cell bounds and confirm coherent size, ground contact, alignment, landing, and neighboring-row isolation.
6. Run the bundled final quality gate against the actual encoded atlas and the saved atlas, chroma, standard-row, continuity, and sixteen-direction semantic reports. Reject missing reports, failed cardinals, stationary jumps, registration drift, excessive look-frame size changes, and accidental transparent look-frame holes.

Call `validate_pet_spritesheet` with `file` set to the exact final encoded sprite-sheet artifact. The host supplies its authenticated file reference to the Pets MCP tool, which runs the same deterministic structural validator as pet creation and returns `valid`, image dimensions, sprite version, required frame counts, and structured errors with zero-indexed `row` and `frame` when applicable.

If validation finds a deterministic failure, correct the deterministic stage first. If source artwork is wrong, repair the smallest affected source row, rebuild the complete sheet, and call `validate_pet_spritesheet` again. Continue until it returns `valid: true` for the exact final bytes, and rerun the preflight after any visual repair or user-feedback revision. Do not upload before it passes, patch only a preview artifact, or paste a final normalized cell over a failed source row.

## Required v2 look-direction stage

For every new or replacement v2 pet, generate sixteen look poses as two coherent eight-frame rows after rows `0-8` pass. Use the canonical base, approved standard contact sheet, and all images that define head shape, face, eye construction, markings, material, hair, ears, flame, appendages, props, or other look mechanics.

Before generation, decide how the character naturally looks around. State what remains anchored, what leads, what follows, and how eyes, face, head, neck, upper body, appendages, and props bend, shift, turn, squash, stretch, or occlude. Use the character's physical construction:

- rotate physical eyeballs as whole eye surfaces with consistent sclera, iris, pupil, eyelids, rims, and highlights; do not slide a replacement pupil or paint googly eyes over the original design;
- move drawn features on a fixed screen, printed, or sticker face only when that surface would physically stay fixed;
- let separate heads turn with subtle upper-body, ear, fur, or antenna follow-through while keeping the torso or base anchored;
- let flexible, paperclip-like, soft, or blob bodies bend or deform around an anchored base;
- let rigid or eyeless objects lean, hinge, yaw, pitch, flex, vibrate, or move an attached aiming feature while preserving their primary readable face;
- keep held, worn, or attached props physically connected and let them follow, lag, or occlude naturally.

Avoid whole-sprite rotation, whole-cell rotation, skewing, broad raster warps, facial-proportion changes, replacement eyes, detached pupils, and pupil-only motion that makes the direction unreadable. Whole-object rotation is appropriate only when the pet is genuinely a rotating object and that motion preserves its identity.

### Cardinal anchors and fixed order

Generate and approve one four-pose cardinal strip before either look row. Use viewer or screen coordinates, never character-relative coordinates:

```text
000 up, 090 screen-right, 180 down, 270 screen-left
```

Each cardinal must be unmistakable at normal pet size. For faces, check landmarks such as pupils, nose tip, face surface, eyelids, and head turn relative to the head center. For eyeless pets, check the natural aiming feature. If a cardinal is ambiguous or points the wrong way, repair that anchor before generating the sweep.

Generate row 9 as one coherent family from the approved cardinal pose families, with even intermediate steps. Register its eight ordered poses using the same scale, baseline, and anchor intended for final assembly, then inspect final-cell edges, semantics, and adjacent continuity immediately. Only after row 9 passes, generate row 10 using the cardinals and completed row 9 for identity, scale, registration, and boundary continuity.

Keep this exact clockwise order:

```text
row 9:  000, 022.5, 045, 067.5, 090, 112.5, 135, 157.5
row 10: 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5
```

`000` is up or twelve o'clock, not neutral. Compare every neighboring pair, including `157.5 -> 180` and `337.5 -> 000`. Anchored parts must not jump, flip sides, or teleport. Preserve practical scale and body registration relative to idle; look cells must not shrink, float above the baseline, or slide laterally while only changing gaze.

Draw each look row as a coherent pose family, not eight unrelated variants. Do not mirror, independently restyle, or independently recenter adjacent final cells. If one final look direction fails, strengthen the containing row's instructions and regenerate the complete coherent row. A one-off anchor repair is valid before the sweep; a newly generated one-off final cell is not valid beside cells from another generation.

## Direction acceptance and blind review

Inspect the completed sixteen-pose loop at normal pet size. Produce a focused labeled sheet showing the neutral or resting frame beside all sixteen look cells and record `pass`, `warning`, or `fail` for each expected direction. Include separate horizontal and vertical evidence for diagonals.

Require these semantics:

```text
000 up                 180 down
022.5 up-right         202.5 down-left
045 up-right           225 down-left
067.5 up-right         247.5 down-left
090 right              270 left
112.5 down-right       292.5 up-left
135 down-right         315 up-left
157.5 down-right       337.5 up-left
```

Treat these as hard failures requiring repair:

- a wrong or ambiguous cardinal;
- a labeled pose in the wrong principal quadrant, a missing required axis that changes its meaning, or an ordered-loop reversal or backtrack;
- a conspicuous snap, scale pop, registration jump, identity change, broken attachment, clipping, accidental transparent interior hole, seam band, or materially broken sprite;
- whole-sprite rotation, deformation, or eye mechanics that visibly break identity or direction meaning.

Treat an intermediate pose that is subtle or similar to a neighbor, minor landmark-placement deviation, or a continuity metric without a visible defect as a review warning. Accept such a warning only when labeled normal-size review confirms the intended direction and the ordered loop stays coherent; never use a warning to waive a wrong cardinal, wrong quadrant, or visible reversal.

When independent visual workers are available, run a blind axis check using an unlabeled, randomized A/B sheet. Keep the degree labels, prompts, expected answers, and other reviewers' verdicts hidden. Have three isolated reviewers classify each requested horizontal axis as `screen-left`, `screen-right`, or `ambiguous`, and each vertical axis as `up`, `down`, or `ambiguous`; combine by strict majority. Cardinal ambiguity or mismatch blocks acceptance. Intermediate disagreement is evidence for labeled loop review, not an automatic regeneration trigger.

Keep labeled semantics, blind-review output, continuity observations, contact sheets, and the final validation report with the Library artifacts. Require an independent final visual review or explicit user inspection after repairing a look row.

## Show motion before upload

Render previews from the final encoded sheet, not from an unrelated source image:

- a labeled contact sheet for all populated rows;
- a looping GIF for each of the nine standard states;
- one all-state GIF and an MP4 copy;
- a dedicated idle-to-jump-to-idle loop at native cell bounds;
- a labeled neutral-plus-sixteen-directions sheet and an ordered look-loop preview for v2;
- at least four labeled or timestamped still frames so clients that cannot play animation still show concrete visual proof.

Show the contact sheet and stills with the available visualization tool. Show an inline GIF when supported; otherwise show an animated frame player or a clearly ordered frame strip. Provide GIF and MP4 artifacts in addition to the inline or still-frame demonstration. Do not claim motion quality from a single still.

Incorporate user feedback into the affected source rows, regenerate every affected preview, rebuild the complete sheet, and validate the final encoded bytes again. Save the resulting previews and validation artifacts to Library before upload.

## Repair and acceptance checklist

After every failed attempt, classify the root issue as visual semantics, identity, source-edge geometry, connectivity, extraction, chroma, registration, or continuity. Preserve everything that passed. Prefer a deterministic correction for deterministic failures and regenerate imagery only when the source visual is wrong. If the same root failure recurs twice, change strategy by strengthening pose instructions or anchors, simplifying a prop or silhouette, or changing extraction instead of repeatedly varying the prompt.

Accept a new or replacement pet only when all of the following hold:

- the final transparent PNG or WebP is at most 20 MiB, exactly `1536x2288`, and uses the v2 `8x11` grid with `192x208` cells;
- all required cells are non-empty, all unused cells are fully transparent, and no background, chroma panel, clipping, bleed, detached fragment, seam band, or accidental alpha hole remains;
- rows `0-8` use the required frame counts and state semantics, preserve the same identity and style, and play without unintended size or baseline popping, wrong direction, reversed cadence, or inert idle;
- four cardinal anchors are semantically approved, both coherent look rows preserve fixed clockwise order, and the sixteen-pose loop has no wrong cardinal, wrong quadrant, reversal, registration jump, identity drift, or broken attachment;
- labeled direction review, continuity review, contact sheet, per-state previews, all-state preview, MP4, and idle-to-jump-to-idle preview have been produced and inspected;
- the exact final encoded bytes pass validation and the user has seen the resulting motion;
- source, QA, preview, and final artifacts are saved to the pet's Library folder.

For validation or preview of an existing v1 pet, apply the same structural, identity, state, motion, and Library gates to its nine rows without requiring look-direction artifacts. If the user asks to upgrade that pet, preserve approved rows `0-8`, generate and validate the two v2 look rows, then rebuild and validate the complete v2 sheet.
