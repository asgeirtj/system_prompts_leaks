---
description: Build, render, inspect and export a presentation from per-slide source files.
---

# Build a presentation

- Resolve the StylePlan through [visual planning](visual.md), then read [authoring](authoring.md), [the design system](design-system.md) and [image direction](image-directive.md) before writing HTML. They define how to apply the plan and win over anything below where they differ.

- The StylePlan is the sole styling authority for the deck. Apply it verbatim and never re-pick colors or fonts.

- The plan's fields:
  - `archetype`, `theme`, `voice`, `image_style`, `tone`, `weight` and `density` set the deck's character.
  - `palette` holds `paper`, `ink`, `primary` and `accent`, and `fonts` holds `display` and `body`.
  - `preferred_layouts`, `preferred_charts` and `required_content_blocks` guide the content.
  - `layout_plan` gives one `{id, layout}` entry per slide.
  - `lockups` names the deck's two allowed text-and-image patterns.
  - `css_variables` is the `:root` block to emit verbatim.

- `output_format` from your brief decides what is produced and promoted. When it is absent, it is exactly `["pptx"]`.

## 1. Set up the project

- Create `.src/media/`, `.src/validate/` and `.src/slides/` inside `project_dir`.

- Author the deck one file per slide under `.src/slides/`. Step 7 assembles them into the combined `.src/index.html` that validation and every export read.

## 2. Resolve the slide count

- Resolve it once. Use an exact `slide_count_target` directly, and for a range use the midpoint rounded down. On a create with no `slide_count_target`, choose 6 to 10 slides to fit the content. A rebuild keeps the deck's slide count unless the request changes it. Use that resolved count for the rest of the build.

## 3. Plan the story

- Write `.src/deck_plan.md` grounded in the verbatim request, the content supplied in the requesting conversation, and sources you fetched and verified: the title, the audience, the narrative and one entry per slide derived from the source facts.

- Repeat the user's stated constraints at the top so they shape the build.

- Match the slide list to `layout_plan`, with the cover first and the closing last, and cover every entry in `required_content_blocks`. Produce exactly the resolved slide count, without invented extras or dropped required content.

- In the asset plan, commit to a cover hero and at least two illustrative images, each marked as sourced or generated according to step 6, and to palette-colored matplotlib charts for data.

## 4. Set the design system

- Write `.src/slides/deck.css`: the plan's `css_variables` as one `:root` block, then every shared rule the slides are built on, meaning the canvas, the layout classes, the two lockups and the type scale.

- This one stylesheet is the deck's whole design system. Never re-pick colors or fonts and never redefine a token per slide.

- The `:root` font tokens are the only place the theme's typefaces are named. Write no font URL anywhere, as [the design system](design-system.md) explains.

- Save the resolved plan at `.src/style_plan.json` so a later edit can recover the archetype, `layout_plan` and `lockups`.

## 5. Author one file per slide

- Write each slide at `.src/slides/<id>.html` following [authoring](authoring.md) and [the design system](design-system.md). Apply its assigned layout class, use only the deck's two lockups for text-and-image slides, keep to the palette and type scale, and put the point in the heading as a claim.

- Each file is a standalone document holding exactly one slide:

```html
<!doctype html>
<html><head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="deck.css">
</head><body>
  <section class="slide" id="<id>"> ... </section>
</body></html>
```

- The `id` is the slide's `layout_plan` ID and names the slide for life, so a later edit that inserts or removes a slide leaves the others untouched. Never renumber IDs. The file is always `<id>.html`, IDs are kebab-case, and `index` is reserved for the combined document, so assembly refuses it.

- Embed every final `<img>` and CSS `url(...)` asset as a `data:` URI, keeping source media in `.src/media/` while you work. `deck.css` is the only stylesheet a slide links, and the theme's fonts arrive embedded in it. Leave no other `http://`, `https://`, `file://` or relative `.src/media` reference.

- Shared CSS belongs in `deck.css`. A slide may add its own `<style>` for rules only that slide needs, such as a hero's `background-image` and its `--hero-scrim-color`.

- Scope every selector in a slide's own `<style>` to that slide's ID (`#<id>`, `#<id> .title-block`, `#<id>::after`), including inside `@media`. Assembly concatenates the deck into one document, so an unscoped rule would restyle every other slide and make the two views disagree. Assembly rejects one.

