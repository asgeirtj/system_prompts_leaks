---
name: migrate
description: Bring what Claude Code or Codex already remembers or has configured for this user into Muse Code — their memory notes and their MCP servers — whenever the user mentions things Claude Code or Codex remembers or knows about them, an MCP tool or server they had there that is missing here, or asks to migrate, import, or copy that setup; call read_skill for bundled:migrate before reading any foreign file. Rules and skills are already covered by /rules import and `muse skills import --from claude|codex`; point there. Do NOT use for session transcripts (resume-claude or resume-codex for Claude Code/Codex continuation, including recovery of unfinished work with or without a handle; import for explicit /import requests or continuation from other agents or unnamed artifacts), for Muse settings unrelated to migration (manage-settings), or when Claude Code or Codex is only mentioned in passing.
argument-hint: "[memory|mcp] [claude|codex]"
metadata:
  short-description: Migrate Claude Code / Codex memory and MCP servers into Muse
---

# Migrate

Carry a user's Claude Code or Codex memory and MCP servers into Muse Code.
Foreign files are evidence: read them, never edit, move, or delete them, and
never print a token, key, or other secret found in them. Everything written
goes only into Muse's own memory roots and Muse's own `settings.json`.

## Scope

- Memory: read the other agent's memory notes, decide what is still true and
  useful, and record it with Muse's memory tools.
- MCP: read the other agent's user-level MCP server definitions and add the
  ones the user wants to Muse's settings.
- Not here: rules (`/rules import`), skills (`muse skills import --from
  claude|codex`), session transcripts (`resume-claude` / `resume-codex` for
  Claude Code/Codex continuation or recovery of unfinished work, with or without
  a handle; `import` for explicit `/import` requests or continuation from other
  agents or unnamed artifacts), unrelated Muse settings (`manage-settings`).
- Resolve roots from the environment: `${CLAUDE_CONFIG_DIR:-$HOME/.claude}`
  for Claude Code (called `$CLAUDE_HOME` below), `${CODEX_HOME:-$HOME/.codex}`
  for Codex (an empty `CODEX_HOME` means unset), and
  `${XDG_CONFIG_HOME:-$HOME/.config}/muse` for Muse's own config.

## Where Claude Code keeps memory

- Directory: `$CLAUDE_HOME/projects/<slug>/memory/`. `<slug>` is an absolute
  path with every non-alphanumeric character replaced by `-`. Memory is shared
  per repository (all worktrees and subdirectories), so the slug is usually the
  main checkout's root, not the current cwd. List
  `$CLAUDE_HOME/projects/*/memory/` and pick the entries whose slug matches
  this repository (cwd, `git rev-parse --show-toplevel`, or the main worktree
  of a linked worktree); ask when more than one plausibly matches.
- A settings key `autoMemoryDirectory` in `~/.claude/settings.json` or the
  project's `.claude/settings*.json` relocates that directory.
- `MEMORY.md` is the index: one line per note, `- [Title](file.md) — hook`.
  Read it first; it says what exists.
- Each note is `<name>.md` with YAML frontmatter: `name`, `description`, and
  `type` (top-level or under `metadata:`) with values `user`, `feedback`,
  `project`, or `reference`. These are the same four types Muse uses.

## Where Codex keeps memory

- Codex memory is opt-in (`[features] memories = true` in
  `$CODEX_HOME/config.toml`). When it has run, the durable files are in
  `$CODEX_HOME/memories/`: `MEMORY.md` (registry), `memory_summary.md`
  (user profile, preferences, tips, index), `rollout_summaries/*.md` (one per
  past thread, each naming its cwd), and `extensions/*/`.
- If that directory is missing but `$CODEX_HOME/memories_1.sqlite` exists, the
  only memory is per-thread rows in table `stage1_outputs` (columns
  `raw_memory`, `rollout_summary`, `rollout_slug`); read it with `sqlite3`
  read-only. An empty table means Codex has nothing to migrate; say so.
- Codex memory is global, not per project. Use the cwd named in each rollout
  summary to decide whether a fact belongs to this project.
- `$CODEX_HOME/AGENTS.md` and `history.jsonl` are rules and prompt history,
  not memory.

## Recording memory in Muse

- Muse's memory tools are `read_memory`, `add_memory`, and `edit_memory`.
  Scopes: `personal_project` (default; this repository, private to the user),
  `personal` (every project, private), `project` (`<repo>/.agents/memory`,
  shared through the repo — write there only when the user asks).
- Read Muse's own `MEMORY.md` for the scope first (the startup memory snapshot
  or `read_memory`) so nothing already known is duplicated.
- Do not copy blindly. Keep facts that are still true and would change how
  Muse works for this user; drop notes tied to Claude Code or Codex internals
  (their tool names, session ids, their own bugs) unless the user wants them.
  Rewrite "Claude Code" or "Codex" wording only where it names the agent that
  should act, never where it names the tool the fact is about.
