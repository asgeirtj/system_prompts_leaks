# `scheduler.scheduled_resume_registrations`

Scheduled resume registrations and acknowledgement attempts.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `resume_at_utc` uses `bigint` and is required.

  Local row identifier (primary key).

- `schedule_id` uses `text` and is nullable.

  Host scheduler registration identifier; no Muse PostgreSQL owner table.

- `dispatch_at_ms` uses `bigint` and is nullable.

- `acknowledgement_attempts` uses `integer` and is required.

  Default: `0`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `job_name` uses `text` and is nullable.

- `shadow` uses `boolean` and is required.

  Default: `false`.

- `registration_attempts` uses `integer` and is required.

  Default: `0`.

- `acknowledgement_next_attempt_at_ms` uses `bigint` and is required.

  Default: `0`.

- `environment_id` uses `text` and is nullable.

  Opaque correlation identifier; no declared local table relationship.

## Keys and relationships

- PRIMARY KEY `scheduled_resume_registrations_pkey` covers `resume_at_utc`.
