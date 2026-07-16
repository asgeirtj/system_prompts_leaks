# Claude Code system prompts

Verbatim captures of the system prompt Claude Code sends to each model, plus tool
definitions, agent/skill listings, and the bundled skills shipped in the binary.

Captures are vanilla: no MCP servers, no personal `CLAUDE.md`, output style `default`,
project paths replaced with placeholders.

## Lean vs full system prompt

Claude Code ships two system prompts and selects one per model.

| | Opening sections |
|---|---|
| **Lean** | `# Harness`, `# Communicating with the user` |
| **Full** | `# System`, `# Doing tasks`, `# Executing actions with care`, `# Tone and style`, `# Text output` |

Selection is fixed per model, driven by a `lean_prompt` capability flag in the binary's
model registry:

| Model | Prompt | File |
|---|---|---|
| Fable 5 | Lean | `claude-code-fable-5.md` |
| Opus 4.8 | Lean | `claude-code-opus-4.8.md` |
| Sonnet 5 | Full | `claude-code-sonnet-5.md` |
| Opus 4.7 | Full | `claude-code-opus-4.7.md` |
| Opus 4.6 | Full | `claude-code-opus-4.6.md` |
| Sonnet 4.6 | Full | `claude-code-sonnet-4.6.md` |
| Haiku 4.5 | Full | `claude-code-haiku-4.5.md` |

The lean models are exactly **Opus 4.8, Fable 5, and Mythos 5** — the ones carrying the
`lean_prompt` capability flag. It's a per-model property, not a recency cutoff: **Sonnet 5
shipped after Opus 4.8 but still uses the full prompt**, because the exclusion is by family
(any Sonnet, any Haiku, Opus 4.7-and-earlier), not by release date.

The lean/full split is not the only per-model difference: the **Claude 5 family + Opus 4.8**
carry a `mid_conv_system` capability and receive the agent-type and skill listings as a
trailing system message, while the **Claude 4.x models** (Opus 4.6/4.7, Sonnet 4.6, Haiku 4.5)
receive those listings as `<system-reminder>` blocks in the first user message. Same content,
different injection channel.

Introduced in Claude Code **2.1.154** (2026-05-28, the day Opus 4.8 launched) — changelog:
"The lean system prompt is now the default for all models except Haiku, Sonnet, and Opus
4.7 and earlier."

## Notes

- `DesignSync` is present because the design-sync feature is enabled on the capturing
  account. It is gated (`isEnabled` → `tengu_slate_quill`); a stock install without it will
  not have this tool.

## Slash commands vs bundled skills

Everything invoked with `/name` shows in one `/help` list, but there are two distinct
systems. Turning off bundled skills (`disableBundledSkills`) leaves `.claude/commands/`
untouched — proof they are separate populations.

| | Built-in (in binary) | User/project/plugin (on disk) |
|---|---|---|
| Slash commands | `type:local` / `local-jsx` / `prompt` (~108) | `.claude/commands/*.md` |
| Skills | `wu`/`Du` registrations (~32) | `.claude/skills/*/SKILL.md` |

A skill is model-invocable via the Skill tool, carries a `description` + optional
`allowedTools` and bundled files, and is governed by `disableBundledSkills`. A plain
command (`/clear`, `/theme`, `/config`) is user-triggered only and has no model-facing text.
The surfaces converged — the model can now invoke some built-in commands (`/init`,
`/review`, `/security-review`) via the Skill tool, and a few entries (`init`, `review`) are
registered as both a `type:"prompt"` command and a skill.

Model-facing prompt text reaches the model through three channels, each in its own folder:

1. **Skills** — the `wu`/`Du` registrations → `bundled-skills/`.
2. **Slash-command prompts** — `type:"prompt"` and prompt-carrying `local` commands
   (`btw`, `compact`, `recap`, `insights`, `team-onboarding`, `session-title`/`/rename`)
   → `slash-commands/`.
3. **`<system-reminder>` injections** — prompts a feature wraps in a `<system-reminder>` and
   injects into the turn, not tied to any command (`teammate`, `remote-plan`,
   `plan-multiagent`, `non-interactive`, `container-restart`, `model-switched`, `brief-mode`)
   → `injected-reminders/`.

The ~100 `local`/`local-jsx` UI commands (`clear`, `theme`, `config`, `model`, `diff`, …)
carry no model-facing text and are not captured.

## Contents

- `claude-code-{fable-5,sonnet-5,opus-4.6,opus-4.8}.md` — the per-model system prompts (see
  the lean/full split above).
- `bundled-skills/` — skills compiled into the binary; the binary's `disableBundledSkills`
  setting hides exactly this set.
- `slash-commands/` — prompts behind `/`-invoked commands.
- `injected-reminders/` — `<system-reminder>` feature injections.
- `agents/` — stock subagent prompts.
- `mcp-servers/` — per-server captures (instructions + tool definitions) for the MCP servers
  Claude Code exposes when connected: `computer-use`, `claude-in-chrome`, and the claude.ai
  Google Workspace connectors (`gmail`, `google-calendar`, `google-drive`). Not present in a
  stock no-MCP session.
- `grep-tool.md`, `glob-tool.md` — the Grep/Glob tool definitions. **These are not in the
  main-agent tool set** as of 2.1.211 (removed ~April 2026); they are available only to
  search subagents (Explore etc.). A main-agent capture has 28 tools with neither.
- `prompt-suggestion.md`, `claude-code-docs-assistant.md` — other individual captures.