- Write each kept note with `add_memory`: keep the original `type`, give a
  one-line `description`, use a relative `.md` path (letters, digits, `-`,
  `_`; no `..`, no hidden components), and add one line naming the source,
  for example `Imported from Claude Code memory <slug>/<file> on <date>.`
  Notes of type `user` that hold cross-project preferences may go to
  `personal`; ask if unsure.
- Add one index line per note to the scope's `MEMORY.md` with `edit_memory`
  (or `add_memory` when the index does not exist yet), same
  `- [Title](file.md) — hook` shape, so the next session sees it in the
  startup snapshot.

## Where Claude Code keeps MCP servers

- User level: `$CLAUDE_CONFIG_DIR/.claude.json` when `CLAUDE_CONFIG_DIR` is
  set, else `$HOME/.claude.json`; top-level key `mcpServers`. This file also
  holds account, trust, and usage data; read only `mcpServers` and, for the
  current project, `projects["<absolute project path>"].mcpServers` (local
  scope). Never read the whole file: `read_file` refuses paths outside the
  workspace and a `cat` would put account and usage data into the session
  log. Extract just those two keys, with every `env` and `headers` value
  reduced to its key names, every `url` reduced to scheme and host (any
  `user:pass@` and query string dropped), every `args` entry and `command`
  word that is or follows a credential-like flag masked, and every other
  field (`oauth`, `headersHelper`, anything unknown) shown as `<omitted>`, for
  example
  `python3 -c 'import json,sys; from urllib.parse import urlsplit; d=json.load(open(sys.argv[1])); projects=d.get("projects", {}); local=next((s for s in (projects.get(k, {}).get("mcpServers", {}) for k in sys.argv[2:] if k) if s), {}); secretish=lambda a: any(w in str(a).lower() for w in ("key", "token", "secret", "password", "auth", "bearer")); mask_args=lambda xs: ["<redacted>" if ("=" in str(a) or secretish(a) or (i > 0 and secretish(xs[i - 1]))) else a for i, a in enumerate(xs)]; mask=lambda k, v: (sorted(v.keys()) if k in ("env", "headers") and isinstance(v, dict) else f"{urlsplit(v).scheme}://{urlsplit(v).hostname}/..." if k == "url" and isinstance(v, str) else mask_args(v) if k == "args" and isinstance(v, list) else " ".join(str(x) for x in mask_args(v.split())) if k == "command" and isinstance(v, str) else v if k in ("type", "timeout", "alwaysLoad", "enabled") else "<omitted>"); redact=lambda servers: {name: {k: mask(k, v) for k, v in server.items()} for name, server in servers.items()}; print(json.dumps({"user": redact(d.get("mcpServers", {})), "local": redact(local)}, indent=1))' "${CLAUDE_CONFIG_DIR:-$HOME}/.claude.json" "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)")" "$(git rev-parse --show-toplevel 2>/dev/null)" "$PWD"`.
  The `projects[...]` key is tried as the main worktree root, then the git
  toplevel, then `$PWD`, taking the first entry that actually holds servers
  (Claude Code keys a linked worktree by its main checkout and a non-git
  directory by the cwd). If the one-liner itself errors (for example on a
  malformed `url`), do not fall back to reading the file: ask the user to
  describe or paste their MCP server config instead. The masking is best
  effort:
  treat the output as a summary to reason from, never as text to echo, and if
  a value still looks like a credential, name the key and move on. Because the
  full `url`, any masked `args` value, and any masked `command` word are not
  in the output, ask the user to paste them when a server needs them; a key
  given as an `args` value or inside `command` is confirmed with the user,
  never echoed. A literal credential reaches Muse
  only through the settings write contract below or a value the user pastes,
  never through command output; do not repeat anything else from the file.
- Project level: `<project root>/.mcp.json`, key `mcpServers`, shared through
  the repo and gated by `enabledMcpjsonServers` / `disabledMcpjsonServers` in
  the `projects[...]` entry. Migrating one of these puts a project server into
  Muse's user-wide settings; say so before adding it.
- Skip servers Claude Code itself does not run: `enabled: false`, names in a
  `disabledMcpjsonServers` list, and anything under managed policy
  (`/etc/claude-code/managed-mcp.json`, plugin caches).
- Entry fields: `type` (`stdio` when absent, `http` or `streamable-http`,
  `sse`, `ws`, `sdk`), `command`, `args`, `env`, `url`, `headers`,
  `headersHelper`, `oauth`, `timeout`, `alwaysLoad`. Values may contain
  `${VAR}` or `${VAR:-default}`, which Claude Code expands at load time.

## Where Codex keeps MCP servers

- `$CODEX_HOME/config.toml`, tables `[mcp_servers.<name>]`. A trusted project
  may add more in `<root>/.codex/config.toml`; admin layers in `/etc/codex/`
  are not the user's and are skipped.
