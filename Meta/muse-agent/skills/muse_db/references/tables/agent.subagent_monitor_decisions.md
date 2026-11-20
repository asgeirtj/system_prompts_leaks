# `agent.subagent_monitor_decisions`

Coordinator decisions about a child agent and the event prompting them.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `decision_id` uses `bigint` and is required.

  Default: `nextval('agent.subagent_monitor_decisions_decision_id_seq'::regclass)`.

  Local row identifier (primary key).

- `coordinator_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `child_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `monitor_event_id` uses `bigint` and is required.

  Local monitor-event reference; use `monitor_event_kind` to resolve `agent.subagent_progress_message_events.event_id` or `agent.subagent_progress_tool_events.event_id`.

- `monitor_event_kind` uses `text` and is required.

- `inference_request_id` uses `text` and is required.

  Inference/telemetry correlation identifier; no Muse PostgreSQL owner table.

- `assistant_text` uses `text` and is nullable.

- `tool_call_id` uses `text` and is nullable.

  Soft local reference → `runtime.tool_calls.tool_call_id`.

- `tool_name` uses `text` and is nullable.

- `tool_arguments` uses `text` and is nullable.

- `tool_result_json` uses `text` and is required.

- `decision_kind` uses `text` and is required.

- `created_at` uses `bigint` and is required.

## Keys and relationships

- PRIMARY KEY `subagent_monitor_decisions_pkey` covers `decision_id`.

- UNIQUE `subagent_monitor_decisions_inference_request_id_key` covers `inference_request_id`.
