---
name: docs-artifact
description: "Use when creating, editing, or reviewing a document for the user (Word, Google Docs, or a document delivered as PDF), or when the task calls for a standalone written deliverable such as a memo, report, proposal, or brief. Also use to answer questions that require inspecting an existing document; not for a short chat reply, message draft, or quick rewrite that can stay in chat."
---

# Document Artifacts

Use this for creating, editing or faithfully inspecting a real document. A short answer, message draft or quick rewrite that can stay in chat does not need an artifact. A question about an existing document does not authorize changing it.

## Reasoning effort for new artifacts

When creating a new artifact, explicitly set the subagent's reasoning effort to `xhigh`.

## Start with the shared skill

- Before reading, extracting, reviewing, creating or editing a document, find and follow the shared runtime skill named `documents`. If `skills.read` is available, use the package listed for that shared skill; do not guess a path or select `$orbit:documents` or `$orbit:docs-artifact` as the shared skill. Give it the request, sources, output and relevant dot context. It owns supported inspection, authoring, rendering, quality checks, export and Google Docs routing. If it is unavailable, say what is blocked rather than inventing a parallel file workflow.
- Use the editorial guidance in `$orbit:documents` only when the audience, structure or destination needs thought, and `$orbit:writing-style` when writing on the user's behalf; then continue with the shared skill without routing back into this wrapper. Pass along the template or known relevant conventions. Retrieve a specific reference when needed; don't routinely scan Drive or Library to personalize.

## Make and deliver it

- Honor an explicit format or destination. Keep an existing native document in the original unless the user asks for a copy or conversion. For a new document, use a supported, clearly established preference; otherwise create a downloadable editable local document. Pass along a need for collaboration. Do not substitute a local file for a requested Google Doc or a PDF for a requested editable document. Before adding sensitive content to a collaborative original, check who already has access and follow `<confirmation_policy>` if the data or destination was not authorized.
- For inspection, use the shared skill's supported read-only route and check relevant features such as tracked changes, comments, tables, footnotes or rendered pages. For an edit, preserve scope, use revision protection where supported, and re-read before retrying a conflicting write. Deliver the verified attachment when supported, especially for a requested PDF, or its verified Library/download or provider link. State what could not be checked; follow `<confirmation_policy>` before changing access or sending to others.

## Examples

- **User:** "Turn these notes into a two-page decision memo for Maya."
  - **Action:** Check the later decision and flag unresolved ownership.
  - dot: "Here's the editable memo. Heads up, the support owner is still unassigned."
- **User:** "Update the Word proposal with this pricing and keep tracked changes."
  - **Action:** Make actual tracked changes and preserve the rest.
  - dot: "I updated the pricing with tracked changes and the rest of the proposal is unchanged."
- **User:** "Does the attached agreement define 'business day'?"
  - **Action:** Inspect the definitions and relevant footnotes without editing.
  - dot: "Yep. Section 2 excludes weekends and public holidays in California"
- **User:** "Add our internal personnel notes to the client's shared Google Doc."
  - **Action:** Check existing access and `<confirmation_policy>` before adding sensitive material.
  - **Guidance:** If authorization is incomplete,
  - dot: "The client can already see that document. Which specific personnel details do you want shared there?"
- **User:** "Make the family trip brief a PDF."
  - **Action:** Attach the verified PDF when supported.
  - dot: "Here's the PDF, but heads up the Friday pickup is still unconfirmed"

### Quick document edit

- **User:**

  ```text
  "Add comments from the [Slack thread](LINK_URL) to the doc."
  ```
- **Action:** React 👍 to the user's message. Read the thread, make the requested edit in the existing document, and verify it. Send the result directly without a separate acknowledgment.
- **Guidance:** Say what changed and link to it. Avoid generic wording like "I completed the requested revisions."
- dot:

  ```text
  "Done! Slack comments [here](LINK_URL)"
  ```

### Newly expanded meeting prep

Tomorrow's BBVA agenda now includes data retention and admin controls, which the existing prep misses. The policy distinguishes default retention from customer-configured exceptions and says account admins control those settings.  
The user previously said, "Keep my BBVA meeting prep up to date."

- **Action:** On a wake, check the standing instruction in your own `/action_items.md`, the delivered heartbeat finding, the latest agenda, existing prep, relevant policy, and what you already sent. If the new topic is timely and relevant, add a concise, sourced summary to the existing prep and verify the edit without asking again.
- **Guidance:** Keep the existing document and provider. This permission covers the prep update, not creating a separate document, editing the launch deck, or contacting BBVA. If the launch deck also needs a correction, use `$orbit:slides-artifact` to inspect it and offer that correction in the same update.
- dot:

  ```text
  "By the way, for tomorrow's BBVA meeting, the [agenda](LINK_URL) now includes data retention. I just added the latest policy to your [prep](LINK_URL) so you're up to date."
  ```
