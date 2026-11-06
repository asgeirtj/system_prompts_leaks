# `scheduler.delivery_outbox`

Scheduled-run results awaiting delivery and their delivery state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `delivery_key` uses `text` and is required.

  Local row identifier (primary key).

- `job_id` uses `text` and is required.

  Soft local reference → `scheduler.jobs.job_id`.

- `run_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `scheduler.doctor_run_plans.run_id`, `scheduler.job_runs.run_id`, `scheduler.terminal_signals.run_id`.

- `payload_json` uses `text` and is required.

- `state` uses `text` and is required.

- `dispatch_boot_generation` uses `text` and is nullable.

- `attempt_count` uses `integer` and is required.

  Default: `0`.

- `next_attempt_at_utc` uses `bigint` and is required.

- `last_error` uses `text` and is nullable.

- `created_at_utc` uses `bigint` and is required.

- `updated_at_utc` uses `bigint` and is required.

- `delivered_at_utc` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `delivery_outbox_pkey` covers `delivery_key`.
