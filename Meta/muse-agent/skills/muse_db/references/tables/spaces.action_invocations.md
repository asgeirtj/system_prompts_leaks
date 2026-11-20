# `spaces.action_invocations`

Artifact action requests and their transport and order.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `global_seq` uses `bigint` and is required.

  Default: `nextval('spaces.action_invocations_global_seq_seq'::regclass)`.

- `invocation_id` uses `text` and is required.

  Local row identifier (primary key).

- `space_slug` uses `text` and is required.

- `space_display_name` uses `text` and is nullable.

- `action` uses `text` and is required.

- `transport` uses `text` and is required.

  Default: `'unknown'::text`.

- `request_id` uses `text` and is nullable.

  FK → `runtime.requests.request_id`

- `status` uses `text` and is required.

- `invoked_at_text` uses `text` and is nullable.

- `invoked_at_unix_ms` uses `bigint` and is required.

  Default: `0`.

- `invoked_at` uses `timestamp with time zone` and is required.

- `settled_at_text` uses `text` and is nullable.

- `settled_at_unix_ms` uses `bigint` and is nullable.

- `duration_ms` uses `bigint` and is nullable.

- `args_preview` uses `text` and is nullable.

- `result_preview` uses `text` and is nullable.

- `error` uses `text` and is nullable.

- `stream_protocol_messages` uses `bigint` and is nullable.

- `stream_data_messages` uses `bigint` and is nullable.

- `finished_at` uses `timestamp with time zone` and is nullable.

- `source_kind` uses `text` and is nullable.

- `source_ref` uses `text` and is nullable.

- `trigger_ref` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `action_invocations_request_id_fkey` covers `request_id`. References [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md), columns `request_id`.

- PRIMARY KEY `action_invocations_pkey` covers `invocation_id`.

- UNIQUE `action_invocations_global_seq_key` covers `global_seq`.
