# `ideas.icon_embeddings`

Icon description embeddings and the model that generated them.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `icon_key` uses `text` and is required.

  Local row identifier (primary key).

- `model_name` uses `text` and is required.

  Local row identifier (primary key).

- `descriptions_digest` uses `text` and is required.

  Local row identifier (primary key).

- `embedding` uses `vector(384)` and is required.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- PRIMARY KEY `icon_embeddings_pkey` covers `icon_key`, `model_name`, `descriptions_digest`.
