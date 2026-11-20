# `runtime.raw_signal_entries`

Individual source signals within a collection.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `entry_id` uses `bigint` and is required.

  Default: `nextval('runtime.raw_signal_entries_entry_id_seq'::regclass)`.

  Local row identifier (primary key).

- `collection_id` uses `uuid` and is required.

  FK → `runtime.raw_signal_collections.collection_id`

- `ordinal` uses `integer` and is required.

- `source` uses `text` and is required.

- `name` uses `text` and is required.

- `method` uses `text` and is required.

- `logical_url` uses `text` and is required.

- `ok` uses `boolean` and is required.

- `status` uses `integer` and is nullable.

- `logical_path` uses `text` and is nullable.

- `error` uses `text` and is nullable.

- `duration_ms` uses `bigint` and is required.

- `bytes` uses `bigint` and is nullable.

- `body_json` uses `jsonb` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `raw_signal_entries_collection_id_fkey` covers `collection_id`. References [runtime.raw_signal_collections](/opt/muse/skills/muse_db/references/tables/runtime.raw_signal_collections.md), columns `collection_id`.

- PRIMARY KEY `raw_signal_entries_pkey` covers `entry_id`.

- UNIQUE `raw_signal_entries_collection_ordinal_unique` covers `collection_id`, `ordinal`.
