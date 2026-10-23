---
name: diagnosing-mcp
description: Use to diagnose and fix ZCode MCP (Model Context Protocol) server configuration problems in the ZCode client. Applies when an MCP server will not connect, its tools (mcp__server__tool) do not appear, it shows as disabled or failed, connections time out, a command cannot be found, template variables are not expanded, or a server defined in a configuration file has no effect. Provides configuration locations, how to inspect status in Settings, common pitfalls, and a step-by-step localization and repair workflow.
---

# Diagnosing MCP Configuration

Goal: reduce any MCP problem to a single concrete file-field edit. A person inspects status from the client; an agent reads and edits the configuration files directly.

> Key points that are often misunderstood: the user configuration file is `~/.zcode/cli/config.json`; `.agents/mcp.json` is a **compatibility fallback** (read only when the same scope's `.zcode` has no MCP servers); and in the desktop client, MCP status and repair live under **Settings → MCP**.

## 1. Configuration locations and precedence

| Scope | File | Field |
|---|---|---|
| User | `~/.zcode/cli/config.json` | `mcp.servers` |
| User (fallback) | `~/.agents/mcp.json` | `mcpServers` (used only if `~/.zcode/cli/config.json` has no MCP servers) |
| Workspace | `<repo>/.zcode/config.json` or `<repo>/zcode.json` (every directory from the repository root down to the working directory is read) | `mcp.servers` |
| Workspace (fallback) | `<repo>/.agents/mcp.json` | `mcpServers` (used only if the workspace `.zcode` has no MCP servers) |
| Plugin | `<pluginRoot>/.mcp.json` or the manifest's `mcpServers` field | Keys are namespaced as `plugin:<plugin>:<server>` |

Within each scope, `.zcode` takes priority and `.agents/mcp.json` is a same-scope fallback: if that scope's `.zcode` defines any MCP server, its `.agents/mcp.json` is ignored entirely. Note the different key shape — `.zcode` uses nested `mcp.servers`, while `.agents/mcp.json` uses a top-level `mcpServers`.

Override order across scopes for a same-named server: **CLI → environment → user → workspace → system**. In short, **user overrides workspace**. Plugin-provided servers form the base layer and are overridden by explicit configuration.

**Auto-connect**: MCP servers from every scope — user, **workspace**, plugin, environment, and CLI — are **trusted and connected automatically** at session start. Workspace-scoped servers were previously untrusted (reported `Project MCP server requires explicit connection before use.`); they now connect by default like any other scope. Use **Settings → MCP** as the supported client surface for inspecting status and repairing configuration.

## 2. Configuration schema

- `stdio`: requires `command`; optional `args[]`, `cwd`, `env`, `enabled`, `timeoutMs`.
- `http` / `sse`: requires `url`; optional `headers`, `enabled`, `timeoutMs`.
- Standard field names are `env` for stdio environment variables and `headers` for HTTP/SSE request headers. `command` is a string and `args` is an array of strings; do not paste OpenCode-style `command: ["npx", "-y", "..."]` into ZCode's JSON editor.
- When `type` is omitted it is inferred: a `command` implies `stdio`, a `url` implies `http`. Legacy forms are migrated automatically when the CLI reads config directly (`type: "remote"` → `http`, `environment` → `env`, `enable` → `enabled`, `http_headers` → `headers`). Desktop app-managed session creation may bypass part of that CLI file parser, so prefer canonical fields (`env`, `headers`, `enabled`, `type: "http"`) in files that the desktop Settings → MCP page reads.
- The configuration-file server schema is **strict**: an **unknown key causes the server to be dropped**.
- **Template variables `${...}` are expanded only for plugin-provided MCP servers** (for example `${CLAUDE_PLUGIN_ROOT}` / `${ZCODE_PLUGIN_ROOT}`, `${CLAUDE_PROJECT_DIR}`, `${user_config.KEY}`). Configuration-file MCP servers do **not** expand templates — use absolute paths there.
- The default timeout is 30000 ms.

Canonical examples:

```json
{
  "mcp": {
    "servers": {
      "mysql-local": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@benborla29/mcp-server-mysql"],
        "env": {
          "MYSQL_HOST": "127.0.0.1",
          "MYSQL_PORT": "3306"
        }
      },
      "remote-reader": {
        "type": "http",
        "url": "https://example.com/mcp",
        "headers": {
          "Authorization": "Bearer ..."
        }
      }
    }
  }
}
```

## 3. How to inspect status

- **List and status**: open **Settings → MCP** in the client. Each entry shows whether the server is connected, disabled, disconnected, or failed, with any error inline. Plugin-provided servers are marked as built-in. (`untrusted` is a legacy status that no longer appears for normally configured servers now that every scope auto-connects.)
- **After edits**: restart the affected session, or restart ZCode if the Settings page still shows stale data, then reopen **Settings → MCP** to confirm the server status.
- **Standard-I/O error output** (the root cause of most failures): a stdio server's captured error stream is written to the ZCode log. To see the full output, run the server's `command` with its arguments directly in a terminal.

## 4. Common pitfalls (symptom → cause → fix)

1. **Workspace server does not connect** — a server defined in `<repo>/.zcode/config.json` (or `<repo>/.agents/mcp.json`) is not connecting. Workspace servers now auto-connect like any other scope, so this is no longer a trust gate — the cause is a real config or startup problem. → Check its **Settings → MCP** status: `failed` → go to step 4; absent → the config was not loaded (pitfall 5/9) or it is in `.agents/mcp.json` but shadowed (pitfall 12).
2. **`command not found`** — the server shows `failed` with an error such as `spawn npx ENOENT`. The `command` is not on `PATH`, or a relative path was not resolved. → Use an absolute path, add `cwd` when needed, and on Windows point at the `.cmd`/`.exe`.
3. **`${...}` reaches the process literally** — configuration-file MCP servers do not expand templates. → Use concrete absolute paths (templates are a plugin-only feature).
4. **Plugin is missing an environment value or secret** — the plugin reports a missing variable. → Set the plugin's configuration value (Plugin Management → the plugin's advanced settings) or export the required environment variable; sensitive values may only be placed in `env`/`headers`, not in `command`/`url`.
5. **Wrong transport type or unknown key** — the server is silently dropped. → Make `type` match the fields, remove any extra top-level keys (the schema is strict), and ensure exactly one of `command` (stdio) or `url` (http/sse) is present.
6. **Unexpected override** — editing the workspace `mcp.servers` entry has no effect. A same-named server in the user configuration is shadowing it (user overrides workspace for MCP). → Edit the user entry, or rename one of the servers.
7. **Connection or tool-listing timeout** — `failed ... timed out after 30000ms`. → Add `"timeoutMs": 60000` to that server, and address the slow startup.
8. **Only `Connection closed` with no cause** — the error stream was not surfaced in the status line. → Check the ZCode log for the captured error output, or run the `command` with its arguments in a terminal.
9. **JSON syntax error in the configuration file** — MCP servers (and possibly the whole file) go missing. → Validate the JSON, then fix the syntax.
10. **Server shows as disabled** — `enabled: false` (or legacy `enable: false`). → Set `"enabled": true` or remove the field.
11. **A desktop-managed server list overrides the file** — edits to configuration files have no effect because the client is supplying the MCP list. → Manage MCP through **Settings → MCP** in that context.
12. **`.agents/mcp.json` edits have no effect, or use the wrong key** — a server added to `.agents/mcp.json` never appears. Either the same scope's `.zcode` already defines MCP servers (so `.agents/mcp.json` is ignored entirely for that scope), or the servers were placed under `mcp.servers` instead of the top-level `mcpServers` that `.agents/mcp.json` expects. → Move the definition into the `.zcode` file for that scope, or ensure that scope's `.zcode` has no MCP servers and use the top-level `mcpServers` key in `.agents/mcp.json`.
13. **Server name appears in logs but no MCP tools appear in the model request** — the desktop app read the server entry and passed its name to the runtime, but the server failed during startup, so `toolCount` and `registeredToolCount` are zero. A common cause is a legacy `environment` field in `~/.zcode/cli/config.json`: CLI direct config parsing can migrate it, but the desktop app-managed path currently expects `env` when converting to protocol `mcpServers`. → Rename `environment` to `env`, keep the values unchanged, restart ZCode, and reopen **Settings → MCP**.
14. **Settings → MCP crashes after JSON editing with `command.trim is not a function`** — the saved server has a non-string `command`, usually OpenCode-style `command: ["npx", "-y", "server"]`. → Edit `~/.zcode/cli/config.json` manually: set `"command": "npx"` and move the rest into `"args": ["-y", "server"]`, then restart the app.

