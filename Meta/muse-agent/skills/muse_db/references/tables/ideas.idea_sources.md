# `ideas.idea_sources`

Source records and provenance associated with ideas.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `source_namespace` uses `text` and is required.

  Local row identifier (primary key).

- `source_kind` uses `text` and is required.

  Local row identifier (primary key).

- `source_id` uses `text` and is required.

  Local row identifier (primary key).

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `position` uses `integer` and is nullable.

- `metadata_json` uses `jsonb` and is required.

  Default: `'{}'::jsonb`.

## Keys and relationships

- FOREIGN KEY `idea_sources_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_sources_pkey` covers `source_namespace`, `source_kind`, `source_id`.
