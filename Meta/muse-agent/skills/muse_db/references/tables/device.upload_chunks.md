# `device.upload_chunks`

Received chunks of a device upload and their payload digests.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `upload_session_id` uses `text` and is required.

  FK → `device.upload_sessions.upload_session_id`

- `chunk_index` uses `integer` and is required.

  Local row identifier (primary key).

- `payload_digest` uses `text` and is required.

- `created_at_text` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `payload` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `upload_chunks_upload_session_id_fkey` covers `upload_session_id`. References [device.upload_sessions](/opt/muse/skills/muse_db/references/tables/device.upload_sessions.md), columns `upload_session_id`.

- PRIMARY KEY `upload_chunks_pkey` covers `upload_session_id`, `chunk_index`.
