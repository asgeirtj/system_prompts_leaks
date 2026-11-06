# `device.data_sync_state`

Per-device synchronization state, cursor and full-sync range.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `node_id` uses `text` and is required.

  FK → `device.nodes.node_id`

- `data_source` uses `text` and is required.

  Local row identifier (primary key).

- `next_full_sync_at` uses `timestamp with time zone` and is nullable.

- `current_full_sync_id` uses `text` and is nullable.

  Soft local reference → `device.upload_sessions.upload_session_id`.

- `current_full_sync_expires_at` uses `timestamp with time zone` and is nullable.

- `current_full_sync_range_start` uses `timestamp with time zone` and is nullable.

- `current_full_sync_range_end` uses `timestamp with time zone` and is nullable.

- `changed_during_full_sync` uses `boolean` and is required.

  Default: `false`.

- `last_full_sync_at` uses `timestamp with time zone` and is nullable.

- `last_full_sync_range_start` uses `timestamp with time zone` and is nullable.

- `last_full_sync_range_end` uses `timestamp with time zone` and is nullable.

- `search_trigger_pending` uses `boolean` and is required.

  Default: `false`.

- `current_full_sync_requester_root_session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `current_full_sync_requester_presentation_locale` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `data_sync_state_node_id_fkey` covers `node_id`. References [device.nodes](/opt/muse/skills/muse_db/references/tables/device.nodes.md), columns `node_id`.

- PRIMARY KEY `data_sync_state_pkey` covers `node_id`, `data_source`.
