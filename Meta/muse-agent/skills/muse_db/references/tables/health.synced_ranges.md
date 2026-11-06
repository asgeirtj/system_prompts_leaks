# `health.synced_ranges`

Time ranges covered by synchronization for each health source and category.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `synced_range_id` uses `bigint` and is required.

  Default: `nextval('health.synced_ranges_synced_range_id_seq'::regclass)`.

  Local row identifier (primary key).

- `provider` uses `text` and is required.

- `node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `category` uses `text` and is required.

- `span` uses `tstzrange` and is required.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `synced_ranges_pkey` covers `synced_range_id`.
