---
description: The deck-build loop. Resolves the style plan, then walks the slides references in the order they are needed.
---

# Slide deck build workflow

The deck-build loop, for the artifact builder. Resolve `style_plan` through
`visual.md`, then read `authoring.md`, `design-system.md`,
and `image-directive.md` before writing HTML. They define how to apply the
StylePlan (its `css_variables`, per-slide `layout_plan`, and `lockups`), and
they win over the generic guidance below where they conflict. The StylePlan is
the sole styling authority for the deck: apply it verbatim and never re-pick
colors or fonts.

The `StylePlan` fields: `archetype`, `theme`, `palette` {paper, ink, primary, accent},
`fonts` {display, body}, `voice`, `preferred_layouts`, `preferred_charts`,
`required_content_blocks`, `image_style`, `tone`/`weight`/`density`,
`layout_plan` (one `{id, layout}` per slide), `lockups` (the deck's two allowed text+image
patterns), and `css_variables` (the `:root` block to emit verbatim).

`output_format` from your brief drives what gets produced and promoted; when absent it is
exactly `["pptx"]`.

## Steps

1. **Set up.** Create `project_dir/.src/media/`, `project_dir/.src/validate/`, and  
   `project_dir/.src/slides/`.

   You author the deck **one file per slide** under `.src/slides/`; step 7 assembles them into  
   the combined `.src/index.html` that validation and every export read.

2. **Resolve the slide count once:** if `slide_count_target` is an exact number, use it; if it
   is a range, use the **midpoint** (rounded down). Call this the **resolved slide count** and
   use it for the rest of the workflow.

3. **Plan.** Write `project_dir/.src/deck_plan.md` grounded in the
   verbatim request and the requesting conversation's supplied content: title,
   audience, the narrative arc, and the slide list (one bullet per slide, derived from supplied
   source data/facts; matched to `StylePlan.layout_plan`, first = cover,
   last = closing, covering every entry in `required_content_blocks`). Produce exactly the
   resolved slide count; do not invent extras or drop required content. Echo
   the user's stated constraints at the top so they shape the build. In the asset plan, commit to a
   cover hero plus at least 2 illustrative images, each marked sourced (image-search) or generated
   (`media.generate_image`) per step 6, and
   palette-colored matplotlib charts for data.

4. **Set the design system.** Write `project_dir/.src/slides/deck.css`: the StylePlan's
   `css_variables` as one `:root` block, then every shared rule the deck's slides are built
   against — the canvas, the layout classes, the two `lockups`, the type scale. This one
   stylesheet is the deck's whole design system, shared by every slide, so never re-pick colors
   or fonts and never redefine a token per slide. The `:root` font tokens are the only place the
   theme's typefaces are named. Write no font URL here or anywhere (see `design-system.md`).
   Keep the resolved JSON at `project_dir/.src/style_plan.json` so a later edit can recover the
   archetype, `layout_plan`, and `lockups`.

