# `ideas.idea_tags`

Ordered tags attached to ideas.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `position` uses `integer` and is required.

  Local row identifier (primary key).

- `tag` uses `text` and is required.

## Keys and relationships

- FOREIGN KEY `idea_tags_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_tags_pkey` covers `idea_id`, `position`.
