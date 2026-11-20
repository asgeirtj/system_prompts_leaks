# `runtime.messages`

Stored message roles, text and event references.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `message_id` uses `text` and is required.

  Local row identifier (primary key).

- `event_seq` uses `bigint` and is required.

  FK → `runtime.events.event_seq`

- `role` uses `runtime.message_role` and is required.

- `prompt_rendering_id` uses `bigint` and is nullable.

  Prompt-rendering identifier; no queryable owner table.

- `author_label` uses `text` and is nullable.

- `provider_message_id` uses `text` and is nullable.

  External/provider identifier; no Muse PostgreSQL owner table.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `body` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `messages_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `messages_pkey` covers `message_id`.

- UNIQUE `messages_event_seq_key` covers `event_seq`.
