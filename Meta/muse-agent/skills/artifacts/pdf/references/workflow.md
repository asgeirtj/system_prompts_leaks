---
description: HTML-first PDF generation. Build the HTML source, render it with render_audit.mjs, and validate the output pages.
---

# PDF workflow

- PDF generation is HTML-first. Build a self-contained HTML source, render it to PDF with `render_audit.mjs`, a Playwright-driven render that also audits fonts and overflow, then validate before returning the link.

- The validation tools `pdfinfo`, `pdftoppm`, `pdftotext` and `fc-list` are preinstalled. The runtime note at the end of this file explains what `render_audit.mjs` depends on.

## Prepare sources and assets

- Write build sources under `project_dir/.src/`, and the final PDF at the `project_dir` root, named as the output contract requires.

- Embed every image asset as a `data:` URI, including CSS `background-image` URLs. Do not reference images over `http://`, `https://` or `file://`.

- Keep photos sharp at print resolution. The render gate fails an image with fewer pixels than its rendered width and flags one below twice its rendered width. Source large originals, especially for a cover or page-width hero, then compress what you embed (JPEG for photos) so the `data:` URI stays small.

- Use one accurate image per concept. Omit an image rather than reuse a mismatched one.

- Never disable TLS certificate verification to make a fetch succeed.

- Read the shared [chart guide](/opt/muse/assets/artifacts/references/charts.md) before plotting data. Read the shared [map guide](/opt/muse/assets/artifacts/references/maps.md) before showing real places or geographic data, and use `media.generate_image` only for decorative or fictional map art.

- Check completeness before rendering. If a table or schedule names N items, the body has N matching detail sections.

- Avoid emoji in PDF HTML, because many PDF font stacks render them as boxes.

- Use ASCII hyphens instead of uncommon dash code points such as U+2011, the non-breaking hyphen. The installed faces lack those glyphs and render boxes. En dashes in ranges render in Noto and Liberation, but confirm any unusual glyph in the page images rather than assuming it.

- Use locally installed fonts and verify a family with `fc-list` before naming it. `Noto Serif`, `Noto Sans`, `Liberation Serif` and `Liberation Sans` are reliable.

- `DejaVu` is not installed, so naming it silently renders Chromium's default face. Do not rely on Google Fonts imports or Microsoft fonts such as Arial, Calibri, Georgia or Times New Roman.

## Revise a PDF built here

- When the brief names an existing slug, the PDF is a render output, not the source. Recover `project_dir/.src/index.html`, make the change there and re-render through the same flow. A PDF the user supplied has no `.src/` and is a different job, covered in [working with existing PDFs](existing-pdfs.md).

- Read the existing HTML first and carry every section through the re-render unless the brief asks to drop it.

- Cutting is a normal edit. When the brief asks to shorten, trim an appendix or hit a page count, remove whole sections deliberately and carry the rest through unchanged. Content that disappears because the document was rewritten from memory is unrequested loss, not an edit.

- Never write a replacement document from scratch and never write a second PDF beside the original.

- If `ls -a` shows no `.src/` for that slug, say so and ask for direction. Rebuilding from the rendered PDF silently drops whatever the source held.

## Set up the HTML

- Create `project_dir/.src/media/` and write `project_dir/.src/index.html`.

- Include the DOCTYPE, `lang`, charset, viewport, a descriptive `<title>` and a single print-focused `<style>` block.

- Apply the user's styling direction from the verbatim request or the parent conversation. Map each requested font to an installed local family before using it in CSS.

- Start from this baseline print CSS and adapt only what you need:

```css
@page { size: A4; margin: 0; }
* { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
body { margin: 0; font-family: 'Liberation Sans', 'Noto Sans', sans-serif; }
.page { min-height: 297mm; padding: 2cm; }  /* Letter: min-height: 11in */
.card, section, figure, table { break-inside: avoid; page-break-inside: avoid; }
img { display: block; width: 100%; max-width: 100%; height: auto; max-height: 8cm; object-fit: contain; }
.card, section { display: flow-root; }
```

