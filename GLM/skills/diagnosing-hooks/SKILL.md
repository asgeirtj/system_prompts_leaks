---
name: diagnosing-hooks
description: Use to diagnose and fix ZCode hook configuration problems in the ZCode client. Applies when a hook does not trigger, an event name is wrong, a matcher does not match a tool name, a script is not executable, template variables are not expanded, a timeout unit is mistaken (seconds versus milliseconds), the command and process field styles are mixed, a hook's JSON output fails validation, a hook blocks the session unexpectedly, or configuration-file hooks are not enabled. Provides configuration sources, the hooks.json schema, how to inspect hooks in the client, and a step-by-step localization and repair workflow.
---

# Diagnosing Hook Configuration

Goal: reduce any hook problem to a single concrete fix.

> Note on trust: plugin hooks execute regardless of the marketplace they came from — third-party plugin hooks run just like built-in ones. Any "diagnostic-only until trusted" wording you may see for marketplace hooks is stale; a plugin's detail view marks each hook as runnable, and that is now true for all hooks.

## 1. Configuration sources and merging

- **Configuration-file hooks**: the top-level `hooks` key in `~/.zcode/cli/config.json` (or the workspace `<repo>/.zcode/config.json` / `zcode.json`), shaped as `{ enabled?, timeoutMs?, maxOutputBytes?, events: { <Event>: [ { matcher?, hooks: [...] } ] } }`. **These are disabled by default — configuration-file hooks must set `hooks.enabled: true` to run.**
- **Plugin hooks**: each plugin's `hooks/hooks.json` (or its manifest `hooks` field). Plugin matchers are appended after configuration matchers. **When any plugin contributes a hook, the hook runner is enabled automatically.**
- Non-plugin (user or workspace) configuration hooks have no trust gate; with `enabled: true` they run unconditionally.

## 2. hooks.json schema

```yaml
{ "hooks": { "<Event>": [ { "matcher": "...", "hooks": [ { "type": "command"|"process", ... } ] } ] } }
```

(A plugin file uses the outer `hooks` wrapper; the configuration file uses `hooks.events.<Event>`. The inner array is the same.)

