# `agent.runtime_state`

Current context and event positions for each agent.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `current_context_seq` uses `integer` and is required.

  Default: `0`.

- `last_event_seq` uses `bigint` and is nullable.

  FK → `runtime.events.event_seq`

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `runtime_state_last_event_seq_fkey` covers `last_event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `runtime_state_pkey` covers `agent_id`.
