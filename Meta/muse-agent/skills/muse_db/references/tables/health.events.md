# `health.events`

Health events synchronized from a provider or device.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `health_event_id` uses `bigint` and is required.

  Default: `nextval('health.events_health_event_id_seq'::regclass)`.

  Local row identifier (primary key).

- `provider` uses `text` and is required.

- `node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `external_event_id` uses `text` and is nullable.

  External/provider identifier; no Muse PostgreSQL owner table.

- `bundle_id` uses `text` and is nullable.

  Source application bundle identifier.

- `timezone` uses `text` and is nullable.

- `event_type` uses `text` and is required.

- `event_at` uses `timestamp with time zone` and is required.

- `event_end_at` uses `timestamp with time zone` and is nullable.

- `event_text` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `events_pkey` covers `health_event_id`.
