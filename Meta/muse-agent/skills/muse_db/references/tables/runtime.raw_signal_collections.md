# `runtime.raw_signal_collections`

Signal collection attempts, source tools and coverage state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `collection_id` uses `uuid` and is required.

  Local row identifier (primary key).

- `tool` uses `text` and is required.

- `mode` uses `text` and is required.

- `fetched_at` uses `timestamp with time zone` and is required.

- `partial` uses `boolean` and is required.

- `skipped` uses `boolean` and is required.

- `per_request_timeout_secs` uses `integer` and is required.

- `max_total_secs` uses `integer` and is required.

- `source_names` uses `text[]` and is required.

- `entry_count` uses `integer` and is required.

- `metadata_json` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `raw_signal_collections_pkey` covers `collection_id`.
