# `scheduler.job_runs`

Individual scheduled job runs, definition version and execution times.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  Local row identifier (primary key).

- `job_id` uses `text` and is required.

  FK → `scheduler.jobs.job_id`

- `job_definition_id` uses `bigint` and is nullable.

  FK → `scheduler.job_definitions.job_definition_id`

- `request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `scheduled_for` uses `timestamp with time zone` and is required.

- `scheduled_for_utc` uses `bigint` and is required.

- `trigger_reason` uses `text` and is nullable.

- `started_at` uses `timestamp with time zone` and is nullable.

- `started_at_utc` uses `bigint` and is nullable.

- `finished_at` uses `timestamp with time zone` and is nullable.

- `finished_at_utc` uses `bigint` and is nullable.

- `status` uses `scheduler.run_status` and is required.

- `result_summary` uses `text` and is nullable.

- `error_text` uses `text` and is nullable.

- `attempt` uses `integer` and is required.

  Default: `1`.

- `worker_phase` uses `text` and is nullable.

- `worker_phase_attempt` uses `integer` and is nullable.

- `worker_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `worker_boot_generation` uses `text` and is nullable.

- `worker_claimed_at_utc` uses `bigint` and is nullable.

- `worker_execution_timed_out` uses `boolean` and is required.

  Default: `false`.

- `worker_history_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `product_endpoint_deadline_at_ms` uses `bigint` and is nullable.

- `presentation_locale` uses `text` and is required.

  Default: `'en-US'::text`.

  Immutable locale for user-visible output authored by this run; not a user, session, or device preference.

- `onboarding_tour_body` uses `text` and is nullable.

- `pending_terminal_result_json` uses `text` and is nullable.

- `worker_approval_wait_json` uses `text` and is nullable.

- `device_read_state_json` uses `text` and is nullable.

- `device_snapshot_hash` uses `text` and is nullable.

- `device_authority_hash` uses `text` and is nullable.

- `worker_timeouts_json` uses `text` and is nullable.

- `connection_origin_json` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `job_runs_job_definition_id_fkey` covers `job_definition_id`. References [scheduler.job_definitions](/opt/muse/skills/muse_db/references/tables/scheduler.job_definitions.md), columns `job_definition_id`.

- FOREIGN KEY `job_runs_job_id_fkey` covers `job_id`. References [scheduler.jobs](/opt/muse/skills/muse_db/references/tables/scheduler.jobs.md), columns `job_id`.

- FOREIGN KEY `job_runs_request_id_fkey` covers `request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `job_runs_pkey` covers `run_id`.

- UNIQUE `job_runs_job_id_scheduled_for_utc_key` covers `job_id`, `scheduled_for_utc`.
