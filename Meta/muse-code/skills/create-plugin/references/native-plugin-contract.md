# Native Muse Plugin Contract

This reference summarizes the manifest accepted by the current Muse validator.
The Plugin Creator instructions remain authoritative for reservation, mutation,
validation order, correction limits, and reporting.

## Package Layout

A native plugin is a new directory in the current workspace. Its manifest is:

```text
.muse-plugin/plugin.json
```

Every file named by a capability is relative to the plugin root. A minimal manifest
contains:

```json
{
  "schemaVersion": 1,
  "name": "example-plugin",
  "displayName": "Example Plugin",
  "version": "0.1.0",
  "description": "One plain-language sentence.",
  "compat": {
    "source": "native",
    "manifestDir": ".muse-plugin"
  },
  "capabilities": {
    "skills": [],
    "commands": [],
    "hooks": [],
    "mcpServers": [],
    "reminders": []
  }
}
```

Use only fields required by the request. The installed validator decides whether an
omitted optional field is acceptable.

## Identifiers

Plugin and capability IDs use this portable grammar:

```text
^[a-z0-9][a-z0-9._-]{0,79}$
```

The basename before the first dot must not case-fold to `CON`, `PRN`, `AUX`, `NUL`,
`COM1` through `COM9`, or `LPT1` through `LPT9`. Plugin IDs `loop` and `muse-core`
are reserved by the product bundle.

## Paths

- Use relative UTF-8 paths and `/` separators in the manifest.
- Reject absolute paths, parent traversal, backslashes, and blank paths.
- Create every referenced file before validation.
- Canonicalize containment; a symlink must not escape the plugin or workspace root.
- Keep generated component names portable across macOS, Linux, and Windows.

## Capability Fields

### Skills

```json
{"id":"review","path":"skills/review/SKILL.md","enabledDefault":false}
```

The target is a UTF-8 `SKILL.md` with valid frontmatter. `enabledDefault` is
optional; omit it only when the requested activation behavior is clear.

### Commands

```json
{"id":"summarize","path":"commands/summarize.md","enabledDefault":true}
```

The target is a UTF-8 Markdown command template.

### Hooks

```json
{
  "id":"pre-check",
  "event":"PreToolUse",
  "command":["sh","hooks/pre-check.sh"],
  "timeoutMs":1000,
  "statusMessage":"Checking plugin policy"
}
```

The command is structured argv, not a shell string. If an argv element names a
relative source path, that regular file must exist beneath the plugin root. Hook
source paths cannot be shared by two hook IDs.

### MCP Servers

For a local stdio server:

```json
{
  "id":"workspace-index",
  "transport":"stdio",
  "command":["python3","mcp/server.py"]
}
```

`transport` defaults to `stdio`. An HTTP transport instead requires a non-empty
`url`; do not invent an endpoint. A custom model tool is exposed by an MCP server,
not by a direct `tools` capability.

### Reminders

```json
{
  "id":"review-policy",
  "path":"reminders/review-policy.md",
  "tools":["read_file"],
  "blocking":false,
  "decision":{
    "version":1,
    "envelope":{"version":1,"template":"<system-reminder>\n{text}\n</system-reminder>"},
    "deliveryRole":"developer",
    "...":"copy the remaining executable fields from capability-examples.json"
  }
}
```

The duty file must exist and be UTF-8. `decision` is required, including its V1
`envelope` and `deliveryRole` authority. Optional policy
fields are `defaultPriority`, `maxPriority`, `maxChildSteps`,
`maxInstallsPerRun`, `reasoningEffort`, and `context`. Add them only when
requested and after checking the executable examples.

## Unsupported Families

The validator rejects direct capability keys `tools`, `agents`, `outputStyles`,
`settings`, and `apps`. Do not translate them into guessed fields. Ask the user to
restate a custom tool as an MCP server when that matches their intent.

## Validation

Run each generated skill first:

```json
["muse","skills","validate","<skill-directory>","--json"]
```

Then run the plugin validator:

```json
["muse","plugins","validate","<plugin-directory>","--json"]
```

A result is clean only when the process starts, exits zero, returns parseable JSON,
sets top-level `valid` to `true`, and returns an empty `diagnostics` array. Warnings
are failures for creation. Correct one validation layer at a time, with no more than
three correction rounds after its first failed result.

## Creation Boundary

Reserve one absent destination with a native atomic no-replace directory creation
before writing artifacts. Recheck canonical workspace containment immediately after
reservation. Stop on occupancy, denial, cancellation, or any failed containment
check. Never install, enable, trust, execute, fetch, update, or publish the draft.