- The default canvas is 16:9 at 13.333 by 7.5 inches, 1280 by 720 pixels at 96 dpi. For another requested ratio, update the `@page` size and the `.slide` width and height in `deck.css` together.

- Check the slides you just wrote by searching each `.html` file for a `#` color and for `rgb(`. Two hits are correct: the slide's own `--hero-scrim-color`, and `#fff` on a cover title over a photo.

- Every other hit is a bug, whether in a `style=` attribute, a `<style>` block, inside `color-mix()` or in an SVG `fill`. Replace it with the matching `var(--slide-*)`, or with `color-mix(in srgb, var(--slide-*) N%, transparent)` where it was a tint.

- Then write `.src/slides/deck.json`, which puts the slides in order:

```json
{"main_title": "<artifact-title>", "slides": [{"id": "cover"}, {"id": "problem"}]}
```

- Assembly rewrites this file with the fields the viewer needs, such as the canvas, theme and per-slide titles, so author only `main_title` and the ordered `slides` list.

- Put this baseline page model in `deck.css`:

```css
@page { size: 13.333in 7.5in; margin: 0; }
* { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
html, body { margin: 0; background: #111; }
.slide {
  width: 13.333in;
  height: 7.5in;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
}
.slide:last-child { page-break-after: auto; break-after: auto; }
```

## 6. Source imagery and charts

- A real subject, such as a company, product, place or person, logos included, comes from the [Image Search skill](/opt/muse/skills/image-search/SKILL.md). A concept subject comes from `media.generate_image` following [image direction](image-directive.md), with `artifact_media_dir` as `output_dir`.

- Get the cover hero this way plus at least two illustrative images. Copy image-search results under `.src/media/`, use relevant local or user-supplied assets when available, and embed each as a `data:` URI.

- Never substitute a CSS gradient or inline SVG for the cover hero. If the hero cannot be sourced or generated, or the brief asks for a deck with no imagery at all, update `deck_plan.md` before rendering to say which case applies, name the route that was unavailable in the first case, and describe the replacement visual system.

- A brief that forbids synthetic imagery is neither case. It closes the generate route only, so a real subject is still sourced.

- Never claim image-led output when the deck has no `<img>`, `data:image` or CSS `url(...)` assets.

- Build data charts as matplotlib images colored from the StylePlan palette, following [authoring](authoring.md), so charts match the deck. Never use `media.generate_image` for charts, maps, tables or factual diagrams, and put no decorative images on stat or statement slides.

## 7. Embed fonts and assemble

- Both steps are mandatory and must pass before validation, because the render gate, the page images, the PPTX, the PDF and the HTML export all read the assembled file.

- Embed the fonts after the slides exist, since the subsets it carries depend on the characters they paint:

```sh
SLUG="<artifact-slug>"
# Your build task names `project_dir`. A goal document is built under that
# goal's `files/` directory, so a hardcoded `your_files` path is wrong.
# Write the leading `~/` of `project_dir` as `$JARVIS_HOME/`: the shell leaves
# a tilde literal inside quotes, so `"~/workspace/..."` builds into a directory
# literally named `~`.
SRC="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>/.src"
bun run "/opt/muse/assets/artifacts/scripts/embed_deck_fonts.mjs" --slides "$SRC/slides"
bun run "/opt/muse/assets/artifacts/scripts/assemble_deck.mjs" \
  --slides "$SRC/slides" \
  --out "$SRC/index.html"
```

- The embedder reports `{"ok":true,"faces":N,...}`, and `"reused":true` means the faces were already current. `faces: 0` with a warning means the download failed. Run it once more, and if it fails again, carry on and tell the user the deck renders in a fallback face rather than blocking the deck.

- Assembly writes `$SRC/index.html`, one self-contained document with `deck.css` inlined, so the theme's font bytes ride along, and the slides in `deck.json` order. It also rewrites `deck.json` with the derived fields.

- Never write or edit `$SRC/index.html` by hand, because the next assembly overwrites it.

- A finished deck has no `fonts.googleapis.com` reference, and that is correct. Never add one back. The embedded rules sit at the end of `deck.css`, wrapped over many lines, so edit the authored rules above them.