- Keep `object-fit: contain` for charts, maps, diagrams and screenshots. With a `max-height`, `cover` crops the image to fill its box and silently cuts off axes, labels, legends and outer data points.

- The render report and `validate_pdf.sh` still pass on a cropped image, because it does not overflow its box. Use `cover` only on a decorative photo you mean to crop.

- Avoid full-bleed covers. Bleeding a photo to the page edge stretches small sources, crops content and leaves unintended margins. Default to an in-page hero, and go full-bleed only when the design calls for it and the source's pixels cover the page box.

## Render and audit

```sh
FILE="<the PDF's file name, as the output contract names it>"
# Your build task names `project_dir`. Use it. A goal's document is built under
# that goal's `files/` directory, so a hardcoded `your_files` path writes the
# PDF where nothing reads it.
# Write the leading `~/` of `project_dir` as `$JARVIS_HOME/`: the shell leaves
# a tilde literal inside quotes, so `"~/workspace/..."` builds into a directory
# literally named `~`.
DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
bun run "/opt/muse/assets/artifacts/scripts/render_audit.mjs" \
  --html "$DIR/.src/index.html" \
  --pdf "$DIR/$FILE" \
  --page-selector ".page" \
  --fonts "Liberation Sans:400,Liberation Sans:700" \
  --require-geometry --require-text-floor --require-image-resolution --hermetic --gate \
  --report-out "$DIR/.src/render_report.json"
```

- `render_audit.mjs` loads the HTML in Chromium and honors the CSS `@page { size: ... }` rule (`preferCSSPageSize`) instead of Chromium's default page size. It writes the PDF and prints one JSON report to stdout. `--report-out` writes the same report to `.src/render_report.json`, so the verdict survives a backgrounded command.

- Pass `--fonts "Family:weight,..."` for every face the design relies on. Pass a `--page-selector` that matches your page wrapper for the overflow checks. The default is `.slide-container, .page, section.slide`.

- Diagnostics go to stderr. The process exits non-zero on a hard failure such as missing Chromium, an unresolvable Playwright or a failed page load.

- The JSON report has this shape:

```json
{ "ok": true, "pdf": "<abs>", "pages": 0, "pngs": [],
  "fonts": { "missing": [], "unused": [], "used": ["..."], "expected": ["..."] },
  "overflow": [ {"index": 0, "overflowY_px": 42, "overflowX_px": 0} ] }
```

## Gate on the report

- Treat the render as failed and re-edit `.src/index.html` when any of these holds:
  - `ok` is false.
  - `fonts.missing` is non-empty. That face did not resolve, and `fonts.used` names what Chromium actually rasterized. Fix the family spelling or choose an installed local face.
  - `overflow` is non-empty. Content spills past a page box, so fix the layout of the element at that `index`. This per-element check is more reliable than reading the page images.

- Fix overflow by letting content flow onto another page, never by crushing the design or cutting content the brief didn't ask to cut.

- Keep body text at 10pt or larger and nothing anywhere below 8pt. Keep at least 12mm between content and the paper edge through the page wrapper's padding, as in the baseline CSS, rather than `@page` margins. Leave visible gaps of 3mm or more between blocks.

- `--require-text-floor` enforces the type sizes, so text below 8pt fails the gate.

- A body that sits mostly below 10pt raises only an advisory, so a passing gate does not clear you. Treat that advisory as your signal to restore the size, and keep the small size only when the brief asked for a compact document.

- When the brief fixes the page count, the content budget gives way. Drop the weakest items or tighten wording until the pages fit at full size.

- `--require-geometry --gate` adds `geometry`. It reads the page count and paper size back from the written PDF and reconciles them with the page wrappers measured in the DOM under print media. The PDF cannot tell which wrapper became which sheet, so detecting a split page takes both.

