# `scheduler.jobs`

Saved schedules, enabled state and their source identity.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `job_id` uses `text` and is required.

  Local row identifier (primary key).

- `is_heartbeat` uses `boolean` and is required.

  Default: `false`.

- `source_path` uses `text` and is nullable.

- `source_hash` uses `text` and is nullable.

- `schedule_kind` uses `text` and is required.

- `enabled` uses `boolean` and is required.

  Default: `true`.

- `schedule_expr` uses `text` and is required.

- `timezone` uses `text` and is required.

  Default: `'UTC'::text`.

- `retry_on_failure` uses `boolean` and is required.

  Default: `false`.

- `max_retries` uses `integer` and is required.

  Default: `0`.

- `delivery_targets_json` uses `text` and is required.

  Default: `'[]'::text`.

- `next_run_at` uses `timestamp with time zone` and is nullable.

- `next_run_at_utc` uses `bigint` and is required.

  Default: `0`.

- `last_run_at_utc` uses `bigint` and is nullable.

- `last_success_at_utc` uses `bigint` and is nullable.

- `last_status` uses `text` and is nullable.

- `consecutive_failures` uses `bigint` and is required.

  Default: `0`.

- `updated_at_utc` uses `bigint` and is required.

  Default: `0`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `blocked_reason` uses `text` and is nullable.

- `blocked_dependency` uses `text` and is nullable.

- `blocked_at_utc` uses `bigint` and is nullable.

- `next_blocked_probe_at_utc` uses `bigint` and is nullable.

- `device_authority_hash` uses `text` and is nullable.

- `device_read_checkpoints_json` uses `text` and is required.

  Default: `'{}'::text`.

## Keys and relationships

- PRIMARY KEY `jobs_pkey` covers `job_id`.
