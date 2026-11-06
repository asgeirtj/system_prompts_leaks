# `agent.recovery_owner_terminal_events`

Terminal events claimed for a durable recovery owner and generation.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `recovery_class` uses `text` and is required.

  FK → `agent.recovery_owners.recovery_class`

- `owner_id` uses `text` and is required.

  FK → `agent.recovery_owners.owner_id`

- `generation` uses `bigint` and is required.

  Local row identifier (primary key).

- `event_type` uses `text` and is required.

  Local row identifier (primary key).

- `claimed_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `recovery_owner_terminal_events_recovery_class_owner_id_fkey` covers `recovery_class`, `owner_id`. References [agent.recovery_owners](/opt/muse/skills/muse_db/references/tables/agent.recovery_owners.md), columns `recovery_class`, `owner_id`.

- PRIMARY KEY `recovery_owner_terminal_events_pkey` covers `recovery_class`, `owner_id`, `generation`, `event_type`.