- **Event names (exactly seven)**: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PostToolUseFailure`, `Stop`. Any other name is an unsupported event. (Events such as `Notification`, `SubagentStop`, and `PreCompact` are **not** supported.)
- **The matcher is a case-sensitive regular expression**, tested against the event's match value:
  - `SessionStart` → one of `startup`, `resume`, `clear`, `compact`
  - Tool events (`PreToolUse`, `PostToolUse`, `PermissionRequest`, `PostToolUseFailure`) → the **tool name** (`Bash`, `Read`, `Write`, `Edit`, `Agent`, …), with aliases `Task` ↔ `Agent` and `Write`/`Edit` ← `ApplyPatch`
  - `UserPromptSubmit` → the prompt text; `Stop` → the response preview
  - An omitted matcher matches everything; an invalid regular expression never matches (silently)
- **`type: "command"`**: `command` (a shell string); optional `shell`, `timeout` (in **seconds**), `timeoutMs` (in milliseconds, takes precedence), and `statusMessage`. Note that `async` currently has no runtime effect.
- **`type: "process"`**: `command` (an executable) plus `args[]` (an argument vector run without a shell, the most portable choice), `timeoutMs` (in **milliseconds**), and `statusMessage`.
- Timeout resolution: `timeoutMs` → `timeout × 1000` → the configuration's `timeoutMs` → a default of 60000 ms.
- Template variables (expanded in the command and each argument, and also injected as environment variables): `${CLAUDE_PROJECT_DIR}` / `${ZCODE_PROJECT_DIR}`, `${CLAUDE_SESSION_ID}`; and, for plugin hooks only, `${CLAUDE_PLUGIN_ROOT}` / `${ZCODE_PLUGIN_ROOT}` and the plugin data directory. Note that a skill-directory variable is not valid in a hook and raises an error.
- **Hook output**: standard output is parsed as JSON (a strict schema — any extra key fails validation), or you may use exit codes: `0` passes, `2` blocks (a deny for `PreToolUse`/`PermissionRequest`), and any other non-zero raises an error. `additionalContext` is injected into the conversation; `PreToolUse` may return a permission decision of `allow`/`ask`/`deny`; `Stop` may request continuation (up to three times).

## 3. How to inspect hooks

- **In the client**: **Settings → Plugin Management** → open a plugin's detail view to see the hooks it registers and whether each is runnable.
- **As an agent**: read the `hooks/hooks.json` (or the manifest `hooks` field) for a plugin, and the `hooks` block of `~/.zcode/cli/config.json` / the workspace config for configuration hooks.
- **Execution** (fired, timed out, blocked) is recorded in the ZCode log, with the hook's source, matcher, outcome, duration, and a preview of its error stream — enough to distinguish a timeout from a failure from a block.

## 4. Common pitfalls (symptom → cause → fix)

1. **Configuration-file hooks do not run** — you added `hooks.events.*` but nothing fires. They are disabled by default and are enabled automatically only when a plugin hook is present. → Set `"hooks": { "enabled": true, ... }` in the configuration.
2. **Wrong event name** — the hook never triggers. → Use exactly one of the seven supported events.
3. **Matcher does not match (tool name, case, or regex)** — it is registered but never fires for the tool you expect. The matcher is a case-sensitive regular expression; `"bash"` will not match `Bash`, and an invalid expression never matches. → Use the exact tool name or a correct expression (for example `"Edit|Write"`), or omit the matcher to match all. Remember the aliases `Task` → `Agent` and `Write`/`Edit` → `ApplyPatch`.
4. **Script is not executable** — `permission denied`, with a failed outcome. The script was installed without the executable bit. → Run `chmod +x` on it, or invoke it through an interpreter, e.g. `{"type":"command","command":"bash \"${CLAUDE_PLUGIN_ROOT}/hooks/x.sh\""}`, so the executable bit is irrelevant.
5. **Template variable not expanded** — a literal `${...}` or an empty path. Only recognized variables are expanded; a skill-directory variable raises an error inside a hook, and `${CLAUDE_PLUGIN_ROOT}` is available only for plugin hooks. → Use only supported variables, and `${CLAUDE_PLUGIN_ROOT}` for plugin-relative paths.
6. **Timeout unit mistaken** — the hook is killed with a timed-out outcome. `command`'s `timeout` is in **seconds**; `process`'s `timeoutMs` is in **milliseconds**. `timeout: 500` means 500 seconds; `timeoutMs: 5` means 5 milliseconds. → Use `"timeout": <seconds>` for a command hook and `"timeoutMs": <milliseconds>` for a process hook.
7. **Command and process fields mixed** — the hook is dropped. A `process` hook accepts only `command`, `args`, and `timeoutMs`; a `command` hook accepts `command`, `shell`, `timeout`, and `timeoutMs`. → Match the fields to the `type`.
8. **JSON output fails validation** — the hook ran but its effect was discarded and the run marked failed. The output was not valid JSON, contained an extra key (the schema is strict), or its event-specific output named the wrong event. → Emit only the recognized keys with the correct event name, or emit nothing (empty output is fine) and rely on exit codes.
9. **Assuming `async` runs in the background** — you set `async: true` but the session still waits. The `async` field has no runtime effect and hooks always run inline. → Do not rely on `async`; for background work, have the script daemonize itself.
10. **Cross-platform failure** — it works on one operating system but not another. A `command` hook runs through a shell, so POSIX syntax fails on Windows. → Prefer a `process` hook (an argument vector, no shell), or ship a polyglot wrapper script and keep hook scripts extensionless.
11. **A hook blocks the session unexpectedly** — a tool is denied or the run halts. The hook returned a block, exited with code 2, or returned a `deny` decision. → Inspect the block's reason in the log; fix the script's exit code — return 0 to pass and reserve 2 for a deliberate block.
12. **Believing third-party hooks are "diagnostic only"** — a third-party plugin hook did not run and you suspect a trust gate. That is not the cause: all plugin hooks are runnable. → Diagnose via pitfalls 2, 3, 4, and 8.

## 5. Localization workflow (in order)

1. **Is a runner active?** Confirm that either `hooks.enabled: true` is set in the configuration or at least one plugin contributes a hook; otherwise no runner exists and every hook is skipped.
2. **Enumerate what is registered.** In **Settings → Plugin Management**, open the plugin's detail view and confirm the hook you expect is present and runnable, and that its plugin is enabled. For configuration hooks, read the `hooks` block directly.
3. **Event name and matcher.** Check against the seven events; confirm the match value and the case-sensitive expression; test by omitting the matcher (which matches everything).
4. **Executable and interpreter.** Confirm the script has its executable bit, or invoke it explicitly via `bash`/`node`.
5. **Run it by hand.** Feed a sample hook input to the script and inspect the exit code and output — `0` plus valid JSON is healthy, `2` is a deliberate block, any other non-zero is a failure.
6. **Observe live.** Trigger the event and read the hook run records in the log (outcome, duration, error-stream preview) to distinguish a timeout from a failure from a block.