## 5. Localization workflow (in order; stop when the cause is found)

1. Confirm MCP is enabled (it is by default).
2. Open **Settings → MCP** and read the status: `disabled` → pitfall 10; `failed (<error>)` → read the inline error and go to step 4; **not listed at all** → step 3. (`untrusted` should no longer appear for a normally configured server.)
3. Verify the configuration is loaded and valid: check the JSON validity of `~/.zcode/cli/config.json` and `<repo>/.zcode/config.json` (and `zcode.json`) — pitfall 9. A server that is in the file but not listed failed schema validation (pitfall 5 — look for unknown keys, wrong `type`, or a missing `command`/`url`); a server defined only in `.agents/mcp.json` but not appearing points to the fallback shadowing or wrong-key issue (pitfall 12).
4. Diagnose a `failed` server: `ENOENT` → pitfall 2; `timed out` → pitfall 7; `Connection closed` → pitfall 8; an http/sse network error → check proxy/CA, URL reachability, and `headers`.
5. If **Settings → MCP** or service logs show `mcpServerCount` / server names but the model request has no `mcp__...` tools, check startup logs for `mcp.startup.completed` and `mcp.tools.registered`. If `toolCount=0` with failed statuses, inspect the config field names first (`env` vs `environment`, string `command` vs array `command`) before treating it as a model-selection issue.
6. If edits have no effect → pitfall 6 (user overrides workspace) or pitfall 11 (desktop-managed list).
7. If a `${...}` appears literally → pitfall 3 (configuration files do not expand templates) or pitfall 4 (an unset plugin variable).
8. Apply the concrete fix — most commonly editing `~/.zcode/cli/config.json` at `mcp.servers.<name>` (`command` / `args` / `cwd` / `env` / `headers` / `timeoutMs` / `enabled`) — then restart the session (every scope auto-connects) and reopen **Settings → MCP** to confirm.
