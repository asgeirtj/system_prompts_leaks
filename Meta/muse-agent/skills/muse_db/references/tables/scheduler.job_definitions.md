# `scheduler.job_definitions`

Versioned scheduled-job definitions and prompt references.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `job_definition_id` uses `bigint` and is required.

  Default: `nextval('scheduler.job_definitions_job_definition_id_seq'::regclass)`.

  Local row identifier (primary key).

- `job_id` uses `text` and is required.

  FK → `scheduler.jobs.job_id`

- `version` uses `integer` and is required.

- `prompt_template_id` uses `bigint` and is nullable.

  Prompt-template identifier; no queryable owner table.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `retired_at` uses `timestamp with time zone` and is nullable.

- `task_text` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `job_definitions_job_id_fkey` covers `job_id`. References [scheduler.jobs](/opt/muse/skills/muse_db/references/tables/scheduler.jobs.md), columns `job_id`.

- PRIMARY KEY `job_definitions_pkey` covers `job_definition_id`.

- UNIQUE `job_definitions_job_id_version_key` covers `job_id`, `version`.
