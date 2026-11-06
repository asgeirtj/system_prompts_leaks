# `scheduler.doctor_task_state`

Maintenance task evidence and the last successful run.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `task_name` uses `text` and is required.

  Local row identifier (primary key).

- `evidence_hash` uses `text` and is required.

- `last_success_run_id` uses `text` and is required.

  Soft local reference to `scheduler.job_runs.run_id`.

- `last_success_scheduled_for_utc` uses `bigint` and is required.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `doctor_task_state_pkey` covers `task_name`.
