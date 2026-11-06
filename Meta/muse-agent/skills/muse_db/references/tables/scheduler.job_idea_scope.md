# `scheduler.job_idea_scope`

Idea provenance attached to scheduled jobs.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `job_id` uses `text` and is required.

  FK → `scheduler.jobs.job_id`

- `idea_provenance_json` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `job_idea_scope_job_id_fkey` covers `job_id`. References [scheduler.jobs](/opt/muse/skills/muse_db/references/tables/scheduler.jobs.md), columns `job_id`.

- PRIMARY KEY `job_idea_scope_pkey` covers `job_id`.
