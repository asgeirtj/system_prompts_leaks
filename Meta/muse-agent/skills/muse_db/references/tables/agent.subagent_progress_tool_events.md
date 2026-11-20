# `agent.subagent_progress_tool_events`

Child-agent tool progress events routed to a parent.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_id` uses `bigint` and is required.

  Default: `nextval('agent.subagent_progress_tool_events_event_id_seq'::regclass)`.

  Local row identifier (primary key).

- `child_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `tool_name` uses `text` and is required.

- `tool_description` uses `text` and is required.

- `tool_status` uses `text` and is required.

- `tool_result_preview` uses `text` and is nullable.

- `created_at` uses `bigint` and is required.

- `delivered_at` uses `bigint` and is nullable.

- `run_id` uses `text` and is nullable.

  Producer-specific tool or workflow run identifier; no single owner table.

## Keys and relationships

- PRIMARY KEY `subagent_progress_tool_events_pkey` covers `event_id`.
