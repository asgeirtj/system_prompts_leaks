# `ingest.data_source_events`

Ordered events received from data sources and their origin.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_id` uses `bigint` and is required.

  Default: `nextval('ingest.data_source_events_event_id_seq'::regclass)`.

  Local row identifier (primary key).

- `global_seq` uses `bigint` and is required.

  Default: `nextval('ingest.data_source_events_global_seq_seq'::regclass)`.

- `ingest_id` uses `text` and is required.

  Soft local reference → `ingest.data_source_events.ingest_id`.

- `producer_id` uses `text` and is required.

  Data-source producer identifier; no standalone owner table.

- `source` uses `text` and is required.

- `origin` uses `text` and is required.

- `processing_lane` uses `text` and is required.

- `received_at_text` uses `text` and is required.

- `received_at_unix_ms` uses `bigint` and is required.

- `payload_representation` uses `text` and is required.

- `payload_sha256` uses `text` and is nullable.

- `status` uses `text` and is required.

- `received_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `processed_at_text` uses `text` and is nullable.

- `processed_at_unix_ms` uses `bigint` and is nullable.

- `processed_at` uses `timestamp with time zone` and is nullable.

- `handoff_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `summary_preview` uses `text` and is nullable.

- `failure_code` uses `text` and is nullable.

- `failure_message` uses `text` and is nullable.

- `payload` uses `text` and is required.

- `presentation_locale` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `data_source_events_pkey` covers `event_id`.

- UNIQUE `data_source_events_global_seq_key` covers `global_seq`.

- UNIQUE `data_source_events_ingest_id_key` covers `ingest_id`.
