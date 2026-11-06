# `memory.entries`

Indexed memory entries, source locations and privacy classification.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `memory_entry_id` uses `bigint` and is required.

  Default: `nextval('memory.entries_memory_entry_id_seq'::regclass)`.

  Local row identifier (primary key).

- `memory_uri` uses `text` and is required.

- `chunk_id` uses `text` and is required.

  Memory chunk identity owned by this row; it has no separate owner table.

- `source_type` uses `text` and is required.

- `status` uses `text` and is required.

- `privacy_class` uses `text` and is required.

- `confidence` uses `double precision` and is required.

  Default: `1.0`.

- `citation_path` uses `text` and is nullable.

- `line_start` uses `bigint` and is required.

  Default: `0`.

- `line_end` uses `bigint` and is required.

  Default: `0`.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `created_at_unix` uses `bigint` and is required.

  Default: `0`.

- `title_text` uses `text` and is nullable.

- `body_text` uses `text` and is required.

- `reason_text` uses `text` and is nullable.

## Keys and relationships

- PRIMARY KEY `entries_pkey` covers `memory_entry_id`.

- UNIQUE `entries_memory_uri_key` covers `memory_uri`.
