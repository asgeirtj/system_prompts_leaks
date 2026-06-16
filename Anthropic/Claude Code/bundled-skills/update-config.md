# Update Config Skill

Modify Claude Code configuration by updating settings.json files.

## When Hooks Are Required (Not Memory)

If the user wants something to happen automatically in response to an EVENT, they need a **hook** configured in settings.json. Memory/preferences cannot trigger automated actions.

**These require hooks:**
- "Before compacting, ask me what to preserve" → PreCompact hook
- "After writing files, run prettier" → PostToolUse hook with Write|Edit matcher
- "When I run bash commands, log them" → PreToolUse hook with Bash matcher
- "Always run tests after code changes" → PostToolUse hook

**Hook events:** PreToolUse, PostToolUse, PreCompact, PostCompact, Stop, Notification, SessionStart

## CRITICAL: Read Before Write

**Always read the existing settings file before making changes.** Merge new settings with existing ones - never replace the entire file.

## CRITICAL: Use AskUserQuestion for Ambiguity

When the user's request is ambiguous, use AskUserQuestion to clarify:
- Which settings file to modify (user/project/local)
- Whether to add to existing arrays or replace them
- Specific values when multiple options exist

## Decision: /config command vs Direct Edit

**Suggest the `/config` slash command** for these simple settings:
- `theme`, `editorMode`, `verbose`, `model`
- `language`, `alwaysThinkingEnabled`
- `permissions.defaultMode`

**Edit settings.json directly** for:
- Hooks (PreToolUse, PostToolUse, etc.)
- Complex permission rules (allow/deny arrays)
- Environment variables
- MCP server configuration
- Plugin configuration

## Workflow

