# `runtime.resources`

Resources associated with runtime events and their display order.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `resource_id` uses `bigint` and is required.

  Default: `nextval('runtime.resources_resource_id_seq'::regclass)`.

  Local row identifier (primary key).

- `event_seq` uses `bigint` and is required.

  FK → `runtime.events.event_seq`

- `ordinal` uses `integer` and is required.

  Default: `0`.

- `resource_kind` uses `text` and is required.

- `resource_key` uses `text` and is required.

- `label` uses `text` and is nullable.

- `mime_type` uses `text` and is nullable.

- `size_bytes` uses `bigint` and is nullable.

- `metadata_json` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `resources_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `resources_pkey` covers `resource_id`.

- UNIQUE `resources_event_seq_ordinal_key` covers `event_seq`, `ordinal`.
