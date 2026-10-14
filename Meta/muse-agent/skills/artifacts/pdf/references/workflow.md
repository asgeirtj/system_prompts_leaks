---
description: HTML-first PDF generation. Build the HTML source, render it with render_audit.mjs, and validate the output pages.
---

# PDF artifacts

PDF generation is HTML-first. Build a self-contained HTML source, render it to PDF with
`render_audit.mjs` (a Playwright-driven render that also runs a font + overflow audit), then
validate before returning the link. Required validation tools (`pdfinfo`, `pdftoppm`, `pdftotext`, `fc-list`)
are preinstalled. `render_audit.mjs` depends on the Playwright runtime bundled with the
web Artifact runtime assets and uses the preinstalled Chromium at `/opt/meta-chromium/chrome`
when present (see the note at the end of this file).

**Core rules:**
- Write build sources under `project_dir/.src/` and the final PDF at `project_dir/<artifact-slug>.pdf`. Keep `.src/` after rendering.
- Embed image assets as `data:` URIs, including CSS `background-image` URLs. Do not use external `http://`, `https://`, or `file://` image references.
- Photos must stay sharp at print resolution. The render gate measures this: an image with fewer pixels than its rendered width fails, and one below twice its rendered width gets an advisory. Source large (a cover or page-width hero wants a high-resolution original), then compress what you embed (JPEG for photos) so the `data:` URI stays small.
- Whenever `media.generate_image` is used for artifact media, including PDF images, decorative/fictional map artwork, or any other illustrative asset, set the `output_dir` field to `artifact_media_dir` so generated files stay under `.src/media/` before embedding.
- Use one accurate image per concept. Omit an image rather than reusing a mismatched one.
- Never disable TLS certificate verification to make a fetch succeed.
- When the document plots data, read `/opt/hatch/skills/artifacts/references/charts.md` first: it owns where the numbers come from, how to render a chart for a PDF, and the encoding rules that apply everywhere.
- For maps of real places or geographic data, read `/opt/hatch/skills/artifacts/references/maps.md` first; it decides how a PDF's map is rendered and stored. `media.generate_image` is only for decorative or fictional map art.
- Check content completeness before rendering: if a table or schedule names N items, the body should have N matching detail sections.
- Avoid emojis in PDF HTML; many PDF font stacks render them as boxes.
- Use ASCII hyphens instead of uncommon dash code points (U+2011 non-breaking hyphen and kin): the installed faces lack their glyphs and render boxes. En dashes in ranges are fine in Noto and Liberation, but any unusual glyph must be confirmed rendered in the PNG pass, never assumed.
- Use locally installed fonts. Verify with `fc-list` before naming one; reliable choices are `Noto Serif`, `Noto Sans`, `Liberation Serif`, and `Liberation Sans`. `DejaVu` is NOT installed on the VM image, so naming it silently renders in Chromium's default face instead. Do not rely on Google Fonts imports or Microsoft fonts like Arial, Calibri, Georgia, or Times New Roman.

**Revising a PDF this workspace built (the brief names an existing slug):** the PDF is a render
output, not the source. Recover `project_dir/.src/index.html`, make the change there, and
re-render through the same flow below. (A PDF the *user* supplied has no `.src/` and is a
different job: see `existing-pdfs.md`.)
Read the existing HTML first, and carry every section the current PDF has
through the re-render unless the brief asks to drop it. Cutting is a normal edit: when the brief
asks to shorten, trim an appendix, or hit a page count, remove whole sections deliberately and
carry the survivors through unchanged. What is not an edit is *unrequested* loss — content that
disappears because the document was rewritten from memory rather than modified. Never author a
replacement document from scratch and never write a second PDF beside the original. If `.src/` is
missing for that slug, say so and ask for direction — rebuilding from the rendered PDF silently
drops whatever the source held.

