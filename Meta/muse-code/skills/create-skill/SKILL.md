---
name: create-skill
description: Create and validate a new Muse skill — project-local in the current workspace by default, or a personal skill staged for `muse skills install` into the managed personal root. Use ONLY when the user explicitly asks to create a Muse skill or invokes the create-skill skill. Do NOT use for ordinary skill usage, code changes, benchmark tasks, or third-party skill/plugin systems.
---

# Create Skill

Create one new Muse skill. Use this skill only for explicit Muse skill creation
requests, not for ordinary skill usage, code changes, benchmark tasks, or
third-party skill/plugin systems.

Two scopes exist (ADR 8975):

- **Project scope (the default)**: the skill lives in the current workspace at
  `.agents/skills/<skill-id>/`.
- **Personal scope** (the user asked for a "personal", "user", or
  "cross-project" skill): the skill belongs in the managed personal root
  `$CONFIG_DIR/skills/<skill-id>` (`$XDG_CONFIG_HOME/muse`, else
  `$HOME/.config/muse`). You stage and validate the draft in the workspace,
  then hand the user one `muse skills install` command — the store performs the
  managed install (files + provenance), so `skills update` and
  `skills uninstall` keep working on it.

Never write to a foreign harness root (`~/.codex/skills`, `~/.claude/skills`)
or to `$HOME/.agents/skills` — those are import-only sources, never write
targets. Never write directly into `$CONFIG_DIR/skills` either: the store owns
that write, through the install command below.

## Scope

- Create exactly one directory: `.agents/skills/<skill-id>/` (project scope) or
  the staging directory `.agents/skill-drafts/<skill-id>/` (personal scope —
  deliberately OUTSIDE `.agents/skills/`, so the draft is not loaded as a
  project skill).
- Create exactly one required file: `<that directory>/SKILL.md`.
- Do not create a plugin, install a plugin, enable a skill, trust a plugin, execute
  the generated skill, fetch remote content, or write outside the current workspace.
- Do not add scripts, assets, references, or extra files unless the user explicitly
  asks for them and the target remains inside the new skill directory.

## Inputs

Before writing files, identify:

- `scope`: project (default) or personal — personal only when the user asked for
  a personal/user/cross-project skill.
- `skill-id`: a portable lowercase identifier for the directory and frontmatter
  `name`.
- `description`: one clear sentence for the frontmatter.
- `body`: concise instructions that make the generated skill useful on its own.

Ask a short clarification question if the user did not provide enough information
to choose a safe `skill-id` and useful behavior.

## Safety Checks

Reject the request before writing when:

- the destination is not under `.agents/skills/` (project scope) or
  `.agents/skill-drafts/` (personal staging) in the current workspace;
- the requested final destination is a foreign harness root (`~/.codex/skills`,
  `~/.claude/skills`), `$HOME/.agents/skills`, or any absolute path outside the
  two sanctioned roots and the personal staging destination (the workspace
  `.agents/skills/` tree, `$CONFIG_DIR/skills/<skill-id>`, and
  `.agents/skill-drafts/<skill-id>`) — explain the sanctioned path instead;
- the ID is empty, `.`, `..`, contains `/` or `\`, starts with `-`, or contains
  anything except ASCII lowercase letters, digits, hyphen, or underscore;
- the ID is a Windows reserved stem such as `con`, `prn`, `aux`, `nul`, `com1`,
  `com2`, `com3`, `com4`, `com5`, `com6`, `com7`, `com8`, `com9`, `lpt1`,
  `lpt2`, `lpt3`, `lpt4`, `lpt5`, `lpt6`, `lpt7`, `lpt8`, or `lpt9`;
- the destination already exists, is a symlink, or any parent resolves outside the
  current workspace.

## Creation Steps

Use normal file and shell tools with the current workspace as the base. `<dir>`
below is `.agents/skills/<skill-id>` (project scope) or
`.agents/skill-drafts/<skill-id>` (personal scope).

1. Check that `<dir>` does not exist.
2. Create its parent (`.agents/skills` or `.agents/skill-drafts`) if needed.
3. Reserve the leaf directory with a no-replace operation. If another process wins
   the race, stop and report incomplete.
4. Recheck that the reserved directory resolves inside the current workspace and is
   not a symlink.
5. Write `<dir>/SKILL.md`.
6. Run:

   ```sh
   muse skills validate <dir> --json
   ```

7. Treat the draft as complete only when the validator succeeds, returns
   `valid: true`, and reports zero diagnostics or warnings.
8. If validation fails, correct the same draft and revalidate. Stop after three
   correction rounds and report the remaining validator output as incomplete.

## Generated `SKILL.md`

Use this shape:

```markdown
---
name: <skill-id>
description: <one sentence>
---

# <Readable Skill Name>

<Instructions for when and how to use the skill.>
```

Keep the generated instructions direct and self-contained. Include only behavior the
user asked for or that is necessary for the skill to work.

## Completion Report

On success, report:

- the canonical path to the created directory;
- the validator command and clean result;
- that no install, enable, trust, or execution step was run;
- **personal scope only**: the one command that finishes the managed install
  into the personal root — run by the user, so the skills store records the
  install provenance itself:

  ```sh
  muse skills install .agents/skill-drafts/<skill-id>
  ```

  and that the staging directory can be deleted after the install succeeds.

On failure, report:

- what operation failed;
- the destination if it was reserved;
- the remaining diagnostics or tool error;
- which checks were not completed.
