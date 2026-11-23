---
name: migrate-agent-settings
description: Migrates the user's MCP servers, skills, slash commands, subagents, and instruction files from other coding agents (Claude Code, Codex, Cursor, Gemini CLI) into one new Antigravity plugin. Use when the user wants to bring over, import, or migrate their setup or config from another agent or tool. Don't use for installing Marketplace plugins or authoring a new plugin from scratch (use the plugin skill).
---

# Migrate agent settings into an Antigravity plugin

Collect what the user set up in other coding agents and write it into **one**
plugin they own, at `~/.gemini/config/plugins/<plugin-name>/`. A single plugin
keeps the import reversible: the user can turn the whole thing off, or delete
the folder, without touching anything else.

Work in four steps: discover, confirm, write, hand back. **Never write anything
before the user confirms the plan in Step 2.** Never modify or delete the source
files of the other agents.

## Step 1: Discover

Check each location below and note what exists. Read only what you need: list
directories, and parse JSON or TOML for server names rather than dumping whole
files. Only look at the current workspace's project files if a workspace is
open. Skip any source that is absent; do not ask about it.

| Source | MCP servers | Skills / commands | Subagents | Instructions |
| --- | --- | --- | --- | --- |
| Claude Code | `~/.claude.json` top-level `mcpServers` (user scope); `<workspace>/.mcp.json` | `~/.claude/skills/*/SKILL.md`; `~/.claude/commands/*.md` | `~/.claude/agents/*.md` | `~/.claude/CLAUDE.md` |
| Codex | `~/.codex/config.toml` `[mcp_servers.<name>]` | `~/.codex/skills/*/SKILL.md`; `~/.codex/prompts/*.md` | — | `~/.codex/AGENTS.md` |
| Cursor | `~/.cursor/mcp.json`; `<workspace>/.cursor/mcp.json` | — | — | `<workspace>/.cursor/rules/*.mdc` |
| Gemini CLI | `~/.gemini/settings.json` `mcpServers` | `~/.gemini/commands/**/*.toml` | — | `~/.gemini/GEMINI.md` |

Also note what Antigravity already has, so the import doesn't duplicate it:
skill, MCP server and plugin names in `~/.gemini/config/` (including
`mcp_config.json` and `plugins/*/`), and the skills and rules already in your
own context. Skip anything already loaded, such as `~/.gemini/GEMINI.md` if it
is in your rules.

Some things don't convert. Record them for the Step 4 report, don't migrate  
them:

-   Claude Code `hooks` and `permissions` in `settings.json`: their tool names
    (`Bash`, `Edit`) and allow-list syntax differ from Antigravity's.
-   Claude Code plugins under `~/.claude/plugins/` and Gemini CLI extensions
    under `~/.gemini/extensions/`: the CLI's `plugin import claude` and
    `plugin import gemini` commands import these.
-   Cursor user rules and settings stored in its app database.
-   MCP servers with the legacy SSE transport (`"type": "sse"`, a URL ending in
    `/sse`, or Gemini CLI `url` without `httpUrl`). If one has no
    Streamable HTTP endpoint, offer to run it through the stdio bridge
    `npx -y mcp-remote <url>` instead.

## Step 2: Confirm the plan

Show the user a short summary grouped by source: counts plus names (for
example, "Claude Code: 3 MCP servers (github, linear, postgres), 2 skills,
1 instruction file"). List what will be skipped and why, in one line each.
If you include anything from the open workspace (`.mcp.json`,
`.cursor/mcp.json`, `.cursor/rules/`), say that it will apply in every
workspace once it is in this global plugin, so the user can leave it out.
Never print secret values (tokens, API keys, passwords, `Authorization`
headers) in chat; refer to them by key name only.

Ask once, in a single message:

1.  Proceed with everything, or leave some items out?
2.  The plugin name. Suggest `migrated-settings`, lowercase kebab-case. If a
    directory with that name already exists under `~/.gemini/config/plugins/`,
    suggest another name rather than overwriting it.

Wait for the answer.

## Step 3: Write the plugin

Create `~/.gemini/config/plugins/<plugin-name>/` with only the parts you need.

**`plugin.json`**, with exactly these fields (unknown fields are silently  
dropped):

```json
{
  "name": "<plugin-name>",
  "displayName": "Migrated settings",
  "version": "1.0.0",
  "description": "MCP servers, skills, and instructions migrated from <sources>."
}
```

**`mcp_config.json`**: one `mcpServers` map with every migrated server,
converted to Antigravity's schema. Allowed keys per server are `command`,
`args`, `env`, `cwd`, `url`, `headers`, `disabled`, `variables`; drop anything
else (such as `type`, `timeout`, `trust`, `alwaysAllow`).

-   stdio servers: copy `command`, `args`, `env`, `cwd`.
-   Remote servers: Claude Code and Cursor `url`, Codex `url`, Gemini CLI
    `httpUrl` all become `url`; keep `headers`.
-   Codex TOML maps directly: `command`, `args`, `env` (a table), `cwd`.
    Codex `http_headers` go into `headers`; each `env_http_headers` entry
    `Header = "X"` becomes `"Header": "${X}"` plus an `X` entry in  
    `variables`.
-   Make every `cwd` absolute: resolve `${workspaceFolder}`, `$HOME`, `~`, and
    relative paths now, since a relative `cwd` resolves against the plugin
    directory and `cwd` gets no variable substitution.
-   Resolve paths that pointed into the old tool's own directory (for example
    `${CLAUDE_PLUGIN_ROOT}`) to absolute paths, or skip the server if the path
    doesn't exist.
