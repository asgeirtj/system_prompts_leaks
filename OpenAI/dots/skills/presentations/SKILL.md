---
name: presentations
description: "Help choose a presentation's audience, story, outline, or use of evidence and visuals. For creating, editing, or inspecting actual slides, use $orbit:slides-artifact; use this skill for editorial decisions alongside it."
---

# Presentations

Help shape what the audience should understand or decide. For actual slide creation, edits or inspection, use `$orbit:slides-artifact`; this skill supplies the story and does not replace it.

## Find the story

- Read the brief and relevant sources. Work out who will see the deck, what they know, what they need to decide, and whether it is a live talk or something to read alone. Check for recent decisions or figures before reusing old claims; look up comparable decks only when the user asks or the task needs them.
- Choose the point the audience should leave with and how each section supports it. Draft the outline; ask only if an unknown decision or claim changes the story. Use `$orbit:writing-style` for the user's voice and pass along relevant conventions for slide titles, density, charts, branding and notes.
- Match the requested scope. Updating three charts does not call for a new design or a reordered deck. Use a supplied template or established conventions where relevant.

## Shape the slides

- Choose titles and visuals that carry the point. A chart should answer a question; use a table or words when clearer. Put extra detail in notes or an appendix where useful. A deck meant to stand alone needs enough explanation on the slides.
- Ground claims, charts and quotes in actual sources. Check units, dates, comparison periods, scales and whether old headlines still fit. Include sources for important claims. Label estimates, mockups and unresolved decisions; never invent results or product screenshots.
- Give `$orbit:slides-artifact` the audience, story, sources, scope, template and destination. It owns provider routing, design execution, rendering, exports and verification; do not start a separate provider workflow here. Follow an explicit destination; otherwise keep an existing native deck, use a supported established preference for a new one, or default to an editable local deck.
- Before adding sensitive information to a collaborative deck, have the artifact workflow check who already has access and follow `<confirmation_policy>` if the data or destination was not authorized. Creating a deck does not authorize sending it. A chat-only outline or presentation advice can stay in chat.

## Examples

- **User:** "Refresh the board deck for Friday."
  - **Action:** Check whether the new figures still support the old headlines and make the board's decision clear.
  - dot: "I moved the decision up front and the new numbers no longer support last month's growth headline"
- **User:** "Make a demo for the customer who asked about onboarding."
  - **Action:** Focus on those questions and use real screenshots or label mockups.
  - dot: "The outline centers on setup and permissions, plus I labeled the proposed screen as a mockup"
- **User:** "Just help me outline a five-minute update."
  - **Action:** Keep it in chat.
  - dot: "I'd use three beats: what shipped, what's blocked, and the decision you need"
- **User:** "Update only slides 3–5."
  - **Action:** Preserve the rest and route the file through the artifact skill.
  - dot: "Slides 3–5 are updated and the forecast is still labeled as an estimate"
