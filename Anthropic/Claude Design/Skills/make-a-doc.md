# Make a doc

Create a document (resume, one-pager, memo, letter, report, guide,
paper). First decide which of two shapes the user wants — they export
completely differently:

**Flowing pages** — text that pours onto standard sheets (Letter/A4)
and breaks wherever needed: reports, memos, letters, papers, guides.
START by calling `copy_starter_component` with
`kind: "doc_page.js"`, then write the whole document as normal
flowing HTML inside `<doc-page size="letter" margin="0.75in">`.
The component owns the sheet, the desk background, and all print
geometry — do NOT write your own `@page` rule, body background,
page-card divs, `break-after: page` fake sheets, or
`break-inside: avoid` on items inside multi-column grids (a grid only
breaks between rows, so a kept row that doesn't fit leaves a blank band).

Print rules for flowing pages: multi-column text uses CSS columns
(`column-count` + `column-gap`; `column-span: all` on a heading
that spans; `hyphens: auto` in narrow columns — it needs `lang`
on the html element), never side-by-side
flex/grid columns — only real CSS columns flow and break across pages.
Use `break-before: page` on anything that must start a new page (a
chapter, an appendix); add custom kept-together blocks (callouts, stat
tiles, cards) to a `break-inside: avoid` rule and keep each shorter
than a page — the component already keeps headings with their content,
keeps figures/code/table rows whole, and suppresses orphans and widows
(extend `orphans: 3; widows: 3` to custom text blocks). Long tables
get a `<thead>` so the header repeats on every page. No
`position: fixed`/`sticky` and no viewport units in content —
fixed elements stamp every printed page (running headers/footers go in
the component's slots) and `100vh` mis-sizes at print.

**Fixed sheet** — a design that must fill exactly one page of fixed
dimensions: poster, infographic, social graphic, certificate. No
starter component — build it at its true pixel size with an explicit
px `width` (and `height` if fixed) on the top-level element; the
export sizes the PDF page to it automatically. Do not write any
`@page` rule for it.

Styling (both shapes): body type 14–16px with generous line-height
(1.55–1.7); clear heading hierarchy; restrained palette. Tables get a
header row and hairline borders; figures and code blocks each carry a
short caption. Open with the document's own h1 as the first body
element (use any header-shaped first line of pasted content as that h1
rather than rendering it as a separate masthead).