1. **Clarify intent** - Ask if the request is ambiguous
2. **Read existing file** - Use Read tool on the target settings file
3. **Merge carefully** - Preserve existing settings, especially arrays
4. **Edit file** - Use Edit tool (if file doesn't exist, ask user to create it first)
5. **Confirm** - Tell user what was changed

## Merging Arrays (Important!)

When adding to permission arrays or hook arrays, **merge with existing**, don't replace:

**WRONG** (replaces existing permissions):
```json
{ "permissions": { "allow": ["Bash(npm *)"] } }
```

**RIGHT** (preserves existing + adds new):
```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",      // existing
      "Edit(.claude)",    // existing
      "Bash(npm *)"       // new
    ]
  }
}
```

## Settings File Locations

Choose the appropriate file based on scope:

| File | Scope | Git | Use For |
|------|-------|-----|---------|
| `~/.claude/settings.json` | Global | N/A | Personal preferences for all projects |
| `.claude/settings.json` | Project | Commit | Team-wide hooks, permissions, plugins |
| `.claude/settings.local.json` | Project | Gitignore | Personal overrides for this project |

Settings load in order: user → project → local (later overrides earlier).

## Settings Schema Reference

### Permissions
```json
{
  "permissions": {
    "allow": ["Bash(npm *)", "Edit(.claude)", "Read"],
    "deny": ["Bash(rm -rf *)"],
    "ask": ["Write(/etc/*)"],
    "defaultMode": "default" | "plan" | "acceptEdits" | "dontAsk",
    "additionalDirectories": ["/extra/dir"]
  }
}
```

**Permission Rule Syntax:**
- Exact match: `"Bash(npm run test)"`
- Prefix wildcard: `"Bash(git *)"` - matches `git`, `git status`, `git commit`, etc.
- Tool only: `"Read"` - allows all Read operations

### Environment Variables
```json
{
  "env": {
    "DEBUG": "true",
    "MY_API_KEY": "value"
  }
}
```

### Model & Agent
```json
{
  "model": "sonnet",  // or "fable", "opus", "haiku", full model ID
  "agent": "agent-name",
  "alwaysThinkingEnabled": true
}
```

### Attribution (Commits & PRs)
```json
{
  "attribution": {
    "commit": "Custom commit trailer text",
    "pr": "Custom PR description text"
  }
}
```
Set `commit` or `pr` to empty string `""` to hide that attribution.

### MCP Server Management
```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["server1", "server2"],
  "disabledMcpjsonServers": ["blocked-server"]
}
```

### Plugins
```json
{
  "enabledPlugins": {
    "formatter@anthropic-tools": true
  }
}
```
Plugin syntax: `plugin-name@source` where source is `claude-code-marketplace`, `claude-plugins-official`, or `builtin`.

### Other Settings
- `language`: Preferred response language (e.g., "japanese")
- `cleanupPeriodDays`: Days to keep transcripts before automatic cleanup (default: 30; minimum 1)
- `respectGitignore`: Whether to respect .gitignore (default: true)
- `spinnerTipsEnabled`: Show tips in spinner
- `spinnerVerbs`: Customize spinner verbs (`{ "mode": "append" | "replace", "verbs": [...] }`)
- `spinnerTipsOverride`: Override spinner tips (`{ "excludeDefault": true, "tips": ["Custom tip"] }`)
- `syntaxHighlightingDisabled`: Disable diff highlighting


## Hooks Configuration

Hooks run commands at specific points in Claude Code's lifecycle.

### Hook Structure
```json
{
  "hooks": {
    "EVENT_NAME": [
      {
        "matcher": "ToolName|OtherTool",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here",
            "timeout": 60,
            "statusMessage": "Running..."
          }
        ]
      }
    ]
  }
}
```

### Hook Events

| Event | Matcher | Purpose |
|-------|---------|---------|
| PermissionRequest | Tool name | Run before permission prompt |
| PreToolUse | Tool name | Run before tool, can block |
| PostToolUse | Tool name | Run after successful tool |
| PostToolUseFailure | Tool name | Run after tool fails |
| Notification | Notification type | Run on notifications |
| Stop | - | Run when Claude stops (including clear, resume, compact) |
| PreCompact | "manual"/"auto" | Before compaction |
| PostCompact | "manual"/"auto" | After compaction (receives summary) |
| UserPromptSubmit | - | When user submits |
| SessionStart | - | When session starts |

**Common tool matchers:** `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep`

### Hook Types

**1. Command Hook** - Runs a shell command:
```json
{ "type": "command", "command": "prettier --write $FILE", "timeout": 30 }
```

**2. Prompt Hook** - Evaluates a condition with LLM:
```json
{ "type": "prompt", "prompt": "Is this safe? $ARGUMENTS" }
```
Only available for tool events: PreToolUse, PostToolUse, PermissionRequest.

**3. Agent Hook** - Runs an agent with tools:
```json
{ "type": "agent", "prompt": "Verify tests pass: $ARGUMENTS" }
```
Only available for tool events: PreToolUse, PostToolUse, PermissionRequest.

### Hook Input (stdin JSON)
```json
{
  "session_id": "abc123",
  "tool_name": "Write",
  "tool_input": { "file_path": "/path/to/file.txt", "content": "..." },
  "tool_response": { "success": true }  // PostToolUse only
}
```

### Hook JSON Output

Hooks can return JSON to control behavior:

```json
{
  "systemMessage": "Warning shown to user in UI",
  "continue": false,
  "stopReason": "Message shown when blocking",
  "suppressOutput": false,
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Context injected back to model"
  }
}
```

**Fields:**
- `systemMessage` - Display a message to the user (all hooks)
- `continue` - Set to `false` to block/stop (default: true)
- `stopReason` - Message shown when `continue` is false
- `suppressOutput` - Hide stdout from transcript (default: false)
- `decision` - "block" for PostToolUse/Stop/UserPromptSubmit hooks (deprecated for PreToolUse, use hookSpecificOutput.permissionDecision instead)
- `reason` - Explanation for decision
- `hookSpecificOutput` - Event-specific output (must include `hookEventName`):
  - `additionalContext` - Text injected into model context
  - `permissionDecision` - "allow", "deny", or "ask" (PreToolUse only)
  - `permissionDecisionReason` - Reason for the permission decision (PreToolUse only)
  - `updatedInput` - Modified tool input (PreToolUse only)

### Common Patterns

**Auto-format after writes:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_response.filePath // .tool_input.file_path' | { read -r f; prettier --write \\"$f\\"; } 2>/dev/null || true"
      }]
    }]
  }
}
```

**Log all bash commands:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.command' >> ~/.claude/bash-log.txt"
      }]
    }]
  }
}
```

**Stop hook that displays message to user:**

Command must output JSON with `systemMessage` field:
```bash
# Example command that outputs: {"systemMessage": "Session complete!"}
echo '{"systemMessage": "Session complete!"}'
```

