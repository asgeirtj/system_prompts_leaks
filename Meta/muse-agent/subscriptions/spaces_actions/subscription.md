# Web artifact actions

PostgreSQL ledger of every web artifact action invoked on this device, whether by a user
UI tap, an agent tool call, or a cron schedule. Every accepted invocation
creates one row, then updates that row when the worker succeeds, fails, or is
cancelled.

## When To Use

The web artifact's database holds current state and the action invocation timeline. Use this
ledger for historical questions, audit questions, and diagnostic questions where
the user is asking about recent web artifact activity or action failures.

## How To Read

Read the ledger read-only from the daemon sandbox API (no database access
required). Filter by `space_slug`, by `invocation_id`, or by `source_kind`:

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/spaces-actions?space_slug=<space_slug>&limit=20"
```

Results are newest first by invocation time. The response is
`{"ok":true,"result":{"invocations":[...]}}`. Each invocation has:

- `invocation_id` - stable id correlating HTTP request, runtime telemetry, worker logs, and debug UI rows.
- `space_slug` - the web artifact the invocation belongs to (useful for cross-artifact reads by `invocation_id` or `source_kind`).
- `action` - action name.
- `status` - `in_flight`, `succeeded`, `failed`, or `cancelled`.
- `invoked_at_ms` - invocation time as Unix milliseconds.
- `settled_at_ms` - settlement time as Unix milliseconds (absent while in flight).
- `source_kind`, `source_ref`, `trigger_ref` - invocation attribution.
- `args_preview` - bounded JSON snapshot of request args.
- `result_preview` - bounded JSON snapshot of a unary success result.
- `error` - truncated worker error message for failed actions.

## Query Examples

A single invocation by id (across all web artifacts):

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/spaces-actions?invocation_id=<invocation_id>"
```