- Fix every entry in `failures`, which covers a page element taller than the paper and an authored page count that differs from the produced one. The page wrapper must fit the paper it declares (`min-height: 297mm` for A4, `11in` for Letter) with `box-sizing: border-box`, so padding sits inside that height.

- `advisories` never gate. They cover geometry that could not be measured, markup that reached the page as visible text and a body mostly below the 10pt target. Leave the markup advisory alone in a document that quotes code or markup on purpose, and resolve the body advisory as described above.

## Validate after every render

- This loop is mandatory. When a check fails, edit `.src/index.html`, re-run the render and audit, and validate again.

- Stop after three iterations, then report the specific failure and ask for direction. Never return the artifact link until validation passes.

```sh
PDF="$DIR/$FILE"
HTML="$DIR/.src/index.html"
OUT="$DIR/.src/validate"
"/opt/muse/assets/artifacts/scripts/validate_pdf.sh" "$PDF" "$HTML" "$OUT"
```

- `validate_pdf.sh` checks PDF integrity, page metadata and the data-URI embedding of `<img>` and CSS `url(...)` assets through an HTML parser. It then rasterizes every page to `page-*.png` in `.src/validate/` with `pdftoppm`. Those images come from the actual PDF bytes, so they are the visual review source.

## Read every page

- After the render report and `validate_pdf.sh` both pass, read every PNG in `project_dir/.src/validate/` with `muse.read` before responding. Check that:
  - images render and match the content beside them
  - text is legible, not clipped, and has readable margins
  - spacing stays consistent across page breaks and sections keep visible breathing room
  - sections, tables and figures do not split awkwardly across pages
  - headers, footers and page numbers appear where this kind of document expects them
  - fonts look right and no character falls back to a missing-glyph box
  - there are no accidental blank pages or large gaps, and covers bleed only when intended
  - citations and references read as human text with no tool tokens or placeholder strings

- Reject any page showing a blank or white image box, text overlapping another element or text running off the page. Fix the source and re-render. A missing image is a failed build, and the render report will not always catch it, because an empty box does not overflow its container.

- The page images carry the prose too, so run the read-back from the shared [prose guide](/opt/muse/assets/artifacts/references/prose.md) in the same pass. A page that renders perfectly but reads badly fails validation. Prose fixes go back into `.src/index.html` and through the same loop as a layout fix.

- Common fixes:
  - Remove trailing page breaks that leave a blank final page.
  - Raise an image's `max-height`, or drop it, when a chart or map renders too small to read.
  - Use `display: flow-root` or a wrapper to stop margins collapsing.
  - Move cover images to CSS backgrounds.
  - Replace missing fonts with installed local families.
  - When content is missing from the edges of an image rather than the image splitting, `object-fit: cover` is cropping it, not `max-height`.

## Check content for the document type

- Apply only the checks that match the artifact:
  - Reports and whitepapers include an executive summary, page numbers, readable charts and tables with headers.
  - Data exports state the data source, extraction time, query or filter context and record counts. Spot-check source values against the PDF.
  - Invoices and receipts carry the required invoice fields, two-decimal currency formatting and correct subtotal, tax and total arithmetic.
  - Travel guides give complete addresses, hours, cost, nearest transit and phone numbers as selectable text.
  - Resumes keep text selectable and in logical reading order. An ATS-focused resume uses a single column.
  - Manuals include a version or date, a table of contents, figure captions and code blocks that preserve indentation.

## Runtime dependency of the renderer

- `render_audit.mjs` imports the Playwright bundled with the web artifact runtime at `/opt/muse/assets/spaces/ts-runtime/dist/node_modules/playwright`. It launches the Chromium provisioned in the Muse image at `/opt/meta-chromium/chrome` when that path exists.

- Without that Chromium it may use a Playwright-cached Chromium that is already present, but it never installs one at runtime. When resolution fails it exits non-zero with a JSON `{ok:false,error}` naming the missing piece.