**Run tests after code changes:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path // .tool_response.filePath' | grep -E '\\\\.(ts|js)$' && npm test || true"
      }]
    }]
  }
}
```


## Constructing a Hook (with verification)

Given an event, matcher, target file, and desired behavior, follow this flow. Each step catches a different failure class — a hook that silently does nothing is worse than no hook.

1. **Dedup check.** Read the target file. If a hook already exists on the same event+matcher, show the existing command and ask: keep it, replace it, or add alongside.

2. **Construct the command for THIS project — don't assume.** The hook receives JSON on stdin. Build a command that:
   - Extracts any needed payload safely — use `jq -r` into a quoted variable or `{ read -r f; ... "$f"; }`, NOT unquoted `| xargs` (splits on spaces)
   - Invokes the underlying tool the way this project runs it (npx/bunx/yarn/pnpm? Makefile target? globally-installed?)
   - Skips inputs the tool doesn't handle (formatters often have `--ignore-unknown`; if not, guard by extension)
   - Stays RAW for now — no `|| true`, no stderr suppression. You'll wrap it after the pipe-test passes.

3. **Pipe-test the raw command.** Synthesize the stdin payload the hook will receive and pipe it directly:
   - `Pre|PostToolUse` on `Write|Edit`: `echo '{"tool_name":"Edit","tool_input":{"file_path":"<a real file from this repo>"}}' | <cmd>`
   - `Pre|PostToolUse` on `Bash`: `echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | <cmd>`
   - `Stop`/`UserPromptSubmit`/`SessionStart`: most commands don't read stdin, so `echo '{}' | <cmd>` suffices

   Check exit code AND side effect (file actually formatted, test actually ran). If it fails you get a real error — fix (wrong package manager? tool not installed? jq path wrong?) and retest. Once it works, wrap with `2>/dev/null || true` (unless the user wants a blocking check).

4. **Write the JSON.** Merge into the target file (schema shape in the "Hook Structure" section above). If this creates `.claude/settings.local.json` for the first time, add it to .gitignore — the Write tool doesn't auto-gitignore it.

5. **Validate syntax + schema in one shot:**

   `jq -e '.hooks.<event>[] | select(.matcher == "<matcher>") | .hooks[] | select(.type == "command") | .command' <target-file>`

   Exit 0 + prints your command = correct. Exit 4 = matcher doesn't match. Exit 5 = malformed JSON or wrong nesting. A broken settings.json silently disables ALL settings from that file — fix any pre-existing malformation too.

6. **Prove the hook fires** — only for `Pre|PostToolUse` on a matcher you can trigger in-turn (`Write|Edit` via Edit, `Bash` via Bash). `Stop`/`UserPromptSubmit`/`SessionStart` fire outside this turn — skip to step 7.

   For a **formatter** on `PostToolUse`/`Write|Edit`: introduce a detectable violation via Edit (two consecutive blank lines, bad indentation, missing semicolon — something this formatter corrects; NOT trailing whitespace, Edit strips that before writing), re-read, confirm the hook **fixed** it. For **anything else**: temporarily prefix the command in settings.json with `echo "$(date) hook fired" >> /tmp/claude-hook-check.txt; `, trigger the matching tool (Edit for `Write|Edit`, a harmless `true` for `Bash`), read the sentinel file.

   **Always clean up** — revert the violation, strip the sentinel prefix — whether the proof passed or failed.

   **If proof fails but pipe-test passed and `jq -e` passed**: the settings watcher isn't watching `.claude/` — it only watches directories that had a settings file when this session started. The hook is written correctly. Tell the user to open `/hooks` once (reloads config) or restart — you can't do this yourself; `/hooks` is a user UI menu and opening it ends this turn.

7. **Handoff.** Tell the user the hook is live (or needs `/hooks`/restart per the watcher caveat). Point them at `/hooks` to review, edit, or disable it later. The UI only shows "Ran N hooks" if a hook errors or is slow — silent success is invisible by design.


## Example Workflows

### Adding a Hook

User: "Format my code after Claude writes it"

1. **Clarify**: Which formatter? (prettier, gofmt, etc.)
2. **Read**: `.claude/settings.json` (or create if missing)
3. **Merge**: Add to existing hooks, don't replace
4. **Result**:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_response.filePath // .tool_input.file_path' | { read -r f; prettier --write \\"$f\\"; } 2>/dev/null || true"
      }]
    }]
  }
}
```

