# Save as PDF

Reformat the current HTML design into a paginated, paper-ready PDF. The "Instant" export already gives the user a PDF at the design's native pixel size — this path is for when they want real pages.

**Do NOT rasterize the page into a PDF.** Never use jsPDF, html2canvas, dom-to-image, or any other canvas/screenshot-to-PDF approach — they produce blurry, non-selectable, oversized output, and do not generate a PDF binary yourself. PDF export is print-based: a print-ready copy is handed to `show_pdf_export_dialog` and the browser's own print engine renders crisp, selectable, text-based pages. The only supported way to make a copy print-ready is a component that owns its print geometry — the doc_page starter for documents, or a source already built on `<deck-stage>` or `<doc-page>`. Do not hand-author `@page` rules or print CSS resets.

## Steps

1. **Read the current HTML design file** to understand its structure and content. Re-read it on every PDF request, even if you read it or made a print copy earlier in this conversation — the user may have changed content or tweak values (the Tweaks panel writes into the source file) since then.

2. **Write the print copy.** Always write it fresh from the source you just read — an existing `-print` copy from an earlier request is a stale snapshot, and reusing or only partially updating it ships outdated values to the PDF. The print file path is the source path with `-print` inserted before the extension — same directory, same basename. If the source is `slides/deck.html`, write `slides/deck-print.html`; if the source is `web/index.html`, write `web/index-print.html`. **Do NOT** use the deck title or project name as the filename, and **do NOT** write to the project root if the source is in a subdirectory — any change in directory depth breaks every relative URL (`@font-face` `src: url(...)`, `<img src>`, `<link href>`, CSS `background: url(...)`) and the print tab shows missing images and system-font fallbacks.

   **If the source is already built on `<deck-stage>` or `<doc-page>`, the copy is the source plus content-level print rules only.** Both components own their print geometry — never add an `@page` rule or reflow their layout. For `<deck-stage>` decks, set `data-deck-active` on **every** direct-child slide (not just the current one) so `[data-deck-active]`-keyed entrance styles resolve on every page — each slide is already one page. For `<doc-page>` documents there is nothing structural to do.

   **Otherwise, rebuild the content as a paged document on the doc_page starter.** Call `copy_starter_component` with `kind: "doc_page.js"` (once per project — the component file persists), then write the print copy as a `<doc-page size="letter" margin="0.75in">` document (`size="a4"` when the user is clearly non-US): pour the source's content into it as normal flowing HTML, keeping the design's typography, colors, and imagery intact. The component owns the sheet, the pagination, and all print geometry — do NOT write your own `@page` rule, print-CSS reset, page-card divs, or `break-after: page` fake sheets. Use `break-before: page` only where a section genuinely starts a new chapter; long tables get a `<thead>` so the header repeats on every page.

   **A fixed-canvas design (poster, social graphic, infographic) also goes through the doc_page rebuild, with one decision: the page.** Print it at its true dimensions — `<doc-page width="18in" height="24in" margin="0">`, the page IS the design — or scale it onto standard paper — `<doc-page size="letter" content-width="960px" content-height="1440px">`, where the content lays out at its authored size and the component scales it to fit the printable area. When the user's intent between the two isn't clear from their request, ask — in plain terms (print it poster-sized, or fit it onto letter paper?) — before exporting. Never hand-scale with your own CSS transforms; the component owns the scaling either way.

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

## Important Notes

- The goal is a file that prints cleanly on real pages — the doc_page component owns the pagination; your job is the content
- Maintain visual fidelity — keep the design's typography, colors, and imagery intact
- For `<deck-stage>` decks, each slide stays on its own page; `<doc-page>` documents flow and paginate themselves
- For prompt-driven exports, `show_pdf_export_dialog` waits on the user: the export dialog's **Continue to export** click opens the print view, and until then nothing has opened — report the state the tool result describes, not the state you expect
- The `-print.html` is plumbing for the print tab, not a deliverable — `show_pdf_export_dialog` is the only delivery step. Do NOT `present_fs_item_for_download` it; its relative asset paths only resolve via the project file server and break when opened standalone.
