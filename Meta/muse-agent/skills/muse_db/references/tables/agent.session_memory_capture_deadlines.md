# `agent.session_memory_capture_deadlines`

Pending session memory-capture deadlines and their reasons.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `root_session_id` uses `text` and is required.

  FK → `agent.agents.agent_id`

- `session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `reason` uses `text` and is required.

- `due_at_ms` uses `bigint` and is required.

- `created_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

## Keys and relationships

- FOREIGN KEY `session_memory_capture_deadlines_root_session_id_fkey` covers `root_session_id`. References [agent.agents](/opt/muse/skills/muse_db/references/tables/agent.agents.md), columns `agent_id`.

- PRIMARY KEY `session_memory_capture_deadlines_pkey` covers `root_session_id`.
