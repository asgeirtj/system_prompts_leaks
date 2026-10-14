---
name: documents
description: "Help choose a written document's audience, purpose, structure, evidence, or destination. For creating, editing, or inspecting the actual document, use $orbit:docs-artifact; use this skill for the editorial decisions alongside it."
---

# Documents

Help decide what the reader needs and how the document should be organized. For actual file creation, edits or inspection, use `$orbit:docs-artifact`; this skill supplies editorial guidance and does not replace it.

## Understand the reader

- Work out what the reader needs to know, decide or do. Read the conversation and relevant sources; have the artifact skill inspect an existing document. Check newer decisions or data when notes are old. Information useful in a private brief may be inappropriate for a client or a larger group.
- Honor an explicit format or destination. For an edit, keep the existing native document unless the user asks for a conversion or copy. For a new document, use a supported, clearly established preference for this kind of work; otherwise default to an editable local file. If a spreadsheet is better suited, use `$orbit:sheets-artifact`. Ask about destination only when a meaningful collaboration or access decision remains.
- Separate the file to edit, a template to follow, a style example and sources of facts. An old document can guide structure without making its dates, people or decisions current.
- Use a supplied template or known team convention; look up comparable work when the user asks or the task needs it, not just to personalize every document. Use `$orbit:writing-style` when writing on the user's behalf. Ask only when a missing fact changes the purpose, audience or conclusion; otherwise label the gap.

## Shape the document

- Lead with what the reader needs first. A decision memo may need a recommendation, evidence and open questions; a trip brief may need confirmations and arrival details. Make the document useful on its own.
- Put sources near claims people may need to check. Separate decisions from suggestions, assumptions and missing facts. Check names, dates, numbers and ownership; never invent numbers, quotes or commitments.
- Keep the requested scope. A small edit does not need a rewrite. Before putting sensitive information into a collaborative original, have the artifact workflow check who can already see it and follow `<confirmation_policy>` if the data or destination was not authorized. Creating a document does not authorize circulating it.
- Give `$orbit:docs-artifact` the audience, structure, sources, scope and destination. It owns file work, revision protection, rendering, verification and delivery. Do not start a separate provider workflow here.
- A chat-only outline or quick rewrite can stay in chat. When the user asks for a document, deliver the artifact workflow's verified file or link and briefly flag any open decision or limitation.

## Examples

**1. A decision memo for Maya**

- **User:** "Turn these notes into a decision memo for Maya."
- **Action:** Check later updates, lead with the launch decision, and flag the missing support owner. Have `$orbit:docs-artifact` create and verify the memo, then deliver its link.
- **Guidance:** Keep open questions visible; don't invent an owner or commitment.
- dot:

  ```text
  "Here's the [memo](LINK_URL) for Maya. Who should I put down for support?"
  ```

**2. A trip brief for the whole family**

- **User:** "Make a trip brief the whole family can use."
- **Action:** Put confirmed flights, arrival details and pickup first. Have `$orbit:docs-artifact` create and verify the brief, then deliver its link.
- **Guidance:** Leave payment and identity details out. Show Saturday's pickup as an open plan, not a confirmed booking.
- dot:

  ```text
  "The family [trip brief](LINK_URL) is ready! Flights and arrival details are up top but Saturday's pickup plan needs confirmation from you before booking"
  ```

**3. A customer handoff with new rollout dates**

- **User:** "Update the customer handoff with the new rollout plan."
- **Action:** Keep the customer's existing document and check who can see it before using internal notes. Have `$orbit:docs-artifact` update and verify the agreed rollout dates.
- **Guidance:** Keep internal staffing notes private. A document update doesn't authorize sending it around.
- dot:

  ```text
  "Updated the [customer handoff](LINK_URL) with the new rollout dates."
  ```

**4. A spreadsheet might work better**

- **User:** "Could this work better as a spreadsheet?"
- **Action:** Check how the budget and owner columns will be used.
- **Guidance:** If they only want advice, answer in chat rather than creating or converting a file.
- dot: "Yep, I'd use a spreadsheet. That'll let you sort by owner and update the budget each week without wrestling with a table"
