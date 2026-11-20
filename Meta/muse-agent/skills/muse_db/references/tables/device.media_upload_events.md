# `device.media_upload_events`

Ordered media-upload events and their device and processing lane.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `media_upload_event_id` uses `bigint` and is required.

  Default: `nextval('device.media_upload_events_media_upload_event_id_seq'::regclass)`.

  Local row identifier (primary key).

- `global_seq` uses `bigint` and is required.

  Default: `nextval('device.media_upload_events_global_seq_seq'::regclass)`.

- `event_id` uses `text` and is required.

  Device-source event identifier; no Muse PostgreSQL owner table.

- `media_id` uses `text` and is required.

  Soft local reference to `media.items.media_id`.

- `node_id` uses `text` and is nullable.

  FK → `device.nodes.node_id`

- `lane` uses `text` and is required.

- `received_at_text` uses `text` and is required.

- `received_at_unix_ms` uses `bigint` and is required.

- `received_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `status` uses `text` and is required.

- `processed_at_text` uses `text` and is nullable.

- `processed_at_unix_ms` uses `bigint` and is nullable.

- `processed_at` uses `timestamp with time zone` and is nullable.

- `handoff_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `summary_preview` uses `text` and is nullable.

- `failure_code` uses `text` and is nullable.

- `failure_message` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `media_upload_events_node_id_fkey` covers `node_id`. References [device.nodes](/opt/muse/skills/muse_db/references/tables/device.nodes.md), columns `node_id`.

- PRIMARY KEY `media_upload_events_pkey` covers `media_upload_event_id`.

- UNIQUE `media_upload_events_event_id_key` covers `event_id`.

- UNIQUE `media_upload_events_global_seq_key` covers `global_seq`.
