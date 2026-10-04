# Skill Authoring Guide

Use this reference when the task needs detail beyond the main workflow in `SKILL.md`.

## Naming
- Directory name: `kebab-case`
- Frontmatter `name`: `snake_case`
- Keep names short, concrete, and capability-based
- Namespace by provider or domain when it improves trigger clarity, for example `google-calendar` or `outlook-calendar`

## Resource Split
Choose the smallest structure that carries the skill reliably.

- Keep instructions in `SKILL.md` when they are short, stable, and required on every trigger.
- Use `references/` when the detail is useful but conditional: long examples, schemas, variant-specific notes, or extended workflows.
- Use `assets/` only for files that become part of the delivered output.
- For Jarvis bundled skills, prefer `bin/` helpers for repeated protocol, credential, or parsing work. Do not leave those mechanics in prompt text if a helper can own them.

## Frontmatter Template
```yaml
---
name: "my_skill"
description: "One-line description of what the skill does and when to use it."
---
```

Notes:
- `name` and `description` are the core trigger surface.
- Bundled skills should usually not set `metadata.includeInPrompt`.

## Body Templates

### Tool-backed skill
```markdown
# Skill Title

## Purpose
One line.

## Tooling
Exact commands, key flags, and the response fields the model should parse.

## Auth
Where auth lives, what setup to do first, and what not to print.

## Operating Rules
Short numbered constraints the tool itself does not enforce.
```

### Workflow-only skill
```markdown
# Skill Title

## Purpose
One line.

## Workflow
Ordered steps for the agent.

## Output Contract
What the final result should contain.

## Operating Rules
Short numbered constraints.
```

## What to Move Out of `SKILL.md`
- Long API endpoint catalogs
- Full response schema dumps
- Repeated auth/token extraction snippets
- Lengthy tutorials or background essays
- Large blocks of variant-specific guidance that only apply sometimes

Move that material to `references/` and link it from the relevant section in `SKILL.md`.

## Review Checklist
- Does the description clearly state both capability and trigger context?
- Is the skill scoped to one coherent job?
- Does `SKILL.md` tell the model what to do next, instead of teaching the whole subject?
- Are commands and paths real for this repo/runtime?
- Are auth expectations explicit when needed?
- Did you remove `includeInPrompt` unless there is a strong reason to keep it?
- If the skill uses helpers, does the prompt rely on them instead of duplicating their work?
