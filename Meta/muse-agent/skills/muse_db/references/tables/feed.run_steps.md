# `feed.run_steps`

Individual Feed generation steps, attempts and agent state.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `run_id` uses `text` and is required.

  Local row identifier (primary key).

- `step_id` uses `text` and is required.

  Local row identifier (primary key).

- `attempt` uses `integer` and is required.

  Default: `0`.

  Local row identifier (primary key).

- `input_hash` uses `text` and is required.

- `status` uses `text` and is required.

- `agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `output_json` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

- `error` uses `text` and is nullable.

- `started_at_ms` uses `bigint` and is required.

- `finished_at_ms` uses `bigint` and is nullable.

- `updated_at_ms` uses `bigint` and is required.

- `submitted_at_ms` uses `bigint` and is nullable.

## Keys and relationships

- PRIMARY KEY `run_steps_pkey` covers `run_id`, `step_id`, `attempt`.
