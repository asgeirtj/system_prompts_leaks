---
description: Resolving user-provided visual direction into the style plan for PDF artifacts.
---

# PDF visual guidance

- Follow the visual direction in `verbatim_request` and the parent conversation. It overrides every default below.

- Make each visual choice because it fits this document, not because it is the easiest template. Watch for the generic defaults: one accent color everywhere, a single font doing all the work, no difference between title and body, and emoji used as icons.

## Resolve the theme

- Resolve the document theme before authoring. Read `~/workspace/themes/` and its optional `_default.json`, whose `default` field names the preferred theme file without `.json`.

- If the request supplies a complete theme, use it. If it carries visual direction, match a saved theme or derive a fitting system from that direction. With no direction, use the saved default when one exists, otherwise choose a distinctive system that fits the document.

- The resolved theme's `ui` block controls typography, color, spacing, shape and hierarchy. Its `visual` block controls generated or hero imagery. The [theme guide](/opt/muse/skills/documents/pdf/references/theme.md) describes both blocks.

- Map every requested font to an installed local family verified with `fc-list`. PDF rendering must not depend on Google Fonts or Microsoft fonts.

- The presentation StylePlan system is for decks only and does not apply to a PDF.

## Keep one design system

- Use the same fonts, the same spacing scale and the same treatment for the same kind of element on every page. A reader flicking through should not be able to tell where you stopped and started.

- Use readable contrast, deliberate whitespace and a restrained hierarchy instead of generic cards or decorative filler. Whitespace is part of the system, so under fit pressure keep the gaps and fix overflow as the workflow says.

## Design for the document type

- Follow the conventions readers expect from the document's type rather than a generic report template. A form, an invoice, a CV, a manual, an academic paper, a brochure and an image gallery each have their own.

- Settle the page background the same way. Invoices, forms and academic papers normally sit on plain white, so take that as the default and change it only with a reason.

- Add decorative color only where the genre carries it. Invoices, forms, data tables and academic papers normally have no colored top band or side stripe, because their structure comes from typography and alignment, with thin neutral rules where needed.

- Reserve accent bands and stripes for genres where branding is the point.

- Use a standard page size in portrait with print-safe margins unless the user asks otherwise. Keep anything that matters out of the outer margin.

- Use headings and bullets on dense pages, styled so the same level always looks the same. Leave them out where a page carries little information.

## Give every element a reason

- A chart or diagram earns its place by carrying information the text cannot.

- Photos follow the image guidance in your build contract. Documents about everyday life, such as travel, food or lifestyle, read as unfinished without real photos of the places and things they name. Dense data and utility documents read better without images.

- Treat an empty-feeling area as a layout problem to solve, not a cue to add a card, a chip or a stock illustration.

- Use full-bleed imagery only for an intentional cover. Practical reports, guides, manuals and data-heavy documents use normal in-page images that do not compete with the content.

- Read the [PDF workflow](workflow.md) for HTML authoring, pagination, rendering and visual validation.

- When a delivered PDF has a reported visual problem, re-render the affected pages to PNG and read them before changing the source. Do not guess at a layout or styling defect without visual evidence.
