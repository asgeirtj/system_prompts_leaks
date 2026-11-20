# `agent.chat_preferences`

Stored chat preferences and the active root agent.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `id` uses `integer` and is required.

  Local row identifier (primary key).

- `active_root_id` uses `text` and is required.

  Soft local reference → `agent.agents.id`.

- `verbose` uses `bigint` and is required.

  Default: `0`.

- `usage_mode` uses `text` and is required.

  Default: `'off'::text`.

- `active_root_cleared_at_ms` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `chat_preferences_pkey` covers `id`.