-   Keep literal secret values exactly as they were in the source file; the
    plugin is local to this machine like the original config. Don't echo them.
-   On a name clash with an existing Antigravity server, prefix the new one with
    the source, such as `claude-github`.

Plugin MCP configs do **not** expand OS environment variables. A `${X}` is only
substituted when `X` is declared in that server's `variables` array, and the
user fills it in on the plugin's setup form; anything else is passed through
literally. So:

-   A stdio `env` entry that only passes a variable through (`"X": "${X}"`,
    `"X": "$X"`, or Cursor's `"X": "${env:X}"`) is redundant: drop it, and the
    server inherits `X` from the environment.
-   Any other `${X}` in `command`, `args`, `env`, `url`, or `headers` (for example
    `"Authorization": "Bearer ${X}"`): keep the placeholder and declare  
    `{"name": "X", "title": "<readable name>", "description": "<what it is>"}`  
    in the server's `variables`. Rewrite other placeholder spellings to
    `${X}` first: `$X`, Cursor's `${env:X}`, and `${X:-default}` (mention the
    default in the variable's `description`).
-   Codex `bearer_token_env_var = "X"` becomes
    `"headers": {"Authorization": "Bearer ${X}"}` plus the `X` entry in  
    `variables`.
-   Tell the user in Step 4 which variables they need to fill in on the
    plugin's page.

**`skills/<name>/SKILL.md`**:

-   Claude Code and Codex skills are the same format: copy each skill folder
    whole, including `scripts/` and `references/`. Claude Code allows a
    `SKILL.md` without frontmatter or `name`; Antigravity drops those, so make
    sure each one has frontmatter with `name` set to the folder name and a
    non-empty `description` (write one from the opening paragraph if needed).
-   Slash commands and prompts (`~/.claude/commands/*.md`,
    `~/.codex/prompts/*.md`, Gemini CLI `commands/*.toml`) become skills named
    after the file (nested Gemini command paths join with `-`, such as
    `git-commit`). Write frontmatter with `name` and a `description` taken from
    the command's own `description` or first line. Use the command body (TOML
    `prompt`) as the skill body. Replace `$ARGUMENTS`, `$1`, `{{args}}` with an
    instruction such as "Apply this to what the user asked for."
-   The `name` in frontmatter must match the folder name.

**`agents/<name>.md`** (Claude Code subagents): keep the body as the system
prompt. Write frontmatter with:

-   `name`: from the frontmatter, or the file name if missing. Prefix it (for
    example `claude-reviewer`) if it clashes with a built-in or existing agent
    such as `self`, `browser`, `research`, `deepagent`, or `review-agent`.
-   `description`: required; write one from the body if missing.
-   `subagent: true` and `mainAgent: false`, so it stays a subagent.
-   `tools`: always write it, since an omitted `tools` gets only a small
    read-only default set. If the Claude Code agent had no `tools` (meaning all
    tools), write  
    `tools: [read_file, edit_file, write_file, run_command, manage_task, search_web]`.  
    Otherwise map each grant to the native tool names: `Read`/`Glob`/`Grep` to
    `read_file`, `Edit`/`MultiEdit` to `edit_file`, `Write` to `write_file`,
    `Bash` to `run_command` and `manage_task`, `WebSearch`/`WebFetch` to
    `search_web`. Drop grants with no equivalent and tell the user.
-   Drop `model` and `color`.

**`rules/`**: one file per instruction source, such as `rules/claude.md` and
`rules/codex.md`, each starting with:

```markdown
---
trigger: always_on
---
```

-   Write each Cursor `.mdc` rule to its own `rules/<name>.md`, mapping
    triggers: `alwaysApply: true` to `always_on`; non-empty `globs` to
    `trigger: glob`; a non-empty `description` to `trigger: model_decision`;
    neither to `trigger: manual`. `globs` must be one comma-separated string
    matched against absolute paths and file names: flatten YAML lists, expand
    braces (`**/*.{ts,tsx}` to `**/*.ts, **/*.tsx`), and prefix
    workspace-relative paths with `**/` (`src/**/*.ts` to `**/src/**/*.ts`).
-   Each rule file is capped at 24 KB. If a source is larger, tell the user
    rather than truncating silently.
-   Remove lines that only make sense in the old tool (for example "use the
    Bash tool"), and tell the user what you removed.

## Step 4: Hand back

1.  Re-read `plugin.json` and `mcp_config.json` and check that both parse as  
    JSON.
2.  Tell the user, in a few lines: what was migrated, what was skipped and why,
    and anything they still need to do (sign in to a remote MCP server, set an
    environment variable).
3.  Give them a link to the plugin's page, where they can review it and turn it
    on or off: `[<plugin-name>](customization://<plugin-name>)`.
4.  If any MCP server declares `variables`, the plugin starts **disabled**:
    tell the user which variables to fill in on that page and that they must
    turn the plugin on afterwards. Otherwise the plugin loads by itself and its
    skills are available from the next turn.
