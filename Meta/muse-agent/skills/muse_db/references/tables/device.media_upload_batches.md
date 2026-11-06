# `device.media_upload_batches`

Claimed batches and pending counts for media-upload processing.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `lane` uses `text` and is required.

  Local row identifier (primary key).

- `batch_id` uses `text` and is required.

  Soft local reference → `device.media_upload_batches.batch_id`.

- `high_water_global_seq` uses `bigint` and is required.

- `pending_count` uses `bigint` and is required.

- `oldest_received_at_unix_ms` uses `bigint` and is required.

- `claimed_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `media_upload_batches_pkey` covers `lane`.

- UNIQUE `media_upload_batches_batch_id_key` covers `batch_id`.
