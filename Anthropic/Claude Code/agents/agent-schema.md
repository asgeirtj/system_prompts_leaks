<!-- Custom-subagent definition schema, extracted verbatim from the Claude Code v2.1.211 binary (2026-07-16). Three surfaces consume agent definitions: (1) file-based .md frontmatter in ~/.claude/agents/ and .claude/agents/ (name from frontmatter, prompt = the markdown body), (2) the --agents CLI flag (JSON record of name → definition, prompt as a field), (3) the Agent SDK `agents` option. Surfaces (1) and (2) validate against the same zod schema, reproduced first below; the SDK schema differs slightly and carries the richest field descriptions, reproduced second. Official docs cover most of this (code.claude.com/docs/en/sub-agents) — fields marked ▲ are absent from the docs' field list as of 2026-07-16. -->

# CLI schema (file frontmatter and --agents flag)

| Field | Type / constraints |
|---|---|
| `description` | string, min 1 ("Description cannot be empty"). Required. |
| `tools` | string[], optional (allowlist) |
| `disallowedTools` | string[], optional |
| `prompt` | string, min 1 ("Prompt cannot be empty"). Required in JSON; for .md files this is the markdown body. |
| `model` | string, optional; trimmed, case-insensitive `inherit` normalized |
| `effort` | `low \| medium \| high \| xhigh \| max` or integer, optional |
| `permissionMode` | permission-mode enum, optional |
| `mcpServers` | array (server name or config record), optional |
| `hooks` | hooks record, optional — same shape as settings.json `hooks` |
| `maxTurns` | positive integer, optional |
| `skills` | string[], optional |
| `initialPrompt` | string, optional |
| `memory` | `user \| project \| local`, optional |
| `background` | boolean, optional |
| `isolation` | `worktree \| remote`, optional |
| ▲ `observer` | string, optional; trimmed, blank → unset |
| ▲ `observerMessage` | string, optional; blank → unset |

Additionally honored from .md frontmatter: `name` (required, must not start with `-`) and `color` (registered for UI display; not part of the validation schema).

# SDK schema field descriptions (verbatim)

- `description` — "Natural language description of when to use this agent"
- `tools` — "Array of allowed tool names. If omitted, inherits all tools from parent. Note: passing 'Skill' here is deprecated — use the `skills` field instead."
- `disallowedTools` — "Array of tool names to explicitly disallow for this agent. MCP server-level specs (mcp__server, mcp__server__*, mcp__*) remove every tool from the named server (or all MCP tools)."
- `prompt` — "The agent's system prompt"
- `model` — "Model alias (e.g. 'fable', 'opus', 'sonnet', 'haiku') or full model ID (e.g. 'claude-fable-5'). If omitted or 'inherit', uses the main model"
- ▲ `criticalSystemReminder_EXPERIMENTAL` — "Experimental: Critical reminder added to system prompt"
- `skills` — "Array of skill names to preload into the agent context"
- `initialPrompt` — "Auto-submitted as the first user turn when this agent is the main thread agent. Slash commands are processed. Prepended to any user-provided prompt."
- `maxTurns` — "Maximum number of agentic turns (API round-trips) before stopping"
- `background` — "Run this agent as a background task (non-blocking, fire-and-forget) when invoked"
- `memory` — "Scope for auto-loading agent memory files. 'user' - ~/.claude/agent-memory/<agentType>/, 'project' - .claude/agent-memory/<agentType>/, 'local' - .claude/agent-memory-local/<agentType>/"
- `effort` — "Reasoning effort level for this agent. Either a named level or an integer"
- `permissionMode` — "Permission mode controlling how tool executions are handled"
- ▲ `observer` — "Agent type auto-spawned as a background observer whenever this agent runs. The observer receives read-only activity digests and reports via the ObserverReport tool; it never participates in the task."
- ▲ `observerMessage` — "Supplemental postamble appended (after the harness-owned default) to each activity digest sent to the observer. Blank values are ignored."

<!-- Mechanics observed in the parse/resolve code, v2.1.211:
- memory + tools allowlist: setting `memory` on an agent with a tools allowlist auto-adds Write, Edit, and Read to the allowlist, and the agent's system prompt gets a memory-instructions block appended.
- Name resolution: one definition per name; sources inserted in order built-in → plugin → userSettings → projectSettings (additional-directory entries first) → flagSettings (--agents) → policySettings (managed), later overwriting earlier — so managed > --agents > project > user > plugin > built-in, and a shadowed built-in is unreachable by name.
- Duplicate names within a scope are logged ("Duplicate agent name ... — active: <location>").
- internal registration fields not accepted from users: whenToUse/whenToUseLean (the description's internal names), appendSystemPrompt (append-to-default-prompt merge; only the built-in `claude` agent sets it), omitClaudeMd, source, baseDir, getSystemPrompt. -->
