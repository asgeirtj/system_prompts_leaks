---
name: google-slides
description: Route Google Slides authoring requests and derive a design system from a native template or reference deck. Use this skill when the user provides an existing native Google Slides deck as a template, reference, or prior-period source, or asks to edit, update, repair, restyle, or clean up an existing native Google Slides deck. Use the Presentations skill instead for net-new presentation creation when no existing native Google Slides deck must be followed.
---

# Google Slides

## Route the Request

- Use `[@presentations](plugin://presentations@openai-primary-runtime)` to create a net-new presentation when no existing native Google Slides deck is the template or reference.
- Use this skill to create a presentation by following an existing native Google Slides template, reference deck, or prior-period deck.
- Use this skill to edit, update, repair, restyle, or clean up an existing native Google Slides deck.
- If a request combines new content with an existing native Google Slides deck that must be followed, use this skill.
- Do not use this skill to author a blank or from-scratch presentation.

## Parse a Template Deck

If code mode is unavailable in the current Codex environment, reproduce the same read-to-file, parse, and render workflow with the available connector and local tools. Preserve the same artifacts and validation steps; do not skip the workflow merely because code mode cannot be used.

For template or reference following, first use code mode to read the complete template/reference presentation directly into a file. Set `SKILL_DIR` to this skill's absolute directory and `WORKSPACE` to an absolute task workspace, then run this in one `functions.exec` call:

```js
const SKILL_DIR = "<absolute-skill-directory>";
const WORKSPACE = "<absolute-task-workspace>";
const loaded = await tools.exec_command({
  cmd: `/bin/cat -- '${SKILL_DIR}/host/read-template-to-file.mjs'`,
  workdir: SKILL_DIR,
  login: false,
  yield_time_ms: 30000,
  max_output_tokens: 20000,
});
if (loaded.exit_code !== 0) throw new Error("Could not load the template reader");
const { readTemplateToFile } = new Function(
  `${loaded.output.replace(/^\s*export\s+/gm, "")}\nreturn { readTemplateToFile };`,
)();
const result = await readTemplateToFile({
  presentationId: "<presentation-id>",
  outputPath: `${WORKSPACE}/raw-template.json`,
  workspaceRoot: WORKSPACE,
  skillRoot: SKILL_DIR,
  tools,
});
text(JSON.stringify(result));
```

The reader omits the `fields` argument so the connector returns the full presentation resource, then writes the unmodified connector response to `raw-template.json` without placing it in model context.

Next, set `NODE` to the bundled Node.js executable returned by the workspace dependency loader and run:

```bash
"$NODE" "$SKILL_DIR/scripts/parse_template_design_system.mjs" \
  --input "$WORKSPACE/raw-template.json" \
  --output "$WORKSPACE/design-system.json" \
  --catalog "$WORKSPACE/design-catalog.md"
```

`--catalog` is optional. Use the JSON for master families, layout and placeholder IDs, inherited styles, theme colors, protected regions, and exemplar geometry. Use the catalog as a compact planning view. Confirm semantic and visual interpretations against rendered source slides; the parser derives structure but does not render the deck.

## Render a Deck

Export a deck once as PDF and render every slide locally instead of fetching one thumbnail per slide. Set `PDFTOPPM` to `pdftoppm` inside the native-binaries directory returned by the workspace dependency loader, then run this in one `functions.exec` call:

```js
const SKILL_DIR = "<absolute-skill-directory>";
const WORKSPACE = "<absolute-task-workspace>";
const PDFTOPPM = "<absolute-native-binaries-directory>/pdftoppm";
const loaded = await tools.exec_command({
  cmd: `/bin/cat -- '${SKILL_DIR}/host/export-and-render-slides.mjs'`,
  workdir: SKILL_DIR,
  login: false,
  yield_time_ms: 30000,
  max_output_tokens: 30000,
});
if (loaded.exit_code !== 0) throw new Error("Could not load the slide renderer");
const { exportAndRenderSlides } = new Function(
  `${loaded.output.replace(/^\s*export\s+/gm, "")}\nreturn { exportAndRenderSlides };`,
)();
const result = await exportAndRenderSlides({
  presentationId: "<presentation-id>",
  outputDir: `${WORKSPACE}/renders/<deck-name>`,
  workspaceRoot: WORKSPACE,
  skillRoot: SKILL_DIR,
  designSystemPath: `${WORKSPACE}/design-system.json`,
  pdftoppmPath: PDFTOPPM,
  dpi: 120,
  tools,
});
text(JSON.stringify(result));
```

