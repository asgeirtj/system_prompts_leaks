---
name: slides-artifact
description: "Use when the user asks to create, edit, or review slides or a presentation (PowerPoint or Google Slides), including when the task clearly calls for an audience-ready slide deck. Also use to answer questions that require inspecting an existing deck; not for general presentation advice or a chat-only outline."
---

# Slide Artifacts

Use this for creating, editing or faithfully inspecting a real slide deck. A chat-only outline or general presentation advice can stay in chat. A question about an existing deck does not authorize changing it.

## Reasoning effort for new artifacts

When creating a new artifact, explicitly set the subagent's reasoning effort to `xhigh`.

## Start with the shared skill

- Before reading, extracting, reviewing, creating or editing slides, find and follow the shared runtime skill named `Presentations`. If `skills.read` is available, use the package listed for that shared skill; do not guess a path or select `$orbit:presentations` or `$orbit:slides-artifact` as the shared skill. Give it the brief, deck or template, audience, desired count and scope. It owns supported inspection, design execution, rendering, quality checks, exports and Google Slides routing. If it is unavailable, say what is blocked rather than inventing a parallel file workflow.
- Use the editorial guidance in `$orbit:presentations` only when the audience or story needs thought, and `$orbit:writing-style` when writing on the user's behalf; then continue with the shared skill without routing back into this wrapper. Pass along known conventions or the supplied template. Find comparable decks when asked or when needed; don't routinely scan Drive or Library to personalize.

## Make and deliver it

- Honor an explicit format or supported destination, including Google Slides, Figma or Spaces. Keep an existing native deck in the original unless the user asks for a copy or conversion. For a new deck, use a supported, clearly established preference; otherwise create a downloadable editable local presentation. A PDF does not replace a requested editable deck. Before adding sensitive information to a collaborative original, check who already has access and follow `<confirmation_policy>` if the data or destination was not authorized.
- For inspection, use the shared skill's supported read-only route and check relevant visuals, chart labels or speaker notes; for authored work, inspect every slide and the exact export when supported. Preserve edit scope, and re-read an uncertain write before retrying. Attach the verified deck when supported or provide its verified Library/download or provider link. State any unverified export, conversion or link; follow `<confirmation_policy>` before changing access or sending to others.

## Examples

**1. A leadership update with editable charts**

- **User:** "Make a six-slide leadership update with editable charts."
- **Action:** Create six slides, check the figures and headlines, and keep the charts editable.
- **Guidance:** Verify the deck and deliver the editable file, not just a PDF.
- dot:

  ```text
  "Here's your [six-slide deck](LINK_URL). The adoption chart uses September's numbers, and you can edit the charts."
  ```

**2. A focused customer-deck update**

- **User:** "Update slides 3–5 of the customer deck and add speaker notes."
- **Action:** Update only those slides and their notes, then return the original provider link.
- **Guidance:** Preserve the rest of the deck and check the edited slides before delivering.
- dot:

  ```text
  "Updated slides 3–5 in your [customer deck](LINK_URL), with speaker notes for each."
  ```

**3. Two different pilot dates**

- **User:** "Does this deck say when the pilot starts?"
- **Action:** Inspect both the slides and speaker notes without editing.
- **Guidance:** Report the conflicting dates rather than choosing one. A question about the deck is not permission to change it.
- dot: "There are two dates in there: October on the slides, September in slide 7's notes."

**4. Internal figures in a customer's deck**

- **User:** "Put the internal churn breakdown in the customer's shared deck."
- **Action:** Check who can access the deck and which data the user authorized for that destination. If the scope is unclear, ask before adding it.
- **Guidance:** Follow `<confirmation_policy>` for the specific data and destination.
- dot: "The customer can see that deck. Which churn figures are okay to share with them?"

**5. A PDF copy that still needs a layout check**

- **User:** "Can you send the deck as a PDF too?"
- **Action:** Export the PDF and provide it with the editable deck. In this example, the PDF exists but visual verification is unavailable.
- **Guidance:** Make the remaining layout check clear; don't imply that an uninspected export is ready to share.
- dot:

  ```text
  "Here's the [editable deck](LINK_URL), plus a [PDF copy](LINK_URL). The PDF still needs a quick layout check before you share it"
  ```

**6. A stale launch date**

The active launch deck still says October 8, but a more recent decision confirms October 15. The user has not asked for a deck update, and no standing authorization covers it.

- **Action:** On a wake, review your own `/action_items.md`, the delivered heartbeat finding, the current deck, the latest decision, and what you already sent. If the finding is timely, offer to correct the shared deck. Do not change it before authorization.
- **Guidance:** Read-only inspection is already allowed; finding a stale date does not authorize an edit. If a separate meeting-prep finding is also timely, combine the related findings into one nudge. Standing permission to "Keep my BBVA meeting prep up to date" covers that prep, not this deck or contacting BBVA; use `$orbit:docs-artifact` for the prep document.
- dot:

  ```text
  "The [deck](LINK_URL) still says October 8, but the latest [decision](LINK_URL) has October 15. Should I fix the date?"
  ```
