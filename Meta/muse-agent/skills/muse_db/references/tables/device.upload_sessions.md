# `device.upload_sessions`

Device upload sessions, source types and synchronization mode.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `upload_session_id` uses `text` and is required.

  Local row identifier (primary key).

- `node_id` uses `text` and is required.

  Soft local reference → `device.nodes.node_id`.

- `route_kind` uses `text` and is required.

- `request_id` uses `text` and is nullable.

  Soft local reference → `runtime.requests.request_id`.

- `datatype` uses `text` and is required.

- `sync_mode` uses `text` and is nullable.

- `chunk_count` uses `integer` and is required.

- `status` uses `text` and is required.

- `created_at_text` uses `text` and is required.

- `updated_at_text` uses `text` and is required.

- `expires_at_text` uses `text` and is required.

- `expires_at` uses `timestamp with time zone` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `response` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `upload_sessions_pkey` covers `upload_session_id`.
