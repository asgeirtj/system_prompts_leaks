# `health.record_values`

Named numeric or text values belonging to health records.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `record_value_id` uses `bigint` and is required.

  Default: `nextval('health.record_values_record_value_id_seq'::regclass)`.

  Local row identifier (primary key).

- `record_table` uses `text` and is required.

- `record_id` uses `bigint` and is required.

  Polymorphic local reference selected by `record_table`: `health.aggregates.aggregate_id`, `health.events.health_event_id`, `health.sleep_sessions.sleep_session_id`, or `health.workouts.workout_id`.

- `value_name` uses `text` and is required.

- `unit` uses `text` and is nullable.

- `numeric_value` uses `double precision` and is nullable.

- `text_value` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `record_values_pkey` covers `record_value_id`.

- UNIQUE `record_values_record_table_record_id_value_name_key` covers `record_table`, `record_id`, `value_name`.
