# `scheduler.doctor_run_plans`

Maintenance task plans saved for a doctor run.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  FK → `scheduler.job_runs.run_id`

- `tasks_json` uses `jsonb` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `doctor_run_plans_run_id_fkey` covers `run_id`. References [scheduler.job_runs](/opt/muse/skills/muse_db/references/tables/scheduler.job_runs.md), columns `run_id`.

- PRIMARY KEY `doctor_run_plans_pkey` covers `run_id`.
