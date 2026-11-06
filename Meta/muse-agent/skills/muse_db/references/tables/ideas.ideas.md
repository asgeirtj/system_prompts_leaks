# `ideas.ideas`

Idea cards, descriptions, rationale and categories.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `idea_id` uses `text` and is required.

  Local row identifier (primary key).

- `kind` uses `text` and is required.

- `title` uses `text` and is required.

- `summary` uses `text` and is required.

- `rationale` uses `text` and is nullable.

- `category_label` uses `text` and is nullable.

- `date_label` uses `text` and is nullable.

- `audience` uses `text` and is nullable.

- `lane` uses `text` and is nullable.

- `install_markdown` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `domain` uses `text` and is required.

- `dedup_key` uses `text` and is nullable.

- `expires_at` uses `timestamp with time zone` and is nullable.

- `generator` uses `text` and is nullable.

- `search_vector` uses `tsvector` and is nullable.

  Default: `to_tsvector('simple'::regconfig, "left"(((((((COALESCE(title, ''::text) \|\| ' '::text) \|\| COALESCE(summary, ''::text)) \|\| ' '::text) \|\| COALESCE(rationale, ''::text)) \|\| ' '::text) \|\| COALESCE(category_label, ''::text)), 200000))`.

- `prerequisite_notes` uses `text` and is nullable.

- `build_summary` uses `text` and is nullable.

- `category_index` uses `bigint` and is nullable.

- `embedding` uses `vector(384)` and is nullable.

## Keys and relationships

- PRIMARY KEY `ideas_pkey` covers `idea_id`.
