# `runtime.work_items`

Durable work items and their parent, request and session relationships.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `work_id` uses `text` and is required.

  Local row identifier (primary key).

- `root_work_id` uses `text` and is nullable.

  FK → `runtime.work_items.work_id`

- `parent_work_id` uses `text` and is nullable.

  FK → `runtime.work_items.work_id`

- `request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `root_session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `session_id` uses `text` and is nullable.

  Soft local reference → `agent.sessions.session_id`.

- `agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `root_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `stream_owner_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `source` uses `text` and is nullable.

- `request_origin` uses `text` and is nullable.

- `work_class` uses `text` and is required.

- `transcript_surface` uses `text` and is nullable.

- `state` uses `text` and is required.

- `phase` uses `text` and is nullable.

- `subphase` uses `text` and is nullable.

- `priority` uses `integer` and is required.

  Default: `0`.

- `preemptibility` uses `text` and is required.

- `deadline_at` uses `timestamp with time zone` and is nullable.

- `heartbeat_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `lease_owner` uses `text` and is nullable.

- `retry_policy_json` uses `text` and is nullable.

- `metadata_json` uses `text` and is required.

  Default: `'{}'::text`.

- `terminal_reason` uses `text` and is nullable.

- `terminal_detail` uses `text` and is nullable.

- `diagnostic_json` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `terminalized_at` uses `timestamp with time zone` and is nullable.

## Keys and relationships

- FOREIGN KEY `work_items_parent_work_id_fkey` covers `parent_work_id`. References [runtime.work_items](/opt/muse/skills/muse_db/references/tables/runtime.work_items.md), columns `work_id`.

- FOREIGN KEY `work_items_request_id_fkey` covers `request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- FOREIGN KEY `work_items_root_work_id_fkey` covers `root_work_id`. References [runtime.work_items](/opt/muse/skills/muse_db/references/tables/runtime.work_items.md), columns `work_id`.

- PRIMARY KEY `work_items_pkey` covers `work_id`.
