# `health.sleep_sessions`

Sleep sessions synchronized from a provider or device.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `sleep_session_id` uses `bigint` and is required.

  Default: `nextval('health.sleep_sessions_sleep_session_id_seq'::regclass)`.

  Local row identifier (primary key).

- `provider` uses `text` and is required.

- `node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `external_sleep_id` uses `text` and is required.

  External/provider identifier; no Muse PostgreSQL owner table.

- `bundle_id` uses `text` and is nullable.

  Source application bundle identifier.

- `timezone` uses `text` and is nullable.

- `start_at` uses `timestamp with time zone` and is required.

- `end_at` uses `timestamp with time zone` and is required.

- `quality_score` uses `double precision` and is nullable.

- `awake_seconds` uses `double precision` and is nullable.

- `core_seconds` uses `double precision` and is nullable.

- `deep_seconds` uses `double precision` and is nullable.

- `rem_seconds` uses `double precision` and is nullable.

- `asleep_unspecified_seconds` uses `double precision` and is nullable.

- `asleep_seconds` uses `integer` and is nullable.

- `in_bed_seconds` uses `integer` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `sleep_sessions_pkey` covers `sleep_session_id`.
