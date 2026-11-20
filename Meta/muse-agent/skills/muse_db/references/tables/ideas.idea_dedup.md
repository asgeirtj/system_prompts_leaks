# `ideas.idea_dedup`

Idea fingerprints and duplicate-to-canonical mappings.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `content_fingerprint` uses `text` and is required.

- `embedding_ref` uses `text` and is nullable.

- `canonical_idea_id` uses `text` and is nullable.

  FK → `ideas.ideas.idea_id`

- `merged_at` uses `timestamp with time zone` and is nullable.

- `merge_reason` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `idea_dedup_canonical_idea_id_fkey` covers `canonical_idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- FOREIGN KEY `idea_dedup_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_dedup_pkey` covers `idea_id`.
