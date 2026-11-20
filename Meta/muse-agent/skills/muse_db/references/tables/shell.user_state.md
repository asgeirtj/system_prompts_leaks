# `shell.user_state`

User favorites, access history and ordering for shell items.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `source` uses `text` and is required.

  Local row identifier (primary key).

- `item_key` uses `text` and is required.

  Local row identifier (primary key).

- `is_favorite` uses `boolean` and is required.

  Default: `false`.

- `accessed_at_ms` uses `bigint` and is nullable.

- `frequency_score` uses `double precision` and is nullable.

- `favorite_order` uses `double precision` and is nullable.

- `display_name` uses `text` and is nullable.

- `icon` uses `text` and is nullable.

- `updated_at_ms` uses `bigint` and is required.

  Default: `((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint`.

- `last_opened_at_ms` uses `bigint` and is nullable.

- `is_promoted` uses `boolean` and is required.

  Default: `false`.

## Keys and relationships

- PRIMARY KEY `user_state_pkey` covers `source`, `item_key`.
