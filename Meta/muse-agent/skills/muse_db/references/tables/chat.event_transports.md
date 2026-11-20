# `chat.event_transports`

Provider attribution for chat events.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `provider` uses `text` and is required.

  Local row identifier (primary key).

- `event_seq` uses `bigint` and is required.

  FK → `runtime.events.event_seq`

## Keys and relationships

- FOREIGN KEY `event_transports_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `event_transports_pkey` covers `provider`, `event_seq`.
