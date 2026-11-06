# `runtime.context_snapshots`

Versioned context snapshots and their source watermarks.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `snapshot_kind` uses `text` and is required.

  Local row identifier (primary key).

- `owner_key` uses `text` and is required.

  Local row identifier (primary key).

- `version` uses `bigint` and is required.

- `source_watermark` uses `text` and is nullable.

- `fingerprint` uses `text` and is nullable.

- `freshness_class` uses `text` and is required.

- `state_json` uses `text` and is required.

  Default: `'{}'::text`.

- `refreshed_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `invalidated_at` uses `timestamp with time zone` and is nullable.

- `stale_after` uses `timestamp with time zone` and is nullable.

- `last_error` uses `text` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `context_snapshots_pkey` covers `snapshot_kind`, `owner_key`.
