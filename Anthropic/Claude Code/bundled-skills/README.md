# Bundled skills

The skills compiled into the Claude Code binary — the set the `disableBundledSkills`
setting (and `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS`) hides. "Bundled" is Anthropic's own term.
Extracted verbatim from the binary; captures reflect Claude Code 2.1.211.

## Layout convention

A skill is stored as **a folder with `SKILL.md`** when it ships companion files, and as a
**flat `<name>.md`** when it is a single file with no companions.

| Folder (SKILL.md + companions) | Ships |
|---|---|
| `claude-api/` | per-language SDK docs + `shared/` references |
| `dataviz/` | `references/` + palette validator `scripts/` |
| `design-sync/` | `lib/` + `scripts/` + storybook/non-storybook variants |
| `code-review/` | per-effort tier prompts + `report-findings-tool.md` |
| `run-skill-generator/` | `examples/` + `template.md` |
| `claude-code-docs/` | `references/` |
| `deep-research/` | a workflow `scripts/` file |

Everything else is a single-file skill (`verify.md`, `simplify.md`, `loop.md`, `batch.md`,
`update-config.md`, `morning.md`, …).

In Claude Code itself every skill is a directory with `SKILL.md` (`~/.claude/skills/<name>/SKILL.md`
is the on-disk spec). Single-file skills are flattened to `<name>.md` here for readability;
the content is identical.

`artifacts/` is the one exception to "folder = one skill": it is a **grouping container** for
the Artifact-tool family (`artifact-design`, `artifact-dashboard`, `artifact-data-table`,
`artifact-explainer`, `artifact-report`, `plan-artifact`, and `artifact-capabilities/`), not a
single skill.

## Not all of these are enabled

Several are shipped but gated off (behind Statsig experiments or env flags), so they do not
appear in `/help` on a stock install — e.g. `design-sync`, `claude-code-docs`, `plan-artifact`,
the `artifact-*` templates, `code-walkthrough`, `pr-explainer`, `morning`. They are captured
here because they are compiled into the binary regardless of gate state. The 14 that a stock
account sees in `/help` are the user-invocable, ungated subset.
