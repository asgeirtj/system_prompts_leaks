---
name: create-pet
description: "Create, repair, validate, preview, upload, or activate an animated v2 pet in ChatGPT Work mode from a character idea, brand cue, or reference image. Use for new ChatGPT Pets, custom mascots, non-pixel styles, and unattached sprite sheets requiring nine animation states plus sixteen look directions. Preserve Library artifacts and Pets MCP lifecycle behavior. Exclude real pets, standalone images, and other-app pets; clarify before invoking."
---

# Create Pet

Create a consistent, readable animated ChatGPT pet, show its motion, save the artifacts to Library, and create it only after the final sprite sheet passes validation. New and replacement artwork uses the supported v2 sheet: eleven rows with nine animation states and sixteen clockwise look directions. Existing v1 sheets remain valid for inspection and preview.

Keep every preview revision in this creation workflow until `create_pet` returns a stable pet ID. Do not load `update-pet` or call `update_pet` for a not-yet-created pet.

Read and follow [the shared sprite-sheet and preview contract](../../references/sprite-sheet-contract.md) before generating, validating, repairing, or previewing artwork. It defines the exact v1/v2 layouts, Library requirements, state semantics, look-direction rules, acceptance gates, and required previews.

## Preserve the request and prepare Library

Preserve the user's character idea, source images, requested name, description, style, and activation preference. Treat character art, generated images, existing sprite sheets, contact sheets, and built-in pet art as identity references rather than assuming they already have final cell geometry.

- Infer a missing name from an unambiguous concept, brand, or reference; otherwise choose a short friendly name or ask when the choice materially affects the result.
- Infer a concise description when one is not supplied.
- Reuse or create the top-level `Pets` Library folder and a folder for this pet. Save the request brief, source art, generated rows, frames, sprite sheets, validation output, contact sheets, motion previews, and other useful revisions there. Preserve Library identity when revising the same logical artifact.
- If the user requested only validation, repair, or previews, stop after satisfying that request. Do not upload or create a pet unless the user asked to create one.

Keep a visible four-step checklist and update it as work advances:

1. Getting `<Pet>` ready.
2. Imagining `<Pet>`'s main look.
3. Picturing `<Pet>`'s poses.
4. Hatching `<Pet>`.

Use the first step for inputs, style, Library organization, and any brand discovery; the second for the canonical base; the third for animation and look rows; and the fourth for final QA, previews, user feedback, upload, and verification. Mark a step complete only when its artifact or decision exists.

## Discover brand cues when needed

When the request provides only a company, product, or brand name, run a narrow discovery pass before image generation. Prefer two to four official product, documentation, about, press, or brand sources and use reputable secondary sources only when official information is too thin. Skip discovery when the user already supplies a concrete mascot description or useful reference art, unless brand research was explicitly requested.

Capture a compact Library-friendly brief covering:

- identity, audience, and use context;
- palette, shapes, line quality, materials, iconography, and typography feel;
- personality, energy, product motifs, and candidate mascot forms;
- avoidances, evidence, source links, and which mascot cues are inferred.

End with a short generation handoff containing `brand_name`, a one-sentence `brand_brief`, `avatar_seed`, `avoid`, and `brand_sources`. Use those cues as inspiration; do not copy logos, readable marks, slogans, or UI screenshots. If discovery is unavailable and the request is only a bare brand name, ask for a few visual cues before generating.

## Generate the visual jobs

Use `$imagegen` for every new or edited visual: the base pet, animation strips, cardinal anchors, coherent look rows, and visual repairs. Do not substitute a hand-drawn SVG, HTML/CSS, canvas, procedural raster, or fabricated placeholder. Deterministic processing may create layout guides, remove a chroma background, extract and fit generated pixels, mirror an approved directional row, assemble, encode, validate, and render previews; it must not invent or redraw the pet.

Expect up to thirteen visual jobs for a new v2 pet:

1. one canonical base pet;
2. nine standard animation strips: `idle`, `running-right`, `running-left`, `waving`, `jumping`, `failed`, `waiting`, `running`, and `review`;
3. one four-pose cardinal strip;
4. two coherent eight-pose look-direction strips.

Generate the base first. It is the only job that may be prompt-only. Attach the canonical base and every identity-defining reference to every later image-generation job; include a matching invisible layout guide when available. Keep prompts concise, state-specific, and sprite-production oriented. Reject outputs that copy guide marks, text, or labels.

When independent jobs are ready and subagents are available, use one lightweight visual worker per job and keep up to three generation workers active. Have each worker perform a quick frame-count, identity, background, spacing, clipping, and detached-effect check and return only the selected artifact plus a short QA note. Keep deterministic assembly, Library organization, and final acceptance with the parent workflow.

## Execute the bundled pipeline

The `scripts/` directory and [animation-row reference](references/animation-rows.md) are part of this skill. **Run the bundled scripts; never replace them with an invented compositor, a shape-only validator, or a success report written by the model.** Resolve `SKILL_DIR` to the directory containing this skill and `RUN_DIR` to the current creation run. Use a Python environment with Pillow; if the scripts or Pillow are unavailable, stop before creating or changing a pet.