- A non-zero exit means the deck cannot ship. The error names the offending file and what is wrong with it, so fix that file or `deck.json` and run it again.

## 8. Render and validate

- This loop is mandatory. When a check fails, edit the slide files under `.src/slides/`, assemble again (step 7), re-render and validate again.

- Stop after three iterations, then report the specific slide and failure and ask for direction. Never return links until validation passes, and do not add an iteration after a first render that passes.

```sh
SLUG="<artifact-slug>"
SRC="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>/.src"
HTML="$SRC/index.html"
# Gate both StylePlan Google Font families at 400 (Family:weight,
# comma-separated), which every catalog family publishes. Add another weight
# only after confirming the returned Google Fonts CSS contains that exact face.
# Pass the theme families, never a local fallback: naming the fallback makes a
# wrong deck pass. Omitting --fonts still gates the families read from the
# deck's own `:root`, but cannot validate exact weights.

# PPTX-only or HTML-only output: validate the slide render directly and produce
# the PNGs the PPTX export reads. No intermediate PDF is produced.
bun run "/opt/muse/assets/artifacts/scripts/render_audit.mjs" \
  --html "$HTML" \
  --png-dir "$SRC/validate" \
  --page-selector "section.slide" --structure-check \
  --require-webfonts \
  --fonts "<Display Family>:400,<Body Family>:400" \
  --style-plan "$SRC/style_plan.json" \
  --require-fill --require-cover-image --require-generated-imagery --require-restraint \
  --hermetic --gate --report-out "$SRC/render_report.json"

# Only when pdf is in output_format: render the PDF and validate the actual PDF
# bytes. validate_pdf.sh writes the page PNGs to .src/validate/.
PDF="$SRC/$SLUG.pdf"
bun run "/opt/muse/assets/artifacts/scripts/render_audit.mjs" \
  --html "$HTML" \
  --pdf "$PDF" \
  --page-selector "section.slide" --structure-check \
  --require-webfonts \
  --fonts "<Display Family>:400,<Body Family>:400" \
  --style-plan "$SRC/style_plan.json" \
  --require-fill --require-cover-image --require-generated-imagery --require-restraint \
  --hermetic --gate --report-out "$SRC/render_report.json"
"/opt/muse/assets/artifacts/scripts/validate_pdf.sh" "$PDF" "$HTML" "$SRC/validate"
```

### Read the report

- `render_audit.mjs` renders the deck in Chromium. It can write a PDF that honors the `@page` size, is tagged for accessibility and carries a bookmark outline built from the deck's headings, and it can screenshot each `section.slide` to a zero-padded PNG in `.src/validate/`.

- It prints a JSON report with `ok`, `pdf`, `pages`, `pngs`, `fonts` (`missing`, `unused`, `used`, `expected`), `overflow` entries (`index`, `overflowY_px`, `overflowX_px`), `cover_no_image`, `broken_images`, `fill` and `plan`.

- A `browser_failures` array, holding console errors, broken images and non-2xx sub-resources, means the page itself misbehaved. It always sets `ok:false`, and the images and report are still written so you can see what broke.

- `--gate` makes the verdict real: it sets `ok:false`, lists the reasons in `gate_failures` and exits non-zero. A non-zero exit means the deck is not finished, so fix what is named and re-render. Never export or return a link on a failed gate.

- `--report-out` writes the same report to `.src/render_report.json`, so the verdict survives a backgrounded command. If your render backgrounded, read that file instead of assuming it passed. It sits outside `.src/validate/` on purpose, because `validate_pdf.sh` clears that directory before rasterizing.

- These fail the gate: `overflow`, `broken_images`, a slide carrying furniture, uppercase or letter spacing under `--require-restraint`, a slide failing `--require-fill`, a deck the image tool generated nothing for under `--require-generated-imagery`, and a deck with no cover image under `--require-cover-image`.

- `advisories` never gate. Fix them when they are real, but they do not block delivery.

- `fonts.missing` is an advisory because the probe depends on the Google Fonts fetch and can change between runs of the same deck. Still act on it.

### Fix fill failures

- `fill` lists `index`, `top_gap_pct`, `v_fill_pct` and `h_fill_pct` for each slide: where its content starts and stops inside the canvas.