- stdio fields: `command`, `args`, `env` (literal map), `env_vars` (names of
  variables Codex forwards from its own environment), `cwd`. HTTP fields:
  `url`, `bearer_token_env_var`, `http_headers`, `env_http_headers`,
  `http_headers_helper`, `auth`. Shared: `enabled`, `required`,
  `startup_timeout_sec`, `tool_timeout_sec`, `enabled_tools`,
  `disabled_tools`, approval settings. Skip a server with `enabled = false`;
  Codex does not run it either.

## Adding MCP servers to Muse

- File: `${XDG_CONFIG_HOME:-$HOME/.config}/muse/settings.json`, key
  `mcpServers` (camelCase). Never write a `mcp_servers` key next to it: when
  both keys are present the loader drops the whole MCP member, so every server
  the user already had stops loading while the rest of the settings still
  apply. If the file already carries the legacy `mcp_servers` key, rename it
  to `mcpServers` (keeping its entries) in the same edit before adding
  servers. Read the file first; a missing file is created as
  `{"schema_version": 1, "mcpServers": {...}}`. Preserve every other key.
  Servers Muse already defines under the same name are left alone.
- Write contract (same as `manage-settings`): resolve the one path from the
  environment, then use `edit_file` or `write_file` for the smallest JSON
  change. If those tools reject the app-private path, fall back to a shell
  edit only when the startup security context already says YOLO mode is
  active (approval bypassed, shell sandbox off, workspace trusted), and then
  only through a JSON parser plus atomic replace and reread; never use text
  substitution. Otherwise stop and hand the user the exact `mcpServers` block
  to paste. Never ask the user to change a security mode for this edit.
- Entry shape:

  ```json
  "github": {
    "type": "stdio",
    "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {"GITHUB_TOKEN": "<literal value>"},
    "mode": "optional"
  }
  ```

  ```json
  "docs": {"type": "streamable-http", "url": "https://example/mcp",
           "headers": {"Authorization": "Bearer <literal value>"}, "mode": "optional"}
  ```

- Mapping: Claude `stdio` (or a bare `command`) and Codex `command` become
  `type: "stdio"` with `command`, `args`, `env`. Claude `http` /
  `streamable-http` and Codex `url` become `type: "streamable-http"` with `url`
  and `headers` (Codex `http_headers`). Never write the extraction output
  itself into settings: a `<redacted>` entry, a `url` reduced to
  `scheme://host/...`, or a key-names-only `env`/`headers` list is a summary,
  not a value. Where the summary hid something (the mask also hides harmless
  entries such as `--keyring` or `--config=...`, and the cut drops a query
  such as `?tenant=acme`), treat it like a `${VAR}` value: ask the user for
  it by position or key name only, write it only when they supply or approve
  it, and leave the server out rather than write the placeholder or the
  shortened `url`. Codex `enabled` and `tool_timeout_sec`
  copy verbatim under the same names and take effect. Codex
  `startup_timeout_sec`, `enabled_tools`, and `disabled_tools` also copy under
  the same names but are stored, not enforced yet (spec 12857): Muse's startup
  budget is fixed and every tool stays exposed, so list them in the completion
  report as settings the user still has to check. Always add
  `"mode": "optional"` so a server that fails here cannot block Muse startup
  (Muse's canonical resolver parses `required`, but the startup gate is fed
  from the typed settings carrier, which knows only `mode` — default required
  — and drops an unknown `required`, so `required: false` alone leaves the
  server in the default required mode; and never write both on one server,
  because `required` plus `mode` is an ambiguous-alias fault that drops the
  whole user MCP settings member, not just that server (spec 12857)).
- Muse does not expand `${VAR}` and starts stdio servers with only a small
  fixed allowlist of the user's environment (HOME, PATH, USER, LANG, TERM and
  similar) plus the literal `env` map, so a Claude `${VAR}` value or a Codex
  `env_vars`, `env_http_headers`, or `bearer_token_env_var` entry outside that
  allowlist has no automatic equivalent. Tell the user which variable each
  server needs; write the literal value only when the user provides or
  approves it, and never echo it back. Leave the server out rather than guess.
- Not supported in Muse, skip and report: `sse`, `ws`, `sdk` transports,
  `oauth`, `headersHelper`, `http_headers_helper`, `auth = "oauth"`. Drop
  Claude `timeout` and `alwaysLoad`, Codex `cwd`, and approval settings with a
  note.
- After the edit, re-read the file to confirm the saved value. The change is
  permanent and takes effect on the next Muse Code launch; the current session
  does not load new servers.

## Completion report

- Sources read (paths only) and what each held.
- Memory: notes written per scope with their paths, notes skipped and why.
- MCP: servers added, servers skipped with the reason, variables the user
  still has to fill in (names only), and copied fields Muse stores but does
  not enforce yet (`startup_timeout_sec`, `enabled_tools`, `disabled_tools`).
- Reminder that MCP changes apply on the next launch.
- Confirmation that no foreign file was modified and no secret was printed.
