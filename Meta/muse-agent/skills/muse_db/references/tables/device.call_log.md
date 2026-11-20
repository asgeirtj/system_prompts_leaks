# `device.call_log`

Call-history entries from devices and their recorded direction and timing.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `call_log_id` uses `bigint` and is required.

  Default: `nextval('device.call_log_call_log_id_seq'::regclass)`.

  Local row identifier (primary key).

- `producer_id` uses `text` and is required.

  Source-producer identifier supplied with device data; no standalone owner table.

- `external_id` uses `text` and is required.

  External/provider identifier; no Muse PostgreSQL owner table.

- `phone_number` uses `text` and is nullable.

- `contact_name` uses `text` and is nullable.

- `call_type` uses `text` and is nullable.

- `occurred_at_unix_ms` uses `bigint` and is nullable.

- `duration_seconds` uses `bigint` and is nullable.

- `platform` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `call_log_pkey` covers `call_log_id`.

- UNIQUE `call_log_producer_id_external_id_key` covers `producer_id`, `external_id`.
