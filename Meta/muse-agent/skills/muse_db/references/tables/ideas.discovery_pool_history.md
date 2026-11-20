# `ideas.discovery_pool_history`

Historical snapshots of idea-discovery sources.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `snapshot_id` uses `text` and is required.

  Local row identifier (primary key).

- `source` uses `text` and is required.

- `payload_json` uses `jsonb` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `flock_explore_history_pkey` covers `snapshot_id`.