**HTML setup:**
1. Create `project_dir/.src/media/` and write `project_dir/.src/index.html`.
2. Include DOCTYPE, `lang`, charset, viewport, a descriptive `<title>`, and a single print-focused `<style>` block.
3. Apply the user's styling direction from the verbatim request or parent conversation when provided. Map requested fonts to an installed local family before using them in CSS.
4. Use this baseline print CSS, then adapt only as needed:

   ```css
   @page { size: A4; margin: 0; }
   * { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
   body { margin: 0; font-family: 'Liberation Sans', 'Noto Sans', sans-serif; }
   .page { min-height: 297mm; padding: 2cm; }  /* Letter: min-height: 11in */
   .card, section, figure, table { break-inside: avoid; page-break-inside: avoid; }
   img { display: block; width: 100%; max-width: 100%; height: auto; max-height: 8cm; object-fit: contain; }
   .card, section { display: flow-root; }
   ```

   Keep `object-fit: contain` for charts, maps, diagrams, and screenshots. Combined with a `max-height`, `cover` crops the image to fill the box and silently cuts off content at the edges: axes, labels, legends, and outer data points disappear while the render report and `validate_pdf.sh` still pass, because a cropped image does not overflow its box. Reach for `cover` only on a decorative photo you mean to crop.

   Avoid full-bleed covers: bleeding a photo to the page edge stretches small sources, crops content, and leaves unintended margins. Default to an in-page hero, and go full-bleed only when the design calls for it and the source's pixels cover the page box.

**Render + audit:**

```sh
SLUG="<artifact-slug>"
# Your build task names `project_dir`. Use it. A goal's document is built under
# that goal's `files/` directory, so a hardcoded `your_files` path writes the
# PDF where nothing reads it.
# `project_dir` comes from your build task. Write its leading `~/` as
# `$JARVIS_HOME/`: the shell leaves a tilde literal inside quotes, so
# `"~/workspace/..."` builds into a directory literally named `~`.
DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
bun run "/opt/hatch/skills/artifacts/scripts/render_audit.mjs" \
  --html "$DIR/.src/index.html" \
  --pdf "$DIR/$SLUG.pdf" \
  --page-selector ".page" \
  --fonts "Liberation Sans:400,Liberation Sans:700" \
  --require-geometry --require-text-floor --require-image-resolution --hermetic --gate
```

`render_audit.mjs` loads the HTML in Chromium, honors the `@page { size: ... }` CSS rule
(`preferCSSPageSize`) instead of Chromium's default page size, writes the PDF, and prints a
single JSON report to stdout. Pass `--fonts "Family:weight,..."` for every webfont/face the
design relies on, and `--page-selector` matching your page wrapper (default
`.slide-container, .page, section.slide`) for overflow checks. Diagnostics go to stderr; the
process exits non-zero on a hard failure (missing Chromium, unresolvable Playwright, failed load).

The JSON report has this shape:

```json
{ "ok": true, "pdf": "<abs>", "pages": 0, "pngs": [],
  "fonts": { "missing": [], "unused": [], "used": ["..."], "expected": ["..."] },
  "overflow": [ {"index": 0, "overflowY_px": 42, "overflowX_px": 0} ] }
```

**Gate on the report:** treat the render as failed and re-edit `.src/index.html` if `ok` is
false, if `fonts.missing` is non-empty (that face did not resolve under the requested policy;
`fonts.used` names what Chromium rasterized — fix the family spelling or choose an installed
local face), or if `overflow` is non-empty (content spills past a page box; reduce content or fix
the layout for the named element `index`). This
per-element overflow detection is more reliable than eyeballing the PNGs.

Fix overflow by cutting content or letting it flow to another page, never by crushing the
design. Keep body text at 10pt or larger, nothing anywhere below 8pt, at least 12mm between
content and the paper edge (the page wrapper's padding, per the baseline CSS; do not add
`@page` margins for this), and visible gaps between blocks (3mm or more). `--require-text-floor` enforces
the type half of this: text below 8pt is a gate failure. A body that sits mostly below
10pt only raises an advisory, so the gate passing does not clear you: treat that advisory
as your own re-edit signal, restore the size and cut content, and leave it standing only
when the brief itself asked for a compact document. When the brief fixes the page count,
the content budget is what gives: drop the weakest items or tighten wording until the
page fits at full size.

`--require-geometry --gate` adds `geometry`: the page count and paper size read back from the
PDF that was written, reconciled against the page wrappers measured in the DOM under print media.
The PDF does not know which wrapper became which sheet, so it takes both to see a page split.