Use the helper as shown instead of calling Drive `fetch` or `export_file` directly. It automatically handles current reference-backed and legacy inline responses, writes `presentation.pdf`, and returns ordered PNGs mapped to native slide IDs. It fails if the PDF page count differs from the design system. Use a fresh output directory, then inspect every PNG with `view_image`; create a local contact sheet when useful.

### Presentations location

Use/create `ChatGPT` at My Drive root. Place new presentations created from scratch or from a template there.  
Edit existing presentations in place.

Respect user-specified locations.

## Build From the Template

For template or reference following, copy the template once and edit only the copy.

Before making mutations, use the design catalog and rendered template slides to choose and record for every planned output slide:

- its narrative role;
- the native template exemplar slide ID or layout ID;
- whether it will be built by duplicating the exemplar or creating from the layout.

Match exemplars by narrative role, content density, evidence type, orientation, hierarchy, and meaning-bearing slots—not merely by object count or visual similarity. If the user links a particular template slide, inspect it explicitly and use it when it fits the requested role.

Do not use an exemplar containing device mockups, photography, screenshots, charts, or other meaning-bearing slide-local media unless every such element is explicitly mapped to destination content as keep, replace, or delete. If every element cannot be mapped, choose another exemplar.

Treat template placeholder media as meaning-bearing slide-local media. Explicitly map every image and video slot in a selected exemplar—especially speaker portraits—to keep, replace, or delete; never leave an unmapped placeholder in the output.

Prefer these construction methods in order:

1. Duplicate a rendered template exemplar when its design depends on slide-local shapes, image or chart frames, tables, groups, video, custom text styles, footer treatment, or other native objects.
2. Create from an inspected template layout only when its inherited placeholders are sufficient.
3. Populate, replace, or remove existing exemplar objects and inherited placeholders before creating new primary text, image, table, chart, or shape objects.
4. Create a new composition only when no inspected exemplar or layout can support the content; keep it consistent with the nearest template family.

Treat slide-local structure as part of the template. When a duplicated exemplar already contains a table, title frame, card structure, divider, footer, image frame, or other reusable structural object, edit it in place. Do not delete and recreate it merely to simplify implementation. Remove an object only after explicitly mapping it to `delete` because the destination slide does not need it.

Preserve the intrinsic aspect ratio of every image and video. Never stretch media by independently setting its width and height or by applying unequal horizontal and vertical scaling without deriving both from its intrinsic dimensions. Do not blindly reuse an exemplar media transform when the replacement has a different aspect ratio.

Use crop-to-fill only for decorative photography or full-bleed imagery where edge cropping is safe. Fit screenshots, charts, diagrams, UI, and videos fully within the intended frame so all meaning-bearing content remains visible; center the result, and prefer empty margins to distortion or loss of important content. Treat stretched media or improperly cropped meaning-bearing content as a concrete visual defect.

Preserve each exemplar's font family, weighted font family, font size, bold and italic state, color, paragraph styling, geometry, and object type by default. Change one of these only to resolve a concrete content-fit defect.

Preserve the template's font sizes whenever possible. If text overflows, first consider a small, local font-size reduction; do not shrink an entire mixed-style text box to solve one overflowing passage. Never reduce narrative body or list text below 12 pt. If the template already defines smaller narrative text for the same role, preserve that template size but do not reduce it further. Template-native captions, footers, source notes, and micro-labels may remain smaller, but do not reuse those smaller styles for narrative content.

If content still does not fit readably, choose a denser suitable exemplar or shorten flexible wording while preserving the original meaning, tone, facts, and required details. Treat reaching the 12 pt narrative floor, visible overcrowding, conspicuously undersized text, or leaving a major intended region unused as evidence that the archetype is wrong—not as a cue for further local typography repairs. Restore the template size and switch to a more appropriate exemplar or shorten the copy; do not apply a uniform minimum-size style to an entire text box or keep adjusting paragraphs to force an unsuitable exemplar. If adapting an image-led exemplar requires deleting its principal media slot and leaving that region empty, choose a text-first exemplar instead.

Treat multiple text and paragraph styles within one text box as structural. If a text box combines a title, kicker, label, body, or other differently styled runs, replace the corresponding text while preserving the existing run and paragraph styles. Do not apply one uniform style to the entire text box.

Before replacing text in a mixed-style text box, record its existing text and paragraph runs and update the corresponding ranges. Do not use `deleteText` over `ALL` followed by `insertText` and `updateTextStyle` over `ALL`; if replacement changes run lengths, reconstruct the original styled ranges explicitly.

