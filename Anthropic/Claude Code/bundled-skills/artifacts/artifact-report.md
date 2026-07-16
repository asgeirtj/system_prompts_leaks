---
name: artifact-report
description: Create a long-form report artifact — typographic document with a masthead, table of contents, structured sections, and an optional appendix. Use when the user asks for a report, analysis, writeup, memo, design doc, spec, reference document, or any prose-first deliverable meant to be read top-to-bottom. Only for CREATING a new artifact; edits to an existing artifact modify its HTML directly.
---

Long-form document layout: serif body type on a warm paper background, with a masthead, table of contents, prose sections, and an optional appendix. Print-friendly.

## How to use

1. Read `template.html` from this skill's base directory (listed above).
2. Copy it as your starting point. Replace each `<!-- SLOT: ... -->` marker with real content — the comment inside each slot describes what goes there. Each slot also carries placeholder text after the comment (a sample title, headings, sentences, a takeaway bullet, a table-of-contents entry); replace that text too — removing the comment markers alone leaves the placeholders in the published page.
3. Self-check the filled HTML: no `SLOT` markers left, no placeholder text left, and every table-of-contents (TOC) entry points at a section id that exists.
4. Take a follow-up pass on styling and content before publishing. The template provides a default structure and style, not a required one: tighten the prose, and adjust the styling to what this document needs — retune the `--cds-*` token values (in every scope that declares them — the light `:root` block, both dark scopes, and the `@media print` block — or the value snaps back in dark mode or print), restyle components, or restructure where the content calls for it (keep text contrast accessible, and keep the TOC for any report with three or more sections).
5. Publish the filled HTML with the `Artifact` tool.

**Creation only.** When editing an existing report artifact, work with its current HTML directly — don't re-read or re-apply this template.

## Slots

| Slot | What to fill in |
| --- | --- |
| `TITLE` | The document's headline claim or subject. |
| `SUBTITLE` | One sentence stating the key finding or scope. |
| `KEY_TAKEAWAYS` | Optional — 3–5 bullets, **one line each**: a single clause carrying its number or specific, no sub-clauses or second sentences. This is the bullet level below the SUBTITLE's single sentence; don't restate it, and don't pad a bullet into a paragraph. Omit the whole `<aside class="takeaways">` for short documents. |
| `TOC_ITEMS` | One `<li><a href="#id">Section title</a></li>` per `<h2>` in SECTIONS. Fill this **after** writing SECTIONS, from the headings you actually wrote. A small script in the template rebuilds the list from the rendered sections, so anchors self-heal on screen — the static list is the fallback where scripts don't run. |
| `SECTIONS` | One `<section id="...">` per major topic, each with an `<h2>` and body prose. Use `<h3>` for subsections, `<table>` for structured data, `<pre>` for code, `<blockquote>` for callouts, and `<figure>` + `<figcaption>` for diagrams and charts. Lead each section with its conclusion. |
| `APPENDIX` | Optional — supporting material that would interrupt the main flow. Omit the whole `<section class="appendix">` if not needed. |

The template also has a minor inline slot for the masthead eyebrow (doc type / date) — labelled in place.

## Content

Respect the reader's attention — it is the scarcest resource a report consumes:

- Lead with what matters most. The subtitle carries the headline finding, the takeaways carry the top specifics, and each section opens with its conclusion; details, methodology, and raw data come after — or go to the appendix.
- Write clearly and concisely: plain language, short sentences, each term of art defined on first use, no unexplained abbreviations. Cut anything that doesn't change what the reader knows or decides.
- State what the evidence is and how certain each claim is: distinguish what was measured, what is inferred, and what is speculation, rather than presenting all three in the same voice.
- Use a diagram or chart whenever it carries the point better than prose — a trend, a comparison, a structure. Draw figures as self-contained inline SVG inside a `<figure>`, never as external images (the artifact must render with no network access), and give every figure a `<figcaption>` that states what the reader should take from it.

## Notes

- The template is a **body fragment** — no `<!DOCTYPE>`/`<html>`/`<head>`/`<body>` wrapper. The Artifact tool adds its own skeleton at publish time.
- Write real prose in full sentences. The layout is tuned to a ~65-character measure.
- Styling defaults are inlined `--cds-*` custom properties (self-contained — artifacts render with no network access), declared in the light `:root` block and re-declared in both dark scopes and the `@media print` block. They are defaults, not enforcement: retune them in every scope that declares them, or restyle entirely, in the follow-up pass.
