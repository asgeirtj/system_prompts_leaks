# `runtime.workflow_agent_calls`

Agent calls made by workflow phases and their replay identities.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `call_id` uses `text` and is required.

  Local row identifier (primary key).

- `run_id` uses `text` and is required.

  FK → `runtime.workflow_runs.run_id`

- `phase_run_id` uses `text` and is nullable.

  FK → `runtime.workflow_phase_runs.phase_run_id`

- `replay_key` uses `text` and is required.

- `cache_key` uses `text` and is required.

- `call_ordinal` uses `integer` and is required.

- `prompt` uses `text` and is required.

- `options_json` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `child_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `status` uses `text` and is required.

- `cached_from_call_id` uses `text` and is nullable.

  FK → `runtime.workflow_agent_calls.call_id`

- `final_response` uses `text` and is nullable.

- `input_tokens` uses `bigint` and is required.

  Default: `0`.

- `output_tokens` uses `bigint` and is required.

  Default: `0`.

- `tool_call_count` uses `bigint` and is required.

  Default: `0`.

- `duration_ms` uses `bigint` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `started_at` uses `timestamp with time zone` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `completed_at` uses `timestamp with time zone` and is nullable.

- `error` uses `text` and is nullable.

- `child_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

## Keys and relationships

- FOREIGN KEY `workflow_agent_calls_cached_from_call_id_fkey` covers `cached_from_call_id`. References [runtime.workflow_agent_calls](/opt/muse/skills/muse_db/references/tables/runtime.workflow_agent_calls.md), columns `call_id`.

- FOREIGN KEY `workflow_agent_calls_phase_run_id_fkey` covers `phase_run_id`. References [runtime.workflow_phase_runs](/opt/muse/skills/muse_db/references/tables/runtime.workflow_phase_runs.md), columns `phase_run_id`.

- FOREIGN KEY `workflow_agent_calls_run_id_fkey` covers `run_id`. References [runtime.workflow_runs](/opt/muse/skills/muse_db/references/tables/runtime.workflow_runs.md), columns `run_id`.

- PRIMARY KEY `workflow_agent_calls_pkey` covers `call_id`.