### Adding Permissions

User: "Allow npm commands without prompting"

1. **Read**: Existing permissions
2. **Merge**: Add `Bash(npm *)` to allow array
3. **Result**: Combined with existing allows

### Environment Variables

User: "Set DEBUG=true"

1. **Decide**: User settings (global) or project settings?
2. **Read**: Target file
3. **Merge**: Add to env object
```json
{ "env": { "DEBUG": "true" } }
```

## Common Mistakes to Avoid

1. **Replacing instead of merging** - Always preserve existing settings
2. **Wrong file** - Ask user if scope is unclear
3. **Invalid JSON** - Validate syntax after changes
4. **Forgetting to read first** - Always read before write

## Troubleshooting Hooks

If a hook isn't running:
1. **Check the settings file** - Read ~/.claude/settings.json or .claude/settings.json
2. **Verify JSON syntax** - Invalid JSON silently fails
3. **Check the matcher** - Does it match the tool name? (e.g., "Bash", "Write", "Edit")
4. **Check hook type** - Is it "command", "prompt", or "agent"?
5. **Test the command** - Run the hook command manually to see if it works
6. **Use --debug** - Run `claude --debug` to see hook execution logs

---

> **Runtime injection note:** The schema below is generated at runtime from Zod definitions (function `vz8` in the binary), not stored as static text. The `## User Request` section (user's original message) is also appended at load time.

## Full Settings JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "$schema": {
      "description": "JSON Schema reference for Claude Code settings",
      "type": "string"
    },
    "apiKeyHelper": {
      "description": "Path to a script that outputs authentication values",
      "type": "string"
    },
    "proxyAuthHelper": {
      "description": "Shell command that outputs a Proxy-Authorization header value (EAP)",
      "type": "string"
    },
    "awsCredentialExport": {
      "description": "Path to a script that exports AWS credentials",
      "type": "string"
    },
    "awsAuthRefresh": {
      "description": "Path to a script that refreshes AWS authentication",
      "type": "string"
    },
    "gcpAuthRefresh": {
      "description": "Command to refresh GCP authentication (e.g., gcloud auth application-default login)",
      "type": "string"
    },
    "policyHelper": {
      "description": "Executable that computes managed settings at startup. Honored only from admin-controlled policy sources.",
      "type": "object",
      "properties": {
        "path": {
          "description": "Absolute path to the helper executable",
          "type": "string"
        },
        "timeoutMs": {
          "type": "integer",
          "minimum": 1000,
          "maximum": 9007199254740991
        },
        "refreshIntervalMs": {
          "anyOf": [
            { "type": "number", "const": 0 },
            { "type": "integer", "minimum": 60000, "maximum": 9007199254740991 }
          ]
        }
      },
      "required": ["path"]
    },
    "fileSuggestion": {
      "description": "Custom file suggestion configuration for @ mentions",
      "type": "object",
      "properties": {
        "type": { "type": "string", "const": "command" },
        "command": { "type": "string" }
      },
      "required": ["type", "command"]
    },
    "respectGitignore": {
      "description": "Whether file picker should respect .gitignore files (default: true). Note: .ignore files are always respected.",
      "type": "boolean"
    },
    "breakReminder": {
      "description": "@internal Opt-in break reminder. When enabled, shows a dismissible nudge after sustained continuous use. Never blocks — just a friendly heads-up.",
      "type": "object",
      "properties": {
        "enabled": { "description": "Show a friendly nudge after sustained continuous use (default false).", "type": "boolean" },
        "intervalMinutes": { "description": "Minutes of continuous use before the reminder fires (default 120).", "type": "integer", "exclusiveMinimum": 0, "maximum": 9007199254740991 },
        "breakThresholdMinutes": { "description": "Minutes of inactivity that count as a break and reset the timer (default 15)", "type": "integer", "exclusiveMinimum": 0, "maximum": 9007199254740991 },
        "message": { "description": "Custom reminder text. Leave unset for a rotating set of friendly nudges.", "type": "string" }
      }
    },
    "quietHours": {
      "description": "@internal Opt-in quiet hours. When enabled, shows a single soft nudge per session while inside the configured local-time window. Never blocks.",
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "start": { "description": "Start of the quiet-hours window, 24-hour local time \"HH:MM\".", "type": "string", "pattern": "^([01]?\\d|2[0-3]):[0-5]\\d$" },
        "end": { "description": "End of the quiet-hours window, 24-hour local time \"HH:MM\". May be earlier than start for an overnight range.", "type": "string", "pattern": "^([01]?\\d|2[0-3]):[0-5]\\d$" }
      }
    },
    "cleanupPeriodDays": {
      "description": "Number of days to retain chat transcripts before automatic cleanup (default: 30). Minimum 1.",
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "skillListingMaxDescChars": {
      "description": "Per-skill description character cap in the skill listing sent to Claude (default: 1536).",
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "skillListingBudgetFraction": {
      "description": "Fraction of the context window reserved for the skill listing (default: 0.01 = 1%).",
      "type": "number",
      "exclusiveMinimum": 0,
      "maximum": 1
    },
    "env": {
      "description": "Environment variables to set for Claude Code sessions",
      "type": "object",
      "propertyNames": { "type": "string" },
      "additionalProperties": { "type": "string" }
    },
    "attribution": {
      "description": "Customize attribution text for commits and PRs. Each field defaults to the standard Claude Code attribution if not set.",
      "type": "object",
      "properties": {
        "commit": { "description": "Attribution text for git commits. Empty string hides attribution.", "type": "string" },
        "pr": { "description": "Attribution text for pull request descriptions. Empty string hides attribution.", "type": "string" }
      }
    },
    "includeCoAuthoredBy": {
      "description": "Deprecated: Use attribution instead. Whether to include Claude's co-authored by attribution in commits and PRs (defaults to true)",
      "type": "boolean"
    },
    "includeGitInstructions": {
      "description": "Include built-in commit and PR workflow instructions in Claude's system prompt (default: true)",
      "type": "boolean"
    },
    "permissions": {
      "description": "Tool usage permissions configuration",
      "type": "object",
      "properties": {
        "allow": { "type": "array", "items": { "type": "string" } },
        "deny": { "type": "array", "items": { "type": "string" } },
        "ask": { "type": "array", "items": { "type": "string" } },
        "defaultMode": { "type": "string", "enum": ["acceptEdits", "auto", "bypassPermissions", "default", "dontAsk", "plan"] },
        "disableBypassPermissionsMode": { "type": "string", "enum": ["disable"] },
        "disableAutoMode": { "type": "string", "enum": ["disable"] },
        "additionalDirectories": { "type": "array", "items": { "type": "string" } }
      }
    },
    "model": { "description": "Override the default model used by Claude Code", "type": "string" },
    "fallbackModel": {
      "description": "Fallback model(s) tried in order when the primary model is overloaded or unavailable.",
      "type": "array",
      "items": { "type": "string" }
    },
    "availableModels": {
      "description": "Allowlist of models that users can select. If undefined, all models are available. If empty array, only the default model is available.",
      "type": "array",
      "items": { "type": "string" }
    },
    "enforceAvailableModels": { "type": "boolean" },
    "modelOverrides": {
      "description": "Override mapping from Anthropic model ID to provider-specific model ID.",
      "type": "object",
      "propertyNames": { "type": "string" },
      "additionalProperties": { "type": "string" }
    },
    "enableAllProjectMcpServers": { "description": "Whether to automatically approve all MCP servers in the project", "type": "boolean" },
    "enabledMcpjsonServers": { "type": "array", "items": { "type": "string" } },
    "disabledMcpjsonServers": { "type": "array", "items": { "type": "string" } },
    "skillOverrides": {
      "description": "Per-skill listing overrides keyed by skill name. \"name-only\" lists the skill without its description; \"user-invocable-only\" hides it from the model but keeps /name; \"off\" hides it from both.",
      "type": "object",
      "propertyNames": { "type": "string" },
      "additionalProperties": { "type": "string", "enum": ["on", "name-only", "user-invocable-only", "off"] }
    },
    "disableBundledSkills": { "description": "Disable the skills and workflows that ship with Claude Code.", "type": "boolean" },
    "hooks": {
      "description": "Custom commands to run before/after tool executions",
      "type": "object",
      "propertyNames": {
        "anyOf": [
          { "type": "string", "enum": ["PreToolUse", "PostToolUse", "PostToolUseFailure", "PostToolBatch", "Notification", "UserPromptSubmit", "UserPromptExpansion", "SessionStart", "SessionEnd", "Stop", "StopFailure", "SubagentStart", "SubagentStop", "PreCompact", "PostCompact", "PermissionRequest", "PermissionDenied", "Setup", "TeammateIdle", "TaskCreated", "TaskCompleted", "Elicitation", "ElicitationResult", "ConfigChange", "WorktreeCreate", "WorktreeRemove", "InstructionsLoaded", "CwdChanged", "FileChanged", "MessageDisplay"] },
          { "not": {} }
        ]
      },
      "additionalProperties": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "matcher": { "description": "String pattern to match (e.g. tool names like \"Write\")", "type": "string" },
            "hooks": {
              "type": "array",
              "items": {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {
                      "type": { "type": "string", "const": "command" },
                      "command": { "type": "string" },
                      "args": { "type": "array", "items": { "type": "string" } },
                      "if": { "description": "Permission rule syntax to filter when this hook runs.", "type": "string" },
                      "shell": { "type": "string", "enum": ["bash", "powershell"] },
                      "timeout": { "type": "number", "exclusiveMinimum": 0 },
                      "statusMessage": { "type": "string" },
                      "once": { "type": "boolean" },
                      "async": { "type": "boolean" },
                      "asyncRewake": { "type": "boolean" },
                      "rewakeMessage": { "type": "string", "minLength": 1 },
                      "rewakeSummary": { "type": "string", "minLength": 1 }
                    },
                    "required": ["type", "command"]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": { "type": "string", "const": "prompt" },
                      "prompt": { "type": "string" },
                      "if": { "type": "string" },
                      "timeout": { "type": "number", "exclusiveMinimum": 0 },
                      "model": { "type": "string" },
                      "continueOnBlock": { "type": "boolean" },
                      "statusMessage": { "type": "string" },
                      "once": { "type": "boolean" }
                    },
                    "required": ["type", "prompt"]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": { "type": "string", "const": "agent" },
                      "prompt": { "type": "string" },
                      "if": { "type": "string" },
                      "timeout": { "type": "number", "exclusiveMinimum": 0 },
                      "model": { "type": "string" },
                      "statusMessage": { "type": "string" },
                      "once": { "type": "boolean" }
                    },
                    "required": ["type", "prompt"]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": { "type": "string", "const": "http" },
                      "url": { "type": "string", "format": "uri" },
                      "if": { "type": "string" },
                      "timeout": { "type": "number", "exclusiveMinimum": 0 },
                      "headers": { "type": "object", "additionalProperties": { "type": "string" } },
                      "allowedEnvVars": { "type": "array", "items": { "type": "string" } },
                      "statusMessage": { "type": "string" },
                      "once": { "type": "boolean" }
                    },
                    "required": ["type", "url"]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": { "type": "string", "const": "mcp_tool" },
                      "server": { "type": "string" },
                      "tool": { "type": "string" },
                      "input": { "type": "object" },
                      "if": { "type": "string" },
                      "timeout": { "type": "number", "exclusiveMinimum": 0 },
                      "statusMessage": { "type": "string" },
                      "once": { "type": "boolean" }
                    },
                    "required": ["type", "server", "tool"]
                  }
                ]
              }
            }
          },
          "required": ["hooks"]
        }
      }
    },
    "worktree": {
      "type": "object",
      "properties": {
        "symlinkDirectories": { "type": "array", "items": { "type": "string" } },
        "sparsePaths": { "type": "array", "items": { "type": "string" } },
        "baseRef": { "type": "string", "enum": ["fresh", "head"] },
        "bgIsolation": { "type": "string", "enum": ["worktree", "none"] }
      }
    },
    "disableAllHooks": { "type": "boolean" },
    "disableAgentView": { "type": "boolean" },
    "disableRemoteControl": { "type": "boolean" },
    "disableWorkflows": { "type": "boolean" },
    "disableArtifact": { "type": "boolean" },
    "enableWorkflows": { "type": "boolean" },
    "workflowKeywordTriggerEnabled": { "type": "boolean" },
    "disableSkillShellExecution": { "type": "boolean" },
    "defaultShell": { "type": "string", "enum": ["bash", "powershell"] },
    "allowManagedHooksOnly": { "type": "boolean" },
    "allowedHttpHookUrls": { "type": "array", "items": { "type": "string" } },
    "httpHookAllowedEnvVars": { "type": "array", "items": { "type": "string" } },
    "allowManagedPermissionRulesOnly": { "type": "boolean" },
    "allowManagedMcpServersOnly": { "type": "boolean" },
    "allowAllClaudeAiMcps": { "type": "boolean" },
    "statusLine": {
      "type": "object",
      "properties": {
        "type": { "type": "string", "const": "command" },
        "command": { "type": "string" },
        "padding": { "type": "number" },
        "refreshInterval": { "type": "number", "minimum": 1 },
        "hideVimModeIndicator": { "type": "boolean" }
      },
      "required": ["type", "command"]
    },
    "enabledPlugins": {
      "type": "object",
      "propertyNames": { "type": "string" },
      "additionalProperties": { "anyOf": [{ "type": "array", "items": { "type": "string" } }, { "type": "boolean" }, { "not": {} }] }
    },
    "outputStyle": { "type": "string" },
    "viewMode": { "type": "string", "enum": ["default", "verbose", "focus"] },
    "language": { "description": "Preferred language for Claude responses and voice dictation", "type": "string" },
    "sandbox": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "failIfUnavailable": { "type": "boolean" },
        "autoAllowBashIfSandboxed": { "type": "boolean" },
        "allowUnsandboxedCommands": { "type": "boolean" },
        "network": {
          "type": "object",
          "properties": {
            "allowedDomains": { "type": "array", "items": { "type": "string" } },
            "deniedDomains": { "type": "array", "items": { "type": "string" } },
            "allowManagedDomainsOnly": { "type": "boolean" },
            "allowUnixSockets": { "type": "array", "items": { "type": "string" } },
            "allowAllUnixSockets": { "type": "boolean" },
            "allowLocalBinding": { "type": "boolean" },
            "allowMachLookup": { "type": "array", "items": { "type": "string" } },
            "httpProxyPort": { "type": "number" },
            "socksProxyPort": { "type": "number" }
          }
        },
        "filesystem": {
          "type": "object",
          "properties": {
            "allowWrite": { "type": "array", "items": { "type": "string" } },
            "denyWrite": { "type": "array", "items": { "type": "string" } },
            "denyRead": { "type": "array", "items": { "type": "string" } },
            "allowRead": { "type": "array", "items": { "type": "string" } }
          }
        },
        "excludedCommands": { "type": "array", "items": { "type": "string" } }
      }
    },
    "feedbackSurveyRate": { "type": "number", "minimum": 0, "maximum": 1 },
    "spinnerTipsEnabled": { "type": "boolean" },
    "spinnerVerbs": {
      "type": "object",
      "properties": {
        "mode": { "type": "string", "enum": ["append", "replace"] },
        "verbs": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["mode", "verbs"]
    },
    "spinnerTipsOverride": {
      "type": "object",
      "properties": {
        "excludeDefault": { "type": "boolean" },
        "tips": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["tips"]
    },
    "syntaxHighlightingDisabled": { "type": "boolean" },
    "alwaysThinkingEnabled": { "type": "boolean" },
    "effortLevel": { "type": "string", "enum": ["low", "medium", "high", "xhigh"] },
    "ultracode": { "type": "boolean" },
    "autoCompactWindow": { "type": "integer", "minimum": 100000, "maximum": 1000000 },
    "advisorModel": { "type": "string" },
    "fastMode": { "type": "boolean" },
    "fastModePerSessionOptIn": { "type": "boolean" },
    "promptSuggestionEnabled": { "type": "boolean" },
    "showClearContextOnPlanAccept": { "type": "boolean" },
    "agent": { "description": "Name of an agent to use for the main thread.", "type": "string" },
    "companyAnnouncements": { "type": "array", "items": { "type": "string" } },
    "remote": {
      "type": "object",
      "properties": {
        "defaultEnvironmentId": { "type": "string" }
      }
    },
    "autoUpdatesChannel": { "type": "string", "enum": ["latest", "stable", "rc"] },
    "minimumVersion": { "type": "string" },
    "requiredMinimumVersion": { "type": "string" },
    "requiredMaximumVersion": { "type": "string" },
    "plansDirectory": { "type": "string" },
    "tui": { "type": "string", "enum": ["default", "fullscreen"] },
    "voice": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "mode": { "type": "string", "enum": ["hold", "tap"] },
        "autoSubmit": { "type": "boolean" }
      }
    },
    "channelsEnabled": { "type": "boolean" },
    "prefersReducedMotion": { "type": "boolean" },
    "autoMemoryEnabled": { "type": "boolean" },
    "autoMemoryDirectory": { "type": "string" },
    "autoDreamEnabled": { "type": "boolean" },
    "showThinkingSummaries": { "type": "boolean" },
    "skipDangerousModePermissionPrompt": { "type": "boolean" },
    "skipWorkflowUsageWarning": { "type": "boolean" },
    "theme": {
      "anyOf": [
        { "type": "string", "enum": ["auto", "dark", "light", "light-daltonized", "dark-daltonized", "light-ansi", "dark-ansi"] },
        { "type": "string", "pattern": "^custom:.*" }
      ]
    },
    "editorMode": { "type": "string", "enum": ["normal", "vim"] },
    "verbose": { "type": "boolean" },
    "preferredNotifChannel": { "type": "string", "enum": ["auto", "iterm2", "iterm2_with_bell", "terminal_bell", "kitty", "ghostty", "notifications_disabled"] },
    "autoCompactEnabled": { "type": "boolean" },
    "precomputeCompactionEnabled": { "type": "boolean" },
    "switchModelsOnFlag": { "type": "boolean" },
    "autoScrollEnabled": { "type": "boolean" },
    "wheelScrollAccelerationEnabled": { "type": "boolean" },
    "fileCheckpointingEnabled": { "type": "boolean" },
    "showTurnDuration": { "type": "boolean" },
    "showMessageTimestamps": { "type": "boolean" },
    "terminalProgressBarEnabled": { "type": "boolean" },
    "todoFeatureEnabled": { "type": "boolean" },
    "teammateMode": { "type": "string", "enum": ["auto", "tmux", "in-process"] },
    "remoteControlAtStartup": { "type": "boolean" },
    "isolatePeerMachines": { "type": "boolean" },
    "daemonColdStart": { "type": "string", "enum": ["transient", "ask"] },
    "autoUploadSessions": { "type": "boolean" },
    "inputNeededNotifEnabled": { "type": "boolean" },
    "agentPushNotifEnabled": { "type": "boolean" },
    "skipAutoPermissionPrompt": { "type": "boolean" },
    "useAutoModeDuringPlan": { "type": "boolean" },
    "autoMode": {
      "type": "object",
      "properties": {
        "allow": { "type": "array", "items": { "type": "string" } },
        "soft_deny": { "type": "array", "items": { "type": "string" } },
        "hard_deny": { "type": "array", "items": { "type": "string" } },
        "environment": { "type": "array", "items": { "type": "string" } }
      }
    },
    "disableDeepLinkRegistration": { "type": "string", "enum": ["disable"] },
    "voiceEnabled": { "type": "boolean" },
    "defaultView": { "type": "string", "enum": ["chat", "transcript"] },
    "claudeMd": { "description": "CLAUDE.md-style instructions injected as organization-managed memory. Only honored from managed/policy settings.", "type": "string" },
    "claudeMdExcludes": { "type": "array", "items": { "type": "string" } },
    "sshConfigs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "sshHost": { "type": "string" },
          "sshPort": { "type": "integer" },
          "sshIdentityFile": { "type": "string" },
          "startDirectory": { "type": "string" }
        },
        "required": ["id", "name", "sshHost"]
      }
    },
    "forceLoginMethod": { "type": "string", "enum": ["claudeai", "console", "gateway"] },
    "forceLoginOrgUUID": { "anyOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
    "forceRemoteSettingsRefresh": { "type": "boolean" },
    "doneMeansMerged": { "type": "boolean" },
    "totalTokensReminder": { "type": "string", "enum": ["off", "infinite", "fixed", "countdown"] }
  },
  "additionalProperties": {}
}
```

> Note: The full runtime schema includes deeply nested `extraKnownMarketplaces`, `strictKnownMarketplaces`, `blockedMarketplaces`, `allowedMcpServers`, `deniedMcpServers`, and `pluginConfigs` objects with extensive marketplace/plugin source type definitions (github, git, npm, url, file, directory, git-subdir, hostPattern, pathPattern, settings, skills-dir, unsupported). These are omitted here for readability but are present in the schema injected into conversation context. The `strictPluginOnlyCustomization` field accepts `boolean | ("skills" | "agents" | "hooks" | "mcp")[]`.