Prepare the manifest, visual prompts, invisible layout guides, and an automatically selected contrasting chroma key:

```bash
python3 "$SKILL_DIR/scripts/prepare_pet_run.py" \
  --pet-name "<pet name>" \
  --description "<pet description>" \
  --pet-notes "<character and visual constraints>" \
  --style-preset "<auto|pixel|plush|clay|sticker|flat-vector|3d-toy|painterly|brand-inspired>" \
  --output-dir "$RUN_DIR"
```

Read `pet_request.json` and `imagegen-jobs.json`. Use each job's generated prompt and attach every listed reference image, including its layout guide. Only generate a job after every `depends_on` job has passed its required checks. Copy each selected generated image to the exact manifest output before marking the job complete. A text-only concept defaults to a magenta chroma key; never use a green background for a green character.

Immediately after each standard row is generated, extract its complete connected pose groups with shared scale and registration, then inspect that row before continuing:

```bash
python3 "$SKILL_DIR/scripts/extract_strip_frames.py" \
  --decoded-dir "$RUN_DIR/decoded" \
  --output-dir "$RUN_DIR/qa/rows/<state>/frames" \
  --states "<state>" --method auto
python3 "$SKILL_DIR/scripts/inspect_frames.py" \
  --frames-root "$RUN_DIR/qa/rows/<state>/frames" \
  --json-out "$RUN_DIR/qa/rows/<state>/review.json" \
  --states "<state>" --require-components
```

Never slice generated strips into assumed equal slots or individually resize each pose to fill its cell. Preserve the source's vertical displacement for `jumping`; at least one jump frame must actually leave the idle baseline. Once all standard rows pass, use `extract_strip_frames.py`, `inspect_frames.py`, `compose_atlas.py`, `make_contact_sheet.py`, and `render_animation_previews.py` to assemble and visually inspect the intermediate nine-row atlas.

Extract cardinal poses with `extract_cardinal_anchors.py`, inspect and approve all four, and build their approved reference using `compose_cardinal_anchor_strip.py`. Generate look row 9 next; immediately register it using `assemble_extended_atlas.py --look-row-9 ... --registered-row-output ... --registration-manifest-output ...`. Inspect its cardinal meaning and continuity before generating row 10. Generate row 10 only after row 9 passes, then assemble the complete sheet using `--registered-row-9`, `--row-9-registration`, and `--look-row-10` so both rows share one transform.

Run these final gates in order:

1. Run `despill_chroma_edges.py` exactly once with the selected chroma key and save its report.
2. Run `validate_atlas.py --require-v2 --chroma-key <selected key>` against the exact PNG or WebP that will be uploaded; its JSON report must contain `ok: true`.
3. Render the final contact sheet with `make_contact_sheet.py`, the labeled look sheet with `make_direction_qa_sheet.py`, and direction continuity with `measure_direction_continuity.py`.
4. Inspect the rendered contact sheet and look sheet at normal pet size. Record all sixteen semantic verdicts in `qa/direction-semantics.json`, including `expected`, `observed`, `verdict`, and concrete landmark evidence. Wrong or ambiguous cardinals, whole-character turntables, disappeared faces, and reversed directions are failures.
5. Run `validate_pet_quality.py` with the exact atlas, atlas-validation report, despill report, standard-row review, direction-semantics report, and continuity report. It must report `ok: true`; it rejects stationary jumping, look-registration drift, extreme scale changes, direction holes, missing semantic evidence, and failed cardinal verdicts.
6. If isolated reviewers are available, also run `make_direction_blind_qa_sheet.py`, `combine_direction_blind_verdicts.py`, and `validate_direction_blind_verdicts.py`; cardinal disagreement blocks upload.

The final command is:

```bash
python3 "$SKILL_DIR/scripts/validate_pet_quality.py" "$RUN_DIR/final/spritesheet-extended.png" \
  --atlas-validation "$RUN_DIR/final/validation-extended.json" \
  --chroma-report "$RUN_DIR/qa/chroma-despill-extended.json" \
  --frame-review "$RUN_DIR/qa/review.json" \
  --direction-semantics "$RUN_DIR/qa/direction-semantics.json" \
  --continuity "$RUN_DIR/qa/look-continuity.json" \
  --json-out "$RUN_DIR/qa/pet-quality.json"
```

Save every required QA report and preview to Library. Do not upload when any mandatory bundled script fails, a required report is missing, the visually inspected sheet is broken, or the byte length changes after validation.

### Standard animation rows

Generate and inspect `idle` and `running-right` early as identity and gait checks. Generate every other state as its own grounded strip; do not reuse `waiting`, `running`, `failed`, `review`, `jumping`, or `waving` from another state.

Generate `running-right` before deciding how to produce `running-left`. Mirror the approved rightward frames only when markings, lighting, handed props, and identity remain correct. Mirror each frame in place so temporal order is preserved; never mirror the whole strip in a way that reverses the animation. If mirroring changes meaning or identity, generate `running-left` normally.

