# `agent.context_text_segments`

Text segments belonging to context items, with protected reasoning withheld.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `context_text_segment_id` uses `bigint` and is required.

  Default: `nextval('agent.context_text_segments_context_text_segment_id_seq'::regclass)`.

  Local row identifier (primary key).

- `context_item_id` uses `bigint` and is required.

  FK → `agent.context_items.context_item_id`

- `ordinal` uses `integer` and is required.

- `text_content` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `context_text_segments_context_item_id_fkey` covers `context_item_id`. References [agent.context_items](/opt/muse/skills/muse_db/references/tables/agent.context_items.md), columns `context_item_id`.

- PRIMARY KEY `context_text_segments_pkey` covers `context_text_segment_id`.

- UNIQUE `context_text_segments_context_item_id_ordinal_key` covers `context_item_id`, `ordinal`.
