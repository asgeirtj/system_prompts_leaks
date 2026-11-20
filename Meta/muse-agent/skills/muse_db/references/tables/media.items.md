# `media.items`

Media inventory, source identities, types and file locations.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `media_id` uses `text` and is required.

  Local row identifier (primary key).

- `source` uses `text` and is required.

- `source_media_id` uses `text` and is required.

  Soft local reference → `media.items.media_id`.

- `node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `file_uri` uses `text` and is required.

- `media_type` uses `text` and is required.

- `sha256` uses `bytea` and is nullable.

- `byte_len` uses `bigint` and is nullable.

- `taken_at` uses `timestamp with time zone` and is nullable.

- `taken_at_local` uses `text` and is nullable.

- `taken_at_local_date` uses `date` and is nullable.

- `uploaded_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `uploaded_at_unix` uses `bigint` and is required.

  Default: `0`.

- `local_identifier` uses `text` and is nullable.

- `description_status` uses `text` and is required.

  Default: `'pending'::text`.

- `description_attempt_count` uses `integer` and is required.

  Default: `0`.

- `description_next_retry_at_unix` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `items_pkey` covers `media_id`.
