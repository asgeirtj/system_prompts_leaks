# `runtime.chat_event_derived_write_backlog`

Pending derived chat-event writes and their retry state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_seq` uses `bigint` and is required.

  FK → `runtime.events.event_seq`

- `resources_json` uses `text` and is required.

  Default: `'[]'::text`.

- `attempts` uses `integer` and is required.

  Default: `0`.

- `last_error` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `deadlettered_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `chat_event_derived_write_backlog_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `chat_event_derived_write_backlog_pkey` covers `event_seq`.
