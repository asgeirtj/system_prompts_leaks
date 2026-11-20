# `memory.embeddings`

Search embeddings associated with memory entries.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `memory_embedding_id` uses `bigint` and is required.

  Default: `nextval('memory.embeddings_memory_embedding_id_seq'::regclass)`.

  Local row identifier (primary key).

- `memory_entry_id` uses `bigint` and is required.

  FK → `memory.entries.memory_entry_id`

- `embedding_model_id` uses `bigint` and is required.

  FK → `memory.embedding_models.embedding_model_id`

- `embedding` uses `vector(384)` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `embeddings_embedding_model_id_fkey` covers `embedding_model_id`. References [memory.embedding_models](/opt/muse/skills/muse_db/references/tables/memory.embedding_models.md), columns `embedding_model_id`.

- FOREIGN KEY `embeddings_memory_entry_id_fkey` covers `memory_entry_id`. References [memory.entries](/opt/muse/skills/muse_db/references/tables/memory.entries.md), columns `memory_entry_id`.

- PRIMARY KEY `embeddings_pkey` covers `memory_embedding_id`.

- UNIQUE `embeddings_memory_entry_id_embedding_model_id_key` covers `memory_entry_id`, `embedding_model_id`.
