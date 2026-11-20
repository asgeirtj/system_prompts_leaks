# `runtime.workflow_runs`

Workflow run identity, launch attribution and execution state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  Local row identifier (primary key).

- `root_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `launching_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `launching_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `launching_tool_call_id` uses `text` and is nullable.

  Soft local reference → `runtime.tool_calls.tool_call_id`.

- `task_id` uses `text` and is required.

  Potential local reference; resolve by domain context in: `runtime.browser_tasks.task_id`.

- `resume_from_run_id` uses `text` and is nullable.

  FK → `runtime.workflow_runs.run_id`

- `workflow_name` uses `text` and is required.

- `description` uses `text` and is required.

  Default: `''::text`.

- `phases_json` uses `jsonb` and is required.

  Default: `'[]'::jsonb`.

- `args_json` uses `jsonb` and is nullable.

- `workspace_root` uses `text` and is required.

- `script_path` uses `text` and is required.

- `script_sha256` uses `text` and is required.

- `request_trace_json` uses `jsonb` and is nullable.

- `executor_id` uses `text` and is nullable.

  Ephemeral workflow lease-owner identifier; no separate owner table.

- `execution_attempt` uses `integer` and is required.

  Default: `0`.

- `heartbeat_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `lease_expires_at` uses `timestamp with time zone` and is nullable.

- `recovery_count` uses `integer` and is required.

  Default: `0`.

- `last_recovery_reason` uses `text` and is nullable.

- `last_recovered_at` uses `timestamp with time zone` and is nullable.

- `status` uses `text` and is required.

- `error` uses `text` and is nullable.

- `final_result` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `started_at` uses `timestamp with time zone` and is nullable.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `completed_at` uses `timestamp with time zone` and is nullable.

- `launch_mode` uses `text` and is required.

  Default: `'sync'::text`.

- `terminal_handoff_transport` uses `text` and is nullable.

- `terminal_handoff_delivery_target` uses `text` and is nullable.

- `terminal_handoff_chat_context_json` uses `jsonb` and is nullable.

- `terminal_handoff_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `terminal_handoff_delivered_at` uses `timestamp with time zone` and is nullable.

- `terminal_handoff_attempt_count` uses `integer` and is required.

  Default: `0`.

- `terminal_handoff_last_attempt_at` uses `timestamp with time zone` and is nullable.

- `terminal_handoff_next_attempt_at` uses `timestamp with time zone` and is nullable.

- `terminal_handoff_last_error` uses `text` and is nullable.

- `launch_occurrence_agent_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `runtime.workflow_launch_occurrence_aliases.launch_occurrence_agent_id`, `runtime.workflow_legacy_launch_occurrence_blocks.launch_occurrence_agent_id`.

- `launch_occurrence_message_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `runtime.workflow_launch_occurrence_aliases.launch_occurrence_message_id`, `runtime.workflow_legacy_launch_occurrence_blocks.launch_occurrence_message_id`.

- `launch_occurrence_tool_call_id` uses `text` and is nullable.

  Potential local reference; resolve by domain context in: `runtime.workflow_launch_occurrence_aliases.launch_occurrence_tool_call_id`, `runtime.workflow_legacy_launch_occurrence_blocks.launch_occurrence_tool_call_id`.

- `sync_wait_deadline_at` uses `timestamp with time zone` and is nullable.

- `terminal_handoff_disposition` uses `text` and is nullable.

- `terminal_handoff_generation` uses `integer` and is required.

  Default: `0`.

- `magi_workload_class` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `workflow_runs_resume_from_run_id_fkey` covers `resume_from_run_id`. References [runtime.workflow_runs](/opt/muse/skills/muse_db/references/tables/runtime.workflow_runs.md), columns `run_id`.

- PRIMARY KEY `workflow_runs_pkey` covers `run_id`.

- UNIQUE `workflow_runs_task_unique` covers `task_id`.
