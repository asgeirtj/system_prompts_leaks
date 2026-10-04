---
description: Resolving user-provided visual direction into the style plan for PDF artifacts.
---

# PDF Visual Guidance

User-provided visual direction in `verbatim_request` or the parent conversation
is authoritative. Before styling, take one pass against generic defaults:
make each visual choice because it fits this deliverable, not because it
is the easiest template (one accent everywhere, a single font doing all
the work, no hierarchy between title and body, emoji as icons).

- Resolve the document theme before authoring. Read `~/workspace/themes/` and
  its optional `_default.json`, whose `default` field names the preferred theme
  file without `.json`. If the request supplies a complete theme, use it. If it
  carries visual direction, match a saved theme or derive a fitting system
  from that direction. With no explicit direction, use the saved default
  when one exists; otherwise choose a distinctive system fitting the document.
  Do not save a newly derived system as a reusable theme unless the user asked.
- The resolved theme's `ui` block controls typography, color, spacing, shape,
  and hierarchy; its `visual` block controls generated or hero imagery.
- Map every requested font to an installed local family verified with
  `fc-list`. PDF rendering must not depend on Google Fonts or Microsoft fonts.
- Keep one consistent design system across every page: the same fonts, the
  same spacing scale, the same treatment for the same kind of element. A
  reader flicking through should not be able to tell where you stopped and
  started. Use readable contrast, deliberate whitespace, and a restrained
  hierarchy instead of generic cards or decorative filler. Whitespace is part
  of the system: under fit pressure, cut content, never the gaps.
- Design to the document's TYPE, not to a generic report template. A form, an
  invoice, a CV, a manual, an academic paper, a brochure, and an image gallery
  each have established conventions a reader expects; follow the one that fits
  the ask.
- Page background is one of those conventions: settle what this type of
  document usually sits on before you set one. Invoices, forms, and academic
  papers are normally plain white. Take that as the default and deviate only
  with a reason.
- Decorative accents answer to the same test: work out whether the genre
  usually carries decorative color before adding any. Invoices, forms, data
  tables, and academic papers normally have no colored top band or side
  stripe; their structure comes from typography and alignment, with thin
  neutral rules where needed. Reserve accent bands and stripes for genres
  where branding is the point.
- Use a standard page size in portrait with print-safe margins, unless the
  user asks otherwise. Keep anything load-bearing out of the outer margin.
- Use headings and bullets on dense pages, styled so the same level always
  looks the same. Leave them out where the page carries little information.
- Give every element on the page a reason to be there. A chart or diagram
  earns its place by carrying information the text cannot. Photos follow the
  image guidance in your build contract: documents about everyday life
  (travel, food, lifestyle) read as unfinished without real photos of the
  places and things they name, while dense data and utility documents read
  better image-free.
- Treat an empty-feeling area as a layout problem to solve, not a cue to add a
  card, a chip, or a stock illustration.
- Use full-bleed imagery only for an intentional cover. Practical reports,
  guides, manuals, and data-heavy documents use normal in-page images that do
  not compete with the content.
- Read `workflow.md` (beside this file) for HTML authoring, pagination,
  rendering, and visual validation mechanics. Saved-theme resolution for a
  document follows the `~/workspace/themes/` rule above; the presentation
  skill's StylePlan system is deck-only and does not apply here.

If a delivered PDF has a reported visual problem, re-render the affected pages
to PNG and read them before changing the source. Do not guess at layout or
styling defects without visual evidence.