- `--require-fill` (default 75%) fails a slide only when its content is both under that share and packed against the top with the rest of the canvas dead, which is what a fixed-height slide with no vertical distribution produces. A deliberately sparse slide is centered with a similar gap above and below and passes on any layout, so covers, statements and closings need no exemption.

- Fix a fill failure by distributing the content over the slide's full height, as the lockup grids do with `grid-template-rows: auto 1fr` and `align-self: center`, or by giving the slide more content. Never delete the `height`, switch to `min-height` or pad the copy in ways [authoring](authoring.md) forbids. Every fix lands in `deck.css` or the slide's own file, followed by assembly before re-rendering.

### Drop flags only where they cannot apply

- Drop `--require-cover-image` when the hero could not be sourced or generated, or the brief asks for a deck with no imagery, and you documented the replacement visual system in step 6. A brief that only forbids synthetic imagery keeps the flag, because a sourced logo or photo is not synthetic.

- Drop `--require-generated-imagery` in those same two cases, on a deliberately chart-only or fully sourced deck, and on an in-place edit that does not regenerate imagery. It requires an image `media.generate_image` actually returned, counted by the sidecar the tool writes. A sourced photo has no sidecar, and nothing on disk separates a sourced file from a drawn one, so a fully sourced deck drops the flag rather than trying to pass it.

- Drop `--require-restraint` on any in-place edit of an existing deck, re-themes and reorders included, as the [editing guide](editing.md) explains. Only a fresh build keeps it.

### Act on the other findings

- `plan` compares the built deck with the StylePlan and is advisory only. `missing_slides` are `layout_plan` IDs not built and `extra_slides` are IDs the plan never asked for.

- Neither blocks, because a shortening edit legitimately trims slides the saved plan still lists. A missing `style_plan.json` skips the comparison.

- Re-edit and re-render when `fonts.missing` or `overflow` is non-empty. `fonts.used` is the set of families Chromium actually rasterized, and `fonts.unused` lists available faces no element used.

- A missing face means the download failed or the family name is wrong. Fix the family's spelling, exactly as Google publishes it, in the `:root` tokens of `.src/slides/deck.css`, then run step 7 again and re-render.

- Editing `.src/index.html` fixes nothing, because assembly rewrites it from `deck.css`. Never rewrite `:root` to a substitute family, which only hides the failure.

- If only a heavier face is missing while `fonts.used` contains the family, check the returned Google Fonts CSS. When that weight is not published, remove it from the gate and keep the family-level `400` check. `--require-webfonts` also rejects an installed local face with the same name, because slide themes must resolve through a custom `@font-face`.

- Each `overflow` entry is a slide whose content spills past its own box (`scrollHeight > clientHeight`). Fix the slide at that `index` by reducing content, not shrinking fonts.

- Re-render when `cover_no_image` is true, meaning the cover has no real image, unless the deck is intentionally image-free under step 6. Re-render when `broken_images` is non-empty, meaning an `<img>` source is not image bytes. Embed the generated file as a `data:image` URI, not the image tool's JSON result.

- When `pdf` is in `output_format`, `validate_pdf.sh` checks PDF integrity, the page count, the data-URI embedding of `<img>` and CSS `url(...)` assets and the size of image-heavy PDFs, then rasterizes the actual pages to `.src/validate/page-*.png`. When `pptx` is also requested, build it from those PDF-derived images.

## 9. Inspect every rendered slide

- After the render report passes, and `validate_pdf.sh` too when a PDF is requested, read every `.src/validate/page-*.png` with `muse.read`. Do not assume a particular filename padding.

- Check that:
  - the rendered page count equals the resolved slide count
  - the palette and fonts are visibly applied
  - a deck of five or more slides uses at least three distinct layouts
  - the cover establishes the visual language
  - images render and match their claims, and hero text is legible with enough contrast
  - no image is missing, no slide is blank, no text is clipped or unreadable, and no weak layout repeats
  - charts render correctly

## 10. Export and promote

- Promote each requested format to the project root. Files not in `output_format` stay under `.src/`.

- For `pptx`, build the deck from the validated slide images with the bundled `build_pptx.py`. Run it with the real slug and title:

