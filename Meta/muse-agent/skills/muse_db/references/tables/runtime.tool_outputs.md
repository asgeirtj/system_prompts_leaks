# `runtime.tool_outputs`

Recorded tool results and their call references.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `tool_output_id` uses `bigint` and is required.

  Default: `nextval('runtime.tool_outputs_tool_output_id_seq'::regclass)`.

  Local row identifier (primary key).

- `event_seq` uses `bigint` and is required.

  FK → `runtime.events.event_seq`

- `call_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `runtime.workflow_agent_calls.call_id`.

- `status` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `output_text` uses `text` and is nullable.

- `error_text` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `tool_outputs_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `tool_outputs_pkey` covers `tool_output_id`.

- UNIQUE `tool_outputs_event_seq_key` covers `event_seq`.
