# `agent.context_item_fields`

Flattened fields of readable context items, subject to the listed redactions.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Read restrictions

Redacted. Legacy field rows whose owning item is model reasoning (thinking or redacted-thinking) are withheld. Queries against this table run against the security-barrier view `inspection.context_item_fields`, which projects the columns listed below.

## Columns

- `context_item_field_id` uses `bigint` and is required.

  Default: `nextval('agent.context_item_fields_context_item_field_id_seq'::regclass)`.

  Local row identifier (primary key).

- `context_item_id` uses `bigint` and is required.

  FK → `agent.context_items.context_item_id`

- `field_path` uses `text` and is required.

- `scalar_type` uses `text` and is required.

- `scalar_value` uses `text` and is nullable.

- `field_text_content` uses `text` and is nullable.

## Keys and relationships

- FOREIGN KEY `context_item_fields_context_item_id_fkey` covers `context_item_id`. References [agent.context_items](/opt/muse/skills/muse_db/references/tables/agent.context_items.md), columns `context_item_id`.

- PRIMARY KEY `context_item_fields_pkey` covers `context_item_field_id`.

- UNIQUE `context_item_fields_context_item_id_field_path_key` covers `context_item_id`, `field_path`.
