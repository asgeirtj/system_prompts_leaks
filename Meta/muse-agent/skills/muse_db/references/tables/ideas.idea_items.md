# `ideas.idea_items`

Ordered items within an idea.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `idea_item_id` uses `text` and is required.

  Local row identifier (primary key).

- `idea_id` uses `text` and is required.

  FK → `ideas.ideas.idea_id`

- `position` uses `integer` and is required.

- `kind` uses `text` and is required.

- `title` uses `text` and is required.

- `summary` uses `text` and is required.

- `detail_description` uses `text` and is nullable.

- `instructions` uses `text` and is nullable.

- `build_plan_markdown` uses `text` and is nullable.

- `status` uses `text` and is nullable.

- `created_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

- `updated_at` uses `timestamp with time zone` and is required.

  Default: `now()`.

## Keys and relationships

- FOREIGN KEY `idea_items_idea_id_fkey` covers `idea_id`. References [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md), columns `idea_id`.

- PRIMARY KEY `idea_items_pkey` covers `idea_item_id`.

- UNIQUE `idea_items_idea_id_position_key` covers `idea_id`, `position`.
