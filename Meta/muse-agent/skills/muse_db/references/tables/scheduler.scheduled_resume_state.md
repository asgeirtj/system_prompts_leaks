# `scheduler.scheduled_resume_state`

Current scheduled resume projection and next registered wake-up.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `singleton` uses `boolean` and is required.

  Default: `true`.

  Local row identifier (primary key).

- `next_resume_at_utc` uses `bigint` and is nullable.

- `registered_dispatch_at_ms` uses `bigint` and is nullable.

- `projection_complete` uses `boolean` and is required.

  Default: `true`.

- `registration_resume_at_utc` uses `bigint` and is nullable.

- `registered_schedule_id` uses `text` and is nullable.

  Host scheduler registration identifier mirrored from `scheduler.scheduled_resume_registrations.schedule_id`.

- `next_resume_job_name` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `scheduled_resume_state_pkey` covers `singleton`.
