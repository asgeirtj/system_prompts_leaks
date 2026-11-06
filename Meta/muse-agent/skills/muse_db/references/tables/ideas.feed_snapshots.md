# `ideas.feed_snapshots`

Ideas snapshot identity, creation time and active state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `snapshot_id` uses `text` and is required.

  Local row identifier (primary key).

- `generated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `is_active` uses `boolean` and is required.

  Default: `false`.

## Keys and relationships

- PRIMARY KEY `feed_snapshots_pkey` covers `snapshot_id`.
