# `memory.entry_attributes`

Named attributes attached to memory entries.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `memory_entry_attribute_id` uses `bigint` and is required.

  Default: `nextval('memory.entry_attributes_memory_entry_attribute_id_seq'::regclass)`.

  Local row identifier (primary key).

- `memory_entry_id` uses `bigint` and is required.

  FK → `memory.entries.memory_entry_id`

- `attribute_name` uses `text` and is required.

- `scalar_value` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `entry_attributes_memory_entry_id_fkey` covers `memory_entry_id`. References [memory.entries](/opt/muse/skills/muse_db/references/tables/memory.entries.md), columns `memory_entry_id`.

- PRIMARY KEY `entry_attributes_pkey` covers `memory_entry_attribute_id`.

- UNIQUE `entry_attributes_memory_entry_id_attribute_name_key` covers `memory_entry_id`, `attribute_name`.
