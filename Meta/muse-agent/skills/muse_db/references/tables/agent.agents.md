# `agent.agents`

Agent identity, kind, session and parent relationships.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `agent_id` uses `text` and is required.

  Local row identifier (primary key).

- `id` uses `text` and is nullable.

  Legacy local agent identity owned by this row; `agent.agents.parent_id` points here.

- `session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `kind` uses `text` and is required.

  Default: `'root'::text`.

- `parent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.id`.

- `parent_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `root_session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `model` uses `text` and is required.

  Default: `''::text`.

- `status` uses `text` and is required.

- `depth` uses `integer` and is required.

  Default: `0`.

- `created_at` uses `bigint` and is required.

  Default: `(EXTRACT(epoch FROM now()))::bigint`.

- `updated_at` uses `bigint` and is required.

  Default: `(EXTRACT(epoch FROM now()))::bigint`.

- `last_assistant_message` uses `text` and is nullable.

- `seen_at_ms` uses `bigint` and is nullable.

- `prompt_floor_seq` uses `bigint` and is nullable.

- `ephemeral` uses `boolean` and is required.

  Default: `false`.

- `last_assistant_resources` uses `text` and is nullable.

- `agent_type` uses `text` and is nullable.

- `presentation_root_session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `spawn_metadata_json` uses `text` and is nullable.

- `originating_location_context_json` uses `text` and is nullable.

- `handoff_context_high_water_seq` uses `bigint` and is nullable.

## Keys and relationships

- FOREIGN KEY `agents_request_id_fkey` covers `request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `agents_pkey` covers `agent_id`.

- UNIQUE `agents_id_key` covers `id`.
