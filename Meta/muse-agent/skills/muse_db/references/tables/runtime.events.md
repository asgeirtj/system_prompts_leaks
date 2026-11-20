# `runtime.events`

Ordered runtime event ledger with request attribution.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_seq` uses `bigint` and is required.

  Default: `nextval('runtime.events_event_seq_seq'::regclass)`.

  Local row identifier (primary key).

- `event_id` uses `uuid` and is required.

  Default: `gen_random_uuid()`.

  Stable local event identifier owned by this row; `event_seq` is its primary key.

- `event_kind` uses `runtime.event_kind` and is required.

- `event_name` uses `text` and is required.

- `request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `root_request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `parent_request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `transcript_surface` uses `runtime.transcript_surface` and is required.

- `visibility` uses `runtime.visibility` and is required.

- `source` uses `text` and is required.

- `role` uses `runtime.message_role` and is nullable.

- `chat_kind` uses `text` and is required.

  Default: `'direct'::text`.

- `stream_lane` uses `text` and is required.

  Default: `'main'::text`.

- `message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `parent_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `reply_to_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `reply_target_message_id` uses `text` and is nullable.

  Soft local reference → `runtime.messages.message_id`.

- `parent_agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `agent_id` uses `text` and is nullable.

  Soft local reference → `agent.agents.agent_id`.

- `idempotency_key` uses `text` and is nullable.

- `display_text_ready` uses `boolean` and is required.

  Default: `true`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `payload_json` uses `text` and is nullable.

- `chat_context_json` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `events_parent_request_id_fkey` covers `parent_request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- FOREIGN KEY `events_request_id_fkey` covers `request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- FOREIGN KEY `events_root_request_id_fkey` covers `root_request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `events_pkey` covers `event_seq`.

- UNIQUE `events_event_id_key` covers `event_id`.

- UNIQUE `events_idempotency_key_key` covers `idempotency_key`.
