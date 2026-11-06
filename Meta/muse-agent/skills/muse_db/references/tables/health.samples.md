# `health.samples`

Individual health measurements and their provider identity.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `sample_id` uses `bigint` and is required.

  Default: `nextval('health.samples_sample_id_seq'::regclass)`.

  Local row identifier (primary key).

- `provider` uses `text` and is required.

- `node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `external_sample_id` uses `text` and is required.

  External/provider identifier; no Muse PostgreSQL owner table.

- `bundle_id` uses `text` and is nullable.

  Source application bundle identifier.

- `sample_type` uses `text` and is required.

- `start_at` uses `timestamp with time zone` and is required.

- `end_at` uses `timestamp with time zone` and is nullable.

- `unit` uses `text` and is nullable.

- `numeric_value` uses `double precision` and is nullable.

- `text_value` uses `text` and is nullable.

- `source_name` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `timezone` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `samples_pkey` covers `sample_id`.
