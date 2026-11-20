# `runtime.agent_todo_snapshots`

The agent's own execution checklists and their revisions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `conversation_id` uses `text` and is required.

  Local row identifier (primary key).

- `agent_identity` uses `text` and is required.

  Local row identifier (primary key).

- `items_json` uses `text` and is required.

  Default: `'[]'::text`.

- `revision` uses `bigint` and is required.

  Default: `1`.

- `updated_at_ms` uses `bigint` and is required.

  Default: `((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint`.

- `continuation_key` uses `text` and is nullable.

- `continuation_generation` uses `bigint` and is required.

  Default: `0`.

- `continuation_reminders` uses `smallint` and is required.

  Default: `0`.

## Keys and relationships

- PRIMARY KEY `agent_todo_snapshots_pkey` covers `conversation_id`, `agent_identity`.
