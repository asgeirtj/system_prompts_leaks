# `runtime.message_reactions`

Reactions recorded against messages.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `message_id` uses `text` and is required.

  FK → `runtime.messages.message_id`

- `reaction_emoji` uses `text` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `message_reactions_message_id_fkey` covers `message_id`. References [runtime.messages](/opt/muse/skills/muse_db/references/tables/runtime.messages.md), columns `message_id`.

- PRIMARY KEY `message_reactions_pkey` covers `message_id`.
