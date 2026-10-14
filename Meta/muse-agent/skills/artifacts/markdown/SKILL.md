---
name: artifact_markdown
metadata: { "includeInPrompt": false }
description: Build or revise a plain markdown file (md) deliverable such as notes, a README, meeting minutes, documentation, or text the user will edit or paste elsewhere. Use whenever a build task's artifact kind is markdown. Covers markdown formatting conventions and read-back verification.
---

# Markdown artifacts

A markdown deliverable is plain text written directly with the file tools:
append sections with `muse.write` in append mode, keep each write small,
and use `muse.edit` for surgical fixes. There is no compile step; the
file at `<slug>.md` in the project directory root is the deliverable.

| Task | Read first |
|---|---|
| Formatting (tables, lists, emphasis, headings) | `/opt/hatch/skills/artifacts/references/markdown.md` (shared) |

Structure follows the content: real markdown headings, real list syntax,
tables only where rows and columns genuinely align. The file ships as the
user's own text, so no build scaffolding, no HTML unless the user asked
for it, and no trailing commentary that isn't part of the document.

## Verification

Follow `/opt/hatch/skills/artifacts/testing/SKILL.md`: read the finished file back
in full before returning the link, checking structure renders as intended
and no placeholder or scratch content remains.