Use native paragraph bullets for lists. Never type leading hyphens or visible bullet glyphs such as `•`, `◦`, `▪`, or `‣` into inserted text to imitate a bulleted list. When an exemplar uses a custom bullet character or style, preserve its existing list formatting and edit the paragraph text without replacing or normalizing the marker.

Every bulleted paragraph must contain visible text. Never leave an empty or whitespace-only bulleted paragraph. When an exemplar contains more list items than needed, delete the unused paragraph or remove its bullet formatting; use paragraph spacing instead of a blank bullet to create vertical separation.

Do not create from a blank layout when an inspected rich exemplar can support the narrative role and evidence type.

Use one consistent exemplar or layout family for truly recurring slide roles. This does not mean collapsing visually distinct section-title, speaker, agenda, or content archetypes into one generic construction. If content does not fit, shorten flexible wording or choose a better-fitting template archetype; do not flatten the template's typography or redesign a sparse composition into a dense canvas.

Preserve native links, notes, tables, charts, and media types when supported, and remove stale exemplar content. Keep unused template-library slides until the delivered slides and final order are verified, then delete them last.

Do not rasterize editable source narrative text merely to preserve its appearance. Recreate it as native Google Slides text using the template's typography and hierarchy. Text may remain rasterized only when it is intrinsically part of a required screenshot or other source media asset.

## Work Efficiently

Read, parse, and render each unchanged template or content source only once. Reuse the local design system, catalog, PDF, and rendered images.

Complete all planned slide construction and content population before output visual QA. Confirm the delivered slide IDs through one live structural readback, then remove unused template-library slides and establish the final order before the first output PDF render.

Read and parse the output once after its final slide set and order are established. Reuse that output design system after text, style, image, or media repairs. Parse it again only when a structural mutation changes slide IDs, slide count, or slide order.

Before the first output PDF render, run the local issue checker on the raw presentation JSON already saved by that structural readback:

```bash
"$NODE" "$SKILL_DIR/scripts/check_output_issues.mjs" \
  --input "$WORKSPACE/raw-output.json" \
  --output "$WORKSPACE/output-issues.json"
```

The checker makes no API or render calls. It reports only compact, object-level findings for empty native bullet paragraphs, duplicate or typed bullet markers, explicitly undersized narrative text, unresolved generic placeholder text, empty text placeholders, and structurally blank slides. Repair every `error` before rendering. Treat `warning` findings as review prompts and preserve intentional template-native exceptions. Combine applicable repairs with the existing consolidated repair pass; do not add a read, parse, render, or diagnostic-rerun cycle solely to clear warnings.

Inspect every delivered slide from one output render and collect all concrete defects before repairing. Prefer one consolidated repair pass, but perform a second consolidated pass when defects remain. A structural rebuild invalidates prior visual QA: render the complete delivered deck again and use the second repair pass if needed. Do not perform more than two repair passes. Do not create additional read, parse, or render cycles without a concrete defect or structural change that invalidates an existing artifact.

Complete duplication and slide creation before reordering. Reorder in a separate mutation after structural readback, using each delivered slide ID exactly once.

## Output Format

### Final Response Citations

- **Create/edit:** for created or edited presentations, cite each final deliverable exactly once with `purpose="output"`, in its own paragraph. Briefly describe the result without repeating its filename, path, or link. Never put output directives inside prose or list items.
- **Q&A and summaries:** Every file whose contents you summarize or use to support an answer MUST receive a `:codex-file-citation{...}` with `purpose="source"` in the final response. Use the source citation in place of the filename, wherever the filename would appear. Do not write the filename separately and append its citation at the end. Files merely inspected but not used in the answer need no citation. Do not emit output citations for unchanged files or read-only answers.

- Emit `:codex-file-citation{...}` directly, without backticks, code fences, or a Markdown-link wrapper. Use verified targets only. No need to cite or reference intermediate work.

Deliver a native Google Slides file even when another authoring workflow was used to build it, unless the user explicitly requests preservation of the source file type or no conversion. Set `path` to its verified native URL returned by the connector and omit `mode`. Citation directives are exempt from "Return web URLs as Markdown links."

Some illustrative examples, real responses use verified targets outside code fences.

```text
:codex-file-citation{path="https://docs.google.com/presentation/d/<verified-file-id>" purpose="output"}
```

```text
The review of :codex-file-citation{path="https://docs.google.com/presentation/d/<verified-file-id>" purpose="source"} is due Friday.
```