```sh
SLUG="<artifact-slug>"
TITLE="<artifact-title>"
# Your build task names `project_dir`, which is not always under `your_files`.
# Pass it to the script so the deck lands beside its source.
DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
"/opt/muse/assets/artifacts/scripts/build_pptx.py" "$SLUG" "$TITLE" --project-dir "$DIR" || { echo "PPTX build failed" >&2; exit 1; }
unzip -l "$DIR/$SLUG.pptx" | grep -q "ppt/media/" || { echo "PPTX has no embedded slide images" >&2; exit 1; }
unzip -p "$DIR/$SLUG.pptx" docProps/core.xml | grep -qi "<dc:title>[^<]" || { echo "PPTX title metadata is empty" >&2; exit 1; }
```

- `build_pptx.py` reads the validated `.src/validate/page-*.png`, sizes each slide to the image's aspect ratio, embeds one full-bleed image per slide without distortion, sets the deck title and writes `<slug>.pptx` at the project root. The PPTX has no editable text or shapes, and each slide's title rides in its speaker notes as accessibility text. Never build a native-shape PPTX instead.

- For `pdf`, copy the validated `.src/<artifact-slug>.pdf` to `<artifact-slug>.pdf` at the project root.

- For `html`, only when it is requested, copy the assembled `.src/index.html` to `<artifact-slug>.html` at the project root. It is one self-contained file carrying the theme's font bytes, so it renders in the branded face offline and fetches nothing. Never promote the per-slide files, which are source, not a deliverable.

- If the PPTX cannot be produced, because `python-pptx` will not install or the checks fail, never silently substitute PDF or HTML for a default deck. Drop `pptx` only when other formats were explicitly requested and continue with those. For a default `["pptx"]` deck, report that the PowerPoint export failed and ask whether PDF or HTML would help.

## 11. Write the metadata

- Write `project_dir/meta.json` after every requested output is verified at the project root. List in `outputs` only files that exist there and were requested in `output_format`.

- `primary_output` is the highest-priority produced file in the order PPTX, PDF, HTML. `description` is a one-line summary of the deck.

- The runtime reads only `title` and `description` today. The other fields document the deliverable.

- Compute the dynamic fields in the same step, after the final render, because each run rewrites `.src/validate/`. Use the absolute path and the command output, not the example values below:
  - `slide_count` is the output of `ls "$SRC"/validate/page-*.png | wc -l`.
  - `thumbnail` is `.src/validate/<name>`, where `<name>` is the first image's filename from `ls "$SRC"/validate/page-*.png | sort | head -1 | xargs -n1 basename`. Store it relative to the project root, like the `outputs` paths.

```json
{
  "title": "<artifact-title>",
  "description": "<one-line summary of the deck>",
  "type": "presentation",
  "primary_output": "<artifact-slug>.pptx",
  "outputs": [
    {"kind": "pptx", "path": "<artifact-slug>.pptx"}
  ],
  "slide_count": 8,
  "thumbnail": "<first .src/validate/page-*.png filename>",
  "status": "complete"
}
```

- Add `{"kind": "pdf", "path": "<artifact-slug>.pdf"}` or `{"kind": "html", "path": "<artifact-slug>.html"}` to `outputs` only when those formats were requested and promoted.

## Check the finished deck

- A deck is complete only when:
  - its slide count equals the resolved count
  - it tells one clear story rather than stacking unrelated pages
  - it uses at least three distinct layouts when it has five or more slides
  - at most `floor(resolved slide count * 0.4)` slides are plain title-plus-bullets, meaning a slide whose only non-title content is a single `<ul>` or `<ol>`
  - every slide except an appendix has a visual anchor: an image, chart, timeline, diagram, callout system or strong typographic composition
  - every image that was requested, attempted or created is embedded in its slide and visible in the validation images, and unused generated files in `.src/media/` are deleted or explained in `deck_plan.md`
  - dense text was rewritten, split or removed rather than shrunk until unreadable
  - the PPTX, when produced, came from the validated rendered slides
  - every claim is grounded in the verbatim request, the requesting conversation, or a source you fetched and verified
  - the per-slide source under `.src/slides/` and the combined `.src/index.html` agree, because assembly ran after the last edit