5. **Author one file per slide** at `project_dir/.src/slides/<id>.html`, per `authoring.md` +
   `design-system.md`. Apply the slide's assigned layout class and use only the deck's two
   `lockups` for text+image slides. Keep to the palette + type scale and put the point in the
   heading as a claim. Cover = hero image + title only.

   Each file is a standalone document holding exactly one slide:

   ```html
   <!doctype html>
   <html><head>
     <meta charset="utf-8">
     <link rel="stylesheet" href="deck.css">
   </head><body>
     <section class="slide" id="<id>"> ... </section>
   </body></html>
   ```

   - `id` is the slide's `layout_plan` id. It names that slide for the rest of its life, so a
     later edit that inserts or removes a slide leaves the others' identities untouched; never
     renumber them. The file is always `<id>.html`. Keep ids kebab-case, and never `index` —
     that name is reserved for the combined document, so assemble refuses it.
   - Embed every final `<img>` and CSS `url(...)` asset as a `data:` URI; keep source media in
     `.src/media/` while working. `deck.css` is the only stylesheet a slide file links (the
     theme's fonts arrive embedded in it) — leave no other external `http://`, `https://`,
     `file://`, or relative `.src/media` reference.
   - Shared CSS belongs in `deck.css`. A slide may add its own `<style>` for rules only that
     slide needs (a hero's `background-image`, its `--hero-scrim-color`), and **every selector
     in it must be scoped to that slide's id** (`#<id>`, `#<id> .title-block`, `#<id>::after`,
     including inside `@media`). Assemble concatenates the deck into one document, so an
     unscoped rule would restyle every other slide and make the two views disagree; assemble
     rejects one.
   - Default canvas is 16:9 at `13.333in x 7.5in` (1280x720 px at 96 dpi); if the user requested
     another aspect ratio, update the `@page` size and the `.slide` width/height in `deck.css`
     together.
   - Then check the slides you just wrote. Search each `.html` file for a `#` colour and for
     `rgb(`. Two hits are correct: the slide's own `--hero-scrim-color`, and `#fff` on a cover
     title over a photo. Every other hit is a bug, in a `style=` attribute, in a `<style>` block,
     inside `color-mix()` or in an SVG `fill`. Replace it with the matching `var(--slide-*)`, or
     with `color-mix(in srgb, var(--slide-*) N%, transparent)` where it was a tint.

   Then write `project_dir/.src/slides/deck.json`, which is what puts the slides **in order**:

   ```json
   {"main_title": "<artifact-title>", "slides": [{"id": "cover"}, {"id": "problem"}]}
   ```

   Assemble rewrites this file with the fields the viewer needs (canvas, theme, per-slide  
   titles), so author only `main_title` and the ordered `slides` list.

   Baseline page model, in `deck.css`:

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

6. **Source imagery and charts.** A real subject (a company, product, place, or person, logos
   included) comes from the image-search skill; a concept subject comes from `media.generate_image`
   per `image-directive.md` (`output_dir` = `artifact_media_dir`). Get the cover hero this way plus
   at least 2 illustrative images, copy image-search results under `.src/media/`, and embed each
   as a `data:` URI; use relevant local or user-provided assets when available. Do
   not substitute a CSS gradient or inline SVG for the cover hero. If the hero can't be sourced or
   generated, or the brief asks for a deck with no imagery at all, update `deck_plan.md` before
   rendering to say which of those it is (and for the first, which route was unavailable), then
   explain the replacement visual system. A brief that forbids SYNTHETIC imagery is neither case:
   it closes the generate route only, and a real subject is still sourced. Do not claim image-led output when the deck has no `<img>`, `data:image`,
   or CSS `url(...)` assets. Build data charts as palette-colored matplotlib images (color from
   the StylePlan palette; see `authoring.md`) so charts match
   the deck. Do not use `media.generate_image` for charts, maps, tables, or factual diagrams. No
   decorative images on stat/statement slides.

7. **Give the deck its fonts, then assemble it.** Both are mandatory and must pass before
   validation: everything downstream (the render gate, the PNGs, the PPTX, the PDF, the `html`
   export) reads the assembled file.

   Embed the fonts first. This writes the faces your `:root` tokens name into `deck.css`. Run it  
   after the slides exist: which subsets it carries is decided from the characters they paint.

   ```sh
   SLUG="<artifact-slug>"
   # `project_dir` comes from your build task. A goal document is built under
   # that goal's `files/` directory, so a hardcoded `your_files` path is wrong.
   # `project_dir` comes from your build task. Write its leading `~/` as
   # `$JARVIS_HOME/`: the shell leaves a tilde literal inside quotes, so
   # `"~/workspace/..."` builds into a directory literally named `~`.
   SRC="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>/.src"
   bun run "/opt/hatch/skills/artifacts/scripts/embed_deck_fonts.mjs" --slides "$SRC/slides"
   bun run "/opt/hatch/skills/artifacts/scripts/assemble_deck.mjs" \
     --slides "$SRC/slides" \
     --out "$SRC/index.html"
   ```

   Embed reports `{"ok":true,"faces":N,...}`. A `"reused":true` means they were already current.  
   `faces: 0` plus a warning means the download failed. Re-run it once. If it fails again, carry on  
   and say the deck renders in a fallback face, rather than blocking the deck.

   Assemble writes `$SRC/index.html` (one self-contained document: `deck.css` inlined, so the  
   theme's font bytes ride along, and your slides in `deck.json` order). It also rewrites  
   `$SRC/slides/deck.json` with the derived fields. Never hand-write or edit `$SRC/index.html`.  
   The next assemble overwrites it.

   A finished deck has **no** `fonts.googleapis.com` reference, and that is correct. Never add one  
   back. The embedded rules sit at the END of `deck.css`, wrapped over many lines. Leave them alone  
   and edit the authored rules above them.

   A non-zero exit means the deck cannot be shipped. The error names the offending file and what  
   is wrong with it, so fix that file (or `deck.json`) and re-run.

8. **Validate (mandatory loop, at most 3 iterations).** Run after each render. If a check
   fails, edit the per-slide file(s) under `.src/slides/`, **re-assemble (step 7)**, re-render,
   and re-validate. After 3 iterations, report the specific failure and ask for direction. Never
   return links until validation passes.

   ```sh
   SLUG="<artifact-slug>"
   # `project_dir` comes from your build task. A goal document is built under
   # that goal's `files/` directory, so a hardcoded `your_files` path is wrong.
   # `project_dir` comes from your build task. Write its leading `~/` as
   # `$JARVIS_HOME/`: the shell leaves a tilde literal inside quotes, so
   # `"~/workspace/..."` builds into a directory literally named `~`.
   SRC="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>/.src"
   HTML="$SRC/index.html"
   # Gate both StylePlan Google Font families at 400 (Family:weight,
   # comma-separated), which every catalog family publishes. Add another weight
   # only after confirming the returned Google Fonts CSS contains that exact face;
   # single-weight display families ignore requested 600/700 faces. Pass the theme
   # families, never a local fallback: naming the fallback makes a wrong deck green.
   # Omitting --fonts still gates the families read from the deck's own `:root`, but
   # cannot validate exact weights.

   # For PPTX-only / HTML-only output: validate the slide render directly and
   # produce the PNGs consumed by the PPTX export. No intermediate PDF is produced.
   bun run "/opt/hatch/skills/artifacts/scripts/render_audit.mjs" \
     --html "$HTML" \
     --png-dir "$SRC/validate" \
     --page-selector "section.slide" --structure-check \
     --require-webfonts \
     --fonts "<Display Family>:400,<Body Family>:400" \
     --style-plan "$SRC/style_plan.json" \
     --require-fill --require-cover-image --require-generated-imagery --require-restraint \
     --hermetic --gate --report-out "$SRC/render_report.json"

   # Only when the user explicitly requested pdf in output_format: render the PDF
   # and validate the actual PDF bytes. validate_pdf.sh writes page PNGs to
   # .src/validate/.
   PDF="$SRC/$SLUG.pdf"
   bun run "/opt/hatch/skills/artifacts/scripts/render_audit.mjs" \
     --html "$HTML" \
     --pdf "$PDF" \
     --page-selector "section.slide" --structure-check \
     --require-webfonts \
     --fonts "<Display Family>:400,<Body Family>:400" \
     --style-plan "$SRC/style_plan.json" \
     --require-fill --require-cover-image --require-generated-imagery --require-restraint \
     --hermetic --gate --report-out "$SRC/render_report.json"
   "/opt/hatch/skills/artifacts/scripts/validate_pdf.sh" "$PDF" "$HTML" "$SRC/validate"
   ```

   `render_audit.mjs` renders the deck in Chromium, optionally writes a PDF (honoring the  
   `@page` size, tagged for accessibility and carrying a bookmark outline built from the  
   deck's headings), optionally screenshots each `section.slide` to a zero-padded PNG in  
   `.src/validate/`, and prints a JSON report  
   (`{ ok, pdf, pages, pngs, fonts: { missing, unused, used, expected }, overflow: [{index, overflowY_px, overflowX_px}], cover_no_image, broken_images: [...] }`)  
   to stdout, plus `fill` and `plan` (see below). A `browser_failures` array (console  
   errors, broken images, non-2xx sub-resources) means the page itself misbehaved;  
   it always sets `ok:false`, and the PNGs and report are still written so you can  
   see what broke.

   **`--gate` makes the verdict real, so read it.** With `--gate` the script sets `ok:false`,  
   lists reasons in `gate_failures`, and **exits non-zero**. A non-zero exit means the deck is not  
   finished: fix what is named and re-render. Do not export or return a link on a failed gate.  
   `--report-out` writes the same report to `.src/render_report.json`, so the verdict survives a  
   backgrounded `exec` — if your render backgrounded, read that file instead of assuming it passed.  
   It sits outside `.src/validate/` on purpose: `validate_pdf.sh` clears that directory before  
   rasterizing, which would delete the report on the PDF branch before you could read it.

   Gating (non-zero exit): `overflow`, `broken_images`, a slide carrying furniture,  
   uppercase, or letter tracking under `--require-restraint`, a slide under  
   `--require-fill`, a deck the media image tool generated nothing for under  
   `--require-generated-imagery`, and a  
   coverless deck when `--require-cover-image` was passed. **`advisories` never gate** — fix them  
   when they are real, but they do not block delivery. `fonts.missing` is an advisory because the  
   probe depends on the Google Fonts fetch and can flap between runs on the same deck; act on it  
   as before, but it will not fail the build.

   `fill` is `[{index, top_gap_pct, v_fill_pct, h_fill_pct}]`: where each slide's content starts  
   and stops inside its own canvas. `--require-fill` (default 75%) fails a slide only when it is  
   both under that share **and top-packed** — content jammed against the top with the remainder  
   dead, which is what a fixed-height slide authored with no vertical distribution produces. A  
   deliberately sparse slide is centred, with a comparable gap above and below, and passes on any  
   layout, so a cover, statement or closing slide needs no exemption and none is applied. Fix a  
   failure by distributing the slide's content over its full height (the lockup grids in  
   `design-system.md` use `grid-template-rows: auto 1fr` and `align-self: center` for exactly this)  
   or by giving the slide more content — never by deleting the `height` or switching to  
   `min-height`, and never by padding the copy in ways `authoring.md` forbids. Every fix lands in  
   `deck.css` or the named slide's own file, then re-assemble before re-rendering.

   **Drop `--require-cover-image`** on either step-6 branch: the hero could not be sourced or  
   generated, or the brief asks for a deck with no imagery at all, and you documented the  
   replacement visual system. That deck is allowed to be coverless, and the flag would make it  
   unshippable. A brief that forbids SYNTHETIC imagery is neither branch on its own: a sourced logo  
   or photo is not synthetic, so if the hero's subject is a real thing, source it and keep the flag.

   **Drop `--require-generated-imagery`** on the same two step-6 branches, on a deliberately  
   chart-only or fully sourced deck, and on any in-place edit that does not regenerate imagery. It  
   requires one image `media.generate_image` actually returned, counted by the sidecar the tool  
   writes, so a hand-drawn placeholder cannot satisfy it. A sourced photo cannot either: it has no  
   sidecar, and nothing on disk separates a sourced file from a drawn one, which is exactly why a  
   fully sourced deck drops the flag rather than trying to pass it.

   **Drop `--require-restraint`** on any in-place edit of an existing deck, a re-theme and a  
   reorder included. The probe reads every slide, so on a deck built before this gate it reports  
   furniture, uppercase, or tracking on slides the edit must leave alone. `editing.md` keeps the  
   slide files untouched on a re-theme, applies the minimum edit on a reorder or image swap, and  
   calls a silent restyle a bug. Keeping the flag there leaves no legal move and no deck to  
   return. Fix the rules on the slides you did edit. Mention the untouched slides only if you  
   actually saw furniture, uppercase, or tracking on one of them; a deck built under the gate  
   carries none, so say nothing. Only a fresh build keeps the flag.

   `plan` compares the built deck against the StylePlan and is **advisory only**: `missing_slides`  
   are `layout_plan` ids not built and `extra_slides` are ids the plan never asked for. Neither  
   blocks, because a shorten edit legitimately trims slides the saved plan still lists. A missing  
   `style_plan.json` is fine: the comparison is skipped and the run continues. The fill gate does  
   not depend on it.

   Older findings still apply: re-edit and re-render if `fonts.missing` is  
   non-empty, or if `overflow` is non-empty. `fonts.used` is the set of families Chromium  
   actually rasterized (measured, not the CSS list); `fonts.unused` lists available faces that no  
   element used and is advisory. A missing face means the download failed or the family name is  
   wrong, so fix the spelling of the family in **`.src/slides/deck.css`'s `:root` tokens** (exact  
   spelling as Google publishes it), then re-run step 7 (embed, then assemble) and re-render.  
   Editing `.src/index.html` fixes nothing: assemble rewrites it from `deck.css` on the next run,  
   so the edit is thrown away. Do not rewrite `:root` to a  
   substituted family either, which only hides the failure. If only a heavier face is missing while  
   `fonts.used` contains the family,  
   check the returned Google Fonts CSS: when that weight is not published, remove it from the  
   gate and keep the family-level `400` check. `--require-webfonts` also rejects an installed  
   local face with the same name: slide themes must resolve through a custom `@font-face`, not an  
   image-dependent system font. Each overflow entry is a slide whose content spills past its own  
   client box (`scrollHeight > clientHeight`); fix the named slide `index` by  
   **reducing content**, not shrinking fonts. Also re-render if `cover_no_image` is true  
   (the cover has no real image; generate a hero, unless the deck is intentionally image-free  
   per step 6), or if `broken_images` is non-empty (an `<img>` whose src is not image bytes;  
   embed the generated file as a `data:image` URI, not the generate-image tool's JSON result).  
   These signals are more reliable than reading the PNGs blind.

   When `pdf` is in `output_format`, `validate_pdf.sh` verifies PDF integrity, parses page  
   count, checks `<img>` and CSS `url(...)` data-URI embedding, checks image-heavy PDF size,  
   and rasterizes the actual PDF pages to `.src/validate/page-*.png` with `pdftoppm`. If `pptx`  
   is also in `output_format`, build the PPTX from those PDF-derived PNGs.

9. **Eyeball.** PNG filenames match `page-*.png`; do not assume a specific padding style. After
   the render report passes (and after `validate_pdf.sh` passes when a PDF is requested),
   **read every generated PNG with the `read` tool** and verify: rendered page count equals the
   resolved slide count; the palette and fonts are visibly applied; at least 3 distinct layouts
   when 5 or more slides; the cover establishes the visual language; images render and match
   their claim; heroes are legible; sufficient contrast; no missing images, blank slides,
   clipped or unreadable text, or repeated weak layouts; charts render correctly.

10. **Export and promote.** Promote each requested format to the slug root; files not in
   `output_format` stay under `.src/`.
   - `pptx`: build the deck from the validated PNGs with the bundled `build_pptx.py`. It
     requires `python-pptx`; if the import is missing, install it once with
     `python3 -m pip install --break-system-packages python-pptx` (PEP 668 systems require the
     flag; `-m pip` targets the same interpreter the script runs under). Then run and verify
     (substitute the real slug and title; do not paste literal `<artifact-slug>`):

     ```sh
     SLUG="<artifact-slug>"
     TITLE="<artifact-title>"
     # `project_dir` comes from your build task, and is not always under
     # `your_files`. Pass it to the script so the deck lands with its source.
     # `project_dir` comes from your build task. Write its leading `~/` as
     # `$JARVIS_HOME/`: the shell leaves a tilde literal inside quotes, so
     # `"~/workspace/..."` builds into a directory literally named `~`.
     DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
     "/opt/hatch/skills/artifacts/scripts/build_pptx.py" "$SLUG" "$TITLE" --project-dir "$DIR" || { echo "PPTX build failed" >&2; exit 1; }
     unzip -l "$DIR/$SLUG.pptx" | grep -q "ppt/media/" || { echo "PPTX has no embedded slide images" >&2; exit 1; }
     unzip -p "$DIR/$SLUG.pptx" docProps/core.xml | grep -qi "<dc:title>[^<]" || { echo "PPTX title metadata is empty" >&2; exit 1; }
     ```

`build_pptx.py <slug> [title]` reads the validated `.src/validate/page-*.png`, sizes each  
     slide to the PNG aspect ratio (full-bleed, no distortion), embeds one image per slide,  
     sets the deck title, and writes `<slug>.pptx` at the slug root. The image-based PPTX has  
     no editable text or shapes; each slide's title rides its speaker notes as best-effort  
     accessibility text.
   - `pdf`: copy the validated `.src/<artifact-slug>.pdf` to `<artifact-slug>.pdf` at the slug
     root.
   - `html`, only when `html` is in `output_format`: copy the **assembled** `.src/index.html` to
     `<artifact-slug>.html` at the slug root (one self-contained file; it carries the theme's
     font bytes inline, so it renders in the branded face offline and fetches nothing when
     opened). Never promote the per-slide files:  
     `.src/slides/` is deck source, not a deliverable.

   **If `pptx` cannot be produced** (`python-pptx` will not install, or the build/verify checks  
   fail), do not silently substitute PDF or HTML for a default deck. Drop `pptx` only when  
   other formats were explicitly requested in `output_format` and continue with those requested  
   outputs. If a default `["pptx"]` deck cannot produce PPTX, report that PowerPoint export  
   failed and ask whether PDF or HTML is wanted instead.

11. **Write `project_dir/meta.json`** after every requested output has been verified at the
    slug root. Include entries in `outputs` only for files that both exist at the slug root and
    were explicitly requested by `output_format`; `primary_output` is the highest-priority
    produced requested file (`pptx > pdf > html`). `description` is a one-line summary of the
    deck. Only `title` and `description` are read by the runtime today; the remaining fields
    are informational bookkeeping.

Compute the dynamic fields in the same step that writes `meta.json` (after the final  
    validation render); do not reuse values cached from an earlier validation iteration, since  
    each run rewrites `.src/validate/`. Use the absolute `.src/validate/` path (set  
    `SRC="$JARVIS_HOME/<project_dir without its leading ~/>/.src"`) so the commands do not  
    depend on the current directory. **Use the command output, not the literal example values  
    below:**
    - `slide_count` = `ls "$SRC"/validate/page-*.png | wc -l`
    - `thumbnail` = the slug-root-relative path `.src/validate/<name>`, where `<name>` is the  
      first page PNG's filename: `ls "$SRC"/validate/page-*.png | sort | head -1 | xargs -n1 basename`.  
      Store it relative (e.g. `.src/validate/page-1.png`), matching the `outputs` paths, not  
      the absolute path the `ls` prints. Do not assume a specific padding style; use the actual  
      filename.

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

Add `{"kind": "pdf", "path": "<artifact-slug>.pdf"}` and/or  
    `{"kind": "html", "path": "<artifact-slug>.html"}` to `outputs` only when those formats were  
    explicitly requested and promoted to the slug root.

## Quality gate

A deck is not complete until it passes these checks:
- Slide count equals the resolved slide count (the exact target, or the midpoint of a supplied
  range).
- It has a clear narrative arc, not a stack of unrelated pages.
- It uses at least 3 distinct slide layouts when the resolved slide count is 5 or more.
- At most `floor(resolved slide count * 0.4)` slides are simple title-plus-bullets, where
  "title-plus-bullets" means a slide whose only non-title content is a single `<ul>` or `<ol>`.
- Every non-appendix slide has a visual anchor: image, chart, timeline, diagram, callout
  system, or strong typographic composition.
- If generated or sourced imagery was requested, attempted, or created, the slide files embed
  the selected images (`<img src="data:image...">` or CSS `url(data:image...)`) and the
  validation PNGs visibly show them. Any unused generated files in `.src/media/` are either
  deleted or documented in `deck_plan.md` with a reason they were rejected.
- The title slide establishes the deck's visual language immediately.
- Dense text has been rewritten, split, or removed instead of being shrunk until unreadable.
- The PPTX, when produced, is exported from the validated rendered slides. Do not build a
  direct native-shape PPTX.
- Data charts are palette-colored matplotlib; imagery follows step 6 (a cover hero plus at
  least 2 illustrative images, sourced or generated per their subject, or the documented
  fallback); every claim is grounded in the provided source.
- The deck exists as per-slide source under `.src/slides/` and the combined `.src/index.html`
  was produced from it by `assemble_deck.mjs` after the last edit, so the two agree.

If a check fails after 3 iterations, report the specific slide + failure and ask for direction
rather than shipping a clipped or off-theme deck.