`failures` must be fixed: a page element taller than the paper, or an authored page count that
does not match the produced page count. The page wrapper has to fit the paper it declares
(`min-height: 297mm` for A4, `11in` for Letter) with `box-sizing: border-box`, so padding sits
inside that height instead of adding to it.

`advisories` never gate: geometry that could not be measured, markup that reached the page as
visible text, and a body that sits mostly below the 10pt target. Leave the markup one alone in a
document that quotes code or markup on purpose; resolve the body one as the floor paragraph above
says, keeping it only for a deliberately compact brief.

**Validation loop (mandatory):** Run this after every render. If a check fails, edit
`.src/index.html`, re-run the render+audit above, and re-validate. Maximum 3 iterations; after
that, report the specific failure and ask for direction. Never return the artifact link until
validation passes.

```sh
PDF="$DIR/$SLUG.pdf"
HTML="$DIR/.src/index.html"
OUT="$DIR/.src/validate"
"/opt/hatch/skills/artifacts/scripts/validate_pdf.sh" "$PDF" "$HTML" "$OUT"
```

`validate_pdf.sh` checks PDF integrity, page metadata, and `<img>` and
CSS `url(...)` data-URI embedding via an HTML parser, then rasterizes every PDF page to
`page-*.png` in `.src/validate/` with `pdftoppm`. These PNGs are the visual review source
because they come from the actual PDF bytes.

After both the render report and `validate_pdf.sh` pass, **read every PNG from
`project_dir/.src/validate/` with the `read` tool before responding** (the build task names
`project_dir`; it is not always under `your_files`) and verify: images render, text
is legible and not clipped, text has readable margins, spacing is consistent across page
breaks, sections keep visible breathing room rather than running wall-to-wall,
sections/tables/figures do not split awkwardly across pages, headers/footers/page
numbers appear where expected for the artifact type, fonts look correct and do not fall back to
missing-glyph boxes, no accidental blank pages or giant gaps exist, covers are full-bleed only
when intended, images/charts match the adjacent content, and citations and references read as
human text with no tool tokens or placeholder strings left behind.

Reject any PNG showing a blank or white image box, text overlapping another element, or text
running off the page: fix the source and re-render. A missing image is a failed build, not a
cosmetic issue, and the render report will not always catch one, because an empty box does not
overflow its container.

Those PNGs carry the prose too, so run the read-back from
`/opt/hatch/skills/artifacts/references/prose.md` in this same pass, and
treat a page that renders perfectly but reads badly as a failed validation. Prose fixes go back
into `.src/index.html` and through the same render-and-revalidate loop as a layout fix.

Common fixes: remove trailing page breaks for blank final pages, raise image `max-height` (or drop
it) when a chart or map renders too small to read, use `display: flow-root` or wrappers for margin
collapse, switch cover images to CSS backgrounds, and replace missing fonts with installed local
families. If content is missing from the edges of an image rather than the image being split, the
cause is `object-fit: cover` cropping it, not `max-height`.

## Content checks by artifact type

Use only the checks that match the artifact:
- **Reports and whitepapers:** Include an executive summary, page numbers, readable charts, and tables with headers.
- **Data exports:** Include data source, extraction time, query/filter context, and record counts. Spot-check source values against the PDF.
- **Invoices and receipts:** Verify required invoice fields, two-decimal currency formatting, and subtotal/tax/total math.
- **Travel guides:** Include complete addresses, hours, cost, nearest transit, and phone numbers as selectable text.
- **Resumes:** Keep text selectable and in logical reading order. Use a single-column layout for ATS-focused resumes.
- **Manuals:** Include version/date, table of contents, figure captions, and code blocks that preserve indentation.

> **Runtime dependency note (`render_audit.mjs`):** the render+audit script imports the  
> Playwright bundled with the web Artifact runtime assets (staged at  
> `/opt/hatch/skills/spaces/ts-runtime/dist/node_modules/playwright`) and launches the Muse  
> image-provisioned Chromium at `/opt/meta-chromium/chrome` when present. If that image path is  
> missing, it may use an already-present Playwright cached Chromium, but it does not install  
> Chromium at runtime. If resolution fails the script exits non-zero with a JSON  
> `{ok:false,error}` naming the missing piece.