After each strip, verify the required frame count, separated complete poses, consistent identity and scale, stable baseline, correct state semantics, removable background, and absence of forbidden effects. Repair a failing source row immediately rather than deferring a known issue to final assembly. When extraction alone causes size or baseline popping and the generated strip itself is stable, correct the extraction with shared scale and stable slots before regenerating imagery.

Assemble and visually review rows `0-8` before generating look directions. Block progress for missing or clipped frames, identity or style drift, prop handedness changes, wrong facing direction, non-alternating gait, literal foot-running in the active-work row, inert idle motion, or visible playback pops.

### Sixteen look directions

After the standard rows pass, decide how this specific pet naturally looks around: what stays anchored, what leads the gaze, what follows, how eyes, face, head, body, appendages, and props move, and what becomes occluded. Preserve the pet's physical construction and original eye design. Avoid whole-sprite rotation, broad warps, replacement eyes, and pupil-only motion unless the design makes them physically appropriate.

Generate and approve one four-pose cardinal strip in viewer coordinates and this fixed order:

```text
000 up, 090 screen-right, 180 down, 270 screen-left
```

Cardinals must be unmistakable at normal pet size. For a face, use concrete landmarks such as pupils and nose tip relative to the head center; for an eyeless pet, use its natural aiming feature. Repair an ambiguous cardinal before continuing.

Use the approved cardinals and standard contact sheet to generate row 9 as one coherent eight-pose family. Validate its registration, edges, semantics, and adjacent continuity before generating row 10. Generate row 10 as one coherent family using the cardinals and completed row 9 for identity, scale, baseline, and boundary continuity. Keep this fixed clockwise order:

```text
row 9:  000, 022.5, 045, 067.5, 090, 112.5, 135, 157.5
row 10: 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5
```

`000` means looking up, not neutral. Interpolate intermediate poses as even steps between cardinal families and inspect the complete loop, including `157.5 -> 180` and `337.5 -> 000`. If a final direction fails, strengthen the containing row and regenerate the complete coherent eight-pose row; do not splice a newly generated one-off cell into an otherwise approved row. Never ask `$imagegen` to generate or repair a complete atlas.

## Assemble, review, and converge

Assemble the generated pixels deterministically into the v2 sheet, apply one final chroma-cleanup pass when needed, and validate the exact encoded PNG or WebP bytes. Follow the shared contract for structural validation, state-by-state motion review, labeled direction QA, blind cardinal checks, continuity review, contact sheets, GIFs, MP4, and the idle-to-jump-to-idle transition. Save those artifacts and the final validation report to Library.

Call `validate_pet_spritesheet` with `file` set to the final encoded sprite-sheet artifact. Repair every structured row or frame error, rebuild the complete sheet, and rerun the deterministic Pets MCP preflight until it returns `valid: true` for the exact final bytes. Repeat validation after any visual repair or user-feedback revision.

Show the resulting motion before upload. Incorporate user feedback into the affected source row or rows, rebuild the sheet and every affected preview, and validate the final encoded bytes again. A static image alone is not evidence of motion quality.

After a failure, identify whether it is visual semantics, identity, source geometry, connectivity, extraction, chroma, registration, or continuity. Preserve everything that passed and repair the smallest failing row. Use a deterministic correction for deterministic failures; regenerate only when the source visual is genuinely wrong. If the same root failure recurs twice, change strategy by simplifying the pose or prop, strengthening the anchors or row instructions, or changing extraction instead of varying the same prompt repeatedly. Never waive a structural error, wrong or ambiguous cardinal, wrong-quadrant pose, visible reversal, clipping, broken attachment, or identity change.

Aim for a bounded run: roughly two minutes for preparation, three for the base, ten for standard rows, eight for look directions, and five for final QA and previews, with a small buffer. Use the budget to prioritize validated progress, not to skip required gates. If generation is unavailable or fails, stop before upload or mutation and report the blocker.

## Create and verify the pet

Only after the user has seen the motion and the exact final bytes pass validation, read and follow [the shared upload-session contract](../../references/upload-session.md).

1. Call `prepare_pet_upload` for the exact validated bytes and verify the returned nested `upload` metadata. Follow its one supported transfer path and use the short-lived session exactly once.
2. Call `create_pet` with `upload_session_id` set to `upload.upload_session_id`, the chosen name, and the intended concise description.
3. Treat the returned `pet.id` as the durable identity. Confirm that the returned name, description, `is_custom`, and ID match the request.
4. Call `select_pet` only when the user wants the new pet active. Verify that its returned `active_pet_id` equals the new stable pet ID.
5. Page through `list_pets` until the new stable ID appears, then confirm the requested metadata and active state. If the ID never appears after complete pagination, report the verification failure rather than creating a duplicate.
6. Call `get_pet_download_link` only when the user or a follow-up workflow needs the stored sprite sheet. Do not persist its potentially expiring URL.

Keep Library artifacts as the durable record of the creative workflow and the stable pet ID as the durable record of the created pet. Never treat an upload session or sprite-sheet URL as pet identity.
