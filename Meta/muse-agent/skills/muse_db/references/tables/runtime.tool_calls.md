# `runtime.tool_calls`

Recorded tool calls, their inputs, names and execution state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `tool_call_id` uses `bigint` and is required.

  Default: `nextval('runtime.tool_calls_tool_call_id_seq'::regclass)`.

  Local row identifier (primary key).

- `event_seq` uses `bigint` and is required.

  FK → `runtime.events.event_seq`

- `call_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `runtime.workflow_agent_calls.call_id`.

- `tool_name` uses `text` and is required.

- `server_name` uses `text` and is nullable.

- `status` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `arguments_json` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `tool_calls_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `tool_calls_pkey` covers `tool_call_id`.

- UNIQUE `tool_calls_call_id_key` covers `call_id`.

- UNIQUE `tool_calls_event_seq_key` covers `event_seq`.
