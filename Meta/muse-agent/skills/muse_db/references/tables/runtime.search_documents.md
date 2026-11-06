# `runtime.search_documents`

Search-index entries keyed to their owning records.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `search_document_id` uses `bigint` and is required.

  Default: `nextval('runtime.search_documents_search_document_id_seq'::regclass)`.

  Local row identifier (primary key).

- `owner_table` uses `text` and is required.

- `owner_key` uses `text` and is required.

- `language` uses `regconfig` and is required.

  Default: `'english'::regconfig`.

- `search_vector` uses `tsvector` and is required.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `search_text` uses `text` and is required.

## Keys and relationships

- PRIMARY KEY `search_documents_pkey` covers `search_document_id`.

- UNIQUE `search_documents_owner_table_owner_key_key` covers `owner_table`, `owner_key`.
