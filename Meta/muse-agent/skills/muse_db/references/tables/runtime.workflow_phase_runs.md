# `runtime.workflow_phase_runs`

Individual workflow phases, ordering and execution state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `phase_run_id` uses `text` and is required.

  Local row identifier (primary key).

- `run_id` uses `text` and is required.

  FK → `runtime.workflow_runs.run_id`

- `phase_name` uses `text` and is required.

- `ordinal` uses `integer` and is required.

- `status` uses `text` and is required.

- `agent_total` uses `integer` and is required.

  Default: `0`.

- `agent_completed` uses `integer` and is required.

  Default: `0`.

- `input_tokens` uses `bigint` and is required.

  Default: `0`.

- `output_tokens` uses `bigint` and is required.

  Default: `0`.

- `started_at` uses `timestamp with time zone` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `completed_at` uses `timestamp with time zone` and is nullable.

- `error` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `workflow_phase_runs_run_id_fkey` covers `run_id`. References [runtime.workflow_runs](/opt/muse/skills/muse_db/references/tables/runtime.workflow_runs.md), columns `run_id`.

- PRIMARY KEY `workflow_phase_runs_pkey` covers `phase_run_id`.

- UNIQUE `workflow_phase_runs_unique_phase` covers `run_id`, `phase_name`, `ordinal`.
