---
name: save-as-pdf
description: "Print-ready PDF export"
user-invocable: true
---

# Save as PDF

Reformat the current HTML design into a paginated, paper-ready PDF. The "Instant" export already gives the user a PDF at the design's native pixel size — this path is for when they want real pages.

**Do NOT rasterize the page into a PDF.** Never use jsPDF, html2canvas, dom-to-image, or any other canvas/screenshot-to-PDF approach — they produce blurry, non-selectable, oversized output, and do not generate a PDF binary yourself. PDF export is print-based: a print-ready copy is handed to `show_pdf_export_dialog` and the browser's own print engine renders crisp, selectable, text-based pages. The only supported way to make a copy print-ready is a component that owns its print geometry — the doc_page starter for documents, or a source already built on `<deck-stage>` or `<doc-page>`. Do not hand-author `@page` rules or print CSS resets, and NEVER declare `<meta name="omelette-owns-print">` yourself — the starters announce print ownership at runtime, and a hand-authored meta tells the platform to trust print CSS you would then have to hand-write and maintain. Hand-rolled print CSS behind that meta is the legacy path; the doc_page starter replaces it everywhere it is available.

### Steps

1. **Read the current HTML design file** to understand its structure and content. Re-read it on every PDF request, even if you read it or made a print copy earlier in this conversation — the user may have changed content or tweak values (the Tweaks panel writes into the source file) since then. Note the `[version: v<N>]` token in the read result's header — step 2's provenance stamp needs it, and only a version read in THIS request is valid to stamp.

2. **Write the print copy, stamped with its provenance.** Always write it fresh from the source you just read — an existing `-print` copy from an earlier request is a stale snapshot, and reusing or only partially updating it ships outdated values to the PDF. The print file path is the source path with `-print` inserted before the extension — same directory, same basename. If the source is `slides/deck.html`, write `slides/deck-print.html`; if the source is `web/index.html`, write `web/index-print.html`. **Do NOT** use the deck title or project name as the filename, and **do NOT** write to the project root if the source is in a subdirectory — any change in directory depth breaks every relative URL (`@font-face` `src: url(...)`, `<img src>`, `<link href>`, CSS `background: url(...)`) and the print tab shows missing images and system-font fallbacks.

   **Stamp the copy's provenance (required whenever the read header shows a version — every arm of this step).** Include this tag in the copy's `<head>`, carrying the version from step 1's read header and the source's project-relative path (for a read header of `[File: designs/report.html] [version: v172]`):
   ```html
   <meta name="omelette-print-source" content="v172 designs/report.html">
   ```
   `show_pdf_export_dialog` REFUSES a copy whose stamp is missing or no longer matches the source's current version — that is what makes a stale copy un-exportable. If it refuses with a stale-copy error, go back to step 1 (re-read the source) and rewrite the copy fresh; never just add or edit the stamp on an existing copy. If the read header shows no `[version: ...]` token, the project isn't versioned — omit the stamp; the export tool skips the freshness check there.

   **If the source is already built on `<deck-stage>` or `<doc-page>`, the copy is the source plus content-level print rules only.** Both components own their print geometry — never add an `@page` rule or reflow their layout. For `<deck-stage>` decks, set `data-deck-active` on **every** direct-child slide (not just the current one) so `[data-deck-active]`-keyed entrance styles resolve on every page — each slide is already one page. For `<doc-page>` documents there is nothing structural to do.

   **Otherwise, rebuild the content on the doc_page starter.** Call `copy_starter_component` with `kind: "doc_page.js"` (once per project — the component file persists), then decide the pagination UP FRONT: a FLOWING document (pour the content into `<doc-page margin="0.75in">` as one normal HTML flow; the print engine paginates it — the default for reports, memos, letters, long-form), or EXPLICIT pagination (one `<section class="page">` child per page — when the user asks for a page count or the design implies one: a one-page resume, a two-sided flier, a certificate, a brochure). If in doubt, ask the user. Keep the design's typography, colors, and imagery intact either way. For FLOWING documents the component pins no paper size — the print engine paginates onto the user's real paper. Explicitly paginated pages print at a FIXED page box with overflow hidden — letter by default (set size="a4" for a clearly metric user), the user's chosen paper when they export — and content that misses the box is clipped, never reflowed: design each page to FILL the page box and fit letter and A4 alike without overlap (no viewport units — they track the window, not the page). `orientation="landscape"` for landscape sheets. The component owns the sheet, the pagination, and all print geometry — do NOT write your own `@page` rule, print-CSS reset, page-card divs, hard-coded paper dimensions, or `break-after: page` fake sheets. In flowing documents use `break-before: page` only where a section genuinely starts a new chapter; long tables get a `<thead>` so the header repeats on every page.

   **A fixed-canvas design (poster, social graphic, infographic) also goes through the doc_page rebuild, with one decision: the page.** Print it at its true dimensions — `<doc-page width="18in" height="24in" margin="0">`, the page IS the design (use explicit width/height ONLY when the user gives or implies a real physical size) — or scale it onto standard paper — `<doc-page size="letter" content-width="960px" content-height="1440px">` (`size="a4"` when the user is clearly metric), where the content lays out at its authored size and the component scales it to fit that sheet's printable area. Scaled-fit is the ONE place a named size still matters: the component must compute the fit against a known sheet (the export dialog re-fits to the user's actual paper choice at print time where available). When the user's intent between the two isn't clear from their request, ask — in plain terms (print it poster-sized, or fit it onto regular paper?) — before exporting. Never hand-scale with your own CSS transforms; the component owns the scaling either way.

   In every copy, add the color-adjust rule so backgrounds and colors match the preview — do NOT strip backgrounds from the design:
   ```css
   * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
   ```

   **Jump animations to their end state.** Do NOT use `animation: none` (that reverts fade-ins to the hidden base). Instead freeze every animation at its final frame and disable transitions:
   ```css
   * { animation-delay: -99s !important; animation-duration: .001s !important;
       animation-iteration-count: 1 !important; animation-fill-mode: both !important;
       animation-play-state: running !important; transition-duration: 0s !important; }
   ```

3. **Test the file** by showing it with `show_html`, then make sure there are no JS errors. No need to screenshot unless asked.

4. **Call the `show_pdf_export_dialog` tool** with the project-relative path to the print-ready file. The print-firing code is injected into the print copy automatically when you call this tool — do NOT write an auto-print or `window.print()` script yourself. Unless the export started from the user's own Export click, the tool does not open anything itself: it presents an export dialog, and the user's **Continue to export** click there is what opens the print view. The tool result says which happened — when it says the dialog is waiting on the user, the print view has NOT opened; say so plainly and never claim it has. The tool fails with a reason if the file (and its print source) is not print-based — the doc_page rebuild from step 2 is exactly what keeps the copy eligible.

### Important Notes

- The goal is a file that prints cleanly on real pages — the doc_page component owns the pagination; your job is the content
- Maintain visual fidelity — keep the design's typography, colors, and imagery intact
- For `<deck-stage>` decks, each slide stays on its own page; `<doc-page>` documents flow and paginate themselves
- For prompt-driven exports, `show_pdf_export_dialog` waits on the user: the export dialog's **Continue to export** click opens the print view, and until then nothing has opened — report the state the tool result describes, not the state you expect
- The `-print.html` is plumbing for the print tab, not a deliverable — `show_pdf_export_dialog` is the only delivery step. Do NOT `present_fs_item_for_download` it; its relative asset paths only resolve via the project file server and break when opened standalone.
