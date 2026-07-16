---
name: plan-artifact
description: Create or customize a shareable plan Artifact from an implementation plan, design doc, or RFC. Use when asked to publish a plan as an artifact, restyle or edit a plan artifact, or present a plan as a shareable page.
---

Turn a markdown plan into a published Artifact with the standard plan treatment. All plan artifacts share one blessed template so they read as a family: same type system, same palette, same rhythm, in both light and dark mode.

Plans approved in plan mode can already be published from the approval dialog's publish option (or `/plan share`) — that built-in path fills this same template mechanically, and only runs when the user picks it. Use this skill when a human asks you to create a plan artifact by hand, re-publish an edited plan, or customize what the built-in publish produced.

## Process

Always start from the template. Never write the HTML shell from scratch — the shell is the consistency.

1. **Copy the template.** Copy `templates/artifact-plan.html` from this skill's base directory (listed above) to a working `plan.html` in your scratchpad directory if one is listed in your system prompt, otherwise alongside your other temporary files.

2. **Edit the copy — content only.**
   - Delete the leading HTML comment header.
   - Fill `{{TITLE}}` and `{{TAB_TITLE}}` with the plan's title, `{{EYEBROW}}` with a short context label such as `Plan · <project name>`, and `{{SUMMARY}}` with a one-sentence lede.
   - Replace each `<!-- SLOT: … -->` comment with that section's content as HTML. Convert the plan's markdown; the `<h2>` headings are already provided. Add or remove whole `<section>` blocks so the document matches the plan's actual structure — the four starter sections are a suggestion, not a requirement.
   - Keep the `<style>` block intact, including the dark-mode token set — every plan artifact carries both themes. Keep the `<script>` theme shim intact too: it mirrors the viewer toggle's `data-theme` stamp onto `data-mode` for the token block, and removing it silently kills the toggle axis for the page while diagrams still follow it. Extend or restyle only when the user explicitly asks for a different look, and keep their changes additive where possible.

3. **Publish** the file with the Artifact tool.
