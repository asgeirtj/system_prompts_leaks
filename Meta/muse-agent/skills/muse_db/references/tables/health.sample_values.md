# `health.sample_values`

Named values and units belonging to individual health samples.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `sample_value_id` uses `bigint` and is required.

  Default: `nextval('health.sample_values_sample_value_id_seq'::regclass)`.

  Local row identifier (primary key).

- `sample_id` uses `bigint` and is required.

  FK → `health.samples.sample_id`

- `value_name` uses `text` and is required.

- `unit` uses `text` and is nullable.

- `numeric_value` uses `double precision` and is nullable.

- `text_value` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `sample_values_sample_id_fkey` covers `sample_id`. References [health.samples](/opt/muse/skills/muse_db/references/tables/health.samples.md), columns `sample_id`.

- PRIMARY KEY `sample_values_pkey` covers `sample_value_id`.

- UNIQUE `sample_values_sample_id_value_name_key` covers `sample_id`, `value_name`.
