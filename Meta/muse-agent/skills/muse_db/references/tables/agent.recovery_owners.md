# `agent.recovery_owners`

Durable ownership and generation of recoverable agent work.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `recovery_class` uses `text` and is required.

  Local row identifier (primary key).

- `owner_id` uses `text` and is required.

  Local row identifier (primary key).

- `generation` uses `bigint` and is required.

  Default: `1`.

- `agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `active_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `terminal_at` uses `timestamp with time zone` and is nullable.

- `terminal_status` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `recovery_owners_pkey` covers `recovery_class`, `owner_id`.

- UNIQUE `recovery_owners_agent_id_key` covers `agent_id`.
