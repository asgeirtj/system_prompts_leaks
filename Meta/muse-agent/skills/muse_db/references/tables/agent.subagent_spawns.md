# `agent.subagent_spawns`

Child-agent creation and its parent, message and request attribution.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `spawn_id` uses `bigint` and is required.

  Default: `nextval('agent.subagent_spawns_spawn_id_seq'::regclass)`.

  Local row identifier (primary key).

- `parent_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `child_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `parent_request_id` uses `text` and is nullable.

  Soft local reference → `runtime.requests.request_id`.

- `root_request_id` uses `text` and is nullable.

  Soft local reference → `runtime.requests.request_id`.

- `root_message_execution_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `created_at` uses `bigint` and is required.

  Default: `(EXTRACT(epoch FROM now()))::bigint`.

- `status` uses `text` and is nullable.

- `deferred_terminal_status` uses `text` and is nullable.

- `final_response` uses `text` and is nullable.

- `completed_at` uses `bigint` and is nullable.

- `prompt` uses `text` and is nullable.

- `requester_source` uses `text` and is nullable.

- `requester_chat_context_json` uses `text` and is nullable.

- `seen_at` uses `bigint` and is nullable.

- `child_depth` uses `integer` and is required.

  Default: `0`.

- `agent_type` uses `text` and is nullable.

- `metadata_json` uses `text` and is nullable.

- `spawn_call_id` uses `text` and is nullable.

  Soft local reference → `runtime.tool_calls.tool_call_id`.

- `handoff_state_json` uses `jsonb` and is nullable.

## Keys and relationships

- FOREIGN KEY `subagent_spawns_request_id_fkey` covers `request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `subagent_spawns_pkey` covers `spawn_id`.

- UNIQUE `subagent_spawns_child_agent_id_key` covers `child_agent_id`.

- UNIQUE `subagent_spawns_parent_agent_id_child_agent_id_key` covers `parent_agent_id`, `child_agent_id`.
