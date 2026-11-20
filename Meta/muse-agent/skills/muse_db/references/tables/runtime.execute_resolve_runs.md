# `runtime.execute_resolve_runs`

Execution-and-resolution worker runs and terminal decisions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  Local row identifier (primary key).

- `worker_kind` uses `text` and is required.

- `source_ref` uses `text` and is required.

- `lane_key` uses `text` and is required.

- `status` uses `text` and is required.

- `terminal_decision` uses `text` and is nullable.

- `terminal_message` uses `text` and is nullable.

- `handoff_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `last_error_stage` uses `text` and is nullable.

- `last_error_message` uses `text` and is nullable.

- `metadata_json` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `worker_generation` uses `bigint` and is required.

  Default: `0`.

- `worker_phase` uses `text` and is nullable.

- `worker_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `worker_started_at` uses `timestamp with time zone` and is nullable.

- `execute_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `resolve_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

## Keys and relationships

- PRIMARY KEY `execute_resolve_runs_pkey` covers `run_id`.

- UNIQUE `execute_resolve_runs_source_unique` covers `worker_kind`, `source_ref`.
