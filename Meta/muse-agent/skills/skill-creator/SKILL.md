---
name: "skill_creator"
description: "Create or update a workspace skill: its description, structure, instructions, and supporting files."
metadata: { "includeInPrompt": true }
---

# Skill Creator

## Purpose
Create or update a skill that is easy to trigger, concise to load, and backed by references or helper code only when they materially improve reliability.

## Workflow
1. Clarify the capability, likely trigger phrases, and the target workspace skill path (`~/workspace/skills/<name>/`).
2. Choose a narrow scope. Prefer one clear job per skill. Split unrelated jobs into separate skills.
3. Plan the file layout before editing:
   - Keep only the operational core in `SKILL.md`.
   - Put bulky docs, examples, schemas, or tutorials in `references/`.
   - Put templates or output assets in `assets/` only when the final output uses them.
   - Prefer helper binaries or checked-in helpers in `bin/` over prompt-side protocol or auth instructions.
4. Draft or update frontmatter. Required: `name`, `description`.
5. Draft or update the body:
   - Tool-backed skills: `Purpose`, `Tooling`, `Auth`, `Operating Rules`
   - Workflow-only skills: `Purpose`, `Workflow`, `Output Contract`, `Operating Rules`
   - Keep examples short and directly executable
6. Trim aggressively. Remove long API docs, schema dumps, and setup essays from `SKILL.md`. If a detail is useful but not needed on every trigger, move it to `references/`.
7. Sanity-check the result:
   - The description should say what the skill does and when it should trigger.
   - The body should tell the model what to do next, not explain the whole domain.
   - Commands, paths, and auth flows must match real repo/runtime behavior.

## Connector Credentials
Collecting a provider's credential is `credentials.request_api_access`, not a file you write. It is a sequence with external dependencies, and the tool enforces the order and refuses the schemes Muse cannot express.

Using that credential is authored here, but do not start from an empty file. Once the connector is connected, scaffold it:

```
/opt/hatch/skills/skill-creator/bin/scaffold-connector-skill --provider <provider>
```

It reads the connector from authd and writes a `SKILL.md` whose `Tooling` and `Auth` sections already carry the credential mechanics: which helper to import, where the value goes, which hosts are allowed, and how to replace a credential that stops working. Write the CLIs into the `bin/` it creates, and leave those two sections as generated.

A 401 or 403 from the provider is a question about the request before it is a question about the key. Check that the credential was attached at all: a request built without the helper carries nothing, and that looks exactly like a wrong or under-scoped token.

## Operating Rules
1. Preserve working commands and repo conventions; do not invent binaries, paths, or auth flows.
2. Prefer minimal frontmatter and on-demand loading. Only add metadata the skill actually needs.
3. Give auth its own section instead of burying it in operating rules.
4. Use existing setup/auth helpers when they exist. Do not tell the model to hand-write config files if a bundled helper already owns that flow.
5. Create `references/` only when it materially shortens `SKILL.md`; avoid duplicating the same guidance in both places.
6. If you create or edit Python CLIs, compile them with `python3 -m py_compile ~/workspace/skills/<skill-name>/bin/*.py` before reporting success.

## Reference Guide
For naming rules, resource-splitting heuristics, templates, and a review checklist, read [references/authoring_guide.md](references/authoring_guide.md).
