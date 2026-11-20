# `health.aggregates`

Provider health measurements aggregated over a specified period and timezone.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `aggregate_id` uses `bigint` and is required.

  Default: `nextval('health.aggregates_aggregate_id_seq'::regclass)`.

  Local row identifier (primary key).

- `provider` uses `text` and is required.

- `node_id` uses `text` and is nullable.

  Soft local reference → `device.nodes.node_id`.

- `timezone` uses `text` and is nullable.

- `aggregate_type` uses `text` and is required.

- `period_start` uses `timestamp with time zone` and is required.

- `period_end` uses `timestamp with time zone` and is required.

- `numeric_value` uses `double precision` and is nullable.

- `unit` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `aggregates_pkey` covers `aggregate_id`.

- UNIQUE `aggregates_provider_node_id_aggregate_type_period_start_per_key` covers `provider`, `node_id`, `aggregate_type`, `period_start`, `period_end`.
