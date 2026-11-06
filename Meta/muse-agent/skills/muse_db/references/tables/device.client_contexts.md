# `device.client_contexts`

Client connection, device, session and visible-view context.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `connection_id` uses `text` and is required.

  Local row identifier (primary key).

- `device_id` uses `text` and is required.

  Client-supplied device identifier; distinct from `device.nodes.node_id`.

- `session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `root_session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `platform` uses `text` and is nullable.

- `view` uses `text` and is nullable.

- `mode` uses `text` and is nullable.

- `is_visible` uses `boolean` and is nullable.

  Default: `true`.

- `presence_status` uses `text` and is required.

- `metadata_json` uses `jsonb` and is nullable.

- `connected_at_ms` uses `bigint` and is required.

- `last_active_at_ms` uses `bigint` and is required.

- `updated_at_ms` uses `bigint` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `client_contexts_pkey` covers `connection_id`.
