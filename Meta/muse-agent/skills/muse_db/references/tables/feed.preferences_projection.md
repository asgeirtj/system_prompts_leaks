# `feed.preferences_projection`

Current Feed preferences and the interactions already folded into them.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton_id` uses `smallint` and is required.

  Default: `1`.

  Local row identifier (primary key).

- `preferences_md` uses `text` and is required.

- `folded_through_ms` uses `bigint` and is required.

- `updated_by_run` uses `text` and is required.

- `updated_at_ms` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `preferences_projection_pkey` covers `singleton_id`.
