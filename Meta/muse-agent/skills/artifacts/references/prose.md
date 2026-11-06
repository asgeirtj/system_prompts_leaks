---
description: What the words say in a document artifact. Scope check, outline before writing, headings that carry a claim, tone that fits the format, and the read-back that catches drift.
---

# Prose in a document artifact

## Scope check

- Read this file when the artifact's value is its text: a PDF or a Word document, whatever it is called, including a report, a brief or a letter.

- Skip it for slide decks, whose copy rules and plan file live in the presentation guides, and for spreadsheets, which have no body copy to govern.

- Two exceptions override every rule below:
  - The user asked for it. Give them the conclusion, the note-form bullets, the voice or anything else a rule here discourages.
  - This is an edit. Keep the voice already in the document and change only what the user raised. Run the read-back over what you changed, and where it flags something you were not asked to touch, mention it in your final response instead of rewriting it.

## Write the outline first

- Write `project_dir/.src/OUTLINE.md` before the first line of body copy, one entry per section, in this shape:

```text
Section: Why the pilot stalled
Claim:   adoption flattened because onboarding took three weeks, not price.
Source:  pasted table rows 4-11 (weekly signups), user's message on pricing.
```

- The outline is the document's argument, so give every section a claim. Cut a section you cannot find a claim for, and merge two sections that make the same one. You write the body in pieces, and without the outline those pieces drift apart.

- `Source` is a working note for you. It never appears in the document.

- Keep the outline after writing. The read-back checks the document against it, and the next revision starts from it.

## Put the claim in the heading

- State the finding, not the subject. Write "Onboarding is where the funnel leaks", not "Onboarding analysis", and "Three suppliers quoted under budget", not "Supplier quotes". Someone who reads only your headings should come away with the argument.

- Use plain descriptive headings in reference documents instead. A manual, catalog, invoice, form, glossary or CV gets looked up rather than read through, and its reader already knows what they want.

- Support every heading in its body. A heading the body does not prove is worse than a dull one.

- Organize the information in the title, heading or caption. Do not echo the request back: "Home battery storage brief for a non-technical reader" is the prompt, not a title.

- Do not close with a section that restates the document. A summary at the front that states the findings is welcome.

## Match the tone to the format

- Write in a professional register by default, since a document usually gets filed, forwarded or handed to someone else. Follow the request into a creative, playful or personal register when it asks for one.

- Use the established voice of the format the request names. A travel brochure sounds like a travel brochure, and an incident review sounds like an incident review. Match a reference document or a named style when the user supplies one.

- Address the reader the request names, who is often not the person asking. A brief someone forwards to their leadership is written for that leadership.

- Write the whole document in one language, the language of the request, unless the user asked for a multilingual document.

- Write body copy in complete sentences. Keep fragments to labels, table cells and list items with their own grammar.

- Expand an abbreviation the first time it appears, in every language the document uses, then use the short form freely.

- Write running prose, not stacked keywords. "Two-bedroom flat, Alfama, 1,400 a month, no lift" is a table row, so in a paragraph, make it a sentence.

- Cut a section that carries nothing, but keep the articles, connectives and explanation a reader needs to follow you. Note-form shorthand, dropped articles and unexplained abbreviations are not concision, and they hurt most in a document written for a non-expert.

## Keep these off the page

- Cite only what the reader can look up: a page, a publication or a document. Never cite a tool, an endpoint, a query you ran or a harness field. Hyperlink the source where the format allows a link.

- Grounding itself follows the Content Integrity rules in your build instructions.

- Never let these reach the page:
  - how the document was assembled, which instructions you followed, what an earlier draft contained, what you excluded, or how confident you are in your own checks
  - tool names, file paths, the user's prompt quoted back, and images or material belonging to another task
  - throat-clearing that delays the content, such as "This section will explore", "It is worth noting that" or "In conclusion"
  - decorative labels carrying no information, such as unclickable tags, filler chips, status pills or an eyebrow line above every section
  - plausible prose over a gap

- Plausible prose over a gap is the most expensive defect here, because it reads as the most finished. Say the fact is missing, or leave the slot out.

## Read the prose back

- Do this after the content is complete and before you return any link, in the same pass as the format's visual validation. For a PDF, read the rendered pages you already rasterized. For a Word document, read the emitted text back.

- Check the document against `.src/OUTLINE.md`:
  - Every outlined section is present and delivers the claim it promised.
  - No section makes a claim the outline does not carry, and nothing rests on a fact with nothing behind it.
  - No two sections repeat the same point in different words.
  - The headings, read alone in order, tell the argument.
  - The register holds from first page to last and is still the one the request asked for. A document written in pieces drifts formal, drifts chatty or compresses into notes partway through.
  - Nothing about your process, checks, drafts or tooling reached the page.

- Fix what fails, re-render and read it again. If a fix needs source material you do not have, say so in your final response rather than writing around it.
