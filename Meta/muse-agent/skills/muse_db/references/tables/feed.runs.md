# `feed.runs`

Feed generation runs, triggering context and edition dates.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  Local row identifier (primary key).

- `trigger` uses `text` and is required.

- `edition_kind` uses `text` and is required.

- `local_date` uses `date` and is required.

- `tz` uses `text` and is required.

- `prompt_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `feed.promptless_unit_orders.prompt_id`, `feed.prompts.prompt_id`.

- `prompt_snapshot` uses `text` and is nullable.

- `requester` uses `jsonb` and is nullable.

- `slot_fulfillment` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `interactions_watermark_ms` uses `bigint` and is nullable.

- `status` uses `text` and is required.

  Default: `'queued'::text`.

- `failure_reason` uses `text` and is nullable.

- `started_at_ms` uses `bigint` and is nullable.

- `finished_at_ms` uses `bigint` and is nullable.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

- `hour_slot` uses `smallint` and is nullable.

- `search_query_keys` uses `text[]` and is nullable.

## Keys and relationships

- PRIMARY KEY `runs_pkey` covers `run_id`.
