# `runtime.workflow_legacy_launch_occurrence_blocks`

Legacy workflow launch occurrences blocked from duplicate execution.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `launch_occurrence_agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `launch_occurrence_message_id` uses `text` and is required.

  Local row identifier (primary key).

- `launch_occurrence_tool_call_id` uses `text` and is required.

  Local row identifier (primary key).

- `legacy_run_id` uses `text` and is required.

  FK → `runtime.workflow_runs.run_id`

- `reason` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `workflow_legacy_launch_occurrence_blocks_legacy_run_id_fkey` covers `legacy_run_id`. References [runtime.workflow_runs](/opt/muse/skills/muse_db/references/tables/runtime.workflow_runs.md), columns `run_id`.

- PRIMARY KEY `workflow_legacy_launch_occurrence_blocks_pkey` covers `launch_occurrence_agent_id`, `launch_occurrence_message_id`, `launch_occurrence_tool_call_id`.
