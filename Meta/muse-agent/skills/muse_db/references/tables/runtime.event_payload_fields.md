# `runtime.event_payload_fields`

Flattened fields from recorded runtime events.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `event_payload_field_id` uses `bigint` and is required.

  Default: `nextval('runtime.event_payload_fields_event_payload_field_id_seq'::regclass)`.

  Local row identifier (primary key).

- `event_seq` uses `bigint` and is required.

  FK → `runtime.events.event_seq`

- `field_path` uses `text` and is required.

- `scalar_type` uses `text` and is required.

- `scalar_value` uses `text` and is nullable.

- `text_value` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `event_payload_fields_event_seq_fkey` covers `event_seq`. References [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md), columns `event_seq`.

- PRIMARY KEY `event_payload_fields_pkey` covers `event_payload_field_id`.

- UNIQUE `event_payload_fields_event_seq_field_path_key` covers `event_seq`, `field_path`.
