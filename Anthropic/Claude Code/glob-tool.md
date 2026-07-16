<!-- Glob is NOT in the default main-agent tool set on native builds as of Claude Code 2.1.211 (replaced by embedded bfs via Bash since ~2.1.117, April 2026). Search subagents (Explore etc.) still receive it, and it can be restored to the main agent by explicitly listing it in a full `--tools` whitelist. The definition below is identical in both cases — verified 2026-07-16 against a 2.1.211 main-agent `--tools` capture and an Explore subagent extraction. -->

# Glob

Fast file pattern matching. Supports glob patterns like "**/*.js" or "src/**/*.ts". Returns matching file paths sorted by modification time.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pattern": {
      "description": "The glob pattern to match files against",
      "type": "string"
    },
    "path": {
      "description": "The directory to search in. If not specified, the current working directory will be used. IMPORTANT: Omit this field to use the default directory. DO NOT enter \"undefined\" or \"null\" - simply omit it for the default behavior. Must be a valid directory path if provided.",
      "type": "string"
    }
  },
  "required": [
    "pattern"
  ],
  "additionalProperties": false
}
```
