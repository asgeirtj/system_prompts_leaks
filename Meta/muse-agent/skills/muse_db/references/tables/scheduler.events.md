# `scheduler.events`

Scheduler events linked to jobs and runs.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `scheduler_event_id` uses `bigint` and is required.

  Default: `nextval('scheduler.events_scheduler_event_id_seq'::regclass)`.

  Local row identifier (primary key).

- `job_id` uses `text` and is nullable.

  Soft local reference → `scheduler.jobs.job_id`.

- `run_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `scheduler.doctor_run_plans.run_id`, `scheduler.job_runs.run_id`, `scheduler.terminal_signals.run_id`.

- `event_name` uses `text` and is required.

- `detail` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `events_pkey` covers `scheduler_event_id`.
