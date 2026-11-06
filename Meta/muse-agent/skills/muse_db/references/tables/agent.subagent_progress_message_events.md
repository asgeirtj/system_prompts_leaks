# `agent.subagent_progress_message_events`

Child-agent progress messages routed to a parent.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_id` uses `bigint` and is required.

  Default: `nextval('agent.subagent_progress_message_events_event_id_seq'::regclass)`.

  Local row identifier (primary key).

- `child_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `parent_message_id` uses `text` and is required.

  Soft local reference → `runtime.messages.message_id`.

- `message_text` uses `text` and is required.

- `created_at` uses `bigint` and is required.

- `delivered_at` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `subagent_progress_message_events_pkey` covers `event_id`.
