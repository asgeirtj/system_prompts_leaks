# `agent.subagent_progress`

Recorded child-agent progress updates and status.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `progress_id` uses `bigint` and is required.

  Default: `nextval('agent.subagent_progress_progress_id_seq'::regclass)`.

  Local row identifier (primary key).

- `child_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `event_seq` uses `bigint` and is nullable.

  FK → `runtime.events.event_seq`

- `status` uses `text` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `progress_text` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `subagent_progress_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `subagent_progress_pkey` covers `progress_id`.
